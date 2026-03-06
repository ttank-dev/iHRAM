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

    const isLocal = !ip || ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')

    let city: string | null = null
    let region: string | null = null
    let country: string | null = null
    let agency_id: string | null = null

    // Geo lookup
    if (!isLocal) {
      try {
        const geo = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,regionName,country,countryCode`, {
          signal: AbortSignal.timeout(3000)
        })
        const data = await geo.json()
        if (data.status === 'success') {
          city    = data.city       || null
          region  = data.regionName || null
          country = data.country    || null
        }
      } catch { /* silent fail */ }
    }

    // Lookup agency_id from page_path
    // Matches: /agensi/[slug] or /pakej/[slug]
    const supabase = await createClient()

    const agensiMatch = page_path?.match(/^\/agensi\/([^\/]+)/)
    const pakejMatch  = page_path?.match(/^\/pakej\/([^\/]+)/)

    if (agensiMatch) {
      const slug = agensiMatch[1]
      const { data } = await supabase
        .from('agencies')
        .select('id')
        .eq('slug', slug)
        .single()
      agency_id = data?.id || null
    } else if (pakejMatch) {
      const slug = pakejMatch[1]
      const { data } = await supabase
        .from('packages')
        .select('agency_id')
        .eq('slug', slug)
        .single()
      agency_id = data?.agency_id || null
    }

    await supabase.from('visitor_stats').insert({
      page_path,
      session_id,
      ip_address: ip,
      city,
      region,
      country,
      agency_id,
    })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}