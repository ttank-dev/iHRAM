'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface GeneralSettingsProps {
  settings: {
    platform_name: string
    tagline: string
    contact_email: string
    whatsapp_number: string
    support_email: string
    company_name: string
    ssm_number: string
    address: string
    facebook_url: string
    instagram_url: string
    terms_url: string
    privacy_url: string
  }
}

export default function GeneralSettings({ settings }: GeneralSettingsProps) {
  const supabase = createClient()
  const [editing, setEditing] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(settings)

  const handleSave = async (field: string) => {
    setLoading(true)
    try {
      // Save to database
      const { error } = await supabase
        .from('site_settings')
        .update({ [field]: formData[field as keyof typeof formData] })
        .eq('id', 1) // Assuming single row for site settings

      if (error) throw error

      alert('✅ Settings updated successfully!')
      setEditing(null)
      window.location.reload()
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = (field: string) => {
    setFormData({ ...formData, [field]: settings[field as keyof typeof settings] })
    setEditing(null)
  }

  const renderField = (
    label: string,
    field: keyof typeof formData,
    icon: string,
    type: 'text' | 'email' | 'tel' | 'url' | 'textarea' = 'text'
  ) => {
    const isEditing = editing === field

    return (
      <div style={{
        padding: '24px',
        backgroundColor: '#F5F5F0',
        borderRadius: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isEditing ? '16px' : '8px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#666'
          }}>
            {icon} {label}
          </div>
          {!isEditing ? (
            <button
              onClick={() => setEditing(field)}
              style={{
                padding: '6px 16px',
                backgroundColor: 'transparent',
                color: '#B8936D',
                border: '1px solid #B8936D',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Edit
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleCancel(field)}
                disabled={loading}
                style={{
                  padding: '6px 16px',
                  backgroundColor: 'transparent',
                  color: '#666',
                  border: '1px solid #E5E5E0',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSave(field)}
                disabled={loading}
                style={{
                  padding: '6px 16px',
                  backgroundColor: '#B8936D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <div style={{
            fontSize: '16px',
            color: '#2C2C2C',
            fontWeight: '500'
          }}>
            {formData[field] || '-'}
          </div>
        ) : type === 'textarea' ? (
          <textarea
            value={formData[field] as string}
            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #B8936D',
              borderRadius: '8px',
              fontSize: '15px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        ) : (
          <input
            type={type}
            value={formData[field] as string}
            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #B8936D',
              borderRadius: '8px',
              fontSize: '15px'
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        paddingBottom: '24px',
        borderBottom: '1px solid #E5E5E0'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          backgroundColor: '#F5F5F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          ⚙️
        </div>
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#2C2C2C',
            marginBottom: '4px'
          }}>
            General Settings
          </h2>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Basic platform configuration
          </p>
        </div>
      </div>

      {/* Platform Info */}
      {renderField('Platform Name', 'platform_name', '🕌')}
      {renderField('Tagline', 'tagline', '✨')}

      {/* Contact Info */}
      {renderField('Contact Email', 'contact_email', '📧', 'email')}
      {renderField('WhatsApp Number', 'whatsapp_number', '📱', 'tel')}
      {renderField('Support Email', 'support_email', '💬', 'email')}

      {/* Company Info */}
      {renderField('Company Name', 'company_name', '🏢')}
      {renderField('SSM Number', 'ssm_number', '📋')}
      {renderField('Address', 'address', '📍', 'textarea')}

      {/* Social Media */}
      {renderField('Facebook Page', 'facebook_url', '👍', 'url')}
      {renderField('Instagram Account', 'instagram_url', '📷', 'url')}

      {/* Legal */}
      {renderField('Terms & Conditions URL', 'terms_url', '📄', 'url')}
      {renderField('Privacy Policy URL', 'privacy_url', '🔒', 'url')}
    </div>
  )
}