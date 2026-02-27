import Link from 'next/link'
import MobileNav from '@/app/MobileNav'
import Footer from '@/app/Footer'

export default function TentangPage() {
  return (
    <div style={{ backgroundColor: '#F5F5F0', minHeight: '100vh' }}>
      
      {/* Navigation */}
      <nav style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E5E0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="hp-nav-inner" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '80px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img 
              src="/logo.png" 
              alt="iHRAM"
              className="hp-logo-img"
              style={{ 
                height: '50px',
                filter: 'brightness(0) saturate(100%) invert(56%) sepia(35%) saturate(643%) hue-rotate(358deg) brightness(95%) contrast(92%) drop-shadow(2px 2px 4px rgba(184,147,109,0.3))'
              }} 
            />
          </Link>
          <div className="hp-desktop-links" style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            <Link href="/" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Home</Link>
            <Link href="/pakej" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Pakej Umrah</Link>
            <Link href="/agensi" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Agensi</Link>
            <Link href="/panduan" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Panduan</Link>
            <Link href="/ulasan" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Ulasan</Link>
            <Link href="/tentang" style={{ color: '#B8936D', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Tentang</Link>
            <Link href="/hubungi" style={{ padding: '12px 32px', backgroundColor: '#B8936D', color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: '600' }}>
              HUBUNGI KAMI
            </Link>
          </div>
          <MobileNav />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="tn-hero" style={{ 
        background: 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 className="tn-hero-title" style={{ 
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '24px',
            fontFamily: 'Georgia, serif'
          }}>
            Tentang iHRAM
          </h1>
          <p className="tn-hero-sub" style={{ 
            color: 'rgba(255,255,255,0.95)',
            lineHeight: '1.8',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Platform discovery pakej umrah pertama di Malaysia yang memudahkan umat Islam membuat keputusan dengan bijak
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="tn-main" style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 40px' }}>
        
        {/* Story Section */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '20px',
          marginBottom: '48px',
          border: '1px solid #E5E5E0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)'
        }} className="tn-card">
          <div style={{ 
            fontSize: '48px',
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            🕌
          </div>
          
          <h2 style={{ 
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#2C2C2C',
            marginBottom: '32px',
            textAlign: 'center',
            fontFamily: 'Georgia, serif'
          }}>
            Kisah Kami
          </h2>

          <div style={{ 
            fontSize: '18px',
            lineHeight: '2',
            color: '#4A4A4A',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <p style={{ marginBottom: '24px' }}>
              iHRAM dilahirkan daripada pengalaman peribadi mencari pakej umrah yang sesuai. Kami faham betapa rumitnya untuk membandingkan pelbagai pakej dari berbeza agensi, membaca ulasan yang berselerak, dan membuat keputusan yang bijak untuk perjalanan suci ini.
            </p>

            <p style={{ marginBottom: '24px' }}>
              Kami percaya bahawa setiap Muslim berhak mendapat akses kepada maklumat yang telus dan mudah difahami ketika merancang umrah. Oleh itu, kami mencipta iHRAM - sebuah platform yang mengumpulkan semua maklumat penting dalam satu tempat.
            </p>

            <p>
              Hari ini, iHRAM bukan sekadar platform perbandingan. Kami adalah komuniti yang membantu umat Islam Malaysia merancang perjalanan umrah mereka dengan yakin dan tenang.
            </p>
          </div>
        </div>

        {/* Mission & Vision Grid */}
        <div className="tn-mv-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '48px' }}>
          
          {/* Mission */}
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '48px',
            border: '1px solid #E5E5E0',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)'
          }}>
            <div style={{ 
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              marginBottom: '24px'
            }}>
              🎯
            </div>

            <h3 style={{ 
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#2C2C2C',
              marginBottom: '20px',
              fontFamily: 'Georgia, serif'
            }}>
              Misi Kami
            </h3>

            <p style={{ 
              fontSize: '17px',
              lineHeight: '1.9',
              color: '#4A4A4A'
            }}>
              Membantu umat Islam Malaysia membuat keputusan umrah dengan bijak melalui perbandingan pakej yang telus, ulasan jemaah yang sahih, dan direktori agensi yang dipercayai.
            </p>
          </div>

          {/* Vision */}
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '48px',
            border: '1px solid #E5E5E0',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06)'
          }}>
            <div style={{ 
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              marginBottom: '24px'
            }}>
              ✨
            </div>

            <h3 style={{ 
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#2C2C2C',
              marginBottom: '20px',
              fontFamily: 'Georgia, serif'
            }}>
              Visi Kami
            </h3>

            <p style={{ 
              fontSize: '17px',
              lineHeight: '1.9',
              color: '#4A4A4A'
            }}>
              Menjadi platform umrah paling dipercayai di Malaysia dalam tempoh 3 tahun, membantu 10,000+ jemaah setahun merancang perjalanan suci mereka dengan tenang dan yakin.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '20px',
          marginBottom: '48px',
          border: '1px solid #E5E5E0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)'
        }} className="tn-card">
          <h2 style={{ 
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#2C2C2C',
            marginBottom: '48px',
            textAlign: 'center',
            fontFamily: 'Georgia, serif'
          }}>
            Nilai-Nilai Kami
          </h2>

          <div className="tn-values-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
            
            {/* Value 1 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                🤲
              </div>
              <h4 style={{ 
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#B8936D',
                marginBottom: '12px'
              }}>
                Amanah
              </h4>
              <p style={{ 
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#666'
              }}>
                Kami berpegang kepada amanah dalam menyampaikan maklumat yang tepat dan jujur
              </p>
            </div>

            {/* Value 2 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                🔍
              </div>
              <h4 style={{ 
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#B8936D',
                marginBottom: '12px'
              }}>
                Ketelusan
              </h4>
              <p style={{ 
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#666'
              }}>
                Tiada agenda tersembunyi - semua maklumat dipaparkan secara telus dan adil
              </p>
            </div>

            {/* Value 3 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                💚
              </div>
              <h4 style={{ 
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#B8936D',
                marginBottom: '12px'
              }}>
                Ikhlas
              </h4>
              <p style={{ 
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#666'
              }}>
                Platform ini dibina dengan niat ikhlas membantu umat Islam, bukan untuk keuntungan semata-mata
              </p>
            </div>

            {/* Value 4 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                🌟
              </div>
              <h4 style={{ 
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#B8936D',
                marginBottom: '12px'
              }}>
                Kualiti
              </h4>
              <p style={{ 
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#666'
              }}>
                Kami komited menyediakan pengalaman terbaik untuk setiap pengguna
              </p>
            </div>

            {/* Value 5 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                🤝
              </div>
              <h4 style={{ 
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#B8936D',
                marginBottom: '12px'
              }}>
                Kerjasama
              </h4>
              <p style={{ 
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#666'
              }}>
                Kami percaya pada kerjasama antara jemaah, agensi, dan platform untuk kebaikan bersama
              </p>
            </div>

            {/* Value 6 */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '48px',
                marginBottom: '16px'
              }}>
                🚀
              </div>
              <h4 style={{ 
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#B8936D',
                marginBottom: '12px'
              }}>
                Inovasi
              </h4>
              <p style={{ 
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#666'
              }}>
                Kami sentiasa mencari cara baharu untuk meningkatkan pengalaman pengguna
              </p>
            </div>
          </div>
        </div>

        {/* What We Do */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '20px',
          marginBottom: '48px',
          border: '1px solid #E5E5E0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)'
        }} className="tn-card">
          <h2 style={{ 
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#2C2C2C',
            marginBottom: '48px',
            textAlign: 'center',
            fontFamily: 'Georgia, serif'
          }}>
            Apa Yang Kami Buat
          </h2>

          <div className="tn-features-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            
            {/* Feature 1 */}
            <div style={{ 
              padding: '32px',
              backgroundColor: '#F5F5F0',
              borderRadius: '16px'
            }}>
              <div style={{ 
                fontSize: '40px',
                marginBottom: '16px'
              }}>
                📦
              </div>
              <h4 style={{ 
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '12px'
              }}>
                Agregator Pakej
              </h4>
              <p style={{ 
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#666'
              }}>
                Mengumpul dan memapar pakej umrah dari pelbagai agensi dalam satu platform untuk perbandingan mudah
              </p>
            </div>

            {/* Feature 2 */}
            <div style={{ 
              padding: '32px',
              backgroundColor: '#F5F5F0',
              borderRadius: '16px'
            }}>
              <div style={{ 
                fontSize: '40px',
                marginBottom: '16px'
              }}>
                ⭐
              </div>
              <h4 style={{ 
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '12px'
              }}>
                Platform Ulasan
              </h4>
              <p style={{ 
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#666'
              }}>
                Mengumpul ulasan jemaah sebenar untuk membantu bakal jemaah membuat keputusan
              </p>
            </div>

            {/* Feature 3 */}
            <div style={{ 
              padding: '32px',
              backgroundColor: '#F5F5F0',
              borderRadius: '16px'
            }}>
              <div style={{ 
                fontSize: '40px',
                marginBottom: '16px'
              }}>
                🏢
              </div>
              <h4 style={{ 
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '12px'
              }}>
                Direktori Agensi
              </h4>
              <p style={{ 
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#666'
              }}>
                Menyenarai agensi umrah berdaftar dengan maklumat lengkap dan badge verified
              </p>
            </div>

            {/* Feature 4 */}
            <div style={{ 
              padding: '32px',
              backgroundColor: '#F5F5F0',
              borderRadius: '16px'
            }}>
              <div style={{ 
                fontSize: '40px',
                marginBottom: '16px'
              }}>
                📚
              </div>
              <h4 style={{ 
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '12px'
              }}>
                Hub Panduan
              </h4>
              <p style={{ 
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#666'
              }}>
                Menyediakan panduan lengkap untuk first-timers dan jemaah berpengalaman
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="tn-stats-section" style={{ 
          background: 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
          borderRadius: '20px',
          marginBottom: '48px',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '36px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '48px',
            fontFamily: 'Georgia, serif'
          }}>
            Pencapaian Kami
          </h2>

          <div className="tn-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '40px' }}>
            
            <div>
              <div style={{ 
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '8px',
                fontFamily: 'Georgia, serif'
              }}>
                50+
              </div>
              <div style={{ 
                fontSize: '16px',
                color: 'rgba(255,255,255,0.9)'
              }}>
                Pakej Tersedia
              </div>
            </div>

            <div>
              <div style={{ 
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '8px',
                fontFamily: 'Georgia, serif'
              }}>
                20+
              </div>
              <div style={{ 
                fontSize: '16px',
                color: 'rgba(255,255,255,0.9)'
              }}>
                Agensi Berdaftar
              </div>
            </div>

            <div>
              <div style={{ 
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '8px',
                fontFamily: 'Georgia, serif'
              }}>
                200+
              </div>
              <div style={{ 
                fontSize: '16px',
                color: 'rgba(255,255,255,0.9)'
              }}>
                Ulasan Jemaah
              </div>
            </div>

            <div>
              <div style={{ 
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'white',
                marginBottom: '8px',
                fontFamily: 'Georgia, serif'
              }}>
                5,000+
              </div>
              <div style={{ 
                fontSize: '16px',
                color: 'rgba(255,255,255,0.9)'
              }}>
                Pelawat Bulanan
              </div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '60px',
          marginBottom: '48px',
          border: '1px solid #E5E5E0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
          textAlign: 'center'
        }}>
          <h2 style={{ 
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#2C2C2C',
            marginBottom: '24px',
            fontFamily: 'Georgia, serif'
          }}>
            Pasukan Kami
          </h2>

          <p style={{ 
            fontSize: '18px',
            lineHeight: '1.8',
            color: '#666',
            maxWidth: '700px',
            margin: '0 auto 40px'
          }}>
            iHRAM dibangunkan oleh Think Tank Sdn Bhd - sebuah syarikat teknologi yang komited membangunkan penyelesaian digital untuk komuniti Muslim Malaysia.
          </p>

          <div style={{ 
            display: 'inline-block',
            padding: '16px 40px',
            backgroundColor: '#F5F5F0',
            borderRadius: '50px',
            fontSize: '15px',
            color: '#666'
          }}>
            🏢 Think Tank Sdn Bhd © 2026
          </div>
        </div>

        {/* CTA Section */}
        <div className="tn-cta" style={{ 
          background: 'linear-gradient(135deg, #FFF8F0 0%, #FFEFDB 100%)',
          borderRadius: '20px',
          textAlign: 'center',
          border: '2px solid #B8936D'
        }}>
          <h2 style={{ 
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#2C2C2C',
            marginBottom: '20px',
            fontFamily: 'Georgia, serif'
          }}>
            Sertai Kami Dalam Perjalanan Ini
          </h2>

          <p style={{ 
            fontSize: '18px',
            color: '#666',
            marginBottom: '32px',
            maxWidth: '600px',
            margin: '0 auto 32px'
          }}>
            Sama ada anda seorang jemaah yang sedang merancang umrah, atau agensi yang ingin memberi exposure lebih - kami di sini untuk membantu
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              href="/pakej"
              style={{ 
                display: 'inline-block',
                padding: '16px 40px',
                backgroundColor: '#B8936D',
                color: 'white',
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Terokai Pakej
            </Link>

            <Link 
              href="/hubungi"
              style={{ 
                display: 'inline-block',
                padding: '16px 40px',
                backgroundColor: 'transparent',
                color: '#B8936D',
                border: '2px solid #B8936D',
                borderRadius: '50px',
                fontSize: '16px',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}