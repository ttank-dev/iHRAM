'use client'

import { useState } from 'react'
import { deleteGuide, togglePublish } from './actions'
import { useRouter } from 'next/navigation'

export default function GuideActions({ guide }: { guide: any }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Delete "${guide.title}"?`)) return

    setLoading(true)
    const result = await deleteGuide(guide.id)
    
    if (result.error) {
      alert('Error: ' + result.error)
    } else {
      router.refresh()
    }
    
    setLoading(false)
  }

  const handleTogglePublish = async () => {
    setLoading(true)
    const result = await togglePublish(guide.id, guide.is_published)
    
    if (result.error) {
      alert('Error: ' + result.error)
    } else {
      router.refresh()
    }
    
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button 
        onClick={() => window.open(`/panduan/${guide.slug}?preview=true`, '_blank')} 
        style={{ padding: '6px 12px', backgroundColor: '#6B7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}
      >
        View
      </button>
      <button 
        onClick={() => router.push(`/admin/panduan/edit/${guide.id}`)} 
        disabled={loading} 
        style={{ padding: '6px 12px', backgroundColor: '#3B82F6', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '12px' }}
      >
        Edit
      </button>
      <button 
        onClick={handleTogglePublish} 
        disabled={loading} 
        style={{ padding: '6px 12px', backgroundColor: guide.is_published ? '#F59E0B' : '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '12px' }}
      >
        {guide.is_published ? 'Unpublish' : 'Publish'}
      </button>
      <button 
        onClick={handleDelete} 
        disabled={loading} 
        style={{ padding: '6px 12px', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '12px' }}
      >
        Delete
      </button>
    </div>
  )
}