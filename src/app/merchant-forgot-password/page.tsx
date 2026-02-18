'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function MerchantForgotPasswordPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/merchant-reset-password`
      })

      if (error) throw error

      setSent(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F5F0',
        padding: '20px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '40px',
          border: '1px solid #E5E5E0',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#ECFDF5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            margin: '0 auto 24px'
          }}>
            ✅
          </div>

          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#2C2C2C',
            marginBottom: '12px'
          }}>
            Email Sent!
          </h1>

          <p style={{
            fontSize: '15px',
            color: '#666',
            lineHeight: '1.6',
            marginBottom: '24px'
          }}>
            We've sent a password reset link to <strong>{email}</strong>
          </p>

          <p style={{
            fontSize: '14px',
            color: '#999',
            marginBottom: '24px'
          }}>
            Check your inbox and click the link to reset your password.
          </p>

          <Link href="/merchant-login">
            <button style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#B8936D',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}>
              Back to Login
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F5F5F0',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '40px',
        border: '1px solid #E5E5E0'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#2C2C2C',
            marginBottom: '8px'
          }}>
            🏢 Agency Password Reset
          </h1>
          <p style={{
            fontSize: '15px',
            color: '#666'
          }}>
            Enter your agency email to receive a reset link
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <p style={{ fontSize: '14px', color: '#DC2626' }}>
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              Agency Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="agency@example.com"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#CCC' : '#B8936D',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '16px'
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>

          <Link href="/merchant/login">
            <button
              type="button"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'white',
                color: '#2C2C2C',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              ← Back to Login
            </button>
          </Link>
        </form>
      </div>
    </div>
  )
}