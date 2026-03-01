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
      const result = await createMerchantStaff({ ...formData, agencyId })
      if (!result.success) throw new Error(result.error)
      setSuccess({ email: result.email!, password: result.tempPassword! })
      setFormData({ fullName: '', email: '', role: 'staff' })
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const copyCredentials = () => {
    const text = `Staff Login Credentials\nEmail: ${success?.email}\nTemporary Password: ${success?.password}\n\nLogin at: https://ihram.com.my/merchant/login`
    navigator.clipboard.writeText(text)
    alert('📋 Copied to clipboard!')
  }

  return (
    <>
      <style>{`
        .asf,.asf *{box-sizing:border-box}
        .asf-section-title{font-size:15px;font-weight:700;color:#2C2C2C;margin:0 0 16px;display:flex;align-items:center;gap:8px}

        /* Success box */
        .asf-success{padding:18px;background:#ECFDF5;border:2px solid #10B981;border-radius:10px;margin-bottom:20px}
        .asf-success-title{font-size:15px;font-weight:700;color:#065F46;margin-bottom:12px;display:flex;align-items:center;gap:6px}
        .asf-cred-box{background:#F0FDF4;border:1px solid #86EFAC;border-radius:8px;padding:14px;margin-bottom:12px;font-family:monospace;font-size:13px;line-height:1.8;color:#065F46}
        .asf-warn{font-size:12px;color:#065F46;margin-bottom:12px;line-height:1.5}
        .asf-copy-btn{width:100%;padding:9px;background:#10B981;color:white;border:none;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer}
        .asf-copy-btn:hover{background:#059669}

        /* Error */
        .asf-error{padding:11px 14px;background:#FEE2E2;border:1px solid #FCA5A5;border-radius:8px;margin-bottom:14px;font-size:13px;color:#DC2626}

        /* Form grid */
        .asf-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px}
        .asf-field{margin-bottom:14px}
        .asf-label{display:block;font-size:13px;font-weight:600;color:#555;margin-bottom:6px}
        .asf-req{color:#EF4444;margin-left:2px}
        .asf-input,.asf-select{
          width:100%;padding:10px 13px;border:1.5px solid #E5E5E0;border-radius:8px;
          font-size:13px;outline:none;font-family:inherit;color:#2C2C2C;background:white;
          transition:border-color .15s;
        }
        .asf-input:focus,.asf-select:focus{border-color:#B8936D}
        .asf-input:disabled,.asf-select:disabled{opacity:.6;cursor:not-allowed}

        /* Info box */
        .asf-info{padding:11px 14px;background:#EFF6FF;border-radius:8px;margin-bottom:14px;display:flex;gap:10px;align-items:flex-start}
        .asf-info-text{font-size:12px;color:#1E40AF;line-height:1.6}

        /* Submit */
        .asf-submit{
          width:100%;padding:11px;background:#B8936D;color:white;
          border:none;border-radius:8px;font-size:14px;font-weight:600;
          cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;
          transition:background .15s;
        }
        .asf-submit:hover:not(:disabled){background:#a07d5a}
        .asf-submit:disabled{background:#ccc;cursor:not-allowed}

        @media(max-width:639px){
          .asf-grid{grid-template-columns:1fr;gap:0}
          .asf-grid .asf-field{margin-bottom:14px}
        }
      `}</style>

      <div className="asf">
        <div className="asf-section-title"><span>➕</span> Add Staff Member</div>

        {success && (
          <div className="asf-success">
            <div className="asf-success-title">✅ Staff Created Successfully!</div>
            <div className="asf-cred-box">
              <div><strong>Email:</strong> {success.email}</div>
              <div><strong>Temporary Password:</strong> {success.password}</div>
            </div>
            <div className="asf-warn">
              ⚠️ <strong>Important:</strong> Copy these credentials and share them securely.
              They can login immediately at <strong>/merchant/login</strong>
            </div>
            <button className="asf-copy-btn" onClick={copyCredentials}>📋 Copy Credentials</button>
          </div>
        )}

        {error && <div className="asf-error">❌ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="asf-grid">
            <div className="asf-field">
              <label className="asf-label">Full Name <span className="asf-req">*</span></label>
              <input type="text" required className="asf-input" disabled={loading}
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Ahmad bin Ali" />
            </div>
            <div className="asf-field">
              <label className="asf-label">Email Address <span className="asf-req">*</span></label>
              <input type="email" required className="asf-input" disabled={loading}
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@example.com" />
            </div>
          </div>

          <div className="asf-field">
            <label className="asf-label">Role <span className="asf-req">*</span></label>
            <select className="asf-select" disabled={loading}
              value={formData.role}
              onChange={e => setFormData({ ...formData, role: e.target.value as 'staff' | 'owner' })}>
              <option value="staff">👤 Staff — View only, help with inquiries</option>
              <option value="owner">👑 Owner — Full access</option>
            </select>
          </div>

          <div className="asf-info">
            <span style={{ fontSize: 16 }}>ℹ️</span>
            <div className="asf-info-text">
              <strong>Temporary Password:</strong> The system will generate a temporary password automatically.
              The new staff member can use it to login immediately.
            </div>
          </div>

          <button type="submit" disabled={loading} className="asf-submit">
            {loading ? <>⏳ Creating Staff...</> : <>📧 Create Staff</>}
          </button>
        </form>
      </div>
    </>
  )
}