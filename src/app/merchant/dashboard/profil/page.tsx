'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfilAgensiPage() {
  const [formData, setFormData] = useState({
    name: '',
    about: '',
    phone: '',
    email: '',
    website: '',
    instagram: '',
    facebook: '',
    ssm_number: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [currentLogo, setCurrentLogo] = useState<string | null>(null)
  const [currentCover, setCurrentCover] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: agency } = await supabase
      .from('agencies')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (agency) {
      setFormData({
        name: agency.name || '',
        about: agency.about || '',
        phone: agency.phone || '',
        email: agency.email || '',
        website: agency.website || '',
        instagram: agency.instagram || '',
        facebook: agency.facebook || '',
        ssm_number: agency.ssm_number || ''
      })
      setCurrentLogo(agency.logo_url)
      setCurrentCover(agency.cover_url)
    }

    setLoading(false)
  }

  const uploadImage = async (file: File, type: 'logo' | 'cover') => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!agency) return null

    const fileExt = file.name.split('.').pop()
    const fileName = `${agency.id}/${type}-${Date.now()}.${fileExt}`

    const { data, error } = await supabase.storage
      .from('agency-images')
      .upload(fileName, file)

    if (error) {
      console.error('Upload error:', error)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('agency-images')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    const url = await uploadImage(file, 'logo')
    
    if (url) {
      setCurrentLogo(url)
      setLogoFile(file)
    }
    
    setUploadingLogo(false)
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingCover(true)
    const url = await uploadImage(file, 'cover')
    
    if (url) {
      setCurrentCover(url)
      setCoverFile(file)
    }
    
    setUploadingCover(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const updateData: any = {
      ...formData
    }

    if (currentLogo) updateData.logo_url = currentLogo
    if (currentCover) updateData.cover_url = currentCover

    const { error } = await supabase
      .from('agencies')
      .update(updateData)
      .eq('user_id', user.id)

    if (error) {
      setMessage('❌ Gagal menyimpan: ' + error.message)
    } else {
      setMessage('✅ Profil berjaya dikemaskini!')
      setTimeout(() => setMessage(''), 3000)
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <div style={{ fontSize: '16px', color: '#666' }}>Loading profile...</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
          Profil Agensi
        </h1>
        <p style={{ fontSize: '15px', color: '#666' }}>
          Kemaskini maklumat agensi anda
        </p>
      </div>

      {message && (
        <div style={{
          padding: '16px',
          backgroundColor: message.includes('✅') ? '#E8F5E9' : '#FEE',
          border: message.includes('✅') ? '1px solid #C8E6C9' : '1px solid #FCC',
          borderRadius: '8px',
          marginBottom: '24px',
          color: message.includes('✅') ? '#2E7D32' : '#C33',
          fontSize: '15px'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave}>
        
        {/* Logo & Cover */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #E5E5E0', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
            Logo & Cover Photo
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Logo */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '12px' }}>
                Logo Agensi
              </label>
              {currentLogo && (
                <div style={{ marginBottom: '12px' }}>
                  <img 
                    src={currentLogo} 
                    alt="Logo" 
                    style={{ 
                      width: '150px', 
                      height: '150px', 
                      objectFit: 'cover', 
                      borderRadius: '12px',
                      border: '2px solid #E5E5E0'
                    }} 
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
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
              {uploadingLogo && (
                <p style={{ fontSize: '13px', color: '#B8936D', marginTop: '8px' }}>
                  ⏳ Uploading logo...
                </p>
              )}
            </div>

            {/* Cover */}
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '12px' }}>
                Cover Photo
              </label>
              {currentCover && (
                <div style={{ marginBottom: '12px' }}>
                  <img 
                    src={currentCover} 
                    alt="Cover" 
                    style={{ 
                      width: '100%', 
                      height: '150px', 
                      objectFit: 'cover', 
                      borderRadius: '12px',
                      border: '2px solid #E5E5E0'
                    }} 
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                disabled={uploadingCover}
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
              {uploadingCover && (
                <p style={{ fontSize: '13px', color: '#B8936D', marginTop: '8px' }}>
                  ⏳ Uploading cover...
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #E5E5E0', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
            Maklumat Asas
          </h3>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
              Nama Agensi *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
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
              Tentang Agensi
            </label>
            <textarea
              value={formData.about}
              onChange={(e) => setFormData({...formData, about: e.target.value})}
              rows={5}
              placeholder="Ceritakan tentang agensi anda..."
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
            <p style={{ fontSize: '13px', color: '#999', marginTop: '6px' }}>
              {formData.about.length}/500 aksara
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
              No. SSM
            </label>
            <input
              type="text"
              value={formData.ssm_number}
              onChange={(e) => setFormData({...formData, ssm_number: e.target.value})}
              placeholder="Contoh: 202301234567"
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

        {/* Contact Info */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #E5E5E0', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
            Maklumat Hubungan
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
                No. Telefon *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                required
                placeholder="Contoh: 0123456789"
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
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="email@agensi.com"
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

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              placeholder="https://www.agensi.com"
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
                Instagram
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                placeholder="@username"
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
                Facebook
              </label>
              <input
                type="text"
                value={formData.facebook}
                onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                placeholder="facebook.com/agensi"
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

        {/* Submit */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            type="submit"
            disabled={saving || uploadingLogo || uploadingCover}
            style={{
              padding: '16px 32px',
              backgroundColor: '#B8936D',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: 'pointer',
              opacity: (saving || uploadingLogo || uploadingCover) ? 0.7 : 1
            }}
          >
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  )
}