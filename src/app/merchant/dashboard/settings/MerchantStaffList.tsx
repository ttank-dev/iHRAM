'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import EditStaffModal from './EditStaffModal'
import ChangeStaffPasswordModal from './ChangeStaffPasswordModal'

export default function MerchantStaffList({ staff }: { staff: any[] }) {
  const supabase = createClient()
  const [editingStaff, setEditingStaff] = useState<any>(null)
  const [changingPasswordStaff, setChangingPasswordStaff] = useState<any>(null)

  const handleDeactivate = async (staffId: string, currentStatus: boolean) => {
    if (!confirm(`${currentStatus ? 'Deactivate' : 'Activate'} this staff member?`)) return

    const { error } = await supabase
      .from('agency_staff')
      .update({ is_active: !currentStatus })
      .eq('id', staffId)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('✅ Status updated!')
      window.location.reload()
    }
  }

  const handleDelete = async (staffId: string, staffEmail: string) => {
    if (!confirm(`⚠️ DELETE staff member ${staffEmail}?\n\nThis action cannot be undone!`)) return

    const confirmDelete = prompt('Type "DELETE" to confirm:')
    if (confirmDelete !== 'DELETE') return

    try {
      const { error } = await supabase
        .from('agency_staff')
        .delete()
        .eq('id', staffId)

      if (error) throw error

      alert('✅ Staff member deleted!')
      window.location.reload()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  return (
    <>
      <div>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#2C2C2C',
          marginBottom: '16px'
        }}>
          All Staff Members ({staff.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {staff.map((member) => (
            <div
              key={member.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                backgroundColor: '#FAFAFA',
                borderRadius: '12px',
                border: '1px solid #E5E5E0'
              }}
            >
              {/* Staff Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Avatar */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#B8936D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                </div>

                {/* Details */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: member.role === 'owner' ? '#EF4444' : '#B8936D',
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      backgroundColor: member.role === 'owner' ? '#FEE2E2' : '#FFF8F0',
                      borderRadius: '4px'
                    }}>
                      {member.role === 'owner' ? '👑 OWNER' : '👤 STAFF'}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      color: member.is_active ? '#10B981' : '#999',
                      textTransform: 'uppercase',
                      padding: '2px 8px',
                      backgroundColor: member.is_active ? '#ECFDF5' : '#F5F5F0',
                      borderRadius: '4px'
                    }}>
                      {member.is_active ? '✓ ACTIVE' : '○ INACTIVE'}
                    </span>
                  </div>
                  
                  <div style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#2C2C2C',
                    marginBottom: '2px'
                  }}>
                    {member.full_name || 'No Name'}
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {member.email}
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    Added {new Date(member.created_at).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {/* Edit Info */}
                <button
                  onClick={() => setEditingStaff(member)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3B82F6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  ✏️ Edit Info
                </button>

                {/* Change Password */}
                <button
                  onClick={() => setChangingPasswordStaff(member)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#8B5CF6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  🔑 Change Password
                </button>

                {/* Deactivate/Activate */}
                <button
                  onClick={() => handleDeactivate(member.id, member.is_active)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: member.is_active ? '#FEF3C7' : '#ECFDF5',
                    color: member.is_active ? '#F59E0B' : '#10B981',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {member.is_active ? 'Deactivate' : 'Activate'}
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(member.id, member.email)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#FEE2E2',
                    color: '#EF4444',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {staff.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#999'
          }}>
            No staff members yet
          </div>
        )}
      </div>

      {/* Modals */}
      {editingStaff && (
        <EditStaffModal
          staff={editingStaff}
          onClose={() => setEditingStaff(null)}
        />
      )}

      {changingPasswordStaff && (
        <ChangeStaffPasswordModal
          staff={changingPasswordStaff}
          onClose={() => setChangingPasswordStaff(null)}
        />
      )}
    </>
  )
}