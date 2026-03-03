import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { page_path, session_id } = await req.json()

    // Get real IP from headers (works on Vercel)
    const ip =
      req.headers.get('x-real-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('cf-connecting-ip') || // Cloudflare
      'unknown'

    const supabase = await createClient()
    await supabase.from('visitor_stats').insert({
      page_path,
      session_id,
      ip_address: ip,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}