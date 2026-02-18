'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AlbumActions from './AlbumActions'

export default function GaleriClient({ initialAlbums }: { initialAlbums: any[] }) {
  const supabase = createClient()
  
  const [albums, setAlbums] = useState(initialAlbums)
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null)
  const [albumPhotos, setAlbumPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const openAlbum = async (album: any) => {
    setLoading(true)
    setSelectedAlbum(album)
    
    const { data } = await supabase
      .from('album_photos')
      .select('*')
      .eq('album_id', album.id)
      .order('photo_order')
    
    setAlbumPhotos(data || [])
    setLoading(false)
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return

    try {
      const { error } = await supabase
        .from('album_photos')
        .delete()
        .eq('id', photoId)

      if (error) throw error
      
      alert('✅ Photo deleted!')
      if (selectedAlbum) {
        const { data } = await supabase
          .from('album_photos')
          .select('*')
          .eq('album_id', selectedAlbum.id)
          .order('photo_order')
        setAlbumPhotos(data || [])
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  const stats = {
    total: albums.length,
    published: albums.filter(a => a.is_published).length,
    draft: albums.filter(a => !a.is_published).length
  }

  if (!selectedAlbum) {
    // ALBUMS LIST
    return (
      <div>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
            Galeri Management
          </h1>
          <p style={{ fontSize: '16px', color: '#666' }}>
            Moderate photo albums from all agencies
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #E5E5E0' }}>
            <div style={{ fontSize: '13px', color: '#999', fontWeight: '600', marginBottom: '8px' }}>Total Albums</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C' }}>{stats.total}</div>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #E5E5E0' }}>
            <div style={{ fontSize: '13px', color: '#999', fontWeight: '600', marginBottom: '8px' }}>Published</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10B981' }}>{stats.published}</div>
          </div>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #E5E5E0' }}>
            <div style={{ fontSize: '13px', color: '#999', fontWeight: '600', marginBottom: '8px' }}>Draft</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F59E0B' }}>{stats.draft}</div>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E5E5E0', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #E5E5E0' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C' }}>All Albums</h2>
          </div>

          {albums.length === 0 ? (
            <div style={{ padding: '80px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🖼️</div>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>No Albums Yet</div>
            </div>
          ) : (
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {albums.map((album) => (
                <div key={album.id} style={{ padding: '20px', backgroundColor: '#F5F5F0', borderRadius: '12px', display: 'flex', gap: '16px' }}>
                  <div
                    onClick={() => openAlbum(album)}
                    style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '8px',
                      backgroundImage: album.cover_photo_url ? `url(${album.cover_photo_url})` : 'none',
                      backgroundColor: album.cover_photo_url ? 'transparent' : '#E5E5E0',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px',
                      cursor: 'pointer'
                    }}
                  >
                    {!album.cover_photo_url && '🖼️'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#2C2C2C', marginBottom: '4px' }}>
                          {album.agencies?.name || 'Unknown Agency'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#999' }}>
                          {new Date(album.created_at).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: album.is_published ? '#ECFDF5' : '#FEE2E2',
                        color: album.is_published ? '#10B981' : '#F59E0B'
                      }}>
                        {album.is_published ? '✓ Published' : '✗ Draft'}
                      </span>
                    </div>

                    <h3
                      onClick={() => openAlbum(album)}
                      style={{ fontSize: '16px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px', cursor: 'pointer' }}
                    >
                      {album.title}
                    </h3>

                    {album.description && (
                      <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', marginBottom: '8px' }}>
                        {album.description}
                      </p>
                    )}

                    <div style={{ fontSize: '14px', color: '#999', marginBottom: '12px' }}>
                      📷 {album.photo_count || 0} gambar
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        onClick={() => openAlbum(album)}
                        style={{
                          padding: '6px 16px',
                          backgroundColor: '#B8936D',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        👁️ View Photos
                      </button>
                      <AlbumActions album={album} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // ALBUM PHOTOS VIEW
  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <button
          onClick={() => setSelectedAlbum(null)}
          style={{
            marginBottom: '16px',
            padding: '10px 20px',
            backgroundColor: 'white',
            color: '#B8936D',
            border: '2px solid #B8936D',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          ← Back to Albums
        </button>

        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
            {selectedAlbum.title}
          </h2>
          <p style={{ fontSize: '16px', color: '#666' }}>
            {selectedAlbum.agencies?.name || 'Unknown Agency'} • 📷 {albumPhotos.length} gambar
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <p>Loading...</p>
        </div>
      ) : albumPhotos.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '16px'
        }}>
          {albumPhotos.map((photo) => (
            <div
              key={photo.id}
              style={{
                position: 'relative',
                aspectRatio: '1',
                backgroundColor: '#F5F5F0',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid #E5E5E0'
              }}
            >
              <img
                src={photo.photo_url}
                alt={photo.caption || 'Photo'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />

              {/* DELETE BUTTON - EXACT MERCHANT PATTERN */}
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px'
              }}>
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.95)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  🗑️
                </button>
              </div>

              {photo.caption && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  color: 'white',
                  padding: '24px 12px 12px',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}>
                  {photo.caption}
                </div>
              )}
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
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📷</div>
          <div style={{ fontSize: '20px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
            No Photos in Album
          </div>
        </div>
      )}
    </div>
  )
}