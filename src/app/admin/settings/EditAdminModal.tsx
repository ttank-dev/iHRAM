'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function EditAdminModal({ user, onClose }: { user: any; onClose: () => void }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ fullName: user.full_name || '', email: user.email, role: user.role })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const { error: dbError } = await supabase.from('admin_users').update({ full_name: formData.fullName, email: formData.email, role: formData.role }).eq('id', user.id)
      if (dbError) throw dbError
      alert('✅ Admin info updated!')
      window.location.reload()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { width: '100%', padding: '10px 16px', border: '1px solid #E5E5E0', borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block' as const, fontSize: '14px', fontWeight: '600' as const, color: '#2C2C2C', marginBottom: '8px' }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '100%' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>✏️ Edit Admin Info</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>Update admin user details</p>

        {error && <div style={{ padding: '12px', backgroundColor: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', color: '#DC2626' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Role</label>
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px', backgroundColor: loading ? '#CCC' : '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: '12px', backgroundColor: 'white', color: '#2C2C2C', border: '1px solid #E5E5E0', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}