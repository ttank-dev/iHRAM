import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SumbanganPage() {
  const supabase = await createClient()
  
  // Fetch payment settings from database
  const { data: settings } = await supabase
    .from('payment_settings')
    .select('*')
    .limit(1)
    .maybeSingle()

  // Fallback to default if no data
  const bankName = settings?.bank_name || 'Maybank'
  const accountName = settings?.account_name || 'Think Tank Sdn Bhd'
  const accountNumber = settings?.account_number || '5642 8910 1234'
  const bankInstruction = settings?.bank_instruction || 'Hantar resit ke WhatsApp kami'
  const duitnowQR = settings?.duitnow_qr_url
  const tngQR = settings?.tng_qr_url

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
            <Link href="/ulasan" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Ulasan</Link>
            <Link href="/tentang" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Tentang</Link>
            <Link href="/hubungi" style={{ padding: '12px 32px', backgroundColor: '#B8936D', color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: '600' }}>
              HUBUNGI KAMI
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        background: 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
        padding: '100px 40px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>🤲</div>
          <h1 style={{ 
            fontSize: '56px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '24px',
            fontFamily: 'Georgia, serif'
          }}>
            Sumbangan Ikhlas
          </h1>
          <p style={{ 
            fontSize: '20px',
            color: 'rgba(255,255,255,0.95)',
            lineHeight: '1.8',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Bantu kami terus menyediakan platform percuma untuk umat Islam Malaysia mencari pakej umrah yang terbaik
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '-60px auto 0', padding: '0 40px 80px' }}>
        
        {/* Purpose Section */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '60px',
          marginBottom: '48px',
          border: '1px solid #E5E5E0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ 
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#2C2C2C',
            marginBottom: '32px',
            textAlign: 'center',
            fontFamily: 'Georgia, serif'
          }}>
            Mengapa Kami Memerlukan Sumbangan?
          </h2>

          <div style={{ 
            fontSize: '18px',
            lineHeight: '2',
            color: '#4A4A4A',
            maxWidth: '800px',
            margin: '0 auto',
            marginBottom: '40px'
          }}>
            <p style={{ marginBottom: '24px' }}>
              iHRAM adalah platform <strong>100% percuma</strong> untuk jemaah dan agensi. Kami tidak mengenakan sebarang bayaran untuk penggunaan platform, tidak mengambil komisen dari booking, dan tidak menjual data pengguna.
            </p>

            <p style={{ marginBottom: '24px' }}>
              Walau bagaimanapun, menjalankan platform ini memerlukan kos untuk server, penyelenggaraan, dan pembangunan ciri-ciri baru untuk meningkatkan pengalaman anda.
            </p>

            <p>
              Sumbangan ikhlas anda, walau sebanyak mana pun, akan membantu kami terus menyediakan platform yang berkualiti dan percuma untuk semua.
            </p>
          </div>

          {/* Impact Stats */}
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '32px',
            padding: '40px',
            backgroundColor: '#FFF8F0',
            borderRadius: '16px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🖥️</div>
              <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>HOSTING</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#B8936D' }}>RM 500/bulan</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔧</div>
              <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>PENYELENGGARAAN</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#B8936D' }}>RM 300/bulan</div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>💻</div>
              <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>PEMBANGUNAN</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#B8936D' }}>RM 1,000/bulan</div>
            </div>
          </div>
        </div>

        {/* Donation Options - Bank Transfer & QR Code ONLY */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '32px', 
          marginBottom: '48px',
          maxWidth: '900px',
          margin: '0 auto 48px'
        }}>
          
          {/* Bank Transfer Card - DYNAMIC DATA */}
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '40px',
            border: '1px solid #E5E5E0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
          }}>
            <div style={{ 
              fontSize: '48px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              🏦
            </div>

            <h4 style={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#2C2C2C',
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              Pindahan Bank
            </h4>

            <div style={{ 
              padding: '20px',
              backgroundColor: '#F5F5F0',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '15px' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#999', marginBottom: '6px', fontWeight: '600' }}>Bank</div>
                  <div style={{ fontWeight: '600', color: '#2C2C2C', fontSize: '17px' }}>{bankName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#999', marginBottom: '6px', fontWeight: '600' }}>Nama Akaun</div>
                  <div style={{ fontWeight: '600', color: '#2C2C2C', fontSize: '17px' }}>{accountName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#999', marginBottom: '6px', fontWeight: '600' }}>No. Akaun</div>
                  <div style={{ 
                    fontWeight: '700', 
                    color: '#B8936D',
                    fontSize: '22px',
                    fontFamily: 'monospace',
                    letterSpacing: '2px'
                  }}>
                    {accountNumber}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ 
              padding: '16px',
              backgroundColor: '#FFF8F0',
              borderRadius: '8px',
              border: '1px solid #F5E5D3'
            }}>
              <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', margin: 0 }}>
                {bankInstruction}
              </p>
            </div>
          </div>

          {/* QR Code Card - DYNAMIC QR IMAGES */}
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '40px',
            border: '1px solid #E5E5E0',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            textAlign: 'center'
          }}>
            <div style={{ 
              fontSize: '48px',
              marginBottom: '20px'
            }}>
              📱
            </div>

            <h4 style={{ 
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#2C2C2C',
              marginBottom: '24px'
            }}>
              Scan QR Code
            </h4>

            {(duitnowQR || tngQR) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                {duitnowQR && (
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#F5F5F0',
                    borderRadius: '12px',
                    width: '100%'
                  }}>
                    <img 
                      src={duitnowQR}
                      alt="DuitNow QR"
                      style={{
                        width: '200px',
                        height: '200px',
                        objectFit: 'contain',
                        marginBottom: '12px'
                      }}
                    />
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#2C2C2C' }}>
                      DuitNow
                    </div>
                  </div>
                )}
                {tngQR && (
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#F5F5F0',
                    borderRadius: '12px',
                    width: '100%'
                  }}>
                    <img 
                      src={tngQR}
                      alt="Touch n Go QR"
                      style={{
                        width: '200px',
                        height: '200px',
                        objectFit: 'contain',
                        marginBottom: '12px'
                      }}
                    />
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#2C2C2C' }}>
                      Touch n Go
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                padding: '40px 20px',
                backgroundColor: '#F5F5F0',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>📷</div>
                <p style={{ fontSize: '14px', color: '#999', margin: 0 }}>
                  QR code akan dipaparkan di sini
                </p>
              </div>
            )}

            <div style={{ 
              marginTop: '20px',
              padding: '12px',
              backgroundColor: '#FFF8F0',
              borderRadius: '8px',
              fontSize: '13px',
              color: '#666'
            }}>
              Scan & bayar dengan mudah
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '60px',
          marginBottom: '48px',
          border: '1px solid #E5E5E0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ 
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#2C2C2C',
            marginBottom: '40px',
            textAlign: 'center',
            fontFamily: 'Georgia, serif'
          }}>
            Soalan Lazim
          </h2>

          <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ 
              padding: '24px',
              backgroundColor: '#F5F5F0',
              borderRadius: '12px'
            }}>
              <h4 style={{ 
                fontSize: '17px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '12px'
              }}>
                Adakah sumbangan wajib?
              </h4>
              <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#666' }}>
                Tidak sama sekali! Platform iHRAM adalah 100% percuma. Sumbangan adalah secara ikhlas untuk membantu kami mengekalkan dan meningkatkan perkhidmatan.
              </p>
            </div>

            <div style={{ 
              padding: '24px',
              backgroundColor: '#F5F5F0',
              borderRadius: '12px'
            }}>
              <h4 style={{ 
                fontSize: '17px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '12px'
              }}>
                Berapa jumlah minimum?
              </h4>
              <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#666' }}>
                Tiada jumlah minimum. Sebarang jumlah, walau sebanyak mana pun, sangat kami hargai dan akan digunakan dengan sebaiknya.
              </p>
            </div>

            <div style={{ 
              padding: '24px',
              backgroundColor: '#F5F5F0',
              borderRadius: '12px'
            }}>
              <h4 style={{ 
                fontSize: '17px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '12px'
              }}>
                Bolehkah saya dapatkan resit rasmi?
              </h4>
              <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#666' }}>
                Ya! Kami akan hantar email pengesahan dan resit rasmi dari Think Tank Sdn Bhd selepas kami sahkan penerimaan sumbangan anda.
              </p>
            </div>

            <div style={{ 
              padding: '24px',
              backgroundColor: '#F5F5F0',
              borderRadius: '12px'
            }}>
              <h4 style={{ 
                fontSize: '17px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '12px'
              }}>
                Bagaimana saya tahu wang digunakan dengan betul?
              </h4>
              <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#666' }}>
                Kami akan kongsikan laporan kewangan berkala kepada semua penyumbang melalui email. Ketelusan adalah komitmen kami.
              </p>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div style={{ 
          marginTop: '48px',
          background: 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
          borderRadius: '20px',
          padding: '60px 40px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '56px', marginBottom: '24px' }}>❤️</div>
          <h3 style={{ 
            fontSize: '36px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '16px',
            fontFamily: 'Georgia, serif'
          }}>
            Terima Kasih
          </h3>
          <p style={{ 
            fontSize: '18px',
            color: 'rgba(255,255,255,0.95)',
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            Setiap sumbangan, walau sebesar atau sekecil mana, sangat kami hargai. Jazakallahu khairan!
          </p>
          <Link 
            href="/"
            style={{ 
              display: 'inline-block',
              padding: '14px 40px',
              backgroundColor: 'white',
              color: '#B8936D',
              borderRadius: '50px',
              fontSize: '16px',
              fontWeight: '700',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
            }}
          >
            Kembali ke Homepage
          </Link>
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