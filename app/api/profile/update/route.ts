import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    displayName,
    title,
    company,
    headline,
    bio,
    industries,
    companySize,
    socialLinks,
  } = body;

  if (!displayName?.trim() || !title?.trim() || !company?.trim()) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const validSizes = ["UNKNOWN", "SEED", "SERIES_A_B", "SERIES_C_PLUS", "PUBLIC", "ENTERPRISE", "FORTUNE_500"];
  if (companySize && !validSizes.includes(companySize)) {
    return Response.json({ error: "Invalid company size" }, { status: 400 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  const updated = await prisma.profile.update({
    where: { userId: session.user.id },
    data: {
      displayName: displayName.trim(),
      title: title.trim(),
      company: company.trim(),
      headline: headline?.trim() || null,
      bio: bio?.trim() || null,
      industries: Array.isArray(industries) ? industries.slice(0, 5) : [],
      companySize: companySize || "UNKNOWN",
      socialLinks: socialLinks ?? {},
    },
    select: { slug: true },
  });

  return Response.json({ slug: updated.slug });
}
