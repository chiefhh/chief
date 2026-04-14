import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SLUG_REGEX = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slug = req.nextUrl.searchParams.get("slug") ?? "";

  if (!SLUG_REGEX.test(slug)) {
    return Response.json({ available: false, reason: "invalid" });
  }

  const existing = await prisma.profile.findUnique({
    where: { slug },
    select: { userId: true },
  });

  const available = !existing || existing.userId === session.user.id;
  return Response.json({ available });
}
