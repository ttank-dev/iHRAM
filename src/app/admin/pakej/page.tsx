'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Package {
  id: string
  title: string
  slug: string
  description: string | null
  package_type: string | null
  price_quad: number | null
  price_triple: number | null
  price_double: number | null
  price_child: number | null
  price_infant: number | null
  departure_dates: string[] | null
  duration_nights: number | null
  departure_city: string | null
  visa_type: string | null
  itinerary: string | null
  inclusions: string[] | null
  exclusions: string[] | null
  photos: string[] | null
  quota: number | null
  status: string
  is_featured: boolean
  created_at: string
  agency_id: string
  agencies?: { name: string; slug: string; is_verified: boolean }
}

export default function AdminPakejPage() {
  const supabase = createClient()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({ total: 0, published: 0, draft: 0, archived: 0 })

  useEffect(() => { fetchPackages() }, [filter])

  const fetchPackages = async () => {
    setLoading(true)
    try {
      let query = supabase.from('packages').select(`*, agencies ( name, slug, is_verified )`).order('created_at', { ascending: false })
      if (filter !== 'all') query = query.eq('status', filter)
      const { data, error } = await query
      if (error) throw error
      setPackages(data || [])

      const { data: allPkgs } = await supabase.from('packages').select('id, status')
      if (allPkgs) {
        setStats({
          total: allPkgs.length,
          published: allPkgs.filter(p => p.status === 'published').length,
          draft: allPkgs.filter(p => p.status === 'draft').length,
          archived: allPkgs.filter(p => p.status === 'archived').length,
        })
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFeatured = async (id: string, current: boolean) => {
    try {
      const { error } = await supabase.from('packages').update({ is_featured: !current }).eq('id', id)
      if (error) throw error
      alert(current ? '⭐ Removed from featured!' : '⭐ Added to featured!')
      fetchPackages()
    } catch { alert('❌ Error updating featured status') }
  }

  const handleChangeStatus = async (id: string, newStatus: string) => {
    if (!confirm(`Tukar status pakej ke "${newStatus}"?`)) return
    try {
      const { error } = await supabase.from('packages').update({ status: newStatus }).eq('id', id)
      if (error) throw error
      alert(`✅ Status ditukar ke ${newStatus}!`)
      fetchPackages()
    } catch { alert('❌ Error updating package status') }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`⚠️ PADAM PAKEJ: ${title}\n\nTindakan ini TIDAK boleh dibatalkan!`)) return
    const userInput = prompt(`Taip "${title}" untuk sahkan pemadaman:`)
    if (userInput !== title) { alert('❌ Nama pakej tidak sepadan. Pemadaman dibatalkan.'); return }
    try {
      const { error } = await supabase.from('packages').delete().eq('id', id)
      if (error) throw error
      alert('🗑️ Pakej berjaya dipadam!')
      fetchPackages()
    } catch (e: any) { alert(`❌ Error: ${e.message}`) }
  }

  const filtered = packages.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.agencies?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const statCards = [
    { key: 'all' as const, icon: '📦', label: 'Semua', value: stats.total, color: '#8B5CF6' },
    { key: 'published' as const, icon: '✅', label: 'Published', value: stats.published, color: '#10B981' },
    { key: 'draft' as const, icon: '📝', label: 'Draft', value: stats.draft, color: '#F59E0B' },
    { key: 'archived' as const, icon: '🗄️', label: 'Archived', value: stats.archived, color: '#EF4444' },
  ]

  const statusBadge = (s: string) => {
    if (s === 'published') return 'published'
    if (s === 'draft') return 'draft'
    return 'archived'
  }

  /* ── LOADING ── */
  if (loading) {
    return (
      <div className="ap-loading">
        <div className="ap-loading-spinner" />
        <p className="ap-loading-text">Memuatkan pakej...</p>
        <style dangerouslySetInnerHTML={{ __html: `
          .ap-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:400px; gap:16px; }
          .ap-loading-spinner { width:40px; height:40px; border:3px solid #e5e5e5; border-top-color:#B8936D; border-radius:50%; animation:apspin .8s linear infinite; }
          .ap-loading-text { font-size:14px; color:#999; font-weight:500; }
          @keyframes apspin { to { transform:rotate(360deg); } }
        `}} />
      </div>
    )
  }

  /* ── Action buttons helper ── */
  const ActionButtons = ({ pkg }: { pkg: Package }) => (
    <div className="ap-actions">
      <Link href={`/pakej/${pkg.slug}`} target="_blank" className="ap-act view" title="Lihat">👁️</Link>
      <button onClick={() => handleToggleFeatured(pkg.id, pkg.is_featured)} className={`ap-act ${pkg.is_featured ? 'featured-on' : 'featured-off'}`} title={pkg.is_featured ? 'Buang Featured' : 'Jadikan Featured'}>⭐</button>
      {pkg.status === 'draft' && <button onClick={() => handleChangeStatus(pkg.id, 'published')} className="ap-act publish" title="Publish">✓</button>}
      {pkg.status === 'published' && <button onClick={() => handleChangeStatus(pkg.id, 'archived')} className="ap-act archive" title="Archive">🗄️</button>}
      {pkg.status === 'archived' && <button onClick={() => handleChangeStatus(pkg.id, 'published')} className="ap-act unarchive" title="Unarchive">♻️</button>}
      <button onClick={() => handleDelete(pkg.id, pkg.title)} className="ap-act delete" title="Padam">🗑️</button>
    </div>
  )

  return (
    <>
      <div className="ap-page">

        {/* ── HEADER ── */}
        <div className="ap-header">
          <h1 className="ap-title">Urus Pakej</h1>
          <p className="ap-subtitle">Pantau dan moderasi semua pakej umrah dalam platform</p>
        </div>

        {/* ── STATS ── */}
        <div className="ap-stats-grid">
          {statCards.map(c => (
            <div key={c.key} className={`ap-stat-card ${filter === c.key ? 'active' : ''}`} onClick={() => setFilter(c.key)}>
              <div className="ap-stat-icon" style={{ background: `${c.color}12` }}>{c.icon}</div>
              <div className="ap-stat-label">{c.label}</div>
              <div className="ap-stat-value">{c.value}</div>
            </div>
          ))}
        </div>

        {/* ── SEARCH ── */}
        <div className="ap-search-bar">
          <div className="ap-search-wrap">
            <span className="ap-search-icon">🔍</span>
            <input type="text" placeholder="Cari pakej atau agensi..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="ap-search-input" />
          </div>
          <span className="ap-result-count">{filtered.length} pakej</span>
        </div>

        {/* ── TABLE (desktop) ── */}
        <div className="ap-table-wrap">
          <div className="ap-table">
            <div className="ap-table-header">
              <div className="ap-th-pkg">Pakej</div>
              <div className="ap-th">Agensi</div>
              <div className="ap-th">Jenis</div>
              <div className="ap-th">Harga</div>
              <div className="ap-th">Status</div>
              <div className="ap-th-act">Tindakan</div>
            </div>

            {filtered.map(pkg => (
              <div key={pkg.id} className="ap-table-row">
                {/* Package */}
                <div className="ap-cell-pkg">
                  <div className="ap-pkg-thumb" style={{
                    backgroundImage: pkg.photos?.[0] ? `url(${pkg.photos[0]})` : 'none',
                    backgroundColor: pkg.photos?.[0] ? 'transparent' : '#F5F5F0'
                  }}>
                    {!pkg.photos?.[0] && '🕌'}
                  </div>
                  <div className="ap-pkg-info">
                    <div className="ap-pkg-name">
                      {pkg.title}
                      {pkg.is_featured && <span className="ap-star">⭐</span>}
                    </div>
                    <div className="ap-pkg-meta">{pkg.duration_nights} malam • {pkg.departure_city || 'N/A'}</div>
                  </div>
                </div>

                {/* Agency */}
                <div className="ap-cell">
                  <span className="ap-agency-name">
                    {pkg.agencies?.name || 'N/A'}
                    {pkg.agencies?.is_verified && <span className="ap-tick">✓</span>}
                  </span>
                </div>

                {/* Type */}
                <div className="ap-cell"><span className="ap-type-badge">{pkg.package_type || 'Standard'}</span></div>

                {/* Price */}
                <div className="ap-cell"><span className="ap-price">RM {pkg.price_quad?.toLocaleString() || 'N/A'}</span></div>

                {/* Status */}
                <div className="ap-cell"><span className={`ap-status ${statusBadge(pkg.status)}`}>{pkg.status.toUpperCase()}</span></div>

                {/* Actions */}
                <div className="ap-cell-act"><ActionButtons pkg={pkg} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CARDS (mobile) ── */}
        <div className="ap-cards-wrap">
          {filtered.map(pkg => (
            <div key={pkg.id} className="ap-card">
              <div className="ap-card-top">
                <div className="ap-pkg-thumb sm" style={{
                  backgroundImage: pkg.photos?.[0] ? `url(${pkg.photos[0]})` : 'none',
                  backgroundColor: pkg.photos?.[0] ? 'transparent' : '#F5F5F0'
                }}>
                  {!pkg.photos?.[0] && '🕌'}
                </div>
                <div className="ap-card-info">
                  <div className="ap-pkg-name">{pkg.title} {pkg.is_featured && <span className="ap-star">⭐</span>}</div>
                  <div className="ap-pkg-meta">{pkg.agencies?.name || 'N/A'} {pkg.agencies?.is_verified && <span className="ap-tick">✓</span>}</div>
                </div>
                <span className={`ap-status ${statusBadge(pkg.status)}`}>{pkg.status.toUpperCase()}</span>
              </div>
              <div className="ap-card-row">
                <span className="ap-type-badge">{pkg.package_type || 'Standard'}</span>
                <span className="ap-price">RM {pkg.price_quad?.toLocaleString() || 'N/A'}</span>
                <span className="ap-card-dur">{pkg.duration_nights} malam</span>
              </div>
              <ActionButtons pkg={pkg} />
            </div>
          ))}
        </div>

        {/* ── EMPTY ── */}
        {filtered.length === 0 && (
          <div className="ap-empty">
            <div className="ap-empty-icon">🔍</div>
            <div className="ap-empty-title">Tiada pakej ditemui</div>
            <div className="ap-empty-sub">{searchQuery ? 'Cuba ubah carian anda' : 'Belum ada pakej'}</div>
          </div>
        )}
      </div>

      {/* ── STYLES ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        .ap-page { max-width: 1200px; margin: 0 auto; }

        /* Header */
        .ap-header { margin-bottom: 24px; }
        .ap-title { font-size: 28px; font-weight: 700; color: #2C2C2C; margin: 0 0 6px; }
        .ap-subtitle { font-size: 15px; color: #888; margin: 0; }

        /* Stats */
        .ap-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
        .ap-stat-card {
          background: white; border-radius: 12px; padding: 18px; border: 2px solid #E5E5E0;
          cursor: pointer; transition: all 0.2s;
        }
        .ap-stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .ap-stat-card.active { border-color: #B8936D; }
        .ap-stat-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 10px; }
        .ap-stat-label { font-size: 13px; color: #888; font-weight: 500; margin-bottom: 4px; }
        .ap-stat-value { font-size: 28px; font-weight: 700; color: #2C2C2C; }

        /* Search */
        .ap-search-bar {
          background: white; border-radius: 12px; padding: 16px 20px; border: 1px solid #E5E5E0;
          margin-bottom: 16px; display: flex; align-items: center; gap: 12px;
        }
        .ap-search-wrap { flex: 1; display: flex; align-items: center; gap: 10px; }
        .ap-search-icon { font-size: 16px; }
        .ap-search-input { width: 100%; padding: 10px 0; font-size: 15px; border: none; outline: none; background: transparent; color: #2C2C2C; }
        .ap-search-input::placeholder { color: #bbb; }
        .ap-result-count { font-size: 13px; color: #888; font-weight: 600; white-space: nowrap; }

        /* Table */
        .ap-table-wrap { display: block; }
        .ap-table { background: white; border-radius: 12px; border: 1px solid #E5E5E0; overflow: hidden; }
        .ap-table-header {
          display: grid; grid-template-columns: 2.2fr 1.2fr 0.8fr 0.8fr 0.8fr 200px;
          padding: 14px 20px; background: #F5F5F0; border-bottom: 1px solid #E5E5E0;
          font-size: 12px; font-weight: 700; color: #888; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .ap-table-row {
          display: grid; grid-template-columns: 2.2fr 1.2fr 0.8fr 0.8fr 0.8fr 200px;
          padding: 16px 20px; border-bottom: 1px solid #f0f0ec; align-items: center;
          transition: background 0.15s;
        }
        .ap-table-row:hover { background: #FAFAF8; }
        .ap-table-row:last-child { border-bottom: none; }

        /* Package cell */
        .ap-cell-pkg { display: flex; align-items: center; gap: 12px; min-width: 0; }
        .ap-pkg-thumb {
          width: 52px; height: 52px; border-radius: 8px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 22px;
          background-size: cover; background-position: center;
        }
        .ap-pkg-thumb.sm { width: 44px; height: 44px; font-size: 18px; }
        .ap-pkg-info { min-width: 0; }
        .ap-pkg-name { font-size: 14px; font-weight: 600; color: #2C2C2C; margin-bottom: 2px; display: flex; align-items: center; gap: 6px; }
        .ap-star { font-size: 14px; }
        .ap-pkg-meta { font-size: 12px; color: #999; }

        /* Cells */
        .ap-cell { min-width: 0; }
        .ap-agency-name { font-size: 13px; font-weight: 600; color: #2C2C2C; }
        .ap-tick { color: #10B981; font-size: 13px; margin-left: 3px; }
        .ap-type-badge { padding: 4px 10px; background: rgba(184,147,109,0.1); color: #B8936D; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .ap-price { font-size: 15px; font-weight: 700; color: #2C2C2C; }

        /* Status */
        .ap-status { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .ap-status.published { background: rgba(16,185,129,0.1); color: #10B981; }
        .ap-status.draft { background: rgba(245,158,11,0.1); color: #F59E0B; }
        .ap-status.archived { background: rgba(239,68,68,0.1); color: #EF4444; }

        /* Actions */
        .ap-cell-act { }
        .ap-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .ap-act {
          width: 34px; height: 34px; border: none; border-radius: 8px; cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 14px; transition: all 0.15s; text-decoration: none;
        }
        .ap-act.view { background: #F5F5F0; }
        .ap-act.view:hover { background: #e8e8e3; }
        .ap-act.featured-on { background: #F59E0B; }
        .ap-act.featured-on:hover { background: #D97706; }
        .ap-act.featured-off { background: #F5F5F0; }
        .ap-act.featured-off:hover { background: #e8e8e3; }
        .ap-act.publish { background: #10B981; color: white; font-weight: 700; }
        .ap-act.publish:hover { background: #059669; }
        .ap-act.archive { background: #F59E0B; }
        .ap-act.archive:hover { background: #D97706; }
        .ap-act.unarchive { background: #10B981; }
        .ap-act.unarchive:hover { background: #059669; }
        .ap-act.delete { background: #EF4444; }
        .ap-act.delete:hover { background: #DC2626; }

        /* Cards (mobile) */
        .ap-cards-wrap { display: none; }
        .ap-card { background: white; border-radius: 12px; border: 1px solid #E5E5E0; padding: 16px; margin-bottom: 10px; }
        .ap-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
        .ap-card-info { flex: 1; min-width: 0; }
        .ap-card-row { display: flex; gap: 10px; align-items: center; margin-bottom: 12px; flex-wrap: wrap; font-size: 13px; }
        .ap-card-dur { color: #999; font-size: 12px; margin-left: auto; }

        /* Empty */
        .ap-empty { padding: 60px 20px; text-align: center; }
        .ap-empty-icon { font-size: 40px; margin-bottom: 12px; }
        .ap-empty-title { font-size: 16px; font-weight: 600; color: #666; margin-bottom: 6px; }
        .ap-empty-sub { font-size: 14px; color: #999; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1023px) {
          .ap-table-header { grid-template-columns: 2fr 1fr 0.8fr 0.8fr 180px; }
          .ap-table-row { grid-template-columns: 2fr 1fr 0.8fr 0.8fr 180px; }
          .ap-table-header > div:nth-child(3),
          .ap-table-row > div:nth-child(3) { display: none; } /* hide Type */
          .ap-stats-grid { grid-template-columns: repeat(4, 1fr); gap: 10px; }
          .ap-stat-card { padding: 14px; }
          .ap-stat-value { font-size: 24px; }
        }

        @media (max-width: 767px) {
          .ap-table-wrap { display: none; }
          .ap-cards-wrap { display: block; }
          .ap-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .ap-stat-card { padding: 12px; }
          .ap-stat-icon { width: 32px; height: 32px; font-size: 15px; margin-bottom: 8px; }
          .ap-stat-value { font-size: 22px; }
          .ap-title { font-size: 22px; }
          .ap-search-bar { padding: 12px 14px; }
        }

        @media (max-width: 480px) {
          .ap-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .ap-card-row { gap: 6px; }
        }
      `}} />
    </>
  )
}