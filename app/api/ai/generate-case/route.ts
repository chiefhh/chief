import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const { template, background, conflict, decision, outcome } = await req.json()

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: `You are a professional executive writer for Chief.me. Convert raw decision notes into a polished case study.
Output a JSON object with these exact fields:
{
  "title": "Concise, compelling title (max 10 words)",
  "summary": "2-sentence summary of the decision and outcome",
  "content": "Full markdown article (4-6 paragraphs). Structure: Background → The Dilemma → The Decision → Outcome & Lessons. Use ## headers. Professional, first-person voice."
}`,
      messages: [{
        role: 'user',
        content: `Template: ${template}
Background: ${background}
Conflict/Options: ${conflict}
Decision Made: ${decision}
Outcome & Learnings: ${outcome}`
      }]
    })

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}'
    const parsed = JSON.parse(text)
    return Response.json(parsed)
  } catch (error) {
    console.error('AI case generation error:', error)
    return Response.json({ error: 'Failed to generate case' }, { status: 500 })
  }
}
