import Anthropic from '@anthropic-ai/sdk'
import { DreamAnalysis, Emotion } from '@/types'
import { getEmotionColor } from '@/lib/utils'

function getClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' })
}

const SYSTEM_PROMPT = `You are DreamBoard AI, an expert dream analyst and psychologist specializing in Jungian analysis, cognitive psychology, and subconscious pattern recognition.

Analyze dream entries with depth and empathy. Extract:
1. Core emotions with intensity (0-10)
2. Archetypal symbols and their psychological meanings
3. Recurring themes and narrative patterns
4. Stress signals and their severity
5. A compassionate summary
6. A personalized insight/recommendation
7. A Jungian personality archetype if applicable

Return ONLY valid JSON matching the schema exactly. Be insightful, warm, and constructive.`

const ANALYSIS_SCHEMA = `{
  "emotions": [{"name": string, "intensity": number (0-10), "color": string (hex)}],
  "symbols": [{"name": string, "meaning": string, "frequency": number (1-5)}],
  "themes": [{"name": string, "description": string, "recurrence": number (1-5)}],
  "stress_signals": [{"type": string, "description": string, "severity": "low"|"medium"|"high"}],
  "summary": string (2-3 sentences, warm and insightful),
  "insight": string (1 actionable insight or reflection),
  "archetype": string (optional, e.g., "The Hero", "The Shadow", "The Anima")
}`

export async function analyzeDream(dreamContent: string, userId: string): Promise<DreamAnalysis> {
  const anthropic = getClient()
  const prompt = `Analyze this dream entry and return a JSON response matching this schema:
${ANALYSIS_SCHEMA}

Dream entry:
"${dreamContent}"

Return ONLY the JSON object, no markdown, no explanation.`

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type from Claude')

  let parsed: Omit<DreamAnalysis, 'id' | 'dream_id' | 'created_at'>
  try {
    parsed = JSON.parse(content.text.trim())
  } catch {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Could not parse dream analysis response')
    parsed = JSON.parse(jsonMatch[0])
  }

  const emotions: Emotion[] = (parsed.emotions || []).map((e: Emotion) => ({
    ...e,
    color: e.color || getEmotionColor(e.name),
  }))

  return {
    id: '',
    dream_id: '',
    emotions,
    symbols: parsed.symbols || [],
    themes: parsed.themes || [],
    stress_signals: parsed.stress_signals || [],
    summary: parsed.summary || 'Your dream holds interesting patterns worth exploring.',
    insight: parsed.insight || 'Take a moment to reflect on the emotions in this dream.',
    archetype: parsed.archetype,
    created_at: new Date().toISOString(),
  }
}

export async function generateSubconsciousInsights(
  dreams: Array<{ content: string; emotions: string[]; themes: string[]; stress_level: number }>
): Promise<{ insight_cards: Array<{ title: string; description: string; suggestions: string[]; category: string; icon: string; color: string }> }> {
  const anthropic = getClient()
  const dreamSummary = dreams
    .slice(0, 20)
    .map((d, i) => `Dream ${i + 1}: Emotions: ${d.emotions.join(', ')}. Themes: ${d.themes.join(', ')}. Stress: ${d.stress_level}/10`)
    .join('\n')

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Based on these ${dreams.length} recent dreams, generate 3-5 insight cards for the user's subconscious profile.

Dream patterns:
${dreamSummary}

Return ONLY a JSON object: {
  "insight_cards": [{
    "title": string (compelling, specific),
    "description": string (2-3 sentences with specific frequency or pattern),
    "suggestions": string[] (2-3 actionable techniques),
    "category": "emotion"|"symbol"|"theme"|"stress"|"growth",
    "icon": string (single emoji),
    "color": string (hex color)
  }]
}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  try {
    return JSON.parse(content.text.trim())
  } catch {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Could not parse insights response')
    return JSON.parse(jsonMatch[0])
  }
}
