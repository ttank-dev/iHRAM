'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, Mail } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      // Check if user's agency is suspended
      if (data.user) {
        const { data: agency } = await supabase
          .from('agencies')
          .select('is_active')
          .eq('user_id', data.user.id)
          .single()

        if (agency && !agency.is_active) {
          await supabase.auth.signOut()
          setError('Akaun anda telah digantung. Sila hubungi admin.')
          setLoading(false)
          return
        }
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Invalid login credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-4xl font-bold">
              <span className="text-[#D4AF37]">iHRAM</span>
              <span className="text-white text-sm block mt-2">Merchant Login</span>
            </h1>
          </Link>
        </div>

        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Log Masuk</h2>

          {/* Suspension Error Message */}
          {searchParams.get('error') === 'suspended' && (
            <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
              <p className="font-semibold mb-1">⚠️ Akaun Digantung</p>
              <p className="text-sm">Akaun anda telah digantung oleh admin. Sila hubungi support untuk maklumat lanjut.</p>
            </div>
          )}

          {/* Regular Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
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
                  placeholder="email@example.com"
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
              {loading ? 'Logging in...' : 'Log Masuk'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Belum ada akaun?{' '}
              <Link href="/signup" className="text-[#D4AF37] hover:text-[#C4A030]">
                Daftar Sekarang
              </Link>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-[#2A2A2A] text-center">
            <Link
              href="/"
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Kembali ke Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}