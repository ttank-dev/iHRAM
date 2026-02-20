'use client'

import { useState } from 'react'
import { createMerchantStaff } from './createMerchantStaff.action'

export default function AddStaffForm({ agencyId }: { agencyId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ email: string; password: string } | null>(null)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'staff' as 'staff' | 'owner'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(null)

    try {
      const result = await createMerchantStaff({
        ...formData,
        agencyId
      })

      if (!result.success) {
        throw new Error(result.error)
      }

      setSuccess({
        email: result.email!,
        password: result.tempPassword!
      })

      // Reset form
      setFormData({
        fullName: '',
        email: '',
        role: 'staff'
      })
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyCredentials = () => {
    const text = `Staff Login Credentials
Email: ${success?.email}
Temporary Password: ${success?.password}

Login at: https://ihram.com.my/merchant-login`
    
    navigator.clipboard.writeText(text)
    alert('📋 Copied to clipboard!')
  }

  return (
    <div>
      <div style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#2C2C2C',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>➕</span>
        Add Staff Member
      </div>

      {success && (
        <div style={{
          padding: '20px',
          backgroundColor: '#ECFDF5',
          border: '2px solid #10B981',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#065F46',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ✅ Staff Created Successfully!
          </div>

          <div style={{
            backgroundColor: '#F0FDF4',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '12px',
            border: '1px solid #86EFAC'
          }}>
            <div style={{ 
              fontFamily: 'monospace', 
              fontSize: '14px', 
              lineHeight: '1.8',
              color: '#065F46'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#047857' }}>Email:</strong>{' '}
                <span style={{ color: '#166534' }}>{success.email}</span>
              </div>
              <div>
                <strong style={{ color: '#047857' }}>Temporary Password:</strong>{' '}
                <span style={{ color: '#166534', fontWeight: '600' }}>{success.password}</span>
              </div>
            </div>
          </div>

          <div style={{
            fontSize: '13px',
            color: '#065F46',
            marginBottom: '12px',
            lineHeight: '1.6'
          }}>
            ⚠️ <strong>Important:</strong> Copy these credentials and share them securely. 
            They can login immediately at <strong>/merchant-login</strong>
          </div>

          <button
            onClick={copyCredentials}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            📋 Copy Credentials
          </button>
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#FEE2E2',
          border: '1px solid #FCA5A5',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px',
          color: '#DC2626'
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '16px'
        }}>
          {/* Full Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              Full Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Ahmad bin Ali"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 16px',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              Email Address <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="staff@example.com"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 16px',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Role */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '8px'
          }}>
            Role <span style={{ color: '#EF4444' }}>*</span>
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'staff' | 'owner' })}
            disabled={loading}
            style={{
              width: '100%',
              padding: '10px 16px',
              border: '1px solid #E5E5E0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="staff">👤 Staff - View only, help with inquiries</option>
            <option value="owner">👑 Owner - Full access</option>
          </select>
        </div>

        {/* Info Box */}
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#EFF6FF',
          borderRadius: '8px',
          marginBottom: '16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'start'
        }}>
          <span style={{ fontSize: '18px' }}>ℹ️</span>
          <div style={{ fontSize: '13px', color: '#1E40AF', lineHeight: '1.6' }}>
            <strong>Temporary Password:</strong> The system will generate a temporary password automatically. 
            The new staff member can use it to login immediately.
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#CCC' : '#B8936D',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {loading ? (
            <>⏳ Creating Staff...</>
          ) : (
            <>📧 Create Staff</>
          )}
        </button>
      </form>
    </div>
  )
}