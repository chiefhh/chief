import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 })

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })
    if (!profile) return Response.json({ error: "No profile" }, { status: 400 })

    const { template, title, background, conflict, decision, outcome, tags, isPublic } = await req.json()

    const newCase = await prisma.decisionCase.create({
      data: {
        profileId: profile.id,
        template: template || 'CUSTOM',
        title,
        background,
        conflict,
        decision,
        outcome,
        tags: tags || [],
        isPublic: isPublic !== false,
      },
    })

    return Response.json({ case: newCase }, { status: 201 })
  } catch (error) {
    console.error('Create case error:', error)
    return Response.json({ error: 'Failed to create case' }, { status: 500 })
  }
}
