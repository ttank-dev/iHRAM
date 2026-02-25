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

  useEffect(() => {
    console.log('🔍 Categories received:', categories?.length)
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
    if (!file.type.startsWith('image/')) { alert('❌ Please upload an image file'); return }
    if (file.size > 5 * 1024 * 1024) { alert('❌ Image size must be less than 5MB'); return }

    try {
      setUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `guides/${fileName}`

      const { error: uploadError } = await supabase.storage.from('public').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('public').getPublicUrl(filePath)
      setFormData(prev => ({ ...prev, cover_image: urlData.publicUrl }))
      alert('✅ Image uploaded successfully!')
    } catch (error: any) {
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
      const { error } = await supabase.from('guides').update({
        title: formData.title,
        category: formData.category,
        excerpt: formData.excerpt,
        content,
        cover_image: formData.cover_image,
        is_published: formData.is_published
      }).eq('id', guide.id)

      if (error) throw error
      alert('✅ Guide updated successfully!')
      router.push('/admin/panduan')
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .egf-wrap {
          background: white;
          border-radius: 16px;
          padding: 32px;
          border: 1px solid #E5E5E0;
          margin-bottom: 24px;
        }
        .egf-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #2C2C2C;
          margin-bottom: 8px;
        }
        .egf-input {
          width: 100%;
          padding: 12px 16px;
          font-size: 15px;
          border: 1px solid #E5E5E0;
          border-radius: 8px;
          outline: none;
          background: white;
          color: #2C2C2C;
          box-sizing: border-box;
        }
        .egf-input:focus { border-color: #B8936D; }
        .egf-field { margin-bottom: 24px; }
        .egf-hint { font-size: 12px; color: #999; margin-top: 6px; }
        .egf-warn {
          font-size: 13px;
          color: #F59E0B;
          margin-top: 4px;
          padding: 8px 12px;
          background: #FEF3C7;
          border-radius: 6px;
        }
        .egf-cover-preview {
          width: 100%;
          max-width: 400px;
          height: 200px;
          border-radius: 8px;
          background-size: cover;
          background-position: center;
          margin-bottom: 12px;
          border: 1px solid #E5E5E0;
        }
        .egf-publish {
          padding: 20px;
          background: #F5F5F0;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        .egf-publish-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .egf-publish-title { font-size: 15px; font-weight: 600; color: #2C2C2C; margin-bottom: 4px; }
        .egf-publish-sub { font-size: 13px; color: #666; }
        .egf-actions {
          display: flex;
          gap: 12px;
          padding-top: 24px;
          border-top: 1px solid #E5E5E0;
          flex-wrap: wrap;
        }
        .egf-btn-save {
          padding: 14px 32px;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }
        .egf-btn-cancel {
          padding: 14px 32px;
          background: transparent;
          color: #666;
          border: 1px solid #E5E5E0;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 639px) {
          .egf-wrap { padding: 20px 16px; border-radius: 12px; }
          .egf-label { font-size: 13px; }
          .egf-input { padding: 10px 12px; font-size: 14px; }
          .egf-field { margin-bottom: 18px; }
          .egf-cover-preview { height: 160px; }
          .egf-publish { padding: 14px; }
          .egf-publish-title { font-size: 14px; }
          .egf-publish-sub { font-size: 12px; }
          .egf-actions { gap: 10px; padding-top: 18px; }
          .egf-btn-save { padding: 12px 20px; font-size: 14px; flex: 1; }
          .egf-btn-cancel { padding: 12px 20px; font-size: 14px; flex: 1; }
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .egf-wrap { padding: 24px; }
          .egf-btn-save { padding: 12px 24px; }
          .egf-btn-cancel { padding: 12px 24px; }
        }
      `}</style>

      <div className="egf-wrap">
        <form onSubmit={handleSubmit}>

          {/* Title */}
          <div className="egf-field">
            <label className="egf-label">Title <span style={{ color: '#EF4444' }}>*</span></label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              className="egf-input"
            />
          </div>

          {/* Category */}
          <div className="egf-field">
            <label className="egf-label">
              Category
              <span style={{ fontSize: '12px', color: '#999', marginLeft: '8px' }}>
                ({categories?.length || 0} categories loaded)
              </span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="egf-input"
            >
              <option value="">Select category...</option>
              {Array.isArray(categories) && categories.length > 0 ? (
                categories.map((cat: any) => (
                  <option key={cat.id} value={cat.slug}>{cat.name}</option>
                ))
              ) : (
                <option disabled>No categories available</option>
              )}
            </select>
            <div className="egf-hint">Current value: {formData.category || '(none)'}</div>
            {(!Array.isArray(categories) || categories.length === 0) && (
              <div className="egf-warn">⚠️ No categories found. Please add categories first.</div>
            )}
          </div>

          {/* Excerpt */}
          <div className="egf-field">
            <label className="egf-label">Excerpt</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => handleChange('excerpt', e.target.value)}
              rows={3}
              placeholder="Short summary..."
              className="egf-input"
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* Cover Image */}
          <div className="egf-field">
            <label className="egf-label">Cover Image</label>
            {formData.cover_image && (
              <div
                className="egf-cover-preview"
                style={{ backgroundImage: `url(${formData.cover_image})` }}
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
              className="egf-input"
              style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
            />
            {uploading && <div className="egf-hint" style={{ color: '#F59E0B' }}>⏳ Uploading...</div>}
          </div>

          {/* Content */}
          <div className="egf-field">
            <label className="egf-label">Content <span style={{ color: '#EF4444' }}>*</span></label>
            <RichTextEditor
              name="content"
              defaultValue={guide.content || ''}
              required
              editorRef={editorRef}
            />
          </div>

          {/* Publish Toggle */}
          <div className="egf-publish">
            <label className="egf-publish-label">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => handleChange('is_published', e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer', flexShrink: 0 }}
              />
              <div>
                <div className="egf-publish-title">Publish this guide</div>
                <div className="egf-publish-sub">Make this guide visible to the public</div>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="egf-actions">
            <button
              type="submit"
              disabled={loading || uploading}
              className="egf-btn-save"
              style={{ backgroundColor: loading ? '#999' : '#B8936D', cursor: loading || uploading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/panduan')}
              className="egf-btn-cancel"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </>
  )
}