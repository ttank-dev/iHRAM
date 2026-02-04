'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword || !confirmPassword) {
      alert('❌ Please fill in both fields')
      return
    }

    if (newPassword.length < 6) {
      alert('❌ Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      alert('❌ Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      alert('✅ Password updated successfully! Redirecting to login...')
      
      // Redirect to login
      setTimeout(() => {
        router.push('/admin-login')
      }, 2000)
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error: ${error.message || 'Failed to update password'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '48px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#B8936D',
            marginBottom: '8px',
            fontFamily: 'Georgia, serif'
          }}>
            iHRAM
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Reset Your Password
          </div>
        </div>

        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '64px' }}>🔐</div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '8px'
            }}>
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #E5E5E0',
                borderRadius: '12px',
                fontSize: '15px',
                backgroundColor: 'white'
              }}
            />
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#666',
              marginBottom: '8px'
            }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              minLength={6}
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #E5E5E0',
                borderRadius: '12px',
                fontSize: '15px',
                backgroundColor: 'white'
              }}
            />
          </div>

          {/* Info */}
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#FFF8F0',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#666',
            marginBottom: '24px'
          }}>
            💡 Password must be at least 6 characters long
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: loading ? '#999' : '#B8936D',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px'
            }}
          >
            {loading ? '⏳ Updating Password...' : '🔐 Update Password'}
          </button>

          {/* Back to Login */}
          <div style={{ textAlign: 'center' }}>
            <Link
              href="/admin-login"
              style={{
                color: '#B8936D',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}