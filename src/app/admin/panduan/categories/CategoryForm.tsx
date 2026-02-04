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

    // Auto-generate slug from name
    if (field === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('❌ Name is required')
      return
    }

    if (!formData.slug.trim()) {
      alert('❌ Slug is required')
      return
    }

    try {
      setSaving(true)

      if (category) {
        // Update existing
        const { error } = await supabase
          .from('categories')
          .update({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            description: formData.description.trim(),
            is_active: formData.is_active
          })
          .eq('id', category.id)

        if (error) throw error
        alert('✅ Category updated successfully!')
      } else {
        // Create new
        const { error } = await supabase
          .from('categories')
          .insert({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            description: formData.description.trim(),
            is_active: formData.is_active
          })

        if (error) throw error
        alert('✅ Category created successfully!')
      }

      router.push('/admin/panduan/categories')
    } catch (error: any) {
      console.error('Error saving category:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      border: '1px solid #E5E5E0',
      marginBottom: '24px'
    }}>
      <form onSubmit={handleSubmit}>
        
        {/* Name */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '8px'
          }}>
            Category Name <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g. Tips & Advice"
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '15px',
              border: '1px solid #E5E5E0',
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: 'white',
              color: '#2C2C2C'
            }}
          />
        </div>

        {/* Slug */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '8px'
          }}>
            Slug <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            placeholder="tips-advice"
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '15px',
              border: '1px solid #E5E5E0',
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: 'white',
              color: '#2C2C2C',
              fontFamily: 'monospace'
            }}
          />
          <div style={{
            fontSize: '13px',
            color: '#999',
            marginTop: '4px'
          }}>
            Used in URLs (auto-generated from name)
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '8px'
          }}>
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Brief description of this category..."
            rows={3}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '15px',
              border: '1px solid #E5E5E0',
              borderRadius: '8px',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              backgroundColor: 'white',
              color: '#2C2C2C'
            }}
          />
        </div>

        {/* Active Toggle */}
        <div style={{
          padding: '20px',
          backgroundColor: '#F5F5F0',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => handleChange('is_active', e.target.checked)}
              style={{
                width: '20px',
                height: '20px',
                cursor: 'pointer'
              }}
            />
            <div>
              <div style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#2C2C2C',
                marginBottom: '4px'
              }}>
                Active Category
              </div>
              <div style={{
                fontSize: '13px',
                color: '#666'
              }}>
                Make this category available for use
              </div>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '12px',
          paddingTop: '24px',
          borderTop: '1px solid #E5E5E0'
        }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '14px 32px',
              backgroundColor: saving ? '#999' : '#B8936D',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {saving ? '⏳ Saving...' : category ? '💾 Update Category' : '✨ Create Category'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/admin/panduan/categories')}
            style={{
              padding: '14px 32px',
              backgroundColor: 'transparent',
              color: '#666',
              border: '1px solid #E5E5E0',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}