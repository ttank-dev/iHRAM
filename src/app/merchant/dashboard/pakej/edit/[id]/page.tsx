'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function EditPackagePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    package_type: 'ekonomi',
    price_quad: '',
    price_triple: '',
    price_double: '',
    price_child: '',
    price_infant: '',
    departure_dates: '',
    duration_nights: '',
    departure_city: '',
    visa_type: '',
    itinerary: '',
    inclusions: '',
    exclusions: '',
    quota: '',
    status: 'draft'
  })

  const [existingPhotos, setExistingPhotos] = useState<string[]>([])
  const [newPhotos, setNewPhotos] = useState<File[]>([])

  useEffect(() => {
    loadPackage()
  }, [])

  const loadPackage = async () => {
    try {
      const { data: pkg, error } = await supabase
        .from('packages')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error
      if (!pkg) throw new Error('Package not found')

      // Populate form
      setFormData({
        title: pkg.title || '',
        description: pkg.description || '',
        package_type: pkg.package_type || 'ekonomi',
        price_quad: pkg.price_quad?.toString() || '',
        price_triple: pkg.price_triple?.toString() || '',
        price_double: pkg.price_double?.toString() || '',
        price_child: pkg.price_child?.toString() || '',
        price_infant: pkg.price_infant?.toString() || '',
        departure_dates: pkg.departure_dates?.join(', ') || '',
        duration_nights: pkg.duration_nights?.toString() || '',
        departure_city: pkg.departure_city || '',
        visa_type: pkg.visa_type || '',
        itinerary: pkg.itinerary || '',
        inclusions: pkg.inclusions?.join('\n') || '',
        exclusions: pkg.exclusions?.join('\n') || '',
        quota: pkg.quota?.toString() || '',
        status: pkg.status || 'draft'
      })

      setExistingPhotos(pkg.photos || [])
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const fileArray = Array.from(files).slice(0, 10 - existingPhotos.length)
    setNewPhotos(fileArray)
  }

  const removeExistingPhoto = (url: string) => {
    setExistingPhotos(existingPhotos.filter(p => p !== url))
  }

  const uploadImages = async (agencyId: string) => {
    if (newPhotos.length === 0) return []

    setUploading(true)
    const uploadedUrls: string[] = []

    for (const photo of newPhotos) {
      const fileExt = photo.name.split('.').pop()
      const fileName = `${agencyId}/${Date.now()}-${Math.random()}.${fileExt}`

      const { data, error } = await supabase.storage
        .from('package-images')
        .upload(fileName, photo)

      if (error) {
        console.error('Upload error:', error)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('package-images')
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

      // Upload new images
      const newPhotoUrls = await uploadImages(agency.id)
      const allPhotos = [...existingPhotos, ...newPhotoUrls]

      // Generate slug
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      // Parse arrays
      const departureDatesArray = formData.departure_dates
        .split(',')
        .map(d => d.trim())
        .filter(Boolean)

      const inclusionsArray = formData.inclusions
        .split('\n')
        .map(i => i.trim())
        .filter(Boolean)

      const exclusionsArray = formData.exclusions
        .split('\n')
        .map(e => e.trim())
        .filter(Boolean)

      // Update package
      const { error: updateError } = await supabase
        .from('packages')
        .update({
          title: formData.title,
          slug: slug,
          description: formData.description,
          package_type: formData.package_type,
          price_quad: parseFloat(formData.price_quad) || null,
          price_triple: parseFloat(formData.price_triple) || null,
          price_double: parseFloat(formData.price_double) || null,
          price_child: parseFloat(formData.price_child) || null,
          price_infant: parseFloat(formData.price_infant) || null,
          departure_dates: departureDatesArray,
          duration_nights: parseInt(formData.duration_nights) || null,
          departure_city: formData.departure_city,
          visa_type: formData.visa_type,
          itinerary: formData.itinerary,
          inclusions: inclusionsArray,
          exclusions: exclusionsArray,
          photos: allPhotos,
          quota: parseInt(formData.quota) || null,
          status: formData.status
        })
        .eq('id', params.id)

      if (updateError) throw updateError

      router.push('/merchant/dashboard/pakej')
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <div style={{ fontSize: '16px', color: '#666' }}>Loading package...</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
            Edit Pakej
          </h1>
          <p style={{ fontSize: '15px', color: '#666' }}>
            Kemaskini maklumat pakej umrah anda
          </p>
        </div>
        <Link
          href="/merchant/dashboard/pakej"
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
        {/* Same form fields as New Package - I'll provide abbreviated version */}
        
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #E5E5E0', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
            Maklumat Asas
          </h3>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
              Nama Pakej *
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
              Penerangan
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={5}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
                Jenis Pakej *
              </label>
              <select
                value={formData.package_type}
                onChange={(e) => setFormData({...formData, package_type: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  border: '2px solid #E5E5E0',
                  borderRadius: '10px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                <option value="ekonomi">Ekonomi</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
                <option value="vip">VIP</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '15px',
                  border: '2px solid #E5E5E0',
                  borderRadius: '10px',
                  outline: 'none',
                  backgroundColor: 'white'
                }}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing - Same as New */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #E5E5E0', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
            Harga
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
                Quad Sharing (RM) *
              </label>
              <input
                type="number"
                value={formData.price_quad}
                onChange={(e) => setFormData({...formData, price_quad: e.target.value})}
                required
                step="0.01"
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

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
                Triple Sharing (RM)
              </label>
              <input
                type="number"
                value={formData.price_triple}
                onChange={(e) => setFormData({...formData, price_triple: e.target.value})}
                step="0.01"
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

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
                Double Sharing (RM)
              </label>
              <input
                type="number"
                value={formData.price_double}
                onChange={(e) => setFormData({...formData, price_double: e.target.value})}
                step="0.01"
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

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
                Tempoh (Malam) *
              </label>
              <input
                type="number"
                value={formData.duration_nights}
                onChange={(e) => setFormData({...formData, duration_nights: e.target.value})}
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
          </div>
        </div>

        {/* Existing Photos */}
        {existingPhotos.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #E5E5E0', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
              Gambar Sedia Ada
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
              {existingPhotos.map((url, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img src={url} alt={`Photo ${index + 1}`} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }} />
                  <button
                    type="button"
                    onClick={() => removeExistingPhoto(url)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      padding: '4px 8px',
                      backgroundColor: '#F44',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
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

        {/* New Photos Upload */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #E5E5E0', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
            Tambah Gambar Baru
          </h3>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: '15px',
              border: '2px solid #E5E5E0',
              borderRadius: '10px',
              outline: 'none'
            }}
          />
          <p style={{ fontSize: '13px', color: '#999', marginTop: '6px' }}>
            {newPhotos.length > 0 ? `${newPhotos.length} gambar baru dipilih` : 'Tiada gambar baru'}
          </p>
        </div>

        {/* Submit */}
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
            {uploading ? 'Uploading...' : saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>

          <Link
            href="/merchant/dashboard/pakej"
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