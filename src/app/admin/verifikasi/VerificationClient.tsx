'use client'

import { useState } from 'react'
import Link from 'next/link'

interface VerificationClientProps {
  requests: any[]
  pendingCount: number
  approvedCount: number
  rejectedCount: number
}

export default function VerificationClient({
  requests,
  pendingCount,
  approvedCount,
  rejectedCount
}: VerificationClientProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const itemsPerPage = 10

  // Filter
  const filtered = statusFilter === 'all'
    ? requests
    : requests.filter(r => r.status === statusFilter)

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentRequests = filtered.slice(startIndex, startIndex + itemsPerPage)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFilter = (f: string) => {
    setStatusFilter(f)
    setCurrentPage(1)
  }

  const statusStyle = (status: string) => {
    if (status === 'pending') return { bg: '#FFF9E6', color: '#F57C00', label: '⏳ PENDING' }
    if (status === 'approved') return { bg: '#E8F5E9', color: '#2E7D32', label: '✅ APPROVED' }
    return { bg: '#FFEBEE', color: '#C62828', label: '❌ REJECTED' }
  }

  const stats = [
    { key: 'pending', icon: '⏳', label: 'Pending', value: pendingCount, color: '#F59E0B' },
    { key: 'approved', icon: '✅', label: 'Approved', value: approvedCount, color: '#10B981' },
    { key: 'rejected', icon: '❌', label: 'Rejected', value: rejectedCount, color: '#EF4444' },
  ]

  return (
    <>
      <div className="vc-page">

        {/* ── HEADER ── */}
        <div className="vc-header">
          <h1 className="vc-title">Verification Requests</h1>
          <p className="vc-subtitle">
            {filtered.length} requests {statusFilter !== 'all' ? `(${statusFilter})` : ''}
          </p>
        </div>

        {/* ── STATS ── */}
        <div className="vc-stats-grid">
          {stats.map((s) => (
            <div
              key={s.key}
              className={`vc-stat-card ${statusFilter === s.key ? 'active' : ''}`}
              onClick={() => handleFilter(statusFilter === s.key ? 'all' : s.key)}
            >
              <div className="vc-stat-label">{s.icon} {s.label}</div>
              <div className="vc-stat-value" style={{ color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── FILTER TABS ── */}
        <div className="vc-filter-tabs">
          {[
            { key: 'all', label: 'All', count: requests.length },
            { key: 'pending', label: 'Pending', count: pendingCount },
            { key: 'approved', label: 'Approved', count: approvedCount },
            { key: 'rejected', label: 'Rejected', count: rejectedCount },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`vc-filter-tab ${statusFilter === tab.key ? 'active' : ''}`}
              onClick={() => handleFilter(tab.key)}
            >
              {tab.label} <span className="vc-tab-count">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* ── LIST ── */}
        <div className="vc-list-card">
          {currentRequests.length > 0 ? (
            <div className="vc-list">
              {currentRequests.map((request: any) => {
                const s = statusStyle(request.status)
                return (
                  <Link key={request.id} href={`/admin/verifikasi/${request.id}`} className="vc-item">
                    <div className="vc-item-avatar">
                      {request.company_name.charAt(0)}
                    </div>
                    <div className="vc-item-body">
                      <div className="vc-item-name">{request.company_name}</div>
                      <div className="vc-item-license">License: {request.motac_license_number}</div>
                      <div className="vc-item-date">
                        {new Date(request.created_at).toLocaleDateString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })}
                      </div>
                    </div>
                    <div className="vc-item-right">
                      <span className="vc-item-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                      <span className="vc-item-arrow">→</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="vc-empty">
              <div className="vc-empty-icon">📋</div>
              <p className="vc-empty-text">No verification requests</p>
            </div>
          )}
        </div>

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="vc-pagination">
            <button className="vc-page-btn nav" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
              ← Prev
            </button>
            {getPageNumbers().map((page, i) =>
              page === '...' ? (
                <span key={`e-${i}`} className="vc-ellipsis">...</span>
              ) : (
                <button key={page} className={`vc-page-btn ${currentPage === page ? 'active' : ''}`} onClick={() => goToPage(page as number)}>
                  {page}
                </button>
              )
            )}
            <button className="vc-page-btn nav" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
              Next →
            </button>
          </div>
        )}
      </div>

      {/* ── STYLES ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        .vc-page { max-width: 1000px; margin: 0 auto; }

        /* Header */
        .vc-header { margin-bottom: 24px; }
        .vc-title { font-size: 28px; font-weight: 700; color: #2C2C2C; margin: 0 0 6px; }
        .vc-subtitle { font-size: 14px; color: #888; margin: 0; }

        /* Stats */
        .vc-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
        .vc-stat-card {
          background: white; border-radius: 12px; padding: 18px; border: 2px solid #E5E5E0;
          cursor: pointer; transition: all 0.2s;
        }
        .vc-stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .vc-stat-card.active { border-color: #B8936D; }
        .vc-stat-label { font-size: 13px; color: #888; margin-bottom: 6px; }
        .vc-stat-value { font-size: 30px; font-weight: 700; }

        /* Filter tabs */
        .vc-filter-tabs {
          display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap;
        }
        .vc-filter-tab {
          padding: 8px 16px; border: 1px solid #E5E5E0; border-radius: 20px;
          background: white; font-size: 13px; font-weight: 600; color: #666;
          cursor: pointer; transition: all 0.15s;
        }
        .vc-filter-tab:hover { border-color: #B8936D; color: #B8936D; }
        .vc-filter-tab.active { background: #B8936D; color: white; border-color: #B8936D; }
        .vc-tab-count { margin-left: 4px; opacity: 0.7; }

        /* List */
        .vc-list-card { background: white; border-radius: 12px; border: 1px solid #E5E5E0; padding: 16px; }
        .vc-list { display: flex; flex-direction: column; gap: 10px; }
        .vc-item {
          display: flex; align-items: center; gap: 16px; padding: 16px;
          background: #FAFAF8; border-radius: 10px; text-decoration: none;
          border: 2px solid transparent; transition: all 0.2s;
        }
        .vc-item:hover { border-color: #B8936D; background: #F5F5F0; }
        .vc-item-avatar {
          width: 48px; height: 48px; border-radius: 10px; background: #B8936D;
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 20px; font-weight: 700; flex-shrink: 0;
        }
        .vc-item-body { flex: 1; min-width: 0; }
        .vc-item-name { font-size: 16px; font-weight: 600; color: #2C2C2C; margin-bottom: 3px; }
        .vc-item-license { font-size: 13px; color: #666; margin-bottom: 2px; }
        .vc-item-date { font-size: 12px; color: #aaa; }
        .vc-item-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
        .vc-item-badge { padding: 5px 14px; border-radius: 16px; font-size: 12px; font-weight: 700; white-space: nowrap; }
        .vc-item-arrow { font-size: 20px; color: #B8936D; }

        /* Empty */
        .vc-empty { text-align: center; padding: 48px 20px; }
        .vc-empty-icon { font-size: 48px; margin-bottom: 12px; }
        .vc-empty-text { font-size: 15px; color: #888; }

        /* Pagination */
        .vc-pagination { display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 24px; flex-wrap: wrap; }
        .vc-page-btn {
          padding: 8px 14px; border: 1px solid #E5E5E0; border-radius: 8px;
          background: white; font-size: 13px; font-weight: 600; color: #2C2C2C;
          cursor: pointer; min-width: 40px; transition: all 0.15s;
        }
        .vc-page-btn:hover:not(:disabled) { border-color: #B8936D; color: #B8936D; }
        .vc-page-btn.active { background: #B8936D; color: white; border-color: #B8936D; }
        .vc-page-btn.nav { background: #B8936D; color: white; border: none; min-width: auto; }
        .vc-page-btn.nav:disabled { background: #E5E5E0; color: #999; cursor: not-allowed; }
        .vc-ellipsis { padding: 0 6px; color: #999; font-size: 14px; }

        /* ── RESPONSIVE ── */
        @media (max-width: 767px) {
          .vc-stats-grid { grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .vc-stat-card { padding: 14px; }
          .vc-stat-value { font-size: 24px; }
          .vc-title { font-size: 22px; }
          .vc-list-card { padding: 10px; }
          .vc-item { flex-wrap: wrap; gap: 12px; padding: 14px; }
          .vc-item-avatar { width: 42px; height: 42px; font-size: 18px; }
          .vc-item-name { font-size: 15px; }
          .vc-item-right { width: 100%; justify-content: space-between; padding-top: 4px; border-top: 1px solid #eee; }
          .vc-item-arrow { display: none; }
          .vc-filter-tabs { gap: 4px; }
          .vc-filter-tab { padding: 6px 12px; font-size: 12px; }
        }

        @media (max-width: 480px) {
          .vc-stats-grid { grid-template-columns: 1fr; }
          .vc-stat-card { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; }
          .vc-stat-label { margin-bottom: 0; }
          .vc-stat-value { font-size: 22px; }
          .vc-page-btn { padding: 8px 10px; font-size: 12px; min-width: 34px; }
        }
      `}} />
    </>
  )
}