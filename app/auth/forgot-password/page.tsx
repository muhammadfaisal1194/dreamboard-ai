'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Moon, Sparkles, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { StarsBackground } from '@/components/layout/stars-background'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) throw error
      setSent(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <StarsBackground />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="relative">
              <Moon className="h-8 w-8 text-violet-400" />
              <Sparkles className="h-4 w-4 text-purple-300 absolute -top-1 -right-1" />
            </div>
            <span className="font-bold text-2xl gradient-text">DreamBoard AI</span>
          </Link>
        </div>

        <div className="dream-card rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Check your email</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Reset link sent to <strong className="text-foreground">{email}</strong>
              </p>
              <Link href="/auth/login">
                <Button variant="outline" className="w-full">Back to Sign In</Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
              <p className="text-muted-foreground text-sm mb-6">
                Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleReset} className="space-y-4">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button type="submit" variant="dream" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground mt-4">
                <Link href="/auth/login" className="text-violet-400 hover:text-violet-300">
                  Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
