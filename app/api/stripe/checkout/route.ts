import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe, createCheckoutSession } from '@/lib/stripe/client'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { priceId } = await request.json()
    if (!priceId) return NextResponse.json({ error: 'Price ID required' }, { status: 400 })

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', user.id)
      .single()

    let customerId = profile?.stripe_customer_id
    if (!customerId) {
      const customer = await getStripe().customers.create({
        email: profile?.email || user.email!,
        metadata: { userId: user.id },
      })
      customerId = customer.id
      await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id)
    }

    const url = await createCheckoutSession(priceId, customerId, user.id)
    return NextResponse.json({ url })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Checkout failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
