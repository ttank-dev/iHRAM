'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AddAdminFormDirect() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'admin'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.email || !formData.name) {
      alert('❌ Please fill in all required fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('❌ Please enter a valid email address')
      return
    }

    if (!confirm(`Add new ${formData.role === 'super_admin' ? 'Super Admin' : 'Admin'}: ${formData.email}?\n\nAn invitation email will be sent to this address.`)) {
      return
    }

    setLoading(true)
    try {
      console.log('🔐 Checking for existing admin...')

      // Check if email already exists in admin_users
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('email')
        .eq('email', formData.email)
        .maybeSingle()

      if (existingAdmin) {
        throw new Error('Admin user with this email already exists')
      }

      console.log('📧 Creating auth user with email invitation...')

      // Generate a secure random password (user will reset via email)
      const tempPassword = Math.random().toString(36).slice(-12) + 
                          Math.random().toString(36).slice(-12) + 
                          'Aa1!'

      console.log('Temp password generated, calling signUp...')

      // Create auth user with email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          data: {
            name: formData.name,
            role: 'admin'
          },
          emailRedirectTo: `${window.location.origin}/admin-login`
        }
      })

      console.log('SignUp result:', { authData, authError })

      if (authError) {
        throw new Error(`Failed to create user: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('No user returned from signup')
      }

      console.log('✅ Auth user created:', authData.user.id)
      console.log('📝 Adding to admin_users table...')

      // Add to admin_users table
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          id: authData.user.id,
          email: formData.email,
          name: formData.name,
          role: formData.role,
          is_active: true
        })

      if (insertError) {
        console.error('Insert error:', insertError)
        throw new Error(`Failed to add to admin_users: ${insertError.message}`)
      }

      console.log('✅ Admin user created successfully!')
      
      alert(`✅ Success!\n\nInvitation email sent to ${formData.email}\n\nThe user will receive an email to confirm and set their password.`)
      
      // Reset form
      setFormData({
        email: '',
        name: '',
        role: 'admin'
      })

      // Reload page to show new user
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
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
      <div style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#2C2C2C',
        marginBottom: '20px'
      }}>
        ➕ Add New Admin User
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px',
          marginBottom: '16px'
        }}>
          {/* Name */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '8px'
            }}>
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="John Doe"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '8px'
            }}>
              Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="admin@ihram.com.my"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            />
          </div>

          {/* Role */}
          <div style={{ gridColumn: 'span 2' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '8px'
            }}>
              Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="admin">🔧 Admin - Content management only</option>
              <option value="super_admin">👑 Super Admin - Full access including user management</option>
            </select>
          </div>
        </div>

        {/* Info Box */}
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#E8F4F8',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#666',
          marginBottom: '16px',
          lineHeight: '1.5'
        }}>
          💡 <strong>Email Invitation:</strong><br/>
          The user will receive an email with a confirmation link. They must click the link and set their password to activate their account.
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: loading ? '#999' : '#B8936D',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {loading ? '⏳ Sending Invitation...' : '📧 Send Invitation Email'}
        </button>
      </form>
    </div>
  )
}