'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Square, Play, Pause, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDuration } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface VoiceRecorderProps {
  onTranscript: (text: string) => void
  onAudioBlob: (blob: Blob) => void
  maxDuration?: number
}

export function VoiceRecorder({ onTranscript, onAudioBlob, maxDuration = 30 }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [duration, setDuration] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [waveAmplitudes, setWaveAmplitudes] = useState<number[]>(Array(20).fill(4))

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  useEffect(() => {
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
    const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    setIsSupported(hasMediaDevices && hasSpeechRecognition)
  }, [])

  const animateWave = useCallback(() => {
    if (!analyserRef.current || !isRecording) return
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(dataArray)
    const amplitudes = Array.from({ length: 20 }, (_, i) => {
      const idx = Math.floor((i / 20) * dataArray.length)
      return Math.max(4, (dataArray[idx] / 255) * 40)
    })
    setWaveAmplitudes(amplitudes)
    animFrameRef.current = requestAnimationFrame(animateWave)
  }, [isRecording])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioCtx = new AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        onAudioBlob(blob)
        stream.getTracks().forEach((t) => t.stop())
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
        setWaveAmplitudes(Array(20).fill(4))
      }

      mediaRecorder.start(100)
      setIsRecording(true)
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration((d) => {
          if (d >= maxDuration - 1) {
            stopRecording()
            return maxDuration
          }
          return d + 1
        })
      }, 1000)

      // Speech recognition
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = 'en-US'
        recognitionRef.current = recognition

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let fullTranscript = ''
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript
          }
          setTranscript(fullTranscript)
          onTranscript(fullTranscript)
        }
        recognition.start()
      }

      animFrameRef.current = requestAnimationFrame(animateWave)
    } catch (err) {
      console.error('Recording failed:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current?.stop()
    }
    recognitionRef.current?.stop()
    if (timerRef.current) clearInterval(timerRef.current)
    setIsRecording(false)
    setIsPaused(false)
  }

  const resetRecording = () => {
    setDuration(0)
    setTranscript('')
    setAudioUrl(null)
    setIsPlaying(false)
    chunksRef.current = []
  }

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const progress = (duration / maxDuration) * 100

  return (
    <div className="space-y-4">
      {!isSupported && (
        <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-300">
          Voice recording is not supported in your browser. Please use text input below.
        </div>
      )}

      <div className="relative rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-900/20 to-indigo-900/10 p-6">
        {/* Waveform visualizer */}
        <div className="mb-4 flex h-12 items-end justify-center gap-[3px]">
          {waveAmplitudes.map((amp, i) => (
            <div
              key={i}
              className={cn(
                'w-1.5 rounded-full transition-all duration-75',
                isRecording
                  ? 'bg-gradient-to-t from-violet-600 to-purple-400'
                  : 'bg-white/20'
              )}
              style={{ height: `${amp}px` }}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="mb-4 text-center">
          <span className={cn('text-3xl font-mono font-bold', isRecording && 'text-violet-400 glow-text')}>
            {formatDuration(duration)}
          </span>
          <span className="text-muted-foreground text-sm"> / {formatDuration(maxDuration)}</span>
        </div>

        {/* Progress bar */}
        <div className="mb-6 h-1 rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          {!isRecording && !audioUrl && (
            <Button
              onClick={startRecording}
              variant="dream"
              size="lg"
              className="gap-2 px-8"
              disabled={!isSupported}
            >
              <Mic className="h-5 w-5" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <Button
              onClick={stopRecording}
              size="lg"
              className="gap-2 bg-red-600/80 px-8 hover:bg-red-600 recording-pulse"
            >
              <Square className="h-4 w-4 fill-current" />
              Stop
            </Button>
          )}

          {audioUrl && !isRecording && (
            <>
              <Button variant="outline" size="icon" onClick={togglePlayback}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={resetRecording}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {transcript && (
          <div className="mt-4 rounded-lg border border-white/8 bg-white/3 p-3">
            <p className="text-xs text-muted-foreground mb-1">Transcript</p>
            <p className="text-sm text-foreground/90 italic">"{transcript}"</p>
          </div>
        )}
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  )
}
