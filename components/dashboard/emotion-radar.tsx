'use client'

import { Emotion } from '@/types'
import { cn } from '@/lib/utils'

interface EmotionRadarProps {
  emotions: Emotion[]
  className?: string
}

export function EmotionRadar({ emotions, className }: EmotionRadarProps) {
  if (!emotions || emotions.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-48 text-muted-foreground text-sm', className)}>
        No emotion data yet
      </div>
    )
  }

  const top5 = emotions.slice(0, 5)

  return (
    <div className={cn('space-y-3', className)}>
      {top5.map((emotion, i) => (
        <div key={i} className="flex items-center gap-3">
          <div
            className="h-3 w-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: emotion.color, boxShadow: `0 0 8px ${emotion.color}60` }}
          />
          <span className="text-sm text-foreground/80 w-24 capitalize flex-shrink-0">{emotion.name}</span>
          <div className="flex-1 h-2 rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(emotion.intensity / 10) * 100}%`,
                backgroundColor: emotion.color,
                boxShadow: `0 0 8px ${emotion.color}40`,
              }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-8 text-right">{emotion.intensity}/10</span>
        </div>
      ))}
    </div>
  )
}
