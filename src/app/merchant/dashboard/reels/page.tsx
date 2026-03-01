'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Pagination from '@/app/Pagination'

function ActionButtons({ reel, onToggle, onDelete, deleting }: {
  reel: any
  onToggle: (id: string, current: boolean) => void
  onDelete: (id: string, title: string) => void
  deleting: string | null
}) {
  return (
    <div className="rl-actions">
      <button className={`rl-btn ${reel.is_published ? 'rl-btn-amber' : 'rl-btn-green'}`}
        onClick={() => onToggle(reel.id, reel.is_published)}>
        {reel.is_published ? '⏸ Unpublish' : '📣 Publish'}
      </button>
      <button className={`rl-btn rl-btn-red${deleting === reel.id ? ' rl-btn-loading' : ''}`}
        onClick={() => onDelete(reel.id, reel.title)} disabled={deleting === reel.id}>
        {deleting === reel.id ? '⏳...' : '🗑 Delete'}
      </button>
    </div>
  )
}

const ITEMS_PER_PAGE = 12 // 12 = 3 rows of 4, or 4 rows of 3

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [playingReel, setPlayingReel] = useState<any>(null)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
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
    await loadReels(data.agencyId)
  }

  const loadReels = async (aid: string) => {
    const { data } = await supabase.from('reels').select('*').eq('agency_id', aid)
      .order('created_at', { ascending: false })
    setReels(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete reel "${title}"?\n\nThis cannot be undone.`)) return
    setDeleting(id)
    const { error } = await supabase.from('reels').delete().eq('id', id)
    if (error) { alert('Failed to delete: ' + error.message); setDeleting(null); return }
    setReels(prev => prev.filter(r => r.id !== id))
    setDeleting(null)
  }

  const togglePublish = async (id: string, current: boolean) => {
    const { error } = await supabase.from('reels').update({ is_published: !current }).eq('id', id)
    if (error) { alert('Failed to update: ' + error.message); return }
    setReels(prev => prev.map(r => r.id === id ? { ...r, is_published: !current } : r))
  }

  const stats = {
    total:     reels.length,
    published: reels.filter(r => r.is_published).length,
    draft:     reels.filter(r => !r.is_published).length,
  }

  const filtered   = filter === 'published' ? reels.filter(r => r.is_published)
    : filter === 'draft' ? reels.filter(r => !r.is_published) : reels
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  if (loading) return (
    <>
      <div className="rl-load"><div className="rl-spin" /><p>Loading...</p></div>
      <style>{`.rl-load{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;gap:16px;color:#999}.rl-spin{width:36px;height:36px;border:3px solid #e5e5e5;border-top-color:#B8936D;border-radius:50%;animation:rls .7s linear infinite}@keyframes rls{to{transform:rotate(360deg)}}`}</style>
    </>
  )

  return (
    <>
      <style>{`
        .rl,.rl *{box-sizing:border-box}
        .rl{max-width:900px;width:100%;overflow:hidden}
        .rl-header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:20px;flex-wrap:wrap}
        .rl-title{font-size:28px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .rl-sub{font-size:14px;color:#888;margin:0}
        .rl-add{display:inline-flex;align-items:center;gap:6px;padding:12px 22px;background:#B8936D;color:white;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;transition:background .15s;white-space:nowrap;flex-shrink:0}
        .rl-add:hover{background:#a07d5a}
        .rl-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
        .rl-stat{background:white;border-radius:10px;padding:14px 10px;border:2px solid #E5E5E0;cursor:pointer;text-align:center;transition:border-color .15s}
        .rl-stat:hover{border-color:#ccc}
        .rl-stat.on{border-color:#B8936D}
        .rl-stat-i{font-size:14px;margin-bottom:3px}
        .rl-stat-l{font-size:10px;color:#888;font-weight:500;margin-bottom:2px}
        .rl-stat-v{font-size:22px;font-weight:700;color:#2C2C2C}
        .rl-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .rl-card{background:white;border-radius:12px;overflow:hidden;border:1px solid #E5E5E0;transition:box-shadow .15s}
        .rl-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.08)}
        .rl-thumb{position:relative;padding-bottom:177.78%;background:#1A1A1A;cursor:pointer}
        .rl-thumb-bg{position:absolute;inset:0;background-size:cover;background-position:center}
        .rl-thumb-placeholder{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:40px;opacity:.2}
        .rl-play{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:52px;height:52px;border-radius:50%;background:rgba(255,255,255,.92);display:flex;align-items:center;justify-content:center;font-size:20px;padding-left:4px;box-shadow:0 4px 20px rgba(0,0,0,.4);transition:transform .15s}
        .rl-thumb:hover .rl-play{transform:translate(-50%,-50%) scale(1.08)}
        .rl-status-badge{position:absolute;top:8px;left:8px;padding:3px 10px;border-radius:10px;font-size:10px;font-weight:700;color:white}
        .rl-status-pub{background:rgba(16,185,129,.9)}
        .rl-status-draft{background:rgba(0,0,0,.65)}
        .rl-overlay{position:absolute;bottom:0;left:0;right:0;padding:28px 10px 10px;background:linear-gradient(transparent,rgba(0,0,0,.75));color:white}
        .rl-overlay-title{font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px}
        .rl-overlay-views{font-size:10px;opacity:.85}
        .rl-actions{padding:10px;display:grid;grid-template-columns:1fr 1fr;gap:6px}
        .rl-btn{height:34px;padding:0 6px;border:none;border-radius:7px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:3px;font-size:12px;font-weight:700;transition:filter .15s;white-space:nowrap;width:100%;font-family:inherit}
        .rl-btn:hover:not(:disabled){filter:brightness(.92)}
        .rl-btn:disabled{opacity:.55;cursor:not-allowed;filter:none}
        .rl-btn-green {background:#10B981;color:white}
        .rl-btn-amber {background:#F59E0B;color:white}
        .rl-btn-red   {background:#EF4444;color:white}
        .rl-btn-loading{background:#ccc!important;color:#666!important}
        .rl-empty{background:white;border-radius:16px;padding:60px 24px;text-align:center;border:1px solid #E5E5E0}
        .rl-empty-icon{font-size:48px;margin-bottom:12px}
        .rl-empty-title{font-size:20px;font-weight:700;color:#2C2C2C;margin-bottom:8px}
        .rl-empty-sub{font-size:14px;color:#888;margin-bottom:20px}
        .rl-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.95);display:flex;align-items:center;justify-content:center;z-index:9999;cursor:pointer;padding:16px}
        .rl-modal{max-width:420px;width:100%;background:#000;border-radius:16px;overflow:hidden;position:relative;cursor:default}
        .rl-modal-close{position:absolute;top:10px;right:10px;width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.9);border:none;font-size:16px;cursor:pointer;z-index:10;display:flex;align-items:center;justify-content:center;font-weight:700}
        .rl-modal-video{width:100%;height:auto;max-height:80vh;display:block}
        .rl-modal-info{padding:14px;background:#1A1A1A;color:white}
        .rl-modal-title{font-size:14px;font-weight:600;margin-bottom:4px}
        .rl-modal-meta{font-size:12px;color:#999;display:flex;gap:12px}
        @media(max-width:1023px){.rl-title{font-size:24px}.rl-grid{grid-template-columns:repeat(3,1fr);gap:12px}}
        @media(max-width:639px){
          .rl-header{flex-direction:column;align-items:stretch;gap:10px;margin-bottom:16px}
          .rl-add{width:100%;justify-content:center;padding:13px}
          .rl-title{font-size:20px}
          .rl-stats{gap:6px;margin-bottom:14px}
          .rl-stat{padding:10px 4px}
          .rl-stat-i{font-size:12px}
          .rl-stat-l{font-size:9px}
          .rl-stat-v{font-size:19px}
          .rl-grid{grid-template-columns:repeat(2,1fr);gap:10px}
          .rl-play{width:44px;height:44px;font-size:18px}
          .rl-overlay-title{font-size:11px}
        }
        @media(max-width:380px){.rl-grid{grid-template-columns:repeat(2,1fr);gap:8px}.rl-btn{height:32px;font-size:11px}}
      `}</style>

      <div className="rl">
        <div className="rl-header">
          <div>
            <h1 className="rl-title">Reels</h1>
            <p className="rl-sub">Manage all your video reels</p>
          </div>
          <Link href="/merchant/dashboard/reels/new" className="rl-add">➕ Upload Reel</Link>
        </div>

        <div className="rl-stats">
          {([
            { key: 'all',       icon: '🎬', label: 'All',       v: stats.total },
            { key: 'published', icon: '✅', label: 'Published', v: stats.published },
            { key: 'draft',     icon: '📝', label: 'Draft',     v: stats.draft },
          ] as const).map(s => (
            <div key={s.key} className={`rl-stat${filter === s.key ? ' on' : ''}`} onClick={() => setFilter(s.key)}>
              <div className="rl-stat-i">{s.icon}</div>
              <div className="rl-stat-l">{s.label}</div>
              <div className="rl-stat-v">{s.v}</div>
            </div>
          ))}
        </div>

        {filtered.length > 0 ? (
          <>
            <div className="rl-grid">
              {paginated.map(reel => (
                <div key={reel.id} className="rl-card">
                  <div className="rl-thumb" onClick={() => reel.video_url && setPlayingReel(reel)}>
                    {reel.thumbnail_url && <div className="rl-thumb-bg" style={{ backgroundImage: `url(${reel.thumbnail_url})` }} />}
                    {!reel.thumbnail_url && <div className="rl-thumb-placeholder">🎬</div>}
                    {reel.video_url && <div className="rl-play">▶</div>}
                    <div className={`rl-status-badge ${reel.is_published ? 'rl-status-pub' : 'rl-status-draft'}`}>
                      {reel.is_published ? 'PUBLISHED' : 'DRAFT'}
                    </div>
                    <div className="rl-overlay">
                      <div className="rl-overlay-title">{reel.title}</div>
                      <div className="rl-overlay-views">👁 {reel.views?.toLocaleString() || 0} views</div>
                    </div>
                  </div>
                  <ActionButtons reel={reel} onToggle={togglePublish} onDelete={handleDelete} deleting={deleting} />
                </div>
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        ) : (
          <div className="rl-empty">
            <div className="rl-empty-icon">🎬</div>
            <div className="rl-empty-title">
              {filter === 'all' ? 'No Reels Yet' : filter === 'published' ? 'No Published Reels' : 'No Draft Reels'}
            </div>
            <p className="rl-empty-sub">
              {filter === 'all' ? 'Start by uploading your first video reel' : 'No reels match this filter'}
            </p>
            {filter === 'all' && (
              <Link href="/merchant/dashboard/reels/new" className="rl-add" style={{ display: 'inline-flex', margin: '0 auto' }}>
                ➕ Upload Reel
              </Link>
            )}
          </div>
        )}
      </div>

      {playingReel && (
        <div className="rl-modal-overlay" onClick={() => setPlayingReel(null)}>
          <div className="rl-modal" onClick={e => e.stopPropagation()}>
            <button className="rl-modal-close" onClick={() => setPlayingReel(null)}>✕</button>
            <video src={playingReel.video_url} controls autoPlay playsInline className="rl-modal-video" />
            <div className="rl-modal-info">
              <div className="rl-modal-title">{playingReel.title || 'Untitled'}</div>
              <div className="rl-modal-meta">
                <span>👁 {playingReel.views?.toLocaleString() || 0} views</span>
                <span>{playingReel.is_published ? '✅ PUBLISHED' : '⚫ DRAFT'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}