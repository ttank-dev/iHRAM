'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MerchantOnlineNow({ agencySlug }: { agencySlug: string }) {
  const [online, setOnline] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to main presence channel
    // Filter by users on this agency's pages
    const channel = supabase.channel('ihram_online')
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      // Each presence entry has { page_path } we set in useVisitorTrack
      const count = Object.values(state).flat().filter((p: any) => {
        const path = p?.page_path || ''
        return path.startsWith(`/agensi/${agencySlug}`) || path.includes(`/pakej/`)
      }).length
      setOnline(count)
      setReady(true)
    }).subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [agencySlug])

  return (
    <>
      <style>{`
        .mon-wrap{display:flex;align-items:center;gap:12px;background:white;border-radius:12px;padding:20px;border:1px solid #E5E5E0}
        .mon-dot{width:10px;height:10px;border-radius:50%;background:#22C55E;flex-shrink:0;box-shadow:0 0 0 3px rgba(34,197,94,0.2);animation:mon-pulse 2s infinite}
        @keyframes mon-pulse{0%,100%{box-shadow:0 0 0 3px rgba(34,197,94,0.2)}50%{box-shadow:0 0 0 6px rgba(34,197,94,0.08)}}
        .mon-label{font-size:11px;color:#999;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:2px}
        .mon-value{font-size:30px;font-weight:700;color:#22C55E;line-height:1}
      `}</style>
      <div className="mon-wrap">
        <div className="mon-dot" />
        <div>
          <div className="mon-label">Online Now</div>
          <div className="mon-value">{ready ? online.toLocaleString() : '—'}</div>
        </div>
      </div>
    </>
  )
}