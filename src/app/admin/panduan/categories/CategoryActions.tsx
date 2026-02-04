'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function CategoryActions({ category }: { category: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleToggleActive = async () => {
    const newStatus = !category.is_active
    const confirmMsg = newStatus 
      ? `Activate category "${category.name}"?`
      : `Deactivate category "${category.name}"? It will no longer appear in dropdowns.`
    
    if (!confirm(confirmMsg)) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: newStatus })
        .eq('id', category.id)

      if (error) throw error

      alert(`✅ Category ${newStatus ? 'activated' : 'deactivated'} successfully!`)
      router.refresh()
    } catch (error: any) {
      console.error('Error toggling category:', error)
      alert(`❌ Error: ${error.message || 'Failed to toggle category'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete category "${category.name}"? This action cannot be undone.`)) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id)

      if (error) throw error

      alert('✅ Category deleted successfully!')
      router.refresh()
    } catch (error: any) {
      console.error('Error deleting category:', error)
      alert(`❌ Error: ${error.message || 'Failed to delete category'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
      
      {/* Edit Button */}
      <Link
        href={`/admin/panduan/categories/edit/${category.id}`}
        style={{
          padding: '8px 16px',
          backgroundColor: '#EFF6FF',
          color: '#3B82F6',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '600',
          textDecoration: 'none',
          display: 'inline-block',
          cursor: 'pointer'
        }}
      >
        Edit
      </Link>

      {/* Deactivate/Activate Button */}
      <button
        onClick={handleToggleActive}
        disabled={loading}
        style={{
          padding: '8px 16px',
          backgroundColor: category.is_active ? '#FEF3C7' : '#ECFDF5',
          color: category.is_active ? '#F59E0B' : '#10B981',
          border: 'none',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1
        }}
      >
        {loading ? '...' : category.is_active ? 'Deactivate' : 'Activate'}
      </button>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        disabled={loading}
        style={{
          padding: '8px 16px',
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