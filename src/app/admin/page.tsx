import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'

export default async function AdminDashboardPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  return (
    <div>
      <h1 style={{ color: 'white', fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
        Admin Dashboard
      </h1>
      <p style={{ color: '#A0A0A0', marginBottom: '32px' }}>
        Platform overview dan statistik
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
        <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '24px' }}>
          <p style={{ color: '#A0A0A0', fontSize: '14px', marginBottom: '8px' }}>Total Pakej</p>
          <p style={{ color: 'white', fontSize: '36px', fontWeight: 'bold' }}>25</p>
        </div>

        <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '24px' }}>
          <p style={{ color: '#A0A0A0', fontSize: '14px', marginBottom: '8px' }}>Total Agensi</p>
          <p style={{ color: 'white', fontSize: '36px', fontWeight: 'bold' }}>10</p>
        </div>

        <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '24px' }}>
          <p style={{ color: '#A0A0A0', fontSize: '14px', marginBottom: '8px' }}>Pending Ulasan</p>
          <p style={{ color: 'white', fontSize: '36px', fontWeight: 'bold' }}>5</p>
        </div>

        <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '24px' }}>
          <p style={{ color: '#A0A0A0', fontSize: '14px', marginBottom: '8px' }}>Total Leads</p>
          <p style={{ color: 'white', fontSize: '36px', fontWeight: 'bold' }}>150</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '24px' }}>
        <h2 style={{ color: 'white', fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <a href="/admin/agensi" style={{ display: 'block', padding: '16px', backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '8px', textDecoration: 'none', color: 'white' }}>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>🏢 Manage Agensi</p>
            <p style={{ color: '#A0A0A0', fontSize: '14px' }}>Verify and suspend</p>
          </a>
          <a href="/admin/ulasan" style={{ display: 'block', padding: '16px', backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '8px', textDecoration: 'none', color: 'white' }}>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>⭐ Approve Ulasan</p>
            <p style={{ color: '#A0A0A0', fontSize: '14px' }}>5 pending</p>
          </a>
          <a href="/admin/leads" style={{ display: 'block', padding: '16px', backgroundColor: '#0A0A0A', border: '1px solid #2A2A2A', borderRadius: '8px', textDecoration: 'none', color: 'white' }}>
            <p style={{ fontWeight: '600', marginBottom: '4px' }}>📈 View Leads</p>
            <p style={{ color: '#A0A0A0', fontSize: '14px' }}>Track clicks</p>
          </a>
        </div>
      </div>
    </div>
  )
}