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

export default function AdminAgensiPage() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const filterParam = searchParams.get('filter')

  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>(filterParam || 'all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ total: 0, verified: 0, unverified: 0, inactive: 0 })

  useEffect(() => { if (filterParam) setFilter(filterParam) }, [filterParam])
  useEffect(() => { fetchAgencies() }, [filter])

  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null
    const diffTime = new Date(expiryDate).getTime() - new Date().getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getLicenseBadge = (status: string | null, expiryDate: string | null) => {
    if (!status) return null
    const daysLeft = getDaysUntilExpiry(expiryDate)
    if (status === 'expired') return { icon: '🔴', text: 'EXPIRED', color: '#EF4444', bg: '#FEE2E2', days: daysLeft }
    if (status === 'expiring_critical') return { icon: '🟠', text: `${daysLeft}d left`, color: '#F97316', bg: '#FFEDD5', days: daysLeft }
    if (status === 'expiring_soon') return { icon: '🟡', text: `${daysLeft}d left`, color: '#EAB308', bg: '#FEF9C3', days: daysLeft }
    return null
  }

  const fetchAgencies = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('agencies')
        .select(`*, packages:packages(count), reviews:reviews(count)`)
        .order('created_at', { ascending: false })

      if (filter === 'verified') query = query.eq('is_verified', true)
      else if (filter === 'unverified') query = query.eq('is_verified', false)
      else if (filter === 'inactive') query = query.eq('is_active', false)
      else if (filter === 'expired') query = query.eq('license_status', 'expired')
      else if (filter === 'expiring_critical') query = query.eq('license_status', 'expiring_critical')
      else if (filter === 'expiring_soon') query = query.eq('license_status', 'expiring_soon')
      else if (filter === 'expiring') query = query.in('license_status', ['expired', 'expiring_critical', 'expiring_soon'])

      const { data, error } = await query
      if (error) throw error
      setAgencies(data || [])

      const { data: allAgencies } = await supabase.from('agencies').select('id, is_verified, is_active')
      if (allAgencies) {
        setStats({
          total: allAgencies.length,
          verified: allAgencies.filter(a => a.is_verified).length,
          unverified: allAgencies.filter(a => !a.is_verified).length,
          inactive: allAgencies.filter(a => !a.is_active).length
        })
      }
    } catch (error) {
      console.error('Error fetching agencies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVerification = async (agencyId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'unverify' : 'verify'
    if (!confirm(`Are you sure you want to ${action} this agency?`)) return
    try {
      const { error } = await supabase.from('agencies').update({ is_verified: !currentStatus }).eq('id', agencyId)
      if (error) throw error
      alert(currentStatus ? '❌ Agency unverified!' : '✅ Agency verified!')
      fetchAgencies()
    } catch (error) {
      console.error('Error toggling verification:', error)
      alert('❌ Error updating agency verification')
    }
  }

  const handleRevokeVerification = async (agencyId: string, agencyName: string) => {
    if (!confirm(
      `🚫 REVOKE VERIFICATION: ${agencyName}\n\n` +
      `This will:\n- Remove verified badge\n- Clear MOTAC license number\n- Clear license expiry date\n- Clear verified timestamp\n\nContinue?`
    )) return
    try {
      const { error } = await supabase.from('agencies').update({
        is_verified: false, verification_status: 'unverified',
        motac_license_number: null, motac_license_expiry: null, motac_verified_at: null
      }).eq('id', agencyId)
      if (error) throw error
      alert('✅ Verification revoked successfully!')
      fetchAgencies()
    } catch (error) {
      console.error('Error revoking verification:', error)
      alert('❌ Error revoking verification')
    }
  }

  const handleToggleActive = async (agencyId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'suspend' : 'activate'
    if (!confirm(`Are you sure you want to ${action} this agency?`)) return
    try {
      const { error } = await supabase.from('agencies').update({ is_active: !currentStatus }).eq('id', agencyId)
      if (error) throw error
      alert(currentStatus ? '⏸️ Agency suspended!' : '✅ Agency activated!')
      fetchAgencies()
    } catch (error) {
      console.error('Error toggling active status:', error)
      alert('❌ Error updating agency status')
    }
  }

  const handleDelete = async (agencyId: string, agencyName: string) => {
    const agency = agencies.find(a => a.id === agencyId)
    if (!confirm(
      `⚠️ DELETE AGENCY: ${agencyName}\n\n` +
      `This will permanently delete:\n- Agency profile\n- ${getPackageCount(agency!)} packages\n- ${getReviewCount(agency!)} reviews\n- All news feed posts, reels, leads\n\nThis action CANNOT be undone!`
    )) return
    const userInput = prompt(`Type "${agencyName}" exactly to confirm deletion:`)
    if (userInput !== agencyName) { alert('❌ Agency name does not match. Deletion cancelled.'); return }
    try {
      await supabase.from('packages').delete().eq('agency_id', agencyId)
      await supabase.from('reviews').delete().eq('agency_id', agencyId)
      await supabase.from('news_feed').delete().eq('agency_id', agencyId)
      await supabase.from('reels').delete().eq('agency_id', agencyId)
      await supabase.from('leads').delete().eq('agency_id', agencyId)
      const { error } = await supabase.from('agencies').delete().eq('id', agencyId)
      if (error) throw error
      alert('🗑️ Agency deleted successfully!')
      fetchAgencies()
    } catch (error: any) {
      console.error('❌ Delete operation failed:', error)
      alert(`❌ Error deleting agency:\n\n${error.message}`)
    }
  }

  const filteredAgencies = agencies.filter(a =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getPackageCount = (agency: Agency) => agency.packages?.[0]?.count || 0
  const getReviewCount = (agency: Agency) => agency.reviews?.[0]?.count || 0

  const statCards = [
    { key: 'all', icon: '🏢', label: 'Semua', value: stats.total, color: '#3B82F6' },
    { key: 'verified', icon: '✅', label: 'Verified', value: stats.verified, color: '#10B981' },
    { key: 'unverified', icon: '⏳', label: 'Unverified', value: stats.unverified, color: '#F59E0B' },
    { key: 'inactive', icon: '⛔', label: 'Inactive', value: stats.inactive, color: '#EF4444' },
  ]

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="aa-loading">
        <div className="aa-loading-spinner" />
        <p className="aa-loading-text">Memuatkan agensi...</p>
        <style dangerouslySetInnerHTML={{ __html: `
          .aa-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:400px; gap:16px; }
          .aa-loading-spinner { width:40px; height:40px; border:3px solid #e5e5e5; border-top-color:#B8936D; border-radius:50%; animation:aaspin .8s linear infinite; }
          .aa-loading-text { font-size:14px; color:#999; font-weight:500; }
          @keyframes aaspin { to { transform:rotate(360deg); } }
        `}} />
      </div>
    )
  }

  return (
    <>
      <div className="aa-page">

        {/* ── HEADER ── */}
        <div className="aa-header">
          <h1 className="aa-title">Urus Agensi</h1>
          <p className="aa-subtitle">Verify, manage, and monitor all registered travel agencies</p>
        </div>

        {/* ── STATS ── */}
        <div className="aa-stats-grid">
          {statCards.map((card) => (
            <div
              key={card.key}
              className={`aa-stat-card ${filter === card.key ? 'active' : ''}`}
              onClick={() => setFilter(card.key)}
            >
              <div className="aa-stat-icon" style={{ background: `${card.color}12` }}>{card.icon}</div>
              <div className="aa-stat-label">{card.label}</div>
              <div className="aa-stat-value">{card.value}</div>
            </div>
          ))}
        </div>

        {/* ── SEARCH ── */}
        <div className="aa-search-bar">
          <div className="aa-search-wrap">
            <span className="aa-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Cari agensi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="aa-search-input"
            />
          </div>
          <span className="aa-result-count">{filteredAgencies.length} agensi</span>
        </div>

        {/* ── TABLE (desktop) ── */}
        <div className="aa-table-wrap">
          <div className="aa-table">
            <div className="aa-table-header">
              <div className="aa-col-agency">Agensi</div>
              <div className="aa-col-contact">Kontak</div>
              <div className="aa-col-num">Pakej</div>
              <div className="aa-col-num">Ulasan</div>
              <div className="aa-col-status">Status</div>
              <div className="aa-col-actions">Tindakan</div>
            </div>

            {filteredAgencies.map((agency) => {
              const badge = getLicenseBadge(agency.license_status, agency.motac_license_expiry)
              return (
                <div key={agency.id} className="aa-table-row">
                  {/* Agency info */}
                  <div className="aa-col-agency">
                    <div className="aa-avatar" style={{
                      backgroundImage: agency.logo_url ? `url(${agency.logo_url})` : 'none',
                      backgroundColor: agency.logo_url ? 'transparent' : '#F5F5F0'
                    }}>
                      {!agency.logo_url && agency.name.charAt(0)}
                    </div>
                    <div className="aa-agency-info">
                      <div className="aa-agency-name">
                        {agency.name}
                        {agency.is_verified && <span className="aa-verified-tick">✓</span>}
                        {badge && (
                          <span className="aa-license-badge" style={{ color: badge.color, background: badge.bg }}>
                            {badge.icon} {badge.text}
                          </span>
                        )}
                      </div>
                      <div className="aa-agency-date">
                        Joined {new Date(agency.created_at).toLocaleDateString('ms-MY', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="aa-col-contact">
                    <div className="aa-contact-phone">{agency.phone || '-'}</div>
                    <div className="aa-contact-email">{agency.email || '-'}</div>
                  </div>

                  {/* Counts */}
                  <div className="aa-col-num"><span className="aa-count">{getPackageCount(agency)}</span></div>
                  <div className="aa-col-num"><span className="aa-count">{getReviewCount(agency)}</span></div>

                  {/* Status */}
                  <div className="aa-col-status">
                    {!agency.is_active ? (
                      <span className="aa-badge inactive">INACTIVE</span>
                    ) : agency.is_verified ? (
                      <span className="aa-badge verified">VERIFIED</span>
                    ) : (
                      <span className="aa-badge pending">PENDING</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="aa-col-actions">
                    <Link href={`/agensi/${agency.slug}`} target="_blank" className="aa-act-btn view" title="View">👁️</Link>
                    {agency.is_verified ? (
                      <button onClick={() => handleRevokeVerification(agency.id, agency.name)} className="aa-act-btn revoke" title="Revoke">❌</button>
                    ) : (
                      <button onClick={() => handleToggleVerification(agency.id, agency.is_verified)} className="aa-act-btn verify" title="Verify">✓</button>
                    )}
                    <button onClick={() => handleToggleActive(agency.id, agency.is_active)} className={`aa-act-btn ${agency.is_active ? 'suspend' : 'activate'}`} title={agency.is_active ? 'Suspend' : 'Activate'}>
                      {agency.is_active ? '⏸️' : '▶️'}
                    </button>
                    <button onClick={() => handleDelete(agency.id, agency.name)} className="aa-act-btn delete" title="Delete">🗑️</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── CARDS (mobile) ── */}
        <div className="aa-cards-wrap">
          {filteredAgencies.map((agency) => {
            const badge = getLicenseBadge(agency.license_status, agency.motac_license_expiry)
            return (
              <div key={agency.id} className="aa-card">
                <div className="aa-card-top">
                  <div className="aa-avatar" style={{
                    backgroundImage: agency.logo_url ? `url(${agency.logo_url})` : 'none',
                    backgroundColor: agency.logo_url ? 'transparent' : '#F5F5F0'
                  }}>
                    {!agency.logo_url && agency.name.charAt(0)}
                  </div>
                  <div className="aa-card-info">
                    <div className="aa-agency-name">
                      {agency.name}
                      {agency.is_verified && <span className="aa-verified-tick">✓</span>}
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
                  <div className="aa-card-stat"><span className="aa-card-stat-val">{getPackageCount(agency)}</span> pakej</div>
                  <div className="aa-card-stat"><span className="aa-card-stat-val">{getReviewCount(agency)}</span> ulasan</div>
                  <div className="aa-card-stat-date">
                    {new Date(agency.created_at).toLocaleDateString('ms-MY', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="aa-card-actions">
                  <Link href={`/agensi/${agency.slug}`} target="_blank" className="aa-act-btn view" title="View">👁️</Link>
                  {agency.is_verified ? (
                    <button onClick={() => handleRevokeVerification(agency.id, agency.name)} className="aa-act-btn revoke">❌</button>
                  ) : (
                    <button onClick={() => handleToggleVerification(agency.id, agency.is_verified)} className="aa-act-btn verify">✓</button>
                  )}
                  <button onClick={() => handleToggleActive(agency.id, agency.is_active)} className={`aa-act-btn ${agency.is_active ? 'suspend' : 'activate'}`}>
                    {agency.is_active ? '⏸️' : '▶️'}
                  </button>
                  <button onClick={() => handleDelete(agency.id, agency.name)} className="aa-act-btn delete">🗑️</button>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── EMPTY ── */}
        {filteredAgencies.length === 0 && (
          <div className="aa-empty">
            <div className="aa-empty-icon">🔍</div>
            <div className="aa-empty-title">Tiada agensi ditemui</div>
            <div className="aa-empty-sub">{searchQuery ? 'Cuba ubah carian anda' : 'Belum ada agensi berdaftar'}</div>
          </div>
        )}
      </div>

      {/* ── STYLES ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        .aa-page { max-width: 1200px; margin: 0 auto; }

        /* Header */
        .aa-header { margin-bottom: 24px; }
        .aa-title { font-size: 28px; font-weight: 700; color: #2C2C2C; margin: 0 0 6px; }
        .aa-subtitle { font-size: 15px; color: #888; margin: 0; }

        /* Stats */
        .aa-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .aa-stat-card {
          background: white; border-radius: 12px; padding: 18px; border: 2px solid transparent;
          cursor: pointer; transition: all 0.2s; border-color: #E5E5E0;
        }
        .aa-stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .aa-stat-card.active { border-color: #B8936D; }
        .aa-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 10px; }
        .aa-stat-label { font-size: 13px; color: #888; font-weight: 500; margin-bottom: 4px; }
        .aa-stat-value { font-size: 28px; font-weight: 700; color: #2C2C2C; }

        /* Search */
        .aa-search-bar {
          background: white; border-radius: 12px; padding: 16px 20px; border: 1px solid #E5E5E0;
          margin-bottom: 16px; display: flex; align-items: center; gap: 12px;
        }
        .aa-search-wrap { flex: 1; display: flex; align-items: center; gap: 10px; }
        .aa-search-icon { font-size: 16px; flex-shrink: 0; }
        .aa-search-input {
          width: 100%; padding: 10px 0; font-size: 15px; border: none; outline: none; background: transparent; color: #2C2C2C;
        }
        .aa-search-input::placeholder { color: #bbb; }
        .aa-result-count { font-size: 13px; color: #888; font-weight: 600; white-space: nowrap; }

        /* Table (desktop) */
        .aa-table-wrap { display: block; }
        .aa-table { background: white; border-radius: 12px; border: 1px solid #E5E5E0; overflow: hidden; }
        .aa-table-header {
          display: grid; grid-template-columns: 2fr 1.2fr 0.6fr 0.6fr 0.8fr 180px;
          padding: 14px 20px; background: #F5F5F0; border-bottom: 1px solid #E5E5E0;
          font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .aa-table-row {
          display: grid; grid-template-columns: 2fr 1.2fr 0.6fr 0.6fr 0.8fr 180px;
          padding: 16px 20px; border-bottom: 1px solid #f0f0ec; align-items: center;
          transition: background 0.15s;
        }
        .aa-table-row:hover { background: #FAFAF8; }
        .aa-table-row:last-child { border-bottom: none; }

        /* Agency cell */
        .aa-col-agency { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .aa-avatar {
          width: 42px; height: 42px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; font-weight: 700; color: #B8936D;
          background-size: cover; background-position: center;
        }
        .aa-agency-info { min-width: 0; }
        .aa-agency-name {
          font-size: 14px; font-weight: 600; color: #2C2C2C; margin-bottom: 2px;
          display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
        }
        .aa-verified-tick { color: #10B981; font-size: 14px; }
        .aa-license-badge { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 3px; white-space: nowrap; }
        .aa-agency-date { font-size: 12px; color: #aaa; }

        /* Contact */
        .aa-col-contact { min-width: 0; }
        .aa-contact-phone { font-size: 13px; color: #2C2C2C; margin-bottom: 2px; }
        .aa-contact-email { font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* Nums */
        .aa-col-num { text-align: center; }
        .aa-count { font-size: 18px; font-weight: 700; color: #2C2C2C; }

        /* Status */
        .aa-col-status { }
        .aa-badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; white-space: nowrap; }
        .aa-badge.verified { background: rgba(16,185,129,0.1); color: #10B981; }
        .aa-badge.pending { background: rgba(245,158,11,0.1); color: #F59E0B; }
        .aa-badge.inactive { background: rgba(239,68,68,0.1); color: #EF4444; }

        /* Actions */
        .aa-col-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .aa-act-btn {
          width: 36px; height: 36px; border: none; border-radius: 8px; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 14px; transition: all 0.15s; text-decoration: none;
        }
        .aa-act-btn.view { background: #F5F5F0; }
        .aa-act-btn.view:hover { background: #e8e8e3; }
        .aa-act-btn.verify { background: #10B981; color: white; font-weight: 700; }
        .aa-act-btn.verify:hover { background: #059669; }
        .aa-act-btn.revoke { background: #F59E0B; }
        .aa-act-btn.revoke:hover { background: #D97706; }
        .aa-act-btn.suspend { background: #8B5CF6; }
        .aa-act-btn.suspend:hover { background: #7C3AED; }
        .aa-act-btn.activate { background: #10B981; }
        .aa-act-btn.activate:hover { background: #059669; }
        .aa-act-btn.delete { background: #EF4444; }
        .aa-act-btn.delete:hover { background: #DC2626; }

        /* Cards (mobile) — hidden on desktop */
        .aa-cards-wrap { display: none; }
        .aa-card {
          background: white; border-radius: 12px; border: 1px solid #E5E5E0; padding: 16px;
          margin-bottom: 10px;
        }
        .aa-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .aa-card-info { flex: 1; min-width: 0; }
        .aa-card-license {
          display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700;
          padding: 4px 10px; border-radius: 6px; margin-bottom: 10px;
        }
        .aa-card-stats { display: flex; gap: 16px; align-items: center; margin-bottom: 12px; font-size: 13px; color: #666; }
        .aa-card-stat-val { font-weight: 700; color: #2C2C2C; }
        .aa-card-stat-date { margin-left: auto; font-size: 12px; color: #aaa; }
        .aa-card-actions { display: flex; gap: 8px; }

        /* Empty */
        .aa-empty { padding: 60px 20px; text-align: center; }
        .aa-empty-icon { font-size: 40px; margin-bottom: 12px; }
        .aa-empty-title { font-size: 16px; font-weight: 600; color: #666; margin-bottom: 6px; }
        .aa-empty-sub { font-size: 14px; color: #999; }

        /* ── RESPONSIVE ── */

        @media (max-width: 1023px) {
          .aa-table-header { grid-template-columns: 2fr 0.6fr 0.6fr 0.8fr 160px; }
          .aa-table-row { grid-template-columns: 2fr 0.6fr 0.6fr 0.8fr 160px; }
          .aa-col-contact { display: none; }
          .aa-stats-grid { grid-template-columns: repeat(4, 1fr); gap: 10px; }
          .aa-stat-card { padding: 14px; }
          .aa-stat-value { font-size: 24px; }
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
        }

        @media (max-width: 480px) {
          .aa-stats-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}} />
    </>
  )
}