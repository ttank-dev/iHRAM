'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditNewsFeedPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [id, setId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_published: true
  })

  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])

  useEffect(() => {
    params.then(p => { setId(p.id); loadPost(p.id) })
  }, [])

  const loadPost = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/merchant/login'); return }
    const { data: agency } = await supabase.from('agencies').select('id').eq('user_id', user.id).single()
    if (!agency) return
    const { data: post, error } = await supabase.from('news_feed').select('*')
      .eq('id', postId).eq('agency_id', agency.id).single()
    if (error || !post) {
      alert('Post not found')
      router.push('/merchant/dashboard/newsfeed')
      return
    }
    setFormData({ title: post.title, content: post.content, is_published: post.is_published })
    setExistingImages(post.images || [])
    setLoading(false)
  }

  const totalImages = existingImages.length + newImageFiles.length
  const canAddMore = totalImages < 5

  const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    if (totalImages + files.length > 5) {
      alert(`Maximum 5 images. You already have ${totalImages} image${totalImages > 1 ? 's' : ''}.`)
      return
    }
    setNewImageFiles([...newImageFiles, ...Array.from(files)])
  }

  const removeExistingImage = (i: number) =>
    setExistingImages(existingImages.filter((_, idx) => idx !== i))

  const removeNewImage = (i: number) =>
    setNewImageFiles(newImageFiles.filter((_, idx) => idx !== i))

  const uploadNewImages = async (agencyId: string) => {
    if (newImageFiles.length === 0) return []
    setUploading(true)
    const urls: string[] = []
    for (const file of newImageFiles) {
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
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data: agency } = await supabase.from('agencies').select('id').eq('user_id', user.id).single()
      if (!agency) throw new Error('Agency not found')
      const newImageUrls = await uploadNewImages(agency.id)
      const allImages = [...existingImages, ...newImageUrls]
      const { error: updateError } = await supabase.from('news_feed').update({
        title: formData.title,
        content: formData.content,
        images: allImages.length > 0 ? allImages : null,
        is_published: formData.is_published
      }).eq('id', id)
      if (updateError) throw updateError
      router.push('/merchant/dashboard/newsfeed')
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  const isBusy = saving || uploading

  if (loading) return (
    <>
      <div className="en-load"><div className="en-spin" /><p>Loading...</p></div>
      <style>{`.en-load{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;gap:16px;color:#999}.en-spin{width:36px;height:36px;border:3px solid #e5e5e5;border-top-color:#B8936D;border-radius:50%;animation:ens .7s linear infinite}@keyframes ens{to{transform:rotate(360deg)}}`}</style>
    </>
  )

  return (
    <>
      <style>{`
        .en,.en *{box-sizing:border-box}
        .en{max-width:900px;width:100%;overflow:hidden}

        /* Header */
        .en-header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:24px;flex-wrap:wrap}
        .en-title{font-size:28px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .en-sub{font-size:14px;color:#888;margin:0}
        .en-back{
          padding:10px 20px;background:#F5F5F0;color:#2C2C2C;
          border-radius:8px;font-size:14px;font-weight:600;
          text-decoration:none;white-space:nowrap;flex-shrink:0;
          transition:background .15s;display:inline-block;
        }
        .en-back:hover{background:#e8e8e3}

        /* Error */
        .en-error{padding:14px 16px;background:#FEE2E2;border:1px solid #FCA5A5;
          border-radius:8px;margin-bottom:20px;color:#991B1B;font-size:14px}

        /* Card */
        .en-card{background:white;border-radius:14px;padding:28px;border:1px solid #E5E5E0;margin-bottom:20px}
        .en-card-title{font-size:17px;font-weight:700;color:#2C2C2C;margin:0 0 6px}
        .en-divider{border:none;border-top:1px solid #f0f0ec;margin:0 0 20px}

        /* Fields */
        .en-field{margin-bottom:20px}
        .en-field:last-child{margin-bottom:0}
        .en-label{display:block;font-size:13px;font-weight:600;color:#555;margin-bottom:6px}
        .en-req{color:#EF4444;margin-left:2px}
        .en-hint{font-size:12px;color:#aaa;margin-top:5px}

        .en-input,.en-textarea{
          width:100%;padding:12px 14px;font-size:14px;
          border:1.5px solid #E5E5E0;border-radius:9px;
          outline:none;transition:border-color .15s;
          font-family:inherit;color:#2C2C2C;background:white;
        }
        .en-input:focus,.en-textarea:focus{border-color:#B8936D}
        .en-input:disabled{opacity:.5;cursor:not-allowed}
        .en-textarea{resize:vertical;min-height:200px}
        .en-input[type=file]{cursor:pointer;padding:10px 12px;font-size:13px}

        /* Publish toggle */
        .en-toggle{display:flex;align-items:center;gap:12px;cursor:pointer;user-select:none}
        .en-toggle input[type=checkbox]{width:18px;height:18px;cursor:pointer;accent-color:#B8936D}
        .en-toggle-label{font-size:14px;color:#2C2C2C;font-weight:500}

        /* Image count badge */
        .en-img-count{font-size:12px;color:#888;margin-bottom:12px}

        /* Photo grids */
        .en-photo-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
        .en-photo-wrap{position:relative}
        .en-photo-img{width:100%;height:100px;object-fit:cover;border-radius:8px;border:1.5px solid #E5E5E0;display:block}
        .en-photo-img-new{border-color:#B8936D}
        .en-photo-num{
          position:absolute;top:4px;left:4px;
          background:#B8936D;color:white;border-radius:50%;
          width:22px;height:22px;display:flex;align-items:center;
          justify-content:center;font-size:11px;font-weight:700;
        }
        .en-photo-new-tag{
          position:absolute;top:4px;left:4px;
          background:#B8936D;color:white;border-radius:4px;
          padding:2px 6px;font-size:10px;font-weight:700;
        }
        .en-photo-del{
          position:absolute;top:4px;right:4px;
          background:#EF4444;color:white;border:none;border-radius:50%;
          width:22px;height:22px;display:flex;align-items:center;
          justify-content:center;font-size:13px;font-weight:700;
          cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,.2);
        }
        .en-photo-del:hover{background:#dc2626}

        /* Submit */
        .en-footer{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
        .en-save{
          padding:13px 28px;background:#B8936D;color:white;
          border:none;border-radius:9px;font-size:15px;font-weight:700;
          cursor:pointer;transition:background .15s;white-space:nowrap;
        }
        .en-save:hover:not(:disabled){background:#a07d5a}
        .en-save:disabled{opacity:.6;cursor:not-allowed}
        .en-cancel{
          padding:13px 24px;background:#F5F5F0;color:#555;
          border-radius:9px;font-size:15px;font-weight:700;
          text-decoration:none;display:inline-block;
          transition:background .15s;white-space:nowrap;
        }
        .en-cancel:hover{background:#e8e8e3}

        /* ── TABLET ── */
        @media(max-width:1023px){
          .en-title{font-size:24px}
          .en-card{padding:22px}
          .en-photo-grid{grid-template-columns:repeat(4,1fr)}
        }

        /* ── MOBILE ── */
        @media(max-width:639px){
          .en-header{flex-direction:column;align-items:stretch;gap:10px;margin-bottom:16px}
          .en-back{text-align:center}
          .en-title{font-size:20px}
          .en-card{padding:16px;border-radius:12px;margin-bottom:14px}
          .en-card-title{font-size:15px}
          .en-photo-grid{grid-template-columns:repeat(3,1fr);gap:8px}
          .en-photo-img{height:85px}
          .en-footer{flex-direction:column;align-items:stretch}
          .en-save,.en-cancel{width:100%;text-align:center;padding:14px}
        }

        /* ── SMALL MOBILE ── */
        @media(max-width:380px){
          .en-card{padding:14px}
          .en-title{font-size:18px}
          .en-photo-grid{grid-template-columns:repeat(2,1fr)}
        }
      `}</style>

      <div className="en">

        {/* Header */}
        <div className="en-header">
          <div>
            <h1 className="en-title">✏️ Edit News Feed Post</h1>
            <p className="en-sub">Update your news feed post</p>
          </div>
          <Link href="/merchant/dashboard/newsfeed" className="en-back">← Back</Link>
        </div>

        {error && <div className="en-error">❌ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="en-card">
            <div className="en-card-title">📰 Post Details</div>
            <hr className="en-divider" />

            {/* Title */}
            <div className="en-field">
              <label className="en-label">Post Title <span className="en-req">*</span></label>
              <input type="text" required className="en-input"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })} />
            </div>

            {/* Content */}
            <div className="en-field">
              <label className="en-label">Content <span className="en-req">*</span></label>
              <textarea required rows={10} className="en-textarea"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })} />
            </div>

            {/* Existing images */}
            {existingImages.length > 0 && (
              <div className="en-field">
                <label className="en-label">Current Images</label>
                <div className="en-img-count">
                  {existingImages.length} image{existingImages.length > 1 ? 's' : ''} — click ✕ to remove
                </div>
                <div className="en-photo-grid">
                  {existingImages.map((img, i) => (
                    <div key={i} className="en-photo-wrap">
                      <img src={img} alt={`Image ${i + 1}`} className="en-photo-img" />
                      <div className="en-photo-num">{i + 1}</div>
                      <button type="button" className="en-photo-del"
                        onClick={() => removeExistingImage(i)} title="Remove">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add new images */}
            <div className="en-field">
              <label className="en-label">
                Add New Images
                {canAddMore && (
                  <span style={{ fontWeight: 400, color: '#aaa', marginLeft: 6 }}>
                    ({5 - totalImages} slot{5 - totalImages > 1 ? 's' : ''} remaining)
                  </span>
                )}
              </label>
              <input type="file" accept="image/*" multiple className="en-input"
                disabled={!canAddMore}
                onChange={handleNewImageUpload} />
              <div className="en-hint">
                Total images: {totalImages} / 5
                {!canAddMore && ' — maximum reached'}
              </div>

              {newImageFiles.length > 0 && (
                <div className="en-photo-grid" style={{ marginTop: 12 }}>
                  {newImageFiles.map((file, i) => (
                    <div key={i} className="en-photo-wrap">
                      <img src={URL.createObjectURL(file)} alt={`New ${i + 1}`}
                        className="en-photo-img en-photo-img-new" />
                      <div className="en-photo-new-tag">NEW</div>
                      <button type="button" className="en-photo-del"
                        onClick={() => removeNewImage(i)} title="Remove">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Publish toggle */}
            <div className="en-field">
              <label className="en-toggle">
                <input type="checkbox"
                  checked={formData.is_published}
                  onChange={e => setFormData({ ...formData, is_published: e.target.checked })} />
                <span className="en-toggle-label">Publish this post</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="en-footer">
            <button type="submit" disabled={isBusy} className="en-save">
              {uploading ? '⏳ Uploading...' : saving ? '⏳ Saving...' : '💾 Update Post'}
            </button>
            <Link href="/merchant/dashboard/newsfeed" className="en-cancel">Cancel</Link>
          </div>
        </form>
      </div>
    </>
  )
}