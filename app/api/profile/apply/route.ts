import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40)
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  const existing = await prisma.profile.findUnique({ where: { slug: base } });
  if (!existing) return base;
  for (let i = 2; i <= 99; i++) {
    const candidate = `${base.slice(0, 37)}-${i}`;
    const conflict = await prisma.profile.findUnique({ where: { slug: candidate } });
    if (!conflict) return candidate;
  }
  return `${base.slice(0, 30)}-${Date.now()}`;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { displayName, title, company, linkedinUrl } = body;

  if (!displayName?.trim() || !title?.trim() || !company?.trim() || !linkedinUrl?.trim()) {
    return Response.json({ error: "All fields are required" }, { status: 400 });
  }

  if (!/linkedin\.com\/in\//i.test(linkedinUrl)) {
    return Response.json({ error: "LinkedIn URL must contain linkedin.com/in/" }, { status: 400 });
  }

  const existingProfile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });
  if (existingProfile) {
    return Response.json({ profile: existingProfile }, { status: 200 });
  }

  const baseSlug = slugify(displayName.trim()) || "member";
  const slug = await uniqueSlug(baseSlug);
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
      socialLinks: { linkedin: linkedinUrl.trim() },
    },
    select: { slug: true, globalNumber: true },
  });

  return Response.json({ profile }, { status: 201 });
}
