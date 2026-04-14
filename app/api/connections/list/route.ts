import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return Response.json({ requests: [] });
  }

  const requests = await prisma.connectionRequest.findMany({
    where: { receiverId: profile.id, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      message: true,
      createdAt: true,
      sender: {
        select: {
          displayName: true,
          title: true,
          company: true,
          slug: true,
        },
      },
    },
  });

  return Response.json({ requests });
}
