import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const { rawContent } = await req.json()
    if (!rawContent?.trim()) return Response.json({ error: 'No content' }, { status: 400 })

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: `You are a ghost writer for C-suite executives on Chief.me.
Transform the raw input into a polished insight article. Keep the author's voice and ideas.
Return ONLY a JSON object:
{
  "title": "Compelling article title (max 12 words)",
  "summary": "2-sentence hook that makes readers want to continue",
  "content": "Full markdown article (400-600 words). Use ## subheadings. Professional first-person executive voice."
}`,
      messages: [{ role: 'user', content: rawContent }]
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
    return Response.json(JSON.parse(text))
  } catch (error) {
    console.error('Shadow writer error:', error)
    return Response.json({ error: 'Failed to transform content' }, { status: 500 })
  }
}
