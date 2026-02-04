'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ReelsActions({ reel }: { reel: any }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    if (!confirm(`${reel.is_active ? 'Hide' : 'Show'} this reel?`)) return

    console.log('🔍 Toggling reel:', reel.id)
    console.log('🔍 Current is_active:', reel.is_active)
    console.log('🔍 Will set to:', !reel.is_active)

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('reels')
        .update({ is_active: !reel.is_active })
        .eq('id', reel.id)
        .select()

      console.log('🔍 Update result:', data)
      console.log('🔍 Update error:', error)

      if (error) throw error

      alert(`✅ Reel ${reel.is_active ? 'hidden' : 'shown'} successfully!`)
      window.location.reload()
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error: ${error.message || 'Failed to toggle reel'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this reel? This action cannot be undone.')) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('reels')
        .delete()
        .eq('id', reel.id)

      if (error) throw error

      alert('✅ Reel deleted successfully!')
      window.location.reload()
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error: ${error.message || 'Failed to delete reel'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '6px' }}>
      <button
        onClick={handleToggle}
        disabled={loading}
        style={{
          flex: 1,
          padding: '6px',
          backgroundColor: reel.is_active ? '#FEF3C7' : '#ECFDF5',
          color: reel.is_active ? '#F59E0B' : '#10B981',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1
        }}
      >
        {loading ? '...' : reel.is_active ? 'Hide' : 'Show'}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        style={{
          flex: 1,
          padding: '6px',
          backgroundColor: '#FEE2E2',
          color: '#EF4444',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
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