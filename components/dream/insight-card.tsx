'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react'
import { InsightCard as InsightCardType } from '@/types'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface InsightCardProps {
  card: InsightCardType
  index?: number
}

export function InsightCard({ card, index = 0 }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false)

  const categoryColors: Record<string, string> = {
    emotion: 'from-purple-600/20 to-pink-600/10 border-purple-500/20',
    symbol: 'from-indigo-600/20 to-blue-600/10 border-indigo-500/20',
    theme: 'from-violet-600/20 to-purple-600/10 border-violet-500/20',
    stress: 'from-red-600/20 to-orange-600/10 border-red-500/20',
    growth: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/20',
  }

  const categoryBadgeColors: Record<string, string> = {
    emotion: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    symbol: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    theme: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    stress: 'bg-red-500/20 text-red-300 border-red-500/30',
    growth: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  }

  const gradientClass = categoryColors[card.category] || categoryColors.emotion

  return (
    <div
      className={cn(
        'rounded-xl border bg-gradient-to-br p-5 transition-all duration-300 cursor-pointer hover:scale-[1.01]',
        gradientClass,
        'animate-fade-in'
      )}
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-2xl flex-shrink-0 mt-0.5">{card.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-foreground text-sm leading-tight">{card.title}</h3>
              <span
                className={cn(
                  'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                  categoryBadgeColors[card.category]
                )}
              >
                {card.category}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-1">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {expanded && card.suggestions && card.suggestions.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-white/8 pt-4">
          <div className="flex items-center gap-1.5 mb-2">
            <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-300">Suggestions</span>
          </div>
          {card.suggestions.map((suggestion, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-violet-400 text-xs mt-0.5">→</span>
              <p className="text-xs text-foreground/80">{suggestion}</p>
            </div>
          ))}
        </div>
      )}

      {card.frequency > 1 && (
        <div className="mt-3 flex items-center gap-1.5">
          <div className="h-1.5 rounded-full flex-1 bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
              style={{ width: `${Math.min((card.frequency / 10) * 100, 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground">{card.frequency}× recurring</span>
        </div>
      )}
    </div>
  )
}
