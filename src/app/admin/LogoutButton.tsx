'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function AdminLogoutButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    if (!confirm('Logout from admin panel?')) return
    
    setLoading(true)
    try {
      await supabase.auth.signOut()
      router.push('/admin-login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      alert('Error logging out')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-[#1A1A1A] rounded-lg transition-colors w-full disabled:opacity-50"
    >
      <LogOut size={20} />
      <span>{loading ? 'Logging out...' : 'Logout'}</span>
    </button>
  )
}