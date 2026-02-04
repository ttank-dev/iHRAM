import Link from 'next/link'

export default function TerimaKasihPage() {
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
            <Link href="/" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Home</Link>
            <Link href="/pakej" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Pakej Umrah</Link>
            <Link href="/agensi" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Agensi</Link>
            <Link href="/panduan" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Panduan</Link>
            <Link href="/ulasan" style={{ color: '#B8936D', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Ulasan</Link>
            <Link href="/tentang" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Tentang</Link>
            <Link href="/hubungi" style={{ padding: '12px 32px', backgroundColor: '#B8936D', color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: '600' }}>
              HUBUNGI KAMI
            </Link>
          </div>
        </div>
      </nav>

      {/* Success Content */}
      <div style={{ maxWidth: '700px', margin: '80px auto', padding: '0 40px', textAlign: 'center' }}>
        
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '60px 40px',
          border: '1px solid #E5E5E0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }}>
          
          {/* Success Icon */}
          <div style={{ 
            width: '100px',
            height: '100px',
            margin: '0 auto 32px',
            backgroundColor: '#FFF8F0',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px'
          }}>
            ✓
          </div>

          <h1 style={{ 
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#2C2C2C',
            marginBottom: '16px',
            fontFamily: 'Georgia, serif'
          }}>
            Terima Kasih!
          </h1>

          <p style={{ 
            fontSize: '18px',
            color: '#666',
            lineHeight: '1.8',
            marginBottom: '32px'
          }}>
            Ulasan anda telah berjaya dihantar dan sedang menunggu semakan daripada admin kami. Kami menghargai masa anda untuk berkongsi pengalaman.
          </p>

          <div style={{ 
            padding: '20px',
            backgroundColor: '#F5F5F0',
            borderRadius: '10px',
            marginBottom: '32px',
            fontSize: '15px',
            color: '#666',
            lineHeight: '1.6',
            textAlign: 'left'
          }}>
            <strong style={{ color: '#B8936D' }}>ℹ️ Apa yang akan berlaku seterusnya?</strong><br />
            <br />
            • Admin kami akan menyemak ulasan anda dalam masa 24-48 jam<br />
            • Ulasan yang lulus semakan akan diterbitkan di laman web<br />
            • Anda akan menerima notifikasi melalui email apabila ulasan diterbitkan
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link 
              href="/ulasan"
              style={{ 
                padding: '14px 28px',
                backgroundColor: '#B8936D',
                color: 'white',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Lihat Semua Ulasan
            </Link>
            <Link 
              href="/"
              style={{ 
                padding: '14px 28px',
                backgroundColor: 'transparent',
                color: '#B8936D',
                border: '2px solid #B8936D',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '600',
                textDecoration: 'none',
                display: 'inline-block'
              }}
            >
              Kembali ke Home
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: '#B8936D', color: 'white', padding: '60px 40px 30px', marginTop: '100px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '60px', marginBottom: '40px' }}>
            
            <div>
              <div style={{ marginBottom: '20px' }}>
                <img 
                  src="/logo.png" 
                  alt="iHRAM" 
                  style={{ 
                    height: '50px',
                    filter: 'brightness(0) invert(1)'
                  }} 
                />
              </div>
              <p style={{ fontSize: '15px', lineHeight: '1.7', color: 'rgba(255,255,255,0.9)' }}>
                Platform discovery pakej umrah pertama di Malaysia yang memudahkan umat Islam mencari pakej yang sesuai.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
                Pautan Pantas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '15px' }}>Home</Link>
                <Link href="/pakej" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '15px' }}>Pakej Umrah</Link>
                <Link href="/agensi" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '15px' }}>Agensi</Link>
                <Link href="/panduan" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '15px' }}>Panduan</Link>
                <Link href="/ulasan" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '15px' }}>Ulasan</Link>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
                Hubungi Kami
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px', color: 'rgba(255,255,255,0.9)' }}>
                <div>📧 info@ihram.com.my</div>
                <div>📞 +60 12-345 6789</div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '30px', textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
            <p>© 2026 iHRAM - Think Tank Sdn Bhd</p>
          </div>
        </div>
      </footer>
    </div>
  )
}