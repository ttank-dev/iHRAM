'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import EditStaffModal from './EditStaffModal'
import ChangeStaffPasswordModal from './ChangeStaffPasswordModal'

export default function MerchantStaffList({ staff }: { staff: any[] }) {
  const supabase = createClient()
  const [editingStaff, setEditingStaff] = useState<any>(null)
  const [changingPasswordStaff, setChangingPasswordStaff] = useState<any>(null)

  const handleDeactivate = async (staffId: string, current: boolean) => {
    if (!confirm(`${current ? 'Deactivate' : 'Activate'} this staff member?`)) return
    const { error } = await supabase.from('agency_staff').update({ is_active: !current }).eq('id', staffId)
    if (error) alert('Error: ' + error.message)
    else { alert('✅ Status updated!'); window.location.reload() }
  }

  const handleDelete = async (staffId: string, email: string) => {
    if (!confirm(`⚠️ DELETE staff member ${email}?\n\nThis cannot be undone!`)) return
    const confirm2 = prompt('Type "DELETE" to confirm:')
    if (confirm2 !== 'DELETE') return
    const { error } = await supabase.from('agency_staff').delete().eq('id', staffId)
    if (error) alert('Error: ' + error.message)
    else { alert('✅ Staff member deleted!'); window.location.reload() }
  }

  return (
    <>
      <style>{`
        .sl,.sl *{box-sizing:border-box}
        .sl-heading{font-size:15px;font-weight:700;color:#2C2C2C;margin:0 0 14px}
        .sl-list{display:flex;flex-direction:column;gap:10px}
        .sl-empty{text-align:center;padding:32px;color:#aaa;font-size:14px}

        /* Card */
        .sl-card{
          display:flex;align-items:center;justify-content:space-between;gap:14px;
          padding:18px;background:#FAFAFA;border-radius:10px;border:1px solid #E5E5E0;
          flex-wrap:wrap;
        }

        /* Avatar + info */
        .sl-left{display:flex;align-items:center;gap:14px;min-width:0;flex:1}
        .sl-avatar{
          width:44px;height:44px;border-radius:50%;background:#B8936D;
          display:flex;align-items:center;justify-content:center;
          font-size:18px;color:white;font-weight:700;flex-shrink:0;
        }
        .sl-info{min-width:0}
        .sl-badges{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:4px}
        .sl-badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;text-transform:uppercase}
        .sl-badge-owner{background:#FEE2E2;color:#EF4444}
        .sl-badge-staff{background:#FFF8F0;color:#B8936D}
        .sl-badge-active{background:#ECFDF5;color:#10B981}
        .sl-badge-inactive{background:#F5F5F0;color:#999}
        .sl-name{font-size:14px;font-weight:600;color:#2C2C2C;margin-bottom:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .sl-email{font-size:13px;color:#666;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .sl-date{font-size:11px;color:#aaa;margin-top:3px}

        /* Action buttons — 2x2 grid on all sizes */
        .sl-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;flex-shrink:0}
        .sl-btn{
          padding:7px 10px;border:none;border-radius:6px;
          font-size:12px;font-weight:600;cursor:pointer;
          white-space:nowrap;transition:filter .15s;
          display:flex;align-items:center;justify-content:center;gap:3px;
          font-family:inherit;
        }
        .sl-btn:hover{filter:brightness(.92)}
        .sl-btn-blue  {background:#EFF6FF;color:#2563EB}
        .sl-btn-purple{background:#F5F3FF;color:#7C3AED}
        .sl-btn-amber {background:#FFFBEB;color:#D97706}
        .sl-btn-green {background:#ECFDF5;color:#059669}
        .sl-btn-red   {background:#FEE2E2;color:#DC2626}

        /* Mobile: card stacks, actions go below */
        @media(max-width:639px){
          .sl-card{flex-direction:column;align-items:stretch;gap:12px}
          .sl-left{gap:12px}
          .sl-actions{grid-template-columns:1fr 1fr;width:100%}
          .sl-btn{padding:9px 8px;font-size:12px}
        }

        @media(max-width:380px){
          .sl-actions{grid-template-columns:1fr 1fr}
          .sl-badge{font-size:9px;padding:2px 6px}
        }
      `}</style>

      <div className="sl">
        <div className="sl-heading">All Staff Members ({staff.length})</div>

        {staff.length === 0 ? (
          <div className="sl-empty">No staff members yet</div>
        ) : (
          <div className="sl-list">
            {staff.map(member => (
              <div key={member.id} className="sl-card">
                {/* Left: avatar + info */}
                <div className="sl-left">
                  <div className="sl-avatar">
                    {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="sl-info">
                    <div className="sl-badges">
                      <span className={`sl-badge ${member.role === 'owner' ? 'sl-badge-owner' : 'sl-badge-staff'}`}>
                        {member.role === 'owner' ? '👑 Owner' : '👤 Staff'}
                      </span>
                      <span className={`sl-badge ${member.is_active ? 'sl-badge-active' : 'sl-badge-inactive'}`}>
                        {member.is_active ? '✓ Active' : '○ Inactive'}
                      </span>
                    </div>
                    <div className="sl-name">{member.full_name || 'No Name'}</div>
                    <div className="sl-email">{member.email}</div>
                    <div className="sl-date">
                      Added {new Date(member.created_at).toLocaleDateString('en-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Right: actions in 2×2 grid */}
                <div className="sl-actions">
                  <button className="sl-btn sl-btn-blue" onClick={() => setEditingStaff(member)}>
                    ✏️ Edit
                  </button>
                  <button className="sl-btn sl-btn-purple" onClick={() => setChangingPasswordStaff(member)}>
                    🔑 Password
                  </button>
                  <button
                    className={`sl-btn ${member.is_active ? 'sl-btn-amber' : 'sl-btn-green'}`}
                    onClick={() => handleDeactivate(member.id, member.is_active)}>
                    {member.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="sl-btn sl-btn-red" onClick={() => handleDelete(member.id, member.email)}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingStaff && <EditStaffModal staff={editingStaff} onClose={() => setEditingStaff(null)} />}
      {changingPasswordStaff && <ChangeStaffPasswordModal staff={changingPasswordStaff} onClose={() => setChangingPasswordStaff(null)} />}
    </>
  )
}