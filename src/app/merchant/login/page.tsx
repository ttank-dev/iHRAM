'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ForgotPasswordModal from '@/components/ForgotPasswordModal'

export default function MerchantLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (data.user) {
        // Check if user is a merchant
        const { data: agency } = await supabase
          .from('agencies')
          .select('is_active')
          .eq('user_id', data.user.id)
          .single()

        if (!agency) {
          setError('Akaun ini bukan akaun merchant')
          await supabase.auth.signOut()
          setLoading(false)
          return
        }

        if (!agency.is_active) {
          setError('Akaun anda telah digantung. Sila hubungi admin.')
          await supabase.auth.signOut()
          setLoading(false)
          return
        }

        router.push('/merchant/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Login gagal. Sila cuba lagi.')
      setLoading(false)
    }
  }

  return (
    <div style={{ backgroundColor: '#F5F5F0', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Link href="/">
            <img src="/logo.png" alt="iHRAM" style={{ height: '60px', filter: 'brightness(0) saturate(100%) invert(56%) sepia(35%) saturate(643%) hue-rotate(358deg) brightness(95%) contrast(92%)' }} />
          </Link>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '48px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px', fontFamily: 'Georgia, serif', textAlign: 'center' }}>
            Merchant Dashboard
          </h1>
          <p style={{ color: '#666', marginBottom: '32px', textAlign: 'center' }}>
            Log masuk untuk mengurus pakej umrah anda
          </p>

          {error && (
            <div style={{ padding: '12px 16px', backgroundColor: '#FEE', border: '1px solid #F88', borderRadius: '8px', marginBottom: '20px', color: '#C33', fontSize: '14px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchant@example.com"
                required
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E5E0', borderRadius: '8px', fontSize: '16px', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ width: '100%', padding: '12px 16px', border: '1px solid #E5E5E0', borderRadius: '8px', fontSize: '16px', outline: 'none' }}
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
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Log Masuk...' : 'Log Masuk'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
  <button
    type="button"
    onClick={() => setShowForgotPassword(true)}
    style={{
      background: 'none',
      border: 'none',
      color: '#B8936D',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      textDecoration: 'underline'
    }}
  >
    Forgot Password?
  </button>
</div>

{/* ADD MODAL */}
<ForgotPasswordModal 
  isOpen={showForgotPassword}
  onClose={() => setShowForgotPassword(false)}
/>
          </form>

          <p style={{ 
  textAlign: 'center', 
  color: '#666', 
  fontSize: '14px', 
  marginTop: '24px',
  position: 'relative',
  zIndex: 100
}}>
  Belum ada akaun?{' '}
  <Link 
    href="/merchant/signup" 
    style={{ 
      color: '#B8936D', 
      textDecoration: 'underline', 
      fontWeight: '600',
      cursor: 'pointer',
      display: 'inline-block'
    }}
  >
    Daftar sebagai agensi
  </Link>
</p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Link href="/" style={{ color: '#666', fontSize: '14px', textDecoration: 'none' }}>
            ← Kembali ke Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
