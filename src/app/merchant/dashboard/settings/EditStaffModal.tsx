'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function EditStaffModal({ staff, onClose }: { staff: any; onClose: () => void }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    fullName: staff.full_name || '',
    email: staff.email,
    role: staff.role
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error: dbError } = await supabase.from('agency_staff')
        .update({ full_name: formData.fullName, email: formData.email, role: formData.role })
        .eq('id', staff.id)
      if (dbError) throw dbError
      alert('✅ Staff info updated!')
      window.location.reload()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .esm-overlay{
          position:fixed;inset:0;background:rgba(0,0,0,.5);
          display:flex;align-items:center;justify-content:center;
          z-index:9999;padding:16px;
        }
        .esm-modal{
          background:white;border-radius:14px;padding:28px;
          max-width:480px;width:100%;
          max-height:90vh;overflow-y:auto;
        }
        .esm,.esm *{box-sizing:border-box}
        .esm-title{font-size:20px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .esm-sub{font-size:13px;color:#666;margin:0 0 20px}
        .esm-error{padding:10px 13px;background:#FEE2E2;border:1px solid #FCA5A5;border-radius:8px;margin-bottom:14px;font-size:13px;color:#DC2626}
        .esm-field{margin-bottom:14px}
        .esm-label{display:block;font-size:13px;font-weight:600;color:#555;margin-bottom:6px}
        .esm-input,.esm-select{
          width:100%;padding:10px 13px;border:1.5px solid #E5E5E0;border-radius:8px;
          font-size:14px;outline:none;font-family:inherit;color:#2C2C2C;background:white;
          transition:border-color .15s;
        }
        .esm-input:focus,.esm-select:focus{border-color:#3B82F6}
        .esm-footer{display:flex;gap:10px;margin-top:20px}
        .esm-save{flex:1;padding:11px;background:#3B82F6;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s}
        .esm-save:hover:not(:disabled){background:#2563EB}
        .esm-save:disabled{background:#ccc;cursor:not-allowed}
        .esm-cancel{flex:1;padding:11px;background:white;color:#555;border:1.5px solid #E5E5E0;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}
        .esm-cancel:hover{background:#f8f8f8}
        @media(max-width:639px){
          .esm-modal{padding:20px}
          .esm-title{font-size:18px}
          .esm-footer{flex-direction:column}
        }
      `}</style>

      <div className="esm-overlay" onClick={onClose}>
        <div className="esm-modal esm" onClick={e => e.stopPropagation()}>
          <h2 className="esm-title">✏️ Edit Staff Info</h2>
          <p className="esm-sub">Update staff member details</p>
          {error && <div className="esm-error">❌ {error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="esm-field">
              <label className="esm-label">Full Name</label>
              <input type="text" required className="esm-input"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
            </div>
            <div className="esm-field">
              <label className="esm-label">Email</label>
              <input type="email" required className="esm-input"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="esm-field">
              <label className="esm-label">Role</label>
              <select className="esm-select"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}>
                <option value="staff">👤 Staff</option>
                <option value="owner">👑 Owner</option>
              </select>
            </div>
            <div className="esm-footer">
              <button type="submit" disabled={loading} className="esm-save">
                {loading ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
              <button type="button" className="esm-cancel" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}