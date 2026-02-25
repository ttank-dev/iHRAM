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
    if (!confirm(newStatus ? `Activate "${category.name}"?` : `Deactivate "${category.name}"?`)) return
    setLoading(true)
    try {
      const { error } = await supabase.from('categories').update({ is_active: newStatus }).eq('id', category.id)
      if (error) throw error
      alert(`✅ Category ${newStatus ? 'activated' : 'deactivated'}!`)
      router.refresh()
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${category.name}"? Cannot be undone.`)) return
    setLoading(true)
    try {
      const { error } = await supabase.from('categories').delete().eq('id', category.id)
      if (error) throw error
      alert('✅ Category deleted!')
      router.refresh()
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .ca-wrap { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
        .ca-btn {
          padding: 8px 14px; border: none; border-radius: 6px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          text-decoration: none; display: inline-block;
          white-space: nowrap;
        }
        @media (max-width: 639px) {
          .ca-wrap { justify-content: flex-start; }
          .ca-btn { padding: 8px 12px; font-size: 12px; flex: 1; text-align: center; }
        }
      `}</style>
      <div className="ca-wrap">
        <Link
          href={`/admin/panduan/categories/edit/${category.id}`}
          className="ca-btn"
          style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}
        >
          Edit
        </Link>
        <button
          onClick={handleToggleActive}
          disabled={loading}
          className="ca-btn"
          style={{
            backgroundColor: category.is_active ? '#FEF3C7' : '#ECFDF5',
            color: category.is_active ? '#F59E0B' : '#10B981',
            opacity: loading ? 0.5 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '...' : category.is_active ? 'Deactivate' : 'Activate'}
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="ca-btn"
          style={{
            backgroundColor: '#FEE2E2', color: '#EF4444',
            opacity: loading ? 0.5 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '...' : 'Delete'}
        </button>
      </div>
    </>
  )
}