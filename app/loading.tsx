import { Moon } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-4 mx-auto w-16 h-16">
          <Moon className="h-16 w-16 text-violet-400 animate-pulse-slow" />
          <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <p className="text-muted-foreground text-sm animate-pulse">Entering the dreamscape...</p>
      </div>
    </div>
  )
}
