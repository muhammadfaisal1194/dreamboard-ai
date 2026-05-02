import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { StarsBackground } from '@/components/layout/stars-background'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name, avatar_url')
    .eq('id', user.id)
    .single()

  return (
    <div className="relative min-h-screen">
      <StarsBackground />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-violet-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10">
        <Navbar user={profile} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          {children}
        </main>
      </div>
    </div>
  )
}
