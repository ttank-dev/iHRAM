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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.')
      setLoading(false)
      return
    }

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
      setError('Failed to create account. Please try again.')
      setLoading(false)
      return
    }

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
      setError('Failed to create agency profile: ' + agencyError.message)
      setLoading(false)
      return
    }

    router.push('/merchant/dashboard')
  }

  const update = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }))

  return (
    <>
      <style>{`
        .ms-page,.ms-page *{box-sizing:border-box}
        .ms-page{
          min-height:100vh;
          background:linear-gradient(135deg,#B8936D 0%,#8B6F47 100%);
          display:flex;align-items:center;justify-content:center;
          padding:24px 16px;
        }
        .ms-card{
          background:white;border-radius:20px;
          width:100%;max-width:500px;
          padding:40px;
          box-shadow:0 20px 60px rgba(0,0,0,.25);
        }

        /* Header */
        .ms-head{text-align:center;margin-bottom:28px}
        .ms-logo{height:52px;filter:brightness(0) saturate(100%) invert(56%) sepia(35%) saturate(643%) hue-rotate(358deg) brightness(95%) contrast(92%);margin-bottom:16px}
        .ms-title{font-size:26px;font-weight:700;color:#2C2C2C;font-family:Georgia,serif;margin:0 0 6px}
        .ms-sub{font-size:14px;color:#888;margin:0}

        /* Error */
        .ms-error{padding:12px 16px;background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;margin-bottom:20px;color:#DC2626;font-size:14px}

        /* Form */
        .ms-form{display:flex;flex-direction:column;gap:16px}
        .ms-label{display:block;font-size:13px;font-weight:600;color:#2C2C2C;margin-bottom:6px}
        .ms-input{
          width:100%;padding:12px 14px;
          border:1.5px solid #E5E5E0;border-radius:8px;
          font-size:15px;outline:none;font-family:inherit;color:#2C2C2C;
          transition:border-color .15s;
        }
        .ms-input:focus{border-color:#B8936D}
        .ms-input:disabled{background:#F8F8F8;color:#aaa}

        /* Submit */
        .ms-btn{
          width:100%;padding:14px;margin-top:4px;
          background:#B8936D;color:white;
          border:none;border-radius:8px;
          font-size:15px;font-weight:700;
          cursor:pointer;transition:background .15s;font-family:inherit;
        }
        .ms-btn:hover:not(:disabled){background:#a07d5a}
        .ms-btn:disabled{background:#ccc;cursor:not-allowed}

        /* Footer */
        .ms-login{text-align:center;font-size:14px;color:#666;margin-top:4px}
        .ms-login a{color:#B8936D;font-weight:600;text-decoration:underline}
        .ms-divider{border:none;border-top:1px solid #E5E5E0;margin:24px 0 20px}
        .ms-back{text-align:center}
        .ms-back a{color:#888;font-size:14px;text-decoration:none}
        .ms-back a:hover{color:#555}

        /* Mobile */
        @media(max-width:480px){
          .ms-card{padding:28px 20px;border-radius:16px}
          .ms-title{font-size:22px}
          .ms-logo{height:44px}
        }
      `}</style>

      <div className="ms-page">
        <div className="ms-card">

          <div className="ms-head">
            <Link href="/"><img src="/logo.png" alt="iHRAM" className="ms-logo" /></Link>
            <h1 className="ms-title">Register Agency</h1>
            <p className="ms-sub">Join iHRAM and start listing your Umrah packages</p>
          </div>

          {error && <div className="ms-error">⚠️ {error}</div>}

          <form className="ms-form" onSubmit={handleSignup}>
            <div>
              <label className="ms-label">Agency Name *</label>
              <input type="text" className="ms-input"
                value={formData.agencyName}
                onChange={e => update('agencyName', e.target.value)}
                placeholder="Your agency name"
                required disabled={loading} />
            </div>

            <div>
              <label className="ms-label">Email Address *</label>
              <input type="email" className="ms-input"
                value={formData.email}
                onChange={e => update('email', e.target.value)}
                placeholder="agency@example.com"
                required disabled={loading} />
            </div>

            <div>
              <label className="ms-label">Phone Number *</label>
              <input type="tel" className="ms-input"
                value={formData.phone}
                onChange={e => update('phone', e.target.value)}
                placeholder="01X-XXX XXXX"
                required disabled={loading} />
            </div>

            <div>
              <label className="ms-label">Password *</label>
              <input type="password" className="ms-input"
                value={formData.password}
                onChange={e => update('password', e.target.value)}
                placeholder="Minimum 6 characters"
                required disabled={loading} />
            </div>

            <div>
              <label className="ms-label">Confirm Password *</label>
              <input type="password" className="ms-input"
                value={formData.confirmPassword}
                onChange={e => update('confirmPassword', e.target.value)}
                placeholder="Re-enter your password"
                required disabled={loading} />
            </div>

            <button type="submit" className="ms-btn" disabled={loading}>
              {loading ? '⏳ Creating account...' : 'Create Account'}
            </button>

            <p className="ms-login">
              Already have an account?{' '}
              <Link href="/merchant/login">Sign in here</Link>
            </p>
          </form>

          <hr className="ms-divider" />
          <div className="ms-back">
            <Link href="/">← Back to Homepage</Link>
          </div>

        </div>
      </div>
    </>
  )
}