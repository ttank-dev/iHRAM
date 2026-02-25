'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ModerationLogsClient({
  initialLogs,
  totalCount
}: {
  initialLogs: any[]
  totalCount: number
}) {
  const supabase = createClient()
  const [logs, setLogs] = useState(initialLogs)
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  const stats = {
    total: totalCount,
    deletions: logs.filter(l => l.action === 'delete').length,
    hides: logs.filter(l => l.action === 'hide').length,
    shows: logs.filter(l => l.action === 'show').length
  }

  const fetchPage = async (page: number) => {
    setLoading(true)
    const start = (page - 1) * itemsPerPage
    const { data } = await supabase.from('moderation_logs').select('*').order('created_at', { ascending: false }).range(start, start + itemsPerPage - 1)
    setLogs(data || [])
    setCurrentPage(page)
    setLoading(false)
  }

  const getActionStyle = (action: string) => {
    switch (action) {
      case 'delete': return { bg: '#FEE2E2', color: '#EF4444', icon: '🗑️', label: 'Delete' }
      case 'hide': return { bg: '#FEF3C7', color: '#F59E0B', icon: '👁️', label: 'Hide' }
      case 'show': return { bg: '#ECFDF5', color: '#10B981', icon: '✅', label: 'Show' }
      case 'publish': return { bg: '#ECFDF5', color: '#10B981', icon: '📢', label: 'Publish' }
      case 'unpublish': return { bg: '#FEF3C7', color: '#F59E0B', icon: '📝', label: 'Draft' }
      default: return { bg: '#F5F5F0', color: '#666', icon: '📋', label: action }
    }
  }

  const getContentLabel = (type: string) => {
    switch (type) {
      case 'news_feed': return { icon: '📰', label: 'News' }
      case 'reel': return { icon: '🎬', label: 'Reel' }
      case 'photo_album': return { icon: '🖼️', label: 'Album' }
      default: return { icon: '📄', label: 'Other' }
    }
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i !== 1 && i !== totalPages) pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('...')
    if (totalPages > 1) pages.push(totalPages)
    return pages
  }

  return (
    <div>
      <style>{`
        .ml-title { font-size: 32px; font-weight: bold; color: #2C2C2C; margin-bottom: 8px; }
        .ml-sub { font-size: 16px; color: #666; margin-bottom: 32px; }

        /* Stats */
        .ml-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px; }
        .ml-stat { background: white; border-radius: 16px; padding: 24px; border: 1px solid #E5E5E0; }
        .ml-stat-label { font-size: 13px; color: #999; font-weight: 600; margin-bottom: 8px; }
        .ml-stat-value { font-size: 32px; font-weight: bold; }

        /* Wrap */
        .ml-wrap { background: white; border-radius: 16px; border: 1px solid #E5E5E0; overflow: hidden; }
        .ml-wrap-header { padding: 24px; border-bottom: 1px solid #E5E5E0; display: flex; justify-content: space-between; align-items: center; }
        .ml-wrap-title { font-size: 20px; font-weight: bold; color: #2C2C2C; }
        .ml-page-info { font-size: 14px; color: #666; }

        /* Desktop grid rows */
        .ml-body { padding: 24px; }
        .ml-row-header {
          display: grid;
          grid-template-columns: 110px 90px 1fr 140px 100px 180px;
          gap: 12px; padding: 12px 16px;
          background: #F5F5F0; border-radius: 8px; margin-bottom: 16px;
        }
        .ml-col-label { font-size: 11px; font-weight: 700; color: #666; text-transform: uppercase; }
        .ml-rows { display: flex; flex-direction: column; gap: 8px; }
        .ml-row {
          display: grid;
          grid-template-columns: 110px 90px 1fr 140px 100px 180px;
          gap: 12px; padding: 14px 16px;
          background: #FAFAFA; border-radius: 8px;
          border: 1px solid #E5E5E0; align-items: center;
        }
        .ml-ts-date { font-size: 12px; color: #666; }
        .ml-ts-time { font-size: 11px; color: #999; }
        .ml-badge { padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
        .ml-content-type { display: flex; align-items: center; gap: 6px; margin-bottom: 2px; }
        .ml-content-title { font-size: 11px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ml-agency { font-size: 12px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ml-admin { font-size: 12px; font-weight: 600; color: #B8936D; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ml-reason { font-size: 11px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: help; }

        /* Mobile cards — hidden on desktop */
        .ml-mobile-cards { display: none; flex-direction: column; gap: 10px; padding: 16px; }
        .ml-mcard { background: #FAFAFA; border-radius: 10px; padding: 14px; border: 1px solid #E5E5E0; }
        .ml-mcard-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px; }
        .ml-mcard-content { flex: 1; min-width: 0; }
        .ml-mcard-title { font-size: 13px; font-weight: 600; color: #2C2C2C; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ml-mcard-agency { font-size: 12px; color: #666; margin-top: 2px; }
        .ml-mcard-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #E5E5E0; }
        .ml-mcard-date { font-size: 11px; color: #999; }
        .ml-mcard-reason { font-size: 11px; color: #666; font-style: italic; margin-top: 4px; }

        /* Pagination */
        .ml-pagination { padding: 20px 24px; border-top: 1px solid #E5E5E0; display: flex; justify-content: center; align-items: center; gap: 8px; flex-wrap: wrap; }
        .ml-pg-btn { padding: 8px 16px; background: white; color: #2C2C2C; border: 1px solid #E5E5E0; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .ml-pg-btn:disabled { background: #F5F5F0; color: #999; cursor: not-allowed; }
        .ml-pg-num { padding: 8px 12px; background: white; color: #2C2C2C; border: 1px solid #E5E5E0; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; min-width: 40px; text-align: center; }
        .ml-pg-num-active { background: #B8936D !important; color: white !important; border: none !important; }

        /* Empty */
        .ml-empty { padding: 60px 24px; text-align: center; }

        /* ── TABLET ── */
        @media (max-width: 1023px) {
          .ml-title { font-size: 26px; }
          .ml-stats { grid-template-columns: repeat(2, 1fr); gap: 14px; }
          .ml-stat { padding: 18px; }
          .ml-stat-value { font-size: 26px; }
          .ml-row-header, .ml-row {
            grid-template-columns: 100px 80px 1fr 120px 80px;
          }
          /* Hide reason column on tablet */
          .ml-row-header > :last-child, .ml-row > :last-child { display: none; }
        }

        /* ── MOBILE ── */
        @media (max-width: 639px) {
          .ml-title { font-size: 22px; }
          .ml-sub { font-size: 14px; margin-bottom: 20px; }

          .ml-stats { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 20px; }
          .ml-stat { padding: 14px; }
          .ml-stat-label { font-size: 12px; margin-bottom: 4px; }
          .ml-stat-value { font-size: 24px; }

          .ml-wrap-header { padding: 16px; flex-direction: column; align-items: flex-start; gap: 4px; }

          /* Hide desktop rows, show mobile cards */
          .ml-body { display: none; }
          .ml-mobile-cards { display: flex; }

          .ml-pagination { padding: 16px; gap: 6px; }
          .ml-pg-btn { padding: 8px 12px; font-size: 13px; }
          .ml-pg-num { padding: 8px 10px; font-size: 13px; min-width: 36px; }
        }
      `}</style>

      <h1 className="ml-title">Moderation Logs</h1>
      <p className="ml-sub">Track all admin actions and content moderation history</p>

      {/* Stats */}
      <div className="ml-stats">
        <div className="ml-stat"><div className="ml-stat-label">Total Actions</div><div className="ml-stat-value" style={{ color: '#2C2C2C' }}>{stats.total}</div></div>
        <div className="ml-stat"><div className="ml-stat-label">Deletions</div><div className="ml-stat-value" style={{ color: '#EF4444' }}>{stats.deletions}</div></div>
        <div className="ml-stat"><div className="ml-stat-label">Hidden</div><div className="ml-stat-value" style={{ color: '#F59E0B' }}>{stats.hides}</div></div>
        <div className="ml-stat"><div className="ml-stat-label">Restored</div><div className="ml-stat-value" style={{ color: '#10B981' }}>{stats.shows}</div></div>
      </div>

      {/* Logs Table */}
      <div className="ml-wrap">
        <div className="ml-wrap-header">
          <div className="ml-wrap-title">Recent Actions</div>
          <div className="ml-page-info">Page {currentPage} of {totalPages}</div>
        </div>

        {logs.length === 0 ? (
          <div className="ml-empty">
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📋</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>No Moderation Logs Yet</div>
            <div style={{ fontSize: '15px', color: '#666' }}>Admin actions will be logged here</div>
          </div>
        ) : (
          <>
            {/* Desktop rows */}
            <div className="ml-body">
              <div className="ml-row-header">
                <div className="ml-col-label">Date</div>
                <div className="ml-col-label">Action</div>
                <div className="ml-col-label">Content</div>
                <div className="ml-col-label">Agency</div>
                <div className="ml-col-label">Admin</div>
                <div className="ml-col-label">Reason</div>
              </div>
              <div className="ml-rows">
                {logs.map((log: any) => {
                  const a = getActionStyle(log.action)
                  const c = getContentLabel(log.content_type)
                  return (
                    <div key={log.id} className="ml-row">
                      <div>
                        <div className="ml-ts-date">
                          {new Date(log.created_at).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: '2-digit' })}
                        </div>
                        <div className="ml-ts-time">
                          {new Date(log.created_at).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div>
                        <span className="ml-badge" style={{ backgroundColor: a.bg, color: a.color }}>
                          <span>{a.icon}</span><span>{a.label}</span>
                        </span>
                      </div>
                      <div>
                        <div className="ml-content-type">
                          <span style={{ fontSize: '14px' }}>{c.icon}</span>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#2C2C2C' }}>{c.label}</span>
                        </div>
                        {log.content_title && <div className="ml-content-title">{log.content_title}</div>}
                      </div>
                      <div className="ml-agency">{log.agency_name || '-'}</div>
                      <div className="ml-admin">{log.admin_name || 'Admin'}</div>
                      <div>
                        {log.reason
                          ? <div className="ml-reason" title={log.reason}>{log.reason}</div>
                          : <div style={{ fontSize: '11px', color: '#999' }}>-</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Mobile cards */}
            <div className="ml-mobile-cards">
              {logs.map((log: any) => {
                const a = getActionStyle(log.action)
                const c = getContentLabel(log.content_type)
                return (
                  <div key={log.id} className="ml-mcard">
                    <div className="ml-mcard-top">
                      <div className="ml-mcard-content">
                        <div className="ml-mcard-title">
                          {c.icon} {log.content_title || c.label}
                        </div>
                        <div className="ml-mcard-agency">{log.agency_name || '-'} · {log.admin_name || 'Admin'}</div>
                      </div>
                      <span className="ml-badge" style={{ backgroundColor: a.bg, color: a.color, flexShrink: 0 }}>
                        <span>{a.icon}</span><span>{a.label}</span>
                      </span>
                    </div>
                    {log.reason && <div className="ml-mcard-reason">"{log.reason}"</div>}
                    <div className="ml-mcard-footer">
                      <div className="ml-mcard-date">
                        {new Date(log.created_at).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {' · '}
                        {new Date(log.created_at).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="ml-pagination">
            <button className="ml-pg-btn" onClick={() => fetchPage(currentPage - 1)} disabled={currentPage === 1 || loading}>← Prev</button>
            {getPageNumbers().map((page, index) =>
              page === '...' ? (
                <span key={`e-${index}`} style={{ padding: '8px 4px', color: '#999', fontSize: '14px' }}>...</span>
              ) : (
                <button key={page} onClick={() => fetchPage(page as number)} disabled={loading}
                  className={`ml-pg-num${currentPage === page ? ' ml-pg-num-active' : ''}`}>
                  {page}
                </button>
              )
            )}
            <button className="ml-pg-btn" onClick={() => fetchPage(currentPage + 1)} disabled={currentPage === totalPages || loading}>Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}