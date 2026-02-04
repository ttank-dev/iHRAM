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
    
    // Get content from TinyMCE editor
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
            name="title"
            required
            placeholder="e.g. Tips First-Timer Umrah"
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

        {/* Category */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '8px'
          }}>
            Category
          </label>
          <select
            name="category"
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
            {Array.isArray(categories) && categories.map((category: any) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          {(!Array.isArray(categories) || categories.length === 0) && (
            <div style={{
              fontSize: '13px',
              color: '#F59E0B',
              marginTop: '4px'
            }}>
              No categories found. Please add categories first.
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
            name="excerpt"
            rows={3}
            placeholder="Short description (will appear in listing)"
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
          <RichTextEditor name="content" required editorRef={editorRef} />
          <div style={{
            fontSize: '13px',
            color: '#999',
            marginTop: '8px'
          }}>
            Use the rich text editor to format your content
          </div>
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
              name="is_published"
              value="true"
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
                Make this guide visible to the public immediately
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
            disabled={loading}
            style={{
              padding: '14px 32px',
              backgroundColor: loading ? '#999' : '#B8936D',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading ? '⏳ Creating...' : '✨ Create Guide'}
          </button>

          <Link
            href="/admin/panduan"
            style={{
              padding: '14px 32px',
              backgroundColor: 'transparent',
              color: '#666',
              border: '1px solid #E5E5E0',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}