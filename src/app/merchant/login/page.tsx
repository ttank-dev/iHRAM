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
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) throw signInError

      if (data.user) {
        const { data: staffMember } = await supabase
          .from('agency_staff')
          .select('*, agencies(name)')
          .eq('id', data.user.id)
          .single()

        if (staffMember) {
          if (!staffMember.is_active) {
            setError('Your account is inactive. Please contact your agency admin.')
            await supabase.auth.signOut()
            setLoading(false)
            return
          }
          router.push('/merchant/dashboard')
          router.refresh()
          return
        }

        const { data: agency } = await supabase
          .from('agencies')
          .select('*')
          .eq('user_id', data.user.id)
          .single()

        if (!agency) {
          setError('This account is not registered as a merchant.')
          await supabase.auth.signOut()
          setLoading(false)
          return
        }

        if (!agency.is_active) {
          setError('Your agency account is inactive. Please contact support.')
          await supabase.auth.signOut()
          setLoading(false)
          return
        }

        router.push('/merchant/dashboard')
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .ml-page,.ml-page *{box-sizing:border-box}
        .ml-page{
          min-height:100vh;background:#F5F5F0;
          display:flex;align-items:center;justify-content:center;
          padding:24px 16px;
        }
        .ml-wrap{width:100%;max-width:460px}

        /* Logo */
        .ml-logo{text-align:center;margin-bottom:32px}
        .ml-logo img{height:56px;filter:brightness(0) saturate(100%) invert(56%) sepia(35%) saturate(643%) hue-rotate(358deg) brightness(95%) contrast(92%)}

        /* Card */
        .ml-card{background:white;border-radius:16px;padding:40px;box-shadow:0 8px 32px rgba(0,0,0,.10)}

        /* Card header */
        .ml-card-head{text-align:center;margin-bottom:28px}
        .ml-icon{
          display:inline-flex;align-items:center;justify-content:center;
          width:60px;height:60px;background:#B8936D;border-radius:50%;
          font-size:28px;margin-bottom:14px;
        }
        .ml-card-title{font-size:26px;font-weight:700;color:#2C2C2C;font-family:Georgia,serif;margin:0 0 6px}
        .ml-card-sub{font-size:14px;color:#888;margin:0}

        /* Error */
        .ml-error{padding:12px 16px;background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;margin-bottom:20px;color:#DC2626;font-size:14px}

        /* Form */
        .ml-form{display:flex;flex-direction:column;gap:18px}
        .ml-label{display:block;font-size:13px;font-weight:600;color:#2C2C2C;margin-bottom:6px}
        .ml-input{
          width:100%;padding:12px 14px;
          border:1.5px solid #E5E5E0;border-radius:8px;
          font-size:15px;outline:none;font-family:inherit;color:#2C2C2C;
          transition:border-color .15s;
        }
        .ml-input:focus{border-color:#B8936D}
        .ml-input:disabled{background:#F8F8F8;color:#aaa}
        .ml-forgot{text-align:right;margin-top:-6px}
        .ml-forgot a{font-size:13px;color:#B8936D;text-decoration:none;font-weight:600}
        .ml-forgot a:hover{text-decoration:underline}

        /* Submit */
        .ml-btn{
          width:100%;padding:14px;
          background:#B8936D;color:white;
          border:none;border-radius:8px;
          font-size:15px;font-weight:700;
          cursor:pointer;transition:background .15s;
          font-family:inherit;
        }
        .ml-btn:hover:not(:disabled){background:#a07d5a}
        .ml-btn:disabled{background:#ccc;cursor:not-allowed}

        /* Footer links */
        .ml-signup{text-align:center;color:#666;font-size:14px;margin-top:20px}
        .ml-signup a{color:#B8936D;text-decoration:underline;font-weight:600}
        .ml-back{text-align:center;margin-top:20px}
        .ml-back a{color:#888;font-size:14px;text-decoration:none}
        .ml-back a:hover{color:#555}

        /* Mobile */
        @media(max-width:480px){
          .ml-card{padding:28px 20px;border-radius:14px}
          .ml-card-title{font-size:22px}
          .ml-icon{width:52px;height:52px;font-size:24px}
          .ml-logo img{height:48px}
          .ml-logo{margin-bottom:24px}
        }
      `}</style>

      <div className="ml-page">
        <div className="ml-wrap">

          <div className="ml-logo">
            <Link href="/">
              <img src="/logo.png" alt="iHRAM" />
            </Link>
          </div>

          <div className="ml-card">
            <div className="ml-card-head">
              <div className="ml-icon">🏢</div>
              <h1 className="ml-card-title">Merchant Dashboard</h1>
              <p className="ml-card-sub">Sign in to manage your Umrah packages</p>
            </div>

            {error && <div className="ml-error">⚠️ {error}</div>}

            <form className="ml-form" onSubmit={handleLogin}>
              <div>
                <label className="ml-label">Email Address</label>
                <input
                  type="email"
                  className="ml-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="agency@example.com"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="ml-label">Password</label>
                <input
                  type="password"
                  className="ml-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>

              <div className="ml-forgot">
                <Link href="/merchant-forgot-password">Forgot password?</Link>
              </div>

              <button type="submit" className="ml-btn" disabled={loading}>
                {loading ? '⏳ Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="ml-signup">
              Don't have an account?{' '}
              <Link href="/merchant/signup">Register as an agency</Link>
            </p>
          </div>

          <div className="ml-back">
            <Link href="/">← Back to Homepage</Link>
          </div>

        </div>
      </div>
    </>
  )
}