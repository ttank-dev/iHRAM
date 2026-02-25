'use client'

import { useState } from 'react'
import { updateAdminPassword } from './updateAdminPassword.action'

export default function ChangeAdminPasswordModal({ user, onClose }: { user: any; onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
    let password = ''
    for (let i = 0; i < 12; i++) password += chars.charAt(Math.floor(Math.random() * chars.length))
    setNewPassword(password); setConfirmPassword(password)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError(''); setSuccess(null)
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); setLoading(false); return }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); setLoading(false); return }
    try {
      const result = await updateAdminPassword(user.id, newPassword)
      if (!result.success) throw new Error(result.error)
      setSuccess(`✅ Password changed successfully!\n\n📧 Email: ${user.email}\n🔑 New Password: ${newPassword}\n\nShare this securely with the admin.`)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { width: '100%', padding: '10px 16px', border: '1px solid #E5E5E0', borderRadius: '8px', fontSize: '14px', outline: 'none', fontFamily: 'monospace', boxSizing: 'border-box' as const }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '100%' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>🔑 Change Admin Password</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>Set new password for {user.full_name || user.email}</p>

        {error && <div style={{ padding: '12px', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', color: '#DC2626' }}>{error}</div>}

        {success && (
          <div style={{ padding: '16px', backgroundColor: '#ECFDF5', border: '2px solid #10B981', borderRadius: '8px', marginBottom: '16px' }}>
            <pre style={{ fontSize: '14px', color: '#065F46', margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'monospace', lineHeight: '1.6' }}>{success}</pre>
            <button onClick={() => navigator.clipboard.writeText(`Password changed for ${user.email}\nNew Password: ${newPassword}`).then(() => alert('📋 Copied!'))}
              style={{ marginTop: '12px', padding: '8px 16px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', width: '100%' }}>
              📋 Copy Password
            </button>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button type="button" onClick={generatePassword} style={{ padding: '10px 16px', backgroundColor: '#F5F5F0', color: '#2C2C2C', border: '1px solid #E5E5E0', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                🎲 Generate Random Password
              </button>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>New Password</label>
                <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} placeholder="Minimum 8 characters" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>Confirm Password</label>
                <input type="text" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} placeholder="Re-enter password" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', backgroundColor: loading ? '#CCC' : '#8B5CF6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
                <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', backgroundColor: 'white', color: '#2C2C2C', border: '1px solid #E5E5E0', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {success && (
          <button onClick={() => window.location.reload()} style={{ width: '100%', padding: '12px', backgroundColor: '#B8936D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer', marginTop: '16px' }}>
            Done
          </button>
        )}
      </div>
    </div>
  )
}