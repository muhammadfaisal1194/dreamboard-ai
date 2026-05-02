import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus, Brain, TrendingUp, Flame, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DreamCard } from '@/components/dream/dream-card'
import { InsightCard } from '@/components/dream/insight-card'
import { StreakTracker } from '@/components/dashboard/streak-tracker'
import { EmotionRadar } from '@/components/dashboard/emotion-radar'
import { Dream, InsightCard as InsightCardType, Emotion } from '@/types'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileResult, dreamsResult, subconsciousResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('dreams')
      .select('*')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })
      .limit(6),
    supabase
      .from('subconscious_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single(),
  ])

  const profile = profileResult.data
  const dreams: Dream[] = dreamsResult.data || []
  const subconsciousProfile = subconsciousResult.data

  const insightCards: InsightCardType[] = subconsciousProfile?.insight_cards || []
  const dominantEmotions: Emotion[] = subconsciousProfile?.dominant_emotions || []

  const firstName = profile?.full_name?.split(' ')[0] || 'Dreamer'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const hasDreamedToday = dreams[0]
    ? new Date(dreams[0].recorded_at).toDateString() === new Date().toDateString()
    : false

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold animate-fade-in">
            {greeting}, <span className="gradient-text">{firstName}</span> ✨
          </h1>
          <p className="text-muted-foreground mt-1 animate-fade-in" style={{ animationDelay: '100ms' }}>
            {hasDreamedToday
              ? "You've logged a dream today — great consistency!"
              : "Your subconscious has stories to tell. Ready to listen?"}
          </p>
        </div>
        <Link href="/dream/new">
          <Button variant="dream" className="gap-2 hidden sm:flex">
            <Plus className="h-4 w-4" />
            Log Dream
          </Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
        {[
          { label: 'Total Dreams', value: profile?.dream_count || 0, icon: BookOpen, color: 'text-violet-400' },
          { label: 'Day Streak', value: profile?.streak_days || 0, icon: Flame, color: 'text-orange-400' },
          { label: 'Insights Found', value: insightCards.length, icon: Brain, color: 'text-indigo-400' },
          { label: 'Avg Stress', value: dreams.length > 0 ? (dreams.reduce((s, d) => s + d.stress_level, 0) / dreams.length).toFixed(1) : '—', icon: TrendingUp, color: 'text-emerald-400' },
        ].map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="dream-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Dreams list + Streak */}
        <div className="lg:col-span-2 space-y-6">
          {/* CTA if no dreams */}
          {dreams.length === 0 && (
            <div className="dream-card rounded-xl p-10 text-center border-violet-500/20 animate-fade-in">
              <div className="text-5xl mb-4">🌙</div>
              <h2 className="text-xl font-bold mb-2">Log your first dream</h2>
              <p className="text-muted-foreground mb-6 text-sm max-w-sm mx-auto">
                Record a voice memo or type out what you remember — even fragments are meaningful.
              </p>
              <Link href="/dream/new">
                <Button variant="dream" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Log Your First Dream
                </Button>
              </Link>
            </div>
          )}

          {/* Recent dreams */}
          {dreams.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">Recent Dreams</h2>
                <Link href="/journal" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {dreams.map((dream, i) => (
                  <DreamCard key={dream.id} dream={dream} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          <StreakTracker
            streakDays={profile?.streak_days || 0}
            dreamCount={profile?.dream_count || 0}
          />

          {/* Emotion radar */}
          {dominantEmotions.length > 0 && (
            <div className="dream-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-4 w-4 text-violet-400" />
                <h3 className="font-semibold text-sm">Dominant Emotions</h3>
              </div>
              <EmotionRadar emotions={dominantEmotions} />
            </div>
          )}

          {/* Quick add CTA */}
          {!hasDreamedToday && (
            <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-indigo-600/5 p-5 text-center">
              <p className="text-sm font-medium mb-3">🌅 Morning log missing</p>
              <p className="text-xs text-muted-foreground mb-4">Capture today's dream before it fades</p>
              <Link href="/dream/new">
                <Button variant="dream" size="sm" className="w-full gap-2">
                  <Plus className="h-4 w-4" />
                  Log Now
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Insight cards */}
      {insightCards.length > 0 && (
        <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-lg">Your Insights</h2>
              <p className="text-xs text-muted-foreground">Patterns your AI discovered in your dreams</p>
            </div>
            <Link href="/profile" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
              Full report →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {insightCards.slice(0, 3).map((card, i) => (
              <InsightCard key={card.id} card={card} index={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
