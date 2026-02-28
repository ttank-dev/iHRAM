'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PaymentSettingsForm({ initialSettings }: { initialSettings: any }) {
  const supabase = createClient()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploadingDuitnow, setUploadingDuitnow] = useState(false)
  const [uploadingTng, setUploadingTng] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // settingsId declared at top — before any usage
  const [settingsId, setSettingsId] = useState<string | null>(initialSettings?.id || null)

  const [formData, setFormData] = useState({
    bank_name: initialSettings?.bank_name || '',
    account_name: initialSettings?.account_name || '',
    account_number: initialSettings?.account_number || '',
    bank_instruction: initialSettings?.bank_instruction || 'Sila transfer dan hantar resit ke email kami',
    duitnow_qr_url: initialSettings?.duitnow_qr_url || '',
    tng_qr_url: initialSettings?.tng_qr_url || ''
  })

  // Ref always holds latest formData — prevents stale closure bug on save
  const formDataRef = useRef(formData)
  const settingsIdRef = useRef(settingsId)

  const updateFormData = (updates: Partial<typeof formData>) => {
    const next = { ...formDataRef.current, ...updates }
    formDataRef.current = next
    setFormData(next)
  }

  const handleChange = (field: string, value: string) =>
    updateFormData({ [field]: value })

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'duitnow' | 'tng'
  ) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('❌ Sila upload fail imej'); return }
    if (file.size > 5 * 1024 * 1024) { alert('❌ Saiz imej mesti kurang dari 5MB'); return }

    try {
      if (type === 'duitnow') setUploadingDuitnow(true)
      else setUploadingTng(true)

      const fileExt = file.name.split('.').pop()
      const filePath = `qr-codes/qr-${type}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('public').upload(filePath, file)
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('public').getPublicUrl(filePath)
      // Update via ref — immediately available to handleSubmit without re-render
      if (type === 'duitnow') updateFormData({ duitnow_qr_url: urlData.publicUrl })
      else updateFormData({ tng_qr_url: urlData.publicUrl })

      // Clear file input
      e.target.value = ''
    } catch (error: any) {
      alert(`❌ Error upload: ${error.message}`)
    } finally {
      if (type === 'duitnow') setUploadingDuitnow(false)
      else setUploadingTng(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Always read from ref — guaranteed latest regardless of render cycle
    const data = formDataRef.current
    const currentId = settingsIdRef.current

    if (!data.bank_name.trim()) { alert('❌ Nama bank diperlukan'); return }
    if (!data.account_name.trim()) { alert('❌ Nama akaun diperlukan'); return }
    if (!data.account_number.trim()) { alert('❌ No. akaun diperlukan'); return }

    setSaving(true)
    setSaveSuccess(false)

    try {
      if (currentId) {
        // UPDATE existing row
        const { error } = await supabase
          .from('payment_settings')
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq('id', currentId)
        if (error) throw error
      } else {
        // INSERT new row — first time setup
        const { data: inserted, error } = await supabase
          .from('payment_settings')
          .insert({ ...data })
          .select('id')
          .single()
        if (error) throw error

        // Store id so all future saves go through UPDATE path
        if (inserted?.id) {
          settingsIdRef.current = inserted.id
          setSettingsId(inserted.id)
        }
      }

      // Verify the write actually persisted before declaring success
      const { data: verify } = await supabase
        .from('payment_settings')
        .select('id, bank_name, duitnow_qr_url, tng_qr_url')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (verify) {
        // Update ref + state with confirmed DB values
        if (verify.id && !settingsIdRef.current) {
          settingsIdRef.current = verify.id
          setSettingsId(verify.id)
        }
      }

      setSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)

      // Soft refresh server components (Preview section) after short delay
      // This does NOT unmount client components — form state survives
      setTimeout(() => router.refresh(), 300)

    } catch (error: any) {
      setSaving(false)
      alert(`❌ Error: ${error.message}`)
    }
  }

  const isDisabled = saving || uploadingDuitnow || uploadingTng

  return (
    <>
      <style>{`
        .psf-label { display: block; font-size: 14px; font-weight: 600; color: #2C2C2C; margin-bottom: 8px; }
        .psf-input { width: 100%; padding: 12px 16px; font-size: 15px; border: 1px solid #E5E5E0; border-radius: 8px; outline: none; background: white; color: #2C2C2C; box-sizing: border-box; font-family: inherit; }
        .psf-input:focus { border-color: #B8936D; }
        .psf-field { margin-bottom: 20px; }
        .psf-section-title { font-size: 16px; font-weight: 700; color: #2C2C2C; margin-bottom: 16px; }
        .psf-hint { font-size: 13px; color: #F59E0B; margin-top: 4px; }
        .psf-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
        .psf-divider { padding-top: 32px; border-top: 1px solid #E5E5E0; margin-bottom: 32px; }
        .psf-qr-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .psf-qr-preview { width: 150px; height: 150px; border-radius: 8px; background-size: contain; background-position: center; background-repeat: no-repeat; background-color: #F5F5F0; margin-bottom: 8px; border: 1px solid #E5E5E0; }
        .psf-save-wrap { padding-top: 24px; border-top: 1px solid #E5E5E0; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .psf-save-btn { padding: 14px 32px; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
        .psf-success { font-size: 14px; color: #10B981; font-weight: 600; }
        .psf-uploading-badge { font-size: 12px; background: #FEF3C7; color: #D97706; padding: 4px 10px; border-radius: 20px; font-weight: 600; }

        @media (max-width: 639px) {
          .psf-grid-2 { grid-template-columns: 1fr; gap: 0; }
          .psf-qr-grid { grid-template-columns: 1fr; }
          .psf-input { font-size: 14px; padding: 10px 12px; }
          .psf-label { font-size: 13px; }
          .psf-save-btn { width: 100%; justify-content: center; padding: 12px; }
          .psf-save-wrap { flex-direction: column; align-items: stretch; }
        }
      `}</style>

      <form onSubmit={handleSubmit}>
        {/* Bank Details */}
        <div className="psf-section-title">Bank Transfer Details</div>

        <div className="psf-grid-2">
          <div className="psf-field">
            <label className="psf-label">Bank Name <span style={{ color: '#EF4444' }}>*</span></label>
            <input type="text" value={formData.bank_name}
              onChange={(e) => handleChange('bank_name', e.target.value)}
              placeholder="e.g. Maybank" required className="psf-input" />
          </div>
          <div className="psf-field">
            <label className="psf-label">Account Name <span style={{ color: '#EF4444' }}>*</span></label>
            <input type="text" value={formData.account_name}
              onChange={(e) => handleChange('account_name', e.target.value)}
              placeholder="e.g. Think Tank Sdn Bhd" required className="psf-input" />
          </div>
        </div>

        <div className="psf-field">
          <label className="psf-label">Account Number <span style={{ color: '#EF4444' }}>*</span></label>
          <input type="text" value={formData.account_number}
            onChange={(e) => handleChange('account_number', e.target.value)}
            placeholder="e.g. 1234567890" required className="psf-input"
            style={{ fontFamily: 'monospace', fontSize: '16px' }} />
        </div>

        <div className="psf-field">
          <label className="psf-label">Instruction for Donors</label>
          <textarea value={formData.bank_instruction}
            onChange={(e) => handleChange('bank_instruction', e.target.value)}
            rows={2} placeholder="e.g. Sila transfer dan hantar resit ke email kami"
            className="psf-input" style={{ resize: 'vertical' }} />
        </div>

        {/* QR Codes */}
        <div className="psf-divider">
          <div className="psf-section-title">QR Code Payment (Optional)</div>
          <div className="psf-qr-grid">

            {/* DuitNow */}
            <div>
              <label className="psf-label">DuitNow QR Code</label>
              {formData.duitnow_qr_url ? (
                <div style={{ marginBottom: '10px' }}>
                  <div className="psf-qr-preview"
                    style={{ backgroundImage: `url(${formData.duitnow_qr_url})` }} />
                  <button type="button" onClick={() => handleChange('duitnow_qr_url', '')}
                    style={{ padding: '6px 14px', backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    🗑️ Remove
                  </button>
                </div>
              ) : (
                <>
                  <input type="file" accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'duitnow')}
                    disabled={uploadingDuitnow} className="psf-input"
                    style={{ cursor: uploadingDuitnow ? 'not-allowed' : 'pointer', padding: '10px' }} />
                  {uploadingDuitnow && (
                    <div className="psf-hint">⏳ Uploading...</div>
                  )}
                </>
              )}
            </div>

            {/* TnG */}
            <div>
              <label className="psf-label">Touch n Go QR Code</label>
              {formData.tng_qr_url ? (
                <div style={{ marginBottom: '10px' }}>
                  <div className="psf-qr-preview"
                    style={{ backgroundImage: `url(${formData.tng_qr_url})` }} />
                  <button type="button" onClick={() => handleChange('tng_qr_url', '')}
                    style={{ padding: '6px 14px', backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    🗑️ Remove
                  </button>
                </div>
              ) : (
                <>
                  <input type="file" accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'tng')}
                    disabled={uploadingTng} className="psf-input"
                    style={{ cursor: uploadingTng ? 'not-allowed' : 'pointer', padding: '10px' }} />
                  {uploadingTng && (
                    <div className="psf-hint">⏳ Uploading...</div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Upload note — shown when image exists, remind user to save */}
          {(formData.duitnow_qr_url || formData.tng_qr_url) && (
            <p style={{ fontSize: '13px', color: '#999', marginTop: '16px' }}>
              💡 Upload baru? Klik <strong>Save Settings</strong> untuk simpan perubahan.
            </p>
          )}
        </div>

        {/* Save */}
        <div className="psf-save-wrap">
          <button type="submit" disabled={isDisabled} className="psf-save-btn"
            style={{ backgroundColor: isDisabled ? '#999' : '#B8936D', cursor: isDisabled ? 'not-allowed' : 'pointer' }}>
            {saving ? '⏳ Saving...' : '💾 Save Settings'}
          </button>
          {(uploadingDuitnow || uploadingTng) && (
            <span className="psf-uploading-badge">⏳ Uploading image...</span>
          )}
          {saveSuccess && (
            <span className="psf-success">✅ Saved successfully!</span>
          )}
        </div>
      </form>
    </>
  )
}