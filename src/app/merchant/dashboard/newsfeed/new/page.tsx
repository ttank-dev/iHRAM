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

    const fileArray = Array.from(files).slice(0, 5) // Max 5 images
    setImageFiles(fileArray)
  }

  const removeImage = (indexToRemove: number) => {
    setImageFiles(imageFiles.filter((_, index) => index !== indexToRemove))
  }

  const uploadImages = async (agencyId: string) => {
    if (imageFiles.length === 0) return []

    setUploading(true)
    const uploadedUrls: string[] = []

    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${agencyId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('news-feed-images')
        .upload(fileName, file)

      if (error) {
        console.error('Upload error:', error)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('news-feed-images')
        .getPublicUrl(fileName)

      uploadedUrls.push(publicUrl)
    }

    setUploading(false)
    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

      const imageUrls = await uploadImages(agency.id)

      const { error: insertError } = await supabase
        .from('news_feed')
        .insert({
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
            Tambah News Feed
          </h1>
          <p style={{ fontSize: '15px', color: '#666' }}>
            Cipta post baru untuk news feed anda
          </p>
        </div>
        <Link
          href="/merchant/dashboard/newsfeed"
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
          
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
              Tajuk Post *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Contoh: Pakej Umrah Bulan Mac Kini Dibuka!"
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

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
              Kandungan *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Tulis kandungan post anda di sini..."
              required
              rows={10}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                border: '2px solid #E5E5E0',
                borderRadius: '10px',
                outline: 'none',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
              Gambar (maksimum 5)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
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
            <p style={{ fontSize: '13px', color: '#999', marginTop: '6px' }}>
              {imageFiles.length > 0 
                ? `✅ ${imageFiles.length} gambar dipilih (maksimum 5)` 
                : '📸 Pilih gambar (Ctrl/Cmd + klik untuk pilih banyak)'}
            </p>

            {imageFiles.length > 0 && (
              <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                {imageFiles.map((file, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`Preview ${index + 1}`}
                      style={{ 
                        width: '100%', 
                        height: '120px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        border: '2px solid #E5E5E0'
                      }} 
                    />
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px',
                      backgroundColor: '#B8936D',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        backgroundColor: '#F44',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

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

        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            type="submit"
            disabled={loading || uploading}
            style={{
              padding: '16px 32px',
              backgroundColor: '#B8936D',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              opacity: (loading || uploading) ? 0.7 : 1
            }}
          >
            {uploading ? 'Uploading...' : loading ? 'Menyimpan...' : 'Simpan Post'}
          </button>

          <Link
            href="/merchant/dashboard/newsfeed"
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