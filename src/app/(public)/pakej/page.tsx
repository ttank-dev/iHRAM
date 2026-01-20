import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PakejPage() {
  const supabase = await createClient()

  // Get all published packages (only from active agencies)
  const { data: packages } = await supabase
    .from('packages')
    .select(`
      *,
      agencies!inner(name, is_active)
    `)
    .eq('status', 'published')
    .eq('agencies.is_active', true)
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '8px' }}>
          Senarai Pakej Umrah
        </h1>
        <p style={{ color: '#A0A0A0', marginBottom: '48px', fontSize: '18px' }}>
          Bandingkan dan pilih pakej umrah yang sesuai untuk anda
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          {packages?.map((pkg: any) => (
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
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'white', marginBottom: '8px' }}>
                  {pkg.title}
                </h3>
                <p style={{ color: '#A0A0A0', fontSize: '14px', marginBottom: '4px' }}>
                  {pkg.agencies?.name || 'Unknown Agency'}
                </p>
                <p style={{ color: '#666', fontSize: '12px', marginBottom: '16px' }}>
                  {pkg.duration_nights} malam
                </p>
                
                {pkg.description && (
                  <p style={{ 
                    color: '#A0A0A0', 
                    fontSize: '14px', 
                    marginBottom: '16px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    {pkg.description}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <div>
                    <p style={{ color: '#A0A0A0', fontSize: '12px' }}>Dari</p>
                    <p style={{ color: '#D4AF37', fontSize: '24px', fontWeight: 'bold' }}>
                      RM{pkg.price_quad?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <span style={{ 
                    padding: '8px 16px',
                    backgroundColor: '#D4AF37',
                    color: 'black',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                    Lihat Detail
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {(!packages || packages.length === 0) && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ color: '#A0A0A0', fontSize: '18px' }}>
              Tiada pakej tersedia buat masa ini
            </p>
          </div>
        )}
      </div>
    </div>
  )
}