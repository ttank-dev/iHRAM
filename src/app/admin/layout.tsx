import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminLogoutButton from './LogoutButton'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAdmin, user } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0A0A0A' }}>
      <div style={{
        width: '256px',
        backgroundColor: '#1A1A1A',
        borderRight: '1px solid #2A2A2A',
        position: 'fixed',
        height: '100vh',
        left: 0,
        top: 0,
        overflow: 'auto',
        zIndex: 50
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #2A2A2A' }}>
          <h1 style={{ color: '#D4AF37', fontSize: '24px', fontWeight: 'bold' }}>iHRAM</h1>
          <p style={{ color: '#A0A0A0', fontSize: '14px', marginTop: '4px' }}>Admin Panel</p>
        </div>
        
        <div style={{ padding: '24px', borderBottom: '1px solid #2A2A2A' }}>
          <p style={{ color: '#A0A0A0', fontSize: '14px' }}>Logged in as</p>
          <p style={{ color: 'white', fontWeight: '600', marginTop: '4px' }}>{user?.email}</p>
        </div>

        <nav style={{ padding: '16px', paddingBottom: '80px' }}>
          <Link href="/admin" style={{ display: 'block', padding: '12px 16px', color: '#A0A0A0', textDecoration: 'none', borderRadius: '8px', marginBottom: '8px' }}>
            📊 Dashboard
          </Link>
          <Link href="/admin/agensi" style={{ display: 'block', padding: '12px 16px', color: '#A0A0A0', textDecoration: 'none', borderRadius: '8px', marginBottom: '8px' }}>
            🏢 Agensi
          </Link>
          <Link href="/admin/pakej" style={{ display: 'block', padding: '12px 16px', color: '#A0A0A0', textDecoration: 'none', borderRadius: '8px', marginBottom: '8px' }}>
            📦 Pakej
          </Link>
          <Link href="/admin/ulasan" style={{ display: 'block', padding: '12px 16px', color: '#A0A0A0', textDecoration: 'none', borderRadius: '8px', marginBottom: '8px' }}>
            ⭐ Ulasan
          </Link>
          <Link href="/admin/panduan" style={{ display: 'block', padding: '12px 16px', color: '#A0A0A0', textDecoration: 'none', borderRadius: '8px', marginBottom: '8px' }}>
            📝 Panduan
          </Link>
          <Link href="/admin/leads" style={{ display: 'block', padding: '12px 16px', color: '#A0A0A0', textDecoration: 'none', borderRadius: '8px', marginBottom: '8px' }}>
            📈 Leads
          </Link>
          <Link href="/admin/sumbangan" style={{ display: 'block', padding: '12px 16px', color: '#A0A0A0', textDecoration: 'none', borderRadius: '8px', marginBottom: '8px' }}>
            💰 Sumbangan
          </Link>
        </nav>

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px', borderTop: '1px solid #2A2A2A', backgroundColor: '#1A1A1A' }}>
          <AdminLogoutButton />
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#A0A0A0', textDecoration: 'none', borderRadius: '8px', marginTop: '8px' }}>
            🏠 View Site
          </Link>
        </div>
      </div>

      <div style={{ 
        marginLeft: '256px',
        width: 'calc(100vw - 256px)',
        minHeight: '100vh',
        padding: '32px',
        backgroundColor: '#0A0A0A',
        boxSizing: 'border-box'
      }}>
        {children}
      </div>
    </div>
  )
}