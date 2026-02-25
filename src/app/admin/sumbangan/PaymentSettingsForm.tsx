'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PaymentSettingsForm({ initialSettings }: { initialSettings: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [uploadingDuitnow, setUploadingDuitnow] = useState(false)
  const [uploadingTng, setUploadingTng] = useState(false)

  const [formData, setFormData] = useState({
    bank_name: initialSettings?.bank_name || '',
    account_name: initialSettings?.account_name || '',
    account_number: initialSettings?.account_number || '',
    bank_instruction: initialSettings?.bank_instruction || 'Sila transfer dan hantar resit ke email kami',
    duitnow_qr_url: initialSettings?.duitnow_qr_url || '',
    tng_qr_url: initialSettings?.tng_qr_url || ''
  })

  const handleChange = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'duitnow' | 'tng') => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('❌ Please upload an image file'); return }
    if (file.size > 5 * 1024 * 1024) { alert('❌ Image size must be less than 5MB'); return }

    try {
      if (type === 'duitnow') setUploadingDuitnow(true); else setUploadingTng(true)
      const fileExt = file.name.split('.').pop()
      const filePath = `qr-codes/qr-${type}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('public').upload(filePath, file)
      if (uploadError) throw uploadError
      const { data: urlData } = supabase.storage.from('public').getPublicUrl(filePath)
      if (type === 'duitnow') setFormData(prev => ({ ...prev, duitnow_qr_url: urlData.publicUrl }))
      else setFormData(prev => ({ ...prev, tng_qr_url: urlData.publicUrl }))
      alert('✅ QR code uploaded successfully!')
    } catch (error: any) {
      alert(`❌ Error uploading: ${error.message}`)
    } finally {
      if (type === 'duitnow') setUploadingDuitnow(false); else setUploadingTng(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.bank_name.trim()) { alert('❌ Bank name is required'); return }
    if (!formData.account_name.trim()) { alert('❌ Account name is required'); return }
    if (!formData.account_number.trim()) { alert('❌ Account number is required'); return }

    setSaving(true)
    try {
      if (initialSettings?.id) {
        const { error } = await supabase.from('payment_settings').update({ ...formData, updated_at: new Date().toISOString() }).eq('id', initialSettings.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('payment_settings').insert(formData)
        if (error) throw error
      }
      alert('✅ Payment settings saved successfully!')
      router.refresh()
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const isDisabled = saving || uploadingDuitnow || uploadingTng

  return (
    <>
      <style>{`
        .psf-label { display: block; font-size: 14px; font-weight: 600; color: #2C2C2C; margin-bottom: 8px; }
        .psf-input { width: 100%; padding: 12px 16px; font-size: 15px; border: 1px solid #E5E5E0; border-radius: 8px; outline: none; background: white; color: #2C2C2C; box-sizing: border-box; }
        .psf-input:focus { border-color: #B8936D; }
        .psf-field { margin-bottom: 20px; }
        .psf-section-title { font-size: 16px; font-weight: 700; color: #2C2C2C; margin-bottom: 16px; }
        .psf-hint { font-size: 13px; color: #F59E0B; margin-top: 4px; }

        .psf-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }

        .psf-divider { padding-top: 32px; border-top: 1px solid #E5E5E0; margin-bottom: 32px; }
        .psf-qr-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .psf-qr-preview { width: 150px; height: 150px; border-radius: 8px; background-size: contain; background-position: center; background-repeat: no-repeat; background-color: #F5F5F0; margin-bottom: 12px; border: 1px solid #E5E5E0; }

        .psf-save-wrap { padding-top: 24px; border-top: 1px solid #E5E5E0; }
        .psf-save-btn { padding: 14px 32px; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px; cursor: pointer; }

        @media (max-width: 639px) {
          .psf-grid-2 { grid-template-columns: 1fr; gap: 0; }
          .psf-qr-grid { grid-template-columns: 1fr; }
          .psf-input { font-size: 14px; padding: 10px 12px; }
          .psf-label { font-size: 13px; }
          .psf-save-btn { width: 100%; justify-content: center; padding: 12px; }
        }
      `}</style>

      <form onSubmit={handleSubmit}>
        {/* Bank Details */}
        <div className="psf-section-title">Bank Transfer Details</div>

        <div className="psf-grid-2">
          <div className="psf-field">
            <label className="psf-label">Bank Name <span style={{ color: '#EF4444' }}>*</span></label>
            <input type="text" value={formData.bank_name} onChange={(e) => handleChange('bank_name', e.target.value)}
              placeholder="e.g. Maybank" required className="psf-input" />
          </div>
          <div className="psf-field">
            <label className="psf-label">Account Name <span style={{ color: '#EF4444' }}>*</span></label>
            <input type="text" value={formData.account_name} onChange={(e) => handleChange('account_name', e.target.value)}
              placeholder="e.g. Think Tank Sdn Bhd" required className="psf-input" />
          </div>
        </div>

        <div className="psf-field">
          <label className="psf-label">Account Number <span style={{ color: '#EF4444' }}>*</span></label>
          <input type="text" value={formData.account_number} onChange={(e) => handleChange('account_number', e.target.value)}
            placeholder="e.g. 1234567890" required className="psf-input" style={{ fontFamily: 'monospace', fontSize: '16px' }} />
        </div>

        <div className="psf-field">
          <label className="psf-label">Instruction for Donors</label>
          <textarea value={formData.bank_instruction} onChange={(e) => handleChange('bank_instruction', e.target.value)}
            rows={2} placeholder="e.g. Sila transfer dan hantar resit ke email kami"
            className="psf-input" style={{ resize: 'vertical', fontFamily: 'inherit' }} />
        </div>

        {/* QR Codes */}
        <div className="psf-divider">
          <div className="psf-section-title">QR Code Payment (Optional)</div>
          <div className="psf-qr-grid">
            {/* DuitNow */}
            <div>
              <label className="psf-label">DuitNow QR Code</label>
              {formData.duitnow_qr_url && (
                <div className="psf-qr-preview" style={{ backgroundImage: `url(${formData.duitnow_qr_url})` }} />
              )}
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'duitnow')}
                disabled={uploadingDuitnow} className="psf-input"
                style={{ cursor: uploadingDuitnow ? 'not-allowed' : 'pointer', padding: '12px' }} />
              {uploadingDuitnow && <div className="psf-hint">⏳ Uploading...</div>}
            </div>

            {/* TnG */}
            <div>
              <label className="psf-label">Touch n Go QR Code</label>
              {formData.tng_qr_url && (
                <div className="psf-qr-preview" style={{ backgroundImage: `url(${formData.tng_qr_url})` }} />
              )}
              <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'tng')}
                disabled={uploadingTng} className="psf-input"
                style={{ cursor: uploadingTng ? 'not-allowed' : 'pointer', padding: '12px' }} />
              {uploadingTng && <div className="psf-hint">⏳ Uploading...</div>}
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="psf-save-wrap">
          <button type="submit" disabled={isDisabled} className="psf-save-btn"
            style={{ backgroundColor: isDisabled ? '#999' : '#B8936D', cursor: isDisabled ? 'not-allowed' : 'pointer' }}>
            {saving ? '⏳ Saving...' : '💾 Save Settings'}
          </button>
        </div>
      </form>
    </>
  )
}