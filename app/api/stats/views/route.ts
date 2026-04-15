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
    return Response.json({ data: [] });
  }

  // Build a 14-day array of dates (oldest first)
  const today = new Date();
  const days: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }

  // Query view events for this profile in the last 14 days
  const since = new Date(today);
  since.setDate(today.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const views = await prisma.profileView.findMany({
    where: {
      profileId: profile.id,
      createdAt: { gte: since },
    },
    select: { createdAt: true },
  });

  // Tally by date string
  for (const v of views) {
    const key = v.createdAt.toISOString().slice(0, 10);
    const entry = days.find((d) => d.date === key);
    if (entry) entry.count++;
  }

  return Response.json({ data: days });
}
