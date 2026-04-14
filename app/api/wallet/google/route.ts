import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleAuth } from "google-auth-library";

const ISSUER_ID = "BCR2DN5TU3P23DKQ";
const PROJECT_ID = process.env.GOOGLE_WALLET_PROJECT_ID || "intrepid-flight-440812-j4";
const CLASS_ID = `${ISSUER_ID}.chiefme_business_card`;
const WALLET_API_BASE = "https://walletobjects.googleapis.com/walletobjects/v1";

function getAuth() {
  const privateKey = (process.env.GOOGLE_WALLET_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  const clientEmail = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL || "";
  return new GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
  });
}

async function ensureClass(authClient: GoogleAuth) {
  const client = await authClient.getClient();
  const url = `${WALLET_API_BASE}/genericClass/${CLASS_ID}`;
  try {
    await (client as any).request({ url, method: "GET" });
  } catch {
    // Class doesn't exist — create it
    const classBody = {
      id: CLASS_ID,
      issuerName: "Chief.me",
      reviewStatus: "UNDER_REVIEW",
    };
    await (client as any).request({
      url: `${WALLET_API_BASE}/genericClass`,
      method: "POST",
      data: classBody,
    });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { image: true } } },
  });

  if (!profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  const objectId = `${ISSUER_ID}.chief_${profile.slug}`;
  const profileUrl = `https://chief.me/chief/${profile.slug}`;

  try {
    const auth = getAuth();
    await ensureClass(auth);
    const client = await auth.getClient();

    const passObject = {
      id: objectId,
      classId: CLASS_ID,
      genericType: "GENERIC_TYPE_UNSPECIFIED",
      cardTitle: {
        defaultValue: { language: "en-US", value: "Chief.me" },
      },
      subheader: {
        defaultValue: { language: "en-US", value: profile.title },
      },
      header: {
        defaultValue: { language: "en-US", value: profile.displayName },
      },
      textModulesData: [
        {
          id: "company",
          header: "Company",
          body: profile.company,
        },
        {
          id: "profile",
          header: "Profile",
          body: `chief.me/${profile.slug}`,
        },
      ],
      linksModuleData: {
        uris: [
          {
            uri: profileUrl,
            description: "View Profile",
            id: "profile_link",
          },
        ],
      },
      hexBackgroundColor: "#0A0A0A",
      logo: {
        sourceUri: {
          uri: "https://chief.me/logo.png",
        },
        contentDescription: {
          defaultValue: { language: "en-US", value: "Chief.me Logo" },
        },
      },
      ...(profile.user.image
        ? {
            heroImage: {
              sourceUri: { uri: profile.user.image },
              contentDescription: {
                defaultValue: { language: "en-US", value: profile.displayName },
              },
            },
          }
        : {}),
      barcode: {
        type: "QR_CODE",
        value: profileUrl,
        alternateText: `chief.me/${profile.slug}`,
      },
    };

    // Upsert the object
    const objectUrl = `${WALLET_API_BASE}/genericObject/${encodeURIComponent(objectId)}`;
    let exists = false;
    try {
      await (client as any).request({ url: objectUrl, method: "GET" });
      exists = true;
    } catch {
      exists = false;
    }

    if (exists) {
      await (client as any).request({ url: objectUrl, method: "PUT", data: passObject });
    } else {
      await (client as any).request({
        url: `${WALLET_API_BASE}/genericObject`,
        method: "POST",
        data: passObject,
      });
    }

    // Build the JWT "Add to Wallet" link
    const { JWT } = await import("google-auth-library");
    const claims = {
      iss: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL,
      aud: "google",
      typ: "savetowallet",
      iat: Math.floor(Date.now() / 1000),
      payload: {
        genericObjects: [{ id: objectId }],
      },
    };

    const privateKey = (process.env.GOOGLE_WALLET_PRIVATE_KEY || "").replace(/\\n/g, "\n");
    const signer = new JWT({
      email: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL!,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"],
    });

    const token = await signer.fetchIdToken("google");
    // Sign the save link JWT manually
    const { createSign } = await import("crypto");
    const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
    const signingInput = `${header}.${payload}`;
    const sign = createSign("RSA-SHA256");
    sign.update(signingInput);
    const sig = sign.sign(privateKey, "base64url");
    const jwt = `${signingInput}.${sig}`;

    const saveUrl = `https://pay.google.com/gp/v/save/${jwt}`;
    return Response.json({ url: saveUrl });
  } catch (err: unknown) {
    console.error("Google Wallet error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: `Wallet generation failed: ${msg}` }, { status: 500 });
  }
}
