import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MerchantOnlineNow from '@/components/MerchantOnlineNow'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MerchantVisitorStatsPage() {
  const supabase = await createClient()

  // Get current merchant's agency_id
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/merchant/login')

  const { data: agency } = await supabase
    .from('agencies')
    .select('id, name, slug')
    .eq('user_id', user.id)
    .single()

  if (!agency) redirect('/merchant/dashboard')

  const agencyId = agency.id
  const TZ = 'Asia/Kuala_Lumpur'
  const now = new Date()
  const todayStart     = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart      = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart     = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

  const [todayRes, weekRes, monthRes, prevMonthRes, totalRes, recentRes, pageRes] = await Promise.all([
    supabase.from('visitor_stats').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId).gte('created_at', todayStart),
    supabase.from('visitor_stats').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId).gte('created_at', weekStart),
    supabase.from('visitor_stats').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId).gte('created_at', monthStart),
    supabase.from('visitor_stats').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId).gte('created_at', prevMonthStart).lt('created_at', monthStart),
    supabase.from('visitor_stats').select('id', { count: 'exact', head: true }).eq('agency_id', agencyId),
    supabase.from('visitor_stats').select('created_at, page_path, session_id, ip_address, city, region').eq('agency_id', agencyId).order('created_at', { ascending: false }).limit(100),
    supabase.from('visitor_stats').select('page_path').eq('agency_id', agencyId).gte('created_at', weekStart),
  ])

  const todayCount     = todayRes.count     || 0
  const weekCount      = weekRes.count      || 0
  const monthCount     = monthRes.count     || 0
  const prevMonthCount = prevMonthRes.count || 0
  const totalCount     = totalRes.count     || 0
  const recentVisits   = recentRes.data     || []
  const pageVisits     = pageRes.data       || []

  const monthChange = prevMonthCount > 0
    ? Math.round(((monthCount - prevMonthCount) / prevMonthCount) * 100)
    : null

  // Top pages
  const pageCounts: Record<string, number> = {}
  pageVisits.forEach((v: any) => {
    const p = v.page_path || '/'
    pageCounts[p] = (pageCounts[p] || 0) + 1
  })
  const topPages = Object.entries(pageCounts).sort(([,a],[,b]) => b-a).slice(0,6)

  // Daily chart — last 7 days
  const dailyMap: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString('en-CA', { timeZone: TZ })
    dailyMap[key] = 0
  }
  recentVisits.forEach((v: any) => {
    const day = new Date(v.created_at).toLocaleDateString('en-CA', { timeZone: TZ })
    if (day in dailyMap) dailyMap[day]++
  })
  const dailyData = Object.entries(dailyMap).map(([date, count]) => ({
    date, count,
    label: new Date(date + 'T00:00:00+08:00').toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ })
  }))
  const maxDaily = Math.max(...dailyData.map(d => d.count), 1)

  const fmt     = (d: string) => new Date(d).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric', timeZone: TZ })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', timeZone: TZ })

  return (
    <div>
      <style>{`
        .mvs-page,.mvs-page *{box-sizing:border-box}
        .mvs-page{width:100%}
        .mvs-title{font-size:28px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .mvs-sub{font-size:14px;color:#888;margin:0 0 24px}

        .mvs-stats{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;margin-bottom:20px}
        .mvs-stat{background:white;border-radius:12px;padding:20px;border:1px solid #E5E5E0}
        .mvs-stat-icon{font-size:22px;margin-bottom:8px}
        .mvs-stat-label{font-size:11px;color:#999;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px}
        .mvs-stat-value{font-size:30px;font-weight:700;line-height:1}
        .mvs-stat-change{font-size:12px;margin-top:6px;font-weight:600}
        .mvs-up{color:#10B981}.mvs-down{color:#EF4444}.mvs-neutral{color:#999}

        .mvs-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
        .mvs-card{background:white;border-radius:12px;border:1px solid #E5E5E0;overflow:hidden}
        .mvs-card-head{padding:14px 18px;border-bottom:1px solid #E5E5E0;display:flex;justify-content:space-between;align-items:center}
        .mvs-card-title{font-size:14px;font-weight:700;color:#2C2C2C;margin:0}
        .mvs-card-sub{font-size:12px;color:#999}
        .mvs-card-body{padding:18px}

        .mvs-chart{display:flex;align-items:flex-end;gap:6px;height:110px}
        .mvs-bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%}
        .mvs-bar-col{flex:1;display:flex;align-items:flex-end;width:100%}
        .mvs-bar{width:100%;background:#B8936D;border-radius:3px 3px 0 0;min-height:2px}
        .mvs-bar-label{font-size:9px;color:#aaa;text-align:center;white-space:nowrap}
        .mvs-bar-count{font-size:10px;font-weight:700;color:#2C2C2C;text-align:center;min-height:14px}

        .mvs-pg-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #f0f0ec}
        .mvs-pg-row:last-child{border-bottom:none}
        .mvs-pg-rank{width:20px;height:20px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0}
        .mvs-pg-path{font-size:12px;font-weight:600;color:#2C2C2C;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .mvs-pg-bar-wrap{width:60px;height:5px;background:#F0F0EC;border-radius:3px;flex-shrink:0}
        .mvs-pg-bar{height:100%;background:#B8936D;border-radius:3px}
        .mvs-pg-count{font-size:12px;font-weight:700;color:#B8936D;min-width:28px;text-align:right;flex-shrink:0}

        .mvs-table-wrap{background:white;border-radius:12px;border:1px solid #E5E5E0;overflow:hidden;margin-bottom:16px}
        .mvs-table-head{padding:14px 18px;border-bottom:1px solid #E5E5E0;display:flex;justify-content:space-between;align-items:center}
        .mvs-table-title{font-size:14px;font-weight:700;color:#2C2C2C}
        .mvs-table-count{font-size:12px;color:#999}
        .mvs-scroll{overflow-x:auto}
        .mvs-table{width:100%;border-collapse:collapse}
        .mvs-thead{background:#F9F9F7;border-bottom:1px solid #E5E5E0}
        .mvs-th{padding:10px 14px;text-align:left;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.7px;white-space:nowrap}
        .mvs-tr{border-bottom:1px solid #F0F0EC}
        .mvs-tr:last-child{border-bottom:none}
        .mvs-tr:hover{background:#FAFAFA}
        .mvs-td{padding:10px 14px;font-size:12px;color:#2C2C2C}
        .mvs-td-gray{color:#999}
        .mvs-path{display:inline-block;padding:2px 7px;background:#F5F5F0;border-radius:4px;font-size:11px;font-family:monospace;color:#555;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle}
        .mvs-loc{font-size:11px;color:#666}

        .mvs-mob-list{display:none;flex-direction:column;gap:8px;padding:12px}
        .mvs-mob-card{background:#F9F9F7;border-radius:8px;padding:11px;border:1px solid #E5E5E0}
        .mvs-mob-loc{font-size:11px;color:#888;margin-top:3px}
        .mvs-mob-footer{display:flex;justify-content:space-between;font-size:11px;color:#999;margin-top:6px;padding-top:6px;border-top:1px solid #E5E5E0}

        .mvs-empty{padding:40px;text-align:center;color:#aaa;font-size:14px}
        .mvs-notice{background:#FFF9E6;border:1px solid #F59E0B;border-radius:10px;padding:12px 16px;font-size:13px;color:#92400E;margin-bottom:20px}

        @media(max-width:1023px){
          .mvs-title{font-size:24px}
          .mvs-stats{grid-template-columns:repeat(3,1fr);gap:10px}
          .mvs-stat-value{font-size:24px}
          .mvs-row{grid-template-columns:1fr}
        }
        @media(max-width:639px){
          .mvs-title{font-size:20px}
          .mvs-stats{grid-template-columns:repeat(2,1fr);gap:8px}
          .mvs-stat{padding:12px}
          .mvs-stat-value{font-size:20px}
          .mvs-card-body{padding:12px}
          .mvs-scroll .mvs-table{display:none}
          .mvs-mob-list{display:flex}
        }
      `}</style>

      <div className="mvs-page">
        <h1 className="mvs-title">Visitor Statistics</h1>
        <p className="mvs-sub">Visitors to your agency profile and packages · UTC+8</p>

        <div className="mvs-notice">
          📊 Showing visits to <strong>{agency.name}</strong> — agency profile page and all your package detail pages only.
        </div>

        {/* Stats */}
        <div className="mvs-stats">
          <MerchantOnlineNow agencySlug={agency.slug} />
          {([
            { icon: '📅', label: 'Today',       value: todayCount,  color: '#2C2C2C' },
            { icon: '📈', label: 'Last 7 Days',  value: weekCount,   color: '#3B82F6' },
            { icon: '🗓️', label: 'This Month',   value: monthCount,  color: '#B8936D', change: monthChange },
            { icon: '🎯', label: 'Total Visits', value: totalCount,  color: '#10B981' },
          ] as any[]).map((s, i) => (
            <div key={i} className="mvs-stat">
              <div className="mvs-stat-icon">{s.icon}</div>
              <div className="mvs-stat-label">{s.label}</div>
              <div className="mvs-stat-value" style={{ color: s.color }}>{s.value.toLocaleString()}</div>
              {s.change != null && (
                <div className={`mvs-stat-change ${s.change > 0 ? 'mvs-up' : s.change < 0 ? 'mvs-down' : 'mvs-neutral'}`}>
                  {s.change > 0 ? `↑ ${s.change}%` : s.change < 0 ? `↓ ${Math.abs(s.change)}%` : '→ 0%'} vs last month
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Daily Chart + Top Pages */}
        <div className="mvs-row">
          <div className="mvs-card">
            <div className="mvs-card-head">
              <h3 className="mvs-card-title">Daily Visits</h3>
              <span className="mvs-card-sub">Last 7 days</span>
            </div>
            <div className="mvs-card-body">
              <div className="mvs-chart">
                {dailyData.map(d => (
                  <div key={d.date} className="mvs-bar-wrap">
                    <div className="mvs-bar-count">{d.count > 0 ? d.count : ''}</div>
                    <div className="mvs-bar-col">
                      <div className="mvs-bar" style={{ height: `${Math.round((d.count / maxDaily) * 100)}%` }} />
                    </div>
                    <div className="mvs-bar-label">{d.label.split(' ')[0]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mvs-card">
            <div className="mvs-card-head">
              <h3 className="mvs-card-title">Top Pages</h3>
              <span className="mvs-card-sub">Last 7 days</span>
            </div>
            <div className="mvs-card-body">
              {topPages.length === 0
                ? <div className="mvs-empty">No data yet</div>
                : topPages.map(([path, count], i) => (
                  <div key={path} className="mvs-pg-row">
                    <div className="mvs-pg-rank" style={{ background: i === 0 ? '#B8936D' : '#F0F0EC', color: i === 0 ? 'white' : '#666' }}>{i + 1}</div>
                    <div className="mvs-pg-path" title={path}>{path}</div>
                    <div className="mvs-pg-bar-wrap">
                      <div className="mvs-pg-bar" style={{ width: `${Math.round((count / (topPages[0][1] as number)) * 100)}%` }} />
                    </div>
                    <div className="mvs-pg-count">{count}</div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Recent Visits */}
        <div className="mvs-table-wrap">
          <div className="mvs-table-head">
            <div className="mvs-table-title">Recent Visitors</div>
            <div className="mvs-table-count">{recentVisits.length} records</div>
          </div>
          {recentVisits.length === 0 ? (
            <div className="mvs-empty">
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>👥</div>
              No visitors yet — share your profile to get started!
            </div>
          ) : (
            <div className="mvs-scroll">
              <table className="mvs-table">
                <thead className="mvs-thead">
                  <tr>
                    <th className="mvs-th">Date</th>
                    <th className="mvs-th">Time</th>
                    <th className="mvs-th">Page</th>
                    <th className="mvs-th">City</th>
                    <th className="mvs-th">State</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVisits.map((v: any, i: number) => (
                    <tr key={`${v.session_id}-${i}`} className="mvs-tr">
                      <td className="mvs-td">{fmt(v.created_at)}</td>
                      <td className="mvs-td mvs-td-gray">{fmtTime(v.created_at)}</td>
                      <td className="mvs-td"><span className="mvs-path">{v.page_path || '/'}</span></td>
                      <td className="mvs-td mvs-loc">{v.city   || '—'}</td>
                      <td className="mvs-td mvs-loc">{v.region || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mvs-mob-list">
                {recentVisits.map((v: any, i: number) => (
                  <div key={`m-${v.session_id}-${i}`} className="mvs-mob-card">
                    <span className="mvs-path">{v.page_path || '/'}</span>
                    <div className="mvs-mob-loc">
                      📍 {[v.city, v.region].filter(Boolean).join(', ') || 'Location unknown'}
                    </div>
                    <div className="mvs-mob-footer">
                      <span>{fmt(v.created_at)} · {fmtTime(v.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}