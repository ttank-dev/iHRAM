import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { page_path, session_id } = await req.json()

    // Get real IP
    const ip =
      req.headers.get('x-real-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('cf-connecting-ip') ||
      'unknown'

    // Geo lookup — skip for localhost/unknown
    let city: string | null = null
    let region: string | null = null
    let country: string | null = null

    const isLocal = !ip || ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')

    if (!isLocal) {
      try {
        // ip-api.com free tier, no API key needed, 45 req/min
        const geo = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,regionName,country,countryCode`, {
          signal: AbortSignal.timeout(3000) // 3s timeout max
        })
        const data = await geo.json()
        if (data.status === 'success') {
          city    = data.city       || null
          region  = data.regionName || null
          country = data.country    || null
        }
      } catch {
        // geo lookup failed silently — still save visit
      }
    }

    const supabase = await createClient()
    await supabase.from('visitor_stats').insert({
      page_path,
      session_id,
      ip_address: ip,
      city,
      region,
      country,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}