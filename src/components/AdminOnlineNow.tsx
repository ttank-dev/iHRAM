'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminOnlineNow() {
  const [online, setOnline] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel('ihram_online')
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      setOnline(Object.keys(state).length)
      setReady(true)
    }).subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  if (!ready) return (
    <div className="aon-wrap">
      <div className="aon-dot" />
      <div>
        <div className="aon-value">—</div>
        <div className="aon-label">Online Now</div>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        .aon-wrap{display:flex;align-items:center;gap:12px;background:white;border-radius:12px;padding:20px;border:1px solid #E5E5E0}
        .aon-dot{width:10px;height:10px;border-radius:50%;background:#22C55E;flex-shrink:0;box-shadow:0 0 0 3px rgba(34,197,94,0.2);animation:aon-pulse 2s infinite}
        @keyframes aon-pulse{0%,100%{box-shadow:0 0 0 3px rgba(34,197,94,0.2)}50%{box-shadow:0 0 0 6px rgba(34,197,94,0.08)}}
        .aon-label{font-size:11px;color:#999;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:2px}
        .aon-value{font-size:30px;font-weight:700;color:#22C55E;line-height:1}
      `}</style>
      <div className="aon-wrap">
        <div className="aon-dot" />
        <div>
          <div className="aon-label">Online Now</div>
          <div className="aon-value">{online.toLocaleString()}</div>
        </div>
      </div>
    </>
  )
}