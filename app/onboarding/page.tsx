'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Moon, Mic, Brain, TrendingUp, ChevronRight, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { StarsBackground } from '@/components/layout/stars-background'

const STEPS = [
  {
    id: 1,
    title: 'Welcome to DreamBoard AI',
    subtitle: 'Your subconscious journey begins now',
    icon: Moon,
    content: 'welcome',
  },
  {
    id: 2,
    title: 'Tell us about yourself',
    subtitle: 'We\'ll personalize your dream analysis',
    icon: Brain,
    content: 'profile',
  },
  {
    id: 3,
    title: 'How DreamBoard works',
    subtitle: 'Three simple steps to decode your dreams',
    icon: Sparkles,
    content: 'howto',
  },
]

const HOW_TO_STEPS = [
  {
    icon: Mic,
    title: 'Record on waking',
    desc: 'Grab your phone the moment you wake up. A 30-second voice memo captures everything.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
  },
  {
    icon: Brain,
    title: 'AI does the analysis',
    desc: 'Claude extracts emotions, symbols, recurring themes, and stress signals automatically.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Your profile evolves',
    desc: 'Over time, patterns emerge and your subconscious profile grows richer with every log.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
]

const DREAM_INTERESTS = [
  'Recurring dreams', 'Stress patterns', 'Creative inspiration',
  'Relationship insights', 'Lucid dreaming', 'Spiritual growth',
  'Anxiety processing', 'Memory and nostalgia',
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    )
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('profiles').update({
          full_name: name || undefined,
          onboarding_completed: true,
        }).eq('id', user.id)
      }
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const currentStep = STEPS[step - 1]
  const Icon = currentStep.icon

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <StarsBackground />

      <div className="relative z-10 w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={cn(
                'h-1 flex-1 rounded-full transition-all duration-500',
                s.id <= step ? 'bg-gradient-to-r from-violet-500 to-indigo-500' : 'bg-white/10'
              )}
            />
          ))}
        </div>

        <div className="dream-card rounded-2xl p-8 animate-fade-in" key={step}>
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 mb-4">
              <Icon className="h-8 w-8 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{currentStep.title}</h1>
            <p className="text-muted-foreground text-sm">{currentStep.subtitle}</p>
          </div>

          {/* Step 1: Welcome */}
          {currentStep.content === 'welcome' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4 text-sm text-center">
                <p className="text-violet-300 font-medium mb-1">🎉 Your account is ready!</p>
                <p className="text-muted-foreground">Let's set up your dream profile in 2 quick steps.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center text-sm">
                {['AI-powered analysis', 'Voice recording', 'Pattern detection', 'Insight cards'].map((f) => (
                  <div key={f} className="rounded-lg bg-white/5 border border-white/8 p-3">
                    <Check className="h-4 w-4 text-violet-400 mx-auto mb-1" />
                    <p className="text-foreground/80 text-xs">{f}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Profile */}
          {currentStep.content === 'profile' && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">What should we call you?</label>
                <Input
                  placeholder="Your name or nickname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground/80 block mb-2">
                  What are you curious about? (optional)
                </label>
                <div className="flex flex-wrap gap-2">
                  {DREAM_INTERESTS.map((interest) => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={cn(
                        'text-xs px-3 py-1.5 rounded-full border transition-all',
                        interests.includes(interest)
                          ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                          : 'border-white/15 text-muted-foreground hover:border-white/30'
                      )}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: How-to */}
          {currentStep.content === 'howto' && (
            <div className="space-y-4">
              {HOW_TO_STEPS.map((s, i) => {
                const StepIcon = s.icon
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                      <StepIcon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{s.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                )
              })}
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-amber-300 text-center">
                💡 Tip: Log your dream within 10 minutes of waking for best recall
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep(s => s - 1)} className="flex-1">
                Back
              </Button>
            )}
            {step < STEPS.length ? (
              <Button variant="dream" onClick={() => setStep(s => s + 1)} className="flex-1 gap-2">
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="dream"
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 gap-2"
              >
                <Moon className="h-4 w-4" />
                Start Dreaming
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
