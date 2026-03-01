'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

/* ───────────────────────────── NAV DATA ───────────────────────────── */
type NavItem = { href: string; icon: string; label: string; indent?: boolean }
type NavSection = { title: string; items: NavItem[] }

const navSections: NavSection[] = [
  {
    title: '',
    items: [
      { href: '/admin', icon: '📊', label: 'Dashboard' },
    ],
  },
  {
    title: 'MANAGEMENT',
    items: [
      { href: '/admin/agensi', icon: '🏢', label: 'Agencies' },
      { href: '/admin/verifikasi', icon: '✅', label: 'Verifications' },
      { href: '/admin/pakej', icon: '📦', label: 'Packages' },
      { href: '/admin/ulasan', icon: '⭐', label: 'Reviews' },
      { href: '/admin/panduan', icon: '📚', label: 'Guides' },
      { href: '/admin/panduan/categories', icon: '🏷️', label: 'Categories', indent: true },
      { href: '/admin/leads', icon: '🎯', label: 'Leads' },
    ],
  },
  {
    title: 'CONTENT',
    items: [
      { href: '/admin/newsfeed', icon: '📰', label: 'News Feed' },
      { href: '/admin/reels', icon: '🎬', label: 'Reels' },
      { href: '/admin/galeri', icon: '🖼️', label: 'Gallery' },
    ],
  },
  {
    title: 'SETTINGS',
    items: [
      { href: '/admin/sumbangan', icon: '💰', label: 'Donations' },
      { href: '/admin/settings', icon: '⚙️', label: 'Settings' },
      { href: '/admin/logs', icon: '📋', label: 'Moderation Logs' },
    ],
  },
]

/* ───────────────────────────── COMPONENT ───────────────────────────── */
export default function AdminSidebarClient({ children, adminName }: { children: React.ReactNode; adminName?: string }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <>
      <div className="admin-layout">
        {/* ── OVERLAY (mobile) ── */}
        {isMobile && sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── SIDEBAR ── */}
        <aside className={`admin-sidebar ${isMobile ? (sidebarOpen ? 'open' : 'closed') : ''}`}>
          {/* Logo */}
          <div className="sidebar-header">
            <Link href="/admin" className="logo-link">
              <div className="logo-icon">🕌</div>
              <div>
                <div className="logo-title">iHRAM</div>
                <div className="logo-sub">Admin Dashboard</div>
              </div>
            </Link>
            {/* Close button mobile */}
            {isMobile && (
              <button className="close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
                ✕
              </button>
            )}
          </div>

          {/* Admin name badge */}
          {adminName && (
            <div className="admin-name-badge">
              <div className="admin-avatar">{adminName.charAt(0).toUpperCase()}</div>
              <div>
                <div className="admin-name-label">Dashboard</div>
                <div className="admin-name-value">{adminName}</div>
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
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-link ${active ? 'active' : ''} ${item.indent ? 'indented' : ''}`}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                      {active && <span className="active-dot" />}
                    </Link>
                  )
                })}
              </div>
            ))}
            {/* Logout - inside scrollable nav, bottom */}
            <div className="nav-logout">
              <LogoutButton />
            </div>
          </nav>
        </aside>

        {/* ── MAIN ── */}
        <main className="admin-main">
          {/* Top bar (mobile) */}
          {isMobile && (
            <div className="topbar">
              <button className="hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
                <span /><span /><span />
              </button>
              <div className="topbar-logo">
                <span className="topbar-icon">🕌</span>
                <span className="topbar-title">iHRAM</span>
                <span className="topbar-badge">Admin</span>
              </div>
              <div style={{ width: 40 }} />
            </div>
          )}
          <div className="admin-content">
            {children}
          </div>
        </main>
      </div>

      {/* ── STYLES ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* ===== RESET & BASE ===== */
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background-color: #F5F5F0;
        }

        /* ===== SIDEBAR ===== */
        .admin-sidebar {
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
        .admin-sidebar::-webkit-scrollbar { width: 6px; }
        .admin-sidebar::-webkit-scrollbar-track { background: transparent; }
        .admin-sidebar::-webkit-scrollbar-thumb { background: rgba(184,147,109,0.3); border-radius: 3px; }
        .admin-sidebar::-webkit-scrollbar-thumb:hover { background: rgba(184,147,109,0.5); }
        .admin-sidebar { scrollbar-width: thin; scrollbar-color: rgba(184,147,109,0.3) transparent; }

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
        .nav-link:hover {
          background: rgba(184, 147, 109, 0.08);
          color: #fff;
        }
        .nav-link.active {
          background: rgba(184, 147, 109, 0.12);
          color: #B8936D;
          font-weight: 600;
        }
        .nav-link.indented {
          padding-left: 44px;
          font-size: 13px;
        }
        .nav-link.indented:not(.active) { color: #777; }
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

        /* Admin name badge */
        .admin-name-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: rgba(184,147,109,0.06);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          flex-shrink: 0;
        }
        .admin-avatar {
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
        .admin-name-label { font-size: 10px; color: #555; font-weight: 600; letter-spacing: 0.5px; }
        .admin-name-value { font-size: 13px; color: #B8936D; font-weight: 600; }

        /* Logout inside nav */
        .nav-logout {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        /* ===== MAIN ===== */
        .admin-main {
          margin-left: 260px;
          flex: 1;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .admin-content {
          padding: 32px 40px;
          flex: 1;
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
          transition: all 0.3s;
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
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        @keyframes slideOut {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }

        /* ===== RESPONSIVE ===== */

        /* Tablet: < 1024px */
        @media (max-width: 1023px) {
          .admin-sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            width: 280px;
            box-shadow: 4px 0 24px rgba(0,0,0,0.3);
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-main {
            margin-left: 0;
            overflow-x: hidden;
            width: 100%;
          }
          .topbar {
            display: flex;
          }
          .admin-content {
            padding: 24px 20px;
          }
        }

        /* Mobile: < 640px */
        @media (max-width: 639px) {
          .admin-sidebar { width: 280px; }
          .admin-content {
            padding: 16px 12px;
          }
          .topbar {
            padding: 10px 12px;
          }
        }
      `}} />
    </>
  )
}