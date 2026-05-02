import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return formatDate(date)
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    joy: '#f59e0b',
    happiness: '#f59e0b',
    fear: '#6366f1',
    anxiety: '#8b5cf6',
    sadness: '#3b82f6',
    anger: '#ef4444',
    surprise: '#ec4899',
    disgust: '#10b981',
    love: '#f43f5e',
    confusion: '#6b7280',
    excitement: '#f97316',
    peace: '#14b8a6',
    loneliness: '#64748b',
    hope: '#84cc16',
  }
  const key = emotion.toLowerCase()
  return colors[key] || '#a855f7'
}

export function getStressColor(level: number): string {
  if (level <= 3) return '#10b981'
  if (level <= 6) return '#f59e0b'
  return '#ef4444'
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const EMOTION_ICONS: Record<string, string> = {
  joy: '☀️',
  happiness: '😊',
  fear: '😨',
  anxiety: '😰',
  sadness: '💙',
  anger: '🔥',
  surprise: '✨',
  love: '💜',
  confusion: '🌀',
  excitement: '⚡',
  peace: '🌊',
  loneliness: '🌙',
  hope: '🌱',
}
