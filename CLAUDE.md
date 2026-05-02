# DreamBoard AI

AI-powered dream journaling SaaS — Next.js 14, Supabase, Claude API, Stripe.

## Dev

```bash
npm install
cp .env.local.example .env.local  # fill in keys
npm run dev
```

## Stack

- **Frontend**: Next.js 14 App Router, TypeScript, Tailwind CSS
- **UI**: Custom shadcn/ui components in `components/ui/`
- **Auth + DB**: Supabase (auth, postgres, storage)
- **AI**: Anthropic Claude claude-sonnet-4-6 via `lib/anthropic/analyze.ts`
- **Payments**: Stripe subscriptions via `lib/stripe/client.ts`
- **Speech**: Web Speech API in `components/dream/voice-recorder.tsx`

## Key routes

| Route | File | Notes |
|-------|------|-------|
| `/` | `app/page.tsx` | Landing + pricing |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | Main dashboard |
| `/dream/new` | `app/(dashboard)/dream/new/page.tsx` | Voice + text entry |
| `/journal` | `app/(dashboard)/journal/page.tsx` | Search + filter |
| `/profile` | `app/(dashboard)/profile/page.tsx` | Subconscious report |
| `/api/dreams/analyze` | `app/api/dreams/analyze/route.ts` | Claude analysis |
| `/api/stripe/webhook` | `app/api/stripe/webhook/route.ts` | Stripe events |

## DB Setup

Run `lib/supabase/schema.sql` in Supabase SQL Editor.

## Env vars

See `.env.local.example`.

## Storage

Create a Supabase storage bucket named `dream-audio` (public).

## Stripe

Set up two products: Pro ($12/mo) and Team ($49/mo). Copy price IDs to env.
