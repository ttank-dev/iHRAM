'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MerchantDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [agencyName, setAgencyName] = useState('')
  const router = useRouter()
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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ fontSize: '48px' }}>⏳</div>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5F5F0' }}>
        
        {/* SIDEBAR - EXACT SAMA MACAM ADMIN */}
        <aside 
          className="merchant-sidebar"
          style={{
            width: '240px',
            backgroundColor: '#1A1A1A',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            height: '100vh',
            overflowY: 'auto',
            overflowX: 'hidden'
          }}
        >
          {/* Logo / Header - Fixed at top */}
          <div style={{ 
            padding: '24px',
            flexShrink: 0
          }}>
            <Link href="/merchant/dashboard" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>🕌</div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#B8936D' }}>iHRAM</div>
                  <div style={{ fontSize: '11px', color: '#999' }}>Merchant Dashboard</div>
                </div>
              </div>
            </Link>
          </div>

          {/* Agency Name - Fixed below logo */}
          {agencyName && (
            <div style={{
              padding: '12px 24px',
              backgroundColor: '#2C2C2C',
              marginBottom: '16px',
              fontSize: '14px',
              flexShrink: 0
            }}>
              <div style={{ color: '#666', fontSize: '11px', marginBottom: '4px', fontWeight: '700' }}>AGENSI</div>
              <div style={{ fontWeight: '600', color: 'white' }}>{agencyName}</div>
            </div>
          )}

          {/* Menu Items - Scrollable area */}
          <nav style={{ 
            flex: 1,
            padding: '0 16px',
            overflowY: 'auto',
            paddingBottom: '24px'
          }}>
            
            {/* Dashboard */}
            <Link href="/merchant/dashboard" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px'
            }}>
              <span>📊</span>
              <span>Dashboard</span>
            </Link>

            {/* MANAGEMENT Section */}
            <div style={{ marginTop: '24px', marginBottom: '8px' }}>
              <div style={{ 
                fontSize: '11px', 
                color: '#666', 
                fontWeight: '700', 
                padding: '0 12px',
                marginBottom: '8px'
              }}>
                MANAGEMENT
              </div>
              
              <Link href="/merchant/dashboard/pakej" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '4px'
              }}>
                <span>📦</span>
                <span>Pakej Saya</span>
              </Link>

              <Link href="/merchant/dashboard/ulasan" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '4px'
              }}>
                <span>⭐</span>
                <span>Ulasan</span>
              </Link>

              <Link href="/merchant/dashboard/profil" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '4px'
              }}>
                <span>🏢</span>
                <span>Profil Agensi</span>
              </Link>

              <Link href="/merchant/dashboard/verifikasi" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '4px'
              }}>
                <span>✅</span>
                <span>Mohon Verifikasi</span>
              </Link>
            </div>

            {/* CONTENT Section */}
            <div style={{ marginTop: '24px', marginBottom: '8px' }}>
              <div style={{ 
                fontSize: '11px', 
                color: '#666', 
                fontWeight: '700', 
                padding: '0 12px',
                marginBottom: '8px'
              }}>
                CONTENT
              </div>
              
              <Link href="/merchant/dashboard/newsfeed" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '4px'
              }}>
                <span>📰</span>
                <span>News Feed</span>
              </Link>

              <Link href="/merchant/dashboard/reels" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '4px'
              }}>
                <span>🎬</span>
                <span>Reels</span>
              </Link>

              <Link href="/merchant/dashboard/galeri" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '4px'
              }}>
                <span>🖼️</span>
                <span>Galeri</span>
              </Link>
            </div>

            {/* SETTINGS Section */}
            <div style={{ marginTop: '24px', marginBottom: '8px' }}>
              <div style={{ 
                fontSize: '11px', 
                color: '#666', 
                fontWeight: '700', 
                padding: '0 12px',
                marginBottom: '8px'
              }}>
                SETTINGS
              </div>
              
              <Link href="/merchant/dashboard/settings" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '4px'
              }}>
                <span>⚙️</span>
                <span>Settings</span>
              </Link>
            </div>
          </nav>

          {/* LOGOUT BUTTON - Fixed at bottom */}
          <div style={{ 
            padding: '16px', 
            borderTop: '1px solid #333',
            flexShrink: 0
          }}>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                color: 'white',
                width: '100%',
                border: 'none',
                backgroundColor: '#B8936D',
                cursor: 'pointer',
                textAlign: 'left',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <img width="48" height="48" src="https://img.icons8.com/fluency-systems-filled/48/exit.png" alt="exit"/>
              <span>Log Keluar</span>
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main style={{
          marginLeft: '240px',
          flex: 1,
          padding: '40px',
          minHeight: '100vh'
        }}>
          {children}
        </main>
      </div>

      {/* CSS in separate style tag */}
      <style dangerouslySetInnerHTML={{__html: `
        .merchant-sidebar::-webkit-scrollbar {
          width: 8px;
        }
        
        .merchant-sidebar::-webkit-scrollbar-track {
          background: #2C2C2C;
        }
        
        .merchant-sidebar::-webkit-scrollbar-thumb {
          background: #B8936D;
          border-radius: 4px;
        }
        
        .merchant-sidebar::-webkit-scrollbar-thumb:hover {
          background: #C4A030;
        }
        
        /* Firefox scrollbar */
        .merchant-sidebar {
          scrollbar-width: thin;
          scrollbar-color: #B8936D #2C2C2C;
        }
      `}} />
    </>
  )
}