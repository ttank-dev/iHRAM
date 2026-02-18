'use client'

import { useState } from 'react'
import { supabaseAdmin } from '@/lib/admin'

export default function AddAdminForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('admin')
  const [loading, setLoading] = useState(false)

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!fullName || !email || !role) {
      alert('❌ Please fill all fields')
      return
    }

    setLoading(true)

    try {
      console.log('🔵 Starting admin creation...')
      
      // 1. Send invitation email (creates auth user)
      console.log('🔵 Step 1: Sending invitation email...')
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        email,
        {
          data: {
            full_name: fullName,
            role: role
          }
        }
      )

      if (authError) {
        console.error('❌ Auth error:', authError)
        throw authError
      }
      console.log('✅ Step 1 complete - User created:', authData.user.id)

      // 2. Add to admin_roles
      console.log('🔵 Step 2: Adding to admin_roles...')
      const { error: roleError } = await supabaseAdmin
        .from('admin_roles')
        .insert({
          user_id: authData.user.id,
          role: role,
          is_active: true
        })

      if (roleError) {
        console.error('❌ Role error:', roleError)
        throw roleError
      }
      console.log('✅ Step 2 complete - Role added')

      // 3. Add to admin_users
      console.log('🔵 Step 3: Adding to admin_users...')
      const { error: userError } = await supabaseAdmin
        .from('admin_users')
        .insert({
          user_id: authData.user.id,
          full_name: fullName,
          email: email,
          role: role
        })

      if (userError) {
        console.error('❌ User error:', userError)
        throw userError
      }
      console.log('✅ Step 3 complete - User record added')

      alert('✅ Invitation email sent successfully!')
      
      // Reset form
      setFullName('')
      setEmail('')
      setRole('admin')
      
      // Reload page to show new user
      window.location.reload()
      
    } catch (error: any) {
      console.error('❌ Error creating admin:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#FFF8F0',
      borderRadius: '12px',
      border: '1px solid #F5E5D3'
    }}>
      <h3 style={{
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#2C2C2C',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>➕</span>
        <span>Add New Admin User</span>
      </h3>

      <form onSubmit={handleCreateAdmin}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '16px'
        }}>
          {/* Full Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              Full Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none'
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              Email Address <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ihram.com.my"
              required
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Role */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '8px'
          }}>
            Role <span style={{ color: 'red' }}>*</span>
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #E5E5E0',
              borderRadius: '8px',
              fontSize: '15px',
              outline: 'none',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="admin">🔧 Admin - Content management only</option>
            <option value="super_admin">👑 Super Admin - Full system access</option>
          </select>
        </div>

        {/* Info Box */}
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#E3F2FD',
          borderRadius: '8px',
          border: '1px solid #90CAF9',
          marginBottom: '16px'
        }}>
          <div style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'start'
          }}>
            <span style={{ fontSize: '18px' }}>📧</span>
            <div>
              <div style={{
                fontSize: '13px',
                fontWeight: '600',
                color: '#2C2C2C',
                marginBottom: '4px'
              }}>
                Email Invitation:
              </div>
              <div style={{
                fontSize: '12px',
                color: '#666',
                lineHeight: '1.5'
              }}>
                The user will receive an email with a confirmation link. They must click the link and set their password to activate their account.
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: loading ? '#CCC' : '#B8936D',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {loading ? (
            <>
              <span>⏳</span>
              <span>Sending Invitation...</span>
            </>
          ) : (
            <>
              <span>📧</span>
              <span>Send Invitation Email</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}