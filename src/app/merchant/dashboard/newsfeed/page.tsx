'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewsFeedPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [agencySlug, setAgencySlug] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { init() }, [])

  const init = async () => {
    const res = await fetch('/api/merchant/me')
    if (!res.ok) { router.push('/merchant/login'); return }
    const data = await res.json()
    if (!data.agencyId) { router.push('/merchant/login'); return }
    setAgencyId(data.agencyId)
    setAgencySlug(data.agencySlug || null)
    await loadPosts(data.agencyId)
  }

  const loadPosts = async (aid: string) => {
    const { data } = await supabase
      .from('news_feed')
      .select('*, agencies(slug)')
      .eq('agency_id', aid)
      .order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Padam post "${title}"?`)) return
    setDeleting(id)
    const { error } = await supabase.from('news_feed').delete().eq('id', id)
    if (error) { alert('Gagal padam: ' + error.message); setDeleting(null); return }
    if (agencyId) await loadPosts(agencyId)
    setDeleting(null)
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('news_feed').update({ is_published: !currentStatus }).eq('id', id)
    if (error) { alert('Gagal update: ' + error.message); return }
    if (agencyId) await loadPosts(agencyId)
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
      <div style={{ fontSize: '16px', color: '#666' }}>Loading...</div>
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>News Feed</h1>
          <p style={{ fontSize: '15px', color: '#666' }}>Urus semua post news feed anda</p>
        </div>
        <Link href="/merchant/dashboard/newsfeed/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '14px 24px', backgroundColor: '#B8936D', color: 'white',
          borderRadius: '10px', fontSize: '15px', fontWeight: '700', textDecoration: 'none'
        }}>
          <span>➕</span><span>Tambah Post</span>
        </Link>
      </div>

      {posts.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {posts.map((post) => (
            <div key={post.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #E5E5E0' }}>
              <div style={{ display: 'flex', gap: '24px' }}>
                {post.images && post.images.length > 0 && (
                  <div style={{
                    width: '200px', height: '150px', backgroundColor: '#F5F5F0', borderRadius: '8px',
                    backgroundImage: `url(${post.images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center',
                    flexShrink: 0, position: 'relative'
                  }}>
                    {post.images.length > 1 && (
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', padding: '4px 8px', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', borderRadius: '4px', fontSize: '12px', fontWeight: '600' }}>
                        +{post.images.length - 1}
                      </div>
                    )}
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#2C2C2C' }}>{post.title}</h3>
                    <div style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', backgroundColor: post.is_published ? '#E8F5E9' : '#F5F5F5', color: post.is_published ? '#2E7D32' : '#666' }}>
                      {post.is_published ? 'PUBLISHED' : 'DRAFT'}
                    </div>
                  </div>
                  <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6', marginBottom: '12px' }}>
                    {post.content.substring(0, 200)}{post.content.length > 200 ? '...' : ''}
                  </p>
                  <div style={{ fontSize: '13px', color: '#999', marginBottom: '16px' }}>
                    📅 {new Date(post.created_at).toLocaleDateString('ms-MY')}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Link href={`/merchant/dashboard/newsfeed/edit/${post.id}`} style={{ padding: '8px 16px', backgroundColor: '#F5F5F0', color: '#2C2C2C', borderRadius: '8px', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>✏️ Edit</Link>
                    <button onClick={() => togglePublish(post.id, post.is_published)} style={{ padding: '8px 16px', backgroundColor: '#F0F8FF', color: '#1976D2', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                      {post.is_published ? '📤 Unpublish' : '📣 Publish'}
                    </button>
                    <button onClick={() => window.open(`/agensi/${post.agencies?.slug}`, '_blank')} style={{ padding: '8px 16px', backgroundColor: '#F0FFF4', color: '#2E7D32', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>👁️ Preview</button>
                    <button onClick={() => handleDelete(post.id, post.title)} disabled={deleting === post.id} style={{ padding: '8px 16px', backgroundColor: deleting === post.id ? '#CCC' : '#FEE', color: deleting === post.id ? '#666' : '#C33', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: deleting === post.id ? 'not-allowed' : 'pointer' }}>
                      {deleting === post.id ? '⏳ Deleting...' : '🗑️ Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '80px 40px', textAlign: 'center', border: '1px solid #E5E5E0' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📰</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px' }}>Tiada Post Lagi</h3>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>Mulakan dengan menambah post news feed pertama anda</p>
          <Link href="/merchant/dashboard/newsfeed/new" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: '#B8936D', color: 'white', borderRadius: '10px', fontSize: '16px', fontWeight: '700', textDecoration: 'none' }}>Tambah Post</Link>
        </div>
      )}
    </div>
  )
}