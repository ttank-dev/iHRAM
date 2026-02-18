'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      alert('❌ Sila masukkan email anda')
      return
    }

    setLoading(true)

    try {
      console.log('🔵 Sending password reset email to:', email)
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        console.error('❌ Reset error:', error)
        throw error
      }

      console.log('✅ Password reset email sent')
      setSent(true)
    } catch (error: any) {
      console.error('❌ Error:', error)
      alert(`❌ Ralat: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div style={{
        backgroundColor: '#F5F5F0',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '480px'
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <Link href="/">
              <img 
                src="/logo.png" 
                alt="iHRAM" 
                style={{ 
                  height: '60px', 
                  filter: 'brightness(0) saturate(100%) invert(56%) sepia(35%) saturate(643%) hue-rotate(358deg) brightness(95%) contrast(92%)' 
                }} 
              />
            </Link>
          </div>

          {/* Success Card */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '48px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            textAlign: 'center'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              backgroundColor: '#E8F5E9',
              borderRadius: '50%',
              marginBottom: '24px'
            }}>
              <span style={{ fontSize: '48px' }}>✅</span>
            </div>

            <h2 style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#2C2C2C',
              marginBottom: '16px',
              fontFamily: 'Georgia, serif'
            }}>
              Email Telah Dihantar!
            </h2>

            <p style={{
              fontSize: '16px',
              color: '#666',
              marginBottom: '16px',
              lineHeight: '1.6'
            }}>
              Kami telah menghantar pautan set semula kata laluan ke{' '}
              <strong style={{ color: '#B8936D' }}>{email}</strong>
            </p>

            <p style={{
              fontSize: '14px',
              color: '#999',
              marginBottom: '32px',
              lineHeight: '1.6'
            }}>
              Sila semak email anda dan klik pautan untuk menetapkan kata laluan baharu.
              Pautan ini akan luput dalam masa 1 jam.
            </p>

            <div style={{
              padding: '16px',
              backgroundColor: '#FFF8E1',
              borderRadius: '8px',
              border: '1px solid #FFD54F',
              marginBottom: '24px'
            }}>
              <div style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.6'
              }}>
                💡 Tidak menerima email? Sila semak folder spam atau cuba lagi.
              </div>
            </div>

            <Link
              href="/admin-login"
              style={{
                display: 'inline-block',
                padding: '14px 32px',
                backgroundColor: '#B8936D',
                color: 'white',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}
            >
              Kembali ke Login
            </Link>
          </div>

          {/* Back to Homepage */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Link 
              href="/" 
              style={{ 
                color: '#666', 
                fontSize: '14px', 
                textDecoration: 'none' 
              }}
            >
              ← Kembali ke Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: '#F5F5F0',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/">
            <img 
              src="/logo.png" 
              alt="iHRAM" 
              style={{ 
                height: '60px', 
                filter: 'brightness(0) saturate(100%) invert(56%) sepia(35%) saturate(643%) hue-rotate(358deg) brightness(95%) contrast(92%)' 
              }} 
            />
          </Link>
        </div>

        {/* Forgot Password Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              backgroundColor: '#B8936D',
              borderRadius: '50%',
              marginBottom: '16px'
            }}>
              <span style={{ fontSize: '32px' }}>🔑</span>
            </div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#2C2C2C',
              fontFamily: 'Georgia, serif',
              marginBottom: '8px'
            }}>
              Lupa Kata Laluan?
            </h1>
            <p style={{ fontSize: '16px', color: '#666' }}>
              Masukkan email anda untuk menerima pautan set semula
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleForgotPassword}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2C2C2C',
                marginBottom: '8px'
              }}>
                Alamat Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="anda@email.com"
                required
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  backgroundColor: 'white',
                  border: '1px solid #E5E5E0',
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#2C2C2C',
                  outline: 'none'
                }}
              />
            </div>

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
                marginBottom: '16px',
                transition: 'background-color 0.2s'
              }}
            >
              {loading ? 'Menghantar...' : 'Hantar Pautan Set Semula'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <Link
                href="/admin-login"
                style={{
                  fontSize: '14px',
                  color: '#B8936D',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                ← Kembali ke Login
              </Link>
            </div>
          </form>

          {/* Info Box */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#E3F2FD',
            borderRadius: '8px',
            border: '1px solid #90CAF9'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
              <span style={{ fontSize: '20px' }}>💡</span>
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2C2C2C',
                  marginBottom: '4px'
                }}>
                  Tip
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  Pastikan semak folder spam jika email tidak diterima dalam beberapa minit.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Homepage */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link 
            href="/" 
            style={{ 
              color: '#666', 
              fontSize: '14px', 
              textDecoration: 'none' 
            }}
          >
            ← Kembali ke Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}