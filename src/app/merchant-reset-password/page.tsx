'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function MerchantResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error || !session) {
        setError('Reset link is invalid or has expired. Please request a new one.')
      }
      setChecking(false)
    }
    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setTimeout(() => router.push('/merchant/login'), 2000)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .rp-page,.rp-page *{box-sizing:border-box}
        .rp-page{
          min-height:100vh;background:#F5F5F0;
          display:flex;align-items:center;justify-content:center;
          padding:24px 16px;
        }
        .rp-card{
          background:white;border-radius:16px;
          width:100%;max-width:420px;
          padding:40px;
          border:1px solid #E5E5E0;
          box-shadow:0 4px 24px rgba(0,0,0,.07);
          text-align:center;
        }

        /* States */
        .rp-state-icon{font-size:48px;margin-bottom:16px}
        .rp-state-title{font-size:22px;font-weight:700;color:#2C2C2C;margin:0 0 8px}
        .rp-state-sub{font-size:15px;color:#666;margin:0}

        /* Success icon */
        .rp-success-icon{
          width:64px;height:64px;border-radius:50%;
          background:#ECFDF5;display:flex;align-items:center;
          justify-content:center;font-size:32px;
          margin:0 auto 20px;
        }

        /* Error banner */
        .rp-error{padding:12px 16px;background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;margin-bottom:20px;color:#DC2626;font-size:14px;text-align:left}

        /* Form */
        .rp-head{margin-bottom:28px}
        .rp-title{font-size:26px;font-weight:700;color:#2C2C2C;margin:0 0 8px;font-family:Georgia,serif}
        .rp-sub{font-size:14px;color:#888;margin:0}

        .rp-field{margin-bottom:18px;text-align:left}
        .rp-label{display:block;font-size:13px;font-weight:600;color:#2C2C2C;margin-bottom:6px}
        .rp-input{
          width:100%;padding:12px 14px;
          border:1.5px solid #E5E5E0;border-radius:8px;
          font-size:15px;outline:none;font-family:inherit;color:#2C2C2C;
          transition:border-color .15s;
        }
        .rp-input:focus{border-color:#B8936D}
        .rp-input:disabled{background:#F8F8F8;color:#aaa}

        .rp-btn{
          width:100%;padding:13px;margin-top:6px;
          background:#B8936D;color:white;
          border:none;border-radius:8px;
          font-size:15px;font-weight:700;
          cursor:pointer;transition:background .15s;font-family:inherit;
        }
        .rp-btn:hover:not(:disabled){background:#a07d5a}
        .rp-btn:disabled{background:#ccc;cursor:not-allowed}

        @media(max-width:480px){
          .rp-card{padding:28px 20px;border-radius:14px}
          .rp-title{font-size:22px}
        }
      `}</style>

      <div className="rp-page">
        <div className="rp-card">

          {/* Checking session */}
          {checking && (
            <>
              <div className="rp-state-icon">⏳</div>
              <p className="rp-state-sub">Verifying reset link...</p>
            </>
          )}

          {/* Success */}
          {!checking && success && (
            <>
              <div className="rp-success-icon">✅</div>
              <h1 className="rp-state-title">Password Updated!</h1>
              <p className="rp-state-sub">Redirecting to login...</p>
            </>
          )}

          {/* Form */}
          {!checking && !success && (
            <>
              <div className="rp-head">
                <h1 className="rp-title">🏢 Reset Password</h1>
                <p className="rp-sub">Enter your new password below</p>
              </div>

              {error && <div className="rp-error">⚠️ {error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="rp-field">
                  <label className="rp-label">New Password</label>
                  <input
                    type="password"
                    className="rp-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>

                <div className="rp-field">
                  <label className="rp-label">Confirm Password</label>
                  <input
                    type="password"
                    className="rp-input"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    minLength={6}
                    disabled={loading}
                  />
                </div>

                <button type="submit" className="rp-btn" disabled={loading}>
                  {loading ? '⏳ Updating...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </>
  )
}