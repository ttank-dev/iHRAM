'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ChangePasswordForm() {
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
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      alert('❌ Please fill in all fields'); return
    }
    if (formData.newPassword.length < 6) {
      alert('❌ New password must be at least 6 characters'); return
    }
    if (formData.newPassword !== formData.confirmPassword) {
      alert('❌ New password and confirmation do not match'); return
    }
    if (!confirm('Change your password?')) return

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: formData.newPassword })
      if (error) throw error
      alert('✅ Password changed successfully!')
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowForm(false)
    } catch (error: any) {
      alert(`❌ Error: ${error.message || 'Failed to change password'}`)
    } finally {
      setLoading(false)
    }
  }

  const baseStyle = {
    padding: '24px',
    backgroundColor: '#FFF8F0',
    borderRadius: '12px',
    border: '1px solid #F5E5D3'
  }

  const inputStyle = {
    width: '100%',
    padding: '12px',
    border: '1px solid #E5E5E0',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: 'white',
    boxSizing: 'border-box' as const
  }

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600' as const,
    color: '#666',
    marginBottom: '8px'
  }

  if (!showForm) {
    return (
      <div style={{ ...baseStyle }}>
        <style>{`
          .cpf-collapsed { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
          @media (max-width: 479px) {
            .cpf-collapsed { flex-direction: column; align-items: flex-start; }
            .cpf-change-btn { width: 100%; text-align: center; }
          }
        `}</style>
        <div className="cpf-collapsed">
          <div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#2C2C2C', marginBottom: '4px' }}>
              🔐 Change Your Password
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Update your admin account password</div>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="cpf-change-btn"
            style={{
              padding: '10px 24px', backgroundColor: '#B8936D', color: 'white',
              border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600',
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0
            }}
          >
            Change Password
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={baseStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#2C2C2C' }}>🔐 Change Your Password</div>
        <button type="button" onClick={() => setShowForm(false)}
          style={{ padding: '6px 16px', backgroundColor: 'transparent', color: '#999', border: '1px solid #E5E5E0', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}>Current Password *</label>
          <input type="password" value={formData.currentPassword}
            onChange={(e) => setFormData({...formData, currentPassword: e.target.value})}
            placeholder="Enter your current password" required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>New Password *</label>
          <input type="password" value={formData.newPassword}
            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
            placeholder="Min. 6 characters" required minLength={6} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Confirm New Password *</label>
          <input type="password" value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            placeholder="Re-enter new password" required minLength={6} style={inputStyle} />
        </div>
      </div>

      <div style={{ padding: '12px 16px', backgroundColor: '#E8F4F8', borderRadius: '8px', fontSize: '13px', color: '#666', marginBottom: '16px', lineHeight: '1.5' }}>
        💡 <strong>Password Requirements:</strong><br />
        • Minimum 6 characters<br />
        • Mix of letters and numbers recommended
      </div>

      <button type="submit" disabled={loading} style={{
        width: '100%', padding: '14px',
        backgroundColor: loading ? '#999' : '#B8936D',
        color: 'white', border: 'none', borderRadius: '8px',
        fontSize: '15px', fontWeight: '600',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
      }}>
        {loading ? '⏳ Changing Password...' : '🔐 Change Password'}
      </button>
    </form>
  )
}