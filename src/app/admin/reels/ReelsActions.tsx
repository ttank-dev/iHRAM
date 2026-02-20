'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import DeleteReasonModal from '../components/DeleteReasonModal'

export default function ReelsActions({ reel }: { reel: any }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleToggle = async () => {
    const action = reel.is_active ? 'Unpublish' : 'Publish'
    if (!confirm(`${action} this reel?`)) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('reels')
        .update({ is_active: !reel.is_active })
        .eq('id', reel.id)

      if (error) throw error

      await supabase.from('moderation_logs').insert({
        content_type: 'reel',
        content_id: reel.id,
        content_title: reel.title || reel.video_url,
        agency_id: reel.agency_id,
        agency_name: reel.agencies?.name,
        action: reel.is_active ? 'unpublish' : 'publish',
        admin_name: 'Admin'
      })

      alert(`✅ Reel ${reel.is_active ? 'unpublished' : 'published'}!`)
      window.location.reload()
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (reason: string) => {
    try {
      await supabase.from('moderation_logs').insert({
        content_type: 'reel',
        content_id: reel.id,
        content_title: reel.title || reel.video_url,
        agency_id: reel.agency_id,
        agency_name: reel.agencies?.name,
        action: 'delete',
        reason: reason,
        admin_name: 'Admin'
      })

      const { error } = await supabase.from('reels').delete().eq('id', reel.id)
      if (error) throw error

      alert('✅ Reel deleted!')
      window.location.reload()
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setShowDeleteModal(false)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          onClick={handleToggle}
          disabled={loading}
          style={{
            flex: 1, padding: '8px 6px',
            backgroundColor: reel.is_active ? '#FEF3C7' : '#ECFDF5',
            color: reel.is_active ? '#D97706' : '#10B981',
            border: 'none', borderRadius: '6px',
            fontSize: '12px', fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {reel.is_active ? '📤 Unpublish' : '📣 Publish'}
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={loading}
          style={{
            flex: 1, padding: '8px 6px',
            backgroundColor: '#FEE2E2', color: '#EF4444',
            border: 'none', borderRadius: '6px',
            fontSize: '12px', fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          🗑️ Delete
        </button>
      </div>

      <DeleteReasonModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        contentType="reel"
        contentTitle={reel.title || 'Video'}
      />
    </>
  )
}