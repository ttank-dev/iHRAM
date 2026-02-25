'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import AlbumActions from './AlbumActions'

export default function GaleriClient({ initialAlbums }: { initialAlbums: any[] }) {
  const supabase = createClient()

  const [albums] = useState(initialAlbums)
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null)
  const [albumPhotos, setAlbumPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState<any>(null)
  const [deleteReason, setDeleteReason] = useState('')
  const [deleting, setDeleting] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [agencyFilter, setAgencyFilter] = useState<string>('all')

  const agencies = Array.from(new Set(albums.map(a => a.agencies?.name).filter(Boolean)))

  const filteredAlbums = albums.filter(album => {
    const matchesSearch = !searchTerm ||
      album.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      album.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      album.agencies?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'published' && album.is_published) ||
      (statusFilter === 'draft' && !album.is_published)
    const matchesAgency = agencyFilter === 'all' || album.agencies?.name === agencyFilter
    return matchesSearch && matchesStatus && matchesAgency
  })

  const openAlbum = async (album: any) => {
    setLoading(true)
    setSelectedAlbum(album)
    const { data } = await supabase.from('album_photos').select('*').eq('album_id', album.id).order('photo_order')
    setAlbumPhotos(data || [])
    setLoading(false)
  }

  const openDeletePhotoModal = (photo: any) => {
    setPhotoToDelete(photo); setDeleteReason(''); setShowDeleteModal(true)
  }

  const handleDeletePhoto = async () => {
    if (!deleteReason.trim()) { alert('Please enter a reason'); return }
    if (!photoToDelete) return
    setDeleting(true)
    try {
      await supabase.from('moderation_logs').insert({
        content_type: 'photo_album', content_id: photoToDelete.id,
        content_title: `Photo from ${selectedAlbum?.title}`,
        agency_id: selectedAlbum?.agency_id, agency_name: selectedAlbum?.agencies?.name,
        action: 'delete', reason: deleteReason, admin_name: 'Admin',
        metadata: { album_id: selectedAlbum?.id, album_title: selectedAlbum?.title, photo_url: photoToDelete.photo_url }
      })
      const { error } = await supabase.from('album_photos').delete().eq('id', photoToDelete.id)
      if (error) throw error
      alert('✅ Photo deleted!')
      const { data } = await supabase.from('album_photos').select('*').eq('album_id', selectedAlbum.id).order('photo_order')
      setAlbumPhotos(data || [])
      setShowDeleteModal(false); setPhotoToDelete(null); setDeleteReason('')
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setDeleting(false)
    }
  }

  const stats = {
    total: albums.length,
    published: albums.filter(a => a.is_published).length,
    draft: albums.filter(a => !a.is_published).length
  }

  const styles = `
    .gc-title { font-size: 32px; font-weight: bold; color: #2C2C2C; margin-bottom: 8px; }
    .gc-sub { font-size: 16px; color: #666; margin-bottom: 32px; }

    /* Stats */
    .gc-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
    .gc-stat { background: white; border-radius: 16px; padding: 24px; border: 1px solid #E5E5E0; }
    .gc-stat-label { font-size: 13px; color: #999; font-weight: 600; margin-bottom: 8px; }
    .gc-stat-value { font-size: 32px; font-weight: bold; }

    /* Filters */
    .gc-filters { background: white; border-radius: 16px; padding: 24px; border: 1px solid #E5E5E0; margin-bottom: 24px; }
    .gc-filter-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; }
    .gc-filter-label { display: block; font-size: 13px; font-weight: 600; color: #2C2C2C; margin-bottom: 8px; }
    .gc-filter-input { width: 100%; padding: 10px 16px; border: 1px solid #E5E5E0; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; cursor: pointer; }
    .gc-filter-count { margin-top: 16px; font-size: 14px; color: #666; }

    /* Albums grid */
    .gc-albums-wrap { background: white; border-radius: 16px; border: 1px solid #E5E5E0; overflow: hidden; }
    .gc-albums-header { padding: 24px; border-bottom: 1px solid #E5E5E0; }
    .gc-albums-title { font-size: 20px; font-weight: bold; color: #2C2C2C; }
    .gc-albums-grid { padding: 24px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

    /* Album card */
    .gc-card { background: #F5F5F0; border-radius: 12px; overflow: hidden; }
    .gc-card-thumb { width: 100%; aspect-ratio: 4/3; background-size: cover; background-position: center; position: relative; }
    .gc-card-thumb-empty { width: 100%; aspect-ratio: 4/3; background: #E5E5E0; display: flex; align-items: center; justify-content: center; font-size: 48px; }
    .gc-card-badge { position: absolute; top: 8px; right: 8px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; }
    .gc-card-info { padding: 16px; }
    .gc-card-name { font-size: 13px; color: #999; margin-bottom: 4px; }
    .gc-card-title { font-size: 16px; font-weight: 600; color: #2C2C2C; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .gc-card-meta { font-size: 13px; color: #666; margin-bottom: 12px; }
    .gc-card-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .gc-view-btn { padding: 8px 16px; background: #EFF6FF; color: #3B82F6; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }

    /* Album detail view */
    .gc-back-btn { margin-bottom: 16px; padding: 10px 20px; background: white; color: #B8936D; border: 2px solid #B8936D; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
    .gc-detail-title { font-size: 28px; font-weight: bold; color: #2C2C2C; margin-bottom: 8px; }
    .gc-detail-sub { font-size: 16px; color: #666; margin-bottom: 32px; }
    .gc-photos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
    .gc-photo { position: relative; aspect-ratio: 1; background: #F5F5F0; border-radius: 8px; overflow: hidden; border: 1px solid #E5E5E0; }
    .gc-photo img { width: 100%; height: 100%; object-fit: cover; }
    .gc-photo-del { position: absolute; top: 8px; right: 8px; padding: 8px 12px; background: rgba(239,68,68,0.95); color: white; border: none; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; }
    .gc-photo-caption { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); color: white; padding: 24px 12px 12px; font-size: 13px; line-height: 1.4; }

    /* Delete modal */
    .gc-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px; box-sizing: border-box; }
    .gc-modal { background: white; border-radius: 16px; padding: 32px; max-width: 500px; width: 100%; }
    .gc-modal-title { font-size: 24px; font-weight: bold; color: #2C2C2C; margin-bottom: 16px; }
    .gc-modal-sub { font-size: 15px; color: #666; margin-bottom: 16px; line-height: 1.6; }
    .gc-modal-label { display: block; font-size: 14px; font-weight: 600; color: #2C2C2C; margin-bottom: 8px; }
    .gc-modal-textarea { width: 100%; padding: 12px; border: 1px solid #E5E5E0; border-radius: 8px; font-size: 14px; outline: none; margin-bottom: 16px; resize: vertical; box-sizing: border-box; }
    .gc-modal-actions { display: flex; gap: 12px; justify-content: flex-end; }
    .gc-modal-cancel { padding: 10px 24px; background: white; color: #2C2C2C; border: 1px solid #E5E5E0; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .gc-modal-confirm { padding: 10px 24px; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; }

    /* Empty */
    .gc-empty { padding: 60px 24px; text-align: center; }

    /* ── TABLET ── */
    @media (max-width: 1023px) {
      .gc-title { font-size: 26px; }
      .gc-stats { gap: 14px; }
      .gc-stat { padding: 18px; }
      .gc-stat-value { font-size: 26px; }
      .gc-filter-grid { grid-template-columns: 1fr 1fr; }
      .gc-filter-grid > :first-child { grid-column: 1 / -1; }
      .gc-albums-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
      .gc-photos-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
    }

    /* ── MOBILE ── */
    @media (max-width: 639px) {
      .gc-title { font-size: 22px; }
      .gc-sub { font-size: 14px; margin-bottom: 20px; }

      .gc-stats { grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
      .gc-stats > :last-child { grid-column: 1 / -1; }
      .gc-stat { padding: 14px; }
      .gc-stat-label { font-size: 12px; margin-bottom: 4px; }
      .gc-stat-value { font-size: 24px; }

      .gc-filters { padding: 16px; }
      .gc-filter-grid { grid-template-columns: 1fr; gap: 12px; }
      .gc-filter-grid > :first-child { grid-column: auto; }

      .gc-albums-header { padding: 16px; }
      .gc-albums-grid { grid-template-columns: 1fr; gap: 12px; padding: 16px; }

      .gc-card-actions { gap: 6px; }
      .gc-view-btn { flex: 1; text-align: center; }

      .gc-detail-title { font-size: 22px; }
      .gc-photos-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }

      .gc-modal { padding: 20px 16px; }
      .gc-modal-title { font-size: 20px; }
      .gc-modal-actions { flex-direction: column-reverse; }
      .gc-modal-cancel, .gc-modal-confirm { width: 100%; text-align: center; padding: 12px; }
    }
  `

  // ── ALBUM DETAIL VIEW ──
  if (selectedAlbum) {
    return (
      <div>
        <style>{styles}</style>

        <div style={{ marginBottom: '32px' }}>
          <button className="gc-back-btn" onClick={() => setSelectedAlbum(null)}>← Back to Albums</button>
          <h2 className="gc-detail-title">{selectedAlbum.title}</h2>
          <p className="gc-detail-sub">{selectedAlbum.agencies?.name || 'Unknown Agency'} • 📷 {albumPhotos.length} gambar</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
            <p>Loading...</p>
          </div>
        ) : albumPhotos.length > 0 ? (
          <div className="gc-photos-grid">
            {albumPhotos.map((photo) => (
              <div key={photo.id} className="gc-photo">
                <img src={photo.photo_url} alt={photo.caption || 'Photo'} />
                <button className="gc-photo-del" onClick={() => openDeletePhotoModal(photo)}>🗑️ Delete</button>
                {photo.caption && <div className="gc-photo-caption">{photo.caption}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: '16px', padding: '60px 24px', textAlign: 'center', border: '1px solid #E5E5E0' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>📷</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#2C2C2C' }}>No Photos in Album</div>
          </div>
        )}

        {/* Delete Photo Modal */}
        {showDeleteModal && (
          <div className="gc-modal-overlay">
            <div className="gc-modal">
              <h2 className="gc-modal-title">Delete Photo</h2>
              <p className="gc-modal-sub">You are about to delete this photo from the album.</p>
              <label className="gc-modal-label">Reason for deletion <span style={{ color: 'red' }}>*</span></label>
              <textarea
                className="gc-modal-textarea"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter reason (e.g., Inappropriate content, Low quality...)"
                rows={4}
              />
              <div className="gc-modal-actions">
                <button className="gc-modal-cancel" disabled={deleting}
                  onClick={() => { setShowDeleteModal(false); setPhotoToDelete(null); setDeleteReason('') }}>
                  Cancel
                </button>
                <button className="gc-modal-confirm"
                  disabled={deleting || !deleteReason.trim()}
                  onClick={handleDeletePhoto}
                  style={{ backgroundColor: deleting || !deleteReason.trim() ? '#CCC' : '#EF4444', cursor: deleting || !deleteReason.trim() ? 'not-allowed' : 'pointer' }}>
                  {deleting ? 'Deleting...' : 'Delete Photo'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── ALBUMS LIST VIEW ──
  return (
    <div>
      <style>{styles}</style>

      <h1 className="gc-title">Galeri Management</h1>
      <p className="gc-sub">Moderate photo albums from all agencies</p>

      {/* Stats */}
      <div className="gc-stats">
        <div className="gc-stat"><div className="gc-stat-label">Total Albums</div><div className="gc-stat-value" style={{ color: '#2C2C2C' }}>{stats.total}</div></div>
        <div className="gc-stat"><div className="gc-stat-label">Published</div><div className="gc-stat-value" style={{ color: '#10B981' }}>{stats.published}</div></div>
        <div className="gc-stat"><div className="gc-stat-label">Draft</div><div className="gc-stat-value" style={{ color: '#F59E0B' }}>{stats.draft}</div></div>
      </div>

      {/* Filters */}
      <div className="gc-filters">
        <div className="gc-filter-grid">
          <div>
            <label className="gc-filter-label">🔍 Search</label>
            <input type="text" placeholder="Search albums..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} className="gc-filter-input" style={{ cursor: 'text' }} />
          </div>
          <div>
            <label className="gc-filter-label">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="gc-filter-input">
              <option value="all">All Status</option>
              <option value="published">✅ Published</option>
              <option value="draft">📝 Draft</option>
            </select>
          </div>
          <div>
            <label className="gc-filter-label">Agency</label>
            <select value={agencyFilter} onChange={(e) => setAgencyFilter(e.target.value)} className="gc-filter-input">
              <option value="all">All Agencies</option>
              {agencies.map(agency => <option key={agency} value={agency}>{agency}</option>)}
            </select>
          </div>
        </div>
        <div className="gc-filter-count">Showing <strong>{filteredAlbums.length}</strong> of <strong>{albums.length}</strong> albums</div>
      </div>

      {/* Albums Grid */}
      <div className="gc-albums-wrap">
        <div className="gc-albums-header">
          <div className="gc-albums-title">Photo Albums</div>
        </div>

        {filteredAlbums.length === 0 ? (
          <div className="gc-empty">
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🖼️</div>
            <div style={{ fontSize: '20px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
              {searchTerm || statusFilter !== 'all' || agencyFilter !== 'all' ? 'No albums match your filters' : 'No Albums Yet'}
            </div>
            <div style={{ fontSize: '15px', color: '#666' }}>
              {searchTerm || statusFilter !== 'all' || agencyFilter !== 'all' ? 'Try adjusting your filters' : 'Agency albums will appear here'}
            </div>
          </div>
        ) : (
          <div className="gc-albums-grid">
            {filteredAlbums.map((album: any) => {
              const coverPhoto = album.cover_photo_url || (album.photos && album.photos[0])
              return (
                <div key={album.id} className="gc-card">
                  {coverPhoto ? (
                    <div className="gc-card-thumb" style={{ backgroundImage: `url(${coverPhoto})` }}>
                      <span className="gc-card-badge" style={{
                        backgroundColor: album.is_published ? '#ECFDF5' : '#FEF3C7',
                        color: album.is_published ? '#10B981' : '#F59E0B'
                      }}>
                        {album.is_published ? '✅ Published' : '📝 Draft'}
                      </span>
                    </div>
                  ) : (
                    <div className="gc-card-thumb-empty">
                      <span className="gc-card-badge" style={{
                        backgroundColor: album.is_published ? '#ECFDF5' : '#FEF3C7',
                        color: album.is_published ? '#10B981' : '#F59E0B',
                        position: 'absolute', top: '8px', right: '8px'
                      }}>
                        {album.is_published ? '✅ Published' : '📝 Draft'}
                      </span>
                      🖼️
                    </div>
                  )}
                  <div className="gc-card-info">
                    <div className="gc-card-name">{album.agencies?.name || 'Unknown Agency'}</div>
                    <div className="gc-card-title">{album.title}</div>
                    <div className="gc-card-meta">
                      📷 {album.photo_count || 0} photos •{' '}
                      {new Date(album.created_at).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="gc-card-actions">
                      <button className="gc-view-btn" onClick={() => openAlbum(album)}>👁️ View Photos</button>
                      <AlbumActions album={album} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}