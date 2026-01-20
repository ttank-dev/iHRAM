import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()

  // Get featured packages (only from active agencies)
  const { data: featuredPackages } = await supabase
    .from('packages')
    .select(`
      *,
      agencies!inner(name, is_active)
    `)
    .eq('status', 'published')
    .eq('agencies.is_active', true)
    .order('created_at', { ascending: false })
    .limit(6)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: 'white' }}>
      {/* Hero Section */}
      <div style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '16px' }}>
          <span style={{ color: '#D4AF37' }}>iHRAM</span>
        </h1>
        <p style={{ fontSize: '24px', color: '#A0A0A0', marginBottom: '32px' }}>
          Perjalanan Anda Bermula Di Sini
        </p>
        <p style={{ fontSize: '18px', color: '#E5E5E5', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
          Platform discovery pakej umrah pertama di Malaysia yang telus dan mudah
        </p>
        <Link 
          href="/pakej"
          style={{ 
            display: 'inline-block',
            padding: '16px 32px',
            backgroundColor: '#D4AF37',
            color: 'black',
            textDecoration: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '18px'
          }}
        >
          Terokai Pakej Umrah
        </Link>
      </div>

      {/* Featured Packages */}
      <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px', textAlign: 'center' }}>
          Pakej Popular
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {featuredPackages?.map((pkg: any) => (
            <Link
              key={pkg.id}
              href={`/pakej/${pkg.slug}`}
              style={{ 
                textDecoration: 'none',
                backgroundColor: '#1A1A1A',
                border: '1px solid #2A2A2A',
                borderRadius: '8px',
                overflow: 'hidden',
                transition: 'border-color 0.2s'
              }}
            >
              <div style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>
                  {pkg.title}
                </h3>
                <p style={{ color: '#A0A0A0', fontSize: '14px', marginBottom: '16px' }}>
                  {pkg.agencies?.name || 'Unknown Agency'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ color: '#A0A0A0', fontSize: '12px' }}>Dari</p>
                    <p style={{ color: '#D4AF37', fontSize: '24px', fontWeight: 'bold' }}>
                      RM{pkg.price_quad?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <span style={{ color: '#D4AF37', fontSize: '14px' }}>Lihat Detail →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {(!featuredPackages || featuredPackages.length === 0) && (
          <p style={{ textAlign: 'center', color: '#A0A0A0', padding: '60px 20px' }}>
            Tiada pakej tersedia buat masa ini
          </p>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #2A2A2A', padding: '40px 20px', textAlign: 'center', marginTop: '60px' }}>
        <p style={{ color: '#A0A0A0' }}>© 2026 iHRAM - Think Tank Sdn Bhd</p>
      </div>
    </div>
  )
}