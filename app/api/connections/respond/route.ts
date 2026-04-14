import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { requestId?: string; action?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { requestId, action } = body;

  if (!requestId || (action !== "ACCEPT" && action !== "DECLINE")) {
    return Response.json({ error: "requestId and action (ACCEPT|DECLINE) are required." }, { status: 400 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return Response.json({ error: "Profile not found." }, { status: 404 });
  }

  const request = await prisma.connectionRequest.findUnique({
    where: { id: requestId },
    select: { id: true, receiverId: true, status: true },
  });

  if (!request || request.receiverId !== profile.id) {
    return Response.json({ error: "Request not found." }, { status: 404 });
  }

  if (request.status !== "PENDING") {
    return Response.json({ error: "Request already responded to." }, { status: 409 });
  }

  await prisma.connectionRequest.update({
    where: { id: requestId },
    data: {
      status: action === "ACCEPT" ? "ACCEPTED" : "DECLINED",
      respondedAt: new Date(),
    },
  });

  return Response.json({ success: true });
}
