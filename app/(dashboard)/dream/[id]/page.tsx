import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ChevronLeft, Brain, Clock, Mic, FileText, Star, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatDate, getEmotionColor, getStressColor, capitalizeFirst } from '@/lib/utils'
import { Dream, DreamAnalysis } from '@/types'

export default async function DreamDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: dream, error } = await supabase
    .from('dreams')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !dream) notFound()

  const { data: analysis } = await supabase
    .from('dream_analyses')
    .select('*')
    .eq('dream_id', dream.id)
    .single()

  const stressColor = getStressColor(dream.stress_level)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Link
        href="/journal"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Journal
      </Link>

      {/* Header */}
      <div className="dream-card rounded-2xl p-6 border-violet-500/20">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {dream.audio_url ? (
                <Mic className="h-4 w-4 text-violet-400" />
              ) : (
                <FileText className="h-4 w-4 text-indigo-400" />
              )}
              {dream.is_favorite && <Star className="h-4 w-4 text-amber-400 fill-amber-400" />}
              <span className="text-xs text-muted-foreground">{formatDate(dream.recorded_at)}</span>
            </div>
            <h1 className="text-2xl font-bold">{dream.title}</h1>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {dream.is_analyzed ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 border border-violet-500/30 px-3 py-1 text-xs text-violet-300">
                <Brain className="h-3 w-3" />
                Analyzed
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                Pending
              </span>
            )}
          </div>
        </div>

        <p className="text-foreground/80 leading-relaxed text-sm whitespace-pre-wrap">{dream.content}</p>
      </div>

      {/* Analysis */}
      {analysis && (
        <div className="space-y-5 animate-fade-in">
          {/* Summary */}
          <div className="dream-card rounded-xl p-6 border-violet-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-amber-400" />
              <h2 className="font-semibold">AI Summary</h2>
            </div>
            <p className="text-foreground/80 text-sm leading-relaxed italic">"{analysis.summary}"</p>
            {analysis.archetype && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1">
                <span className="text-xs text-purple-300">Archetype: {analysis.archetype}</span>
              </div>
            )}
          </div>

          {/* Emotions */}
          {analysis.emotions?.length > 0 && (
            <div className="dream-card rounded-xl p-6">
              <h2 className="font-semibold mb-4">Emotions Detected</h2>
              <div className="space-y-3">
                {analysis.emotions.map((emotion: { name: string; intensity: number; color: string }, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: emotion.color || getEmotionColor(emotion.name), boxShadow: `0 0 8px ${emotion.color}60` }}
                    />
                    <span className="text-sm capitalize w-24 flex-shrink-0">{emotion.name}</span>
                    <Progress value={(emotion.intensity / 10) * 100} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground w-8 text-right">{emotion.intensity}/10</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Symbols */}
          {analysis.symbols?.length > 0 && (
            <div className="dream-card rounded-xl p-6">
              <h2 className="font-semibold mb-4">Symbols & Archetypes</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {analysis.symbols.map((symbol: { name: string; meaning: string; frequency: number }, i: number) => (
                  <div key={i} className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm capitalize">{symbol.name}</h3>
                      {symbol.frequency > 1 && (
                        <Badge variant="symbol" className="text-[10px]">×{symbol.frequency}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{symbol.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Themes */}
          {analysis.themes?.length > 0 && (
            <div className="dream-card rounded-xl p-6">
              <h2 className="font-semibold mb-4">Dream Themes</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {analysis.themes.map((theme: { name: string; description: string }, i: number) => (
                  <div key={i} className="rounded-lg border border-violet-500/20 bg-violet-500/8 px-3 py-2">
                    <p className="text-sm font-medium capitalize">{theme.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{theme.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stress signals */}
          {analysis.stress_signals?.length > 0 && (
            <div className="dream-card rounded-xl p-6">
              <h2 className="font-semibold mb-4">Stress Signals</h2>
              <div className="space-y-3">
                {analysis.stress_signals.map((signal: { type: string; description: string; severity: string }, i: number) => {
                  const colors = { low: 'emerald', medium: 'amber', high: 'red' }
                  const color = colors[signal.severity as keyof typeof colors] || 'violet'
                  return (
                    <div key={i} className={`rounded-lg border border-${color}-500/20 bg-${color}-500/8 p-4`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold uppercase text-${color}-400`}>{signal.severity}</span>
                        <h3 className="text-sm font-medium capitalize">{signal.type}</h3>
                      </div>
                      <p className="text-xs text-muted-foreground">{signal.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Insight */}
          {analysis.insight && (
            <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-orange-600/5 p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">💡</span>
                <h2 className="font-semibold">Personal Insight</h2>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed">{analysis.insight}</p>
            </div>
          )}
        </div>
      )}

      {/* Not analyzed yet */}
      {!analysis && dream.is_analyzed === false && (
        <div className="dream-card rounded-xl p-8 text-center border-violet-500/20">
          <Brain className="h-10 w-10 text-violet-400/50 mx-auto mb-3" />
          <p className="font-medium mb-1">Analysis pending</p>
          <p className="text-sm text-muted-foreground">This dream hasn't been analyzed yet. Use "Save & Analyze" when logging.</p>
        </div>
      )}

      {/* Stress meter */}
      <div className="dream-card rounded-xl p-5 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">Stress Level</p>
          <p className="text-xs text-muted-foreground">Detected in this dream</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32">
            <Progress
              value={(dream.stress_level / 10) * 100}
              indicatorClassName={`bg-gradient-to-r ${dream.stress_level <= 3 ? 'from-emerald-500 to-teal-500' : dream.stress_level <= 6 ? 'from-amber-500 to-yellow-500' : 'from-red-500 to-orange-500'}`}
            />
          </div>
          <span className="text-lg font-bold" style={{ color: stressColor }}>
            {dream.stress_level}/10
          </span>
        </div>
      </div>
    </div>
  )
}
