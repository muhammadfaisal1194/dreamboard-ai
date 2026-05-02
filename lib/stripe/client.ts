import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_placeholder')
  }
  return _stripe
}

export const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    period: 'forever',
    dreamLimit: 30,
    popular: false,
    features: [
      '30 dream logs total',
      'Basic AI analysis',
      'Emotion tracking',
      '7-day dream history',
      'Web & mobile access',
    ],
  },
  pro: {
    name: 'Pro',
    price: 12,
    period: 'month',
    dreamLimit: null,
    popular: true,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: [
      'Unlimited dream logs',
      'Advanced AI analysis',
      'Deep subconscious profiling',
      'Full dream history',
      'Voice recording (30s)',
      'Pattern recognition',
      'Weekly insight reports',
      'Export to PDF',
    ],
  },
  team: {
    name: 'Team',
    price: 49,
    period: 'month',
    dreamLimit: null,
    popular: false,
    priceId: process.env.STRIPE_TEAM_PRICE_ID,
    features: [
      'Everything in Pro',
      'Up to 10 members',
      'Team dream patterns',
      'Shared insights dashboard',
      'Priority AI processing',
      'API access',
      'Dedicated support',
      'Custom integrations',
    ],
  },
}

export async function createCheckoutSession(
  priceId: string,
  customerId: string,
  userId: string
): Promise<string> {
  const stripe = getStripe()
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId },
    subscription_data: {
      metadata: { userId },
    },
  })
  return session.url!
}

export async function createPortalSession(customerId: string): Promise<string> {
  const stripe = getStripe()
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/profile`,
  })
  return session.url
}
