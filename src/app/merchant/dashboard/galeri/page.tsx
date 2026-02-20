'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Album {
  id: string
  title: string
  description: string | null
  cover_photo_url: string | null
  photo_count: number
  created_at: string
  is_published: boolean
}

interface AlbumPhoto {
  id: string
  photo_url: string
  caption: string | null
  photo_order: number
}

export default function MerchantGaleriPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [albums, setAlbums] = useState<Album[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [albumPhotos, setAlbumPhotos] = useState<AlbumPhoto[]>([])
  
  const [showAlbumModal, setShowAlbumModal] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)
  const [albumForm, setAlbumForm] = useState({ title: '', description: '', is_published: true })
  
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState<File[]>([])
  const [photoCaptions, setPhotoCaptions] = useState<{[key: number]: string}>({})
  const [uploading, setUploading] = useState(false)

  useEffect(() => { init() }, [])

  const init = async () => {
    try {
      const res = await fetch('/api/merchant/me')
      if (!res.ok) { router.push('/merchant/login'); return }
      const data = await res.json()
      if (!data.agencyId) { router.push('/merchant/login'); return }
      setAgencyId(data.agencyId)
      await fetchAlbums(data.agencyId)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAlbums = async (aid: string) => {
    const { data } = await supabase.from('photo_albums').select('*').eq('agency_id', aid).order('created_at', { ascending: false })
    setAlbums(data || [])
  }

  const fetchAlbumPhotos = async (albumId: string) => {
    const { data } = await supabase.from('album_photos').select('*').eq('album_id', albumId).order('photo_order')
    setAlbumPhotos(data || [])
  }

  const openAlbum = async (album: Album) => {
    setSelectedAlbum(album)
    await fetchAlbumPhotos(album.id)
  }

  const openCreateAlbumModal = () => {
    setEditingAlbum(null)
    setAlbumForm({ title: '', description: '', is_published: true })
    setShowAlbumModal(true)
  }

  const openEditAlbumModal = (album: Album) => {
    setEditingAlbum(album)
    setAlbumForm({ title: album.title, description: album.description || '', is_published: album.is_published })
    setShowAlbumModal(true)
  }

  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agencyId) return
    try {
      if (editingAlbum) {
        const { error } = await supabase.from('photo_albums')
          .update({ title: albumForm.title, description: albumForm.description || null, is_published: albumForm.is_published, updated_at: new Date().toISOString() })
          .eq('id', editingAlbum.id)
        if (error) throw error
        // Update selectedAlbum state supaya nama terkini nampak
        setSelectedAlbum(prev => prev ? { ...prev, title: albumForm.title, description: albumForm.description || null, is_published: albumForm.is_published } : null)
        alert('✅ Album updated!')
      } else {
        const { error } = await supabase.from('photo_albums')
          .insert({ agency_id: agencyId, title: albumForm.title, description: albumForm.description || null, is_published: albumForm.is_published })
        if (error) throw error
        alert('✅ Album created!')
      }
      setShowAlbumModal(false)
      fetchAlbums(agencyId)
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  const handleDeleteAlbum = async (albumId: string, albumTitle: string) => {
    if (!confirm(`Delete album "${albumTitle}"? All photos will be deleted.`)) return
    try {
      const { error } = await supabase.from('photo_albums').delete().eq('id', albumId)
      if (error) throw error
      alert('✅ Album deleted!')
      setSelectedAlbum(null)
      if (agencyId) fetchAlbums(agencyId)
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadingPhotos(files)
    const captions: {[key: number]: string} = {}
    files.forEach((_, index) => { captions[index] = '' })
    setPhotoCaptions(captions)
  }

  const handleUploadPhotos = async () => {
    if (!selectedAlbum || uploadingPhotos.length === 0) return
    setUploading(true)
    try {
      for (let i = 0; i < uploadingPhotos.length; i++) {
        const file = uploadingPhotos[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${agencyId}/albums/${selectedAlbum.id}/${Date.now()}_${i}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('agency-photos').upload(fileName, file, { cacheControl: '3600', upsert: false })
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('agency-photos').getPublicUrl(fileName)
        const { error: insertError } = await supabase.from('album_photos').insert({ album_id: selectedAlbum.id, photo_url: publicUrl, caption: photoCaptions[i] || null, photo_order: i })
        if (insertError) throw insertError
      }
      alert(`✅ ${uploadingPhotos.length} photos uploaded!`)
      setShowUploadModal(false)
      setUploadingPhotos([])
      setPhotoCaptions({})
      if (agencyId) fetchAlbums(agencyId)
      await fetchAlbumPhotos(selectedAlbum.id)
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return
    try {
      const { error } = await supabase.from('album_photos').delete().eq('id', photoId)
      if (error) throw error
      if (selectedAlbum) await fetchAlbumPhotos(selectedAlbum.id)
      if (agencyId) fetchAlbums(agencyId)
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
      <div style={{ fontSize: '16px', color: '#666' }}>Loading galeri...</div>
    </div>
  )

  // ✅ SINGLE RETURN — semua modal render kat sini, regardless of view
  return (
    <div>
      {/* ========== ALBUM DETAIL VIEW ========== */}
      {selectedAlbum ? (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <button onClick={() => setSelectedAlbum(null)} style={{ padding: '10px 20px', backgroundColor: '#F5F5F0', color: '#2C2C2C', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              ← Back
            </button>
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '4px' }}>{selectedAlbum.title}</h1>
              {selectedAlbum.description && <p style={{ fontSize: '15px', color: '#666' }}>{selectedAlbum.description}</p>}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowUploadModal(true)} style={{ padding: '10px 20px', backgroundColor: '#B8936D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                📤 Upload Photos
              </button>
              <button onClick={() => openEditAlbumModal(selectedAlbum)} style={{ padding: '10px 20px', backgroundColor: '#F5F5F0', color: '#2C2C2C', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                ✏️ Edit Album
              </button>
              <button onClick={() => handleDeleteAlbum(selectedAlbum.id, selectedAlbum.title)} style={{ padding: '10px 20px', backgroundColor: '#FEE', color: '#C33', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                🗑️ Delete Album
              </button>
            </div>
          </div>

          {albumPhotos.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {albumPhotos.map((photo) => (
                <div key={photo.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E5E5E0' }}>
                  <img src={photo.photo_url} alt={photo.caption || ''} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                  {photo.caption && <div style={{ padding: '8px 12px', backgroundColor: 'white', fontSize: '13px', color: '#666' }}>{photo.caption}</div>}
                  <button onClick={() => handleDeletePhoto(photo.id)} style={{ position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', backgroundColor: 'rgba(220,38,38,0.9)', color: 'white', border: 'none', borderRadius: '50%', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px', backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E5E5E0' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🖼️</div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>Tiada Foto</h3>
              <p style={{ fontSize: '15px', color: '#666', marginBottom: '24px' }}>Upload gambar untuk album ini</p>
              <button onClick={() => setShowUploadModal(true)} style={{ padding: '12px 24px', backgroundColor: '#B8936D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>📤 Upload Photos</button>
            </div>
          )}
        </div>

      ) : (
        /* ========== ALBUMS LIST VIEW ========== */
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>Galeri</h1>
              <p style={{ fontSize: '15px', color: '#666' }}>Urus album foto agensi anda</p>
            </div>
            <button onClick={openCreateAlbumModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 24px', backgroundColor: '#B8936D', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
              <span>➕</span><span>Buat Album</span>
            </button>
          </div>

          {albums.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {albums.map((album) => (
                <div key={album.id} style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #E5E5E0', cursor: 'pointer' }} onClick={() => openAlbum(album)}>
                  <div style={{ height: '200px', backgroundColor: '#F5F5F0', backgroundImage: album.cover_photo_url ? `url(${album.cover_photo_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {!album.cover_photo_url && <span style={{ fontSize: '48px', opacity: 0.3 }}>🖼️</span>}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#2C2C2C' }}>{album.title}</h3>
                      <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', backgroundColor: album.is_published ? '#E8F5E9' : '#F5F5F5', color: album.is_published ? '#2E7D32' : '#666' }}>
                        {album.is_published ? 'LIVE' : 'DRAFT'}
                      </span>
                    </div>
                    {album.description && <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{album.description}</p>}
                    <div style={{ fontSize: '12px', color: '#999' }}>📷 {album.photo_count || 0} photos · {new Date(album.created_at).toLocaleDateString('ms-MY')}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '80px 40px', textAlign: 'center', border: '1px solid #E5E5E0' }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🖼️</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px' }}>Tiada Album Lagi</h3>
              <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>Buat album pertama untuk galeri agensi anda</p>
              <button onClick={openCreateAlbumModal} style={{ padding: '14px 32px', backgroundColor: '#B8936D', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' }}>Buat Album</button>
            </div>
          )}
        </div>
      )}

      {/* ========== MODALS — render kat luar if/else, always available ========== */}

      {/* Album Create/Edit Modal */}
      {showAlbumModal && (
        <div onClick={() => setShowAlbumModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '100%' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
              {editingAlbum ? '✏️ Edit Album' : '➕ Create Album'}
            </h2>
            <form onSubmit={handleSaveAlbum}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>Album Title *</label>
                <input type="text" required value={albumForm.title} onChange={(e) => setAlbumForm({...albumForm, title: e.target.value})} placeholder="e.g., Umrah 2024 - Group A" style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E0', borderRadius: '8px', fontSize: '15px' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>Description</label>
                <textarea value={albumForm.description} onChange={(e) => setAlbumForm({...albumForm, description: e.target.value})} placeholder="Brief description..." rows={3} style={{ width: '100%', padding: '12px', border: '1px solid #E5E5E0', borderRadius: '8px', fontSize: '15px', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={albumForm.is_published} onChange={(e) => setAlbumForm({...albumForm, is_published: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontSize: '15px', color: '#2C2C2C' }}>Publish album (visible to public)</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setShowAlbumModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: 'white', color: '#666', border: '2px solid #E5E5E0', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: '12px', backgroundColor: '#B8936D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                  {editingAlbum ? 'Save Changes' : 'Create Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Photos Modal */}
      {showUploadModal && (
        <div onClick={() => setShowUploadModal(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>📤 Upload Photos</h2>
            <input type="file" multiple accept="image/*" onChange={handleFileSelect} style={{ width: '100%', padding: '12px', border: '2px dashed #B8936D', borderRadius: '8px', fontSize: '15px', cursor: 'pointer', marginBottom: '8px' }} />
            <p style={{ fontSize: '13px', color: '#999', marginBottom: '24px' }}>Select multiple photos (JPG, PNG)</p>
            {uploadingPhotos.length > 0 && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  {uploadingPhotos.map((file, index) => (
                    <div key={index} style={{ display: 'flex', gap: '16px', padding: '12px', backgroundColor: '#F5F5F0', borderRadius: '8px' }}>
                      <img src={URL.createObjectURL(file)} alt={file.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>{file.name}</div>
                        <input type="text" placeholder="Add caption (optional)" value={photoCaptions[index] || ''} onChange={(e) => setPhotoCaptions({...photoCaptions, [index]: e.target.value})} style={{ width: '100%', padding: '8px', border: '1px solid #E5E5E0', borderRadius: '6px', fontSize: '14px' }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button onClick={() => { setShowUploadModal(false); setUploadingPhotos([]); setPhotoCaptions({}) }} disabled={uploading} style={{ flex: 1, padding: '12px', backgroundColor: 'white', color: '#666', border: '2px solid #E5E5E0', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: uploading ? 'not-allowed' : 'pointer' }}>Cancel</button>
                  <button onClick={handleUploadPhotos} disabled={uploading} style={{ flex: 1, padding: '12px', backgroundColor: uploading ? '#ccc' : '#B8936D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: uploading ? 'not-allowed' : 'pointer' }}>
                    {uploading ? `Uploading... (${uploadingPhotos.length} photos)` : 'Upload All'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}