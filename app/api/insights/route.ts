import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })
    if (!profile) return Response.json({ error: "No profile" }, { status: 400 })

    const { title, content, summary, source, isDraft, isPublic } = await req.json()

    const insight = await prisma.insight.create({
      data: {
        profileId: profile.id,
        title,
        content,
        summary: summary || null,
        source: source || 'MANUAL',
        isDraft: isDraft !== false,
        isPublic: isPublic !== false,
      }
    })

    return Response.json({ insight }, { status: 201 })
  } catch (error) {
    console.error('Create insight error:', error)
    return Response.json({ error: 'Failed to create insight' }, { status: 500 })
  }
}
