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

  const [formData, setFormData] = useState({
    title: '',
    is_published: true
  })

  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('video/')) {
      alert('Sila pilih file video sahaja')
      return
    }

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      alert('Saiz video terlalu besar. Maksimum 100MB')
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

    const { data, error } = await supabase.storage
      .from('reels-videos')
      .upload(fileName, videoFile)

    if (error) {
      console.error('Upload error:', error)
      setUploadingVideo(false)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('reels-videos')
      .getPublicUrl(fileName)

    setUploadingVideo(false)
    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!videoFile) {
      alert('Sila pilih video untuk upload')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: agency } = await supabase
        .from('agencies')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!agency) throw new Error('Agency not found')

      const videoUrl = await uploadVideo(agency.id)
      if (!videoUrl) throw new Error('Video upload failed')

      const { error: insertError } = await supabase
        .from('reels')
        .insert({
          agency_id: agency.id,
          title: formData.title,
          video_url: videoUrl,
          thumbnail_url: null, // No thumbnail needed
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
            Upload Reel Baru
          </h1>
          <p style={{ fontSize: '15px', color: '#666' }}>
            Upload video reel untuk profile agensi anda
          </p>
        </div>
        <Link
          href="/merchant/dashboard/reels"
          style={{
            padding: '12px 24px',
            backgroundColor: '#F5F5F0',
            color: '#2C2C2C',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none'
          }}
        >
          ← Kembali
        </Link>
      </div>

      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: '#FEE',
          border: '1px solid #FCC',
          borderRadius: '8px',
          marginBottom: '24px',
          color: '#C33',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #E5E5E0', marginBottom: '24px' }}>
          
          {/* Title */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
              Tajuk Reel *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Contoh: Jemaah Kami di Madinah 2024"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                border: '2px solid #E5E5E0',
                borderRadius: '10px',
                outline: 'none'
              }}
            />
          </div>

          {/* Video Upload */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
              Video * (Maksimum 100MB)
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoUpload}
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '14px',
                border: '2px solid #E5E5E0',
                borderRadius: '10px',
                outline: 'none',
                cursor: 'pointer'
              }}
            />
            {videoFile && (
              <div style={{ marginTop: '12px', fontSize: '14px', color: '#666' }}>
                ✅ Video dipilih: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
            )}
            {videoPreview && (
              <div style={{ marginTop: '16px' }}>
                <video 
                  src={videoPreview} 
                  controls
                  style={{ 
                    width: '100%', 
                    maxWidth: '400px',
                    borderRadius: '8px',
                    border: '2px solid #E5E5E0'
                  }} 
                />
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploadingVideo && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                Uploading video... {uploadProgress}%
              </div>
              <div style={{ 
                width: '100%', 
                height: '8px', 
                backgroundColor: '#F5F5F0', 
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${uploadProgress}%`, 
                  height: '100%', 
                  backgroundColor: '#B8936D',
                  transition: 'width 0.3s'
                }} />
              </div>
            </div>
          )}

          {/* Status */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '15px', color: '#2C2C2C' }}>
                Publish segera
              </span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            type="submit"
            disabled={loading || uploadingVideo}
            style={{
              padding: '16px 32px',
              backgroundColor: '#B8936D',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              opacity: (loading || uploadingVideo) ? 0.7 : 1
            }}
          >
            {uploadingVideo ? `Uploading... ${uploadProgress}%` : loading ? 'Menyimpan...' : 'Upload Reel'}
          </button>

          <Link
            href="/merchant/dashboard/reels"
            style={{
              padding: '16px 32px',
              backgroundColor: '#F5F5F0',
              color: '#2C2C2C',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '700',
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  )
}