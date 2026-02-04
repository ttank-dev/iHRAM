'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MerchantStaffList({ staff }: { staff: any[] }) {
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)

  const handleToggleActive = async (staffId: string, isActive: boolean) => {
    if (!confirm(`${isActive ? 'Deactivate' : 'Activate'} this staff member?`)) return

    setLoading(staffId)
    try {
      const { error } = await supabase
        .from('merchant_staff')
        .update({ is_active: !isActive })
        .eq('id', staffId)

      if (error) throw error

      alert(`✅ Staff ${isActive ? 'deactivated' : 'activated'} successfully!`)
      window.location.reload()
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (staffId: string, email: string) => {
    if (!confirm(`Remove staff member: ${email}?\n\nThis action cannot be undone!`)) return

    setLoading(staffId)
    try {
      const { error } = await supabase
        .from('merchant_staff')
        .delete()
        .eq('id', staffId)

      if (error) throw error

      alert('✅ Staff member removed successfully!')
      window.location.reload()
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(null)
    }
  }

  if (staff.length === 0) {
    return (
      <div style={{
        padding: '60px 40px',
        textAlign: 'center',
        backgroundColor: '#F5F5F0',
        borderRadius: '12px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
        <div style={{ fontSize: '18px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
          No Staff Members Yet
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>
          Add your first staff member using the form above
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
        All Staff Members ({staff.length})
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {staff.map((member) => (
          <div
            key={member.id}
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
              backgroundColor: member.role === 'manager' ? '#B8936D' : '#3B82F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0
            }}>
              {member.role === 'manager' ? '👨‍💼' : '👤'}
            </div>

            {/* Staff Info */}
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
                  {member.name}
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  backgroundColor: member.role === 'manager' ? '#FFF8F0' : '#EFF6FF',
                  color: member.role === 'manager' ? '#B8936D' : '#3B82F6'
                }}>
                  {member.role === 'manager' ? 'MANAGER' : 'STAFF'}
                </span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '700',
                  backgroundColor: member.is_active ? '#ECFDF5' : '#FEE2E2',
                  color: member.is_active ? '#10B981' : '#EF4444'
                }}>
                  {member.is_active ? '✓ ACTIVE' : '✗ INACTIVE'}
                </span>
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666'
              }}>
                {member.email}
              </div>
              <div style={{
                fontSize: '12px',
                color: '#999',
                marginTop: '4px'
              }}>
                Added {new Date(member.created_at).toLocaleDateString('ms-MY', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                })}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleToggleActive(member.id, member.is_active)}
                disabled={loading === member.id}
                style={{
                  padding: '8px 16px',
                  backgroundColor: member.is_active ? '#FEF3C7' : '#ECFDF5',
                  color: member.is_active ? '#F59E0B' : '#10B981',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading === member.id ? 'not-allowed' : 'pointer',
                  opacity: loading === member.id ? 0.5 : 1
                }}
              >
                {loading === member.id ? '...' : member.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleDelete(member.id, member.email)}
                disabled={loading === member.id}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#FEE2E2',
                  color: '#EF4444',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: loading === member.id ? 'not-allowed' : 'pointer',
                  opacity: loading === member.id ? 0.5 : 1
                }}
              >
                {loading === member.id ? '...' : 'Remove'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}