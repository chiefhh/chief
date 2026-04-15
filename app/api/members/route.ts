import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const industry = req.nextUrl.searchParams.get("industry") ?? "";
  const q = req.nextUrl.searchParams.get("q") ?? "";

  const members = await prisma.profile.findMany({
    where: {
      ...(industry ? { industries: { has: industry } } : {}),
      ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    },
    select: {
      displayName: true,
      title: true,
      company: true,
      slug: true,
      industries: true,
      globalNumber: true,
    },
    orderBy: { globalNumber: "asc" },
    take: 50,
  });

  return Response.json({ members });
}
