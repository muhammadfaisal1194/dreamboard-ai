'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, Plus, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DreamCard } from '@/components/dream/dream-card'
import { createClient } from '@/lib/supabase/client'
import { Dream } from '@/types'
import { cn } from '@/lib/utils'

const EMOTION_OPTIONS = ['Joy', 'Fear', 'Anxiety', 'Sadness', 'Excitement', 'Love', 'Anger', 'Peace', 'Confusion']
const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Newest First' },
  { value: 'date_asc', label: 'Oldest First' },
  { value: 'stress_high', label: 'Most Stressful' },
  { value: 'stress_low', label: 'Least Stressful' },
]

export default function JournalPage() {
  const [dreams, setDreams] = useState<Dream[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [sort, setSort] = useState('date_desc')
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const supabase = createClient()
  const PAGE_SIZE = 12

  const fetchDreams = useCallback(async (reset = false) => {
    setLoading(true)
    const currentPage = reset ? 0 : page

    let q = supabase
      .from('dreams')
      .select('*')

    if (query) {
      q = q.or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    }

    if (selectedEmotions.length > 0) {
      q = q.overlaps('emotions', selectedEmotions.map(e => e.toLowerCase()))
    }

    if (sort === 'date_desc') q = q.order('recorded_at', { ascending: false })
    else if (sort === 'date_asc') q = q.order('recorded_at', { ascending: true })
    else if (sort === 'stress_high') q = q.order('stress_level', { ascending: false })
    else if (sort === 'stress_low') q = q.order('stress_level', { ascending: true })

    q = q.range(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE - 1)

    const { data, error } = await q
    if (!error && data) {
      if (reset) {
        setDreams(data)
        setPage(0)
      } else {
        setDreams(prev => [...prev, ...data])
      }
      setHasMore(data.length === PAGE_SIZE)
    }
    setLoading(false)
  }, [query, selectedEmotions, sort, page, supabase])

  useEffect(() => {
    fetchDreams(true)
  }, [query, selectedEmotions, sort])

  const toggleEmotion = (emotion: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotion) ? prev.filter(e => e !== emotion) : [...prev, emotion]
    )
  }

  const clearFilters = () => {
    setQuery('')
    setSelectedEmotions([])
    setSort('date_desc')
  }

  const activeFilterCount = selectedEmotions.length + (sort !== 'date_desc' ? 1 : 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dream Journal</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {loading ? 'Loading...' : `${dreams.length}+ entries in your archive`}
          </p>
        </div>
        <Link href="/dream/new">
          <Button variant="dream" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Log Dream</span>
          </Button>
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search dreams..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          className={cn('gap-2 relative', activeFilterCount > 0 && 'border-violet-500/50 text-violet-300')}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-violet-500 text-[10px] flex items-center justify-center text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
        {(activeFilterCount > 0 || query) && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="dream-card rounded-xl p-5 space-y-4 animate-fade-in">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">FILTER BY EMOTION</p>
            <div className="flex flex-wrap gap-2">
              {EMOTION_OPTIONS.map((emotion) => (
                <button
                  key={emotion}
                  onClick={() => toggleEmotion(emotion)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-full border transition-all',
                    selectedEmotions.includes(emotion)
                      ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                      : 'border-white/15 text-muted-foreground hover:border-white/30 hover:text-foreground'
                  )}
                >
                  {emotion}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">SORT BY</p>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSort(option.value)}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-full border transition-all',
                    sort === option.value
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                      : 'border-white/15 text-muted-foreground hover:border-white/30 hover:text-foreground'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dreams grid */}
      {loading && dreams.length === 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="dream-card rounded-xl p-5 h-32 animate-pulse" />
          ))}
        </div>
      ) : dreams.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🌙</div>
          <h2 className="text-xl font-bold mb-2">No dreams found</h2>
          <p className="text-muted-foreground text-sm mb-6">
            {query || activeFilterCount > 0
              ? 'Try adjusting your search or filters'
              : 'Start logging your dreams to build your journal'}
          </p>
          <Link href="/dream/new">
            <Button variant="dream" className="gap-2">
              <Plus className="h-4 w-4" />
              Log Your First Dream
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            {dreams.map((dream, i) => (
              <DreamCard key={dream.id} dream={dream} index={i} />
            ))}
          </div>
          {hasMore && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                onClick={() => { setPage(p => p + 1); fetchDreams() }}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More Dreams'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
