'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MerchantLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('🔵 Starting merchant login for:', email)
      
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('❌ Auth error:', signInError)
        throw signInError
      }

      console.log('✅ Auth success! User ID:', data.user?.id)

      if (data.user) {
        console.log('🔍 Checking agency_staff table...')
        
        // Check agency_staff table first (for staff members)
        const { data: staffMember, error: staffError } = await supabase
          .from('agency_staff')
          .select('*, agencies(name)')
          .eq('id', data.user.id)
          .single()

        console.log('📊 Staff query result:', staffMember)
        console.log('📊 Staff query error:', staffError)

        if (staffMember) {
          if (!staffMember.is_active) {
            console.error('❌ Staff account is inactive')
            setError('Your account is inactive.')
            await supabase.auth.signOut()
            setLoading(false)
            return
          }

          console.log('✅ Staff member found! Redirecting to /merchant/dashboard')
          router.push('/merchant/dashboard')
          router.refresh()
          return
        }

        console.log('🔍 Not in agency_staff, checking agencies table...')

        // If not in agency_staff, check agencies table (old owners)
        const { data: agency, error: agencyError } = await supabase
          .from('agencies')
          .select('*')
          .eq('user_id', data.user.id)
          .single()

        console.log('📊 Agency query result:', agency)
        console.log('📊 Agency query error:', agencyError)

        if (!agency) {
          console.error('❌ User not found in agency_staff or agencies')
          setError('This account is not a merchant account.')
          await supabase.auth.signOut()
          setLoading(false)
          return
        }

        if (!agency.is_active) {
          console.error('❌ Agency account is inactive')
          setError('Your agency account is inactive.')
          await supabase.auth.signOut()
          setLoading(false)
          return
        }

        console.log('✅ Agency owner found! Redirecting to /merchant/dashboard')
        router.push('/merchant/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      console.error('❌ Login error:', err)
      setError(err.message || 'Login failed. Please try again.')
      setLoading(false)
    }
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
      <div style={{ width: '100%', maxWidth: '480px' }}>
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

        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '16px', 
          padding: '48px', 
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)' 
        }}>
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
              <span style={{ fontSize: '32px' }}>🏢</span>
            </div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#2C2C2C', 
              fontFamily: 'Georgia, serif' 
            }}>
              Merchant Dashboard
            </h1>
            <p style={{ color: '#666' }}>
              Log masuk untuk mengurus pakej umrah anda
            </p>
          </div>

          {error && (
            <div style={{ 
              padding: '12px 16px', 
              backgroundColor: '#FEE', 
              border: '1px solid #F88', 
              borderRadius: '8px', 
              marginBottom: '20px', 
              color: '#C33', 
              fontSize: '14px' 
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#2C2C2C', 
                marginBottom: '8px' 
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agency@example.com"
                required
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  border: '1px solid #E5E5E0', 
                  borderRadius: '8px', 
                  fontSize: '16px', 
                  outline: 'none' 
                }}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#2C2C2C', 
                marginBottom: '8px' 
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  border: '1px solid #E5E5E0', 
                  borderRadius: '8px', 
                  fontSize: '16px', 
                  outline: 'none' 
                }}
              />
            </div>

            <div style={{ textAlign: 'right', marginTop: '-8px' }}>
              <Link
                href="/merchant-forgot-password"
                style={{
                  fontSize: '14px',
                  color: '#B8936D',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                Lupa password?
              </Link>
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
                transition: 'background-color 0.2s'
              }}
            >
              {loading ? 'Log Masuk...' : 'Log Masuk'}
            </button>
          </form>

          {/* Signup Link */}
          <p style={{ 
            textAlign: 'center', 
            color: '#666', 
            fontSize: '14px', 
            marginTop: '24px'
          }}>
            Belum ada akaun?{' '}
            <Link 
              href="/merchant/signup" 
              style={{ 
                color: '#B8936D', 
                textDecoration: 'underline', 
                fontWeight: '600'
              }}
            >
              Daftar sebagai agensi
            </Link>
          </p>
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