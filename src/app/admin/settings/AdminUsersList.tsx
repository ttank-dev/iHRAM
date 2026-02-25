'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import EditAdminModal from './EditAdminModal'
import ChangeAdminPasswordModal from './ChangeAdminPasswordModal'

export default function AdminUsersList({ users, isSuperAdmin = false }: { users: any[], isSuperAdmin?: boolean }) {
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [changingPasswordUser, setChangingPasswordUser] = useState<any>(null)

  const handleDeactivate = async (userId: string, isActive: boolean) => {
    if (!confirm(`${isActive ? 'Deactivate' : 'Activate'} this admin user?`)) return
    setLoading(userId)
    try {
      const { error } = await supabase.from('admin_users').update({ is_active: !isActive }).eq('id', userId)
      if (error) throw error
      alert(`✅ Admin ${isActive ? 'deactivated' : 'activated'} successfully!`)
      window.location.reload()
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`⚠️ DELETE admin user: ${email}?\n\nThis action cannot be undone!`)) return
    const confirmDelete = prompt('Type "DELETE" to confirm:')
    if (confirmDelete !== 'DELETE') return
    setLoading(userId)
    try {
      const { error } = await supabase.from('admin_users').delete().eq('id', userId)
      if (error) throw error
      alert('✅ Admin deleted successfully!')
      window.location.reload()
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(null)
    }
  }

  if (users.length === 0) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', backgroundColor: '#F5F5F0', borderRadius: '12px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>No Admin Users Yet</div>
        <div style={{ fontSize: '14px', color: '#666' }}>Add your first admin user using the form above</div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .aul-title { font-size: 15px; font-weight: 600; color: #2C2C2C; margin-bottom: 16px; }
        .aul-row { padding: 20px; background: #F5F5F0; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .aul-info { display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0; }
        .aul-avatar { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; color: white; font-weight: 600; flex-shrink: 0; }
        .aul-badges { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap; }
        .aul-badge { font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; white-space: nowrap; }
        .aul-name { font-size: 15px; font-weight: 600; color: #2C2C2C; margin-bottom: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .aul-email { font-size: 14px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .aul-date { font-size: 12px; color: #999; margin-top: 4px; }
        .aul-actions { display: flex; gap: 8px; flex-wrap: wrap; flex-shrink: 0; }
        .aul-btn { padding: 8px 16px; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; }
        .aul-view-only { padding: 8px 16px; background: #F5F5F0; border-radius: 6px; font-size: 12px; color: #999; font-style: italic; }

        @media (max-width: 1023px) {
          .aul-row { flex-direction: column; align-items: flex-start; }
          .aul-actions { width: 100%; }
          .aul-btn { flex: 1; text-align: center; }
        }

        @media (max-width: 639px) {
          .aul-avatar { width: 40px; height: 40px; font-size: 16px; }
          .aul-name { font-size: 14px; }
          .aul-email { font-size: 13px; }
          .aul-btn { padding: 8px 10px; font-size: 12px; }
        }
      `}</style>

      <div>
        <div className="aul-title">All Admin Users ({users.length})</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {users.map((user) => (
            <div key={user.id} className="aul-row">
              <div className="aul-info">
                <div className="aul-avatar" style={{ backgroundColor: user.role === 'super_admin' ? '#B8936D' : '#3B82F6' }}>
                  {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="aul-badges">
                    <span className="aul-badge" style={{
                      color: user.role === 'super_admin' ? '#B8936D' : '#3B82F6',
                      backgroundColor: user.role === 'super_admin' ? '#FFF8F0' : '#EFF6FF'
                    }}>
                      {user.role === 'super_admin' ? '👑 SUPER ADMIN' : '🔧 ADMIN'}
                    </span>
                    <span className="aul-badge" style={{
                      color: user.is_active ? '#10B981' : '#999',
                      backgroundColor: user.is_active ? '#ECFDF5' : '#F5F5F0'
                    }}>
                      {user.is_active ? '✓ ACTIVE' : '○ INACTIVE'}
                    </span>
                  </div>
                  <div className="aul-name">{user.full_name || 'No Name'}</div>
                  <div className="aul-email">{user.email}</div>
                  <div className="aul-date">
                    Added {new Date(user.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              <div className="aul-actions">
                {isSuperAdmin ? (
                  <>
                    <button onClick={() => setEditingUser(user)} className="aul-btn" style={{ backgroundColor: '#3B82F6', color: 'white' }}>✏️ Edit Info</button>
                    <button onClick={() => setChangingPasswordUser(user)} className="aul-btn" style={{ backgroundColor: '#8B5CF6', color: 'white' }}>🔑 Password</button>
                    <button onClick={() => handleDeactivate(user.id, user.is_active)} disabled={loading === user.id} className="aul-btn"
                      style={{ backgroundColor: user.is_active ? '#FEF3C7' : '#ECFDF5', color: user.is_active ? '#F59E0B' : '#10B981', cursor: loading === user.id ? 'not-allowed' : 'pointer' }}>
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDelete(user.id, user.email)} disabled={loading === user.id} className="aul-btn"
                      style={{ backgroundColor: '#FEE2E2', color: '#EF4444', cursor: loading === user.id ? 'not-allowed' : 'pointer' }}>
                      Delete
                    </button>
                  </>
                ) : (
                  <div className="aul-view-only">View only</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isSuperAdmin && editingUser && <EditAdminModal user={editingUser} onClose={() => setEditingUser(null)} />}
      {isSuperAdmin && changingPasswordUser && <ChangeAdminPasswordModal user={changingPasswordUser} onClose={() => setChangingPasswordUser(null)} />}
    </>
  )
}