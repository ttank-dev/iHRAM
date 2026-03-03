'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  online: number
  today: number
  week: number
  month: number
  total: number
}

export default function VisitorStats() {
  const [stats, setStats] = useState<Stats>({ online: 0, today: 0, week: 0, month: 0, total: 0 })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    const fetchStats = async () => {
      const now = new Date()
      const todayStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const weekStart   = new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000).toISOString()
      const monthStart  = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const [todayRes, weekRes, monthRes, totalRes] = await Promise.all([
        supabase.from('visitor_stats').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
        supabase.from('visitor_stats').select('id', { count: 'exact', head: true }).gte('created_at', weekStart),
        supabase.from('visitor_stats').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
        supabase.from('visitor_stats').select('id', { count: 'exact', head: true }),
      ])

      setStats(prev => ({
        ...prev,
        today: todayRes.count || 0,
        week:  weekRes.count  || 0,
        month: monthRes.count || 0,
        total: totalRes.count || 0,
      }))
      setLoaded(true)
    }

    fetchStats()

    // Realtime online count via presence
    const channel = supabase.channel('ihram_online')
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      setStats(prev => ({ ...prev, online: Object.keys(state).length }))
    }).subscribe()

    // Refresh stats every 60s
    const interval = setInterval(fetchStats, 60000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(interval)
    }
  }, [])

  if (!loaded) return null

  const items = [
    { label: 'Online Now', value: stats.online, dot: true },
    { label: 'Today',      value: stats.today },
    { label: '7 Days',     value: stats.week },
    { label: 'Monthly',    value: stats.month },
    { label: 'Total',      value: stats.total },
  ]

  return (
    <>
      <style>{`
        .vs-wrap{display:flex;flex-wrap:wrap;gap:16px 24px;align-items:center}
        .vs-item{display:flex;flex-direction:column;align-items:center;gap:2px}
        .vs-label{font-size:10px;color:rgba(255,255,255,0.45);font-weight:600;text-transform:uppercase;letter-spacing:0.8px;white-space:nowrap}
        .vs-value{font-size:15px;font-weight:700;color:rgba(255,255,255,0.85);display:flex;align-items:center;gap:5px}
        .vs-dot{width:7px;height:7px;border-radius:50%;background:#22C55E;flex-shrink:0;animation:vs-pulse 2s infinite}
        .vs-divider{width:1px;height:28px;background:rgba(255,255,255,0.12)}
        @keyframes vs-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.85)}}
        @media(max-width:639px){
          .vs-wrap{gap:12px 16px}
          .vs-value{font-size:13px}
          .vs-label{font-size:9px}
        }
      `}</style>
      <div className="vs-wrap">
        {items.map((item, i) => (
          <>
            {i > 0 && <div key={`d${i}`} className="vs-divider" />}
            <div key={item.label} className="vs-item">
              <div className="vs-value">
                {item.dot && <span className="vs-dot" />}
                {item.value.toLocaleString()}
              </div>
              <div className="vs-label">{item.label}</div>
            </div>
          </>
        ))}
      </div>
    </>
  )
}