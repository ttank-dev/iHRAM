'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-[#2A2A2A] rounded transition-colors w-full text-left"
    >
      <LogOut size={20} />
      <span>Log Keluar</span>
    </button>
  )
}