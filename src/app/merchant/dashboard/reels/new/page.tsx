'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewReelPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({ title: '', is_published: true })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file only.')
      return
    }
    if (file.size > 100 * 1024 * 1024) {
      alert('Video file is too large. Maximum size is 100MB.')
      return
    }
    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  const uploadVideo = async (agencyId: string) => {
    if (!videoFile) return null
    setUploadingVideo(true)
    setUploadProgress(0)
    const fileExt = videoFile.name.split('.').pop()
    const fileName = `${agencyId}/${Date.now()}.${fileExt}`
    const { error } = await supabase.storage.from('reels-videos').upload(fileName, videoFile)
    if (error) { console.error('Upload error:', error); setUploadingVideo(false); return null }
    const { data: { publicUrl } } = supabase.storage.from('reels-videos').getPublicUrl(fileName)
    setUploadingVideo(false)
    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!videoFile) { alert('Please select a video to upload.'); return }
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data: agency } = await supabase.from('agencies').select('id').eq('user_id', user.id).single()
      if (!agency) throw new Error('Agency not found')
      const videoUrl = await uploadVideo(agency.id)
      if (!videoUrl) throw new Error('Video upload failed')
      const { error: insertError } = await supabase.from('reels').insert({
        agency_id: agency.id,
        title: formData.title,
        video_url: videoUrl,
        thumbnail_url: null,
        is_published: formData.is_published,
        views: 0
      })
      if (insertError) throw insertError
      router.push('/merchant/dashboard/reels')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const isBusy = loading || uploadingVideo

  return (
    <>
      <style>{`
        .nr,.nr *{box-sizing:border-box}
        .nr{max-width:900px;width:100%;overflow:hidden}

        /* Header */
        .nr-header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:24px;flex-wrap:wrap}
        .nr-title{font-size:28px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .nr-sub{font-size:14px;color:#888;margin:0}
        .nr-back{
          padding:10px 20px;background:#F5F5F0;color:#2C2C2C;
          border-radius:8px;font-size:14px;font-weight:600;
          text-decoration:none;white-space:nowrap;flex-shrink:0;
          transition:background .15s;display:inline-block;
        }
        .nr-back:hover{background:#e8e8e3}

        /* Error */
        .nr-error{padding:14px 16px;background:#FEE2E2;border:1px solid #FCA5A5;
          border-radius:8px;margin-bottom:20px;color:#991B1B;font-size:14px}

        /* Card */
        .nr-card{background:white;border-radius:14px;padding:28px;border:1px solid #E5E5E0;margin-bottom:20px}
        .nr-card-title{font-size:17px;font-weight:700;color:#2C2C2C;margin:0 0 6px}
        .nr-divider{border:none;border-top:1px solid #f0f0ec;margin:0 0 20px}

        /* Fields */
        .nr-field{margin-bottom:20px}
        .nr-field:last-child{margin-bottom:0}
        .nr-label{display:block;font-size:13px;font-weight:600;color:#555;margin-bottom:6px}
        .nr-req{color:#EF4444;margin-left:2px}
        .nr-hint{font-size:12px;color:#aaa;margin-top:5px}

        .nr-input{
          width:100%;padding:12px 14px;font-size:14px;
          border:1.5px solid #E5E5E0;border-radius:9px;
          outline:none;transition:border-color .15s;
          font-family:inherit;color:#2C2C2C;background:white;
        }
        .nr-input:focus{border-color:#B8936D}
        .nr-input[type=file]{cursor:pointer;padding:10px 12px;font-size:13px}

        /* Video info */
        .nr-video-info{
          margin-top:10px;padding:10px 14px;
          background:#F0FFF4;border:1px solid #BBF7D0;border-radius:8px;
          font-size:13px;color:#166534;
        }

        /* Video preview */
        .nr-preview{margin-top:14px}
        .nr-preview video{
          width:100%;max-width:360px;border-radius:10px;
          border:1.5px solid #E5E5E0;display:block;
        }
        .nr-preview-label{font-size:12px;color:#aaa;margin-bottom:6px}

        /* Progress bar */
        .nr-progress-wrap{margin-bottom:20px}
        .nr-progress-label{font-size:13px;color:#666;margin-bottom:6px}
        .nr-progress-track{
          width:100%;height:8px;background:#F5F5F0;
          border-radius:4px;overflow:hidden;
        }
        .nr-progress-fill{
          height:100%;background:#B8936D;
          transition:width .3s ease;border-radius:4px;
        }

        /* Publish toggle */
        .nr-toggle{display:flex;align-items:center;gap:12px;cursor:pointer;user-select:none}
        .nr-toggle input[type=checkbox]{width:18px;height:18px;cursor:pointer;accent-color:#B8936D}
        .nr-toggle-label{font-size:14px;color:#2C2C2C;font-weight:500}

        /* Submit */
        .nr-footer{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
        .nr-save{
          padding:13px 28px;background:#B8936D;color:white;
          border:none;border-radius:9px;font-size:15px;font-weight:700;
          cursor:pointer;transition:background .15s;white-space:nowrap;
        }
        .nr-save:hover:not(:disabled){background:#a07d5a}
        .nr-save:disabled{opacity:.6;cursor:not-allowed}
        .nr-cancel{
          padding:13px 24px;background:#F5F5F0;color:#555;
          border-radius:9px;font-size:15px;font-weight:700;
          text-decoration:none;display:inline-block;
          transition:background .15s;white-space:nowrap;
        }
        .nr-cancel:hover{background:#e8e8e3}

        /* ── TABLET ── */
        @media(max-width:1023px){
          .nr-title{font-size:24px}
          .nr-card{padding:22px}
        }

        /* ── MOBILE ── */
        @media(max-width:639px){
          .nr-header{flex-direction:column;align-items:stretch;gap:10px;margin-bottom:16px}
          .nr-back{text-align:center}
          .nr-title{font-size:20px}
          .nr-card{padding:16px;border-radius:12px;margin-bottom:14px}
          .nr-card-title{font-size:15px}
          .nr-preview video{max-width:100%}
          .nr-footer{flex-direction:column;align-items:stretch}
          .nr-save,.nr-cancel{width:100%;text-align:center;padding:14px}
        }

        /* ── SMALL MOBILE ── */
        @media(max-width:380px){
          .nr-card{padding:14px}
          .nr-title{font-size:18px}
        }
      `}</style>

      <div className="nr">

        {/* Header */}
        <div className="nr-header">
          <div>
            <h1 className="nr-title">🎬 Upload New Reel</h1>
            <p className="nr-sub">Upload a video reel to your agency profile</p>
          </div>
          <Link href="/merchant/dashboard/reels" className="nr-back">← Back</Link>
        </div>

        {error && <div className="nr-error">❌ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="nr-card">
            <div className="nr-card-title">🎥 Reel Details</div>
            <hr className="nr-divider" />

            {/* Title */}
            <div className="nr-field">
              <label className="nr-label">Reel Title <span className="nr-req">*</span></label>
              <input type="text" required className="nr-input"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Our Pilgrims in Madinah 2024" />
            </div>

            {/* Video upload */}
            <div className="nr-field">
              <label className="nr-label">
                Video File <span className="nr-req">*</span>
                <span style={{ fontWeight: 400, color: '#aaa', marginLeft: 6 }}>(max 100MB)</span>
              </label>
              <input type="file" accept="video/*" required className="nr-input"
                onChange={handleVideoUpload} />
              <div className="nr-hint">Supported formats: MP4, MOV, WebM</div>

              {videoFile && (
                <div className="nr-video-info">
                  ✅ Selected: <strong>{videoFile.name}</strong> — {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </div>
              )}

              {videoPreview && (
                <div className="nr-preview">
                  <div className="nr-preview-label">Preview:</div>
                  <video src={videoPreview} controls />
                </div>
              )}
            </div>

            {/* Upload progress */}
            {uploadingVideo && (
              <div className="nr-progress-wrap">
                <div className="nr-progress-label">⏳ Uploading video... {uploadProgress}%</div>
                <div className="nr-progress-track">
                  <div className="nr-progress-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            {/* Publish toggle */}
            <div className="nr-field">
              <label className="nr-toggle">
                <input type="checkbox"
                  checked={formData.is_published}
                  onChange={e => setFormData({ ...formData, is_published: e.target.checked })} />
                <span className="nr-toggle-label">Publish immediately</span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="nr-footer">
            <button type="submit" disabled={isBusy} className="nr-save">
              {uploadingVideo
                ? `⏳ Uploading... ${uploadProgress}%`
                : loading ? '⏳ Saving...'
                : '🎬 Upload Reel'}
            </button>
            <Link href="/merchant/dashboard/reels" className="nr-cancel">Cancel</Link>
          </div>
        </form>
      </div>
    </>
  )
}