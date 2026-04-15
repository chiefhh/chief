import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const profile = await prisma.profile.findUnique({
      where: { slug },
      select: {
        displayName: true,
        title: true,
        company: true,
        globalNumber: true,
        headline: true,
        user: { select: { image: true } },
      },
    });

    if (!profile) {
      return new Response("Not found", { status: 404 });
    }

    // Load fonts from public/fonts/ via the app origin
    const baseUrl = req.nextUrl.origin;
    const [fontData, dmSansData] = await Promise.all([
      fetch(`${baseUrl}/fonts/PlayfairDisplay-Bold.ttf`).then((r) =>
        r.arrayBuffer()
      ),
      fetch(`${baseUrl}/fonts/DMSans-Regular.ttf`).then((r) =>
        r.arrayBuffer()
      ),
    ]);

    const memberNo = `No. ${String(profile.globalNumber).padStart(3, "0")}`;

    return new ImageResponse(
      (
        <div
          style={{
            width: "1200px",
            height: "630px",
            background: "#0A0A0A",
            display: "flex",
            flexDirection: "column",
            padding: "60px",
            fontFamily: "DM Sans",
            position: "relative",
          }}
        >
          {/* Gold top line */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "3px",
              background:
                "linear-gradient(90deg, transparent, #B8944F 30%, #E8D5A0 50%, #B8944F 70%, transparent)",
            }}
          />

          {/* Member number */}
          <div
            style={{
              color: "#B8944F",
              fontSize: "14px",
              marginBottom: "40px",
              letterSpacing: "0.25em",
              display: "flex",
            }}
          >
            {memberNo}
          </div>

          {/* Main content row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "40px",
              flex: 1,
            }}
          >
            {/* Avatar */}
            {profile.user?.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.user.image}
                width={120}
                height={120}
                style={{
                  borderRadius: "50%",
                  border: "2px solid rgba(184,148,79,0.5)",
                  display: "flex",
                }}
                alt=""
              />
            )}

            {/* Text */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div
                style={{
                  color: "#FEFCF7",
                  fontSize: "56px",
                  fontFamily: "Playfair Display",
                  fontWeight: 700,
                  lineHeight: 1.1,
                  display: "flex",
                }}
              >
                {profile.displayName}
              </div>
              <div
                style={{
                  color: "#E8D5A0",
                  fontSize: "24px",
                  display: "flex",
                }}
              >
                {profile.title} · {profile.company}
              </div>
              {profile.headline && (
                <div
                  style={{
                    color: "rgba(232,226,216,0.5)",
                    fontSize: "18px",
                    maxWidth: "700px",
                    fontStyle: "italic",
                    display: "flex",
                  }}
                >
                  &ldquo;{profile.headline}&rdquo;
                </div>
              )}
            </div>
          </div>

          {/* Bottom row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ color: "#B8944F", fontSize: "20px", display: "flex" }}>
              chief.me/{slug}
            </div>
            <div
              style={{
                color: "rgba(232,226,216,0.3)",
                fontSize: "16px",
                display: "flex",
              }}
            >
              Chief.me · VP+ Exclusive
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: "Playfair Display", data: fontData, weight: 700 },
          { name: "DM Sans", data: dmSansData, weight: 400 },
        ],
      }
    );
  } catch (e) {
    console.error("OG image error:", e);
    return new Response("Error generating image", { status: 500 });
  }
}
