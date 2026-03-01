'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function MerchantForgotPasswordPage() {
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
        redirectTo: `${window.location.origin}/merchant-reset-password`
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
        .fp-page,.fp-page *{box-sizing:border-box}
        .fp-page{
          min-height:100vh;background:#F5F5F0;
          display:flex;align-items:center;justify-content:center;
          padding:24px 16px;
        }
        .fp-card{
          background:white;border-radius:16px;
          width:100%;max-width:420px;
          padding:40px;
          border:1px solid #E5E5E0;
          box-shadow:0 4px 24px rgba(0,0,0,.07);
        }

        /* Success state */
        .fp-success-icon{
          width:64px;height:64px;border-radius:50%;
          background:#ECFDF5;display:flex;align-items:center;
          justify-content:center;font-size:32px;
          margin:0 auto 20px;
        }
        .fp-success-title{font-size:24px;font-weight:700;color:#2C2C2C;text-align:center;margin:0 0 10px}
        .fp-success-desc{font-size:15px;color:#666;line-height:1.6;text-align:center;margin:0 0 8px}
        .fp-success-hint{font-size:13px;color:#999;text-align:center;margin:0 0 24px}

        /* Form state */
        .fp-head{text-align:center;margin-bottom:28px}
        .fp-title{font-size:26px;font-weight:700;color:#2C2C2C;margin:0 0 8px;font-family:Georgia,serif}
        .fp-sub{font-size:14px;color:#888;margin:0}

        /* Error */
        .fp-error{padding:12px 16px;background:#FEF2F2;border:1px solid #FECACA;border-radius:8px;margin-bottom:20px;color:#DC2626;font-size:14px}

        /* Form */
        .fp-label{display:block;font-size:13px;font-weight:600;color:#2C2C2C;margin-bottom:6px}
        .fp-input{
          width:100%;padding:12px 14px;
          border:1.5px solid #E5E5E0;border-radius:8px;
          font-size:15px;outline:none;font-family:inherit;color:#2C2C2C;
          transition:border-color .15s;margin-bottom:20px;
        }
        .fp-input:focus{border-color:#B8936D}

        /* Buttons */
        .fp-btn-primary{
          width:100%;padding:13px;
          background:#B8936D;color:white;
          border:none;border-radius:8px;
          font-size:15px;font-weight:700;
          cursor:pointer;transition:background .15s;
          font-family:inherit;margin-bottom:10px;
          display:block;text-align:center;text-decoration:none;
        }
        .fp-btn-primary:hover:not(:disabled){background:#a07d5a}
        .fp-btn-primary:disabled{background:#ccc;cursor:not-allowed}
        .fp-btn-secondary{
          width:100%;padding:13px;
          background:white;color:#2C2C2C;
          border:1.5px solid #E5E5E0;border-radius:8px;
          font-size:15px;font-weight:600;
          cursor:pointer;transition:all .15s;
          font-family:inherit;
          display:block;text-align:center;text-decoration:none;
        }
        .fp-btn-secondary:hover{border-color:#B8936D;color:#B8936D}

        @media(max-width:480px){
          .fp-card{padding:28px 20px;border-radius:14px}
          .fp-title{font-size:22px}
        }
      `}</style>

      <div className="fp-page">
        <div className="fp-card">

          {sent ? (
            <>
              <div className="fp-success-icon">✅</div>
              <h1 className="fp-success-title">Email Sent!</h1>
              <p className="fp-success-desc">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="fp-success-hint">
                Check your inbox and click the link to reset your password.
              </p>
              <Link href="/merchant/login" className="fp-btn-primary">
                Back to Login
              </Link>
            </>
          ) : (
            <>
              <div className="fp-head">
                <h1 className="fp-title">🏢 Reset Password</h1>
                <p className="fp-sub">Enter your agency email to receive a reset link</p>
              </div>

              {error && <div className="fp-error">⚠️ {error}</div>}

              <form onSubmit={handleSubmit}>
                <label className="fp-label">Agency Email</label>
                <input
                  type="email"
                  className="fp-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="agency@example.com"
                  required
                  disabled={loading}
                />
                <button type="submit" className="fp-btn-primary" disabled={loading}>
                  {loading ? '⏳ Sending...' : 'Send Reset Link'}
                </button>
                <Link href="/merchant/login" className="fp-btn-secondary">
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