'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = sessionStorage.getItem('ihram_sid')
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem('ihram_sid', sid)
  }
  return sid
}

const EXCLUDED = ['/admin', '/merchant', '/api']

export function useVisitorTrack() {
  useEffect(() => {
    const path = window.location.pathname

    // Skip admin, merchant, api routes
    if (EXCLUDED.some(p => path.startsWith(p))) return

    const supabase = createClient()
    const sessionId = getSessionId()
    if (!sessionId) return

    // Insert visit via API route (captures real IP server-side)
    const trackKey = `ihram_tracked_${path}`
    if (!sessionStorage.getItem(trackKey)) {
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_path: path,
          session_id: sessionId,
        }),
      }).then(() => sessionStorage.setItem(trackKey, '1'))
    }

    // Realtime presence for "online now"
    const channel = supabase.channel('ihram_online', {
      config: { presence: { key: sessionId } }
    })
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: new Date().toISOString(), page_path: path })
      }
    })

    return () => { supabase.removeChannel(channel) }
  }, [])
}