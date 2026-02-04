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
    params.then(p => {
      setId(p.id)
      loadPost(p.id)
    })
  }, [])

  const loadPost = async (postId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/merchant/login')
      return
    }

    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!agency) return

    const { data: post, error } = await supabase
      .from('news_feed')
      .select('*')
      .eq('id', postId)
      .eq('agency_id', agency.id)
      .single()

    if (error || !post) {
      alert('Post tidak dijumpai')
      router.push('/merchant/dashboard/newsfeed')
      return
    }

    setFormData({
      title: post.title,
      content: post.content,
      is_published: post.is_published
    })

    setExistingImages(post.images || [])
    setLoading(false)
  }

  const handleNewImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const totalImages = existingImages.length + newImageFiles.length + files.length
    if (totalImages > 5) {
      alert(`Maksimum 5 gambar. Anda sudah ada ${existingImages.length + newImageFiles.length} gambar.`)
      return
    }

    const fileArray = Array.from(files)
    setNewImageFiles([...newImageFiles, ...fileArray])
  }

  const removeExistingImage = (indexToRemove: number) => {
    setExistingImages(existingImages.filter((_, index) => index !== indexToRemove))
  }

  const removeNewImage = (indexToRemove: number) => {
    setNewImageFiles(newImageFiles.filter((_, index) => index !== indexToRemove))
  }

  const uploadNewImages = async (agencyId: string) => {
    if (newImageFiles.length === 0) return []

    setUploading(true)
    const uploadedUrls: string[] = []

    for (const file of newImageFiles) {
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
    setSaving(true)
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

      const newImageUrls = await uploadNewImages(agency.id)
      const allImages = [...existingImages, ...newImageUrls]

      const { error: updateError } = await supabase
        .from('news_feed')
        .update({
          title: formData.title,
          content: formData.content,
          images: allImages.length > 0 ? allImages : null,
          is_published: formData.is_published
        })
        .eq('id', id)

      if (updateError) throw updateError

      router.push('/merchant/dashboard/newsfeed')
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <div style={{ fontSize: '16px', color: '#666' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
            Edit News Feed
          </h1>
          <p style={{ fontSize: '15px', color: '#666' }}>
            Kemaskini post news feed anda
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

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
                Gambar Sedia Ada
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                {existingImages.map((image, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img 
                      src={image} 
                      alt={`Existing ${index + 1}`}
                      style={{ 
                        width: '100%', 
                        height: '120px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        border: '2px solid #E5E5E0'
                      }} 
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
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
            </div>
          )}

          {/* New Images */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
              Tambah Gambar Baru {existingImages.length + newImageFiles.length < 5 && `(boleh tambah ${5 - existingImages.length - newImageFiles.length} lagi)`}
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleNewImageUpload}
              disabled={existingImages.length + newImageFiles.length >= 5}
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '14px',
                border: '2px solid #E5E5E0',
                borderRadius: '10px',
                outline: 'none',
                cursor: existingImages.length + newImageFiles.length >= 5 ? 'not-allowed' : 'pointer',
                opacity: existingImages.length + newImageFiles.length >= 5 ? 0.5 : 1
              }}
            />
            <p style={{ fontSize: '13px', color: '#999', marginTop: '6px' }}>
              Jumlah gambar: {existingImages.length + newImageFiles.length} / 5
            </p>

            {newImageFiles.length > 0 && (
              <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                {newImageFiles.map((file, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img 
                      src={URL.createObjectURL(file)} 
                      alt={`New ${index + 1}`}
                      style={{ 
                        width: '100%', 
                        height: '120px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        border: '2px solid #B8936D'
                      }} 
                    />
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      left: '4px',
                      backgroundColor: '#B8936D',
                      color: 'white',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      NEW
                    </div>
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
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
                Publish post ini
              </span>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            type="submit"
            disabled={saving || uploading}
            style={{
              padding: '16px 32px',
              backgroundColor: '#B8936D',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              opacity: (saving || uploading) ? 0.7 : 1
            }}
          >
            {uploading ? 'Uploading...' : saving ? 'Menyimpan...' : 'Kemaskini Post'}
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