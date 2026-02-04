'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewPackagePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
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

  const [photos, setPhotos] = useState<File[]>([])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files
  if (!files || files.length === 0) return

  // Convert FileList to Array and take max 10
  const fileArray = Array.from(files).slice(0, 10)
  
  console.log(`Selected ${fileArray.length} images`) // Debug
  setPhotos(fileArray)
}

const removePhoto = (indexToRemove: number) => {
  setPhotos(photos.filter((_, index) => index !== indexToRemove))
}

  const uploadImages = async (agencyId: string) => {
    if (photos.length === 0) return []

    setUploading(true)
    const uploadedUrls: string[] = []

    for (const photo of photos) {
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
    setLoading(true)
    setError('')

    try {
      // Get current user and agency
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: agency } = await supabase
        .from('agencies')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!agency) throw new Error('Agency not found')

      // Upload images
      const photoUrls = await uploadImages(agency.id)

      // Generate slug
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')

      // Parse departure dates (comma separated)
      const departureDatesArray = formData.departure_dates
        .split(',')
        .map(d => d.trim())
        .filter(Boolean)

      // Parse inclusions and exclusions (line by line)
      const inclusionsArray = formData.inclusions
        .split('\n')
        .map(i => i.trim())
        .filter(Boolean)

      const exclusionsArray = formData.exclusions
        .split('\n')
        .map(e => e.trim())
        .filter(Boolean)

      // Insert package
      const { error: insertError } = await supabase
        .from('packages')
        .insert({
          agency_id: agency.id,
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
          photos: photoUrls,
          quota: parseInt(formData.quota) || null,
          status: formData.status
        })

      if (insertError) throw insertError

      router.push('/merchant/dashboard/pakej')
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
            Tambah Pakej Baru
          </h1>
          <p style={{ fontSize: '15px', color: '#666' }}>
            Isi maklumat pakej umrah anda
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
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #E5E5E0', marginBottom: '24px' }}>
          
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
            Maklumat Asas
          </h3>

          {/* Title */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
              Nama Pakej *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Contoh: Pakej Umrah Ekonomi 10 Hari"
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

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
              Penerangan
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Terangkan pakej anda..."
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

          {/* Package Type */}
          <div style={{ marginBottom: '24px' }}>
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

          {/* Status */}
          <div style={{ marginBottom: '24px' }}>
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
            </select>
          </div>
        </div>

        {/* Pricing */}
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
                placeholder="8000"
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
                placeholder="9000"
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
                placeholder="10000"
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
                Kanak-kanak (RM)
              </label>
              <input
                type="number"
                value={formData.price_child}
                onChange={(e) => setFormData({...formData, price_child: e.target.value})}
                placeholder="6000"
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
                Bayi (RM)
              </label>
              <input
                type="number"
                value={formData.price_infant}
                onChange={(e) => setFormData({...formData, price_infant: e.target.value})}
                placeholder="2000"
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
          </div>
        </div>

        {/* Travel Details */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #E5E5E0', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
            Maklumat Perjalanan
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
                Tempoh (Malam) *
              </label>
              <input
                type="number"
                value={formData.duration_nights}
                onChange={(e) => setFormData({...formData, duration_nights: e.target.value})}
                placeholder="9"
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

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
                Bandar Berlepas
              </label>
              <input
                type="text"
                value={formData.departure_city}
                onChange={(e) => setFormData({...formData, departure_city: e.target.value})}
                placeholder="Kuala Lumpur"
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
                Jenis Visa
              </label>
              <input
                type="text"
                value={formData.visa_type}
                onChange={(e) => setFormData({...formData, visa_type: e.target.value})}
                placeholder="Visa Umrah"
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
                Kuota
              </label>
              <input
                type="number"
                value={formData.quota}
                onChange={(e) => setFormData({...formData, quota: e.target.value})}
                placeholder="40"
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

          {/* Departure Dates */}
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
              Tarikh Berlepas (pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={formData.departure_dates}
              onChange={(e) => setFormData({...formData, departure_dates: e.target.value})}
              placeholder="15 Mac 2024, 20 April 2024, 10 Mei 2024"
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
              Contoh: 15 Mac 2024, 20 April 2024
            </p>
          </div>
        </div>

        {/* Itinerary */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #E5E5E0', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
            Itinerari
          </h3>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
              Jadual Perjalanan
            </label>
            <textarea
              value={formData.itinerary}
              onChange={(e) => setFormData({...formData, itinerary: e.target.value})}
              placeholder="Hari 1: Berlepas dari KLIA..."
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
        </div>

        {/* Inclusions & Exclusions */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #E5E5E0', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
            Termasuk & Tidak Termasuk
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
                Termasuk (satu baris satu item)
              </label>
              <textarea
                value={formData.inclusions}
                onChange={(e) => setFormData({...formData, inclusions: e.target.value})}
                placeholder="Tiket pesawat pergi balik&#10;Hotel 4 bintang&#10;Pengangkutan"
                rows={8}
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

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
                Tidak Termasuk (satu baris satu item)
              </label>
              <textarea
                value={formData.exclusions}
                onChange={(e) => setFormData({...formData, exclusions: e.target.value})}
                placeholder="Makanan tambahan&#10;Belanja peribadi&#10;Insurans perjalanan"
                rows={8}
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
          </div>
        </div>

        {/* Images */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #E5E5E0', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
            Gambar Pakej
          </h3>

          <div>
    <label 
      htmlFor="image-upload"
      style={{ 
        display: 'block', 
        fontSize: '14px', 
        fontWeight: '600', 
        color: '#2C2C2C', 
        marginBottom: '8px' 
      }}
    >
      Upload Gambar (maksimum 10)
    </label>
    <input
      id="image-upload"
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/webp"
      multiple
      onChange={handleImageUpload}
      style={{
        width: '100%',
        padding: '14px 16px',
        fontSize: '15px',
        border: '2px solid #E5E5E0',
        borderRadius: '10px',
        outline: 'none',
        cursor: 'pointer'
      }}
    />
    <p style={{ fontSize: '13px', color: '#999', marginTop: '6px' }}>
      {photos.length > 0 
        ? `✅ ${photos.length} gambar dipilih (maksimum 10)` 
        : '📸 Pilih gambar (Ctrl/Cmd + klik untuk pilih banyak)'}
    </p>
  </div>

          {/* Image Preview */}
          {photos.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '12px' }}>
                Preview Gambar:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                {photos.map((photo, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img 
                      src={URL.createObjectURL(photo)} 
                      alt={`Preview ${index + 1}`}
                      style={{ 
                        width: '100%', 
                        height: '120px', 
                        objectFit: 'cover', 
                        borderRadius: '8px',
                        border: '2px solid #E5E5E0'
                      }} 
                    />
                    
                    {/* Image Number Badge */}
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

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
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
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                      title="Padam gambar"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>

        {/* Submit */}
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
            {uploading ? 'Uploading gambar...' : loading ? 'Menyimpan...' : 'Simpan Pakej'}
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