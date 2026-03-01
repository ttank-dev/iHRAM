'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Pagination from '@/app/Pagination'

function ActionButtons({ pkg, onDuplicate, onDelete, deleting }: {
  pkg: any
  onDuplicate: (pkg: any) => void
  onDelete: (id: string, title: string) => void
  deleting: string | null
}) {
  return (
    <div className="mp-actions">
      <Link href={`/merchant/dashboard/pakej/edit/${pkg.id}`} className="mp-btn mp-btn-gold">✏️ Edit</Link>
      <button className="mp-btn mp-btn-slate" onClick={() => onDuplicate(pkg)}>📋 Duplicate</button>
      <Link href={`/pakej/${pkg.slug}`} target="_blank" className="mp-btn mp-btn-slate">👁 Preview</Link>
      <button
        className={`mp-btn mp-btn-red${deleting === pkg.id ? ' mp-btn-loading' : ''}`}
        onClick={() => onDelete(pkg.id, pkg.title)}
        disabled={deleting === pkg.id}
      >
        {deleting === pkg.id ? '⏳...' : '🗑 Delete'}
      </button>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    published: { label: 'PUBLISHED', bg: '#ECFDF5', color: '#10B981' },
    draft:     { label: 'DRAFT',     bg: '#FEF3C7', color: '#F59E0B' },
    archived:  { label: 'ARCHIVED',  bg: '#F5F5F5', color: '#888' },
  }
  const s = map[status] || map.draft
  return <span className="mp-badge" style={{ background: s.bg, color: s.color }}>{s.label}</span>
}

const ITEMS_PER_PAGE = 10

export default function PakejSayaPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { init() }, [])
  useEffect(() => { setCurrentPage(1) }, [filter])

  const init = async () => {
    const res = await fetch('/api/merchant/me')
    if (!res.ok) { router.push('/merchant/login'); return }
    const data = await res.json()
    if (!data.agencyId) { router.push('/merchant/login'); return }
    setAgencyId(data.agencyId)
    await loadPackages(data.agencyId)
  }

  const loadPackages = async (aid: string) => {
    const { data } = await supabase
      .from('packages').select('*').eq('agency_id', aid)
      .order('created_at', { ascending: false })
    setPackages(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete package "${title}"?\n\nThis cannot be undone.`)) return
    setDeleting(id)
    const { error } = await supabase.from('packages').delete().eq('id', id)
    if (error) { alert('Failed to delete: ' + error.message); setDeleting(null); return }
    setPackages(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  const handleDuplicate = async (pkg: any) => {
    if (!confirm(`Duplicate "${pkg.title}"?`)) return
    if (!agencyId) return
    const newSlug = `${pkg.slug}-copy-${Date.now()}`
    const { error } = await supabase.from('packages').insert({
      ...pkg, id: undefined, created_at: undefined,
      agency_id: agencyId, title: `${pkg.title} (Copy)`, slug: newSlug, status: 'draft'
    })
    if (error) { alert('Failed to duplicate: ' + error.message); return }
    await loadPackages(agencyId)
  }

  const stats = {
    total:     packages.length,
    published: packages.filter(p => p.status === 'published').length,
    draft:     packages.filter(p => p.status === 'draft').length,
    archived:  packages.filter(p => p.status === 'archived').length,
  }

  const filtered   = filter === 'all' ? packages : packages.filter(p => p.status === filter)
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  if (loading) return (
    <>
      <div className="mp-load"><div className="mp-spin" /><p>Loading packages...</p></div>
      <style>{`.mp-load{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;gap:16px;color:#999}.mp-spin{width:36px;height:36px;border:3px solid #e5e5e5;border-top-color:#B8936D;border-radius:50%;animation:mps .7s linear infinite}@keyframes mps{to{transform:rotate(360deg)}}`}</style>
    </>
  )

  return (
    <>
      <style>{`
        .mp-page,.mp-page *{box-sizing:border-box}
        .mp-page{max-width:900px}
        .mp-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;gap:12px;flex-wrap:wrap}
        .mp-title{font-size:28px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .mp-sub{font-size:14px;color:#888;margin:0}
        .mp-add-btn{display:inline-flex;align-items:center;gap:6px;padding:12px 22px;background:#B8936D;color:white;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;transition:background .15s;white-space:nowrap;flex-shrink:0}
        .mp-add-btn:hover{background:#a07d5a}
        .mp-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
        .mp-stat{background:white;border-radius:10px;padding:14px 10px;border:2px solid #E5E5E0;cursor:pointer;text-align:center;transition:border-color .15s}
        .mp-stat:hover{border-color:#ccc}
        .mp-stat.on{border-color:#B8936D}
        .mp-stat-i{font-size:14px;margin-bottom:3px}
        .mp-stat-l{font-size:10px;color:#888;font-weight:500;margin-bottom:2px}
        .mp-stat-v{font-size:20px;font-weight:700;color:#2C2C2C}
        .mp-list{display:flex;flex-direction:column;gap:12px}
        .mp-card{background:white;border-radius:12px;padding:20px;border:1px solid #E5E5E0;transition:box-shadow .15s}
        .mp-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.06)}
        .mp-card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:10px}
        .mp-card-body{flex:1;min-width:0}
        .mp-card-title{font-size:17px;font-weight:700;color:#2C2C2C;margin-bottom:6px;line-height:1.3}
        .mp-card-meta{display:flex;gap:10px;font-size:13px;color:#666;flex-wrap:wrap;margin-bottom:8px}
        .mp-card-desc{font-size:13px;color:#888;line-height:1.5}
        .mp-badge{padding:4px 12px;border-radius:6px;font-size:11px;font-weight:700;white-space:nowrap;flex-shrink:0}
        .mp-actions{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:5px;padding-top:14px;border-top:1px solid #f0f0ec}
        .mp-btn{height:34px;padding:0 8px;border:none;border-radius:7px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:3px;font-size:12px;font-weight:700;transition:filter .15s;white-space:nowrap;width:100%;text-decoration:none;font-family:inherit}
        .mp-btn:hover:not(:disabled){filter:brightness(.92)}
        .mp-btn:disabled{opacity:.55;cursor:not-allowed;filter:none}
        .mp-btn-gold  {background:#B8936D;color:white}
        .mp-btn-slate {background:#E2E8F0;color:#334155}
        .mp-btn-red   {background:#EF4444;color:white}
        .mp-btn-loading{background:#ccc!important;color:#666!important}
        .mp-empty{background:white;border-radius:16px;padding:60px 24px;text-align:center;border:1px solid #E5E5E0}
        .mp-empty-icon{font-size:48px;margin-bottom:12px}
        .mp-empty-title{font-size:20px;font-weight:700;color:#2C2C2C;margin-bottom:8px}
        .mp-empty-sub{font-size:14px;color:#888;margin-bottom:20px}
        @media(max-width:1023px){.mp-title{font-size:24px}}
        @media(max-width:639px){
          .mp-header{flex-direction:column;align-items:stretch;gap:10px;margin-bottom:16px}
          .mp-add-btn{width:100%;justify-content:center;padding:13px}
          .mp-title{font-size:20px}
          .mp-sub{font-size:13px}
          .mp-stats{gap:6px;margin-bottom:14px}
          .mp-stat{padding:10px 4px;border-radius:8px}
          .mp-stat-i{font-size:12px}
          .mp-stat-l{font-size:9px}
          .mp-stat-v{font-size:18px}
          .mp-card{padding:14px;border-radius:10px}
          .mp-card-title{font-size:15px}
          .mp-card-meta{gap:8px;font-size:12px}
          .mp-card-desc{font-size:12px}
          .mp-actions{grid-template-columns:1fr 1fr;gap:6px;padding-top:12px}
          .mp-btn{height:36px;font-size:12px}
        }
        @media(max-width:380px){
          .mp-stats{grid-template-columns:1fr 1fr}
          .mp-stat:nth-child(4){display:none}
        }
      `}</style>

      <div className="mp-page">
        <div className="mp-header">
          <div>
            <h1 className="mp-title">My Packages</h1>
            <p className="mp-sub">Manage all your Umrah packages</p>
          </div>
          <Link href="/merchant/dashboard/pakej/new" className="mp-add-btn">➕ Add Package</Link>
        </div>

        <div className="mp-stats">
          {([
            { key: 'all',       icon: '📦', label: 'All',       v: stats.total },
            { key: 'published', icon: '✅', label: 'Published', v: stats.published },
            { key: 'draft',     icon: '📝', label: 'Draft',     v: stats.draft },
            { key: 'archived',  icon: '📁', label: 'Archived',  v: stats.archived },
          ] as const).map(s => (
            <div key={s.key} className={`mp-stat${filter === s.key ? ' on' : ''}`} onClick={() => setFilter(s.key)}>
              <div className="mp-stat-i">{s.icon}</div>
              <div className="mp-stat-l">{s.label}</div>
              <div className="mp-stat-v">{s.v}</div>
            </div>
          ))}
        </div>

        {filtered.length > 0 ? (
          <>
            <div className="mp-list">
              {paginated.map(pkg => (
                <div key={pkg.id} className="mp-card">
                  <div className="mp-card-top">
                    <div className="mp-card-body">
                      <div className="mp-card-title">{pkg.title}</div>
                      <div className="mp-card-meta">
                        <span>💰 RM {pkg.price_quad?.toLocaleString()}</span>
                        <span>🌙 {pkg.duration_nights} nights</span>
                        <span>📦 {pkg.package_type}</span>
                        <span>📅 {new Date(pkg.created_at).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                      {pkg.description && (
                        <div className="mp-card-desc">
                          {pkg.description.substring(0, 130)}{pkg.description.length > 130 ? '...' : ''}
                        </div>
                      )}
                    </div>
                    <StatusBadge status={pkg.status} />
                  </div>
                  <ActionButtons pkg={pkg} onDuplicate={handleDuplicate} onDelete={handleDelete} deleting={deleting} />
                </div>
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        ) : (
          <div className="mp-empty">
            <div className="mp-empty-icon">📦</div>
            <div className="mp-empty-title">
              {filter === 'all' ? 'No Packages Yet' : `No ${filter.charAt(0).toUpperCase() + filter.slice(1)} Packages`}
            </div>
            <p className="mp-empty-sub">
              {filter === 'all' ? 'Start by adding your first Umrah package' : 'No packages match this filter'}
            </p>
            {filter === 'all' && (
              <Link href="/merchant/dashboard/pakej/new" className="mp-add-btn" style={{ display: 'inline-flex' }}>➕ Add First Package</Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}