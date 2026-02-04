'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AddStaffFormWithInvite() {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [currentAgency, setCurrentAgency] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff'
  })

  // Get current agency on mount
  useEffect(() => {
    async function getAgency() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: agency } = await supabase
          .from('agencies')
          .select('id, name')
          .eq('user_id', user.id)
          .single()
        
        if (agency) {
          setCurrentAgency(agency)
        }
      }
    }
    
    getAgency()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email) {
      alert('❌ Please fill in all required fields')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      alert('❌ Please enter a valid email address')
      return
    }

    if (!currentAgency) {
      alert('❌ No agency found. Please refresh and try again.')
      return
    }

    if (!confirm(`Add new staff member: ${formData.name} (${formData.email})?\n\nAn invitation email will be sent to this address.`)) {
      return
    }

    setLoading(true)
    try {
      console.log('📧 Creating staff with email invitation...')

      // Check if email already exists in merchant_staff
      const { data: existingStaff } = await supabase
        .from('merchant_staff')
        .select('email')
        .eq('email', formData.email)
        .maybeSingle()

      if (existingStaff) {
        throw new Error('Staff member with this email already exists')
      }

      console.log('Generating temporary password...')
      // Generate a secure random password (user will reset via email)
      const tempPassword = Math.random().toString(36).slice(-12) + 
                          Math.random().toString(36).slice(-12) + 
                          'Aa1!'

      console.log('Creating auth user with email invitation...')
      // Create auth user with email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          data: {
            name: formData.name,
            role: 'merchant_staff'
          },
          emailRedirectTo: `${window.location.origin}/merchant/login`
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
      console.log('📝 Adding to merchant_staff table...')

      // Add to merchant_staff table
      const { error: insertError } = await supabase
        .from('merchant_staff')
        .insert({
          id: authData.user.id,
          agency_id: currentAgency.id,
          email: formData.email,
          name: formData.name,
          role: formData.role,
          is_active: true
        })

      if (insertError) {
        console.error('Insert error:', insertError)
        throw new Error(`Failed to add to staff table: ${insertError.message}`)
      }

      console.log('✅ Staff member created successfully!')
      
      alert(`✅ Success!\n\nInvitation email sent to ${formData.email}\n\nThe user will receive an email to confirm and set their password.`)
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        role: 'staff'
      })

      // Reload page to show new staff
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error: any) {
      console.error('❌ Error creating staff:', error)
      alert(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!currentAgency) {
    return (
      <div style={{
        padding: '24px',
        backgroundColor: '#FFF8F0',
        borderRadius: '12px',
        border: '1px solid #F5E5D3',
        marginBottom: '24px',
        textAlign: 'center',
        color: '#666'
      }}>
        ⏳ Loading agency info...
      </div>
    )
  }

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#FFF8F0',
      borderRadius: '12px',
      border: '1px solid #F5E5D3',
      marginBottom: '24px'
    }}>
      <div style={{
        fontSize: '16px',
        fontWeight: '600',
        color: '#2C2C2C',
        marginBottom: '20px'
      }}>
        ➕ Add Staff Member
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
              placeholder="Ahmad bin Ali"
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
              placeholder="staff@example.com"
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
              <option value="staff">👤 Staff - View only, help with inquiries</option>
              <option value="manager">👨‍💼 Manager - Can manage packages, news, reels</option>
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
          The staff member will receive an email with a confirmation link. They must click the link and set their password to activate their account.
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