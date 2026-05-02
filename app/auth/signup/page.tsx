'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Moon, Sparkles, Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { StarsBackground } from '@/components/layout/stars-background'

const benefits = [
  '30 free dream logs to start',
  'AI analysis of every dream',
  'Personal subconscious profile',
  'No credit card required',
]

export default function SignupPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      toast({ title: 'Please accept the terms', variant: 'destructive' })
      return
    }
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      setStep(3)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Signup failed'
      toast({ title: 'Signup failed', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
      setLoading(false)
    }
  }

  if (step === 3) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <StarsBackground />
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="dream-card rounded-2xl p-10">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Check your email!</h2>
            <p className="text-muted-foreground mb-6">
              We sent a verification link to <strong className="text-foreground">{email}</strong>.
              Click it to activate your account and start logging dreams.
            </p>
            <Link href="/auth/login">
              <Button variant="dream" className="w-full">Go to Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <StarsBackground />
      <div className="fixed inset-0 bg-hero-gradient pointer-events-none z-0" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="relative">
              <Moon className="h-8 w-8 text-violet-400" />
              <Sparkles className="h-4 w-4 text-purple-300 absolute -top-1 -right-1" />
            </div>
            <span className="font-bold text-2xl gradient-text">DreamBoard AI</span>
          </Link>
          <p className="text-muted-foreground mt-2">Your subconscious journey begins here</p>
        </div>

        {/* Benefits */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {benefits.map((b) => (
            <span key={b} className="inline-flex items-center gap-1.5 text-xs text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1">
              <Check className="h-3 w-3" />
              {b}
            </span>
          ))}
        </div>

        {/* Card */}
        <div className="dream-card rounded-2xl p-8 shadow-2xl shadow-violet-500/10">
          <h1 className="text-2xl font-bold mb-6 text-center">Create Your Account</h1>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Full Name</label>
              <Input
                type="text"
                placeholder="Your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground/80">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && (
                <div className="flex gap-1 mt-1">
                  {[password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password)].map((met, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${met ? 'bg-violet-500' : 'bg-white/10'}`}
                    />
                  ))}
                </div>
              )}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-violet-500"
              />
              <span className="text-xs text-muted-foreground">
                I agree to the{' '}
                <Link href="#" className="text-violet-400 hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="#" className="text-violet-400 hover:underline">Privacy Policy</Link>
              </span>
            </label>

            <Button type="submit" variant="dream" className="w-full h-11" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-[#0d0d2b] px-3">or continue with</span>
            </div>
          </div>

          <Button variant="outline" className="w-full h-11 gap-3" onClick={handleGoogleSignup} disabled={loading}>
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
