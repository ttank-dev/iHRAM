'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    agencyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Password tidak sepadan')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password mestilah sekurang-kurangnya 6 aksara')
      setLoading(false)
      return
    }

    // Sign up user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          agency_name: formData.agencyName,
          phone: formData.phone,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      // Create agency profile
      const slug = formData.agencyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const { error: agencyError } = await supabase.from('agencies').insert({
        user_id: authData.user.id,
        name: formData.agencyName,
        slug: slug,
        email: formData.email,
        phone: formData.phone,
        is_active: true,
        is_verified: false,
      })

      if (agencyError) {
        setError('Gagal membuat profil agensi: ' + agencyError.message)
        setLoading(false)
        return
      }

      // Success - redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#D4AF37] mb-2">iHRAM</h1>
          <p className="text-gray-400">Daftar Agensi Anda</p>
        </div>

        {/* Signup Card */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Daftar Akaun Baru</h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Nama Agensi</label>
              <input
                type="text"
                name="agencyName"
                value={formData.agencyName}
                onChange={handleChange}
                style={{ color: '#FFFFFF' }}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded px-4 py-3 placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37]"
                placeholder="Contoh: Al-Hijrah Travel"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{ color: '#FFFFFF' }}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded px-4 py-3 placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37]"
                placeholder="email@agensi.com"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">No. Telefon</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={{ color: '#FFFFFF' }}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded px-4 py-3 placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37]"
                placeholder="0123456789"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{ color: '#FFFFFF' }}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded px-4 py-3 placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37]"
                placeholder="••••••••"
                required
              />
              <p className="text-gray-500 text-sm mt-1">Minimum 6 aksara</p>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Sahkan Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{ color: '#FFFFFF' }}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded px-4 py-3 placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37]"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold py-3 rounded transition-colors disabled:opacity-50"
            >
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Sudah ada akaun?{' '}
              <Link href="/login" className="text-[#D4AF37] hover:underline">
                Log Masuk
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-gray-500 hover:text-gray-400 text-sm">
              ← Kembali ke Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}