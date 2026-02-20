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
      <div style={{ padding: '60px 40px', textAlign: 'center', backgroundColor: '#F5F5F0', borderRadius: '12px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>No Admin Users Yet</div>
        <div style={{ fontSize: '14px', color: '#666' }}>Add your first admin user using the form above</div>
      </div>
    )
  }

  return (
    <>
      <div>
        <div style={{ fontSize: '15px', fontWeight: '600', color: '#2C2C2C', marginBottom: '16px' }}>
          All Admin Users ({users.length})
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {users.map((user) => (
            <div key={user.id} style={{
              padding: '20px', backgroundColor: '#F5F5F0', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              {/* User Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  backgroundColor: user.role === 'super_admin' ? '#B8936D' : '#3B82F6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', color: 'white', fontWeight: '600'
                }}>
                  {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: '4px',
                      color: user.role === 'super_admin' ? '#B8936D' : '#3B82F6',
                      backgroundColor: user.role === 'super_admin' ? '#FFF8F0' : '#EFF6FF'
                    }}>
                      {user.role === 'super_admin' ? '👑 SUPER ADMIN' : '🔧 ADMIN'}
                    </span>
                    <span style={{
                      fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                      padding: '2px 8px', borderRadius: '4px',
                      color: user.is_active ? '#10B981' : '#999',
                      backgroundColor: user.is_active ? '#ECFDF5' : '#F5F5F0'
                    }}>
                      {user.is_active ? '✓ ACTIVE' : '○ INACTIVE'}
                    </span>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#2C2C2C', marginBottom: '2px' }}>
                    {user.full_name || 'No Name'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>{user.email}</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    Added {new Date(user.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {isSuperAdmin ? (
                  // Super Admin — semua buttons nampak
                  <>
                    <button onClick={() => setEditingUser(user)} style={{
                      padding: '8px 16px', backgroundColor: '#3B82F6', color: 'white',
                      border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600',
                      cursor: 'pointer', whiteSpace: 'nowrap'
                    }}>✏️ Edit Info</button>

                    <button onClick={() => setChangingPasswordUser(user)} style={{
                      padding: '8px 16px', backgroundColor: '#8B5CF6', color: 'white',
                      border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600',
                      cursor: 'pointer', whiteSpace: 'nowrap'
                    }}>🔑 Change Password</button>

                    <button onClick={() => handleDeactivate(user.id, user.is_active)} disabled={loading === user.id} style={{
                      padding: '8px 16px',
                      backgroundColor: user.is_active ? '#FEF3C7' : '#ECFDF5',
                      color: user.is_active ? '#F59E0B' : '#10B981',
                      border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600',
                      cursor: loading === user.id ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap'
                    }}>
                      {user.is_active ? 'Deactivate' : 'Activate'}
                    </button>

                    <button onClick={() => handleDelete(user.id, user.email)} disabled={loading === user.id} style={{
                      padding: '8px 16px', backgroundColor: '#FEE2E2', color: '#EF4444',
                      border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600',
                      cursor: loading === user.id ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap'
                    }}>Delete</button>
                  </>
                ) : (
                  // Regular Admin — view only, no actions
                  <div style={{
                    padding: '8px 16px', backgroundColor: '#F5F5F0', borderRadius: '6px',
                    fontSize: '12px', color: '#999', fontStyle: 'italic'
                  }}>
                    View only
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals — only render if super admin */}
      {isSuperAdmin && editingUser && (
        <EditAdminModal user={editingUser} onClose={() => setEditingUser(null)} />
      )}
      {isSuperAdmin && changingPasswordUser && (
        <ChangeAdminPasswordModal user={changingPasswordUser} onClose={() => setChangingPasswordUser(null)} />
      )}
    </>
  )
}