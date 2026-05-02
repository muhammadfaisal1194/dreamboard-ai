'use client'

import { Flame, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakTrackerProps {
  streakDays: number
  dreamCount: number
  lastSevenDays?: boolean[]
}

export function StreakTracker({ streakDays, dreamCount, lastSevenDays = [] }: StreakTrackerProps) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  const sevenDays = lastSevenDays.length === 7
    ? lastSevenDays
    : Array(7).fill(false).map((_, i) => i < Math.min(streakDays, 7))

  return (
    <div className="dream-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-400" />
          <span className="font-semibold text-sm">Dream Streak</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Moon className="h-3.5 w-3.5 text-violet-400" />
          <span className="text-xs text-muted-foreground">{dreamCount} total</span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-4">
        <span className="text-4xl font-bold gradient-text">{streakDays}</span>
        <div>
          <p className="text-sm font-medium">day streak</p>
          <p className="text-xs text-muted-foreground">Keep it up!</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {days.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                'h-8 w-8 rounded-full flex items-center justify-center text-xs transition-all duration-300',
                sevenDays[i]
                  ? 'bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/30'
                  : 'bg-white/5 border border-white/10 text-muted-foreground'
              )}
            >
              {sevenDays[i] ? '✓' : day}
            </div>
            <span className="text-[10px] text-muted-foreground">{day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
