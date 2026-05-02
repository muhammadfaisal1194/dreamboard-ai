import Link from 'next/link'
import { Moon, Sparkles, Mic, Brain, TrendingUp, Shield, Star, ChevronRight, Zap, Eye, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarsBackground } from '@/components/layout/stars-background'
import { SUBSCRIPTION_TIERS } from '@/lib/stripe/client'
import { PricingButton } from '@/components/pricing-button'

const features = [
  {
    icon: Mic,
    title: '30-Second Voice Logs',
    description: 'Record your dream the moment you wake up — before it fades. Voice-to-text captures every detail effortlessly.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
  },
  {
    icon: Brain,
    title: 'Deep AI Analysis',
    description: 'Claude AI extracts emotions, symbols, and archetypes from each dream, revealing patterns invisible to the conscious mind.',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Evolving Profile',
    description: 'Your subconscious profile grows richer with every log. Watch recurring themes and stress signals emerge over time.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
  },
  {
    icon: Eye,
    title: 'Insight Cards',
    description: '"You\'ve dreamed about falling 8 times — here are grounding techniques." Actionable insights from your dream patterns.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: Heart,
    title: 'Emotional Tracking',
    description: 'Visualize your emotional landscape across weeks and months. Spot stress before it surfaces in waking life.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
  },
  {
    icon: Shield,
    title: 'Private & Secure',
    description: 'Your dreams are deeply personal. End-to-end encrypted and never shared. Your subconscious belongs only to you.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
]

const testimonials = [
  {
    quote: "After 3 weeks, DreamBoard revealed I've been dreaming about water every time I have a big decision. Now I know to journal before deciding.",
    name: 'Maya Chen',
    role: 'Product Designer',
    avatar: 'MC',
  },
  {
    quote: "The voice recorder changed everything. I capture my dreams in 20 seconds, and the AI finds connections I never would have noticed.",
    name: 'James Rivera',
    role: 'Therapist',
    avatar: 'JR',
  },
  {
    quote: "I've been dream journaling for years, but DreamBoard's pattern analysis is in a completely different league.",
    name: 'Sarah Kim',
    role: 'Meditation Teacher',
    avatar: 'SK',
  },
]

export default function LandingPage() {
  const tiers = Object.values(SUBSCRIPTION_TIERS)

  return (
    <div className="relative min-h-screen overflow-hidden">
      <StarsBackground />

      {/* Gradient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-2/3 left-1/2 w-64 h-64 bg-pink-600/6 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10">
        {/* Navbar */}
        <nav className="border-b border-white/6 bg-[#0a0a1a]/70 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Moon className="h-6 w-6 text-violet-400" />
                  <Sparkles className="h-3 w-3 text-purple-300 absolute -top-1 -right-1 animate-pulse-slow" />
                </div>
                <span className="font-bold text-lg gradient-text">DreamBoard AI</span>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="dream" size="sm">Get Started Free</Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section className="pt-24 pb-20 px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 mb-8 animate-fade-in">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by Claude AI
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              Decode your{' '}
              <span className="gradient-text glow-text">subconscious</span>{' '}
              mind
            </h1>

            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: '200ms' }}>
              Record 30-second morning voice memos of your dreams. AI extracts emotions, symbols, and
              patterns — building a living portrait of your inner world.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Link href="/auth/signup">
                <Button variant="dream" size="xl" className="gap-3 shadow-2xl shadow-violet-500/30">
                  <Moon className="h-5 w-5" />
                  Start Logging Dreams
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="xl" className="gap-2">
                  <Eye className="h-4 w-4" />
                  See How It Works
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '400ms' }}>
              Free forever • 30 dream logs • No credit card required
            </p>

            {/* Mock dashboard preview */}
            <div className="mt-16 relative animate-fade-in" style={{ animationDelay: '500ms' }}>
              <div className="absolute inset-0 bg-hero-gradient pointer-events-none rounded-2xl" />
              <div className="dream-card rounded-2xl p-6 text-left shadow-2xl shadow-violet-500/10 border-violet-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground">Latest Dream Analysis</h3>
                    <p className="text-lg font-bold mt-1">The Glass Staircase</p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-violet-500/20 px-3 py-1">
                    <Brain className="h-3.5 w-3.5 text-violet-400" />
                    <span className="text-xs text-violet-300">Analyzed</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {['Anxiety', 'Hope', 'Wonder'].map((e, i) => (
                    <div key={e} className="rounded-lg bg-white/5 border border-white/8 p-2 text-center">
                      <div className="text-lg mb-1">{['😰', '🌱', '✨'][i]}</div>
                      <p className="text-xs text-muted-foreground">{e}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3">
                  <p className="text-sm text-violet-200 italic">
                    "The glass staircase represents your desire for transparency and clarity in a path that feels fragile..."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Everything your subconscious needs
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Built for the morning moment when dreams are still vivid and insights are within reach.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((feature, i) => {
                const Icon = feature.icon
                return (
                  <div
                    key={feature.title}
                    className={`rounded-xl border p-6 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${feature.bg} ${feature.border} animate-fade-in`}
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${feature.bg} mb-4`}>
                      <Icon className={`h-5 w-5 ${feature.color}`} />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-3">Dreamers love it</h2>
              <p className="text-muted-foreground">Real insights from real subconscious minds</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <div key={i} className="dream-card rounded-xl p-6 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="flex mb-4 gap-0.5">
                    {Array(5).fill(0).map((_, j) => (
                      <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 italic mb-4 leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-xs font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, transparent pricing</h2>
              <p className="text-muted-foreground text-lg">Start free. Upgrade when your dreams demand more.</p>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              {tiers.map((tier, i) => (
                <div
                  key={tier.name}
                  className={`relative rounded-xl border p-6 flex flex-col transition-all duration-300 hover:scale-[1.02] animate-fade-in ${
                    tier.popular
                      ? 'border-violet-500/50 bg-gradient-to-br from-violet-600/15 to-indigo-600/10 shadow-xl shadow-violet-500/20'
                      : 'border-white/10 bg-white/3'
                  }`}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-5">
                    <h3 className="font-bold text-lg mb-1">{tier.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">${tier.price}</span>
                      <span className="text-muted-foreground text-sm">/{tier.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <span className="text-violet-400 mt-0.5 flex-shrink-0">✓</span>
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <PricingButton
                    priceId={'priceId' in tier ? tier.priceId : undefined}
                    price={tier.price}
                    tierName={tier.name}
                    popular={tier.popular}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="dream-card rounded-2xl p-10 border-violet-500/20">
              <Moon className="h-12 w-12 text-violet-400 mx-auto mb-4 animate-float" />
              <h2 className="text-3xl font-bold mb-4">Your subconscious is speaking.</h2>
              <p className="text-muted-foreground mb-8">
                Start recording your dreams tonight. AI will find the patterns you've been missing.
              </p>
              <Link href="/auth/signup">
                <Button variant="dream" size="xl" className="gap-3">
                  <Sparkles className="h-5 w-5" />
                  Begin Your Dream Journey
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/6 py-8 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-violet-400" />
              <span className="font-semibold gradient-text">DreamBoard AI</span>
            </div>
            <p>© 2025 DreamBoard AI. Your dreams, decoded.</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-foreground transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
