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
    } catch (e: any) {
      alert(`❌ Error: ${e.message || 'Failed to change password'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .mpw,.mpw *{box-sizing:border-box}

        /* Collapsed state */
        .mpw-collapsed{
          padding:20px;background:#FFF8F0;border-radius:10px;border:1px solid #F5E5D3;
          display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;
        }
        .mpw-collapsed-label{font-size:15px;font-weight:600;color:#2C2C2C;margin-bottom:2px}
        .mpw-collapsed-sub{font-size:13px;color:#888}
        .mpw-change-btn{
          padding:9px 22px;background:#B8936D;color:white;
          border:none;border-radius:8px;font-size:13px;font-weight:600;
          cursor:pointer;white-space:nowrap;transition:background .15s;flex-shrink:0;
        }
        .mpw-change-btn:hover{background:#a07d5a}

        /* Expanded form */
        .mpw-form-wrap{padding:20px;background:#FFF8F0;border-radius:10px;border:1px solid #F5E5D3}
        .mpw-form-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;flex-wrap:wrap;gap:10px}
        .mpw-form-title{font-size:15px;font-weight:600;color:#2C2C2C}
        .mpw-cancel-btn{
          padding:6px 14px;background:transparent;color:#999;
          border:1px solid #E5E5E0;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;
        }
        .mpw-cancel-btn:hover{background:#f5f5f0}

        .mpw-field{margin-bottom:14px}
        .mpw-label{display:block;font-size:12px;font-weight:600;color:#666;margin-bottom:6px}
        .mpw-input{
          width:100%;padding:11px 13px;border:1.5px solid #E5E5E0;
          border-radius:8px;font-size:14px;background:white;
          outline:none;transition:border-color .15s;font-family:inherit;
        }
        .mpw-input:focus{border-color:#B8936D}

        .mpw-hint{
          padding:11px 14px;background:#E8F4F8;border-radius:8px;
          font-size:12px;color:#555;margin-bottom:14px;line-height:1.6;
        }

        .mpw-submit{
          width:100%;padding:13px;background:#B8936D;color:white;
          border:none;border-radius:8px;font-size:14px;font-weight:600;
          cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;
          transition:background .15s;
        }
        .mpw-submit:hover:not(:disabled){background:#a07d5a}
        .mpw-submit:disabled{background:#999;cursor:not-allowed}

        @media(max-width:639px){
          .mpw-collapsed{flex-direction:column;align-items:stretch;gap:10px}
          .mpw-change-btn{width:100%;text-align:center;padding:11px}
        }
      `}</style>

      {!showForm ? (
        <div className="mpw-collapsed">
          <div>
            <div className="mpw-collapsed-label">🔐 Change Your Password</div>
            <div className="mpw-collapsed-sub">Update your merchant account password</div>
          </div>
          <button className="mpw-change-btn" onClick={() => setShowForm(true)}>
            Change Password
          </button>
        </div>
      ) : (
        <div className="mpw-form-wrap">
          <div className="mpw-form-header">
            <div className="mpw-form-title">🔐 Change Your Password</div>
            <button className="mpw-cancel-btn" type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit} className="mpw">
            <div className="mpw-field">
              <label className="mpw-label">Current Password *</label>
              <input type="password" required className="mpw-input"
                placeholder="Enter your current password"
                value={formData.currentPassword}
                onChange={e => setFormData({ ...formData, currentPassword: e.target.value })} />
            </div>
            <div className="mpw-field">
              <label className="mpw-label">New Password *</label>
              <input type="password" required minLength={6} className="mpw-input"
                placeholder="Min. 6 characters"
                value={formData.newPassword}
                onChange={e => setFormData({ ...formData, newPassword: e.target.value })} />
            </div>
            <div className="mpw-field">
              <label className="mpw-label">Confirm New Password *</label>
              <input type="password" required minLength={6} className="mpw-input"
                placeholder="Re-enter new password"
                value={formData.confirmPassword}
                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} />
            </div>
            <div className="mpw-hint">
              💡 <strong>Password Requirements:</strong><br />
              • Minimum 6 characters<br />
              • Mix of letters and numbers recommended
            </div>
            <button type="submit" disabled={loading} className="mpw-submit">
              {loading ? '⏳ Changing Password...' : '🔐 Change Password'}
            </button>
          </form>
        </div>
      )}
    </>
  )
}