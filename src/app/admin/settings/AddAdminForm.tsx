'use client'

import { useState } from 'react'
import { createAdminUser } from './createAdminUser.action'

export default function AddAdminForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<{ email: string; password: string } | null>(null)
  const [formData, setFormData] = useState({ fullName: '', email: '', role: 'admin' as 'admin' | 'super_admin' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess(null)
    try {
      const result = await createAdminUser(formData)
      if (!result.success) throw new Error(result.error)
      setSuccess({ email: result.email!, password: result.tempPassword! })
      setFormData({ fullName: '', email: '', role: 'admin' })
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyCredentials = () => {
    navigator.clipboard.writeText(`Admin Login Credentials\nEmail: ${success?.email}\nTemporary Password: ${success?.password}\n\nLogin at: https://ihram.com.my/admin-login`)
    alert('📋 Copied to clipboard!')
  }

  return (
    <>
      <style>{`
        .aaf-title { font-size: 16px; font-weight: 600; color: #2C2C2C; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
        .aaf-label { display: block; font-size: 14px; font-weight: 600; color: #2C2C2C; margin-bottom: 8px; }
        .aaf-input { width: 100%; padding: 10px 16px; border: 1px solid #E5E5E0; border-radius: 8px; font-size: 14px; outline: none; box-sizing: border-box; }
        .aaf-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px; }
        .aaf-field { margin-bottom: 16px; }
        .aaf-info { padding: 12px 16px; background: #EFF6FF; border-radius: 8px; margin-bottom: 16px; display: flex; gap: 12px; align-items: flex-start; }
        .aaf-submit { width: 100%; padding: 12px; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .aaf-success { padding: 20px; background: #ECFDF5; border: 2px solid #10B981; border-radius: 12px; margin-bottom: 24px; }
        .aaf-error { padding: 12px 16px; background: #FEE2E2; border: 1px solid #FCA5A5; border-radius: 8px; margin-bottom: 16px; font-size: 14px; color: #DC2626; }

        @media (max-width: 639px) {
          .aaf-grid { grid-template-columns: 1fr; gap: 0; }
          .aaf-input { font-size: 13px; padding: 9px 12px; }
        }
      `}</style>

      <div>
        <div className="aaf-title"><span>➕</span> Add New Admin User</div>

        {success && (
          <div className="aaf-success">
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#065F46', marginBottom: '12px' }}>✅ Admin Created Successfully!</div>
            <div style={{ background: '#F0FDF4', padding: '16px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #86EFAC', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.8', color: '#065F46' }}>
              <div style={{ marginBottom: '8px' }}><strong>Email:</strong> {success.email}</div>
              <div><strong>Temporary Password:</strong> <span style={{ fontWeight: '600' }}>{success.password}</span></div>
            </div>
            <div style={{ fontSize: '13px', color: '#065F46', marginBottom: '12px', lineHeight: '1.6' }}>
              ⚠️ <strong>Important:</strong> Copy these credentials and share them securely with the admin.
            </div>
            <button onClick={copyCredentials} style={{ width: '100%', padding: '10px', backgroundColor: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
              📋 Copy Credentials
            </button>
          </div>
        )}

        {error && <div className="aaf-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="aaf-grid">
            <div className="aaf-field">
              <label className="aaf-label">Full Name <span style={{ color: '#EF4444' }}>*</span></label>
              <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="John Doe" required disabled={loading} className="aaf-input" />
            </div>
            <div className="aaf-field">
              <label className="aaf-label">Email Address <span style={{ color: '#EF4444' }}>*</span></label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@ihram.com.my" required disabled={loading} className="aaf-input" />
            </div>
          </div>

          <div className="aaf-field">
            <label className="aaf-label">Role <span style={{ color: '#EF4444' }}>*</span></label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              disabled={loading} className="aaf-input" style={{ cursor: 'pointer' }}>
              <option value="admin">🔧 Admin - Content management only</option>
              <option value="super_admin">👑 Super Admin - Full access</option>
            </select>
          </div>

          <div className="aaf-info">
            <span style={{ fontSize: '18px' }}>ℹ️</span>
            <div style={{ fontSize: '13px', color: '#1E40AF', lineHeight: '1.6' }}>
              <strong>Temporary Password:</strong> The system will generate a temporary password automatically.
            </div>
          </div>

          <button type="submit" disabled={loading} className="aaf-submit"
            style={{ backgroundColor: loading ? '#CCC' : '#B8936D', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? <>⏳ Creating Admin...</> : <>📧 Create Admin</>}
          </button>
        </form>
      </div>
    </>
  )
}