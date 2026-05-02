import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const query = searchParams.get('q') || ''

    let q = supabase
      .from('dreams')
      .select('*, dream_analyses(*)')
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (query) {
      q = q.or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    }

    const { data, error } = await q
    if (error) throw error

    return NextResponse.json({ dreams: data })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch dreams'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const dreamId = searchParams.get('id')
    if (!dreamId) return NextResponse.json({ error: 'Dream ID required' }, { status: 400 })

    const { error } = await supabase
      .from('dreams')
      .delete()
      .eq('id', dreamId)
      .eq('user_id', user.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete dream'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
