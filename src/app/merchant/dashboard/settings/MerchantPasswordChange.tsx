'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MerchantPasswordChange() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      alert('❌ Please fill in all fields')
      return
    }

    if (formData.newPassword.length < 6) {
      alert('❌ New password must be at least 6 characters')
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      alert('❌ New password and confirmation do not match')
      return
    }

    if (!confirm('Change your password?')) return

    setLoading(true)
    try {
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      })

      if (error) throw error

      alert('✅ Password changed successfully!')
      
      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setShowForm(false)
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error: ${error.message || 'Failed to change password'}`)
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <div style={{
        padding: '24px',
        backgroundColor: '#FFF8F0',
        borderRadius: '12px',
        border: '1px solid #F5E5D3',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '4px'
          }}>
            🔐 Change Your Password
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Update your merchant account password
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: '10px 24px',
            backgroundColor: '#B8936D',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Change Password
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{
      padding: '24px',
      backgroundColor: '#FFF8F0',
      borderRadius: '12px',
      border: '1px solid #F5E5D3'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#2C2C2C'
        }}>
          🔐 Change Your Password
        </div>
        <button
          type="button"
          onClick={() => setShowForm(false)}
          style={{
            padding: '6px 16px',
            backgroundColor: 'transparent',
            color: '#999',
            border: '1px solid #E5E5E0',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '16px'
      }}>
        {/* Current Password */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: '#666',
            marginBottom: '8px'
          }}>
            Current Password *
          </label>
          <input
            type="password"
            value={formData.currentPassword}
            onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
            placeholder="Enter your current password"
            required
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E5E0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          />
        </div>

        {/* New Password */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: '#666',
            marginBottom: '8px'
          }}>
            New Password *
          </label>
          <input
            type="password"
            value={formData.newPassword}
            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
            placeholder="Min. 6 characters"
            required
            minLength={6}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E5E0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          />
        </div>

        {/* Confirm New Password */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '600',
            color: '#666',
            marginBottom: '8px'
          }}>
            Confirm New Password *
          </label>
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            placeholder="Re-enter new password"
            required
            minLength={6}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E5E0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          />
        </div>
      </div>

      {/* Info Box */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#E8F4F8',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#666',
        marginBottom: '16px',
        lineHeight: '1.5'
      }}>
        💡 <strong>Password Requirements:</strong><br/>
        • Minimum 6 characters<br/>
        • Mix of letters and numbers recommended
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          padding: '14px',
          backgroundColor: loading ? '#999' : '#B8936D',
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
        {loading ? '⏳ Changing Password...' : '🔐 Change Password'}
      </button>
    </form>
  )
}