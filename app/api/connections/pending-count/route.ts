import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return Response.json({ count: 0 });

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return Response.json({ count: 0 });

  const count = await prisma.connectionRequest.count({
    where: { receiverId: profile.id, status: "PENDING" },
  });
  return Response.json({ count });
}
