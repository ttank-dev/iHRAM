'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AdminForgotPasswordPage() {
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
        redirectTo: `${window.location.origin}/admin-reset-password`
      })
      if (error) throw error
      setSent(true)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        .afp-page,.afp-page *{box-sizing:border-box}
        .afp-page{
          min-height:100vh;background:#F5F5F0;
          display:flex;align-items:center;justify-content:center;
          padding:24px 16px;
        }
        .afp-card{
          background:white;border-radius:16px;
          width:100%;max-width:420px;
          padding:40px;
          border:1px solid #E5E5E0;
          box-shadow:0 4px 24px rgba(0,0,0,.07);
        }

        /* Success */
        .afp-success-icon{width:64px;height:64px;border-radius:50%;background:#ECFDF5;display:flex;align-items:center;justify-content:center;font-size:32px;margin:0 auto 20px}
        .afp-success-title{font-size:24px;font-weight:700;color:#2C2C2C;text-align:center;margin:0 0 10px}
        .afp-success-desc{font-size:15px;color:#666;line-height:1.6;text-align:center;margin:0 0 8px}
        .afp-success-hint{font-size:13px;color:#999;text-align:center;margin:0 0 24px}

        /* Form */
        .afp-head{text-align:center;margin-bottom:28px}
        .afp-title{font-size:26px;font-weight:700;color:#2C2C2C;margin:0 0 8px;font-family:Georgia,serif}
        .afp-sub{font-size:14px;color:#888;margin:0}

        .afp-error{padding:12px 16px;background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;margin-bottom:20px;color:#DC2626;font-size:14px}

        .afp-label{display:block;font-size:13px;font-weight:600;color:#2C2C2C;margin-bottom:6px}
        .afp-input{
          width:100%;padding:12px 14px;
          border:1.5px solid #E5E5E0;border-radius:8px;
          font-size:15px;outline:none;font-family:inherit;color:#2C2C2C;
          transition:border-color .15s;margin-bottom:20px;
        }
        .afp-input:focus{border-color:#B8936D}

        .afp-btn-primary{
          width:100%;padding:13px;
          background:#B8936D;color:white;
          border:none;border-radius:8px;
          font-size:15px;font-weight:700;
          cursor:pointer;transition:background .15s;
          font-family:inherit;margin-bottom:10px;
          display:block;text-align:center;text-decoration:none;
        }
        .afp-btn-primary:hover:not(:disabled){background:#a07d5a}
        .afp-btn-primary:disabled{background:#ccc;cursor:not-allowed}
        .afp-btn-secondary{
          width:100%;padding:13px;
          background:white;color:#2C2C2C;
          border:1.5px solid #E5E5E0;border-radius:8px;
          font-size:15px;font-weight:600;
          cursor:pointer;transition:all .15s;
          font-family:inherit;
          display:block;text-align:center;text-decoration:none;
        }
        .afp-btn-secondary:hover{border-color:#B8936D;color:#B8936D}

        @media(max-width:480px){
          .afp-card{padding:28px 20px;border-radius:14px}
          .afp-title{font-size:22px}
        }
      `}</style>

      <div className="afp-page">
        <div className="afp-card">

          {sent ? (
            <>
              <div className="afp-success-icon">✅</div>
              <h1 className="afp-success-title">Email Sent!</h1>
              <p className="afp-success-desc">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="afp-success-hint">
                Check your <strong>Inbox or Spam</strong> and click the link to reset your password.
              </p>
              <Link href="/admin-login" className="afp-btn-primary">
                Back to Login
              </Link>
            </>
          ) : (
            <>
              <div className="afp-head">
                <h1 className="afp-title">🔐 Reset Password</h1>
                <p className="afp-sub">Enter your admin email to receive a reset link</p>
              </div>

              {error && <div className="afp-error">⚠️ {error}</div>}

              <form onSubmit={handleSubmit}>
                <label className="afp-label">Admin Email</label>
                <input
                  type="email"
                  className="afp-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={loading}
                />
                <button type="submit" className="afp-btn-primary" disabled={loading}>
                  {loading ? '⏳ Sending...' : 'Send Reset Link'}
                </button>
                <Link href="/admin-login" className="afp-btn-secondary">
                  ← Back to Login
                </Link>
              </form>
            </>
          )}

        </div>
      </div>
    </>
  )
}