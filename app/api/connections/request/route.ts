import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Look up the sender's profile
  const senderProfile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!senderProfile) {
    return NextResponse.json(
      { error: "You must have a profile to send connection requests." },
      { status: 403 }
    );
  }

  let body: { receiverProfileId?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { receiverProfileId, message } = body;

  if (!receiverProfileId) {
    return NextResponse.json({ error: "receiverProfileId is required." }, { status: 400 });
  }

  if (senderProfile.id === receiverProfileId) {
    return NextResponse.json(
      { error: "You cannot connect with yourself." },
      { status: 400 }
    );
  }

  // Check receiver exists
  const receiverProfile = await prisma.profile.findUnique({
    where: { id: receiverProfileId },
    select: { id: true },
  });

  if (!receiverProfile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  // Check for existing pending request
  const existing = await prisma.connectionRequest.findFirst({
    where: {
      senderId: senderProfile.id,
      receiverId: receiverProfileId,
      status: "PENDING",
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "A pending connection request already exists." },
      { status: 409 }
    );
  }

  const connectionRequest = await prisma.connectionRequest.create({
    data: {
      senderId: senderProfile.id,
      receiverId: receiverProfileId,
      message: message ?? null,
    },
  });

  return NextResponse.json({ success: true, id: connectionRequest.id }, { status: 201 });
}
