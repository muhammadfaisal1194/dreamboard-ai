'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, FileText, Brain, Loader2, Moon, ChevronLeft, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { VoiceRecorder } from '@/components/dream/voice-recorder'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type InputMode = 'voice' | 'text'

export default function NewDreamPage() {
  const [mode, setMode] = useState<InputMode>('voice')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)
  const router = useRouter()
  const supabase = createClient()

  const handleTranscript = useCallback((text: string) => {
    setContent(text)
  }, [])

  const handleAudioBlob = useCallback((blob: Blob) => {
    setAudioBlob(blob)
  }, [])

  const handleSaveAndAnalyze = async () => {
    if (!content.trim() && !audioBlob) {
      toast({ title: 'Please record or write your dream first', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let audioUrl: string | undefined
      if (audioBlob) {
        const fileName = `${user.id}/${Date.now()}.webm`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('dream-audio')
          .upload(fileName, audioBlob, { contentType: 'audio/webm' })
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage
            .from('dream-audio')
            .getPublicUrl(uploadData.path)
          audioUrl = urlData.publicUrl
        }
      }

      const dreamTitle = title.trim() || generateTitle(content)

      const { data: dream, error: dreamError } = await supabase
        .from('dreams')
        .insert({
          user_id: user.id,
          title: dreamTitle,
          content: content || 'Voice dream log',
          audio_url: audioUrl,
          recorded_at: new Date().toISOString(),
          is_analyzed: false,
        })
        .select()
        .single()

      if (dreamError) throw dreamError

      // Update profile dream count (handled in analyze API)

      // Trigger AI analysis
      setAnalyzing(true)
      setSaving(false)
      setStep(2)

      const response = await fetch('/api/dreams/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dreamId: dream.id, content: content || 'Voice dream log' }),
      })

      if (!response.ok) throw new Error('Analysis failed')

      toast({ title: 'Dream analyzed!', description: 'Your subconscious patterns have been updated.' })
      router.push(`/dream/${dream.id}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save dream'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setSaving(false)
      setAnalyzing(false)
    }
  }

  const handleSaveOnly = async () => {
    if (!content.trim()) {
      toast({ title: 'Please write your dream first', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const dreamTitle = title.trim() || generateTitle(content)
      const { data: dream, error } = await supabase
        .from('dreams')
        .insert({
          user_id: user.id,
          title: dreamTitle,
          content,
          recorded_at: new Date().toISOString(),
          is_analyzed: false,
        })
        .select()
        .single()

      if (error) throw error
      toast({ title: 'Dream saved!' })
      router.push('/dashboard')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save'
      toast({ title: 'Error', description: message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (step === 2) {
    return (
      <div className="max-w-xl mx-auto text-center py-20">
        <div className="dream-card rounded-2xl p-12 border-violet-500/20">
          <div className="relative mx-auto mb-6 h-20 w-20">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center animate-pulse">
              <Brain className="h-10 w-10 text-violet-400" />
            </div>
            <div className="absolute inset-0 rounded-full border-2 border-violet-500/30 animate-spin" style={{ animationDuration: '3s' }} />
          </div>
          <h2 className="text-2xl font-bold mb-3 gradient-text">Analyzing Your Dream</h2>
          <p className="text-muted-foreground mb-2">
            Claude AI is extracting emotions, symbols, and patterns from your dream...
          </p>
          <p className="text-xs text-muted-foreground">This takes 10–20 seconds</p>
          <div className="mt-6 flex gap-2 justify-center">
            {['Emotions', 'Symbols', 'Themes', 'Insights'].map((label, i) => (
              <div
                key={label}
                className="text-[10px] text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-full px-2.5 py-1 animate-pulse"
                style={{ animationDelay: `${i * 300}ms` }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ChevronLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 mb-4">
          <Moon className="h-3.5 w-3.5" />
          Morning Dream Log
        </div>
        <h1 className="text-3xl font-bold mb-2">What did you dream?</h1>
        <p className="text-muted-foreground text-sm">
          Capture it now while the details are fresh. Even fragments matter.
        </p>
      </div>

      {/* Mode switcher */}
      <div className="dream-card rounded-xl p-1 flex gap-1">
        <button
          onClick={() => setMode('voice')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all',
            mode === 'voice'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Mic className="h-4 w-4" />
          Voice Memo
        </button>
        <button
          onClick={() => setMode('text')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all',
            mode === 'text'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <FileText className="h-4 w-4" />
          Text Entry
        </button>
      </div>

      {/* Dream title */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground/80">Dream Title (optional)</label>
        <Input
          placeholder="e.g. The Glass Staircase"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={80}
        />
      </div>

      {/* Input area */}
      <div>
        {mode === 'voice' ? (
          <div className="space-y-4">
            <VoiceRecorder
              onTranscript={handleTranscript}
              onAudioBlob={handleAudioBlob}
              maxDuration={30}
            />
            {content && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground/80">Edit Transcript</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="Your dream transcript..."
                />
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground/80">Describe Your Dream</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              placeholder="Write everything you remember — people, places, feelings, colors, sensations. Even vague impressions are valuable..."
              className="min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground text-right">{content.length} characters</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleSaveOnly}
          disabled={saving || analyzing}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Only'}
        </Button>
        <Button
          variant="dream"
          className="flex-1 gap-2"
          onClick={handleSaveAndAnalyze}
          disabled={saving || analyzing}
        >
          {analyzing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Save & Analyze with AI
        </Button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        AI analysis uses Claude to extract insights from your dream content
      </p>
    </div>
  )
}

function generateTitle(content: string): string {
  const words = content.trim().split(/\s+/).slice(0, 5)
  return words.join(' ') + (content.split(/\s+/).length > 5 ? '...' : '')
}
