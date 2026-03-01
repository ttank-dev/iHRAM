'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Pagination from '@/app/Pagination'

function ActionButtons({ post, onToggle, onDelete, deleting }: {
  post: any
  onToggle: (id: string, current: boolean) => void
  onDelete: (id: string, title: string) => void
  deleting: string | null
}) {
  return (
    <div className="nf-actions">
      <Link href={`/merchant/dashboard/newsfeed/edit/${post.id}`} className="nf-btn nf-btn-gold">✏️ Edit</Link>
      <button className={`nf-btn ${post.is_published ? 'nf-btn-amber' : 'nf-btn-green'}`}
        onClick={() => onToggle(post.id, post.is_published)}>
        {post.is_published ? '⏸ Unpublish' : '📣 Publish'}
      </button>
      <button className="nf-btn nf-btn-slate"
        onClick={() => window.open(`/agensi/${post.agencies?.slug}`, '_blank')}>
        👁 Preview
      </button>
      <button className={`nf-btn nf-btn-red${deleting === post.id ? ' nf-btn-loading' : ''}`}
        onClick={() => onDelete(post.id, post.title)} disabled={deleting === post.id}>
        {deleting === post.id ? '⏳...' : '🗑 Delete'}
      </button>
    </div>
  )
}

const ITEMS_PER_PAGE = 10

export default function NewsFeedPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
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
    await loadPosts(data.agencyId)
  }

  const loadPosts = async (aid: string) => {
    const { data } = await supabase
      .from('news_feed').select('*, agencies(slug)').eq('agency_id', aid)
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete post "${title}"?\n\nThis cannot be undone.`)) return
    setDeleting(id)
    const { error } = await supabase.from('news_feed').delete().eq('id', id)
    if (error) { alert('Failed to delete: ' + error.message); setDeleting(null); return }
    setPosts(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  const togglePublish = async (id: string, current: boolean) => {
    const { error } = await supabase.from('news_feed').update({ is_published: !current }).eq('id', id)
    if (error) { alert('Failed to update: ' + error.message); return }
    setPosts(prev => prev.map(p => p.id === id ? { ...p, is_published: !current } : p))
  }

  const stats = {
    total:     posts.length,
    published: posts.filter(p => p.is_published).length,
    draft:     posts.filter(p => !p.is_published).length,
  }

  const filtered   = filter === 'published' ? posts.filter(p => p.is_published)
    : filter === 'draft' ? posts.filter(p => !p.is_published) : posts
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  if (loading) return (
    <>
      <div className="nf-load"><div className="nf-spin" /><p>Loading...</p></div>
      <style>{`.nf-load{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;gap:16px;color:#999}.nf-spin{width:36px;height:36px;border:3px solid #e5e5e5;border-top-color:#B8936D;border-radius:50%;animation:nfs .7s linear infinite}@keyframes nfs{to{transform:rotate(360deg)}}`}</style>
    </>
  )

  return (
    <>
      <style>{`
        .nf,.nf *{box-sizing:border-box}
        .nf{max-width:900px;width:100%;overflow:hidden}
        .nf-header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:20px;flex-wrap:wrap}
        .nf-title{font-size:28px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .nf-sub{font-size:14px;color:#888;margin:0}
        .nf-add{display:inline-flex;align-items:center;gap:6px;padding:12px 22px;background:#B8936D;color:white;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;transition:background .15s;white-space:nowrap;flex-shrink:0}
        .nf-add:hover{background:#a07d5a}
        .nf-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px}
        .nf-stat{background:white;border-radius:10px;padding:14px 10px;border:2px solid #E5E5E0;cursor:pointer;text-align:center;transition:border-color .15s}
        .nf-stat:hover{border-color:#ccc}
        .nf-stat.on{border-color:#B8936D}
        .nf-stat-i{font-size:14px;margin-bottom:3px}
        .nf-stat-l{font-size:10px;color:#888;font-weight:500;margin-bottom:2px}
        .nf-stat-v{font-size:22px;font-weight:700;color:#2C2C2C}
        .nf-list{display:flex;flex-direction:column;gap:12px}
        .nf-card{background:white;border-radius:12px;padding:20px;border:1px solid #E5E5E0;transition:box-shadow .15s}
        .nf-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.06)}
        .nf-card-inner{display:flex;gap:20px}
        .nf-thumb{width:180px;height:130px;flex-shrink:0;background:#F5F5F0;border-radius:8px;background-size:cover;background-position:center;position:relative}
        .nf-thumb-more{position:absolute;bottom:6px;right:6px;padding:3px 8px;background:rgba(0,0,0,.65);color:white;border-radius:4px;font-size:11px;font-weight:600}
        .nf-card-body{flex:1;min-width:0}
        .nf-card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;margin-bottom:8px}
        .nf-card-title{font-size:17px;font-weight:700;color:#2C2C2C;line-height:1.3}
        .nf-badge{padding:4px 12px;border-radius:6px;font-size:11px;font-weight:700;white-space:nowrap;flex-shrink:0}
        .nf-badge-pub{background:#ECFDF5;color:#10B981}
        .nf-badge-draft{background:#F5F5F5;color:#888}
        .nf-excerpt{font-size:13px;color:#666;line-height:1.6;margin-bottom:10px}
        .nf-date{font-size:12px;color:#aaa;margin-bottom:14px}
        .nf-actions{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:5px;padding-top:14px;border-top:1px solid #f0f0ec}
        .nf-btn{height:34px;padding:0 8px;border:none;border-radius:7px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:3px;font-size:12px;font-weight:700;transition:filter .15s;white-space:nowrap;width:100%;text-decoration:none;font-family:inherit}
        .nf-btn:hover:not(:disabled){filter:brightness(.92)}
        .nf-btn:disabled{opacity:.55;cursor:not-allowed;filter:none}
        .nf-btn-gold  {background:#B8936D;color:white}
        .nf-btn-green {background:#10B981;color:white}
        .nf-btn-amber {background:#F59E0B;color:white}
        .nf-btn-slate {background:#E2E8F0;color:#334155}
        .nf-btn-red   {background:#EF4444;color:white}
        .nf-btn-loading{background:#ccc!important;color:#666!important}
        .nf-empty{background:white;border-radius:16px;padding:60px 24px;text-align:center;border:1px solid #E5E5E0}
        .nf-empty-icon{font-size:48px;margin-bottom:12px}
        .nf-empty-title{font-size:20px;font-weight:700;color:#2C2C2C;margin-bottom:8px}
        .nf-empty-sub{font-size:14px;color:#888;margin-bottom:20px}
        @media(max-width:1023px){.nf-title{font-size:24px}.nf-thumb{width:150px;height:110px}}
        @media(max-width:639px){
          .nf-header{flex-direction:column;align-items:stretch;gap:10px;margin-bottom:16px}
          .nf-add{width:100%;justify-content:center;padding:13px}
          .nf-title{font-size:20px}
          .nf-stats{gap:6px;margin-bottom:14px}
          .nf-stat{padding:10px 4px;border-radius:8px}
          .nf-stat-i{font-size:12px}
          .nf-stat-l{font-size:9px}
          .nf-stat-v{font-size:19px}
          .nf-card{padding:14px;border-radius:10px}
          .nf-card-inner{flex-direction:column;gap:10px}
          .nf-thumb{width:100%;height:160px}
          .nf-card-title{font-size:15px}
          .nf-excerpt{font-size:13px}
          .nf-actions{grid-template-columns:1fr 1fr;gap:6px;padding-top:12px}
          .nf-btn{height:36px;font-size:12px}
        }
        @media(max-width:380px){.nf-thumb{height:130px}.nf-card-title{font-size:14px}}
      `}</style>

      <div className="nf">
        <div className="nf-header">
          <div>
            <h1 className="nf-title">News Feed</h1>
            <p className="nf-sub">Manage all your news feed posts</p>
          </div>
          <Link href="/merchant/dashboard/newsfeed/new" className="nf-add">➕ New Post</Link>
        </div>

        <div className="nf-stats">
          {([
            { key: 'all',       icon: '📰', label: 'All',       v: stats.total },
            { key: 'published', icon: '✅', label: 'Published', v: stats.published },
            { key: 'draft',     icon: '📝', label: 'Draft',     v: stats.draft },
          ] as const).map(s => (
            <div key={s.key} className={`nf-stat${filter === s.key ? ' on' : ''}`} onClick={() => setFilter(s.key)}>
              <div className="nf-stat-i">{s.icon}</div>
              <div className="nf-stat-l">{s.label}</div>
              <div className="nf-stat-v">{s.v}</div>
            </div>
          ))}
        </div>

        {filtered.length > 0 ? (
          <>
            <div className="nf-list">
              {paginated.map(post => (
                <div key={post.id} className="nf-card">
                  <div className="nf-card-inner">
                    {post.images && post.images.length > 0 && (
                      <div className="nf-thumb" style={{ backgroundImage: `url(${post.images[0]})` }}>
                        {post.images.length > 1 && <div className="nf-thumb-more">+{post.images.length - 1}</div>}
                      </div>
                    )}
                    <div className="nf-card-body">
                      <div className="nf-card-top">
                        <div className="nf-card-title">{post.title}</div>
                        <span className={`nf-badge ${post.is_published ? 'nf-badge-pub' : 'nf-badge-draft'}`}>
                          {post.is_published ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </div>
                      <p className="nf-excerpt">
                        {post.content.substring(0, 200)}{post.content.length > 200 ? '...' : ''}
                      </p>
                      <div className="nf-date">
                        📅 {new Date(post.created_at).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <ActionButtons post={post} onToggle={togglePublish} onDelete={handleDelete} deleting={deleting} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        ) : (
          <div className="nf-empty">
            <div className="nf-empty-icon">📰</div>
            <div className="nf-empty-title">
              {filter === 'all' ? 'No Posts Yet' : filter === 'published' ? 'No Published Posts' : 'No Draft Posts'}
            </div>
            <p className="nf-empty-sub">
              {filter === 'all' ? 'Start by adding your first news feed post' : 'No posts match this filter'}
            </p>
            {filter === 'all' && (
              <Link href="/merchant/dashboard/newsfeed/new" className="nf-add" style={{ display: 'inline-flex', margin: '0 auto' }}>
                ➕ New Post
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  )
}