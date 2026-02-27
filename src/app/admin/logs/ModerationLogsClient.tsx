'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Pagination from '@/app/Pagination'

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
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  // Stats - Calculate from totalCount for accurate totals
  const stats = {
    total: totalCount,
    deletions: logs.filter(l => l.action === 'delete').length,
    hides: logs.filter(l => l.action === 'hide').length,
    shows: logs.filter(l => l.action === 'show').length
  }

  // Fetch logs for page
  const fetchPage = async (page: number) => {
    setLoading(true)
    const start = (page - 1) * itemsPerPage
    const end = start + itemsPerPage - 1

    const { data } = await supabase
      .from('moderation_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .range(start, end)

    setLogs(data || [])
    setCurrentPage(page)
    setLoading(false)
  }

  // Get action badge style
  const getActionStyle = (action: string) => {
    switch(action) {
      case 'delete':
        return { bg: '#FEE2E2', color: '#EF4444', icon: '🗑️', label: 'Delete' }
      case 'hide':
        return { bg: '#FEF3C7', color: '#F59E0B', icon: '👁️', label: 'Hide' }
      case 'show':
        return { bg: '#ECFDF5', color: '#10B981', icon: '✅', label: 'Show' }
      case 'publish':
        return { bg: '#ECFDF5', color: '#10B981', icon: '📢', label: 'Publish' }
      case 'unpublish':
        return { bg: '#FEF3C7', color: '#F59E0B', icon: '📝', label: 'Draft' }
      default:
        return { bg: '#F5F5F0', color: '#666', icon: '📋', label: action }
    }
  }

  // Get content type label
  const getContentLabel = (type: string) => {
    switch(type) {
      case 'news_feed': return { icon: '📰', label: 'News' }
      case 'reel': return { icon: '🎬', label: 'Reel' }
      case 'photo_album': return { icon: '🖼️', label: 'Album' }
      default: return { icon: '📄', label: 'Other' }
    }
  }
  return (
    <div>

      {/* ── RESPONSIVE STYLES ── */}
      <style>{`
        .ml-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }
        .ml-log-table-desktop { display: block; }
        .ml-log-cards-mobile  { display: none; }

        /* Mobile card styles */
        .ml-card {
          padding: 14px 16px;
          background: #FAFAFA;
          border-radius: 8px;
          border: 1px solid #E5E5E0;
          margin-bottom: 8px;
        }
        .ml-card-top {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 8px;
        }
        .ml-card-info { flex: 1; min-width: 0; }
        .ml-card-title {
          font-size: 13px;
          font-weight: 600;
          color: #2C2C2C;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ml-card-meta { font-size: 12px; color: #666; margin-top: 2px; }
        .ml-card-reason {
          font-size: 11px; color: #666;
          background: #F5F5F0; border-radius: 6px;
          padding: 5px 8px; margin-top: 6px;
        }
        .ml-card-date { font-size: 11px; color: #999; margin-top: 6px; }

        /* Tablet */
        @media (max-width: 1023px) {
          .ml-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
          }
        }

        /* Mobile */
        @media (max-width: 639px) {
          .ml-stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }
          .ml-log-table-desktop { display: none !important; }
          .ml-log-cards-mobile  { display: block !important; }
        }
      `}</style>

      {/* PAGE HEADER */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#2C2C2C',
          marginBottom: '8px'
        }}>
          Moderation Logs
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666'
        }}>
          Track all admin actions and content moderation history
        </p>
      </div>

      {/* STATS */}
      <div className="ml-stats-grid">
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '13px', color: '#999', fontWeight: '600', marginBottom: '8px' }}>
            Total Actions
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C' }}>
            {stats.total}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '13px', color: '#999', fontWeight: '600', marginBottom: '8px' }}>
            Deletions
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#EF4444' }}>
            {stats.deletions}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '13px', color: '#999', fontWeight: '600', marginBottom: '8px' }}>
            Hidden
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F59E0B' }}>
            {stats.hides}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '13px', color: '#999', fontWeight: '600', marginBottom: '8px' }}>
            Restored
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10B981' }}>
            {stats.shows}
          </div>
        </div>
      </div>

      {/* LOGS TABLE */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid #E5E5E0',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #E5E5E0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#2C2C2C'
          }}>
            Recent Actions
          </h2>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {logs.length === 0 ? (
          <div style={{
            padding: '80px 40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              No Moderation Logs Yet
            </div>
            <div style={{
              fontSize: '15px',
              color: '#666'
            }}>
              Admin actions will be logged here
            </div>
          </div>
        ) : (
          <div style={{ padding: '24px' }}>

            {/* ── DESKTOP: original grid rows ── */}
            <div className="ml-log-table-desktop">
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '120px 90px 1fr 140px 100px 200px',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: '#F5F5F0',
                borderRadius: '8px',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase' }}>Date</div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase' }}>Action</div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase' }}>Content</div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase' }}>Agency</div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase' }}>Admin</div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase' }}>Reason</div>
              </div>

              {/* Table Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {logs.map((log: any) => {
                  const actionStyle = getActionStyle(log.action)
                  const contentInfo = getContentLabel(log.content_type)
                  return (
                    <div
                      key={log.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '120px 90px 1fr 140px 100px 200px',
                        gap: '12px',
                        padding: '14px 16px',
                        backgroundColor: '#FAFAFA',
                        borderRadius: '8px',
                        border: '1px solid #E5E5E0',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(log.created_at).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: '2-digit' })}
                        <br />
                        <span style={{ fontSize: '11px', color: '#999' }}>
                          {new Date(log.created_at).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div>
                        <span style={{
                          padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                          backgroundColor: actionStyle.bg, color: actionStyle.color,
                          display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
                        }}>
                          <span>{actionStyle.icon}</span><span>{actionStyle.label}</span>
                        </span>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '14px' }}>{contentInfo.icon}</span>
                          <span style={{ fontSize: '12px', fontWeight: '600', color: '#2C2C2C' }}>{contentInfo.label}</span>
                        </div>
                        {log.content_title && (
                          <div style={{ fontSize: '11px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {log.content_title}
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.agency_name || '-'}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#B8936D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.admin_name || 'Admin'}
                      </div>
                      <div>
                        {log.reason ? (
                          <div style={{ fontSize: '11px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'help' }} title={log.reason}>
                            {log.reason}
                          </div>
                        ) : (
                          <div style={{ fontSize: '11px', color: '#999' }}>-</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── MOBILE: cards ── */}
            <div className="ml-log-cards-mobile">
              {logs.map((log: any) => {
                const actionStyle = getActionStyle(log.action)
                const contentInfo = getContentLabel(log.content_type)
                return (
                  <div key={log.id} className="ml-card">
                    <div className="ml-card-top">
                      <span style={{
                        padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: '700',
                        backgroundColor: actionStyle.bg, color: actionStyle.color,
                        display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap', flexShrink: 0
                      }}>
                        <span>{actionStyle.icon}</span><span>{actionStyle.label}</span>
                      </span>
                      <div className="ml-card-info">
                        <div className="ml-card-title">{contentInfo.icon} {log.content_title || contentInfo.label}</div>
                        <div className="ml-card-meta">{log.agency_name || '-'} · {log.admin_name || 'Admin'}</div>
                      </div>
                    </div>
                    {log.reason && <div className="ml-card-reason">💬 {log.reason}</div>}
                    <div className="ml-card-date">
                      {new Date(log.created_at).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {' · '}
                      {new Date(log.created_at).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        )}

        {/* PAGINATION */}
        <div style={{ padding: '24px', borderTop: '1px solid #E5E5E0' }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={fetchPage}
          />
        </div>
      </div>
    </div>
  )
}