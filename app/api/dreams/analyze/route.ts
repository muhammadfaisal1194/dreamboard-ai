import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeDream } from '@/lib/anthropic/analyze'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { dreamId, content } = await request.json()
    if (!dreamId || !content) {
      return NextResponse.json({ error: 'dreamId and content are required' }, { status: 400 })
    }

    // Verify dream belongs to user
    const { data: dream } = await supabase
      .from('dreams')
      .select('id, user_id')
      .eq('id', dreamId)
      .eq('user_id', user.id)
      .single()

    if (!dream) {
      return NextResponse.json({ error: 'Dream not found' }, { status: 404 })
    }

    // Run AI analysis
    const analysis = await analyzeDream(content, user.id)

    // Save analysis to DB
    const { error: analysisError } = await supabase.from('dream_analyses').upsert({
      dream_id: dreamId,
      user_id: user.id,
      emotions: analysis.emotions,
      symbols: analysis.symbols,
      themes: analysis.themes,
      stress_signals: analysis.stress_signals,
      summary: analysis.summary,
      insight: analysis.insight,
      archetype: analysis.archetype,
    })

    if (analysisError) throw analysisError

    // Compute stress level from stress signals
    const stressLevel = analysis.stress_signals.length === 0 ? 3
      : analysis.stress_signals.some(s => s.severity === 'high') ? 8
      : analysis.stress_signals.some(s => s.severity === 'medium') ? 5
      : 3

    // Update dream with extracted data
    await supabase.from('dreams').update({
      emotions: analysis.emotions.map(e => e.name.toLowerCase()),
      symbols: analysis.symbols.map(s => s.name.toLowerCase()),
      themes: analysis.themes.map(t => t.name.toLowerCase()),
      stress_level: stressLevel,
      is_analyzed: true,
    }).eq('id', dreamId)

    // Update streak and dream count
    await updateStreakAndCount(supabase, user.id)

    // Async: regenerate subconscious profile (don't await)
    regenerateSubconsciousProfile(supabase, user.id).catch(console.error)

    return NextResponse.json({ success: true, analysis })
  } catch (err: unknown) {
    console.error('Dream analysis error:', err)
    const message = err instanceof Error ? err.message : 'Analysis failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function updateStreakAndCount(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('dream_count, streak_days, last_dream_date')
    .eq('id', userId)
    .single()

  if (!profile) return

  const today = new Date().toISOString().split('T')[0]
  const lastDate = profile.last_dream_date

  let streakDays = profile.streak_days || 0
  if (lastDate === today) {
    // Already logged today
  } else if (lastDate) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    streakDays = lastDate === yesterdayStr ? streakDays + 1 : 1
  } else {
    streakDays = 1
  }

  await supabase.from('profiles').update({
    dream_count: (profile.dream_count || 0) + 1,
    streak_days: streakDays,
    last_dream_date: today,
  }).eq('id', userId)
}

async function regenerateSubconsciousProfile(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: dreams } = await supabase
    .from('dreams')
    .select('content, emotions, themes, stress_level')
    .eq('user_id', userId)
    .eq('is_analyzed', true)
    .order('recorded_at', { ascending: false })
    .limit(20)

  if (!dreams || dreams.length < 3) return

  const { data: analyses } = await supabase
    .from('dream_analyses')
    .select('emotions, symbols, themes, stress_signals')
    .eq('user_id', userId)
    .limit(20)

  if (!analyses || analyses.length === 0) return

  // Aggregate emotions
  const emotionMap = new Map<string, { total: number; count: number; color: string }>()
  analyses.forEach(a => {
    (a.emotions || []).forEach((e: { name: string; intensity: number; color: string }) => {
      const existing = emotionMap.get(e.name) || { total: 0, count: 0, color: e.color }
      emotionMap.set(e.name, {
        total: existing.total + e.intensity,
        count: existing.count + 1,
        color: e.color,
      })
    })
  })
  const dominantEmotions = Array.from(emotionMap.entries())
    .map(([name, data]) => ({ name, intensity: Math.round(data.total / data.count), color: data.color }))
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 6)

  // Aggregate symbols
  const symbolMap = new Map<string, { meaning: string; count: number }>()
  analyses.forEach(a => {
    (a.symbols || []).forEach((s: { name: string; meaning: string }) => {
      const existing = symbolMap.get(s.name) || { meaning: s.meaning, count: 0 }
      symbolMap.set(s.name, { meaning: existing.meaning, count: existing.count + 1 })
    })
  })
  const recurringSymbols = Array.from(symbolMap.entries())
    .map(([name, data]) => ({ name, meaning: data.meaning, frequency: data.count }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 8)

  // Aggregate themes
  const themeMap = new Map<string, { description: string; count: number }>()
  analyses.forEach(a => {
    (a.themes || []).forEach((t: { name: string; description: string }) => {
      const existing = themeMap.get(t.name) || { description: t.description, count: 0 }
      themeMap.set(t.name, { description: existing.description, count: existing.count + 1 })
    })
  })
  const recurringThemes = Array.from(themeMap.entries())
    .map(([name, data]) => ({ name, description: data.description, recurrence: data.count }))
    .sort((a, b) => b.recurrence - a.recurrence)
    .slice(0, 6)

  // Compute scores
  const avgStress = dreams.reduce((s, d) => s + (d.stress_level || 5), 0) / dreams.length
  const positiveEmotions = ['joy', 'love', 'peace', 'hope', 'excitement', 'happiness']
  const positiveCount = dominantEmotions.filter(e => positiveEmotions.includes(e.name.toLowerCase())).reduce((s, e) => s + e.intensity, 0)
  const totalIntensity = dominantEmotions.reduce((s, e) => s + e.intensity, 0) || 1
  const emotionalBalance = Math.round((positiveCount / totalIntensity) * 100)

  const creativityIndex = Math.min(100, Math.round((recurringSymbols.length * 8 + recurringThemes.length * 5 + dreams.length * 2)))
  const coherenceScore = Math.min(100, Math.round(100 - avgStress * 5 + dreams.length))

  // Generate insight cards
  const insightCards = []

  if (recurringThemes.length > 0) {
    const topTheme = recurringThemes[0]
    insightCards.push({
      id: `theme-${topTheme.name}`,
      title: `"${topTheme.name}" appears ${topTheme.recurrence}× in your dreams`,
      description: `This recurring theme may signal something your subconscious is processing. ${topTheme.description}`,
      category: 'theme',
      frequency: topTheme.recurrence,
      icon: '🔄',
      color: '#7c3aed',
      suggestions: [
        'Journal about this theme during waking hours',
        'Notice if this theme appears in your daily life',
        'Try meditation focused on this experience',
      ],
    })
  }

  if (avgStress > 6) {
    insightCards.push({
      id: 'stress-high',
      title: `High stress signals detected across ${dreams.length} dreams`,
      description: `Your dreams show an average stress level of ${avgStress.toFixed(1)}/10. Your subconscious may be processing significant tension.`,
      category: 'stress',
      frequency: dreams.length,
      icon: '⚡',
      color: '#ef4444',
      suggestions: [
        'Try a 5-minute morning breathing exercise',
        'Practice progressive muscle relaxation before sleep',
        'Limit screens 1 hour before bed',
      ],
    })
  }

  const topEmotion = dominantEmotions[0]
  if (topEmotion) {
    insightCards.push({
      id: `emotion-${topEmotion.name}`,
      title: `${topEmotion.name} is your dominant dream emotion`,
      description: `With an average intensity of ${topEmotion.intensity}/10, this emotion shapes much of your dream landscape.`,
      category: 'emotion',
      frequency: analyses.length,
      icon: '💜',
      color: topEmotion.color,
      suggestions: [
        `Explore what triggers ${topEmotion.name} in your waking life`,
        'Consider talking to someone you trust about these feelings',
        'Use creative expression to process this emotion',
      ],
    })
  }

  if (recurringSymbols.length >= 3) {
    insightCards.push({
      id: 'symbols-rich',
      title: `${recurringSymbols.length} recurring symbols in your dreamscape`,
      description: `Rich symbolic content suggests an active creative subconscious. Your most frequent symbol: ${recurringSymbols[0]?.name}.`,
      category: 'growth',
      frequency: recurringSymbols.length,
      icon: '🔮',
      color: '#8b5cf6',
      suggestions: [
        `Research the archetypal meaning of "${recurringSymbols[0]?.name}"`,
        'Keep a symbol dictionary in your journal',
        'Discuss recurring symbols with a therapist or dream guide',
      ],
    })
  }

  await supabase.from('subconscious_profiles').upsert({
    user_id: userId,
    dominant_emotions: dominantEmotions,
    recurring_symbols: recurringSymbols,
    recurring_themes: recurringThemes,
    insight_cards: insightCards,
    dream_coherence_score: coherenceScore,
    emotional_balance: emotionalBalance,
    creativity_index: creativityIndex,
    last_updated: new Date().toISOString(),
  }, { onConflict: 'user_id' })
}
