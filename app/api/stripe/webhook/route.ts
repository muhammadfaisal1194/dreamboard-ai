import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getStripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createClient()

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.userId
        if (!userId) break

        const priceId = subscription.items.data[0]?.price.id
        let tier: 'free' | 'pro' | 'team' = 'free'
        if (priceId === process.env.STRIPE_PRO_PRICE_ID) tier = 'pro'
        else if (priceId === process.env.STRIPE_TEAM_PRICE_ID) tier = 'team'

        const status = subscription.status
        if (status === 'active' || status === 'trialing') {
          await supabase.from('profiles').update({
            subscription_tier: tier,
            stripe_subscription_id: subscription.id,
          }).eq('id', userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.userId
        if (userId) {
          await supabase.from('profiles').update({
            subscription_tier: 'free',
            stripe_subscription_id: null,
          }).eq('id', userId)
        }
        break
      }

      case 'invoice.payment_failed': {
        console.log('Payment failed for subscription:', (event.data.object as Stripe.Invoice).subscription)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
