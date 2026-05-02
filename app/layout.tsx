import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DreamBoard AI — Decode Your Subconscious',
  description:
    'Record your morning dreams, get AI-powered insights, and discover your subconscious patterns with DreamBoard AI.',
  keywords: ['dream journal', 'AI dreams', 'subconscious', 'dream analysis', 'sleep insights'],
  authors: [{ name: 'DreamBoard AI' }],
  openGraph: {
    title: 'DreamBoard AI — Decode Your Subconscious',
    description: 'AI-powered dream analysis that evolves with you.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a1a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#0a0a1a] antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
