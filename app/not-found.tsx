import Link from 'next/link'
import { Moon, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarsBackground } from '@/components/layout/stars-background'

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <StarsBackground />
      <div className="relative z-10 text-center">
        <div className="text-8xl mb-6 animate-float">🌙</div>
        <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
        <h2 className="text-2xl font-bold mb-3">Lost in the dreamscape</h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          This page drifted away into the subconscious. Let's guide you back to reality.
        </p>
        <Link href="/">
          <Button variant="dream" size="lg" className="gap-2">
            <Moon className="h-5 w-5" />
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
