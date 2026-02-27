import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="shared-footer">
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div className="shared-footer-grid">
          
          <div>
            <div style={{ marginBottom: '20px' }}>
              <img 
                src="/logo.png" 
                alt="iHRAM" 
                style={{ height: '50px', filter: 'brightness(0) invert(1) drop-shadow(2px 2px 4px rgba(255,255,255,0.2))' }} 
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
              <div><strong>Email:</strong><br/>info@ihram.com.my</div>
              <div><strong>WhatsApp:</strong><br/>+60 12-345 6789</div>
              <div><strong>Waktu Operasi:</strong><br/>Isnin - Jumaat: 9:00 AM - 6:00 PM</div>
            </div>
          </div>

        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '30px', textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
          <p>© 2026 iHRAM - Think Tank Sdn Bhd. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  )
}