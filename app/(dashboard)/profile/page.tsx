import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Brain, Moon, TrendingUp, Zap, Crown, User, Calendar, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { InsightCard } from '@/components/dream/insight-card'
import { EmotionRadar } from '@/components/dashboard/emotion-radar'
import { Badge } from '@/components/ui/badge'
import { formatDate, getEmotionColor } from '@/lib/utils'
import { InsightCard as InsightCardType, Emotion } from '@/types'
import Link from 'next/link'

export default async function ProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [profileResult, subconsciousResult, dreamStatsResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('subconscious_profiles').select('*').eq('user_id', user.id).single(),
    supabase
      .from('dreams')
      .select('stress_level, mood_score, recorded_at, emotions, themes')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })
      .limit(30),
  ])

  const profile = profileResult.data
  const subconscious = subconsciousResult.data
  const recentDreams = dreamStatsResult.data || []

  const insightCards: InsightCardType[] = subconscious?.insight_cards || []
  const dominantEmotions: Emotion[] = subconscious?.dominant_emotions || []
  const recurringThemes: Array<{ name: string; description: string; recurrence: number }> = subconscious?.recurring_themes || []

  const avgStress = recentDreams.length > 0
    ? (recentDreams.reduce((s, d) => s + (d.stress_level || 5), 0) / recentDreams.length).toFixed(1)
    : 0

  const dreamDays = new Set(recentDreams.map(d => new Date(d.recorded_at).toDateString())).size

  const tierLabels: Record<string, { label: string; color: string; icon: string }> = {
    free: { label: 'Free', color: 'text-muted-foreground', icon: '🌙' },
    pro: { label: 'Pro', color: 'text-violet-400', icon: '⚡' },
    team: { label: 'Team', color: 'text-amber-400', icon: '👑' },
  }
  const tierInfo = tierLabels[profile?.subscription_tier || 'free']

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subconscious Report</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Your evolving inner-world profile — built from {profile?.dream_count || 0} dream logs
          </p>
        </div>
        {profile?.subscription_tier === 'free' && (
          <Link href="/#pricing">
            <Button variant="dream" size="sm" className="gap-2">
              <Crown className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          </Link>
        )}
      </div>

      {/* Profile card */}
      <div className="dream-card rounded-2xl p-6 border-violet-500/20">
        <div className="flex items-start gap-5">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-2xl font-bold text-white flex-shrink-0">
            {profile?.full_name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || 'D'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-1">
              <h2 className="text-xl font-bold">{profile?.full_name || 'Dreamer'}</h2>
              <span className={`inline-flex items-center gap-1 text-sm font-medium ${tierInfo.color}`}>
                {tierInfo.icon} {tierInfo.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <Moon className="h-4 w-4 text-violet-400" />
                <span><strong>{profile?.dream_count || 0}</strong> dreams logged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-indigo-400" />
                <span>Member since {profile?.created_at ? formatDate(profile.created_at) : 'recently'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subconscious scores */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            label: 'Dream Coherence',
            value: subconscious?.dream_coherence_score || 0,
            max: 100,
            icon: Brain,
            color: 'text-violet-400',
            description: 'Narrative clarity across dreams',
          },
          {
            label: 'Emotional Balance',
            value: subconscious?.emotional_balance || 0,
            max: 100,
            icon: TrendingUp,
            color: 'text-emerald-400',
            description: 'Positive vs. negative emotion ratio',
          },
          {
            label: 'Creativity Index',
            value: subconscious?.creativity_index || 0,
            max: 100,
            icon: Zap,
            color: 'text-amber-400',
            description: 'Symbol richness and dream variety',
          },
        ].map((score) => {
          const Icon = score.icon
          const pct = Math.round(score.value)
          return (
            <div key={score.label} className="dream-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon className={`h-4 w-4 ${score.color}`} />
                <span className="text-sm font-medium">{score.label}</span>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold">{pct}</span>
                <span className="text-muted-foreground text-sm mb-1">/100</span>
              </div>
              <Progress value={pct} className="h-1.5 mb-2" />
              <p className="text-xs text-muted-foreground">{score.description}</p>
            </div>
          )
        })}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Avg Stress', value: avgStress, icon: '🌡️' },
          { label: 'Active Days', value: dreamDays, icon: '📅' },
          { label: 'Day Streak', value: profile?.streak_days || 0, icon: '🔥' },
          { label: 'Archetype', value: subconscious?.personality_archetype ? subconscious.personality_archetype.split(' ').pop() : '?', icon: '✨' },
        ].map((stat) => (
          <div key={stat.label} className="dream-card rounded-xl p-4 text-center">
            <div className="text-2xl mb-1">{stat.icon}</div>
            <p className="text-xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Archetype */}
      {subconscious?.personality_archetype && (
        <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-indigo-600/5 p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🔮</span>
            <h2 className="font-semibold text-lg">Your Dream Archetype</h2>
          </div>
          <p className="text-2xl font-bold gradient-text mb-2">{subconscious.personality_archetype}</p>
          <p className="text-sm text-muted-foreground">
            Based on recurring symbols, themes, and emotional patterns in your dream archive.
          </p>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Dominant emotions */}
        {dominantEmotions.length > 0 && (
          <div className="dream-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-violet-400" />
              <h2 className="font-semibold">Dominant Emotions</h2>
            </div>
            <EmotionRadar emotions={dominantEmotions} />
          </div>
        )}

        {/* Recurring themes */}
        {recurringThemes.length > 0 && (
          <div className="dream-card rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="h-4 w-4 text-indigo-400" />
              <h2 className="font-semibold">Recurring Themes</h2>
            </div>
            <div className="space-y-3">
              {recurringThemes.slice(0, 5).map((theme, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-400 flex-shrink-0 mt-0.5">
                    {theme.recurrence || 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{theme.name}</p>
                    <p className="text-xs text-muted-foreground">{theme.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Insight cards */}
      {insightCards.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-amber-400" />
            <h2 className="font-semibold text-lg">Your Insight Cards</h2>
            <Badge variant="default" className="text-[10px]">{insightCards.length} insights</Badge>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {insightCards.map((card, i) => (
              <InsightCard key={card.id || i} card={card} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!subconscious && (
        <div className="dream-card rounded-xl p-10 text-center border-violet-500/20">
          <Brain className="h-12 w-12 text-violet-400/40 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Profile building in progress</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
            Log at least 5 analyzed dreams and your subconscious profile will automatically generate.
          </p>
          <Link href="/dream/new">
            <Button variant="dream" className="gap-2">
              <Moon className="h-4 w-4" />
              Log a Dream
            </Button>
          </Link>
        </div>
      )}

      {/* Upgrade CTA */}
      {profile?.subscription_tier === 'free' && (
        <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-600/10 to-orange-600/5 p-6 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown className="h-4 w-4 text-amber-400" />
              <h3 className="font-semibold text-amber-300">Unlock Full Insights with Pro</h3>
            </div>
            <p className="text-sm text-muted-foreground">Unlimited logs, deep analysis, weekly reports, and PDF export.</p>
          </div>
          <Link href="/#pricing" className="flex-shrink-0">
            <Button variant="dream" size="sm">Upgrade — $12/mo</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
