'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Pagination from '@/app/Pagination'

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

const ALBUMS_PER_PAGE = 9   // 3×3 grid
const PHOTOS_PER_PAGE = 12  // 4×3 grid

export default function MerchantGalleryPage() {
  const supabase = createClient()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [albums, setAlbums] = useState<Album[]>([])
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [albumPhotos, setAlbumPhotos] = useState<AlbumPhoto[]>([])

  const [albumPage, setAlbumPage] = useState(1)
  const [photoPage, setPhotoPage] = useState(1)

  const [showAlbumModal, setShowAlbumModal] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)
  const [albumForm, setAlbumForm] = useState({ title: '', description: '', is_published: true })

  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState<File[]>([])
  const [photoCaptions, setPhotoCaptions] = useState<{ [key: number]: string }>({})
  const [uploading, setUploading] = useState(false)

  useEffect(() => { init() }, [])

  // Reset photo page when switching albums
  useEffect(() => { setPhotoPage(1) }, [selectedAlbum])

  const init = async () => {
    try {
      const res = await fetch('/api/merchant/me')
      if (!res.ok) { router.push('/merchant/login'); return }
      const data = await res.json()
      if (!data.agencyId) { router.push('/merchant/login'); return }
      setAgencyId(data.agencyId)
      await fetchAlbums(data.agencyId)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
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
        setSelectedAlbum(prev => prev ? { ...prev, title: albumForm.title, description: albumForm.description || null, is_published: albumForm.is_published } : null)
      } else {
        const { error } = await supabase.from('photo_albums')
          .insert({ agency_id: agencyId, title: albumForm.title, description: albumForm.description || null, is_published: albumForm.is_published })
        if (error) throw error
      }
      setShowAlbumModal(false)
      fetchAlbums(agencyId)
    } catch (e: any) { alert(`❌ Error: ${e.message}`) }
  }

  const handleDeleteAlbum = async (albumId: string, albumTitle: string) => {
    if (!confirm(`Delete album "${albumTitle}"?\n\nAll photos will be deleted. This cannot be undone.`)) return
    try {
      const { error } = await supabase.from('photo_albums').delete().eq('id', albumId)
      if (error) throw error
      setSelectedAlbum(null)
      if (agencyId) fetchAlbums(agencyId)
    } catch (e: any) { alert(`❌ Error: ${e.message}`) }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploadingPhotos(files)
    const captions: { [key: number]: string } = {}
    files.forEach((_, i) => { captions[i] = '' })
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
      setShowUploadModal(false)
      setUploadingPhotos([])
      setPhotoCaptions({})
      setPhotoPage(1)
      if (agencyId) fetchAlbums(agencyId)
      await fetchAlbumPhotos(selectedAlbum.id)
    } catch (e: any) { alert(`❌ Error: ${e.message}`) }
    finally { setUploading(false) }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return
    try {
      const { error } = await supabase.from('album_photos').delete().eq('id', photoId)
      if (error) throw error
      if (selectedAlbum) await fetchAlbumPhotos(selectedAlbum.id)
      if (agencyId) fetchAlbums(agencyId)
    } catch (e: any) { alert(`❌ Error: ${e.message}`) }
  }

  // Pagination calculations
  const totalAlbumPages = Math.ceil(albums.length / ALBUMS_PER_PAGE)
  const paginatedAlbums = albums.slice((albumPage - 1) * ALBUMS_PER_PAGE, albumPage * ALBUMS_PER_PAGE)

  const totalPhotoPages = Math.ceil(albumPhotos.length / PHOTOS_PER_PAGE)
  const paginatedPhotos = albumPhotos.slice((photoPage - 1) * PHOTOS_PER_PAGE, photoPage * PHOTOS_PER_PAGE)

  /* ── LOADING ── */
  if (loading) return (
    <>
      <div className="gl-load"><div className="gl-spin" /><p>Loading gallery...</p></div>
      <style>{`.gl-load{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;gap:16px;color:#999}.gl-spin{width:36px;height:36px;border:3px solid #e5e5e5;border-top-color:#B8936D;border-radius:50%;animation:gls .7s linear infinite}@keyframes gls{to{transform:rotate(360deg)}}`}</style>
    </>
  )

  return (
    <>
      <style>{`
        .gl,.gl *{box-sizing:border-box}
        .gl{max-width:900px;width:100%;overflow:hidden}

        /* ── ALBUM LIST VIEW ── */
        .gl-header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:20px;flex-wrap:wrap}
        .gl-title{font-size:28px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .gl-sub{font-size:14px;color:#888;margin:0}
        .gl-add{
          display:inline-flex;align-items:center;gap:6px;
          padding:12px 22px;background:#B8936D;color:white;
          border-radius:10px;font-size:14px;font-weight:700;
          border:none;cursor:pointer;transition:background .15s;white-space:nowrap;flex-shrink:0;
        }
        .gl-add:hover{background:#a07d5a}

        /* Album grid */
        .gl-album-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .gl-album-card{
          background:white;border-radius:12px;overflow:hidden;
          border:1px solid #E5E5E0;cursor:pointer;
          transition:box-shadow .15s,transform .15s;
        }
        .gl-album-card:hover{box-shadow:0 6px 20px rgba(0,0,0,.1);transform:translateY(-2px)}
        .gl-album-thumb{
          height:180px;background:#F5F5F0;
          background-size:cover;background-position:center;
          display:flex;align-items:center;justify-content:center;
        }
        .gl-album-thumb-placeholder{font-size:40px;opacity:.25}
        .gl-album-body{padding:14px}
        .gl-album-top{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:6px}
        .gl-album-name{font-size:15px;font-weight:700;color:#2C2C2C;line-height:1.3}
        .gl-badge{padding:3px 10px;border-radius:6px;font-size:10px;font-weight:700;white-space:nowrap;flex-shrink:0}
        .gl-badge-pub{background:#ECFDF5;color:#10B981}
        .gl-badge-draft{background:#F5F5F5;color:#888}
        .gl-album-desc{font-size:12px;color:#888;margin-bottom:6px;line-height:1.4}
        .gl-album-meta{font-size:11px;color:#aaa}

        /* ── ALBUM DETAIL VIEW ── */
        .gl-detail-header{display:flex;align-items:flex-start;gap:12px;margin-bottom:20px;flex-wrap:wrap}
        .gl-back{
          padding:10px 18px;background:#F5F5F0;color:#2C2C2C;
          border:none;border-radius:8px;font-size:14px;font-weight:600;
          cursor:pointer;white-space:nowrap;flex-shrink:0;transition:background .15s;
        }
        .gl-back:hover{background:#e8e8e3}
        .gl-detail-info{flex:1;min-width:0}
        .gl-detail-title{font-size:24px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .gl-detail-desc{font-size:14px;color:#888;margin:0}
        .gl-detail-actions{display:flex;gap:8px;flex-wrap:wrap;flex-shrink:0}
        .gl-btn{
          padding:9px 16px;border:none;border-radius:8px;
          font-size:13px;font-weight:600;cursor:pointer;
          transition:filter .15s;white-space:nowrap;
        }
        .gl-btn:hover{filter:brightness(.92)}
        .gl-btn-gold{background:#B8936D;color:white}
        .gl-btn-slate{background:#F5F5F0;color:#2C2C2C}
        .gl-btn-red{background:#FEE2E2;color:#991B1B}

        /* Photo grid */
        .gl-photo-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
        .gl-photo-wrap{position:relative;border-radius:8px;overflow:hidden;border:1px solid #E5E5E0}
        .gl-photo-img{width:100%;aspect-ratio:1;object-fit:cover;display:block}
        .gl-photo-caption{padding:6px 10px;background:white;font-size:12px;color:#666;line-height:1.3}
        .gl-photo-del{
          position:absolute;top:6px;right:6px;
          width:26px;height:26px;
          background:rgba(220,38,38,.9);color:white;
          border:none;border-radius:50%;font-size:14px;
          cursor:pointer;display:flex;align-items:center;justify-content:center;
          transition:background .15s;
        }
        .gl-photo-del:hover{background:rgba(185,28,28,.9)}

        /* Empty states */
        .gl-empty{background:white;border-radius:16px;padding:60px 24px;text-align:center;border:1px solid #E5E5E0}
        .gl-empty-icon{font-size:48px;margin-bottom:12px}
        .gl-empty-title{font-size:20px;font-weight:700;color:#2C2C2C;margin-bottom:8px}
        .gl-empty-sub{font-size:14px;color:#888;margin-bottom:20px}

        /* ── MODALS ── */
        .gl-modal-overlay{
          position:fixed;inset:0;background:rgba(0,0,0,.5);
          z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;
        }
        .gl-modal{background:white;border-radius:16px;padding:28px;width:100%;position:relative}
        .gl-modal-sm{max-width:500px}
        .gl-modal-lg{max-width:760px;max-height:90vh;overflow-y:auto}
        .gl-modal-title{font-size:20px;font-weight:700;color:#2C2C2C;margin:0 0 20px}
        .gl-form-field{margin-bottom:16px}
        .gl-form-field:last-child{margin-bottom:0}
        .gl-form-label{display:block;font-size:13px;font-weight:600;color:#555;margin-bottom:6px}
        .gl-form-input,.gl-form-textarea{
          width:100%;padding:11px 13px;font-size:14px;
          border:1.5px solid #E5E5E0;border-radius:8px;
          outline:none;font-family:inherit;color:#2C2C2C;transition:border-color .15s;
        }
        .gl-form-input:focus,.gl-form-textarea:focus{border-color:#B8936D}
        .gl-form-textarea{resize:vertical}
        .gl-form-toggle{display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none}
        .gl-form-toggle input[type=checkbox]{width:16px;height:16px;cursor:pointer;accent-color:#B8936D}
        .gl-form-toggle-label{font-size:14px;color:#2C2C2C}
        .gl-modal-footer{display:flex;gap:10px;margin-top:20px}
        .gl-modal-cancel{flex:1;padding:11px;background:white;color:#666;border:1.5px solid #E5E5E0;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}
        .gl-modal-cancel:hover{background:#f8f8f8}
        .gl-modal-submit{flex:1;padding:11px;background:#B8936D;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}
        .gl-modal-submit:hover:not(:disabled){background:#a07d5a}
        .gl-modal-submit:disabled{opacity:.6;cursor:not-allowed}
        .gl-upload-input{width:100%;padding:12px;margin-bottom:6px;border:2px dashed #B8936D;border-radius:8px;font-size:14px;cursor:pointer}
        .gl-upload-hint{font-size:12px;color:#aaa;margin-bottom:16px}
        .gl-upload-list{display:flex;flex-direction:column;gap:12px;margin-bottom:20px}
        .gl-upload-item{display:flex;gap:12px;padding:12px;background:#F8F8F5;border-radius:8px;align-items:flex-start}
        .gl-upload-thumb{width:72px;height:72px;object-fit:cover;border-radius:6px;flex-shrink:0}
        .gl-upload-item-body{flex:1;min-width:0}
        .gl-upload-fname{font-size:13px;font-weight:600;color:#2C2C2C;margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .gl-caption-input{width:100%;padding:7px 10px;border:1px solid #E5E5E0;border-radius:6px;font-size:13px;font-family:inherit}

        /* ── TABLET ── */
        @media(max-width:1023px){
          .gl-title{font-size:24px}
          .gl-album-grid{grid-template-columns:repeat(2,1fr)}
          .gl-photo-grid{grid-template-columns:repeat(3,1fr)}
          .gl-album-thumb{height:160px}
        }

        /* ── MOBILE ── */
        @media(max-width:639px){
          .gl-header{flex-direction:column;align-items:stretch;gap:10px;margin-bottom:16px}
          .gl-add{width:100%;justify-content:center;padding:13px}
          .gl-title{font-size:20px}
          .gl-album-grid{grid-template-columns:repeat(2,1fr);gap:10px}
          .gl-album-thumb{height:130px}
          .gl-album-body{padding:10px}
          .gl-album-name{font-size:13px}
          .gl-detail-header{flex-direction:column;gap:10px;margin-bottom:14px}
          .gl-detail-title{font-size:20px}
          .gl-detail-actions{width:100%;justify-content:stretch}
          .gl-detail-actions .gl-btn{flex:1;text-align:center;padding:10px 8px;font-size:12px}
          .gl-photo-grid{grid-template-columns:repeat(2,1fr);gap:8px}
          .gl-modal{padding:20px}
          .gl-modal-title{font-size:17px;margin-bottom:16px}
          .gl-modal-footer{flex-direction:column}
          .gl-modal-cancel,.gl-modal-submit{flex:none}
          .gl-upload-item{flex-direction:column;gap:8px}
          .gl-upload-thumb{width:100%;height:140px;border-radius:8px}
        }

        /* ── SMALL MOBILE ── */
        @media(max-width:380px){
          .gl-album-grid{grid-template-columns:1fr}
          .gl-photo-grid{grid-template-columns:repeat(2,1fr)}
        }
      `}</style>

      <div className="gl">

        {/* ══════════════ ALBUM DETAIL VIEW ══════════════ */}
        {selectedAlbum ? (
          <div>
            <div className="gl-detail-header">
              <button className="gl-back" onClick={() => setSelectedAlbum(null)}>← Back</button>
              <div className="gl-detail-info">
                <h1 className="gl-detail-title">{selectedAlbum.title}</h1>
                {selectedAlbum.description && <p className="gl-detail-desc">{selectedAlbum.description}</p>}
              </div>
              <div className="gl-detail-actions">
                <button className="gl-btn gl-btn-gold" onClick={() => setShowUploadModal(true)}>📤 Upload Photos</button>
                <button className="gl-btn gl-btn-slate" onClick={() => openEditAlbumModal(selectedAlbum)}>✏️ Edit Album</button>
                <button className="gl-btn gl-btn-red" onClick={() => handleDeleteAlbum(selectedAlbum.id, selectedAlbum.title)}>🗑 Delete Album</button>
              </div>
            </div>

            {albumPhotos.length > 0 ? (
              <>
                <div className="gl-photo-grid">
                  {paginatedPhotos.map(photo => (
                    <div key={photo.id} className="gl-photo-wrap">
                      <img src={photo.photo_url} alt={photo.caption || ''} className="gl-photo-img" />
                      {photo.caption && <div className="gl-photo-caption">{photo.caption}</div>}
                      <button className="gl-photo-del" onClick={() => handleDeletePhoto(photo.id)} title="Delete photo">×</button>
                    </div>
                  ))}
                </div>
                <Pagination currentPage={photoPage} totalPages={totalPhotoPages} onPageChange={setPhotoPage} />
              </>
            ) : (
              <div className="gl-empty">
                <div className="gl-empty-icon">🖼️</div>
                <div className="gl-empty-title">No Photos Yet</div>
                <p className="gl-empty-sub">Upload photos to this album</p>
                <button className="gl-add" onClick={() => setShowUploadModal(true)}>📤 Upload Photos</button>
              </div>
            )}
          </div>

        ) : (
          /* ══════════════ ALBUM LIST VIEW ══════════════ */
          <div>
            <div className="gl-header">
              <div>
                <h1 className="gl-title">Gallery</h1>
                <p className="gl-sub">Manage your agency photo albums</p>
              </div>
              <button className="gl-add" onClick={openCreateAlbumModal}>➕ Create Album</button>
            </div>

            {albums.length > 0 ? (
              <>
                <div className="gl-album-grid">
                  {paginatedAlbums.map(album => (
                    <div key={album.id} className="gl-album-card" onClick={() => openAlbum(album)}>
                      <div className="gl-album-thumb"
                        style={{ backgroundImage: album.cover_photo_url ? `url(${album.cover_photo_url})` : 'none' }}>
                        {!album.cover_photo_url && <span className="gl-album-thumb-placeholder">🖼️</span>}
                      </div>
                      <div className="gl-album-body">
                        <div className="gl-album-top">
                          <div className="gl-album-name">{album.title}</div>
                          <span className={`gl-badge ${album.is_published ? 'gl-badge-pub' : 'gl-badge-draft'}`}>
                            {album.is_published ? 'PUBLISHED' : 'DRAFT'}
                          </span>
                        </div>
                        {album.description && <p className="gl-album-desc">{album.description}</p>}
                        <div className="gl-album-meta">
                          📷 {album.photo_count || 0} photos · {new Date(album.created_at).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Pagination currentPage={albumPage} totalPages={totalAlbumPages} onPageChange={setAlbumPage} />
              </>
            ) : (
              <div className="gl-empty">
                <div className="gl-empty-icon">🖼️</div>
                <div className="gl-empty-title">No Albums Yet</div>
                <p className="gl-empty-sub">Create your first album for your agency gallery</p>
                <button className="gl-add" onClick={openCreateAlbumModal}>➕ Create Album</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════════ ALBUM CREATE/EDIT MODAL ══════════════ */}
      {showAlbumModal && (
        <div className="gl-modal-overlay" onClick={() => setShowAlbumModal(false)}>
          <div className="gl-modal gl-modal-sm" onClick={e => e.stopPropagation()}>
            <h2 className="gl-modal-title">
              {editingAlbum ? '✏️ Edit Album' : '➕ Create Album'}
            </h2>
            <form onSubmit={handleSaveAlbum}>
              <div className="gl-form-field">
                <label className="gl-form-label">Album Title *</label>
                <input type="text" required className="gl-form-input"
                  value={albumForm.title}
                  onChange={e => setAlbumForm({ ...albumForm, title: e.target.value })}
                  placeholder="e.g. Umrah 2024 – Group A" />
              </div>
              <div className="gl-form-field">
                <label className="gl-form-label">Description</label>
                <textarea rows={3} className="gl-form-textarea"
                  value={albumForm.description}
                  onChange={e => setAlbumForm({ ...albumForm, description: e.target.value })}
                  placeholder="Brief description..." />
              </div>
              <div className="gl-form-field">
                <label className="gl-form-toggle">
                  <input type="checkbox"
                    checked={albumForm.is_published}
                    onChange={e => setAlbumForm({ ...albumForm, is_published: e.target.checked })} />
                  <span className="gl-form-toggle-label">Publish album (visible to public)</span>
                </label>
              </div>
              <div className="gl-modal-footer">
                <button type="button" className="gl-modal-cancel" onClick={() => setShowAlbumModal(false)}>Cancel</button>
                <button type="submit" className="gl-modal-submit">
                  {editingAlbum ? 'Save Changes' : 'Create Album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════ UPLOAD PHOTOS MODAL ══════════════ */}
      {showUploadModal && (
        <div className="gl-modal-overlay" onClick={() => { if (!uploading) { setShowUploadModal(false); setUploadingPhotos([]); setPhotoCaptions({}) } }}>
          <div className="gl-modal gl-modal-lg" onClick={e => e.stopPropagation()}>
            <h2 className="gl-modal-title">📤 Upload Photos</h2>
            <input type="file" multiple accept="image/*"
              className="gl-upload-input" onChange={handleFileSelect} />
            <p className="gl-upload-hint">Select multiple photos (JPG, PNG, WebP)</p>

            {uploadingPhotos.length > 0 && (
              <>
                <div className="gl-upload-list">
                  {uploadingPhotos.map((file, i) => (
                    <div key={i} className="gl-upload-item">
                      <img src={URL.createObjectURL(file)} alt={file.name} className="gl-upload-thumb" />
                      <div className="gl-upload-item-body">
                        <div className="gl-upload-fname">{file.name}</div>
                        <input type="text" placeholder="Add caption (optional)"
                          value={photoCaptions[i] || ''}
                          onChange={e => setPhotoCaptions({ ...photoCaptions, [i]: e.target.value })}
                          className="gl-caption-input" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="gl-modal-footer">
                  <button className="gl-modal-cancel" disabled={uploading}
                    onClick={() => { setShowUploadModal(false); setUploadingPhotos([]); setPhotoCaptions({}) }}>
                    Cancel
                  </button>
                  <button className="gl-modal-submit" disabled={uploading} onClick={handleUploadPhotos}>
                    {uploading ? `⏳ Uploading ${uploadingPhotos.length} photo${uploadingPhotos.length > 1 ? 's' : ''}...` : `Upload All (${uploadingPhotos.length})`}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}