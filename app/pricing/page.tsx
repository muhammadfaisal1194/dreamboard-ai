import Link from 'next/link'
import { Check, Zap, Crown, Moon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SUBSCRIPTION_TIERS } from '@/lib/stripe/client'
import { StarsBackground } from '@/components/layout/stars-background'

export default function PricingPage() {
  const tiers = Object.values(SUBSCRIPTION_TIERS)

  return (
    <div className="relative min-h-screen">
      <StarsBackground />
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <Moon className="h-6 w-6 text-violet-400" />
            <span className="font-bold text-lg gradient-text">DreamBoard AI</span>
          </Link>
          <h1 className="text-4xl font-bold mb-4">Simple, honest pricing</h1>
          <p className="text-muted-foreground text-lg">
            Start free. Upgrade when your dreams demand more.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {tiers.map((tier, i) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border p-7 flex flex-col ${
                tier.popular
                  ? 'border-violet-500/50 bg-gradient-to-br from-violet-600/15 to-indigo-600/10 shadow-2xl shadow-violet-500/20'
                  : 'border-white/10 bg-white/3'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5">
                    <Zap className="h-3 w-3" /> Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  {tier.name === 'Free' ? <Moon className="h-5 w-5 text-muted-foreground" /> :
                   tier.name === 'Pro' ? <Zap className="h-5 w-5 text-violet-400" /> :
                   <Crown className="h-5 w-5 text-amber-400" />}
                  <h2 className="font-bold text-xl">{tier.name}</h2>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground">/{tier.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-violet-400 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href="/auth/signup">
                <Button
                  variant={tier.popular ? 'dream' : 'outline'}
                  className="w-full h-12 text-base"
                >
                  {tier.price === 0 ? 'Start Free' : `Get ${tier.name} — $${tier.price}/mo`}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          All plans include SSL encryption and GDPR compliance. Cancel anytime.
        </p>
      </div>
    </div>
  )
}
