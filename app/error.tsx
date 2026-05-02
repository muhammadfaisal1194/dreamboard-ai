'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { StarsBackground } from '@/components/layout/stars-background'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <StarsBackground />
      <div className="relative z-10 text-center">
        <div className="text-6xl mb-6">⚡</div>
        <h1 className="text-2xl font-bold mb-3">Something went wrong</h1>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm">
          A disturbance in the dreamscape. Try again or return to the dashboard.
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="dream" onClick={reset}>Try Again</Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
