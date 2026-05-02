export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  subscription_tier: 'free' | 'pro' | 'team'
  dream_count: number
  streak_days: number
  created_at: string
}

export interface Dream {
  id: string
  user_id: string
  title: string
  content: string
  audio_url?: string
  recorded_at: string
  created_at: string
  analysis?: DreamAnalysis
  emotions: string[]
  symbols: string[]
  themes: string[]
  stress_level: number
  mood_score: number
  is_analyzed: boolean
  is_favorite: boolean
}

export interface DreamAnalysis {
  id: string
  dream_id: string
  emotions: Emotion[]
  symbols: Symbol[]
  themes: Theme[]
  stress_signals: StressSignal[]
  summary: string
  insight: string
  archetype?: string
  created_at: string
}

export interface Emotion {
  name: string
  intensity: number
  color: string
}

export interface Symbol {
  name: string
  meaning: string
  frequency: number
}

export interface Theme {
  name: string
  description: string
  recurrence: number
}

export interface StressSignal {
  type: string
  description: string
  severity: 'low' | 'medium' | 'high'
}

export interface SubconsciousProfile {
  dominant_emotions: Emotion[]
  recurring_symbols: Symbol[]
  recurring_themes: Theme[]
  stress_patterns: StressSignal[]
  insight_cards: InsightCard[]
  personality_archetype: string
  dream_coherence_score: number
  emotional_balance: number
  creativity_index: number
}

export interface InsightCard {
  id: string
  title: string
  description: string
  category: 'emotion' | 'symbol' | 'theme' | 'stress' | 'growth'
  frequency: number
  suggestions: string[]
  icon: string
  color: string
}

export interface SubscriptionTier {
  name: string
  price: number
  period: string
  features: string[]
  dreamLimit: number | null
  popular?: boolean
  priceId?: string
}

export interface VoiceRecorderState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  audioBlob?: Blob
  transcript?: string
  error?: string
}

export interface SearchFilters {
  query: string
  dateFrom?: string
  dateTo?: string
  emotions: string[]
  themes: string[]
  stressLevel?: number
  sortBy: 'date' | 'stress' | 'mood'
  sortOrder: 'asc' | 'desc'
}
