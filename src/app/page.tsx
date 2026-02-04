import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: packages } = await supabase
    .from('packages')
    .select(`
      *,
      agencies (
        name,
        slug,
        logo_url
      )
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .limit(6)
    .order('created_at', { ascending: false })

  return (
    <div style={{ backgroundColor: '#F5F5F0', minHeight: '100vh' }}>
      
      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E5E0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
             <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img 
              src="/logo.png" 
              alt="iHRAM" 
              style={{ 
                height: '50px',
                filter: 'brightness(0) saturate(100%) invert(56%) sepia(35%) saturate(643%) hue-rotate(358deg) brightness(95%) contrast(92%) drop-shadow(2px 2px 4px rgba(184,147,109,0.3))'
              }} 
            />
          </Link>

          <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            <Link href="/" style={{ color: '#B8936D', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Home</Link>
            <Link href="/pakej" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Pakej Umrah</Link>
            <Link href="/agensi" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Agensi</Link>
            <Link href="/panduan" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Panduan</Link>
            <Link href="/ulasan" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Ulasan</Link>
            <Link href="/tentang" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Tentang</Link>
            <Link href="/hubungi" style={{ padding: '12px 32px', backgroundColor: '#B8936D', color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: '600' }}>
              HUBUNGI KAMI
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ position: 'relative', height: '700px', backgroundImage: 'url(https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1600)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 20px' }}>
          <p style={{ color: 'white', fontSize: '24px', marginBottom: '24px', fontFamily: 'Georgia, serif', letterSpacing: '2px' }}>
لَبَّيْكَ اللَّهُمَّ لَبَّيْك
          </p>
          <h1 style={{ color: 'white', fontSize: '64px', fontWeight: 'bold', marginBottom: '24px', fontFamily: 'Georgia, serif', maxWidth: '1000px', lineHeight: '1.2' }}>
            Platform Discovery Pakej Umrah Malaysia
          </h1>
          <p style={{ color: 'white', fontSize: '20px', marginBottom: '40px', maxWidth: '800px', lineHeight: '1.6' }}>
            Temui pakej umrah yang sesuai dengan anda dari agensi-agensi terpercaya di Malaysia
          </p>
          <Link href="/pakej" style={{ padding: '18px 48px', backgroundColor: '#B8936D', color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '18px', fontWeight: '600', boxShadow: '0 4px 20px rgba(184,147,109,0.4)' }}>
            TEROKAI PAKEJ
          </Link>
        </div>

        {/* Three Category Cards Overlay */}
        <div style={{ position: 'absolute', bottom: '-60px', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '1400px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', padding: '0 20px' }}>
          <Link href="/pakej" style={{ textDecoration: 'none' }}>
            <div style={{ position: 'relative', height: '200px', backgroundImage: 'url(https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px', overflow: 'hidden', border: '2px solid white' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h3 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>Pakej Umrah</h3>
              </div>
            </div>
          </Link>
          <Link href="/agensi" style={{ textDecoration: 'none' }}>
            <div style={{ position: 'relative', height: '200px', backgroundImage: 'url(https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=600)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px', overflow: 'hidden', border: '2px solid white' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h3 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>Agensi Terpercaya</h3>
              </div>
            </div>
          </Link>
          <Link href="/panduan" style={{ textDecoration: 'none' }}>
            <div style={{ position: 'relative', height: '200px', backgroundImage: 'url(https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=600)', backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px', overflow: 'hidden', border: '2px solid white' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <h3 style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>Panduan & Tips</h3>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div style={{ height: '100px' }}></div>

      {/* About Section */}
      <div style={{ maxWidth: '1400px', margin: '80px auto', padding: '0 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '80px', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '100%', aspectRatio: '1', borderRadius: '50%', overflow: 'hidden', border: '8px solid white', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
              <div style={{ width: '100%', height: '100%', backgroundImage: 'url(https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
            </div>
          </div>
          <div>
            <h2 style={{ fontSize: '48px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px', fontFamily: 'Georgia, serif' }}>
              Tentang iHRAM
            </h2>
            <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#4A4A4A', marginBottom: '20px' }}>
              Di <strong style={{ color: '#B8936D' }}>iHRAM</strong>, kami berdedikasi untuk menyediakan platform discovery pakej umrah yang memudahkan umat Islam Malaysia mencari pakej yang sesuai dengan keperluan mereka.
            </p>
            <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#4A4A4A', marginBottom: '20px' }}>
              Sebagai <strong style={{ color: '#B8936D' }}>platform pertama</strong> di Malaysia, kami menawarkan perbandingan pakej yang telus, ulasan jemaah sebenar, dan direktori agensi yang dipercayai.
            </p>
            <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#4A4A4A' }}>
              Kami tidak mengenakan sebarang bayaran kepada pengguna atau agensi. Misi kami adalah untuk memudahkan perjalanan rohani anda bermula di sini.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Packages */}
      <div style={{ backgroundColor: 'white', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', textAlign: 'center', color: '#2C2C2C', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
            Pakej Umrah Pilihan
          </h2>
          <p style={{ textAlign: 'center', fontSize: '18px', color: '#666', marginBottom: '60px', maxWidth: '700px', margin: '0 auto 60px' }}>
            Pilihan pakej umrah terbaik dari agensi-agensi terpercaya untuk perjalanan rohani anda
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {packages?.slice(0, 6).map((pkg: any) => (
              <Link key={pkg.id} href={`/pakej/${pkg.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                  <div style={{ position: 'relative', height: '250px', backgroundColor: '#E5E5E0' }}>
                    {pkg.photos && pkg.photos[0] && (
                      <div style={{ width: '100%', height: '100%', backgroundImage: `url(${pkg.photos[0]})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
                    )}
                    <div style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'white', padding: '12px 20px', borderRadius: '50px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
                      <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#B8936D' }}>RM {pkg.price_quad?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: '600', color: '#2C2C2C', marginBottom: '12px', fontFamily: 'Georgia, serif' }}>
                      {pkg.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                      {pkg.agencies?.name}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px', color: '#4A4A4A' }}>
                      {pkg.duration_nights && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span>📅</span>
                          <span>{pkg.duration_nights} malam</span>
                        </div>
                      )}
                      {pkg.departure_city && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span>✈️</span>
                          <span>Berlepas dari {pkg.departure_city}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link href="/pakej" style={{ display: 'inline-block', padding: '16px 48px', backgroundColor: '#B8936D', color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '16px', fontWeight: '600' }}>
              Lihat Semua Pakej
            </Link>
          </div>
        </div>
      </div>

      {/* Services */}
      <div style={{ maxWidth: '1400px', margin: '80px auto', padding: '0 40px' }}>
        <h2 style={{ fontSize: '48px', fontWeight: 'bold', textAlign: 'center', color: '#2C2C2C', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
          Perkhidmatan Kami
        </h2>
        <p style={{ textAlign: 'center', fontSize: '18px', color: '#666', marginBottom: '60px', maxWidth: '800px', margin: '0 auto 60px' }}>
          Di iHRAM, kami komited untuk menyediakan platform yang lengkap untuk perjalanan umrah anda
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          <div style={{ backgroundColor: '#E8E2D8', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
              Discovery Pakej
            </h3>
            <p style={{ fontSize: '16px', color: '#4A4A4A', lineHeight: '1.7' }}>
              Platform pertama di Malaysia untuk membandingkan pakej umrah dari pelbagai agensi dalam satu tempat
            </p>
          </div>

          <div style={{ backgroundColor: '#E8E2D8', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⭐</div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
              Sistem Ulasan
            </h3>
            <p style={{ fontSize: '16px', color: '#4A4A4A', lineHeight: '1.7' }}>
              Baca ulasan sebenar dari jemaah yang pernah menggunakan perkhidmatan agensi-agensi terpilih
            </p>
          </div>

          <div style={{ backgroundColor: '#E8E2D8', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📚</div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
              Panduan Lengkap
            </h3>
            <p style={{ fontSize: '16px', color: '#4A4A4A', lineHeight: '1.7' }}>
              Akses panduan lengkap untuk first-timer, senarai packing, dan tips persediaan rohani
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ backgroundColor: 'white', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '48px', fontWeight: 'bold', textAlign: 'center', color: '#2C2C2C', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
            Soalan Lazim
          </h2>
          <p style={{ textAlign: 'center', fontSize: '18px', color: '#666', marginBottom: '60px' }}>
            Jawapan kepada soalan yang kerap ditanya tentang platform iHRAM
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                question: 'Apakah itu iHRAM?',
                answer: 'iHRAM adalah platform discovery pakej umrah pertama di Malaysia yang membolehkan anda membandingkan pakej dari pelbagai agensi terpercaya dalam satu tempat.'
              },
              {
                question: 'Adakah iHRAM mengenakan bayaran?',
                answer: 'Tidak, iHRAM tidak mengenakan sebarang bayaran kepada pengguna atau agensi pada peringkat MVP ini. Platform ini dibangunkan dengan niat ikhlas untuk memudahkan umat Islam Malaysia.'
              },
              {
                question: 'Bagaimana cara booking pakej?',
                answer: 'iHRAM berfungsi sebagai platform discovery. Setelah anda menemui pakej yang sesuai, anda boleh menghubungi agensi secara terus melalui WhatsApp untuk membuat tempahan.'
              },
              {
                question: 'Adakah semua agensi di iHRAM dipercayai?',
                answer: 'Ya, kami hanya menyenaraikan agensi yang berdaftar dan dipercayai. Setiap agensi melalui proses verifikasi sebelum disenaraikan di platform kami.'
              },
              {
                question: 'Bolehkah saya tinggalkan ulasan?',
                answer: 'Ya! Kami menggalakkan jemaah untuk berkongsi pengalaman mereka. Ulasan anda akan membantu jemaah lain membuat keputusan yang lebih bijak.'
              }
            ].map((faq, index) => (
              <details key={index} style={{ backgroundColor: '#B8936D', borderRadius: '8px', overflow: 'hidden' }}>
                <summary style={{ padding: '20px 24px', cursor: 'pointer', fontSize: '18px', fontWeight: '600', color: 'white', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{faq.question}</span>
                  <span style={{ fontSize: '24px' }}>▸</span>
                </summary>
                <div style={{ padding: '0 24px 24px', fontSize: '16px', color: 'white', lineHeight: '1.7' }}>
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#B8936D', color: 'white', padding: '60px 40px 30px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '60px', marginBottom: '40px' }}>
            
            <div>
              <div style={{ marginBottom: '20px' }}>
                <img 
                  src="/logo.png" 
                  alt="iHRAM" 
                  style={{ 
                    height: '50px',
                    filter: 'brightness(0) invert(1) drop-shadow(2px 2px 4px rgba(255,255,255,0.2))'
                  }} 
                />
              </div>
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'rgba(255,255,255,0.9)' }}>
                Platform discovery pakej umrah pertama di Malaysia yang memudahkan umat Islam mencari pakej yang sesuai dengan keperluan mereka.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
                Pautan Pantas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Home</Link>
                <Link href="/pakej" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Pakej Umrah</Link>
                <Link href="/agensi" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Agensi</Link>
                <Link href="/panduan" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Panduan</Link>
                <Link href="/ulasan" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Ulasan</Link>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
                Hubungi Kami
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '16px', color: 'rgba(255,255,255,0.9)' }}>
                <div>
                  <strong>Email:</strong><br/>
                  info@ihram.com.my
                </div>
                <div>
                  <strong>WhatsApp:</strong><br/>
                  +60 12-345 6789
                </div>
                <div>
                  <strong>Waktu Operasi:</strong><br/>
                  Isnin - Jumaat: 9:00 AM - 6:00 PM
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '30px', textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
            <p>© 2026 iHRAM - Think Tank Sdn Bhd. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}