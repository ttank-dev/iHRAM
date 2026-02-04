'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    if (!confirm('Log out from admin panel?')) return

    setLoading(true)
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error

      // Redirect to admin-login (with DASH!)
      window.location.href = '/admin-login'
    } catch (error: any) {
      console.error('Logout error:', error)
      alert(`❌ Error: ${error.message}`)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        padding: '10px 20px',
        backgroundColor: loading ? '#999' : '#EF4444',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        justifyContent: 'center'
      }}
    >
      {loading ? '⏳ Logging out...' : '🚪 Log Out'}
    </button>
  )
}