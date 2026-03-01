'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

type UserRole = 'owner' | 'staff' | null

/* ───────────────────────────── NAV DATA ───────────────────────────── */
type NavItem = {
  href: string
  icon: string
  label: string
  ownerOnly?: boolean
  staffBadge?: string
}
type NavSection = { title: string; items: NavItem[] }

const navSections: NavSection[] = [
  {
    title: '',
    items: [
      { href: '/merchant/dashboard', icon: '📊', label: 'Dashboard' },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { href: '/merchant/dashboard/pakej', icon: '📦', label: 'My Packages' },
      { href: '/merchant/dashboard/ulasan', icon: '⭐', label: 'Reviews' },
      { href: '/merchant/dashboard/profil', icon: '🏢', label: 'Agency Profile', ownerOnly: true },
      { href: '/merchant/dashboard/verifikasi', icon: '✅', label: 'Apply Verification', ownerOnly: true },
    ],
  },
  {
    title: 'CONTENT',
    items: [
      { href: '/merchant/dashboard/newsfeed', icon: '📰', label: 'News Feed' },
      { href: '/merchant/dashboard/reels', icon: '🎬', label: 'Reels' },
      { href: '/merchant/dashboard/galeri', icon: '🖼️', label: 'Gallery' },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      { href: '/merchant/dashboard/settings', icon: '⚙️', label: 'Settings', staffBadge: 'PW' },
    ],
  },
]

/* ───────────────────────────── COMPONENT ───────────────────────────── */
export default function MerchantDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [loading, setLoading] = useState(true)
  const [agencyName, setAgencyName] = useState('')
  const [userName, setUserName] = useState('')
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [error, setError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  // Auth check
  useEffect(() => {
    checkAuth()
  }, [])

  // Responsive detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [pathname, isMobile])

  // Lock body scroll when sidebar open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isMobile, sidebarOpen])

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/merchant/login'); return }

      // Get user display name — from user_metadata or email prefix
      const userName = user.user_metadata?.full_name || 
                       user.user_metadata?.name || 
                       user.email?.split('@')[0] || ''
      setUserName(userName)

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

  const isActive = (href: string) => {
    if (href === '/merchant/dashboard') return pathname === '/merchant/dashboard'
    return pathname.startsWith(href)
  }

  const owner = userRole === 'owner'

  /* ── LOADING STATE ── */
  if (loading) {
    return (
      <div className="merchant-loading">
        <div className="loading-spinner" />
        <p className="loading-text">Loading dashboard...</p>
        <style dangerouslySetInnerHTML={{ __html: `
          .merchant-loading {
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            min-height: 100vh; background: #F5F5F0; gap: 16px;
          }
          .loading-spinner {
            width: 40px; height: 40px; border: 3px solid #e5e5e5;
            border-top-color: #B8936D; border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          .loading-text { font-size: 14px; color: #999; font-weight: 500; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}} />
      </div>
    )
  }

  /* ── ERROR STATE ── */
  if (error === 'no-agency') {
    return (
      <div className="merchant-error">
        <div className="error-card">
          <div className="error-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h1 className="error-title">No Agency Found</h1>
          <p className="error-desc">Your account is not linked to any agency. Please contact your admin for assistance.</p>
          <button onClick={handleLogout} className="error-btn">
            Back to Login
          </button>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          .merchant-error {
            display: flex; align-items: center; justify-content: center;
            min-height: 100vh; background: #F5F5F0; padding: 20px;
          }
          .error-card {
            background: white; padding: 48px; border-radius: 16px;
            text-align: center; max-width: 420px; width: 100%;
            box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          }
          .error-icon { margin-bottom: 20px; }
          .error-title { font-size: 22px; font-weight: 700; color: #2C2C2C; margin: 0 0 12px; }
          .error-desc { font-size: 15px; color: #666; margin: 0 0 28px; line-height: 1.5; }
          .error-btn {
            padding: 12px 32px; background: #B8936D; color: white; border: none;
            border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer;
            transition: background 0.2s;
          }
          .error-btn:hover { background: #a07d5a; }
        `}} />
      </div>
    )
  }

  /* ── MAIN LAYOUT ── */
  return (
    <>
      <div className="merchant-layout">
        {/* Overlay (mobile) */}
        {isMobile && sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── SIDEBAR ── */}
        <aside className={`merchant-sidebar ${isMobile ? (sidebarOpen ? 'open' : 'closed') : ''}`}>
          {/* Logo */}
          <div className="sidebar-header">
            <Link href="/merchant/dashboard" className="logo-link">
              <div className="logo-icon">🕌</div>
              <div>
                <div className="logo-title">iHRAM</div>
                <div className="logo-sub">Merchant Dashboard</div>
              </div>
            </Link>
            {isMobile && (
              <button className="close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
                ✕
              </button>
            )}
          </div>

          {/* User + Agency badge */}
          {(userName || agencyName) && (
            <div className="agency-badge">
              {userName && (
                <div className="user-name-row">
                  <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="agency-label">USER</div>
                    <div className="user-name-value">{userName}</div>
                  </div>
                </div>
              )}
              {agencyName && (
                <>
                  <div className="agency-divider" />
                  <div className="agency-label">AGENCY</div>
                  <div className="agency-name">{agencyName}</div>
                </>
              )}
              <div className={`role-badge ${owner ? 'owner' : 'staff'}`}>
                {owner ? '👑 OWNER' : '👤 STAFF'}
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="sidebar-nav">
            {navSections.map((section, si) => (
              <div key={si} className={section.title ? 'nav-section' : ''}>
                {section.title && <div className="nav-section-title">{section.title}</div>}
                {section.items.map((item) => {
                  const active = isActive(item.href)
                  const locked = item.ownerOnly && !owner

                  if (locked) {
                    return (
                      <div key={item.href} className="nav-link disabled">
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                        <span className="owner-tag">OWNER</span>
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-link ${active ? 'active' : ''}`}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                      {active && <span className="active-dot" />}
                      {item.staffBadge && !owner && (
                        <span className="staff-badge">{item.staffBadge}</span>
                      )}
                    </Link>
                  )
                })}
              </div>
            ))}

            {/* Logout — inside scrollable nav, bottom */}
            <div className="nav-logout">
              <button onClick={handleLogout} className="logout-btn">
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </nav>

        </aside>

        {/* ── MAIN ── */}
        <main className="merchant-main">
          {/* Top bar (mobile) */}
          {isMobile && (
            <div className="topbar">
              <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                <span /><span /><span />
              </button>
              <div className="topbar-logo">
                <span className="topbar-icon">🕌</span>
                <span className="topbar-title">iHRAM</span>
                <span className="topbar-badge">Merchant</span>
              </div>
              <div style={{ width: 40 }} />
            </div>
          )}
          <div className="merchant-content">
            {children}
          </div>
        </main>
      </div>

      {/* ── STYLES ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* ===== BASE ===== */
        .merchant-layout {
          display: flex;
          min-height: 100vh;
          background-color: #F5F5F0;
        }

        /* ===== SIDEBAR ===== */
        .merchant-sidebar {
          width: 260px;
          background: linear-gradient(180deg, #1A1A1A 0%, #111111 100%);
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          z-index: 50;
          border-right: 1px solid rgba(184, 147, 109, 0.1);
        }

        /* Scrollbar */
        .merchant-sidebar::-webkit-scrollbar { width: 6px; }
        .merchant-sidebar::-webkit-scrollbar-track { background: transparent; }
        .merchant-sidebar::-webkit-scrollbar-thumb { background: rgba(184,147,109,0.3); border-radius: 3px; }
        .merchant-sidebar::-webkit-scrollbar-thumb:hover { background: rgba(184,147,109,0.5); }
        .merchant-sidebar { scrollbar-width: thin; scrollbar-color: rgba(184,147,109,0.3) transparent; }

        /* Header */
        .sidebar-header {
          padding: 24px 20px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .logo-link {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }
        .logo-icon { font-size: 28px; }
        .logo-title { font-size: 20px; font-weight: 700; color: #B8936D; letter-spacing: 1px; }
        .logo-sub { font-size: 11px; color: #666; font-weight: 500; letter-spacing: 0.5px; }
        .close-btn {
          background: rgba(255,255,255,0.08);
          border: none;
          color: #999;
          font-size: 18px;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .close-btn:hover { background: rgba(255,255,255,0.15); color: white; }

        /* Agency badge */
        .agency-badge {
          padding: 14px 20px;
          background: rgba(184,147,109,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .agency-label { color: #555; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 4px; }
        .agency-name { font-weight: 600; color: white; font-size: 14px; line-height: 1.3; }
        .role-badge {
          margin-top: 8px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .role-badge.owner {
          color: #F87171;
          background: rgba(248,113,113,0.1);
        }
        .role-badge.staff {
          color: #B8936D;
          background: rgba(184,147,109,0.1);
        }

        /* Nav */
        .sidebar-nav {
          flex: 1;
          padding: 16px 12px 24px;
          overflow-y: auto;
        }
        .nav-section { margin-top: 24px; }
        .nav-section:first-child { margin-top: 0; }
        .nav-section-title {
          font-size: 10px;
          color: #555;
          font-weight: 700;
          padding: 0 12px;
          margin-bottom: 8px;
          letter-spacing: 1.5px;
        }
        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          color: #aaa;
          text-decoration: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 2px;
          transition: all 0.2s ease;
          position: relative;
        }
        .nav-link:hover:not(.disabled) {
          background: rgba(184, 147, 109, 0.08);
          color: #fff;
        }
        .nav-link.active {
          background: rgba(184, 147, 109, 0.12);
          color: #B8936D;
          font-weight: 600;
        }
        .nav-link.disabled {
          color: #444;
          cursor: not-allowed;
          opacity: 0.5;
        }
        .nav-icon { font-size: 16px; flex-shrink: 0; width: 24px; text-align: center; }
        .nav-label { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .active-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #B8936D;
          margin-left: auto;
          flex-shrink: 0;
          box-shadow: 0 0 8px rgba(184,147,109,0.5);
        }
        .owner-tag {
          font-size: 9px;
          margin-left: auto;
          background: #333;
          padding: 2px 6px;
          border-radius: 4px;
          color: #666;
          font-weight: 600;
          letter-spacing: 0.5px;
        }
        .staff-badge {
          font-size: 10px;
          margin-left: auto;
          background: rgba(184,147,109,0.1);
          border: 1px solid rgba(184,147,109,0.2);
          padding: 2px 6px;
          border-radius: 4px;
          color: #B8936D;
          font-weight: 600;
        }

        /* User name row in badge */
        .user-name-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #B8936D, #8B6B4A);
          color: white;
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .user-name-value { font-size: 13px; color: #B8936D; font-weight: 600; }
        .agency-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 10px 0; }

        /* Logout inside nav */
        .nav-logout {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 10px 12px;
          color: white;
          width: 100%;
          border: none;
          background: #DC2626;
          cursor: pointer;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          transition: background 0.2s;
        }
        .logout-btn:hover { background: #b91c1c; }

        /* ===== MAIN ===== */
        .merchant-main {
          margin-left: 260px;
          flex: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow-x: hidden;
        }
        .merchant-content {
          padding: 32px 40px;
          flex: 1;
          min-width: 0;
          overflow-x: hidden;
        }

        /* ===== TOP BAR (mobile) ===== */
        .topbar {
          display: none;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: #1A1A1A;
          border-bottom: 1px solid rgba(184,147,109,0.15);
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .hamburger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .hamburger:hover { background: rgba(255,255,255,0.08); }
        .hamburger span {
          display: block;
          width: 22px;
          height: 2px;
          background: #B8936D;
          border-radius: 2px;
        }
        .topbar-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .topbar-icon { font-size: 22px; }
        .topbar-title { font-size: 18px; font-weight: 700; color: #B8936D; letter-spacing: 1px; }
        .topbar-badge {
          font-size: 10px;
          font-weight: 700;
          color: #B8936D;
          background: rgba(184,147,109,0.12);
          padding: 2px 8px;
          border-radius: 4px;
          letter-spacing: 0.5px;
        }

        /* ===== OVERLAY ===== */
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 45;
          animation: fadeIn 0.2s ease;
        }

        /* ===== ANIMATIONS ===== */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ===== RESPONSIVE ===== */

        /* Tablet: < 1024px */
        @media (max-width: 1023px) {
          .merchant-sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            width: 280px;
            box-shadow: 4px 0 24px rgba(0,0,0,0.3);
          }
          .merchant-sidebar.open {
            transform: translateX(0);
          }
          .merchant-main {
            margin-left: 0;
          }
          .topbar {
            display: flex;
          }
          .merchant-content {
            padding: 24px 20px;
          }
        }

        /* Mobile: < 640px */
        @media (max-width: 639px) {
          .merchant-sidebar { width: 280px; }
          .merchant-content {
            padding: 16px;
            overflow-x: hidden;
          }
          .topbar {
            padding: 10px 12px;
          }
        }
      `}} />
    </>
  )
}