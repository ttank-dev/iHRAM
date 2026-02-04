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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'duitnow' | 'tng') => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('❌ Please upload an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('❌ Image size must be less than 5MB')
      return
    }

    try {
      if (type === 'duitnow') setUploadingDuitnow(true)
      else setUploadingTng(true)

      const fileExt = file.name.split('.').pop()
      const fileName = `qr-${type}-${Date.now()}.${fileExt}`
      const filePath = `qr-codes/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('public')
        .getPublicUrl(filePath)

      if (type === 'duitnow') {
        setFormData(prev => ({ ...prev, duitnow_qr_url: urlData.publicUrl }))
      } else {
        setFormData(prev => ({ ...prev, tng_qr_url: urlData.publicUrl }))
      }

      alert('✅ QR code uploaded successfully!')

    } catch (error: any) {
      console.error('Upload error:', error)
      alert(`❌ Error uploading: ${error.message}`)
    } finally {
      if (type === 'duitnow') setUploadingDuitnow(false)
      else setUploadingTng(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.bank_name.trim()) {
      alert('❌ Bank name is required')
      return
    }
    if (!formData.account_name.trim()) {
      alert('❌ Account name is required')
      return
    }
    if (!formData.account_number.trim()) {
      alert('❌ Account number is required')
      return
    }

    setSaving(true)
    try {
      if (initialSettings?.id) {
        // Update existing
        const { error } = await supabase
          .from('payment_settings')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', initialSettings.id)

        if (error) throw error
      } else {
        // Insert new
        const { error } = await supabase
          .from('payment_settings')
          .insert(formData)

        if (error) throw error
      }

      alert('✅ Payment settings saved successfully!')
      router.refresh()
    } catch (error: any) {
      console.error('Error saving:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* BANK DETAILS */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: '#2C2C2C',
          marginBottom: '16px'
        }}>
          Bank Transfer Details
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px',
          marginBottom: '20px'
        }}>
          {/* Bank Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              Bank Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.bank_name}
              onChange={(e) => handleChange('bank_name', e.target.value)}
              placeholder="e.g. Maybank"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '15px',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: 'white',
                color: '#2C2C2C'
              }}
            />
          </div>

          {/* Account Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              Account Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.account_name}
              onChange={(e) => handleChange('account_name', e.target.value)}
              placeholder="e.g. Think Tank Sdn Bhd"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '15px',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                outline: 'none',
                backgroundColor: 'white',
                color: '#2C2C2C'
              }}
            />
          </div>
        </div>

        {/* Account Number */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '8px'
          }}>
            Account Number <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.account_number}
            onChange={(e) => handleChange('account_number', e.target.value)}
            placeholder="e.g. 1234567890"
            required
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '15px',
              border: '1px solid #E5E5E0',
              borderRadius: '8px',
              outline: 'none',
              backgroundColor: 'white',
              color: '#2C2C2C',
              fontFamily: 'monospace',
              fontSize: '16px'
            }}
          />
        </div>

        {/* Bank Instruction */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '8px'
          }}>
            Instruction for Donors
          </label>
          <textarea
            value={formData.bank_instruction}
            onChange={(e) => handleChange('bank_instruction', e.target.value)}
            rows={2}
            placeholder="e.g. Sila transfer dan hantar resit ke email kami"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '15px',
              border: '1px solid #E5E5E0',
              borderRadius: '8px',
              outline: 'none',
              resize: 'vertical',
              fontFamily: 'inherit',
              backgroundColor: 'white',
              color: '#2C2C2C'
            }}
          />
        </div>
      </div>

      {/* QR CODES */}
      <div style={{
        paddingTop: '32px',
        borderTop: '1px solid #E5E5E0',
        marginBottom: '32px'
      }}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: '#2C2C2C',
          marginBottom: '16px'
        }}>
          QR Code Payment (Optional)
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px'
        }}>
          {/* DuitNow QR */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              DuitNow QR Code
            </label>

            {formData.duitnow_qr_url && (
              <div style={{
                width: '150px',
                height: '150px',
                borderRadius: '8px',
                backgroundImage: `url(${formData.duitnow_qr_url})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#F5F5F0',
                marginBottom: '12px',
                border: '1px solid #E5E5E0'
              }} />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'duitnow')}
              disabled={uploadingDuitnow}
              style={{
                display: 'block',
                padding: '12px',
                fontSize: '14px',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: uploadingDuitnow ? 'not-allowed' : 'pointer',
                width: '100%'
              }}
            />
            {uploadingDuitnow && (
              <div style={{ fontSize: '13px', color: '#F59E0B', marginTop: '4px' }}>
                ⏳ Uploading...
              </div>
            )}
          </div>

          {/* Touch n Go QR */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              Touch n Go QR Code
            </label>

            {formData.tng_qr_url && (
              <div style={{
                width: '150px',
                height: '150px',
                borderRadius: '8px',
                backgroundImage: `url(${formData.tng_qr_url})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: '#F5F5F0',
                marginBottom: '12px',
                border: '1px solid #E5E5E0'
              }} />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'tng')}
              disabled={uploadingTng}
              style={{
                display: 'block',
                padding: '12px',
                fontSize: '14px',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                backgroundColor: 'white',
                cursor: uploadingTng ? 'not-allowed' : 'pointer',
                width: '100%'
              }}
            />
            {uploadingTng && (
              <div style={{ fontSize: '13px', color: '#F59E0B', marginTop: '4px' }}>
                ⏳ Uploading...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      <div style={{
        paddingTop: '24px',
        borderTop: '1px solid #E5E5E0'
      }}>
        <button
          type="submit"
          disabled={saving || uploadingDuitnow || uploadingTng}
          style={{
            padding: '14px 32px',
            backgroundColor: (saving || uploadingDuitnow || uploadingTng) ? '#999' : '#B8936D',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: (saving || uploadingDuitnow || uploadingTng) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {saving ? '⏳ Saving...' : '💾 Save Settings'}
        </button>
      </div>
    </form>
  )
}