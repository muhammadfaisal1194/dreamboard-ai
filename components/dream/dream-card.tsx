'use client'

import { formatRelativeTime, truncate, getStressColor } from '@/lib/utils'
import { Dream } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Mic, FileText, Star, Brain } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface DreamCardProps {
  dream: Dream
  index?: number
}

export function DreamCard({ dream, index = 0 }: DreamCardProps) {
  const stressColor = getStressColor(dream.stress_level)

  return (
    <Link href={`/dream/${dream.id}`}>
      <div
        className={cn(
          'dream-card rounded-xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.01] hover:border-violet-500/30 group animate-fade-in'
        )}
        style={{ animationDelay: `${index * 60}ms` }}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {dream.audio_url ? (
                <Mic className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" />
              ) : (
                <FileText className="h-3.5 w-3.5 text-indigo-400 flex-shrink-0" />
              )}
              <h3 className="font-semibold text-sm text-foreground group-hover:text-violet-300 transition-colors truncate">
                {dream.title}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">{formatRelativeTime(dream.recorded_at)}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {dream.is_favorite && <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />}
            {dream.is_analyzed && <Brain className="h-3.5 w-3.5 text-violet-400" />}
          </div>
        </div>

        <p className="text-sm text-foreground/70 mb-3 leading-relaxed line-clamp-2">
          {truncate(dream.content, 120)}
        </p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {dream.emotions.slice(0, 3).map((emotion) => (
              <Badge key={emotion} variant="default" className="text-[10px] px-2 py-0">
                {emotion}
              </Badge>
            ))}
            {dream.themes.slice(0, 2).map((theme) => (
              <Badge key={theme} variant="theme" className="text-[10px] px-2 py-0">
                {theme}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: stressColor, boxShadow: `0 0 6px ${stressColor}50` }}
            />
            <span className="text-[10px] text-muted-foreground">{dream.stress_level}/10</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
