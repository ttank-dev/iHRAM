'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginPage() {
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
        const { data: adminRole } = await supabase
          .from('admin_users')
          .select('role, is_active')
          .eq('id', data.user.id)
          .single()

        if (!adminRole) {
          setError('Access denied. This account is not an admin.')
          await supabase.auth.signOut()
          setLoading(false)
          return
        }

        if (!adminRole.is_active) {
          setError('Your admin account is inactive. Please contact the system owner.')
          await supabase.auth.signOut()
          setLoading(false)
          return
        }

        router.push('/admin')
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
        .al-page,.al-page *{box-sizing:border-box}
        .al-page{
          min-height:100vh;background:#F5F5F0;
          display:flex;align-items:center;justify-content:center;
          padding:24px 16px;
        }
        .al-wrap{width:100%;max-width:460px}

        .al-logo{text-align:center;margin-bottom:32px}
        .al-logo img{height:56px;filter:brightness(0) saturate(100%) invert(56%) sepia(35%) saturate(643%) hue-rotate(358deg) brightness(95%) contrast(92%)}

        .al-card{background:white;border-radius:16px;padding:40px;box-shadow:0 8px 32px rgba(0,0,0,.10)}

        .al-card-head{text-align:center;margin-bottom:28px}
        .al-icon{display:inline-flex;align-items:center;justify-content:center;width:60px;height:60px;background:#B8936D;border-radius:50%;font-size:28px;margin-bottom:14px}
        .al-card-title{font-size:26px;font-weight:700;color:#2C2C2C;font-family:Georgia,serif;margin:0 0 6px}
        .al-card-sub{font-size:14px;color:#888;margin:0}

        .al-error{padding:12px 16px;background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;margin-bottom:20px;color:#DC2626;font-size:14px}

        .al-form{display:flex;flex-direction:column;gap:18px}
        .al-label{display:block;font-size:13px;font-weight:600;color:#2C2C2C;margin-bottom:6px}
        .al-input{
          width:100%;padding:12px 14px;
          border:1.5px solid #E5E5E0;border-radius:8px;
          font-size:15px;outline:none;font-family:inherit;color:#2C2C2C;
          transition:border-color .15s;
        }
        .al-input:focus{border-color:#B8936D}
        .al-input:disabled{background:#F8F8F8;color:#aaa}

        .al-forgot{text-align:right;margin-top:-6px}
        .al-forgot a{font-size:13px;color:#B8936D;text-decoration:none;font-weight:600}
        .al-forgot a:hover{text-decoration:underline}

        .al-btn{
          width:100%;padding:14px;
          background:#B8936D;color:white;
          border:none;border-radius:8px;
          font-size:15px;font-weight:700;
          cursor:pointer;transition:background .15s;font-family:inherit;
        }
        .al-btn:hover:not(:disabled){background:#a07d5a}
        .al-btn:disabled{background:#ccc;cursor:not-allowed}

        .al-notice{
          display:flex;gap:12px;align-items:flex-start;
          margin-top:20px;padding:14px 16px;
          background:#FFF8E1;border:1px solid #FFD54F;border-radius:8px;
        }
        .al-notice-icon{font-size:20px;flex-shrink:0}
        .al-notice-title{font-size:13px;font-weight:700;color:#2C2C2C;margin-bottom:3px}
        .al-notice-sub{font-size:12px;color:#666}

        .al-back{text-align:center;margin-top:20px}
        .al-back a{color:#888;font-size:14px;text-decoration:none}
        .al-back a:hover{color:#555}

        @media(max-width:480px){
          .al-card{padding:28px 20px;border-radius:14px}
          .al-card-title{font-size:22px}
          .al-icon{width:52px;height:52px;font-size:24px}
          .al-logo img{height:48px}
          .al-logo{margin-bottom:24px}
        }
      `}</style>

      <div className="al-page">
        <div className="al-wrap">

          <div className="al-logo">
            <Link href="/"><img src="/logo.png" alt="iHRAM" /></Link>
          </div>

          <div className="al-card">
            <div className="al-card-head">
              <div className="al-icon">🔐</div>
              <h1 className="al-card-title">Admin Dashboard</h1>
              <p className="al-card-sub">Sign in as system administrator</p>
            </div>

            {error && <div className="al-error">⚠️ {error}</div>}

            <form className="al-form" onSubmit={handleLogin}>
              <div>
                <label className="al-label">Email Address</label>
                <input type="email" className="al-input"
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@ihram.com.my"
                  required disabled={loading} />
              </div>

              <div>
                <label className="al-label">Password</label>
                <input type="password" className="al-input"
                  value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required disabled={loading} />
              </div>

              <div className="al-forgot">
                <Link href="/admin-forgot-password">Forgot password?</Link>
              </div>

              <button type="submit" className="al-btn" disabled={loading}>
                {loading ? '⏳ Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="al-notice">
              <span className="al-notice-icon">⚠️</span>
              <div>
                <div className="al-notice-title">Restricted Access</div>
                <div className="al-notice-sub">This page is for system administrators only.</div>
              </div>
            </div>
          </div>

          <div className="al-back">
            <Link href="/">← Back to Homepage</Link>
          </div>

        </div>
      </div>
    </>
  )
}