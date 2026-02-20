'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [playingReel, setPlayingReel] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { init() }, [])

  const init = async () => {
    const res = await fetch('/api/merchant/me')
    if (!res.ok) { router.push('/merchant/login'); return }
    const data = await res.json()
    if (!data.agencyId) { router.push('/merchant/login'); return }
    setAgencyId(data.agencyId)
    await loadReels(data.agencyId)
  }

  const loadReels = async (aid: string) => {
    const { data } = await supabase.from('reels').select('*').eq('agency_id', aid).order('created_at', { ascending: false })
    setReels(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Padam reel "${title}"?`)) return
    setDeleting(id)
    const { error } = await supabase.from('reels').delete().eq('id', id)
    if (error) { alert('Gagal padam: ' + error.message); setDeleting(null); return }
    if (agencyId) await loadReels(agencyId)
    setDeleting(null)
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('reels').update({ is_published: !currentStatus }).eq('id', id)
    if (error) { alert('Gagal update: ' + error.message); return }
    if (agencyId) await loadReels(agencyId)
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
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>Reels</h1>
          <p style={{ fontSize: '15px', color: '#666' }}>Urus semua video reels anda</p>
        </div>
        <Link href="/merchant/dashboard/reels/new" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '14px 24px', backgroundColor: '#B8936D', color: 'white',
          borderRadius: '10px', fontSize: '15px', fontWeight: '700', textDecoration: 'none'
        }}>
          <span>➕</span><span>Upload Reel</span>
        </Link>
      </div>

      {reels.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {reels.map((reel) => (
            <div key={reel.id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E5E0' }}>

              {/* THUMBNAIL — click untuk buka modal */}
              <div
                onClick={() => reel.video_url && setPlayingReel(reel)}
                style={{
                  position: 'relative',
                  paddingBottom: '177.78%',
                  backgroundColor: '#1A1A1A',
                  backgroundImage: reel.thumbnail_url ? `url(${reel.thumbnail_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  cursor: reel.video_url ? 'pointer' : 'default'
                }}
              >
                {/* Placeholder icon kalau takde thumbnail */}
                {!reel.thumbnail_url && (
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '48px', opacity: 0.25 }}>🎬</div>
                )}

                {/* Play button */}
                {reel.video_url && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '56px', height: '56px', borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.92)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px', paddingLeft: '4px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
                  }}>
                    ▶
                  </div>
                )}

                {/* Status badge */}
                <div style={{
                  position: 'absolute', top: '10px', left: '10px',
                  padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700',
                  backgroundColor: reel.is_published ? 'rgba(46,125,50,0.92)' : 'rgba(0,0,0,0.65)',
                  color: 'white'
                }}>
                  {reel.is_published ? '🔴 LIVE' : 'DRAFT'}
                </div>

                {/* Title + views overlay */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  padding: '32px 12px 12px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                  color: 'white'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {reel.title}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.85 }}>
                    👁️ {reel.views?.toLocaleString() || 0} views
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => togglePublish(reel.id, reel.is_published)} style={{
                  padding: '9px 16px', backgroundColor: '#F0F8FF', color: '#1976D2',
                  border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer', width: '100%'
                }}>
                  {reel.is_published ? '📤 Unpublish' : '📣 Publish'}
                </button>
                <button onClick={() => handleDelete(reel.id, reel.title)} disabled={deleting === reel.id} style={{
                  padding: '9px 16px',
                  backgroundColor: deleting === reel.id ? '#CCC' : '#FEE',
                  color: deleting === reel.id ? '#666' : '#C33',
                  border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                  cursor: deleting === reel.id ? 'not-allowed' : 'pointer', width: '100%'
                }}>
                  {deleting === reel.id ? '⏳ Deleting...' : '🗑️ Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '80px 40px', textAlign: 'center', border: '1px solid #E5E5E0' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎬</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px' }}>Tiada Reels Lagi</h3>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>Mulakan dengan upload video reel pertama anda</p>
          <Link href="/merchant/dashboard/reels/new" style={{ display: 'inline-block', padding: '14px 32px', backgroundColor: '#B8936D', color: 'white', borderRadius: '10px', fontSize: '16px', fontWeight: '700', textDecoration: 'none' }}>Upload Reel</Link>
        </div>
      )}

      {/* VIDEO MODAL — same style macam admin */}
      {playingReel && (
        <div
          onClick={() => setPlayingReel(null)}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.95)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, cursor: 'pointer'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '420px', width: '90%',
              backgroundColor: '#000', borderRadius: '16px',
              overflow: 'hidden', position: 'relative',
              cursor: 'default'
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setPlayingReel(null)}
              style={{
                position: 'absolute', top: '12px', right: '12px',
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.9)', border: 'none',
                fontSize: '18px', cursor: 'pointer', zIndex: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>

            {/* Video */}
            <video
              src={playingReel.video_url}
              controls
              autoPlay
              playsInline
              style={{ width: '100%', height: 'auto', maxHeight: '80vh', display: 'block' }}
            />

            {/* Info bar */}
            <div style={{ padding: '16px', backgroundColor: '#1A1A1A', color: 'white' }}>
              <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
                {playingReel.title || 'Untitled'}
              </div>
              <div style={{ fontSize: '12px', color: '#999', display: 'flex', gap: '12px' }}>
                <span>👁️ {playingReel.views?.toLocaleString() || 0} views</span>
                <span>{playingReel.is_published ? '🔴 LIVE' : '⚫ DRAFT'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}