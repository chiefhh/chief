import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: Request) {
  try {
    const { name, title, company, industries, companySize, language } = await req.json()

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      system: `You are a professional executive copywriter for Chief.me, an exclusive platform for VP+ leaders.

Write a concise, authoritative bio (3-4 sentences) that:
- Opens with the person's core mission, not job description
- Highlights impact and expertise, not responsibilities
- Ends with a forward-looking vision or value statement
- Tone: confident but not arrogant, specific but not verbose
- Language: ${language === 'zh' ? 'Chinese' : 'English'}

Never use: "passionate about", "leveraging", "synergy", generic buzzwords.`,
      messages: [{
        role: 'user',
        content: `Generate a professional bio for:
Name: ${name}
Title: ${title}
Company: ${company}
Industries: ${industries?.join(', ')}
Company Size: ${companySize || 'Unknown'}`
      }]
    })

    const bio = message.content[0].type === 'text' ? message.content[0].text : ''
    return Response.json({ bio })
  } catch (error) {
    console.error('AI bio generation error:', error)
    return Response.json({ error: 'Failed to generate bio' }, { status: 500 })
  }
}
