'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ProfilAgensiPage() {
  const [formData, setFormData] = useState({
    name: '', about: '', phone: '', email: '',
    website: '', instagram: '', facebook: '', ssm_number: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [removingLogo, setRemovingLogo] = useState(false)
  const [removingCover, setRemovingCover] = useState(false)
  const [currentLogo, setCurrentLogo] = useState<string | null>(null)
  const [currentCover, setCurrentCover] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => { loadProfile() }, [])

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: agency } = await supabase.from('agencies').select('*').eq('user_id', user.id).single()
    if (agency) {
      setFormData({
        name: agency.name || '', about: agency.about || '',
        phone: agency.phone || '', email: agency.email || '',
        website: agency.website || '', instagram: agency.instagram || '',
        facebook: agency.facebook || '', ssm_number: agency.ssm_number || ''
      })
      setCurrentLogo(agency.logo_url)
      setCurrentCover(agency.cover_url)
    }
    setLoading(false)
  }

  const uploadImage = async (file: File, type: 'logo' | 'cover') => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: agency } = await supabase.from('agencies').select('id').eq('user_id', user.id).single()
    if (!agency) return null
    const fileExt = file.name.split('.').pop()
    const fileName = `${agency.id}/${type}-${Date.now()}.${fileExt}`
    const { error } = await supabase.storage.from('agency-images').upload(fileName, file)
    if (error) { console.error('Upload error:', error); return null }
    const { data: { publicUrl } } = supabase.storage.from('agency-images').getPublicUrl(fileName)
    return publicUrl
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingLogo(true)
    const url = await uploadImage(file, 'logo')
    if (url) setCurrentLogo(url)
    setUploadingLogo(false)
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCover(true)
    const url = await uploadImage(file, 'cover')
    if (url) setCurrentCover(url)
    setUploadingCover(false)
  }

  const handleRemoveLogo = async () => {
    if (!confirm('Remove agency logo?')) return
    setRemovingLogo(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('agencies').update({ logo_url: null }).eq('user_id', user.id)
    setCurrentLogo(null)
    setRemovingLogo(false)
  }

  const handleRemoveCover = async () => {
    if (!confirm('Remove cover photo?')) return
    setRemovingCover(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) await supabase.from('agencies').update({ cover_url: null }).eq('user_id', user.id)
    setCurrentCover(null)
    setRemovingCover(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const updateData: any = { ...formData }
    if (currentLogo) updateData.logo_url = currentLogo
    if (currentCover) updateData.cover_url = currentCover
    const { error } = await supabase.from('agencies').update(updateData).eq('user_id', user.id)
    if (error) {
      setMessage('❌ Failed to save: ' + error.message)
    } else {
      setMessage('✅ Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    }
    setSaving(false)
  }

  const set = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }))
  const isBusy = saving || uploadingLogo || uploadingCover || removingLogo || removingCover

  if (loading) return (
    <>
      <div className="pp-load"><div className="pp-spin" /><p>Loading profile...</p></div>
      <style>{`.pp-load{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;gap:16px;color:#999}.pp-spin{width:36px;height:36px;border:3px solid #e5e5e5;border-top-color:#B8936D;border-radius:50%;animation:pps .7s linear infinite}@keyframes pps{to{transform:rotate(360deg)}}`}</style>
    </>
  )

  return (
    <>
      <style>{`
        .pp,.pp *{box-sizing:border-box}
        .pp{max-width:900px;width:100%;overflow:hidden}

        /* Header */
        .pp-header{margin-bottom:24px}
        .pp-title{font-size:28px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .pp-sub{font-size:14px;color:#888;margin:0}

        /* Alert */
        .pp-alert{padding:14px 16px;border-radius:8px;margin-bottom:20px;font-size:14px;font-weight:600}
        .pp-alert-ok{background:#ECFDF5;border:1px solid #A7F3D0;color:#065F46}
        .pp-alert-err{background:#FEE2E2;border:1px solid #FCA5A5;color:#991B1B}

        /* Cards */
        .pp-card{background:white;border-radius:14px;padding:28px;border:1px solid #E5E5E0;margin-bottom:20px}
        .pp-card-title{font-size:17px;font-weight:700;color:#2C2C2C;margin:0 0 20px;padding-bottom:14px;border-bottom:1px solid #f0f0ec}

        /* Image grid */
        .pp-img-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
        .pp-img-preview{
          width:100%;height:140px;object-fit:cover;
          border-radius:10px;border:2px solid #E5E5E0;margin-bottom:10px;display:block;
        }
        .pp-logo-preview{
          width:120px;height:120px;object-fit:cover;
          border-radius:10px;border:2px solid #E5E5E0;margin-bottom:10px;display:block;
        }
        .pp-upload-hint{font-size:12px;color:#B8936D;margin-top:6px;font-weight:500}
        .pp-img-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:6px}
        .pp-remove-btn{padding:6px 12px;background:#FEE2E2;color:#DC2626;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;transition:background .15s}
        .pp-remove-btn:hover:not(:disabled){background:#FECACA}
        .pp-remove-btn:disabled{opacity:.5;cursor:not-allowed}

        /* Form */
        .pp-field{margin-bottom:20px}
        .pp-field:last-child{margin-bottom:0}
        .pp-label{display:block;font-size:13px;font-weight:600;color:#555;margin-bottom:6px}
        .pp-input,.pp-textarea{
          width:100%;padding:12px 14px;font-size:14px;
          border:2px solid #E5E5E0;border-radius:10px;
          outline:none;transition:border-color .15s;font-family:inherit;
          color:#2C2C2C;background:white;
        }
        .pp-input:focus,.pp-textarea:focus{border-color:#B8936D}
        .pp-input[type=file]{padding:10px 12px;cursor:pointer;font-size:13px}
        .pp-input[type=file]:disabled{opacity:.5;cursor:not-allowed}
        .pp-textarea{resize:vertical;min-height:110px}
        .pp-char{font-size:12px;color:#aaa;margin-top:4px;text-align:right}

        /* 2-col grid */
        .pp-2col{display:grid;grid-template-columns:1fr 1fr;gap:20px}

        /* Submit */
        .pp-footer{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
        .pp-save-btn{
          padding:14px 32px;background:#B8936D;color:white;
          border:none;border-radius:10px;font-size:15px;font-weight:700;
          cursor:pointer;transition:background .15s;white-space:nowrap;
        }
        .pp-save-btn:hover:not(:disabled){background:#a07d5a}
        .pp-save-btn:disabled{opacity:.6;cursor:not-allowed}
        .pp-busy-note{font-size:13px;color:#B8936D;font-weight:500}

        /* ── TABLET ── */
        @media(max-width:1023px){
          .pp-title{font-size:24px}
          .pp-card{padding:22px}
        }

        /* ── MOBILE ── */
        @media(max-width:639px){
          .pp-title{font-size:20px}
          .pp-sub{font-size:13px}
          .pp-card{padding:16px;border-radius:12px;margin-bottom:14px}
          .pp-card-title{font-size:15px;margin-bottom:16px;padding-bottom:12px}

          /* Stack image grid on mobile */
          .pp-img-grid{grid-template-columns:1fr;gap:16px}
          .pp-logo-preview{width:100px;height:100px}
          .pp-img-preview{height:120px}

          /* Stack 2-col on mobile */
          .pp-2col{grid-template-columns:1fr;gap:0}
          .pp-2col .pp-field{margin-bottom:16px}

          .pp-input,.pp-textarea{padding:11px 12px;font-size:14px}
          .pp-field{margin-bottom:16px}

          .pp-save-btn{width:100%;padding:14px;font-size:15px}
          .pp-footer{flex-direction:column;align-items:stretch}
        }

        /* ── SMALL MOBILE ── */
        @media(max-width:380px){
          .pp-card{padding:14px}
          .pp-title{font-size:18px}
        }
      `}</style>

      <div className="pp">

        {/* Header */}
        <div className="pp-header">
          <h1 className="pp-title">Agency Profile</h1>
          <p className="pp-sub">Update your agency information</p>
        </div>

        {/* Alert */}
        {message && (
          <div className={`pp-alert ${message.includes('✅') ? 'pp-alert-ok' : 'pp-alert-err'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSave}>

          {/* ── Logo & Cover ── */}
          <div className="pp-card">
            <h3 className="pp-card-title">🖼️ Logo & Cover Photo</h3>
            <div className="pp-img-grid">

              <div className="pp-field">
                <label className="pp-label">Agency Logo</label>
                {currentLogo && <img src={currentLogo} alt="Logo" className="pp-logo-preview" />}
                {currentLogo && (
                  <div className="pp-img-actions">
                    <button type="button" className="pp-remove-btn"
                      onClick={handleRemoveLogo} disabled={removingLogo}>
                      {removingLogo ? '⏳ Removing...' : '🗑 Remove Logo'}
                    </button>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleLogoUpload}
                  disabled={uploadingLogo} className="pp-input" style={{ marginTop: currentLogo ? '8px' : '0' }} />
                {uploadingLogo && <p className="pp-upload-hint">⏳ Uploading logo...</p>}
              </div>

              <div className="pp-field">
                <label className="pp-label">Cover Photo</label>
                {currentCover && <img src={currentCover} alt="Cover" className="pp-img-preview" />}
                {currentCover && (
                  <div className="pp-img-actions">
                    <button type="button" className="pp-remove-btn"
                      onClick={handleRemoveCover} disabled={removingCover}>
                      {removingCover ? '⏳ Removing...' : '🗑 Remove Cover'}
                    </button>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleCoverUpload}
                  disabled={uploadingCover} className="pp-input" style={{ marginTop: currentCover ? '8px' : '0' }} />
                {uploadingCover && <p className="pp-upload-hint">⏳ Uploading cover...</p>}
              </div>

            </div>
          </div>

          {/* ── Basic Info ── */}
          <div className="pp-card">
            <h3 className="pp-card-title">📋 Basic Information</h3>

            <div className="pp-field">
              <label className="pp-label">Agency Name *</label>
              <input type="text" className="pp-input" required
                value={formData.name} onChange={e => set('name', e.target.value)} />
            </div>

            <div className="pp-field">
              <label className="pp-label">About Agency</label>
              <textarea className="pp-textarea"
                value={formData.about} onChange={e => set('about', e.target.value)}
                placeholder="Tell pilgrims about your agency..." />
              <div className="pp-char">{formData.about.length}/500 characters</div>
            </div>

            <div className="pp-field" style={{ marginBottom: 0 }}>
              <label className="pp-label">SSM No.</label>
              <input type="text" className="pp-input"
                value={formData.ssm_number} onChange={e => set('ssm_number', e.target.value)}
                placeholder="e.g. 202301234567" />
            </div>
          </div>

          {/* ── Contact Info ── */}
          <div className="pp-card">
            <h3 className="pp-card-title">📞 Contact Information</h3>

            <div className="pp-2col">
              <div className="pp-field">
                <label className="pp-label">Phone Number *</label>
                <input type="tel" className="pp-input" required
                  value={formData.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="e.g. 0123456789" />
              </div>
              <div className="pp-field">
                <label className="pp-label">Email</label>
                <input type="email" className="pp-input"
                  value={formData.email} onChange={e => set('email', e.target.value)}
                  placeholder="email@agency.com" />
              </div>
            </div>

            <div className="pp-field">
              <label className="pp-label">Website</label>
              <input type="url" className="pp-input"
                value={formData.website} onChange={e => set('website', e.target.value)}
                placeholder="https://www.agency.com" />
            </div>

            <div className="pp-2col">
              <div className="pp-field">
                <label className="pp-label">Instagram</label>
                <input type="text" className="pp-input"
                  value={formData.instagram} onChange={e => set('instagram', e.target.value)}
                  placeholder="@username" />
              </div>
              <div className="pp-field" style={{ marginBottom: 0 }}>
                <label className="pp-label">Facebook</label>
                <input type="text" className="pp-input"
                  value={formData.facebook} onChange={e => set('facebook', e.target.value)}
                  placeholder="facebook.com/agency" />
              </div>
            </div>
          </div>

          {/* ── Submit ── */}
          <div className="pp-footer">
            <button type="submit" disabled={isBusy} className="pp-save-btn">
              {saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
            {(uploadingLogo || uploadingCover) && (
              <span className="pp-busy-note">⏳ Waiting for upload to finish...</span>
            )}
          </div>

        </form>
      </div>
    </>
  )
}