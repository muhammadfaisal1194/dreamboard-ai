'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Moon, LayoutDashboard, BookOpen, User, Plus, LogOut, Menu, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps {
  user?: { email: string; full_name?: string } | null
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/profile', label: 'Profile', icon: User },
]

export function Navbar({ user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/6 bg-[#0a0a1a]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={user ? '/dashboard' : '/'} className="flex items-center gap-2 group">
            <div className="relative">
              <Moon className="h-6 w-6 text-violet-400 group-hover:text-violet-300 transition-colors" />
              <Sparkles className="h-3 w-3 text-purple-300 absolute -top-1 -right-1 animate-pulse-slow" />
            </div>
            <span className="font-bold text-lg gradient-text">DreamBoard</span>
          </Link>

          {user ? (
            <>
              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = pathname === item.href
                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          'gap-2',
                          active && 'bg-violet-500/15 text-violet-300 hover:bg-violet-500/20'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Button>
                    </Link>
                  )
                })}
              </div>

              <div className="hidden md:flex items-center gap-3">
                <Link href="/dream/new">
                  <Button variant="dream" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Log Dream
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="dream" size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {user && mobileOpen && (
        <div className="md:hidden border-t border-white/6 bg-[#0a0a1a]/95 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3',
                    active && 'bg-violet-500/15 text-violet-300'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
          <Link href="/dream/new" onClick={() => setMobileOpen(false)}>
            <Button variant="dream" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              Log Dream
            </Button>
          </Link>
          <Button variant="ghost" className="w-full justify-start gap-3 text-red-400" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      )}
    </nav>
  )
}
