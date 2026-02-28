'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { StatusBadge } from '@/components/StatusToggleButton'

/* ── ActionButtons: TOP-LEVEL — same pattern as all admin pages ── */
function ActionButtons({ album, onToggle, onDelete }: {
  album: any
  onToggle: (id: string, current: boolean) => void
  onDelete: (id: string, title: string) => void
}) {
  return (
    <div className="gc-actions">
      <button
        className={'gc-btn ' + (album.is_published ? 'gc-btn-amber' : 'gc-btn-green')}
        onClick={() => onToggle(album.id, album.is_published)}
      >
        {album.is_published ? '⏸ Unpublish' : '✓ Publish'}
      </button>
      <button
        className="gc-btn gc-btn-red"
        onClick={() => onDelete(album.id, album.title || 'this album')}
      >
        🗑 Delete
      </button>
    </div>
  )
}

export default function GaleriClient({ initialAlbums }: { initialAlbums: any[] }) {
  const supabase = createClient()

  const [albums, setAlbums] = useState(initialAlbums)
  const [selectedAlbum, setSelectedAlbum] = useState<any>(null)
  const [albumPhotos, setAlbumPhotos] = useState<any[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(false)

  // Photo delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState<any>(null)
  const [deleteReason, setDeleteReason] = useState('')
  const [deleting, setDeleting] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [agencyFilter, setAgencyFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 12 // grid layout — multiple of 3

  const agencies = Array.from(new Set(albums.map(a => a.agencies?.name).filter(Boolean)))

  const filtered = albums.filter(album => {
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

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const stats = {
    total:     albums.length,
    published: albums.filter(a => a.is_published).length,
    draft:     albums.filter(a => !a.is_published).length,
  }

  const handleSearch = (v: string) => { setSearchTerm(v);           setCurrentPage(1) }
  const handleStatus = (v: string) => { setStatusFilter(v as any);  setCurrentPage(1) }
  const handleAgency = (v: string) => { setAgencyFilter(v);         setCurrentPage(1) }

  const handleToggle = async (id: string, current: boolean) => {
    const { error } = await supabase.from('photo_albums').update({ is_published: !current }).eq('id', id)
    if (error) { alert('Error updating album status'); return }
    setAlbums(prev => prev.map(a => a.id === id ? { ...a, is_published: !current } : a))
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm('Delete album "' + title + '"?\n\nThis will permanently delete the album and all its photos. This cannot be undone.')) return
    const { error } = await supabase.from('photo_albums').delete().eq('id', id)
    if (error) { alert('Error deleting album'); return }
    setAlbums(prev => prev.filter(a => a.id !== id))
  }

  const openAlbum = async (album: any) => {
    setLoadingPhotos(true)
    setSelectedAlbum(album)
    const { data } = await supabase.from('album_photos').select('*').eq('album_id', album.id).order('photo_order')
    setAlbumPhotos(data || [])
    setLoadingPhotos(false)
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
        content_type: 'photo_album',
        content_id: photoToDelete.id,
        content_title: 'Photo from ' + selectedAlbum?.title,
        agency_id: selectedAlbum?.agency_id,
        agency_name: selectedAlbum?.agencies?.name,
        action: 'delete',
        reason: deleteReason,
        admin_name: 'Admin',
        metadata: { album_id: selectedAlbum?.id, album_title: selectedAlbum?.title, photo_url: photoToDelete.photo_url }
      })
      const { error } = await supabase.from('album_photos').delete().eq('id', photoToDelete.id)
      if (error) throw error
      const { data } = await supabase.from('album_photos').select('*').eq('album_id', selectedAlbum.id).order('photo_order')
      setAlbumPhotos(data || [])
      setShowDeleteModal(false); setPhotoToDelete(null); setDeleteReason('')
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setDeleting(false)
    }
  }

  const styles = `
    .gc-title { font-size: 28px; font-weight: 700; color: #2C2C2C; margin: 0 0 6px; }
    .gc-sub { font-size: 15px; color: #888; margin: 0 0 24px; }

    /* Stats */
    .gc-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .gc-stat { background: white; border-radius: 12px; padding: 18px; border: 2px solid #E5E5E0; cursor: pointer; transition: all 0.2s; }
    .gc-stat:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
    .gc-stat.active { border-color: #B8936D; }
    .gc-stat-icon { font-size: 18px; margin-bottom: 8px; }
    .gc-stat-label { font-size: 13px; color: #888; font-weight: 500; margin-bottom: 4px; }
    .gc-stat-value { font-size: 28px; font-weight: 700; color: #2C2C2C; }

    /* Filters */
    .gc-filters { background: white; border-radius: 12px; padding: 16px 20px; border: 1px solid #E5E5E0; margin-bottom: 16px; display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; }
    .gc-filter-group { display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 160px; }
    .gc-filter-group.search-group { flex: 2; min-width: 220px; }
    .gc-filter-label { font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.4px; }
    .gc-filter-input { padding: 9px 12px; border: 1px solid #E5E5E0; border-radius: 8px; font-size: 14px; outline: none; background: #FAFAF8; color: #2C2C2C; width: 100%; box-sizing: border-box; }
    .gc-filter-input:focus { border-color: #B8936D; background: white; }
    .gc-filter-count { width: 100%; font-size: 13px; color: #888; padding-top: 4px; }

    /* Albums grid */
    .gc-albums-wrap { background: white; border-radius: 12px; border: 1px solid #E5E5E0; overflow: hidden; }
    .gc-albums-header { padding: 16px 20px; border-bottom: 1px solid #E5E5E0; display: flex; align-items: center; justify-content: space-between; }
    .gc-albums-title { font-size: 16px; font-weight: 700; color: #2C2C2C; }
    .gc-albums-grid { padding: 16px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }

    /* Album card */
    .gc-card { background: #F5F5F0; border-radius: 10px; overflow: hidden; border: 1px solid #EBEBEB; }
    .gc-card-thumb { width: 100%; aspect-ratio: 4/3; background-size: cover; background-position: center; position: relative; }
    .gc-card-thumb-empty { width: 100%; aspect-ratio: 4/3; background: #E5E5E0; display: flex; align-items: center; justify-content: center; font-size: 40px; position: relative; }
    .gc-card-badge-wrap { position: absolute; top: 8px; right: 8px; }
    .gc-card-info { padding: 12px 14px 14px; }
    .gc-card-agency { font-size: 12px; color: #999; font-weight: 500; margin-bottom: 3px; }
    .gc-card-title { font-size: 14px; font-weight: 600; color: #2C2C2C; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .gc-card-meta { font-size: 12px; color: #888; margin-bottom: 10px; }
    .gc-view-btn { width: 100%; padding: 7px 0; background: #EFF6FF; color: #3B82F6; border: none; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; margin-bottom: 6px; transition: background 0.15s; }
    .gc-view-btn:hover { background: #DBEAFE; }

    /* ── ACTION BUTTONS — same system as all admin pages ── */
    .gc-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
    .gc-btn {
      height: 28px;
      padding: 0 8px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      font-size: 11px;
      font-weight: 700;
      transition: filter 0.15s;
      white-space: nowrap;
      width: 100%;
      font-family: inherit;
    }
    .gc-btn:hover { filter: brightness(0.92); }
    .gc-btn-green  { background: #10B981; color: white; }
    .gc-btn-amber  { background: #F59E0B; color: white; }
    .gc-btn-red    { background: #EF4444; color: white; }

    /* Pagination */
    .gc-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px; flex-wrap: wrap; border-top: 1px solid #f0f0ec; }
    .gc-pg-btn { padding: 8px 16px; background: white; border: 1px solid #E5E5E0; border-radius: 8px; font-size: 13px; font-weight: 600; color: #555; cursor: pointer; transition: all .15s; white-space: nowrap; }
    .gc-pg-btn:hover:not(:disabled) { border-color: #B8936D; color: #B8936D; }
    .gc-pg-btn:disabled { opacity: .4; cursor: not-allowed; }
    .gc-pg-pages { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; }
    .gc-pg-num { width: 36px; height: 36px; border: 1px solid #E5E5E0; border-radius: 8px; background: white; font-size: 13px; font-weight: 600; color: #555; cursor: pointer; transition: all .15s; display: flex; align-items: center; justify-content: center; }
    .gc-pg-num:hover { border-color: #B8936D; color: #B8936D; }
    .gc-pg-num.active { background: #B8936D; border-color: #B8936D; color: white; }
    .gc-pg-ellipsis { color: #aaa; font-size: 13px; padding: 0 2px; }

    /* Album detail view */
    .gc-back-btn { margin-bottom: 16px; padding: 9px 20px; background: white; color: #B8936D; border: 2px solid #B8936D; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s; }
    .gc-back-btn:hover { background: rgba(184,147,109,0.06); }
    .gc-detail-title { font-size: 24px; font-weight: 700; color: #2C2C2C; margin-bottom: 4px; }
    .gc-detail-sub { font-size: 14px; color: #888; margin-bottom: 24px; }
    .gc-photos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
    .gc-photo { position: relative; aspect-ratio: 1; background: #F5F5F0; border-radius: 8px; overflow: hidden; border: 1px solid #E5E5E0; }
    .gc-photo img { width: 100%; height: 100%; object-fit: cover; }
    .gc-photo-del { position: absolute; top: 8px; right: 8px; padding: 6px 10px; background: rgba(239,68,68,0.92); color: white; border: none; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer; transition: background 0.15s; }
    .gc-photo-del:hover { background: rgba(220,38,38,0.98); }
    .gc-photo-caption { position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(0,0,0,0.75), transparent); color: white; padding: 20px 10px 10px; font-size: 12px; line-height: 1.4; }

    /* Delete modal */
    .gc-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 16px; box-sizing: border-box; }
    .gc-modal { background: white; border-radius: 14px; padding: 28px; max-width: 480px; width: 100%; }
    .gc-modal-title { font-size: 20px; font-weight: 700; color: #2C2C2C; margin: 0 0 10px; }
    .gc-modal-sub { font-size: 14px; color: #666; margin: 0 0 16px; line-height: 1.6; }
    .gc-modal-label { display: block; font-size: 13px; font-weight: 600; color: #2C2C2C; margin-bottom: 6px; }
    .gc-modal-textarea { width: 100%; padding: 10px 12px; border: 1px solid #E5E5E0; border-radius: 8px; font-size: 14px; outline: none; margin-bottom: 16px; resize: vertical; box-sizing: border-box; font-family: inherit; }
    .gc-modal-textarea:focus { border-color: #B8936D; }
    .gc-modal-btns { display: flex; gap: 10px; justify-content: flex-end; }
    .gc-modal-cancel { padding: 9px 20px; background: white; color: #555; border: 1px solid #E5E5E0; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; }
    .gc-modal-confirm { padding: 9px 20px; color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: filter 0.15s; }
    .gc-modal-confirm:hover:not(:disabled) { filter: brightness(0.92); }

    /* Empty */
    .gc-empty { padding: 60px 24px; text-align: center; }
    .gc-empty-icon { font-size: 44px; margin-bottom: 12px; }
    .gc-empty-title { font-size: 16px; font-weight: 600; color: #666; margin-bottom: 6px; }
    .gc-empty-sub { font-size: 14px; color: #999; }

    /* Responsive */
    @media (max-width: 1023px) {
      .gc-stats { gap: 10px; }
      .gc-stat { padding: 14px; }
      .gc-stat-value { font-size: 24px; }
      .gc-albums-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .gc-photos-grid { grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); }
    }
    @media (max-width: 767px) {
      .gc-stats { gap: 8px; }
      .gc-stat { padding: 12px; }
      .gc-stat-icon { font-size: 15px; margin-bottom: 6px; }
      .gc-stat-value { font-size: 22px; }
      .gc-filter-group { min-width: 100%; }
    }
    @media (max-width: 480px) {
      .gc-title { font-size: 22px; }
      .gc-stat-value { font-size: 20px; }
      .gc-stat-label { font-size: 11px; }
      .gc-albums-grid { grid-template-columns: 1fr; }
      .gc-photos-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
      .gc-modal { padding: 20px 16px; }
      .gc-modal-btns { flex-direction: column-reverse; }
      .gc-modal-cancel, .gc-modal-confirm { width: 100%; text-align: center; padding: 11px; }
      .gc-pg-btn { padding: 8px 10px; font-size: 12px; }
      .gc-pg-num { width: 32px; height: 32px; font-size: 12px; }
    }
  `

  // ── ALBUM DETAIL VIEW ──
  if (selectedAlbum) {
    return (
      <div>
        <style>{styles}</style>

        <button className="gc-back-btn" onClick={() => setSelectedAlbum(null)}>← Back to Albums</button>
        <h2 className="gc-detail-title">{selectedAlbum.title}</h2>
        <p className="gc-detail-sub">{selectedAlbum.agencies?.name || 'Unknown Agency'} • 📷 {albumPhotos.length} photos</p>

        {loadingPhotos ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>
            <p>Loading photos...</p>
          </div>
        ) : albumPhotos.length > 0 ? (
          <div className="gc-photos-grid">
            {albumPhotos.map((photo) => (
              <div key={photo.id} className="gc-photo">
                <img src={photo.photo_url} alt={photo.caption || 'Photo'} />
                <button className="gc-photo-del" onClick={() => openDeletePhotoModal(photo)}>🗑 Delete</button>
                {photo.caption && <div className="gc-photo-caption">{photo.caption}</div>}
              </div>
            ))}
          </div>
        ) : (
          <div className="gc-albums-wrap">
            <div className="gc-empty">
              <div className="gc-empty-icon">📷</div>
              <div className="gc-empty-title">No Photos in Album</div>
              <div className="gc-empty-sub">This album has no photos yet</div>
            </div>
          </div>
        )}

        {/* Delete Photo Modal */}
        {showDeleteModal && (
          <div className="gc-modal-overlay">
            <div className="gc-modal">
              <h2 className="gc-modal-title">Delete Photo</h2>
              <p className="gc-modal-sub">You are about to permanently delete this photo from the album. This cannot be undone.</p>
              <label className="gc-modal-label">Reason for deletion <span style={{ color: '#EF4444' }}>*</span></label>
              <textarea
                className="gc-modal-textarea"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Enter reason (e.g., Inappropriate content, Low quality...)"
                rows={3}
              />
              <div className="gc-modal-btns">
                <button
                  className="gc-modal-cancel"
                  disabled={deleting}
                  onClick={() => { setShowDeleteModal(false); setPhotoToDelete(null); setDeleteReason('') }}
                >
                  Cancel
                </button>
                <button
                  className="gc-modal-confirm"
                  disabled={deleting || !deleteReason.trim()}
                  onClick={handleDeletePhoto}
                  style={{ backgroundColor: deleting || !deleteReason.trim() ? '#CCC' : '#EF4444', cursor: deleting || !deleteReason.trim() ? 'not-allowed' : 'pointer' }}
                >
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

      <h1 className="gc-title">Gallery Management</h1>
      <p className="gc-sub">Monitor and moderate photo albums from all agencies</p>

      {/* STATS — clickable filters */}
      <div className="gc-stats">
        {[
          { key: 'all',       icon: '🖼️', label: 'Total Albums', value: stats.total,     color: '#3B82F6' },
          { key: 'published', icon: '✅', label: 'Published',    value: stats.published, color: '#10B981' },
          { key: 'draft',     icon: '📝', label: 'Draft',        value: stats.draft,     color: '#F59E0B' },
        ].map(s => (
          <div
            key={s.key}
            className={'gc-stat' + (statusFilter === s.key ? ' active' : '')}
            onClick={() => handleStatus(s.key)}
          >
            <div className="gc-stat-icon">{s.icon}</div>
            <div className="gc-stat-label">{s.label}</div>
            <div className="gc-stat-value" style={{ color: s.value > 0 ? s.color : '#2C2C2C' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="gc-filters">
        <div className="gc-filter-group search-group">
          <label className="gc-filter-label">🔍 Search</label>
          <input
            type="text"
            placeholder="Search albums, agencies..."
            value={searchTerm}
            onChange={e => handleSearch(e.target.value)}
            className="gc-filter-input"
          />
        </div>
        <div className="gc-filter-group">
          <label className="gc-filter-label">Agency</label>
          <select value={agencyFilter} onChange={e => handleAgency(e.target.value)} className="gc-filter-input">
            <option value="all">All Agencies</option>
            {agencies.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="gc-filter-count">
          Showing <strong>{filtered.length}</strong> of <strong>{albums.length}</strong> albums
          {totalPages > 1 && <> • Page <strong>{currentPage}</strong> / <strong>{totalPages}</strong></>}
        </div>
      </div>

      {/* ALBUMS GRID */}
      <div className="gc-albums-wrap">
        <div className="gc-albums-header">
          <div className="gc-albums-title">Photo Albums</div>
          <span style={{ fontSize: 13, color: '#888' }}>{filtered.length} results</span>
        </div>

        {filtered.length === 0 ? (
          <div className="gc-empty">
            <div className="gc-empty-icon">🖼️</div>
            <div className="gc-empty-title">
              {searchTerm || statusFilter !== 'all' || agencyFilter !== 'all' ? 'No albums match your filters' : 'No albums yet'}
            </div>
            <div className="gc-empty-sub">
              {searchTerm || statusFilter !== 'all' || agencyFilter !== 'all' ? 'Try adjusting your filters' : 'Agency albums will appear here'}
            </div>
          </div>
        ) : (
          <>
            <div className="gc-albums-grid">
              {paginated.map((album: any) => {
                const coverPhoto = album.cover_photo_url || (album.photos && album.photos[0])
                return (
                  <div key={album.id} className="gc-card">
                    {coverPhoto ? (
                      <div className="gc-card-thumb" style={{ backgroundImage: 'url(' + coverPhoto + ')' }}>
                        <div className="gc-card-badge-wrap">
                          <StatusBadge status={album.is_published ? 'published' : 'draft'} />
                        </div>
                      </div>
                    ) : (
                      <div className="gc-card-thumb-empty">
                        <div className="gc-card-badge-wrap">
                          <StatusBadge status={album.is_published ? 'published' : 'draft'} />
                        </div>
                        🖼️
                      </div>
                    )}
                    <div className="gc-card-info">
                      <div className="gc-card-agency">{album.agencies?.name || 'Unknown Agency'}</div>
                      <div className="gc-card-title">{album.title}</div>
                      <div className="gc-card-meta">
                        📷 {album.photo_count || 0} photos • {new Date(album.created_at).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <button className="gc-view-btn" onClick={() => openAlbum(album)}>👁 View Photos</button>
                      <ActionButtons album={album} onToggle={handleToggle} onDelete={handleDelete} />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="gc-pagination">
                <button className="gc-pg-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</button>
                <div className="gc-pg-pages">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce<(number | string)[]>((acc, p, i, arr) => {
                      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                      acc.push(p)
                      return acc
                    }, [])
                    .map((p, i) =>
                      p === '...'
                        ? <span key={'e' + i} className="gc-pg-ellipsis">...</span>
                        : <button key={p} className={'gc-pg-num' + (currentPage === p ? ' active' : '')} onClick={() => setCurrentPage(p as number)}>{p}</button>
                    )}
                </div>
                <button className="gc-pg-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}