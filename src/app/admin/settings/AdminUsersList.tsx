'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminUsersList({ users }: { users: any[] }) {
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)

  const handleDeactivate = async (userId: string, isActive: boolean) => {
    if (!confirm(`${isActive ? 'Deactivate' : 'Activate'} this admin user?`)) return

    setLoading(userId)
    try {
      const { error } = await supabase
        .from('admin_users')
        .update({ is_active: !isActive })
        .eq('id', userId)

      if (error) throw error

      alert(`✅ Admin ${isActive ? 'deactivated' : 'activated'} successfully!`)
      window.location.reload()
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (userId: string, email: string) => {
    if (!confirm(`Delete admin user: ${email}?\n\nThis action cannot be undone!`)) return

    setLoading(userId)
    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', userId)

      if (error) throw error

      alert('✅ Admin deleted successfully!')
      window.location.reload()
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(null)
    }
  }

  if (users.length === 0) {
    return (
      <div style={{
        padding: '60px 40px',
        textAlign: 'center',
        backgroundColor: '#F5F5F0',
        borderRadius: '12px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
          No Admin Users Yet
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Add your first admin user using the form above
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{
        fontSize: '15px',
        fontWeight: '600',
        color: '#2C2C2C',
        marginBottom: '16px'
      }}>
        All Admin Users ({users.length})
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {users.map((user) => (
          <div
            key={user.id}
            style={{
              padding: '20px',
              backgroundColor: '#F5F5F0',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}
          >
            {/* Avatar */}
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: user.role === 'super_admin' ? '#B8936D' : '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0
            }}>
              {user.role === 'super_admin' ? '👑' : '🔧'}
            </div>

            {/* User Info */}
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '4px'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#2C2C2C'
                }}>
                  {user.name}
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  backgroundColor: user.role === 'super_admin' ? '#FFF8F0' : '#EFF6FF',
                  color: user.role === 'super_admin' ? '#B8936D' : '#3B82F6'
                }}>
                  {user.role === 'super_admin' ? 'SUPER ADMIN' : 'ADMIN'}
                </span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  backgroundColor: user.is_active ? '#ECFDF5' : '#FEE2E2',
                  color: user.is_active ? '#10B981' : '#EF4444'
                }}>
                  {user.is_active ? '✓ ACTIVE' : '✗ INACTIVE'}
                </span>
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666'
              }}>
                {user.email}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#999',
                marginTop: '4px'
              }}>
                Added {new Date(user.created_at).toLocaleDateString('ms-MY', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleDeactivate(user.id, user.is_active)}
                disabled={loading === user.id}
                style={{
                  padding: '8px 16px',
                  backgroundColor: user.is_active ? '#FEF3C7' : '#ECFDF5',
                  color: user.is_active ? '#F59E0B' : '#10B981',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading === user.id ? 'not-allowed' : 'pointer',
                  opacity: loading === user.id ? 0.5 : 1
                }}
              >
                {loading === user.id ? '...' : user.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleDelete(user.id, user.email)}
                disabled={loading === user.id}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#FEE2E2',
                  color: '#EF4444',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading === user.id ? 'not-allowed' : 'pointer',
                  opacity: loading === user.id ? 0.5 : 1
                }}
              >
                {loading === user.id ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}