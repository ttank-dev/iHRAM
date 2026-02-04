'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createPortal } from 'react-dom'

export default function ForgotPasswordModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean
  onClose: () => void 
}) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      alert('❌ Please enter your email')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) throw error

      setSent(true)
      alert('✅ Password reset link sent to your email!')
      
      // Reset after 3 seconds
      setTimeout(() => {
        setEmail('')
        setSent(false)
        onClose()
      }, 3000)
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Error: ${error.message || 'Failed to send reset email'}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // Use Portal to render outside the parent form!
  const modalContent = (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔑</div>
          <h2 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#2C2C2C',
            marginBottom: '8px'
          }}>
            Forgot Password?
          </h2>
          <p style={{ fontSize: '15px', color: '#666' }}>
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#666',
                marginBottom: '8px'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your-email@example.com"
                required
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

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: 'transparent',
                  color: '#666',
                  border: '2px solid #E5E5E0',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: loading ? '#999' : '#B8936D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '⏳ Sending...' : '📧 Send Reset Link'}
              </button>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#10B981',
              marginBottom: '8px'
            }}>
              Email Sent!
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              Check your email for the password reset link
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Render using Portal to avoid nested form issue
  return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null
}