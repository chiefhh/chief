import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { displayName, title, company, slug, headline, bio } = body;

  // Validate required fields
  if (!displayName?.trim() || !title?.trim() || !company?.trim() || !slug?.trim()) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return Response.json(
      { error: "Slug must only contain lowercase letters, numbers, and hyphens" },
      { status: 400 }
    );
  }

  // Check slug uniqueness
  const existing = await prisma.profile.findUnique({ where: { slug } });
  if (existing) {
    return Response.json({ error: "This URL is already taken" }, { status: 409 });
  }

  // Check user doesn't already have a profile
  const existingProfile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });
  if (existingProfile) {
    return Response.json({ error: "Profile already exists" }, { status: 409 });
  }

  // Assign next global number
  const count = await prisma.profile.count();
  const globalNumber = count + 1;

  const profile = await prisma.profile.create({
    data: {
      userId: session.user.id,
      slug,
      globalNumber,
      displayName: displayName.trim(),
      title: title.trim(),
      company: company.trim(),
      headline: headline?.trim() || null,
      bio: bio?.trim() || null,
    },
    select: { slug: true, globalNumber: true },
  });

  return Response.json({ profile }, { status: 201 });
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: {
      slug: true,
      globalNumber: true,
      displayName: true,
      title: true,
      company: true,
      companySize: true,
      headline: true,
      bio: true,
      industries: true,
      socialLinks: true,
      viewCount: true,
      connectionCount: true,
      _count: {
        select: {
          insights: { where: { isDraft: false } },
        },
      },
    },
  });

  if (!profile) return Response.json({ profile: null });
  const { _count, ...rest } = profile;
  return Response.json({ profile: { ...rest, insightCount: _count.insights } });
}
