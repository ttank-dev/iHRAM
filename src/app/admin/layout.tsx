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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F5F5F0' }}>
      {/* SIDEBAR */}
      <aside style={{
        width: '240px',
        backgroundColor: '#1A1A1A',
        color: 'white',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Logo / Header */}
        <div style={{ padding: '24px' }}>
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

        {/* Menu Items */}
        <nav style={{ flex: 1, padding: '0 16px' }}>
          
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
          </div>

          {/* SPACER - Push logout to bottom */}
          <div style={{ flex: 1 }} />
        </nav>

        {/* LOGOUT BUTTON - At the bottom */}
        <div style={{ padding: '16px', borderTop: '1px solid #333' }}>
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
  )
}