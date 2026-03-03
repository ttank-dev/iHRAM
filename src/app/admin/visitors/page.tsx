import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function VisitorStatsPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin/login')

  const supabase = await createClient()

  const now = new Date()
  const todayStart   = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart    = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart   = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()

  const [todayRes, weekRes, monthRes, prevMonthRes, totalRes, recentRes, pageRes] = await Promise.all([
    supabase.from('visitor_stats').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    supabase.from('visitor_stats').select('id', { count: 'exact', head: true }).gte('created_at', weekStart),
    supabase.from('visitor_stats').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
    supabase.from('visitor_stats').select('id', { count: 'exact', head: true }).gte('created_at', prevMonthStart).lt('created_at', monthStart),
    supabase.from('visitor_stats').select('id', { count: 'exact', head: true }),
    supabase.from('visitor_stats').select('created_at, page_path, session_id, ip_address').order('created_at', { ascending: false }).limit(200),
    supabase.from('visitor_stats').select('page_path').gte('created_at', weekStart),
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

  const pageCounts: Record<string, number> = {}
  pageVisits.forEach((v: any) => {
    const p = v.page_path || '/'
    pageCounts[p] = (pageCounts[p] || 0) + 1
  })
  const topPages = Object.entries(pageCounts).sort(([,a],[,b]) => b-a).slice(0,8)

  const dailyMap: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    dailyMap[d.toISOString().split('T')[0]] = 0
  }
  recentVisits.forEach((v: any) => {
    const day = new Date(v.created_at).toISOString().split('T')[0]
    if (day in dailyMap) dailyMap[day]++
  })
  const dailyData = Object.entries(dailyMap).map(([date, count]) => ({
    date, count,
    label: new Date(date).toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short' })
  }))
  const maxDaily = Math.max(...dailyData.map(d => d.count), 1)

  const fmt     = (d: string) => new Date(d).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' })

  return (
    <div>
      <style>{`
        .vs-page,.vs-page *{box-sizing:border-box}
        .vs-page{max-width:1100px}
        .vs-title{font-size:28px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .vs-sub{font-size:14px;color:#888;margin:0 0 24px}

        .vs-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
        .vs-stat{background:white;border-radius:12px;padding:20px;border:1px solid #E5E5E0}
        .vs-stat-icon{font-size:22px;margin-bottom:8px}
        .vs-stat-label{font-size:11px;color:#999;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px}
        .vs-stat-value{font-size:30px;font-weight:700;line-height:1}
        .vs-stat-change{font-size:12px;margin-top:6px;font-weight:600}
        .vs-up{color:#10B981}.vs-down{color:#EF4444}.vs-neutral{color:#999}

        .vs-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
        .vs-card{background:white;border-radius:12px;border:1px solid #E5E5E0;overflow:hidden}
        .vs-card-head{padding:14px 18px;border-bottom:1px solid #E5E5E0;display:flex;justify-content:space-between;align-items:center}
        .vs-card-title{font-size:14px;font-weight:700;color:#2C2C2C;margin:0}
        .vs-card-sub{font-size:12px;color:#999}
        .vs-card-body{padding:18px}

        .vs-chart{display:flex;align-items:flex-end;gap:6px;height:110px}
        .vs-bar-wrap{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;height:100%}
        .vs-bar-col{flex:1;display:flex;align-items:flex-end;width:100%}
        .vs-bar{width:100%;background:#B8936D;border-radius:3px 3px 0 0;min-height:2px}
        .vs-bar-label{font-size:9px;color:#aaa;text-align:center;white-space:nowrap}
        .vs-bar-count{font-size:10px;font-weight:700;color:#2C2C2C;text-align:center;min-height:14px}

        .vs-pg-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #f0f0ec}
        .vs-pg-row:last-child{border-bottom:none}
        .vs-pg-rank{width:20px;height:20px;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0}
        .vs-pg-path{font-size:12px;font-weight:600;color:#2C2C2C;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .vs-pg-bar-wrap{width:60px;height:5px;background:#F0F0EC;border-radius:3px;flex-shrink:0}
        .vs-pg-bar{height:100%;background:#B8936D;border-radius:3px}
        .vs-pg-count{font-size:12px;font-weight:700;color:#B8936D;min-width:28px;text-align:right;flex-shrink:0}

        .vs-table-wrap{background:white;border-radius:12px;border:1px solid #E5E5E0;overflow:hidden}
        .vs-table-head{padding:14px 18px;border-bottom:1px solid #E5E5E0;display:flex;justify-content:space-between;align-items:center}
        .vs-table-title{font-size:14px;font-weight:700;color:#2C2C2C}
        .vs-table-count{font-size:12px;color:#999}
        .vs-scroll{overflow-x:auto}
        .vs-table{width:100%;border-collapse:collapse}
        .vs-thead{background:#F9F9F7;border-bottom:1px solid #E5E5E0}
        .vs-th{padding:10px 16px;text-align:left;font-size:11px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:0.8px;white-space:nowrap}
        .vs-tr{border-bottom:1px solid #F0F0EC}
        .vs-tr:last-child{border-bottom:none}
        .vs-tr:hover{background:#FAFAFA}
        .vs-td{padding:11px 16px;font-size:13px;color:#2C2C2C}
        .vs-td-gray{color:#999}
        .vs-path{display:inline-block;padding:2px 8px;background:#F5F5F0;border-radius:4px;font-size:11px;font-family:monospace;color:#555;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle}
        .vs-sid{font-family:monospace;font-size:11px;color:#aaa}

        .vs-mob-list{display:none;flex-direction:column;gap:8px;padding:12px}
        .vs-mob-card{background:#F9F9F7;border-radius:8px;padding:11px;border:1px solid #E5E5E0}
        .vs-mob-top{margin-bottom:6px}
        .vs-mob-footer{display:flex;justify-content:space-between;font-size:11px;color:#999}

        .vs-empty{padding:40px;text-align:center;color:#aaa;font-size:14px}

        @media(max-width:1023px){
          .vs-title{font-size:24px}
          .vs-stats{grid-template-columns:repeat(2,1fr);gap:10px}
          .vs-stat-value{font-size:24px}
          .vs-row{grid-template-columns:1fr}
        }
        @media(max-width:639px){
          .vs-title{font-size:20px}
          .vs-sub{font-size:13px}
          .vs-stats{gap:8px;margin-bottom:14px}
          .vs-stat{padding:12px}
          .vs-stat-value{font-size:20px}
          .vs-card-body{padding:12px}
          .vs-scroll .vs-table{display:none}
          .vs-mob-list{display:flex}
          .vs-table-head{padding:12px 14px}
        }
        @media(max-width:380px){
          .vs-stats{grid-template-columns:1fr 1fr}
        }
      `}</style>

      <div className="vs-page">
        <h1 className="vs-title">Visitor Statistics</h1>
        <p className="vs-sub">Traffic and engagement across the platform</p>

        <div className="vs-stats">
          {([
            { icon: '📅', label: 'Today',       value: todayCount,  color: '#2C2C2C' },
            { icon: '📈', label: 'Last 7 Days',  value: weekCount,   color: '#3B82F6' },
            { icon: '🗓️', label: 'This Month',   value: monthCount,  color: '#B8936D', change: monthChange },
            { icon: '🎯', label: 'Total Visits', value: totalCount,  color: '#10B981' },
          ] as any[]).map((s, i) => (
            <div key={i} className="vs-stat">
              <div className="vs-stat-icon">{s.icon}</div>
              <div className="vs-stat-label">{s.label}</div>
              <div className="vs-stat-value" style={{ color: s.color }}>{s.value.toLocaleString()}</div>
              {s.change != null && (
                <div className={`vs-stat-change ${s.change > 0 ? 'vs-up' : s.change < 0 ? 'vs-down' : 'vs-neutral'}`}>
                  {s.change > 0 ? `↑ ${s.change}%` : s.change < 0 ? `↓ ${Math.abs(s.change)}%` : '→ 0%'} vs last month
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="vs-row">
          {/* Daily Chart */}
          <div className="vs-card">
            <div className="vs-card-head">
              <h3 className="vs-card-title">Daily Visits</h3>
              <span className="vs-card-sub">Last 7 days</span>
            </div>
            <div className="vs-card-body">
              <div className="vs-chart">
                {dailyData.map(d => (
                  <div key={d.date} className="vs-bar-wrap">
                    <div className="vs-bar-count">{d.count > 0 ? d.count : ''}</div>
                    <div className="vs-bar-col">
                      <div className="vs-bar" style={{ height: `${Math.round((d.count / maxDaily) * 100)}%` }} />
                    </div>
                    <div className="vs-bar-label">{d.label.split(' ')[0]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Pages */}
          <div className="vs-card">
            <div className="vs-card-head">
              <h3 className="vs-card-title">Top Pages</h3>
              <span className="vs-card-sub">Last 7 days</span>
            </div>
            <div className="vs-card-body">
              {topPages.length === 0
                ? <div className="vs-empty">No data yet</div>
                : topPages.map(([path, count], i) => (
                  <div key={path} className="vs-pg-row">
                    <div className="vs-pg-rank" style={{ background: i === 0 ? '#B8936D' : '#F0F0EC', color: i === 0 ? 'white' : '#666' }}>{i + 1}</div>
                    <div className="vs-pg-path" title={path}>{path}</div>
                    <div className="vs-pg-bar-wrap">
                      <div className="vs-pg-bar" style={{ width: `${Math.round((count / (topPages[0][1] as number)) * 100)}%` }} />
                    </div>
                    <div className="vs-pg-count">{count}</div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Recent Visits */}
        <div className="vs-table-wrap">
          <div className="vs-table-head">
            <div className="vs-table-title">Recent Visits</div>
            <div className="vs-table-count">{recentVisits.length} records</div>
          </div>
          {recentVisits.length === 0 ? (
            <div className="vs-empty">
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>📊</div>
              No visits recorded yet
            </div>
          ) : (
            <div className="vs-scroll">
              <table className="vs-table">
                <thead className="vs-thead">
                  <tr>
                    <th className="vs-th">Date</th>
                    <th className="vs-th">Time</th>
                    <th className="vs-th">Page</th>
                    <th className="vs-th">IP Address</th>
                    <th className="vs-th">Session</th>
                  </tr>
                </thead>
                <tbody>
                  {recentVisits.map((v: any, i: number) => (
                    <tr key={`${v.session_id}-${i}`} className="vs-tr">
                      <td className="vs-td">{fmt(v.created_at)}</td>
                      <td className="vs-td vs-td-gray">{fmtTime(v.created_at)}</td>
                      <td className="vs-td"><span className="vs-path">{v.page_path || '/'}</span></td>
                      <td className="vs-td vs-td-gray" style={{fontFamily:'monospace',fontSize:'11px'}}>{v.ip_address || '—'}</td>
                      <td className="vs-td"><span className="vs-sid">{v.session_id?.slice(0, 10) || '—'}…</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="vs-mob-list">
                {recentVisits.map((v: any, i: number) => (
                  <div key={`m-${v.session_id}-${i}`} className="vs-mob-card">
                    <div className="vs-mob-top"><span className="vs-path">{v.page_path || '/'}</span></div>
                    <div className="vs-mob-footer">
                      <span>{fmt(v.created_at)} · {fmtTime(v.created_at)}</span>
                      <span className="vs-sid">{v.ip_address || v.session_id?.slice(0, 8) || '—'}</span>
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