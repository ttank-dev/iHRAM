'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function CategoryForm({ category }: { category?: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    is_active: category?.is_active ?? true
  })

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (field === 'name') {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) { alert('❌ Name is required'); return }
    if (!formData.slug.trim()) { alert('❌ Slug is required'); return }

    try {
      setSaving(true)
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        is_active: formData.is_active
      }

      if (category) {
        const { error } = await supabase.from('categories').update(payload).eq('id', category.id)
        if (error) throw error
        alert('✅ Category updated!')
      } else {
        const { error } = await supabase.from('categories').insert(payload)
        if (error) throw error
        alert('✅ Category created!')
      }
      router.push('/admin/panduan/categories')
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <style>{`
        .cf-wrap {
          background: white; border-radius: 16px; padding: 32px;
          border: 1px solid #E5E5E0; margin-bottom: 24px;
        }
        .cf-field { margin-bottom: 24px; }
        .cf-label { display: block; font-size: 14px; font-weight: 600; color: #2C2C2C; margin-bottom: 8px; }
        .cf-input {
          width: 100%; padding: 12px 16px; font-size: 15px;
          border: 1px solid #E5E5E0; border-radius: 8px; outline: none;
          background: white; color: #2C2C2C; box-sizing: border-box;
        }
        .cf-input:focus { border-color: #B8936D; }
        .cf-hint { font-size: 13px; color: #999; margin-top: 4px; }
        .cf-toggle {
          padding: 20px; background: #F5F5F0; border-radius: 8px; margin-bottom: 24px;
        }
        .cf-toggle-label { display: flex; align-items: center; gap: 12px; cursor: pointer; }
        .cf-toggle-title { font-size: 15px; font-weight: 600; color: #2C2C2C; margin-bottom: 4px; }
        .cf-toggle-sub { font-size: 13px; color: #666; }
        .cf-actions {
          display: flex; gap: 12px; padding-top: 24px;
          border-top: 1px solid #E5E5E0; flex-wrap: wrap;
        }
        .cf-btn-save {
          padding: 14px 32px; color: white; border: none;
          border-radius: 8px; font-size: 15px; font-weight: 600;
          display: flex; align-items: center; gap: 8px;
        }
        .cf-btn-cancel {
          padding: 14px 32px; background: transparent; color: #666;
          border: 1px solid #E5E5E0; border-radius: 8px; font-size: 15px;
          font-weight: 600; cursor: pointer;
        }

        @media (max-width: 639px) {
          .cf-wrap { padding: 20px 16px; }
          .cf-label { font-size: 13px; }
          .cf-input { padding: 10px 12px; font-size: 14px; }
          .cf-field { margin-bottom: 18px; }
          .cf-toggle { padding: 14px; }
          .cf-toggle-title { font-size: 14px; }
          .cf-toggle-sub { font-size: 12px; }
          .cf-actions { gap: 10px; padding-top: 18px; }
          .cf-btn-save { padding: 12px 20px; font-size: 14px; flex: 1; justify-content: center; }
          .cf-btn-cancel { padding: 12px 20px; font-size: 14px; flex: 1; text-align: center; }
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .cf-wrap { padding: 24px; }
        }
      `}</style>

      <div className="cf-wrap">
        <form onSubmit={handleSubmit}>

          <div className="cf-field">
            <label className="cf-label">Category Name <span style={{ color: '#EF4444' }}>*</span></label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Tips & Advice"
              required
              className="cf-input"
            />
          </div>

          <div className="cf-field">
            <label className="cf-label">Slug <span style={{ color: '#EF4444' }}>*</span></label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              placeholder="tips-advice"
              required
              className="cf-input"
              style={{ fontFamily: 'monospace' }}
            />
            <div className="cf-hint">Used in URLs (auto-generated from name)</div>
          </div>

          <div className="cf-field">
            <label className="cf-label">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of this category..."
              rows={3}
              className="cf-input"
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div className="cf-toggle">
            <label className="cf-toggle-label">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer', flexShrink: 0 }}
              />
              <div>
                <div className="cf-toggle-title">Active Category</div>
                <div className="cf-toggle-sub">Make this category available for use</div>
              </div>
            </label>
          </div>

          <div className="cf-actions">
            <button
              type="submit"
              disabled={saving}
              className="cf-btn-save"
              style={{ backgroundColor: saving ? '#999' : '#B8936D', cursor: saving ? 'not-allowed' : 'pointer' }}
            >
              {saving ? '⏳ Saving...' : category ? '💾 Update Category' : '✨ Create Category'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/panduan/categories')}
              className="cf-btn-cancel"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </>
  )
}