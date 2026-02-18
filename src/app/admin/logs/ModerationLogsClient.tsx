'use client'

import { useState, useEffect } from 'react'
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
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20
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

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showEllipsisStart = currentPage > 3
    const showEllipsisEnd = currentPage < totalPages - 2

    pages.push(1)

    if (showEllipsisStart) {
      pages.push('...')
    }

    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i)
      }
    }

    if (showEllipsisEnd) {
      pages.push('...')
    }

    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  return (
    <div>
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
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
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase' }}>
                Date
              </div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase' }}>
                Action
              </div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase' }}>
                Content
              </div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase' }}>
                Agency
              </div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase' }}>
                Admin
              </div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#666', textTransform: 'uppercase' }}>
                Reason
              </div>
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
                    {/* Timestamp */}
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(log.created_at).toLocaleDateString('ms-MY', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit'
                      })}
                      <br />
                      <span style={{ fontSize: '11px', color: '#999' }}>
                        {new Date(log.created_at).toLocaleTimeString('ms-MY', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Action Badge */}
                    <div>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        backgroundColor: actionStyle.bg,
                        color: actionStyle.color,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        whiteSpace: 'nowrap'
                      }}>
                        <span>{actionStyle.icon}</span>
                        <span>{actionStyle.label}</span>
                      </span>
                    </div>

                    {/* Content */}
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        marginBottom: '2px'
                      }}>
                        <span style={{ fontSize: '14px' }}>{contentInfo.icon}</span>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#2C2C2C'
                        }}>
                          {contentInfo.label}
                        </span>
                      </div>
                      {log.content_title && (
                        <div style={{
                          fontSize: '11px',
                          color: '#666',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {log.content_title}
                        </div>
                      )}
                    </div>

                    {/* Agency */}
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {log.agency_name || '-'}
                    </div>

                    {/* Admin */}
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#B8936D',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {log.admin_name || 'Admin'}
                    </div>

                    {/* Reason */}
                    <div>
                      {log.reason ? (
                        <div style={{
                          fontSize: '11px',
                          color: '#666',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'help'
                        }}
                        title={log.reason}
                        >
                          {log.reason}
                        </div>
                      ) : (
                        <div style={{ fontSize: '11px', color: '#999' }}>
                          -
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div style={{
            padding: '24px',
            borderTop: '1px solid #E5E5E0',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px'
          }}>
            {/* Previous Button */}
            <button
              onClick={() => fetchPage(currentPage - 1)}
              disabled={currentPage === 1 || loading}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === 1 ? '#F5F5F0' : 'white',
                color: currentPage === 1 ? '#999' : '#2C2C2C',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ← Prev
            </button>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} style={{
                  padding: '8px 12px',
                  color: '#999',
                  fontSize: '14px'
                }}>
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => fetchPage(page as number)}
                  disabled={loading}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: currentPage === page ? '#B8936D' : 'white',
                    color: currentPage === page ? 'white' : '#2C2C2C',
                    border: currentPage === page ? 'none' : '1px solid #E5E5E0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    minWidth: '40px'
                  }}
                >
                  {page}
                </button>
              )
            ))}

            {/* Next Button */}
            <button
              onClick={() => fetchPage(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
              style={{
                padding: '8px 16px',
                backgroundColor: currentPage === totalPages ? '#F5F5F0' : 'white',
                color: currentPage === totalPages ? '#999' : '#2C2C2C',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}