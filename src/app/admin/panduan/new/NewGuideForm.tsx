'use client'

import { createGuide } from '../actions'
import Link from 'next/link'
import RichTextEditor from '../edit/[id]/RichTextEditor'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewGuideForm({ categories = [] }: { categories?: any[] }) {
  const editorRef = useRef<any>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    
    if (editorRef.current) {
      const content = editorRef.current.getContent()
      formData.set('content', content)
    }

    const result = await createGuide(formData)
    
    if (result?.error) {
      alert('Error: ' + result.error)
      setLoading(false)
    } else {
      router.push('/admin/panduan')
    }
  }

  return (
    <>
      <style>{`
        .ngf-wrap {
          background: white;
          border-radius: 16px;
          padding: 32px;
          border: 1px solid #E5E5E0;
          margin-bottom: 24px;
        }
        .ngf-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #2C2C2C;
          margin-bottom: 8px;
        }
        .ngf-input {
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
        .ngf-input:focus {
          border-color: #B8936D;
        }
        .ngf-field { margin-bottom: 24px; }
        .ngf-hint { font-size: 13px; color: #999; margin-top: 8px; }
        .ngf-warn { font-size: 13px; color: #F59E0B; margin-top: 4px; }

        .ngf-publish {
          padding: 20px;
          background: #F5F5F0;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        .ngf-publish-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .ngf-publish-title { font-size: 15px; font-weight: 600; color: #2C2C2C; margin-bottom: 4px; }
        .ngf-publish-sub { font-size: 13px; color: #666; }

        .ngf-actions {
          display: flex;
          gap: 12px;
          padding-top: 24px;
          border-top: 1px solid #E5E5E0;
          flex-wrap: wrap;
        }
        .ngf-btn-submit {
          padding: 14px 32px;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        .ngf-btn-cancel {
          padding: 14px 32px;
          background: transparent;
          color: #666;
          border: 1px solid #E5E5E0;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 639px) {
          .ngf-wrap { padding: 20px 16px; border-radius: 12px; }
          .ngf-label { font-size: 13px; }
          .ngf-input { padding: 10px 12px; font-size: 14px; }
          .ngf-field { margin-bottom: 18px; }
          .ngf-publish { padding: 14px; }
          .ngf-publish-title { font-size: 14px; }
          .ngf-publish-sub { font-size: 12px; }
          .ngf-actions { gap: 10px; padding-top: 18px; }
          .ngf-btn-submit { padding: 12px 20px; font-size: 14px; flex: 1; justify-content: center; }
          .ngf-btn-cancel { padding: 12px 20px; font-size: 14px; flex: 1; justify-content: center; }
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .ngf-wrap { padding: 24px; }
          .ngf-btn-submit { padding: 12px 24px; }
          .ngf-btn-cancel { padding: 12px 24px; }
        }
      `}</style>

      <div className="ngf-wrap">
        <form onSubmit={handleSubmit}>

          {/* Title */}
          <div className="ngf-field">
            <label className="ngf-label">
              Title <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Tips First-Timer Umrah"
              className="ngf-input"
            />
          </div>

          {/* Category */}
          <div className="ngf-field">
            <label className="ngf-label">Category</label>
            <select name="category" className="ngf-input">
              <option value="">Select category...</option>
              {Array.isArray(categories) && categories.map((category: any) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            {(!Array.isArray(categories) || categories.length === 0) && (
              <div className="ngf-warn">No categories found. Please add categories first.</div>
            )}
          </div>

          {/* Excerpt */}
          <div className="ngf-field">
            <label className="ngf-label">Excerpt</label>
            <textarea
              name="excerpt"
              rows={3}
              placeholder="Short description (will appear in listing)"
              className="ngf-input"
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          {/* Content */}
          <div className="ngf-field">
            <label className="ngf-label">
              Content <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <RichTextEditor name="content" required editorRef={editorRef} />
            <div className="ngf-hint">Use the rich text editor to format your content</div>
          </div>

          {/* Publish Toggle */}
          <div className="ngf-publish">
            <label className="ngf-publish-label">
              <input
                type="checkbox"
                name="is_published"
                value="true"
                style={{ width: '20px', height: '20px', cursor: 'pointer', flexShrink: 0 }}
              />
              <div>
                <div className="ngf-publish-title">Publish this guide</div>
                <div className="ngf-publish-sub">Make this guide visible to the public immediately</div>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="ngf-actions">
            <button
              type="submit"
              disabled={loading}
              className="ngf-btn-submit"
              style={{ backgroundColor: loading ? '#999' : '#B8936D', cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading ? '⏳ Creating...' : '✨ Create Guide'}
            </button>
            <Link href="/admin/panduan" className="ngf-btn-cancel">
              Cancel
            </Link>
          </div>

        </form>
      </div>
    </>
  )
}