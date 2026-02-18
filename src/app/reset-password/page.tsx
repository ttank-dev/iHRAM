'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [validToken, setValidToken] = useState(false)

  useEffect(() => {
    // Check if user came from email link
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setValidToken(true)
      }
    })
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      alert('❌ Kata laluan tidak sepadan!')
      return
    }

    if (password.length < 6) {
      alert('❌ Kata laluan mestilah sekurang-kurangnya 6 aksara')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      alert('✅ Kata laluan berjaya dikemaskini!')
      router.push('/admin-login')
    } catch (error: any) {
      console.error('Error:', error)
      alert(`❌ Ralat: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (!validToken) {
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
          maxWidth: '480px',
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
            width: '64px',
            height: '64px',
            backgroundColor: '#FFF8E1',
            borderRadius: '50%',
            marginBottom: '16px'
          }}>
            <span style={{ fontSize: '32px' }}>⏳</span>
          </div>
          <p style={{ fontSize: '16px', color: '#666' }}>Memuatkan...</p>
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

        {/* Reset Password Card */}
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
              <span style={{ fontSize: '32px' }}>🔐</span>
            </div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#2C2C2C',
              fontFamily: 'Georgia, serif',
              marginBottom: '8px'
            }}>
              Set Kata Laluan Baharu
            </h1>
            <p style={{ fontSize: '16px', color: '#666' }}>
              Masukkan kata laluan baharu anda
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2C2C2C',
                marginBottom: '8px'
              }}>
                Kata Laluan Baharu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata laluan baharu"
                required
                minLength={6}
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

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2C2C2C',
                marginBottom: '8px'
              }}>
                Sahkan Kata Laluan
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Sahkan kata laluan baharu"
                required
                minLength={6}
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
              {loading ? 'Mengemaskini...' : 'Kemas Kini Kata Laluan'}
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
            backgroundColor: '#FFF8E1',
            borderRadius: '8px',
            border: '1px solid #FFD54F'
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
                  Tip Keselamatan
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  Gunakan kombinasi huruf besar, huruf kecil, nombor dan simbol untuk kata laluan yang lebih selamat.
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