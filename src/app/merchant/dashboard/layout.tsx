'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type UserRole = 'owner' | 'staff' | null

export default function MerchantDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [agencyName, setAgencyName] = useState('')
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/merchant/login'); return }

      const res = await fetch('/api/merchant/me')
      if (!res.ok) { setError('no-agency'); setLoading(false); return }

      const data = await res.json()
      if (!data.agencyId) { setError('no-agency'); setLoading(false); return }

      setAgencyName(data.agencyName || 'Your Agency')
      setUserRole(data.role || 'staff')
      setLoading(false)
    } catch {
      setError('no-agency')
      setLoading(false)
    }
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

  if (error === 'no-agency') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#F5F5F0' }}>
        <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '16px', textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>❌</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '16px' }}>No Agency Found</h1>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>Your account is not linked to any agency. Please contact admin.</p>
          <button onClick={handleLogout} style={{ padding: '12px 24px', backgroundColor: '#B8936D', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' }}>
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  const owner = userRole === 'owner'

  const navLink = {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 12px', color: 'white', textDecoration: 'none',
    borderRadius: '8px', fontSize: '14px', fontWeight: '500', marginBottom: '4px'
  } as const

  // Disabled = greyed out, no click
  const disabledLink = {
    ...navLink,
    color: '#555',
    cursor: 'not-allowed',
    opacity: 0.4,
    pointerEvents: 'none' as const
  }

  return (
    <>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5F5F0' }}>
        <aside className="merchant-sidebar" style={{
          width: '240px', backgroundColor: '#1A1A1A', color: 'white',
          display: 'flex', flexDirection: 'column', position: 'fixed',
          height: '100vh', overflowY: 'auto', overflowX: 'hidden'
        }}>
          {/* Logo */}
          <div style={{ padding: '24px', flexShrink: 0 }}>
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

          {/* Agency + Role Badge */}
          {agencyName && (
            <div style={{ padding: '12px 24px', backgroundColor: '#2C2C2C', marginBottom: '16px', flexShrink: 0 }}>
              <div style={{ color: '#666', fontSize: '11px', marginBottom: '4px', fontWeight: '700' }}>AGENSI</div>
              <div style={{ fontWeight: '600', color: 'white', fontSize: '14px' }}>{agencyName}</div>
              <div style={{
                marginTop: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                color: owner ? '#F87171' : '#B8936D'
              }}>
                {owner ? '👑 OWNER' : '👤 STAFF'}
              </div>
            </div>
          )}

          {/* Nav */}
          <nav style={{ flex: 1, padding: '0 16px', overflowY: 'auto', paddingBottom: '24px' }}>

            <Link href="/merchant/dashboard" style={navLink}>
              <span>📊</span><span>Dashboard</span>
            </Link>

            {/* MANAGEMENT */}
            <div style={{ marginTop: '24px', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', color: '#666', fontWeight: '700', padding: '0 12px', marginBottom: '8px' }}>
                MANAGEMENT
              </div>

              <Link href="/merchant/dashboard/pakej" style={navLink}>
                <span>📦</span><span>Pakej Saya</span>
              </Link>

              <Link href="/merchant/dashboard/ulasan" style={navLink}>
                <span>⭐</span><span>Ulasan</span>
              </Link>

              {/* Profil Agensi - owner only */}
              {owner ? (
                <Link href="/merchant/dashboard/profil" style={navLink}>
                  <span>🏢</span><span>Profil Agensi</span>
                </Link>
              ) : (
                <div style={{ ...disabledLink, display: 'flex' }}>
                  <span>🏢</span><span>Profil Agensi</span>
                  <span style={{ fontSize: '10px', marginLeft: 'auto', backgroundColor: '#333', padding: '2px 6px', borderRadius: '4px' }}>OWNER</span>
                </div>
              )}

              {/* Verifikasi - owner only */}
              {owner ? (
                <Link href="/merchant/dashboard/verifikasi" style={navLink}>
                  <span>✅</span><span>Mohon Verifikasi</span>
                </Link>
              ) : (
                <div style={{ ...disabledLink, display: 'flex' }}>
                  <span>✅</span><span>Mohon Verifikasi</span>
                  <span style={{ fontSize: '10px', marginLeft: 'auto', backgroundColor: '#333', padding: '2px 6px', borderRadius: '4px' }}>OWNER</span>
                </div>
              )}
            </div>

            {/* CONTENT - semua boleh */}
            <div style={{ marginTop: '24px', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', color: '#666', fontWeight: '700', padding: '0 12px', marginBottom: '8px' }}>
                CONTENT
              </div>
              <Link href="/merchant/dashboard/newsfeed" style={navLink}>
                <span>📰</span><span>News Feed</span>
              </Link>
              <Link href="/merchant/dashboard/reels" style={navLink}>
                <span>🎬</span><span>Reels</span>
              </Link>
              <Link href="/merchant/dashboard/galeri" style={navLink}>
                <span>🖼️</span><span>Galeri</span>
              </Link>
            </div>

            {/* SETTINGS - ✅ Semua boleh masuk, tapi staff nampak password sahaja */}
            <div style={{ marginTop: '24px', marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', color: '#666', fontWeight: '700', padding: '0 12px', marginBottom: '8px' }}>
                SETTINGS
              </div>
              <Link href="/merchant/dashboard/settings" style={navLink}>
                <span>⚙️</span><span>Settings</span>
                {!owner && (
                  <span style={{ fontSize: '10px', marginLeft: 'auto', backgroundColor: '#2a2a2a', border: '1px solid #444', padding: '2px 6px', borderRadius: '4px', color: '#B8936D' }}>
                    PW
                  </span>
                )}
              </Link>
            </div>
          </nav>

          {/* Logout */}
          <div style={{ padding: '16px', borderTop: '1px solid #333', flexShrink: 0 }}>
            <button onClick={handleLogout} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '12px', padding: '10px 12px', color: 'white', width: '100%',
              border: 'none', backgroundColor: '#DC2626', cursor: 'pointer',
              borderRadius: '8px', fontSize: '14px', fontWeight: '600'
            }}>
              <span>🚪</span><span>Log Out</span>
            </button>
          </div>
        </aside>

        <main style={{ marginLeft: '240px', flex: 1, padding: '40px', minHeight: '100vh' }}>
          {children}
        </main>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .merchant-sidebar::-webkit-scrollbar { width: 8px; }
        .merchant-sidebar::-webkit-scrollbar-track { background: #2C2C2C; }
        .merchant-sidebar::-webkit-scrollbar-thumb { background: #B8936D; border-radius: 4px; }
        .merchant-sidebar::-webkit-scrollbar-thumb:hover { background: #C4A030; }
        .merchant-sidebar { scrollbar-width: thin; scrollbar-color: #B8936D #2C2C2C; }
      `}} />
    </>
  )
}