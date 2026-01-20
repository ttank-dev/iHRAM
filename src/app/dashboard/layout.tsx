import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: agency } = await supabase
    .from('agencies')
    .select('name')
    .eq('user_id', user.id)
    .single()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0A0A0A' }}>
      {/* Sidebar */}
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
          <p style={{ color: '#A0A0A0', fontSize: '14px', marginTop: '4px' }}>Dashboard</p>
        </div>
        
        <div style={{ padding: '24px', borderBottom: '1px solid #2A2A2A' }}>
          <p style={{ color: '#A0A0A0', fontSize: '14px' }}>Selamat Kembali</p>
          <p style={{ color: 'white', fontWeight: '600', marginTop: '4px' }}>{agency?.name || 'Agensi'}</p>
        </div>

        <nav style={{ padding: '16px', paddingBottom: '80px' }}>
          <Link 
            href="/dashboard"
            style={{ 
              display: 'block',
              padding: '12px 16px',
              color: '#A0A0A0',
              textDecoration: 'none',
              borderRadius: '8px',
              marginBottom: '8px',
              transition: 'all 0.2s'
            }}
          >
            📊 Dashboard
          </Link>
          <Link 
            href="/dashboard/pakej"
            style={{ 
              display: 'block',
              padding: '12px 16px',
              color: '#A0A0A0',
              textDecoration: 'none',
              borderRadius: '8px',
              marginBottom: '8px'
            }}
          >
            📦 Pakej Saya
          </Link>
          <Link 
            href="/dashboard/profil"
            style={{ 
              display: 'block',
              padding: '12px 16px',
              color: '#A0A0A0',
              textDecoration: 'none',
              borderRadius: '8px',
              marginBottom: '8px'
            }}
          >
            👤 Profil Agensi
          </Link>
          <Link 
            href="/dashboard/ulasan"
            style={{ 
              display: 'block',
              padding: '12px 16px',
              color: '#A0A0A0',
              textDecoration: 'none',
              borderRadius: '8px',
              marginBottom: '8px'
            }}
          >
            ⭐ Ulasan
          </Link>
        </nav>

        {/* Logout Button - Fixed at bottom */}
        <div style={{ 
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          borderTop: '1px solid #2A2A2A',
          backgroundColor: '#1A1A1A'
        }}>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 16px',
                color: '#EF4444',
                backgroundColor: 'transparent',
                border: 'none',
                textAlign: 'left',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              🚪 Log Keluar
            </button>
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        marginLeft: '256px', 
        flex: 1,
        padding: '32px',
        minHeight: '100vh'
      }}>
        {children}
      </div>
    </div>
  )
}