import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function PackageDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const supabase = await createClient()
  const { slug } = await params

  const { data: pkg } = await supabase
    .from('packages')
    .select('*, agencies!inner(id, name, phone, email, is_active, is_verified)')
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('agencies.is_active', true)
    .single()

  if (!pkg) {
    notFound()
  }

  const agency = Array.isArray(pkg.agencies) ? pkg.agencies[0] : pkg.agencies

  const cleanPhone = agency.phone?.replace(/\D/g, '') || '' // Remove all non-digits
const phoneWithCountryCode = cleanPhone.startsWith('60') 
  ? cleanPhone 
  : cleanPhone.startsWith('0') 
    ? '60' + cleanPhone.substring(1)  // Remove leading 0, add 60
    : '60' + cleanPhone  // Add 60 if no prefix

const whatsappMessage = encodeURIComponent(`Salam, saya berminat dengan pakej ${pkg.title} dari iHRAM`)
const whatsappLink = `https://wa.me/${phoneWithCountryCode}?text=${whatsappMessage}`

console.log('=== WHATSAPP DEBUG ===')
console.log('Original phone:', agency.phone)
console.log('Cleaned phone:', cleanPhone)
console.log('Final phone:', phoneWithCountryCode)
console.log('WhatsApp link:', whatsappLink)

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: 'white' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
        <Link href="/pakej" style={{ color: '#D4AF37', textDecoration: 'none', fontSize: '14px', marginBottom: '24px', display: 'inline-block' }}>
          ← Kembali ke Senarai Pakej
        </Link>

        <h1 style={{ fontSize: '40px', fontWeight: 'bold', marginBottom: '16px' }}>
          {pkg.title}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <p style={{ color: '#A0A0A0', fontSize: '18px' }}>
            oleh <span style={{ color: 'white', fontWeight: '600' }}>{agency.name}</span>
          </p>
          {agency.is_verified && (
            <span style={{ padding: '4px 12px', backgroundColor: '#10B981', color: 'white', borderRadius: '999px', fontSize: '12px' }}>
              ✓ Verified
            </span>
          )}
        </div>

        {pkg.photos && pkg.photos.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: pkg.photos.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '16px' 
            }}>
              {pkg.photos.map((photoUrl: string, index: number) => (
                <img
                  key={index}
                  src={photoUrl}
                  alt={`${pkg.title} - Image ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '300px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    border: '1px solid #2A2A2A'
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '24px', marginBottom: '32px' }}>
          <p style={{ color: '#A0A0A0', fontSize: '14px', marginBottom: '8px' }}>Harga dari</p>
          <p style={{ color: '#D4AF37', fontSize: '36px', fontWeight: 'bold', marginBottom: '16px' }}>
            RM{pkg.price_quad?.toLocaleString() || '0'}
          </p>
          <p style={{ color: '#A0A0A0', fontSize: '14px' }}>
            {pkg.duration_nights} malam • {pkg.package_type || 'Standard'}
          </p>
        </div>

        {pkg.description && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>Penerangan</h2>
            <p style={{ color: '#E5E5E5', lineHeight: '1.8' }}>{pkg.description}</p>
          </div>
        )}

        {pkg.itinerary && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>Itinerary</h2>
            <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '24px' }}>
              <p style={{ color: '#E5E5E5', lineHeight: '1.8', whiteSpace: 'pre-line' }}>{pkg.itinerary}</p>
            </div>
          </div>
        )}

        {pkg.inclusions && pkg.inclusions.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>Termasuk</h2>
            <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '24px' }}>
              <ul style={{ color: '#E5E5E5', paddingLeft: '20px' }}>
                {pkg.inclusions.map((item: string, index: number) => (
                  <li key={index} style={{ marginBottom: '8px' }}>✓ {item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {pkg.exclusions && pkg.exclusions.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>Tidak Termasuk</h2>
            <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '24px' }}>
              <ul style={{ color: '#E5E5E5', paddingLeft: '20px' }}>
                {pkg.exclusions.map((item: string, index: number) => (
                  <li key={index} style={{ marginBottom: '8px' }}>✗ {item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <a href={whatsappLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '16px 32px', backgroundColor: '#25D366', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '18px', marginTop: '32px' }}>
          💬 Hubungi Agensi via WhatsApp
        </a>

        <div style={{ marginTop: '48px', padding: '24px', backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Info Agensi</h3>
          <p style={{ color: '#E5E5E5', marginBottom: '8px' }}>
            <strong>{agency.name}</strong>
          </p>
          {agency.phone && (
            <p style={{ color: '#A0A0A0', fontSize: '14px', marginBottom: '4px' }}>📞 {agency.phone}</p>
          )}
          {agency.email && (
            <p style={{ color: '#A0A0A0', fontSize: '14px' }}>✉️ {agency.email}</p>
          )}
        </div>
      </div>
    </div>
  )
}