'use client'

import { useState } from 'react'
import { updateStaffPassword } from './updateStaffPassword.action'

export default function ChangeStaffPasswordModal({
  staff,
  onClose
}: {
  staff: any
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
    let pw = ''
    for (let i = 0; i < 12; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length))
    setNewPassword(pw)
    setConfirmPassword(pw)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(null)
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); setLoading(false); return }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); setLoading(false); return }
    try {
      const result = await updateStaffPassword(staff.id, newPassword)
      if (!result.success) throw new Error(result.error)
      setSuccess(newPassword)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    const text = `Password changed for ${staff.email}\nNew Password: ${success}`
    navigator.clipboard.writeText(text)
    alert('📋 Copied to clipboard!')
  }

  return (
    <>
      <style>{`
        .csp,.csp *{box-sizing:border-box}
        .csp-overlay{
          position:fixed;inset:0;background:rgba(0,0,0,.5);
          display:flex;align-items:center;justify-content:center;
          z-index:9999;padding:16px;
        }
        .csp-modal{
          background:white;border-radius:14px;padding:28px;
          max-width:480px;width:100%;
          max-height:90vh;overflow-y:auto;
        }
        .csp-title{font-size:20px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .csp-sub{font-size:13px;color:#666;margin:0 0 20px}

        .csp-error{padding:10px 13px;background:#FEE2E2;border:1px solid #FCA5A5;border-radius:8px;margin-bottom:14px;font-size:13px;color:#DC2626}

        /* Success box */
        .csp-success{padding:16px;background:#ECFDF5;border:2px solid #10B981;border-radius:8px;margin-bottom:14px}
        .csp-success-title{font-size:14px;font-weight:700;color:#065F46;margin-bottom:10px}
        .csp-success-cred{font-family:monospace;font-size:13px;color:#065F46;line-height:1.8;margin-bottom:10px}
        .csp-copy-btn{width:100%;padding:9px;background:#10B981;color:white;border:none;border-radius:7px;font-size:13px;font-weight:600;cursor:pointer}
        .csp-copy-btn:hover{background:#059669}

        /* Generate button */
        .csp-gen-btn{
          width:100%;padding:10px;background:#F5F5F0;color:#2C2C2C;
          border:1px solid #E5E5E0;border-radius:8px;font-size:13px;font-weight:600;
          cursor:pointer;margin-bottom:14px;transition:background .15s;font-family:inherit;
        }
        .csp-gen-btn:hover{background:#ececec}

        .csp-field{margin-bottom:14px}
        .csp-label{display:block;font-size:13px;font-weight:600;color:#555;margin-bottom:6px}
        .csp-input{
          width:100%;padding:10px 13px;border:1.5px solid #E5E5E0;border-radius:8px;
          font-size:14px;outline:none;font-family:monospace;color:#2C2C2C;
          transition:border-color .15s;
        }
        .csp-input:focus{border-color:#8B5CF6}

        .csp-footer{display:flex;gap:10px;margin-top:6px}
        .csp-submit{
          flex:1;padding:11px;background:#8B5CF6;color:white;
          border:none;border-radius:8px;font-size:14px;font-weight:600;
          cursor:pointer;transition:background .15s;
        }
        .csp-submit:hover:not(:disabled){background:#7C3AED}
        .csp-submit:disabled{background:#ccc;cursor:not-allowed}
        .csp-cancel{
          flex:1;padding:11px;background:white;color:#555;
          border:1.5px solid #E5E5E0;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;
        }
        .csp-cancel:hover{background:#f8f8f8}

        .csp-done{
          width:100%;padding:11px;background:#B8936D;color:white;
          border:none;border-radius:8px;font-size:14px;font-weight:600;
          cursor:pointer;margin-top:14px;transition:background .15s;
        }
        .csp-done:hover{background:#a07d5a}

        @media(max-width:639px){
          .csp-modal{padding:20px}
          .csp-title{font-size:18px}
          .csp-footer{flex-direction:column}
        }
      `}</style>

      <div className="csp-overlay" onClick={onClose}>
        <div className="csp-modal csp" onClick={e => e.stopPropagation()}>
          <h2 className="csp-title">🔑 Change Staff Password</h2>
          <p className="csp-sub">Set new password for <strong>{staff.full_name || staff.email}</strong></p>

          {error && <div className="csp-error">❌ {error}</div>}

          {success && (
            <div className="csp-success">
              <div className="csp-success-title">✅ Password changed successfully!</div>
              <div className="csp-success-cred">
                <div>📧 Email: {staff.email}</div>
                <div>🔑 New Password: {success}</div>
              </div>
              <p style={{ fontSize: 12, color: '#065F46', margin: '0 0 10px', lineHeight: 1.5 }}>
                Share this securely with the staff member.
              </p>
              <button className="csp-copy-btn" onClick={copyToClipboard}>📋 Copy Password</button>
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit}>
              <button type="button" className="csp-gen-btn" onClick={generatePassword}>
                🎲 Generate Random Password
              </button>
              <div className="csp-field">
                <label className="csp-label">New Password</label>
                <input type="text" required minLength={8} className="csp-input"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} />
              </div>
              <div className="csp-field">
                <label className="csp-label">Confirm Password</label>
                <input type="text" required minLength={8} className="csp-input"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)} />
              </div>
              <div className="csp-footer">
                <button type="submit" disabled={loading} className="csp-submit">
                  {loading ? '⏳ Changing...' : 'Change Password'}
                </button>
                <button type="button" className="csp-cancel" onClick={onClose}>Cancel</button>
              </div>
            </form>
          )}

          {success && (
            <button className="csp-done" onClick={() => window.location.reload()}>Done</button>
          )}
        </div>
      </div>
    </>
  )
}