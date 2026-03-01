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
      router.refresh()
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${category.name}"?\n\nThis cannot be undone.`)) return
    setLoading(true)
    try {
      const { error } = await supabase.from('categories').delete().eq('id', category.id)
      if (error) throw error
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
        .ca-actions { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px; }
        .ca-btn {
          height: 30px;
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
          text-decoration: none;
          font-family: inherit;
        }
        .ca-btn:hover:not(:disabled) { filter: brightness(0.92); }
        .ca-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ca-btn-blue   { background: #3B82F6; color: white; }
        .ca-btn-green  { background: #10B981; color: white; }
        .ca-btn-amber  { background: #F59E0B; color: white; }
        .ca-btn-red    { background: #EF4444; color: white; }
        @media (max-width: 639px) {
          .ca-actions { grid-template-columns: 1fr 1fr 1fr; }
        }
      `}</style>

      <div className="ca-actions">
        <Link
          href={`/admin/panduan/categories/edit/${category.id}`}
          className="ca-btn ca-btn-blue"
        >
          ✏️ Edit
        </Link>
        <button
          onClick={handleToggleActive}
          disabled={loading}
          className={'ca-btn ' + (category.is_active ? 'ca-btn-amber' : 'ca-btn-green')}
        >
          {loading ? '...' : category.is_active ? '⏸ Deactivate' : '✓ Activate'}
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="ca-btn ca-btn-red"
        >
          {loading ? '...' : '🗑 Delete'}
        </button>
      </div>
    </>
  )
}