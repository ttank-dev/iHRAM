'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  
  // Create/Edit Album Modal
  const [showAlbumModal, setShowAlbumModal] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)
  const [albumForm, setAlbumForm] = useState({
    title: '',
    description: '',
    is_published: true
  })
  
  // Upload Photos Modal
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState<File[]>([])
  const [photoCaptions, setPhotoCaptions] = useState<{[key: number]: string}>({})
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchAgencyAndAlbums()
  }, [])

  const fetchAgencyAndAlbums = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get agency
      const { data: agency } = await supabase
        .from('agencies')
        .select('id')
        .eq('email', user.email)
        .single()

      if (agency) {
        setAgencyId(agency.id)
        await fetchAlbums(agency.id)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAlbums = async (agencyId: string) => {
    const { data } = await supabase
      .from('photo_albums')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
    
    setAlbums(data || [])
  }

  const fetchAlbumPhotos = async (albumId: string) => {
    const { data } = await supabase
      .from('album_photos')
      .select('*')
      .eq('album_id', albumId)
      .order('photo_order')
    
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
    setAlbumForm({
      title: album.title,
      description: album.description || '',
      is_published: album.is_published
    })
    setShowAlbumModal(true)
  }

  const handleSaveAlbum = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agencyId) return

    try {
      if (editingAlbum) {
        // Update existing album
        const { error } = await supabase
          .from('photo_albums')
          .update({
            title: albumForm.title,
            description: albumForm.description || null,
            is_published: albumForm.is_published,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAlbum.id)

        if (error) throw error
        alert('✅ Album updated!')
      } else {
        // Create new album
        const { error } = await supabase
          .from('photo_albums')
          .insert({
            agency_id: agencyId,
            title: albumForm.title,
            description: albumForm.description || null,
            is_published: albumForm.is_published
          })

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
    if (!confirm(`Delete album "${albumTitle}"? All photos will be deleted.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('photo_albums')
        .delete()
        .eq('id', albumId)

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
    
    // Initialize captions
    const captions: {[key: number]: string} = {}
    files.forEach((_, index) => {
      captions[index] = ''
    })
    setPhotoCaptions(captions)
  }

  const handleUploadPhotos = async () => {
    if (!selectedAlbum || uploadingPhotos.length === 0) return

    setUploading(true)

    try {
      // Upload each photo
      for (let i = 0; i < uploadingPhotos.length; i++) {
        const file = uploadingPhotos[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${agencyId}/albums/${selectedAlbum.id}/${Date.now()}_${i}.${fileExt}`

        console.log(`Uploading ${i + 1}/${uploadingPhotos.length}: ${fileName}`)

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('agency-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('agency-photos')
          .getPublicUrl(fileName)

        // Insert photo record
        const { error: insertError } = await supabase
          .from('album_photos')
          .insert({
            album_id: selectedAlbum.id,
            photo_url: publicUrl,
            caption: photoCaptions[i] || null,
            photo_order: i
          })

        if (insertError) throw insertError
      }

      alert(`✅ ${uploadingPhotos.length} photos uploaded!`)
      setShowUploadModal(false)
      setUploadingPhotos([])
      setPhotoCaptions({})
      
      // Refresh album and photos
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
      const { error } = await supabase
        .from('album_photos')
        .delete()
        .eq('id', photoId)

      if (error) throw error
      
      alert('✅ Photo deleted!')
      if (selectedAlbum) {
        await fetchAlbumPhotos(selectedAlbum.id)
        if (agencyId) fetchAlbums(agencyId)
      }
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  const handleSetCover = async (photoUrl: string) => {
    if (!selectedAlbum) return

    try {
      const { error } = await supabase
        .from('photo_albums')
        .update({ cover_photo_url: photoUrl })
        .eq('id', selectedAlbum.id)

      if (error) throw error
      
      alert('✅ Cover photo updated!')
      if (agencyId) fetchAlbums(agencyId)
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto' }}>
      
      {!selectedAlbum ? (
        // ALBUMS LIST VIEW
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
                Galeri Albums
              </h1>
              <p style={{ fontSize: '16px', color: '#666' }}>
                Manage your photo albums
              </p>
            </div>
            
            <button
              onClick={openCreateAlbumModal}
              style={{
                padding: '14px 32px',
                backgroundColor: '#B8936D',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ➕ Create Album
            </button>
          </div>

          {albums.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {albums.map((album) => (
                <div
                  key={album.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #E5E5E0'
                  }}
                >
                  {/* Cover Photo */}
                  <div
                    onClick={() => openAlbum(album)}
                    style={{
                      aspectRatio: '1',
                      backgroundColor: '#F5F5F0',
                      backgroundImage: album.cover_photo_url ? `url(${album.cover_photo_url})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '64px'
                    }}
                  >
                    {!album.cover_photo_url && '🖼️'}
                    
                    {/* Status Badge */}
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      padding: '6px 12px',
                      backgroundColor: album.is_published ? '#10B981' : '#999',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      {album.is_published ? '✅ Published' : '🔒 Draft'}
                    </div>
                  </div>

                  {/* Album Info */}
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
                      {album.title}
                    </h3>
                    
                    {album.description && (
                      <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px', lineHeight: '1.5' }}>
                        {album.description}
                      </p>
                    )}

                    <div style={{ fontSize: '14px', color: '#999', marginBottom: '16px' }}>
                      📷 {album.photo_count} gambar
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => openAlbum(album)}
                        style={{
                          flex: 1,
                          padding: '10px',
                          backgroundColor: '#B8936D',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        📂 Open
                      </button>
                      
                      <button
                        onClick={() => openEditAlbumModal(album)}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: 'white',
                          color: '#B8936D',
                          border: '2px solid #B8936D',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️
                      </button>
                      
                      <button
                        onClick={() => handleDeleteAlbum(album.id, album.title)}
                        style={{
                          padding: '10px 16px',
                          backgroundColor: 'white',
                          color: '#EF4444',
                          border: '2px solid #EF4444',
                          borderRadius: '6px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>
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
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🖼️</div>
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px' }}>
                No Albums Yet
              </h3>
              <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
                Create your first album to start uploading photos
              </p>
              <button
                onClick={openCreateAlbumModal}
                style={{
                  padding: '14px 32px',
                  backgroundColor: '#B8936D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ➕ Create First Album
              </button>
            </div>
          )}
        </>
      ) : (
        // ALBUM PHOTOS VIEW
        <>
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
                  {selectedAlbum.title}
                </h2>
                <p style={{ fontSize: '16px', color: '#666' }}>
                  📷 {albumPhotos.length} gambar
                </p>
              </div>

              <button
                onClick={() => setShowUploadModal(true)}
                style={{
                  padding: '14px 32px',
                  backgroundColor: '#B8936D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                📤 Upload Photos
              </button>
            </div>
          </div>

          {albumPhotos.length > 0 ? (
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

                  {/* Actions Overlay */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <button
                      onClick={() => handleSetCover(photo.photo_url)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: 'rgba(184, 147, 109, 0.95)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      🌟 Set Cover
                    </button>

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

                  {/* Caption */}
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
              <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px' }}>
                No Photos Yet
              </h3>
              <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
                Upload photos to this album
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                style={{
                  padding: '14px 32px',
                  backgroundColor: '#B8936D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                📤 Upload Photos
              </button>
            </div>
          )}
        </>
      )}

      {/* CREATE/EDIT ALBUM MODAL */}
      {showAlbumModal && (
        <div
          onClick={() => setShowAlbumModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '600px',
              width: '100%'
            }}
          >
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
              {editingAlbum ? '✏️ Edit Album' : '➕ Create Album'}
            </h2>

            <form onSubmit={handleSaveAlbum}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                  Album Title <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  value={albumForm.title}
                  onChange={(e) => setAlbumForm({...albumForm, title: e.target.value})}
                  placeholder="e.g., Umrah 2024 - Group A"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E5E5E0',
                    borderRadius: '8px',
                    fontSize: '15px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                  Description
                </label>
                <textarea
                  value={albumForm.description}
                  onChange={(e) => setAlbumForm({...albumForm, description: e.target.value})}
                  placeholder="Brief description of this album..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #E5E5E0',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={albumForm.is_published}
                    onChange={(e) => setAlbumForm({...albumForm, is_published: e.target.checked})}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '15px', color: '#2C2C2C' }}>
                    Publish album (visible to public)
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAlbumModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'white',
                    color: '#666',
                    border: '2px solid #E5E5E0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#B8936D',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {editingAlbum ? 'Save Changes' : 'Create Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD PHOTOS MODAL */}
      {showUploadModal && (
        <div
          onClick={() => setShowUploadModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
              📤 Upload Photos
            </h2>

            <div style={{ marginBottom: '24px' }}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px dashed #B8936D',
                  borderRadius: '8px',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              />
              <p style={{ fontSize: '13px', color: '#999', marginTop: '8px' }}>
                Select multiple photos (JPG, PNG)
              </p>
            </div>

            {uploadingPhotos.length > 0 && (
              <>
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#2C2C2C', marginBottom: '16px' }}>
                    Selected Photos ({uploadingPhotos.length})
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {uploadingPhotos.map((file, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          gap: '16px',
                          padding: '12px',
                          backgroundColor: '#F5F5F0',
                          borderRadius: '8px'
                        }}
                      >
                        <div style={{
                          width: '80px',
                          height: '80px',
                          backgroundColor: '#E5E5E0',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          flexShrink: 0
                        }}>
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
                            {file.name}
                          </div>
                          <input
                            type="text"
                            placeholder="Add caption (optional)"
                            value={photoCaptions[index] || ''}
                            onChange={(e) => setPhotoCaptions({...photoCaptions, [index]: e.target.value})}
                            style={{
                              width: '100%',
                              padding: '8px',
                              border: '1px solid #E5E5E0',
                              borderRadius: '6px',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => {
                      setShowUploadModal(false)
                      setUploadingPhotos([])
                      setPhotoCaptions({})
                    }}
                    disabled={uploading}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: 'white',
                      color: '#666',
                      border: '2px solid #E5E5E0',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: uploading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleUploadPhotos}
                    disabled={uploading}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: uploading ? '#ccc' : '#B8936D',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: uploading ? 'not-allowed' : 'pointer'
                    }}
                  >
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