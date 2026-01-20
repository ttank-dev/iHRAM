'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Building2, Phone, Mail, Globe, Instagram, Facebook } from 'lucide-react'

export default function ProfilPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    name: '',
    about: '',
    ssm_number: '',
    phone: '',
    email: '',
    website: '',
    instagram: '',
    facebook: '',
  })

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: agency, error } = await supabase
        .from('agencies')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error) throw error

      if (agency) {
        setFormData({
          name: agency.name || '',
          about: agency.about || '',
          ssm_number: agency.ssm_number || '',
          phone: agency.phone || '',
          email: agency.email || '',
          website: agency.website || '',
          instagram: agency.instagram || '',
          facebook: agency.facebook || '',
        })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('agencies')
        .update({
          name: formData.name,
          about: formData.about,
          ssm_number: formData.ssm_number,
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
          instagram: formData.instagram,
          facebook: formData.facebook,
        })
        .eq('user_id', user.id)

      if (error) throw error

      setSuccess('Profil berjaya dikemaskini!')
      setTimeout(() => router.refresh(), 1500)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400">Memuatkan...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Profil Agensi</h1>
        <p className="text-gray-400">Kemaskini maklumat agensi anda</p>
      </div>

      <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* Info Asas */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Building2 size={20} className="text-[#D4AF37]" />
              Maklumat Asas
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nama Agensi *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tentang Agensi
                </label>
                <textarea
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-black border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="Ceritakan tentang agensi anda..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  No. SSM
                </label>
                <input
                  type="text"
                  value={formData.ssm_number}
                  onChange={(e) => setFormData({ ...formData, ssm_number: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="1234567-X"
                />
              </div>
            </div>
          </div>

          {/* Maklumat Hubungan */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Phone size={20} className="text-[#D4AF37]" />
              Maklumat Hubungan
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="60123456789"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Format: 60123456789 (tanpa + atau -)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Globe size={16} className="inline mr-1" />
                  Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Instagram size={16} className="inline mr-1" />
                  Instagram
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="@username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Facebook size={16} className="inline mr-1" />
                  Facebook
                </label>
                <input
                  type="text"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  className="w-full px-4 py-3 bg-black border border-[#2A2A2A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="facebook.com/page"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 border border-[#2A2A2A] text-gray-300 hover:bg-[#2A2A2A] font-semibold rounded-lg transition-colors"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}