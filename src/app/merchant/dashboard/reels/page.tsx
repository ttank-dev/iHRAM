'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ReelsPage() {
  const [reels, setReels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadReels()
  }, [])

  const loadReels = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: agency } = await supabase
      .from('agencies')
      .select('id, slug')
      .eq('user_id', user.id)
      .single()

    if (!agency) return

    const { data } = await supabase
      .from('reels')
      .select('*')
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false })

    setReels(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Padam reel "${title}"?`)) return

    setDeleting(id)
    
    const { error } = await supabase
      .from('reels')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Gagal padam: ' + error.message)
      setDeleting(null)
      return
    }

    await loadReels()
    setDeleting(null)
  }

  const togglePublish = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('reels')
      .update({ is_published: !currentStatus })
      .eq('id', id)

    if (error) {
      alert('Gagal update: ' + error.message)
      return
    }

    await loadReels()
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <div style={{ fontSize: '16px', color: '#666' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
            Reels
          </h1>
          <p style={{ fontSize: '15px', color: '#666' }}>
            Urus semua video reels anda
          </p>
        </div>
        <Link
          href="/merchant/dashboard/reels/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 24px',
            backgroundColor: '#B8936D',
            color: 'white',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '700',
            textDecoration: 'none'
          }}
        >
          <span style={{ fontSize: '20px' }}>➕</span>
          <span>Upload Reel</span>
        </Link>
      </div>

      {reels.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {reels.map((reel) => (
            <div
              key={reel.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #E5E5E0'
              }}
            >
              {/* Thumbnail */}
              <div style={{
                position: 'relative',
                paddingBottom: '177.78%', // 9:16 aspect ratio
                backgroundColor: '#F5F5F0',
                backgroundImage: reel.thumbnail_url ? `url(${reel.thumbnail_url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                {!reel.thumbnail_url && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '48px',
                    opacity: 0.3
                  }}>
                    🎬
                  </div>
                )}

                {/* Play Icon */}
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '48px',
                  opacity: 0.9
                }}>
                  ▶️
                </div>

                {/* Status Badge */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  padding: '6px 12px',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: '700',
                  backgroundColor: reel.is_published ? 'rgba(46, 125, 50, 0.9)' : 'rgba(0, 0, 0, 0.6)',
                  color: 'white'
                }}>
                  {reel.is_published ? 'LIVE' : 'DRAFT'}
                </div>

                {/* Views */}
                <div style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  right: '12px',
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                    {reel.title}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>
                    👁️ {reel.views.toLocaleString()} views
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => togglePublish(reel.id, reel.is_published)}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#F0F8FF',
                    color: '#1976D2',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  {reel.is_published ? '📤 Unpublish' : '📣 Publish'}
                </button>

                <button
                  onClick={() => handleDelete(reel.id, reel.title)}
                  disabled={deleting === reel.id}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: deleting === reel.id ? '#CCC' : '#FEE',
                    color: deleting === reel.id ? '#666' : '#C33',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: deleting === reel.id ? 'not-allowed' : 'pointer',
                    width: '100%'
                  }}
                >
                  {deleting === reel.id ? '⏳ Deleting...' : '🗑️ Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '80px 40px',
          textAlign: 'center',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎬</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px' }}>
            Tiada Reels Lagi
          </h3>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
            Mulakan dengan upload video reel pertama anda
          </p>
          <Link
            href="/merchant/dashboard/reels/new"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: '#B8936D',
              color: 'white',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '700',
              textDecoration: 'none'
            }}
          >
            Upload Reel
          </Link>
        </div>
      )}
    </div>
  )
}