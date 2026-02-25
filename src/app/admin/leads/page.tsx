import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LeadsPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  const supabase = await createClient()
  const { data: leads } = await supabase
    .from('leads')
    .select(`*, packages:package_id (title, slug), agencies:agency_id (name)`)
    .order('created_at', { ascending: false })

  const safeLeads = Array.isArray(leads) ? leads : []
  const totalLeads = safeLeads.length
  const todayLeads = safeLeads.filter(lead => {
    const today = new Date().toISOString().split('T')[0]
    return new Date(lead.created_at).toISOString().split('T')[0] === today
  }).length
  const last7DaysLeads = safeLeads.filter(lead => {
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return new Date(lead.created_at) >= sevenDaysAgo
  }).length
  const leadsBySource = safeLeads.reduce((acc: any, lead) => {
    const source = lead.source || 'unknown'; acc[source] = (acc[source] || 0) + 1; return acc
  }, {})
  const leadsByPackage = safeLeads.reduce((acc: any, lead) => {
    if (lead.packages) { const t = lead.packages.title; acc[t] = (acc[t] || 0) + 1 }; return acc
  }, {})
  const topPackages = Object.entries(leadsByPackage).sort(([,a]:any,[,b]:any) => b-a).slice(0,5)

  return (
    <div>
      <style>{`
        /* Header */
        .lp-title { font-size: 32px; font-weight: bold; color: #2C2C2C; margin-bottom: 8px; }
        .lp-sub { font-size: 16px; color: #666; margin-bottom: 32px; }

        /* Stats */
        .lp-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px; }
        .lp-stat { background: white; border-radius: 16px; padding: 24px; border: 1px solid #E5E5E0; }
        .lp-stat-inner { display: flex; align-items: center; gap: 16px; }
        .lp-stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
        .lp-stat-label { font-size: 13px; color: #999; font-weight: 600; margin-bottom: 4px; }
        .lp-stat-value { font-size: 32px; font-weight: bold; }

        /* Top packages */
        .lp-top { background: white; border-radius: 16px; padding: 24px; border: 1px solid #E5E5E0; margin-bottom: 24px; }
        .lp-top-title { font-size: 20px; font-weight: bold; color: #2C2C2C; margin-bottom: 20px; }
        .lp-pkg-row { display: flex; align-items: center; gap: 16px; padding: 16px; background: #F5F5F0; border-radius: 12px; margin-bottom: 12px; }
        .lp-pkg-rank { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: bold; flex-shrink: 0; }
        .lp-pkg-title { font-size: 15px; font-weight: 600; color: #2C2C2C; flex: 1; min-width: 0; }
        .lp-pkg-count { padding: 6px 16px; background: white; border-radius: 8px; font-size: 14px; font-weight: bold; color: #B8936D; white-space: nowrap; }

        /* Table */
        .lp-table-wrap { background: white; border-radius: 16px; border: 1px solid #E5E5E0; overflow: hidden; }
        .lp-table-header { padding: 24px; border-bottom: 1px solid #E5E5E0; }
        .lp-table-title { font-size: 20px; font-weight: bold; color: #2C2C2C; }
        .lp-table-scroll { overflow-x: auto; }
        .lp-table { width: 100%; border-collapse: collapse; }
        .lp-thead { background: #F5F5F0; border-bottom: 1px solid #E5E5E0; }
        .lp-th { padding: 16px 24px; text-align: left; font-size: 13px; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
        .lp-th-center { text-align: center; }
        .lp-tr { border-bottom: 1px solid #E5E5E0; }
        .lp-td { padding: 20px 24px; }
        .lp-td-center { padding: 20px 24px; text-align: center; }
        .lp-date-main { font-size: 15px; font-weight: 600; color: #2C2C2C; margin-bottom: 4px; }
        .lp-date-time { font-size: 13px; color: #999; }

        /* Mobile cards */
        .lp-mobile-list { display: none; flex-direction: column; gap: 12px; padding: 16px; }
        .lp-mobile-card { background: #F9F9F7; border-radius: 10px; padding: 16px; border: 1px solid #E5E5E0; }
        .lp-mobile-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px; }
        .lp-mobile-label { font-size: 12px; color: #999; font-weight: 600; margin-bottom: 2px; }
        .lp-mobile-value { font-size: 14px; font-weight: 600; color: #2C2C2C; }
        .lp-mobile-sub { font-size: 13px; color: #666; }
        .lp-mobile-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid #E5E5E0; }

        /* Empty */
        .lp-empty { padding: 60px 24px; text-align: center; }

        /* ── TABLET ── */
        @media (max-width: 1023px) {
          .lp-title { font-size: 26px; }
          .lp-stats { grid-template-columns: repeat(2, 1fr); gap: 14px; }
          .lp-stat { padding: 18px; }
          .lp-stat-value { font-size: 26px; }
          .lp-th, .lp-td, .lp-td-center { padding: 12px 16px; }
        }

        /* ── MOBILE ── */
        @media (max-width: 639px) {
          .lp-title { font-size: 22px; }
          .lp-sub { font-size: 14px; margin-bottom: 20px; }

          .lp-stats { grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
          .lp-stat { padding: 14px; }
          .lp-stat-icon { width: 36px; height: 36px; font-size: 18px; }
          .lp-stat-label { font-size: 11px; }
          .lp-stat-value { font-size: 22px; }

          .lp-top { padding: 16px; }
          .lp-pkg-row { padding: 12px; gap: 10px; }
          .lp-pkg-title { font-size: 13px; }
          .lp-pkg-count { padding: 4px 10px; font-size: 13px; }

          .lp-table-scroll .lp-table { display: none; }
          .lp-mobile-list { display: flex; }
          .lp-table-header { padding: 16px; }
        }
      `}</style>

      {/* Header */}
      <h1 className="lp-title">Leads Analytics</h1>
      <p className="lp-sub">Track WhatsApp clicks and user engagement</p>

      {/* Stats */}
      <div className="lp-stats">
        <div className="lp-stat">
          <div className="lp-stat-inner">
            <div className="lp-stat-icon" style={{ backgroundColor: '#F5F5F0' }}>🎯</div>
            <div><div className="lp-stat-label">Total Leads</div><div className="lp-stat-value" style={{ color: '#2C2C2C' }}>{totalLeads}</div></div>
          </div>
        </div>
        <div className="lp-stat">
          <div className="lp-stat-inner">
            <div className="lp-stat-icon" style={{ backgroundColor: '#ECFDF5' }}>📅</div>
            <div><div className="lp-stat-label">Today</div><div className="lp-stat-value" style={{ color: '#10B981' }}>{todayLeads}</div></div>
          </div>
        </div>
        <div className="lp-stat">
          <div className="lp-stat-inner">
            <div className="lp-stat-icon" style={{ backgroundColor: '#EFF6FF' }}>📈</div>
            <div><div className="lp-stat-label">Last 7 Days</div><div className="lp-stat-value" style={{ color: '#3B82F6' }}>{last7DaysLeads}</div></div>
          </div>
        </div>
        <div className="lp-stat">
          <div className="lp-stat-inner">
            <div className="lp-stat-icon" style={{ backgroundColor: '#F0FDF4' }}>💬</div>
            <div><div className="lp-stat-label">WhatsApp</div><div className="lp-stat-value" style={{ color: '#22C55E' }}>{leadsBySource['whatsapp_click'] || 0}</div></div>
          </div>
        </div>
      </div>

      {/* Top Packages */}
      {topPackages.length > 0 && (
        <div className="lp-top">
          <div className="lp-top-title">🏆 Top Performing Packages</div>
          {topPackages.map(([title, count]: any, index) => (
            <div key={title} className="lp-pkg-row">
              <div className="lp-pkg-rank" style={{ backgroundColor: index === 0 ? '#B8936D' : '#E5E5E0', color: index === 0 ? 'white' : '#666' }}>
                {index + 1}
              </div>
              <div className="lp-pkg-title">{title}</div>
              <div className="lp-pkg-count">{count} leads</div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Leads */}
      <div className="lp-table-wrap">
        <div className="lp-table-header">
          <div className="lp-table-title">Recent Leads</div>
        </div>

        {safeLeads.length === 0 ? (
          <div className="lp-empty">
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎯</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>No Leads Yet</div>
            <div style={{ fontSize: '15px', color: '#666' }}>Leads will appear here when users click WhatsApp buttons</div>
          </div>
        ) : (
          <div className="lp-table-scroll">
            {/* Desktop Table */}
            <table className="lp-table">
              <thead className="lp-thead">
                <tr>
                  <th className="lp-th">Date & Time</th>
                  <th className="lp-th">Package</th>
                  <th className="lp-th">Agency</th>
                  <th className="lp-th lp-th-center">Source</th>
                  <th className="lp-th">Ref Code</th>
                </tr>
              </thead>
              <tbody>
                {safeLeads.map((lead: any) => (
                  <tr key={lead.id} className="lp-tr">
                    <td className="lp-td">
                      <div className="lp-date-main">
                        {new Date(lead.created_at).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="lp-date-time">
                        {new Date(lead.created_at).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="lp-td"><div style={{ fontSize: '15px', fontWeight: '600', color: '#2C2C2C' }}>{lead.packages?.title || '-'}</div></td>
                    <td className="lp-td"><div style={{ fontSize: '14px', color: '#666' }}>{lead.agencies?.name || '-'}</div></td>
                    <td className="lp-td-center">
                      <span style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', backgroundColor: '#F0FDF4', color: '#22C55E' }}>
                        💬 WhatsApp
                      </span>
                    </td>
                    <td className="lp-td">
                      <code style={{ fontSize: '12px', color: '#666', backgroundColor: '#F5F5F0', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                        {lead.ref_code || '-'}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="lp-mobile-list">
              {safeLeads.map((lead: any) => (
                <div key={lead.id} className="lp-mobile-card">
                  <div className="lp-mobile-row">
                    <div>
                      <div className="lp-mobile-label">Package</div>
                      <div className="lp-mobile-value">{lead.packages?.title || '-'}</div>
                      <div className="lp-mobile-sub">{lead.agencies?.name || '-'}</div>
                    </div>
                    <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', backgroundColor: '#F0FDF4', color: '#22C55E', flexShrink: 0 }}>
                      💬 WA
                    </span>
                  </div>
                  <div className="lp-mobile-footer">
                    <div style={{ fontSize: '13px', color: '#999' }}>
                      {new Date(lead.created_at).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {' · '}
                      {new Date(lead.created_at).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <code style={{ fontSize: '11px', color: '#666', backgroundColor: '#F5F5F0', padding: '3px 6px', borderRadius: '4px' }}>
                      {lead.ref_code || '-'}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}