'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'

interface PricingButtonProps {
  priceId?: string
  price: number
  tierName: string
  popular?: boolean
}

export function PricingButton({ priceId, price, tierName, popular }: PricingButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleClick = async () => {
    if (price === 0 || !priceId) {
      router.push('/auth/signup')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      })

      if (res.status === 401) {
        router.push(`/auth/login?redirect=/`)
        return
      }

      const data = await res.json()
      if (data.error) throw new Error(data.error)
      window.location.href = data.url
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      toast({ title: 'Checkout failed', description: message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={popular ? 'dream' : 'outline'}
      className="w-full"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : price === 0 ? (
        'Start Free'
      ) : (
        `Get ${tierName}`
      )}
    </Button>
  )
}
