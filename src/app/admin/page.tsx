'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import LicenseExpiryAlerts from './LicenseExpiryAlerts'

interface DashboardStats {
  totalAgencies: number
  totalPackages: number
  totalReviews: number
  pendingReviews: number
  pendingVerifications: number
  totalLeads: number
  totalGuides: number
  recentLeads: any[]
  recentReviews: any[]
  recentVerifications: any[]
}

export default function AdminDashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState<DashboardStats>({
    totalAgencies: 0,
    totalPackages: 0,
    totalReviews: 0,
    pendingReviews: 0,
    pendingVerifications: 0,
    totalLeads: 0,
    totalGuides: 0,
    recentLeads: [],
    recentReviews: [],
    recentVerifications: []
  })

  const [loading, setLoading] = useState(true)
  const [adminName, setAdminName] = useState('')

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // Fetch admin name from admin_roles table
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: adminRole } = await supabase
          .from('admin_roles')
          .select('name')
          .eq('user_id', user.id)
          .single()
        // Fallback: name from admin_roles → email prefix → 'Admin'
        const name = adminRole?.name || user.email?.split('@')[0] || 'Admin'
        setAdminName(name)
      }

      // Run all queries in parallel for speed
      const [
        { count: totalAgencies },
        { count: totalPackages },
        { count: totalReviews },
        { count: pendingReviews },
        { count: totalLeads },
        { count: totalGuides },
        { data: verifications },
        { data: recentReviewsData },
        { data: recentLeadsData },
      ] = await Promise.all([
        // Total active agencies
        supabase.from('agencies').select('*', { count: 'exact', head: true }).eq('is_active', true),
        // Total published packages
        supabase.from('packages').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        // Total approved reviews
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', true),
        // Pending reviews
        supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('is_approved', false),
        // Total leads
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        // Total published guides
        supabase.from('guides').select('*', { count: 'exact', head: true }).eq('is_published', true),
        // Recent pending verifications
        supabase
          .from('verification_requests')
          .select('*, agencies(id, name, logo_url)')
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(3),
        // Recent pending reviews
        supabase
          .from('reviews')
          .select('id, reviewer_name, rating, packages(title)')
          .eq('is_approved', false)
          .order('created_at', { ascending: false })
          .limit(3),
        // Recent leads
        supabase
          .from('leads')
          .select('id, created_at, packages(title), agencies(name)')
          .order('created_at', { ascending: false })
          .limit(3),
      ])

      setStats({
        totalAgencies: totalAgencies || 0,
        totalPackages: totalPackages || 0,
        totalReviews: totalReviews || 0,
        pendingReviews: pendingReviews || 0,
        pendingVerifications: verifications?.length || 0,
        totalLeads: totalLeads || 0,
        totalGuides: totalGuides || 0,
        recentVerifications: verifications?.map(v => ({
          id: v.id,
          company: v.company_name,
          agency: v.agencies?.name || 'Unknown',
          license: v.motac_license_number,
          timestamp: new Date(v.created_at).toLocaleDateString('en-MY')
        })) || [],
        recentReviews: recentReviewsData?.map(r => ({
          id: r.id,
          reviewer: r.reviewer_name || 'Anonymous',
          rating: r.rating || 0,
          package: (r.packages as any)?.title || '-',
          status: 'pending'
        })) || [],
        recentLeads: recentLeadsData?.map(l => ({
          id: l.id,
          package: (l.packages as any)?.title || 'Unknown Package',
          agency: (l.agencies as any)?.name || 'Unknown Agency',
          timestamp: new Date(l.created_at).toLocaleDateString('en-MY', { day: '2-digit', month: 'short' })
        })) || [],
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { title: 'Pending Verifications', value: stats.pendingVerifications, icon: '✅', color: '#06B6D4', link: '/admin/verifikasi', change: 'Perlu review' },
    { title: 'Total Agencies', value: stats.totalAgencies, icon: '🏢', color: '#3B82F6', link: '/admin/agensi', change: 'Aktif' },
    { title: 'Umrah Packages', value: stats.totalPackages, icon: '📦', color: '#8B5CF6', link: '/admin/pakej', change: 'Published' },
    { title: 'Total Reviews', value: stats.totalReviews, icon: '⭐', color: '#F59E0B', link: '/admin/ulasan', change: `${stats.pendingReviews} pending` },
    { title: 'WhatsApp Leads', value: stats.totalLeads, icon: '🎯', color: '#10B981', link: '/admin/leads', change: 'All time' },
    { title: 'Guides', value: stats.totalGuides, icon: '📚', color: '#B8936D', link: '/admin/panduan', change: 'Published' },
  ]

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="ad-loading">
        <div className="ad-loading-spinner" />
        <p className="ad-loading-text">Loading dashboard...</p>
        <style dangerouslySetInnerHTML={{ __html: `
          .ad-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:400px; gap:16px; }
          .ad-loading-spinner { width:40px; height:40px; border:3px solid #e5e5e5; border-top-color:#B8936D; border-radius:50%; animation:adspin .8s linear infinite; }
          .ad-loading-text { font-size:14px; color:#999; font-weight:500; }
          @keyframes adspin { to { transform:rotate(360deg); } }
        `}} />
      </div>
    )
  }

  return (
    <>
      <div className="ad-page">

        {/* ── HEADER ── */}
        <div className="ad-header">
          <div>
            <h1 className="ad-title">Dashboard Overview</h1>
            <p className="ad-subtitle">Welcome back, <strong>{adminName || 'Admin'}</strong>! Here's your iHRAM overview.</p>
          </div>
        </div>

        {/* ── LICENSE ALERTS ── */}
        <div className="ad-license-section">
          <LicenseExpiryAlerts />
        </div>

        {/* ── STATS GRID ── */}
        <div className="ad-stats-grid">
          {statCards.map((card, index) => (
            <Link key={index} href={card.link} className="ad-stat-card">
              <div className="ad-stat-top">
                <div className="ad-stat-icon" style={{ background: `${card.color}12` }}>
                  {card.icon}
                </div>
                <span className="ad-stat-change" style={{ color: card.color, background: `${card.color}10` }}>
                  {card.change}
                </span>
              </div>
              <div className="ad-stat-label">{card.title}</div>
              <div className="ad-stat-value">{card.value.toLocaleString()}</div>
            </Link>
          ))}
        </div>

        {/* ── THREE COLUMN: VERIFICATIONS / REVIEWS / LEADS ── */}
        <div className="ad-panels-grid">

          {/* Pending Verifications */}
          <div className="ad-panel">
            <div className="ad-panel-header">
              <h2 className="ad-panel-title">✅ Pending Verifications</h2>
              <Link href="/admin/verifikasi" className="ad-panel-link">View All →</Link>
            </div>
            {stats.recentVerifications.length > 0 ? (
              <div className="ad-panel-list">
                {stats.recentVerifications.map((v) => (
                  <div key={v.id} className="ad-panel-item verif">
                    <div className="ad-item-title">{v.company}</div>
                    <div className="ad-item-sub">License: {v.license}</div>
                    <div className="ad-item-meta">{v.timestamp}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ad-panel-empty">
                <div className="ad-empty-icon">✅</div>
                <div className="ad-empty-text">All caught up!</div>
              </div>
            )}
          </div>

          {/* Pending Reviews */}
          <div className="ad-panel">
            <div className="ad-panel-header">
              <h2 className="ad-panel-title">⏳ Pending Reviews</h2>
              <Link href="/admin/ulasan?status=pending" className="ad-panel-link">View All →</Link>
            </div>
            {stats.recentReviews.length > 0 ? (
              <div className="ad-panel-list">
                {stats.recentReviews.map((review) => (
                  <div key={review.id} className="ad-panel-item review">
                    <div className="ad-review-top">
                      <div className="ad-item-title">{review.reviewer}</div>
                      <div className="ad-review-stars">
                        {[1,2,3,4,5].map(s => (
                          <span key={s} style={{ color: s <= review.rating ? '#F59E0B' : '#ddd' }}>★</span>
                        ))}
                      </div>
                    </div>
                    <div className="ad-item-sub">{review.package}</div>
                    <div className="ad-review-actions">
                      <button className="ad-btn-approve">✓ Approve</button>
                      <button className="ad-btn-reject">✕ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ad-panel-empty">
                <div className="ad-empty-icon">✅</div>
                <div className="ad-empty-text">All caught up!</div>
              </div>
            )}
          </div>

          {/* Recent Leads */}
          <div className="ad-panel">
            <div className="ad-panel-header">
              <h2 className="ad-panel-title">🎯 Recent Leads</h2>
              <Link href="/admin/leads" className="ad-panel-link">View All →</Link>
            </div>
            {stats.recentLeads.length > 0 ? (
              <div className="ad-panel-list">
                {stats.recentLeads.map((lead) => (
                  <div key={lead.id} className="ad-panel-item lead">
                    <div className="ad-item-title">{lead.package}</div>
                    <div className="ad-item-sub">{lead.agency}</div>
                    <div className="ad-item-meta">{lead.timestamp}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ad-panel-empty">
                <div className="ad-empty-icon">📭</div>
                <div className="ad-empty-text">No recent leads</div>
              </div>
            )}
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="ad-actions-section">
          <h2 className="ad-section-title">Quick Actions</h2>
          <div className="ad-actions-grid">
            {[
              { href: '/admin/verifikasi', icon: '✅', label: 'Review Verifications', badge: stats.pendingVerifications, accent: '#06B6D4' },
              { href: '/admin/panduan/new', icon: '📝', label: 'New Guide', badge: 0, accent: '#B8936D' },
              { href: '/admin/agensi', icon: '🏢', label: 'Manage Agencies', badge: 0, accent: '#3B82F6' },
              { href: '/admin/ulasan?status=pending', icon: '⏳', label: 'Review Reviews', badge: stats.pendingReviews, accent: '#F59E0B' },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="ad-action-card">
                {action.badge > 0 && <span className="ad-action-badge">{action.badge}</span>}
                <div className="ad-action-icon">{action.icon}</div>
                <div className="ad-action-label">{action.label}</div>
              </Link>
            ))}
          </div>
        </div>

      </div>

      {/* ── STYLES ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        .ad-page { max-width: 1200px; margin: 0 auto; }

        /* ── Header ── */
        .ad-header { margin-bottom: 24px; }
        .ad-title { font-size: 28px; font-weight: 700; color: #2C2C2C; margin: 0 0 6px; }
        .ad-subtitle { font-size: 15px; color: #888; margin: 0; }
        .ad-license-section { margin-bottom: 28px; }

        /* ── Stats ── */
        .ad-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        .ad-stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          text-decoration: none;
          border: 1px solid #E5E5E0;
          transition: all 0.2s ease;
          display: block;
        }
        .ad-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.07);
        }
        .ad-stat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .ad-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .ad-stat-change {
          font-size: 11px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 10px;
        }
        .ad-stat-label { font-size: 13px; color: #888; font-weight: 500; margin-bottom: 6px; }
        .ad-stat-value { font-size: 32px; font-weight: 700; color: #2C2C2C; line-height: 1; }

        /* ── Panels (3 col) ── */
        .ad-panels-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        .ad-panel {
          background: white;
          border-radius: 12px;
          padding: 20px;
          border: 1px solid #E5E5E0;
          display: flex;
          flex-direction: column;
        }
        .ad-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .ad-panel-title { font-size: 16px; font-weight: 700; color: #2C2C2C; margin: 0; }
        .ad-panel-link { font-size: 13px; color: #B8936D; text-decoration: none; font-weight: 600; white-space: nowrap; }
        .ad-panel-link:hover { text-decoration: underline; }
        .ad-panel-list { display: flex; flex-direction: column; gap: 8px; flex: 1; }

        .ad-panel-item {
          padding: 12px;
          border-radius: 8px;
          border-left: 3px solid transparent;
          transition: background 0.15s;
        }
        .ad-panel-item.verif { background: #E0F2FE; border-left-color: #06B6D4; }
        .ad-panel-item.review { background: #FFF7ED; border-left-color: #F59E0B; }
        .ad-panel-item.lead { background: #F5F5F0; border-left-color: #10B981; }
        .ad-panel-item:hover { filter: brightness(0.97); }

        .ad-item-title { font-size: 14px; font-weight: 600; color: #2C2C2C; margin-bottom: 3px; }
        .ad-item-sub { font-size: 12px; color: #666; margin-bottom: 3px; }
        .ad-item-meta { font-size: 11px; color: #999; }

        .ad-review-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .ad-review-stars { font-size: 13px; letter-spacing: 1px; }
        .ad-review-actions { display: flex; gap: 6px; margin-top: 8px; }
        .ad-btn-approve {
          padding: 4px 12px; background: #10B981; color: white; border: none;
          border-radius: 4px; font-size: 11px; font-weight: 600; cursor: pointer;
          transition: background 0.15s;
        }
        .ad-btn-approve:hover { background: #059669; }
        .ad-btn-reject {
          padding: 4px 12px; background: transparent; color: #EF4444;
          border: 1px solid #EF4444; border-radius: 4px; font-size: 11px;
          font-weight: 600; cursor: pointer; transition: all 0.15s;
        }
        .ad-btn-reject:hover { background: #FEE2E2; }

        .ad-panel-empty { padding: 32px; text-align: center; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .ad-empty-icon { font-size: 28px; margin-bottom: 8px; }
        .ad-empty-text { font-size: 13px; color: #999; }

        /* ── Quick Actions ── */
        .ad-actions-section {
          background: white;
          border-radius: 12px;
          padding: 24px;
          border: 1px solid #E5E5E0;
        }
        .ad-section-title { font-size: 18px; font-weight: 700; color: #2C2C2C; margin: 0 0 20px; }
        .ad-actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .ad-action-card {
          padding: 20px;
          background: #F5F5F0;
          border-radius: 10px;
          text-decoration: none;
          text-align: center;
          transition: all 0.2s;
          position: relative;
        }
        .ad-action-card:hover {
          background: #B8936D;
          transform: translateY(-2px);
        }
        .ad-action-card:hover .ad-action-icon { transform: scale(1.15); }
        .ad-action-card:hover .ad-action-label { color: white; }
        .ad-action-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #EF4444;
          color: white;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 10px;
          min-width: 20px;
          text-align: center;
        }
        .ad-action-icon { font-size: 28px; margin-bottom: 8px; transition: transform 0.2s; }
        .ad-action-label { font-size: 14px; font-weight: 600; color: #2C2C2C; transition: color 0.2s; }

        /* ── RESPONSIVE ── */

        @media (max-width: 1023px) {
          .ad-stats-grid { grid-template-columns: repeat(3, 1fr); gap: 12px; }
          .ad-panels-grid { grid-template-columns: 1fr; }
          .ad-actions-grid { grid-template-columns: repeat(4, 1fr); }
          .ad-title { font-size: 24px; }
        }

        @media (max-width: 767px) {
          .ad-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .ad-stat-card { padding: 16px; }
          .ad-stat-value { font-size: 26px; }
          .ad-stat-icon { width: 38px; height: 38px; font-size: 18px; }
          .ad-actions-grid { grid-template-columns: repeat(2, 1fr); }
          .ad-action-card { padding: 16px; }
          .ad-title { font-size: 22px; }
          .ad-panel { padding: 16px; }
        }

        @media (max-width: 480px) {
          .ad-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .ad-actions-grid { grid-template-columns: repeat(2, 1fr); }
          .ad-stat-change { display: none; }
        }
      `}} />
    </>
  )
}