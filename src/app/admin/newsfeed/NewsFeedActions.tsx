'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import DeleteReasonModal from '../components/DeleteReasonModal'

export default function NewsFeedActions({ post }: { post: any }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleToggle = async () => {
    if (!confirm(`${post.is_active ? 'Hide' : 'Show'} this post?`)) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('news_feed')
        .update({ is_active: !post.is_active })
        .eq('id', post.id)

      if (error) throw error

      // Log moderation
      await supabase.from('moderation_logs').insert({
        content_type: 'news_feed',
        content_id: post.id,
        content_title: post.content?.substring(0, 100),
        agency_id: post.agency_id,
        agency_name: post.agencies?.name,
        action: post.is_active ? 'hide' : 'show',
        admin_name: 'Admin' // Get from auth if needed
      })

      alert(`✅ Post ${post.is_active ? 'hidden' : 'shown'}!`)
      window.location.reload()
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (reason: string) => {
    try {
      // Log before delete
      await supabase.from('moderation_logs').insert({
        content_type: 'news_feed',
        content_id: post.id,
        content_title: post.content?.substring(0, 100),
        agency_id: post.agency_id,
        agency_name: post.agencies?.name,
        action: 'delete',
        reason: reason,
        admin_name: 'Admin'
      })

      const { error } = await supabase
        .from('news_feed')
        .delete()
        .eq('id', post.id)

      if (error) throw error

      alert('✅ Post deleted!')
      window.location.reload()
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setShowDeleteModal(false)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={handleToggle}
          disabled={loading}
          style={{
            padding: '6px 16px',
            backgroundColor: post.is_active ? '#FEF3C7' : '#ECFDF5',
            color: post.is_active ? '#F59E0B' : '#10B981',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {post.is_active ? 'Hide' : 'Show'}
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          disabled={loading}
          style={{
            padding: '6px 16px',
            backgroundColor: '#FEE2E2',
            color: '#EF4444',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          Delete
        </button>
      </div>

      <DeleteReasonModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        contentType="news feed post"
        contentTitle={post.content?.substring(0, 100)}
      />
    </>
  )
}