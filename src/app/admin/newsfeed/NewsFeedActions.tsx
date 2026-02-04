'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NewsFeedActions({ post }: { post: any }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    if (!confirm(`${post.is_active ? 'Hide' : 'Show'} this post?`)) return

    console.log('🔍 Toggling post:', post.id)
    console.log('🔍 Current is_active:', post.is_active)
    console.log('🔍 Will set to:', !post.is_active)

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('news_feed')
        .update({ is_active: !post.is_active })
        .eq('id', post.id)
        .select()

      console.log('🔍 Update result:', data)
      console.log('🔍 Update error:', error)

      if (error) throw error

      alert(`✅ Post ${post.is_active ? 'hidden' : 'shown'} successfully!`)
      window.location.reload()
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error: ${error.message || 'Failed to toggle post'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post? This action cannot be undone.')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('news_feed')
        .delete()
        .eq('id', post.id)

      if (error) throw error

      alert('✅ Post deleted successfully!')
      window.location.reload()
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error: ${error.message || 'Failed to delete post'}`)
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
          backgroundColor: post.is_active ? '#FEF3C7' : '#ECFDF5',
          color: post.is_active ? '#F59E0B' : '#10B981',
          border: 'none',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1
        }}
      >
        {loading ? '...' : post.is_active ? 'Hide' : 'Show'}
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