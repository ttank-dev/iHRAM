'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function MerchantDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [agencyName, setAgencyName] = useState('')
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/merchant/login')
      return
    }

    const { data: agency } = await supabase
      .from('agencies')
      .select('name')
      .eq('user_id', user.id)
      .single()

    if (agency) {
      setAgencyName(agency.name)
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/merchant/login')
  }

  const isActive = (path: string) => pathname === path

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: '48px' }}>⏳</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5F5F0' }}>
      
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        backgroundColor: '#2C2C2C',
        color: 'white',
        padding: '24px 0',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        
        {/* Logo */}
        <div style={{ padding: '0 24px', marginBottom: '32px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: '#B8936D',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>🕌</span>
              <span>iHRAM</span>
            </div>
          </Link>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
            Merchant Dashboard
          </div>
        </div>

        {/* Agency Name */}
        {agencyName && (
          <div style={{
            padding: '12px 24px',
            backgroundColor: '#1A1A1A',
            marginBottom: '24px',
            fontSize: '14px'
          }}>
            <div style={{ color: '#999', fontSize: '11px', marginBottom: '4px' }}>AGENSI</div>
            <div style={{ fontWeight: '600' }}>{agencyName}</div>
          </div>
        )}

        {/* Menu */}
        <nav>
          <Link
            href="/merchant/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              color: isActive('/merchant/dashboard') ? '#B8936D' : 'white',
              textDecoration: 'none',
              backgroundColor: isActive('/merchant/dashboard') ? '#1A1A1A' : 'transparent',
              borderLeft: isActive('/merchant/dashboard') ? '3px solid #B8936D' : '3px solid transparent',
              fontSize: '15px'
            }}
          >
            <span style={{ fontSize: '20px' }}>📊</span>
            <span>Dashboard</span>
          </Link>

          <Link
            href="/merchant/dashboard/pakej"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              color: pathname?.startsWith('/merchant/dashboard/pakej') ? '#B8936D' : 'white',
              textDecoration: 'none',
              backgroundColor: pathname?.startsWith('/merchant/dashboard/pakej') ? '#1A1A1A' : 'transparent',
              borderLeft: pathname?.startsWith('/merchant/dashboard/pakej') ? '3px solid #B8936D' : '3px solid transparent',
              fontSize: '15px'
            }}
          >
            <span style={{ fontSize: '20px' }}>📦</span>
            <span>Pakej Saya</span>
          </Link>

          <Link
            href="/merchant/dashboard/newsfeed"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              color: pathname?.startsWith('/merchant/dashboard/newsfeed') ? '#B8936D' : 'white',
              textDecoration: 'none',
              backgroundColor: pathname?.startsWith('/merchant/dashboard/newsfeed') ? '#1A1A1A' : 'transparent',
              borderLeft: pathname?.startsWith('/merchant/dashboard/newsfeed') ? '3px solid #B8936D' : '3px solid transparent',
              fontSize: '15px'
            }}
          >
            <span style={{ fontSize: '20px' }}>📰</span>
            <span>News Feed</span>
          </Link>

          <Link
            href="/merchant/dashboard/reels"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              color: pathname?.startsWith('/merchant/dashboard/reels') ? '#B8936D' : 'white',
              textDecoration: 'none',
              backgroundColor: pathname?.startsWith('/merchant/dashboard/reels') ? '#1A1A1A' : 'transparent',
              borderLeft: pathname?.startsWith('/merchant/dashboard/reels') ? '3px solid #B8936D' : '3px solid transparent',
              fontSize: '15px'
            }}
          >
            <span style={{ fontSize: '20px' }}>🎬</span>
            <span>Reels</span>
          </Link>

          <Link
            href="/merchant/dashboard/ulasan"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              color: pathname?.startsWith('/merchant/dashboard/ulasan') ? '#B8936D' : 'white',
              textDecoration: 'none',
              backgroundColor: pathname?.startsWith('/merchant/dashboard/ulasan') ? '#1A1A1A' : 'transparent',
              borderLeft: pathname?.startsWith('/merchant/dashboard/ulasan') ? '3px solid #B8936D' : '3px solid transparent',
              fontSize: '15px'
            }}
          >
            <span style={{ fontSize: '20px' }}>⭐</span>
            <span>Ulasan</span>
          </Link>

          <Link
            href="/merchant/dashboard/profil"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              color: pathname?.startsWith('/merchant/dashboard/profil') ? '#B8936D' : 'white',
              textDecoration: 'none',
              backgroundColor: pathname?.startsWith('/merchant/dashboard/profil') ? '#1A1A1A' : 'transparent',
              borderLeft: pathname?.startsWith('/merchant/dashboard/profil') ? '3px solid #B8936D' : '3px solid transparent',
              fontSize: '15px'
            }}
          >
            <span style={{ fontSize: '20px' }}>🏢</span>
            <span>Profil Agensi</span>
          </Link>

          <Link
            href="/merchant/dashboard/verifikasi"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              color: pathname?.startsWith('/merchant/dashboard/profil') ? '#B8936D' : 'white',
              textDecoration: 'none',
              backgroundColor: pathname?.startsWith('/merchant/dashboard/profil') ? '#1A1A1A' : 'transparent',
              borderLeft: pathname?.startsWith('/merchant/dashboard/profil') ? '3px solid #B8936D' : '3px solid transparent',
              fontSize: '15px'
            }}
          >
            <span style={{ fontSize: '20px' }}>✅</span>
            <span>Mohon Verifikasi</span>
          </Link>

          <div style={{ margin: '24px 0', height: '1px', backgroundColor: '#444' }} />

          <Link href="/merchant/dashboard/settings" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '15px'
            }}>
              <span style={{ fontSize: '20px' }}>⚙️</span>
              <span>Settings</span>
            </Link>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              color: 'white',
              textDecoration: 'none',
              fontSize: '15px',
              width: '100%',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <span style={{ fontSize: '20px' }}>🚪</span>
            <span>Log Keluar</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{
        marginLeft: '240px',
        flex: 1,
        padding: '40px',
        minHeight: '100vh'
      }}>
        {children}
      </main>
    </div>
  )
}