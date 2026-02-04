'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MerchantSignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agencyName: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate
    if (formData.password !== formData.confirmPassword) {
      setError('Kata laluan tidak sepadan')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Kata laluan mestilah sekurang-kurangnya 6 aksara')
      setLoading(false)
      return
    }

    // Create account
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!authData.user) {
      setError('Gagal membuat akaun')
      setLoading(false)
      return
    }

    // Create agency profile
    const slug = formData.agencyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const { error: agencyError } = await supabase
      .from('agencies')
      .insert({
        user_id: authData.user.id,
        name: formData.agencyName,
        slug: slug,
        phone: formData.phone,
        email: formData.email,
        is_active: true,
        is_verified: false
      })

    if (agencyError) {
      setError('Gagal membuat profil agensi: ' + agencyError.message)
      setLoading(false)
      return
    }

    // Success - redirect to dashboard
    router.push('/merchant/dashboard')
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px'
    }}>
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '24px',
        padding: '60px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img 
            src="/logo.png" 
            alt="iHRAM" 
            style={{ 
              height: '60px',
              filter: 'brightness(0) saturate(100%) invert(56%) sepia(35%) saturate(643%) hue-rotate(358deg) brightness(95%) contrast(92%)'
            }} 
          />
          <h1 style={{ 
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#2C2C2C',
            marginTop: '20px',
            marginBottom: '8px'
          }}>
            Daftar Agensi
          </h1>
          <p style={{ fontSize: '15px', color: '#666' }}>
            Sertai iHRAM dan mulakan perjalanan anda
          </p>
        </div>

        {error && (
          <div style={{ 
            padding: '16px',
            backgroundColor: '#FEE',
            border: '1px solid #FCC',
            borderRadius: '8px',
            marginBottom: '24px',
            color: '#C33',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              Nama Agensi *
            </label>
            <input 
              type="text"
              value={formData.agencyName}
              onChange={(e) => setFormData({...formData, agencyName: e.target.value})}
              placeholder="Nama agensi anda"
              required
              style={{ 
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                border: '2px solid #E5E5E0',
                borderRadius: '10px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              Email *
            </label>
            <input 
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="agensi@example.com"
              required
              style={{ 
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                border: '2px solid #E5E5E0',
                borderRadius: '10px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              No. Telefon *
            </label>
            <input 
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="01X-XXX XXXX"
              required
              style={{ 
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                border: '2px solid #E5E5E0',
                borderRadius: '10px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              Kata Laluan *
            </label>
            <input 
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Minimum 6 aksara"
              required
              style={{ 
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                border: '2px solid #E5E5E0',
                borderRadius: '10px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginBottom: '32px' }}>
            <label style={{ 
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              Sahkan Kata Laluan *
            </label>
            <input 
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              placeholder="Taip semula kata laluan"
              required
              style={{ 
                width: '100%',
                padding: '14px 16px',
                fontSize: '15px',
                border: '2px solid #E5E5E0',
                borderRadius: '10px',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <button 
  type="submit"
  disabled={loading}
  style={{ 
    width: '100%',
    padding: '16px',
    backgroundColor: '#B8936D',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginBottom: '16px',
    opacity: loading ? 0.7 : 1,
    pointerEvents: loading ? 'none' : 'auto'
  }}
>
  {loading ? 'Sedang Mendaftar...' : 'Daftar Sekarang'}
</button>

<div style={{ 
  textAlign: 'center', 
  fontSize: '14px', 
  color: '#666',
  marginBottom: '0',
  position: 'relative',
  zIndex: 100
}}>
  Sudah ada akaun?{' '}
  <Link 
    href="/merchant/login" 
    style={{ 
      color: '#B8936D', 
      fontWeight: '600', 
      textDecoration: 'underline',
      cursor: 'pointer',
      display: 'inline-block'
    }}
  >
    Log masuk di sini
  </Link>
</div>
        </form>

        <div style={{ 
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid #E5E5E0',
          textAlign: 'center'
        }}>
          <Link 
            href="/"
            style={{ 
              color: '#666',
              fontSize: '14px',
              textDecoration: 'none',
              fontWeight: '600'
            }}
          >
            ← Kembali ke Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}