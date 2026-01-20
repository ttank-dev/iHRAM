'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Shield, Mail, Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Sign in
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      // Check if user is admin
      if (data.user) {
        const { data: adminRole } = await supabase
          .from('admin_roles')
          .select('role, is_active')
          .eq('user_id', data.user.id)
          .single()

        if (!adminRole || !adminRole.is_active) {
          await supabase.auth.signOut()
          setError('Access denied. Admin credentials required.')
          setLoading(false)
          return
        }
      }

      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      console.error('Admin login error:', err)
      setError(err.message || 'Invalid admin credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D4AF37]/10 rounded-full mb-4">
            <Shield className="text-[#D4AF37]" size={32} />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-[#D4AF37]">iHRAM</span>
          </h1>
          <p className="text-white text-lg font-semibold">Admin Portal</p>
          <p className="text-gray-400 text-sm mt-2">Authorized personnel only</p>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Admin Login</h2>

          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
              <p className="font-semibold mb-1">⚠️ Access Denied</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="admin@ihram.com.my"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                  size={20}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-black border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Login as Admin'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#2A2A2A]">
            <p className="text-gray-400 text-sm text-center">
              Not an admin?{' '}
              <Link href="/login" className="text-[#D4AF37] hover:text-[#C4A030]">
                Merchant Login
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}