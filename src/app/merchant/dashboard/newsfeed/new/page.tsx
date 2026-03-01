'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewNewsFeedPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_published: true
  })

  const [imageFiles, setImageFiles] = useState<File[]>([])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setImageFiles(Array.from(files).slice(0, 5))
  }

  const removeImage = (i: number) =>
    setImageFiles(imageFiles.filter((_, idx) => idx !== i))

  const uploadImages = async (agencyId: string) => {
    if (imageFiles.length === 0) return []
    setUploading(true)
    const urls: string[] = []
    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${agencyId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const { error } = await supabase.storage.from('news-feed-images').upload(fileName, file)
      if (error) { console.error('Upload error:', error); continue }
      const { data: { publicUrl } } = supabase.storage.from('news-feed-images').getPublicUrl(fileName)
      urls.push(publicUrl)
    }
    setUploading(false)
    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data: agency } = await supabase.from('agencies').select('id').eq('user_id', user.id).single()
      if (!agency) throw new Error('Agency not found')
      const imageUrls = await uploadImages(agency.id)
      const { error: insertError } = await supabase.from('news_feed').insert({
        agency_id: agency.id,
        title: formData.title,
        content: formData.content,
        images: imageUrls.length > 0 ? imageUrls : null,
        is_published: formData.is_published
      })
      if (insertError) throw insertError
      router.push('/merchant/dashboard/newsfeed')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const isBusy = loading || uploading

  return (
    <>
      <style>{`
        .nn,.nn *{box-sizing:border-box}
        .nn{max-width:900px;width:100%;overflow:hidden}

        /* Header */
        .nn-header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:24px;flex-wrap:wrap}
        .nn-title{font-size:28px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .nn-sub{font-size:14px;color:#888;margin:0}
        .nn-back{
          padding:10px 20px;background:#F5F5F0;color:#2C2C2C;
          border-radius:8px;font-size:14px;font-weight:600;
          text-decoration:none;white-space:nowrap;flex-shrink:0;
          transition:background .15s;display:inline-block;
        }
        .nn-back:hover{background:#e8e8e3}

        /* Error */
        .nn-error{padding:14px 16px;background:#FEE2E2;border:1px solid #FCA5A5;
          border-radius:8px;margin-bottom:20px;color:#991B1B;font-size:14px}

        /* Card */
        .nn-card{background:white;border-radius:14px;padding:28px;border:1px solid #E5E5E0;margin-bottom:20px}
        .nn-card-title{font-size:17px;font-weight:700;color:#2C2C2C;margin:0 0 6px}
        .nn-divider{border:none;border-top:1px solid #f0f0ec;margin:0 0 20px}

        /* Fields */
        .nn-field{margin-bottom:20px}
        .nn-field:last-child{margin-bottom:0}
        .nn-label{display:block;font-size:13px;font-weight:600;color:#555;margin-bottom:6px}
        .nn-req{color:#EF4444;margin-left:2px}
        .nn-hint{font-size:12px;color:#aaa;margin-top:5px}

        .nn-input,.nn-textarea{
          width:100%;padding:12px 14px;font-size:14px;
          border:1.5px solid #E5E5E0;border-radius:9px;
          outline:none;transition:border-color .15s;
          font-family:inherit;color:#2C2C2C;background:white;
        }
        .nn-input:focus,.nn-textarea:focus{border-color:#B8936D}
        .nn-textarea{resize:vertical;min-height:200px}
        .nn-input[type=file]{cursor:pointer;padding:10px 12px;font-size:13px}

        /* Publish toggle */
        .nn-toggle{display:flex;align-items:center;gap:12px;cursor:pointer;user-select:none}
        .nn-toggle input[type=checkbox]{width:18px;height:18px;cursor:pointer;accent-color:#B8936D}
        .nn-toggle-label{font-size:14px;color:#2C2C2C;font-weight:500}

        /* Photo preview */
        .nn-photo-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:14px}
        .nn-photo-wrap{position:relative}
        .nn-photo-img{width:100%;height:100px;object-fit:cover;border-radius:8px;border:1.5px solid #E5E5E0;display:block}
        .nn-photo-num{
          position:absolute;top:4px;left:4px;
          background:#B8936D;color:white;border-radius:50%;
          width:22px;height:22px;display:flex;align-items:center;
          justify-content:center;font-size:11px;font-weight:700;
        }
        .nn-photo-del{
          position:absolute;top:4px;right:4px;
          background:#EF4444;color:white;border:none;border-radius:50%;
          width:22px;height:22px;display:flex;align-items:center;
          justify-content:center;font-size:13px;font-weight:700;
          cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,.2);
        }
        .nn-photo-del:hover{background:#dc2626}

        /* Submit */
        .nn-footer{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
        .nn-save{
          padding:13px 28px;background:#B8936D;color:white;
          border:none;border-radius:9px;font-size:15px;font-weight:700;
          cursor:pointer;transition:background .15s;white-space:nowrap;
        }
        .nn-save:hover:not(:disabled){background:#a07d5a}
        .nn-save:disabled{opacity:.6;cursor:not-allowed}
        .nn-cancel{
          padding:13px 24px;background:#F5F5F0;color:#555;
          border-radius:9px;font-size:15px;font-weight:700;
          text-decoration:none;display:inline-block;
          transition:background .15s;white-space:nowrap;
        }
        .nn-cancel:hover{background:#e8e8e3}

        /* ── TABLET ── */
        @media(max-width:1023px){
          .nn-title{font-size:24px}
          .nn-card{padding:22px}
          .nn-photo-grid{grid-template-columns:repeat(4,1fr)}
        }

        /* ── MOBILE ── */
        @media(max-width:639px){
          .nn-header{flex-direction:column;align-items:stretch;gap:10px;margin-bottom:16px}
          .nn-back{text-align:center}
          .nn-title{font-size:20px}
          .nn-card{padding:16px;border-radius:12px;margin-bottom:14px}
          .nn-card-title{font-size:15px}
          .nn-photo-grid{grid-template-columns:repeat(3,1fr);gap:8px}
          .nn-photo-img{height:85px}
          .nn-footer{flex-direction:column;align-items:stretch}
          .nn-save,.nn-cancel{width:100%;text-align:center;padding:14px}
        }

        /* ── SMALL MOBILE ── */
        @media(max-width:380px){
          .nn-card{padding:14px}
          .nn-title{font-size:18px}
          .nn-photo-grid{grid-template-columns:repeat(2,1fr)}
        }
      `}</style>

      <div className="nn">

        {/* Header */}
        <div className="nn-header">
          <div>
            <h1 className="nn-title">New News Feed Post</h1>
            <p className="nn-sub">Create a new post for your news feed</p>
          </div>
          <Link href="/merchant/dashboard/newsfeed" className="nn-back">← Back</Link>
        </div>

        {error && <div className="nn-error">❌ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="nn-card">
            <div className="nn-card-title">📰 Post Details</div>
            <hr className="nn-divider" />

            {/* Title */}
            <div className="nn-field">
              <label className="nn-label">Post Title <span className="nn-req">*</span></label>
              <input type="text" required className="nn-input"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. March Umrah Package Now Open!" />
            </div>

            {/* Content */}
            <div className="nn-field">
              <label className="nn-label">Content <span className="nn-req">*</span></label>
              <textarea required rows={10} className="nn-textarea"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your post content here..." />
            </div>

            {/* Images */}
            <div className="nn-field">
              <label className="nn-label">Images (max 5)</label>
              <input type="file" accept="image/*" multiple className="nn-input"
                onChange={handleImageUpload} />
              <div className="nn-hint">
                {imageFiles.length > 0
                  ? `✅ ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} selected (max 5)`
                  : '📸 Select images (Ctrl/Cmd + click to select multiple)'}
              </div>

              {imageFiles.length > 0 && (
                <div className="nn-photo-grid">
                  {imageFiles.map((file, i) => (
                    <div key={i} className="nn-photo-wrap">
                      <img src={URL.createObjectURL(file)} alt={`Preview ${i + 1}`} className="nn-photo-img" />
                      <div className="nn-photo-num">{i + 1}</div>
                      <button type="button" className="nn-photo-del"
                        onClick={() => removeImage(i)} title="Remove">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Publish toggle */}
            <div className="nn-field">
              <label className="nn-toggle">
                <input type="checkbox"
                  checked={formData.is_published}
                  onChange={e => setFormData({ ...formData, is_published: e.target.checked })} />
                <span className="nn-toggle-label">Publish immediately</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="nn-footer">
            <button type="submit" disabled={isBusy} className="nn-save">
              {uploading ? '⏳ Uploading...' : loading ? '⏳ Saving...' : '💾 Save Post'}
            </button>
            <Link href="/merchant/dashboard/newsfeed" className="nn-cancel">Cancel</Link>
          </div>
        </form>
      </div>
    </>
  )
}