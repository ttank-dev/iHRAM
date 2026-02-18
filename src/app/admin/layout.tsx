import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  return (
    <>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5F5F0' }}>
        {/* SIDEBAR - FIXED WITH SCROLLING */}
        <aside 
          className="admin-sidebar"
          style={{
            width: '240px',
            backgroundColor: '#1A1A1A',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            position: 'fixed',
            height: '100vh',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {/* Logo / Header - Fixed at top */}
          <div style={{ 
            padding: '24px',
            flexShrink: 0
          }}>
            <Link href="/admin" style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>🕌</div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#B8936D' }}>iHRAM</div>
                  <div style={{ fontSize: '11px', color: '#999' }}>Admin Dashboard</div>
                </div>
              </div>
            </Link>
          </div>

          {/* Menu Items - Scrollable area */}
          <nav style={{ 
            flex: 1, 
            padding: '0 16px',
            overflowY: 'auto',
            paddingBottom: '24px'
          }}>
            
            {/* Dashboard */}
            <Link href="/admin" style={{
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
              
              <Link href="/admin/agensi" style={{
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
                <span>Agensi</span>
              </Link>

              <Link href="/admin/verifikasi" style={{
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
                <span>Review Verifikasi</span>
              </Link>

              <Link href="/admin/pakej" style={{
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
                <span>Pakej</span>
              </Link>

              <Link href="/admin/ulasan" style={{
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

              <Link href="/admin/panduan" style={{
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
                <span>📚</span>
                <span>Panduan</span>
              </Link>

              <Link href="/admin/panduan/categories" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px 10px 36px',
                color: '#999',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '500',
                marginBottom: '4px'
              }}>
                <span>🏷️</span>
                <span>Categories</span>
              </Link>

              <Link href="/admin/leads" style={{
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
                <span>🎯</span>
                <span>Leads</span>
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
              
              <Link href="/admin/newsfeed" style={{
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

              <Link href="/admin/reels" style={{
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

              {/* 🖼️ GALERI LINK */}
              <Link href="/admin/galeri" style={{
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
              
              <Link href="/admin/sumbangan" style={{
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
                <span>💰</span>
                <span>Sumbangan</span>
              </Link>

              <Link href="/admin/settings" style={{
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

              <Link href="/admin/logs" style={{
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
                <span>📋</span>
                <span>Moderation Logs</span>
              </Link>
            </div>
          </nav>

          {/* LOGOUT BUTTON - Fixed at bottom */}
          <div style={{ 
            padding: '16px', 
            borderTop: '1px solid #333',
            flexShrink: 0
          }}>
            <LogoutButton />
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

      {/* CSS in separate style tag - works in Server Components */}
      <style dangerouslySetInnerHTML={{__html: `
        .admin-sidebar::-webkit-scrollbar {
          width: 8px;
        }
        
        .admin-sidebar::-webkit-scrollbar-track {
          background: #2C2C2C;
        }
        
        .admin-sidebar::-webkit-scrollbar-thumb {
          background: #B8936D;
          border-radius: 4px;
        }
        
        .admin-sidebar::-webkit-scrollbar-thumb:hover {
          background: #C4A030;
        }
        
        /* Firefox scrollbar */
        .admin-sidebar {
          scrollbar-width: thin;
          scrollbar-color: #B8936D #2C2C2C;
        }
      `}} />
    </>
  )
}