'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import RichTextEditor from './RichTextEditor'

export default function EditGuideForm({ guide, categories = [] }: { guide: any, categories?: any[] }) {
  const router = useRouter()
  const supabase = createClient()
  const editorRef = useRef<any>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // DEBUG - Check what categories we received
  useEffect(() => {
    console.log('🔍 Categories received in EditGuideForm:', categories)
    console.log('🔍 Categories length:', categories?.length)
    console.log('🔍 Categories array:', JSON.stringify(categories, null, 2))
  }, [categories])

  const [formData, setFormData] = useState({
    title: guide.title || '',
    category: guide.category || '',
    excerpt: guide.excerpt || '',
    cover_image: guide.cover_image || '',
    is_published: guide.is_published || false
  })

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('❌ Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('❌ Image size must be less than 5MB')
      return
    }

    try {
      setUploading(true)

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `guides/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('public')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, cover_image: urlData.publicUrl }))
      alert('✅ Image uploaded successfully!')
      
    } catch (error: any) {
      console.error('❌ Upload failed:', error)
      alert(`❌ Error uploading image: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const content = editorRef.current ? editorRef.current.getContent() : guide.content

      const { error } = await supabase
        .from('guides')
        .update({
          title: formData.title,
          category: formData.category,
          excerpt: formData.excerpt,
          content: content,
          cover_image: formData.cover_image,
          is_published: formData.is_published
        })
        .eq('id', guide.id)

      if (error) throw error

      alert('✅ Guide updated successfully!')
      router.push('/admin/panduan')
    } catch (error: any) {
      console.error('Error updating guide:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
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
        
        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '8px'
          }}>
            Title <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
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

        {/* Category - FROM DATABASE WITH DEBUG */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '8px'
          }}>
            Category
            <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
              ({categories?.length || 0} categories loaded)
            </span>
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
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
          >
            <option value="">Select category...</option>
            {Array.isArray(categories) && categories.length > 0 ? (
              categories.map((cat: any) => {
                console.log('🏷️ Rendering category:', cat.name, cat.slug)
                return (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                )
              })
            ) : (
              <option disabled>No categories available</option>
            )}
          </select>
          
          {/* DEBUG INFO */}
          <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
            Current value: {formData.category || '(none)'}
          </div>
          
          {(!Array.isArray(categories) || categories.length === 0) && (
            <div style={{
              fontSize: '13px',
              color: '#F59E0B',
              marginTop: '4px',
              padding: '8px 12px',
              backgroundColor: '#FEF3C7',
              borderRadius: '6px'
            }}>
              ⚠️ No categories found. Please add categories in the Categories page first.
            </div>
          )}
        </div>

        {/* Excerpt */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '8px'
          }}>
            Excerpt
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => handleChange('excerpt', e.target.value)}
            rows={3}
            placeholder="Short summary..."
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

        {/* Cover Image */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '8px'
          }}>
            Cover Image
          </label>
          
          {formData.cover_image && (
            <div style={{
              width: '100%',
              maxWidth: '400px',
              height: '200px',
              borderRadius: '8px',
              backgroundImage: `url(${formData.cover_image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              marginBottom: '12px',
              border: '1px solid #E5E5E0'
            }} />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={uploading}
            style={{
              display: 'block',
              padding: '12px',
              fontSize: '14px',
              border: '1px solid #E5E5E0',
              borderRadius: '8px',
              backgroundColor: 'white',
              cursor: uploading ? 'not-allowed' : 'pointer',
              width: '100%'
            }}
          />
          {uploading && (
            <div style={{ fontSize: '13px', color: '#F59E0B', marginTop: '4px' }}>
              ⏳ Uploading...
            </div>
          )}
        </div>

        {/* Content */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '8px'
          }}>
            Content <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <RichTextEditor 
            name="content" 
            defaultValue={guide.content || ''} 
            required 
            editorRef={editorRef} 
          />
        </div>

        {/* Publish Toggle */}
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
              checked={formData.is_published}
              onChange={(e) => handleChange('is_published', e.target.checked)}
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
                Publish this guide
              </div>
              <div style={{
                fontSize: '13px',
                color: '#666'
              }}>
                Make this guide visible to the public
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
            disabled={loading || uploading}
            style={{
              padding: '14px 32px',
              backgroundColor: loading ? '#999' : '#B8936D',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading || uploading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Saving...' : '💾 Save Changes'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/admin/panduan')}
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