'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AlbumActions({ album }: { album: any }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    if (!confirm(`${album.is_published ? 'Unpublish' : 'Publish'} this album?`)) return

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('photo_albums')
        .update({ is_published: !album.is_published })
        .eq('id', album.id)
        .select()

      if (error) throw error

      alert(`✅ Album ${album.is_published ? 'unpublished' : 'published'} successfully!`)
      window.location.reload()
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this album?')) return

    setLoading(true)

    try {
      const { error } = await supabase
        .from('photo_albums')
        .delete()
        .eq('id', album.id)

      if (error) throw error

      alert('✅ Album deleted!')
      window.location.reload()
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={handleToggle}
        disabled={loading}
        style={{
          padding: '6px 16px',
          backgroundColor: album.is_published ? '#FEF3C7' : '#ECFDF5',
          color: album.is_published ? '#F59E0B' : '#10B981',
          border: 'none',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1
        }}
      >
        {loading ? '...' : album.is_published ? 'Unpublish' : 'Publish'}
      </button>

      <button
        onClick={handleDelete}
        disabled={loading}
        style={{
          padding: '6px 16px',
          backgroundColor: '#FEE2E2',
          color: '#EF4444',
          border: 'none',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1
        }}
      >
        {loading ? '...' : 'Delete'}
      </button>
    </div>
  )
}