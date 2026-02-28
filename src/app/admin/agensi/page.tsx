'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'

interface Agency {
  id: string
  name: string
  slug: string
  logo_url: string | null
  cover_url: string | null
  about: string | null
  ssm_number: string | null
  phone: string | null
  email: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  is_verified: boolean
  is_active: boolean
  user_id: string
  created_at: string
  license_status: string | null
  motac_license_expiry: string | null
  packages?: { count: number }[]
  reviews?: { count: number }[]
}

/* ── ActionButtons: TOP-LEVEL, pure CSS — same system as pakej page ── */
function ActionButtons({ agency, onToggleVerify, onRevokeVerify, onToggleActive, onDelete }: {
  agency: Agency
  onToggleVerify: (id: string, current: boolean) => void
  onRevokeVerify: (id: string, name: string) => void
  onToggleActive: (id: string, current: boolean) => void
  onDelete: (id: string, name: string) => void
}) {
  return (
    <div className="aa-actions">
      <Link href={'/agensi/' + agency.slug} target="_blank" className="aa-btn aa-btn-slate">
        👁 View
      </Link>
      {agency.is_verified ? (
        <button className="aa-btn aa-btn-amber" onClick={() => onRevokeVerify(agency.id, agency.name)}>
          ✕ Revoke
        </button>
      ) : (
        <button className="aa-btn aa-btn-green" onClick={() => onToggleVerify(agency.id, agency.is_verified)}>
          ✓ Verify
        </button>
      )}
      <button
        className={'aa-btn ' + (agency.is_active ? 'aa-btn-purple' : 'aa-btn-green')}
        onClick={() => onToggleActive(agency.id, agency.is_active)}
      >
        {agency.is_active ? '⏸ Suspend' : '▶ Activate'}
      </button>
      <button className="aa-btn aa-btn-red" onClick={() => onDelete(agency.id, agency.name)}>
        🗑 Delete
      </button>
    </div>
  )
}

export default function AdminAgensiPage() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const filterParam = searchParams.get('filter')

  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>(filterParam || 'all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ total: 0, verified: 0, unverified: 0, inactive: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => { if (filterParam) setFilter(filterParam) }, [filterParam])
  useEffect(() => { fetchAgencies(); setCurrentPage(1) }, [filter])
  useEffect(() => { setCurrentPage(1) }, [searchQuery])

  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null
    return Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }

  const getLicenseBadge = (status: string | null, expiryDate: string | null) => {
    if (!status) return null
    const daysLeft = getDaysUntilExpiry(expiryDate)
    if (status === 'expired')           return { icon: '🔴', text: 'EXPIRED',        color: '#EF4444', bg: '#FEE2E2' }
    if (status === 'expiring_critical') return { icon: '🟠', text: daysLeft + 'd left', color: '#F97316', bg: '#FFEDD5' }
    if (status === 'expiring_soon')     return { icon: '🟡', text: daysLeft + 'd left', color: '#EAB308', bg: '#FEF9C3' }
    return null
  }

  const fetchAgencies = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('agencies')
        .select('*, packages:packages(count), reviews:reviews(count)')
        .order('created_at', { ascending: false })

      if (filter === 'verified')          query = query.eq('is_verified', true)
      else if (filter === 'unverified')   query = query.eq('is_verified', false)
      else if (filter === 'inactive')     query = query.eq('is_active', false)
      else if (filter === 'expired')      query = query.eq('license_status', 'expired')
      else if (filter === 'expiring')     query = query.in('license_status', ['expired', 'expiring_critical', 'expiring_soon'])

      const { data, error } = await query
      if (error) throw error
      setAgencies(data || [])

      const { data: all } = await supabase.from('agencies').select('id, is_verified, is_active')
      if (all) {
        setStats({
          total: all.length,
          verified: all.filter(a => a.is_verified).length,
          unverified: all.filter(a => !a.is_verified).length,
          inactive: all.filter(a => !a.is_active).length,
        })
      }
    } catch (error) {
      console.error('Error fetching agencies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVerify = async (id: string, current: boolean) => {
    if (!confirm('Are you sure you want to ' + (current ? 'unverify' : 'verify') + ' this agency?')) return
    const { error } = await supabase.from('agencies').update({ is_verified: !current }).eq('id', id)
    if (error) { alert('Error updating verification'); return }
    fetchAgencies()
  }

  const handleRevokeVerify = async (id: string, name: string) => {
    if (!confirm('Revoke verification for "' + name + '"?\n\nThis will remove the verified badge and clear all MOTAC license info.')) return
    const { error } = await supabase.from('agencies').update({
      is_verified: false,
      verification_status: 'unverified',
      motac_license_number: null,
      motac_license_expiry: null,
      motac_verified_at: null,
    }).eq('id', id)
    if (error) { alert('Error revoking verification'); return }
    fetchAgencies()
  }

  const handleToggleActive = async (id: string, current: boolean) => {
    if (!confirm('Are you sure you want to ' + (current ? 'suspend' : 'activate') + ' this agency?')) return
    const { error } = await supabase.from('agencies').update({ is_active: !current }).eq('id', id)
    if (error) { alert('Error updating status'); return }
    fetchAgencies()
  }

  const handleDelete = async (id: string, name: string) => {
    const agency = agencies.find(a => a.id === id)
    if (!confirm(
      'DELETE AGENCY: "' + name + '"\n\n' +
      'This will permanently delete:\n' +
      '- Agency profile\n' +
      '- ' + getPackageCount(agency!) + ' packages\n' +
      '- ' + getReviewCount(agency!) + ' reviews\n' +
      '- All leads, news, reels\n\n' +
      'This CANNOT be undone!'
    )) return
    const userInput = prompt('Type "' + name + '" exactly to confirm:')
    if (userInput !== name) { alert('Name does not match. Deletion cancelled.'); return }
    try {
      await supabase.from('packages').delete().eq('agency_id', id)
      await supabase.from('reviews').delete().eq('agency_id', id)
      await supabase.from('news_feed').delete().eq('agency_id', id)
      await supabase.from('reels').delete().eq('agency_id', id)
      await supabase.from('leads').delete().eq('agency_id', id)
      const { error } = await supabase.from('agencies').delete().eq('id', id)
      if (error) throw error
      fetchAgencies()
    } catch (error: any) {
      alert('Error deleting agency: ' + error.message)
    }
  }

  const getPackageCount = (agency: Agency) => agency.packages?.[0]?.count || 0
  const getReviewCount  = (agency: Agency) => agency.reviews?.[0]?.count  || 0

  const filtered = agencies.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const statCards = [
    { key: 'all',       icon: '🏢', label: 'All',        value: stats.total,      color: '#3B82F6' },
    { key: 'verified',  icon: '✅', label: 'Verified',   value: stats.verified,   color: '#10B981' },
    { key: 'unverified',icon: '⏳', label: 'Unverified', value: stats.unverified, color: '#F59E0B' },
    { key: 'inactive',  icon: '⛔', label: 'Inactive',   value: stats.inactive,   color: '#EF4444' },
  ]

  if (loading) return (
    <div className="aa-loading">
      <div className="aa-loading-spinner" />
      <p className="aa-loading-text">Loading agencies...</p>
      <style dangerouslySetInnerHTML={{ __html: `
        .aa-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;gap:16px;}
        .aa-loading-spinner{width:40px;height:40px;border:3px solid #e5e5e5;border-top-color:#B8936D;border-radius:50%;animation:aaspin .8s linear infinite;}
        .aa-loading-text{font-size:14px;color:#999;font-weight:500;}
        @keyframes aaspin{to{transform:rotate(360deg);}}
      `}} />
    </div>
  )

  return (
    <>
      <div className="aa-page">

        {/* HEADER */}
        <div className="aa-header">
          <h1 className="aa-title">Manage Agencies</h1>
          <p className="aa-subtitle">Verify, manage, and monitor all registered travel agencies</p>
        </div>

        {/* STATS */}
        <div className="aa-stats-grid">
          {statCards.map(c => (
            <div key={c.key} className={'aa-stat-card' + (filter === c.key ? ' active' : '')} onClick={() => setFilter(c.key)}>
              <div className="aa-stat-icon" style={{ background: c.color + '18' }}>{c.icon}</div>
              <div className="aa-stat-label">{c.label}</div>
              <div className="aa-stat-value">{c.value}</div>
            </div>
          ))}
        </div>

        {/* SEARCH */}
        <div className="aa-search-bar">
          <div className="aa-search-wrap">
            <span className="aa-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search agency name or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="aa-search-input"
            />
          </div>
          <span className="aa-result-count">
            {filtered.length} agencies{totalPages > 1 ? ' • Page ' + currentPage + '/' + totalPages : ''}
          </span>
        </div>

        {/* TABLE — desktop */}
        <div className="aa-table-wrap">
          <div className="aa-table">
            <div className="aa-table-header">
              <div>Agency</div>
              <div>Contact</div>
              <div>Packages</div>
              <div>Reviews</div>
              <div>Status</div>
              <div>Actions</div>
            </div>
            {paginated.map(agency => {
              const badge = getLicenseBadge(agency.license_status, agency.motac_license_expiry)
              return (
                <div key={agency.id} className="aa-table-row">
                  {/* Agency */}
                  <div className="aa-cell-agency">
                    <div className="aa-avatar" style={{
                      backgroundImage: agency.logo_url ? 'url(' + agency.logo_url + ')' : 'none',
                      backgroundColor: agency.logo_url ? 'transparent' : '#F5F5F0'
                    }}>
                      {!agency.logo_url && agency.name.charAt(0)}
                    </div>
                    <div className="aa-agency-info">
                      <div className="aa-agency-name">
                        {agency.name}
                        {agency.is_verified && <span className="aa-tick"> ✓</span>}
                        {badge && (
                          <span className="aa-license-badge" style={{ color: badge.color, background: badge.bg }}>
                            {badge.icon} {badge.text}
                          </span>
                        )}
                      </div>
                      <div className="aa-agency-date">
                        Joined {new Date(agency.created_at).toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="aa-cell">
                    <div className="aa-phone">{agency.phone || '-'}</div>
                    <div className="aa-email">{agency.email || '-'}</div>
                  </div>

                  {/* Counts */}
                  <div className="aa-cell-num"><span className="aa-count">{getPackageCount(agency)}</span></div>
                  <div className="aa-cell-num"><span className="aa-count">{getReviewCount(agency)}</span></div>

                  {/* Status */}
                  <div className="aa-cell">
                    {!agency.is_active ? (
                      <span className="aa-badge inactive">INACTIVE</span>
                    ) : agency.is_verified ? (
                      <span className="aa-badge verified">VERIFIED</span>
                    ) : (
                      <span className="aa-badge pending">PENDING</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="aa-cell-act">
                    <ActionButtons
                      agency={agency}
                      onToggleVerify={handleToggleVerify}
                      onRevokeVerify={handleRevokeVerify}
                      onToggleActive={handleToggleActive}
                      onDelete={handleDelete}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* CARDS — mobile */}
        <div className="aa-cards-wrap">
          {paginated.map(agency => {
            const badge = getLicenseBadge(agency.license_status, agency.motac_license_expiry)
            return (
              <div key={agency.id} className="aa-card">
                <div className="aa-card-top">
                  <div className="aa-avatar" style={{
                    backgroundImage: agency.logo_url ? 'url(' + agency.logo_url + ')' : 'none',
                    backgroundColor: agency.logo_url ? 'transparent' : '#F5F5F0'
                  }}>
                    {!agency.logo_url && agency.name.charAt(0)}
                  </div>
                  <div className="aa-card-info">
                    <div className="aa-agency-name">
                      {agency.name}
                      {agency.is_verified && <span className="aa-tick"> ✓</span>}
                    </div>
                    <div className="aa-agency-date">{agency.email || agency.phone || '-'}</div>
                  </div>
                  {!agency.is_active ? (
                    <span className="aa-badge inactive">INACTIVE</span>
                  ) : agency.is_verified ? (
                    <span className="aa-badge verified">VERIFIED</span>
                  ) : (
                    <span className="aa-badge pending">PENDING</span>
                  )}
                </div>
                {badge && (
                  <div className="aa-card-license" style={{ color: badge.color, background: badge.bg }}>
                    {badge.icon} {badge.text}
                  </div>
                )}
                <div className="aa-card-stats">
                  <div className="aa-card-stat"><span className="aa-count">{getPackageCount(agency)}</span> packages</div>
                  <div className="aa-card-stat"><span className="aa-count">{getReviewCount(agency)}</span> reviews</div>
                  <div className="aa-card-date">
                    {new Date(agency.created_at).toLocaleDateString('en-MY', { year: 'numeric', month: 'short' })}
                  </div>
                </div>
                <ActionButtons
                  agency={agency}
                  onToggleVerify={handleToggleVerify}
                  onRevokeVerify={handleRevokeVerify}
                  onToggleActive={handleToggleActive}
                  onDelete={handleDelete}
                />
              </div>
            )
          })}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="aa-pagination">
            <button className="aa-pg-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</button>
            <div className="aa-pg-pages">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<(number | string)[]>((acc, p, i, arr) => {
                  if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === '...'
                    ? <span key={'e' + i} className="aa-pg-ellipsis">...</span>
                    : <button key={p} className={'aa-pg-num' + (currentPage === p ? ' active' : '')} onClick={() => setCurrentPage(p as number)}>{p}</button>
                )}
            </div>
            <button className="aa-pg-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
          </div>
        )}

        {/* EMPTY */}
        {filtered.length === 0 && (
          <div className="aa-empty">
            <div className="aa-empty-icon">🔍</div>
            <div className="aa-empty-title">No agencies found</div>
            <div className="aa-empty-sub">{searchQuery ? 'Try a different search term' : 'No agencies registered yet'}</div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .aa-page { max-width: 1200px; margin: 0 auto; }
        .aa-header { margin-bottom: 24px; }
        .aa-title { font-size: 28px; font-weight: 700; color: #2C2C2C; margin: 0 0 6px; }
        .aa-subtitle { font-size: 15px; color: #888; margin: 0; }

        /* Stats */
        .aa-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .aa-stat-card { background: white; border-radius: 12px; padding: 18px; border: 2px solid #E5E5E0; cursor: pointer; transition: all 0.2s; }
        .aa-stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .aa-stat-card.active { border-color: #B8936D; }
        .aa-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 10px; }
        .aa-stat-label { font-size: 13px; color: #888; font-weight: 500; margin-bottom: 4px; }
        .aa-stat-value { font-size: 28px; font-weight: 700; color: #2C2C2C; }

        /* Search */
        .aa-search-bar { background: white; border-radius: 12px; padding: 16px 20px; border: 1px solid #E5E5E0; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
        .aa-search-wrap { flex: 1; display: flex; align-items: center; gap: 10px; }
        .aa-search-icon { font-size: 16px; }
        .aa-search-input { width: 100%; padding: 10px 0; font-size: 15px; border: none; outline: none; background: transparent; color: #2C2C2C; }
        .aa-search-input::placeholder { color: #bbb; }
        .aa-result-count { font-size: 13px; color: #888; font-weight: 600; white-space: nowrap; }

        /* Table */
        .aa-table-wrap { display: block; }
        .aa-table { background: white; border-radius: 12px; border: 1px solid #E5E5E0; overflow: hidden; }
        .aa-table-header { display: grid; grid-template-columns: 2fr 1.2fr 0.6fr 0.6fr 0.8fr 240px; padding: 14px 20px; background: #F5F5F0; border-bottom: 1px solid #E5E5E0; font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
        .aa-table-row { display: grid; grid-template-columns: 2fr 1.2fr 0.6fr 0.6fr 0.8fr 240px; padding: 14px 20px; border-bottom: 1px solid #f0f0ec; align-items: center; transition: background 0.15s; }
        .aa-table-row:hover { background: #FAFAF8; }
        .aa-table-row:last-child { border-bottom: none; }

        /* Agency cell */
        .aa-cell-agency { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .aa-avatar { width: 42px; height: 42px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: #B8936D; background-size: cover; background-position: center; }
        .aa-agency-info { min-width: 0; }
        .aa-agency-name { font-size: 13px; font-weight: 600; color: #2C2C2C; margin-bottom: 2px; display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
        .aa-tick { color: #10B981; font-size: 13px; }
        .aa-license-badge { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
        .aa-agency-date { font-size: 11px; color: #aaa; }
        .aa-cell { min-width: 0; font-size: 13px; color: #2C2C2C; }
        .aa-phone { font-weight: 500; margin-bottom: 2px; }
        .aa-email { font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .aa-cell-num { text-align: center; }
        .aa-count { font-size: 18px; font-weight: 700; color: #2C2C2C; }
        .aa-badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; white-space: nowrap; }
        .aa-badge.verified { background: rgba(16,185,129,0.1); color: #10B981; }
        .aa-badge.pending  { background: rgba(245,158,11,0.1);  color: #F59E0B; }
        .aa-badge.inactive { background: rgba(239,68,68,0.1);   color: #EF4444; }

        /* ── ACTION BUTTONS — same system as pakej page ── */
        .aa-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; width: 230px; }
        .aa-btn {
          height: 32px;
          padding: 0 10px;
          border: none;
          border-radius: 7px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 700;
          transition: opacity 0.15s, filter 0.15s;
          text-decoration: none;
          white-space: nowrap;
          width: 100%;
          font-family: inherit;
        }
        .aa-btn:hover { filter: brightness(0.92); }
        .aa-btn-slate  { background: #E2E8F0; color: #475569; }
        .aa-btn-green  { background: #10B981; color: white; }
        .aa-btn-amber  { background: #F59E0B; color: white; }
        .aa-btn-purple { background: #8B5CF6; color: white; }
        .aa-btn-red    { background: #EF4444; color: white; }

        /* Cards */
        .aa-cards-wrap { display: none; }
        .aa-card { background: white; border-radius: 12px; border: 1px solid #E5E5E0; padding: 16px; margin-bottom: 10px; }
        .aa-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .aa-card-info { flex: 1; min-width: 0; }
        .aa-card-license { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 6px; margin-bottom: 10px; }
        .aa-card-stats { display: flex; gap: 16px; align-items: center; margin-bottom: 12px; font-size: 13px; color: #666; }
        .aa-card-date { margin-left: auto; font-size: 12px; color: #aaa; }

        /* Empty */
        .aa-empty { padding: 60px 20px; text-align: center; }
        .aa-empty-icon { font-size: 40px; margin-bottom: 12px; }
        .aa-empty-title { font-size: 16px; font-weight: 600; color: #666; margin-bottom: 6px; }
        .aa-empty-sub { font-size: 14px; color: #999; }

        /* Pagination */
        .aa-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 20px 0 4px; flex-wrap: wrap; }
        .aa-pg-btn { padding: 8px 16px; background: white; border: 1px solid #E5E5E0; border-radius: 8px; font-size: 13px; font-weight: 600; color: #555; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .aa-pg-btn:hover:not(:disabled) { border-color: #B8936D; color: #B8936D; }
        .aa-pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .aa-pg-pages { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }
        .aa-pg-num { width: 36px; height: 36px; border: 1px solid #E5E5E0; border-radius: 8px; background: white; font-size: 13px; font-weight: 600; color: #555; cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center; }
        .aa-pg-num:hover { border-color: #B8936D; color: #B8936D; }
        .aa-pg-num.active { background: #B8936D; border-color: #B8936D; color: white; }
        .aa-pg-ellipsis { color: #aaa; font-size: 13px; padding: 0 2px; }

        /* Responsive */
        @media (max-width: 1023px) {
          .aa-table-header { grid-template-columns: 2fr 0.6fr 0.6fr 0.8fr 230px; }
          .aa-table-row    { grid-template-columns: 2fr 0.6fr 0.6fr 0.8fr 230px; }
          .aa-table-header > div:nth-child(2), .aa-table-row > div:nth-child(2) { display: none; }
          .aa-stats-grid { gap: 10px; }
        }
        @media (max-width: 767px) {
          .aa-table-wrap { display: none; }
          .aa-cards-wrap { display: block; }
          .aa-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .aa-stat-card { padding: 12px; }
          .aa-stat-icon { width: 32px; height: 32px; font-size: 15px; margin-bottom: 8px; }
          .aa-stat-value { font-size: 22px; }
          .aa-title { font-size: 22px; }
          .aa-search-bar { padding: 12px 14px; }
          .aa-actions { width: 100%; }
        }
        @media (max-width: 480px) {
          .aa-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .aa-pagination { gap: 6px; }
          .aa-pg-btn { padding: 8px 10px; font-size: 12px; }
          .aa-pg-num { width: 32px; height: 32px; font-size: 12px; }
        }
      `}} />
    </>
  )
}