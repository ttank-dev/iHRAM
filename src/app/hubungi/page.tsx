import Link from 'next/link'
import MobileNav from '@/app/MobileNav'
import Footer from '@/app/Footer'

export default function HubungiPage() {
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
            <Link href="/tentang" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Tentang</Link>
            <Link href="/hubungi" style={{ padding: '12px 32px', backgroundColor: '#B8936D', color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: '600' }}>
              HUBUNGI KAMI
            </Link>
          </div>
          <MobileNav />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hb-hero" style={{ 
        background: 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 className="hb-hero-title" style={{ 
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '20px',
            fontFamily: 'Georgia, serif'
          }}>
            Hubungi Kami
          </h1>
          <p className="hb-hero-sub" style={{ 
            color: 'rgba(255,255,255,0.95)',
            lineHeight: '1.8'
          }}>
            Ada soalan atau cadangan? Kami sedia membantu anda
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="hb-main" style={{ maxWidth: '1200px', margin: '-60px auto 0', padding: '0 40px 80px' }}>
        
        <div className="hb-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          
          {/* Left Column - Contact Form */}
          <div className="hb-form-card" style={{ 
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '48px',
            border: '1px solid #E5E5E0',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
          }}>
            <h2 style={{ 
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#2C2C2C',
              marginBottom: '12px',
              fontFamily: 'Georgia, serif'
            }}>
              Hantar Mesej
            </h2>
            <p style={{ 
              fontSize: '16px',
              color: '#666',
              marginBottom: '32px'
            }}>
              Isi borang di bawah dan kami akan balas secepat mungkin
            </p>

            <form>
              {/* Name */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2C2C2C',
                  marginBottom: '8px'
                }}>
                  Nama Penuh *
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Masukkan nama anda"
                  style={{ 
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '14px 16px',
                    fontSize: '15px',
                    border: '2px solid #E5E5E0',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.3s',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2C2C2C',
                  marginBottom: '8px'
                }}>
                  Email *
                </label>
                <input 
                  type="email"
                  required
                  placeholder="nama@email.com"
                  style={{ 
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '14px 16px',
                    fontSize: '15px',
                    border: '2px solid #E5E5E0',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.3s',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Phone */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2C2C2C',
                  marginBottom: '8px'
                }}>
                  No. Telefon
                </label>
                <input 
                  type="tel"
                  placeholder="01X-XXX XXXX"
                  style={{ 
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '14px 16px',
                    fontSize: '15px',
                    border: '2px solid #E5E5E0',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.3s',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              {/* Subject */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2C2C2C',
                  marginBottom: '8px'
                }}>
                  Subjek *
                </label>
                <select 
                  required
                  style={{ 
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '14px 16px',
                    fontSize: '15px',
                    border: '2px solid #E5E5E0',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.3s',
                    fontFamily: 'inherit',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">Pilih subjek</option>
                  <option value="general">Pertanyaan Umum</option>
                  <option value="package">Soalan Tentang Pakej</option>
                  <option value="agency">Soalan Untuk Agensi</option>
                  <option value="technical">Masalah Teknikal</option>
                  <option value="partnership">Kerjasama/Partnership</option>
                  <option value="feedback">Maklum Balas</option>
                  <option value="other">Lain-lain</option>
                </select>
              </div>

              {/* Message */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#2C2C2C',
                  marginBottom: '8px'
                }}>
                  Mesej *
                </label>
                <textarea 
                  required
                  rows={6}
                  placeholder="Tulis mesej anda di sini..."
                  style={{ 
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '14px 16px',
                    fontSize: '15px',
                    border: '2px solid #E5E5E0',
                    borderRadius: '10px',
                    outline: 'none',
                    transition: 'all 0.3s',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit"
                style={{ 
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#B8936D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 16px rgba(184,147,109,0.3)'
                }}
              >
                Hantar Mesej
              </button>
            </form>
          </div>

          {/* Right Column - Contact Info */}
          <div>
            
            {/* Contact Cards */}
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '32px',
              marginBottom: '24px',
              border: '1px solid #E5E5E0',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ 
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '24px'
              }}>
                Maklumat Hubungi
              </h3>

              {/* Email */}
              <div style={{ 
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '16px',
                backgroundColor: '#F5F5F0',
                borderRadius: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ 
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0
                }}>
                  📧
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>Email</div>
                  <a 
                    href="mailto:info@ihram.com.my"
                    style={{ 
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#2C2C2C',
                      textDecoration: 'none'
                    }}
                  >
                    info@ihram.com.my
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div style={{ 
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '16px',
                backgroundColor: '#F5F5F0',
                borderRadius: '12px',
                marginBottom: '16px'
              }}>
                <div style={{ 
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0
                }}>
                  📞
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>Telefon</div>
                  <a 
                    href="tel:+60123456789"
                    style={{ 
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#2C2C2C',
                      textDecoration: 'none'
                    }}
                  >
                    +60 12-345 6789
                  </a>
                </div>
              </div>

              {/* WhatsApp */}
              <div style={{ 
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '16px',
                backgroundColor: '#F5F5F0',
                borderRadius: '12px'
              }}>
                <div style={{ 
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  flexShrink: 0
                }}>
                  💬
                </div>
                <div>
                  <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>WhatsApp</div>
                  <a 
                    href="https://wa.me/60123456789?text=Salam, saya ingin bertanya tentang iHRAM"
                    target="_blank"
                    style={{ 
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#2C2C2C',
                      textDecoration: 'none'
                    }}
                  >
                    Chat Sekarang
                  </a>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '32px',
              marginBottom: '24px',
              border: '1px solid #E5E5E0',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ 
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '20px'
              }}>
                Waktu Operasi
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Isnin - Jumaat</span>
                  <span style={{ fontWeight: '600', color: '#2C2C2C' }}>9:00 AM - 6:00 PM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Sabtu</span>
                  <span style={{ fontWeight: '600', color: '#2C2C2C' }}>9:00 AM - 1:00 PM</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#666' }}>Ahad</span>
                  <span style={{ fontWeight: '600', color: '#999' }}>Tutup</span>
                </div>
              </div>

              <div style={{ 
                marginTop: '20px',
                padding: '12px',
                backgroundColor: '#FFF8F0',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#B8936D',
                textAlign: 'center'
              }}>
                ⏰ Response dalam 24 jam (hari bekerja)
              </div>
            </div>

            {/* Social Media */}
            <div style={{ 
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '32px',
              border: '1px solid #E5E5E0',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ 
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '20px'
              }}>
                Ikuti Kami
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a 
                  href="#"
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#F5F5F0',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: '#2C2C2C',
                    fontSize: '15px',
                    fontWeight: '500',
                    transition: 'all 0.3s'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>📘</span>
                  <span>Facebook</span>
                </a>

                <a 
                  href="#"
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#F5F5F0',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: '#2C2C2C',
                    fontSize: '15px',
                    fontWeight: '500',
                    transition: 'all 0.3s'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>📸</span>
                  <span>Instagram</span>
                </a>

                <a 
                  href="#"
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    backgroundColor: '#F5F5F0',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    color: '#2C2C2C',
                    fontSize: '15px',
                    fontWeight: '500',
                    transition: 'all 0.3s'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>🐦</span>
                  <span>Twitter</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="hb-faq-card" style={{ 
          backgroundColor: 'white',
          borderRadius: '20px',
          marginTop: '48px',
          border: '1px solid #E5E5E0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ 
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#2C2C2C',
            marginBottom: '48px',
            textAlign: 'center',
            fontFamily: 'Georgia, serif'
          }}>
            Soalan Lazim (FAQ)
          </h2>

          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* FAQ 1 */}
            <div style={{ 
              padding: '24px',
              backgroundColor: '#F5F5F0',
              borderRadius: '12px'
            }}>
              <h4 style={{ 
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '12px'
              }}>
                Apakah iHRAM?
              </h4>
              <p style={{ 
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#666'
              }}>
                iHRAM adalah platform discovery pakej umrah yang membantu anda membandingkan pakej dari pelbagai agensi, membaca ulasan jemaah sebenar, dan membuat keputusan dengan lebih yakin.
              </p>
            </div>

            {/* FAQ 2 */}
            <div style={{ 
              padding: '24px',
              backgroundColor: '#F5F5F0',
              borderRadius: '12px'
            }}>
              <h4 style={{ 
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '12px'
              }}>
                Adakah iHRAM mengenakan bayaran?
              </h4>
              <p style={{ 
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#666'
              }}>
                Tidak! Platform iHRAM adalah percuma untuk semua pengguna. Kami beroperasi berdasarkan sumbangan ikhlas dari masyarakat.
              </p>
            </div>

            {/* FAQ 3 */}
            <div style={{ 
              padding: '24px',
              backgroundColor: '#F5F5F0',
              borderRadius: '12px'
            }}>
              <h4 style={{ 
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '12px'
              }}>
                Bolehkah saya tempah pakej terus di iHRAM?
              </h4>
              <p style={{ 
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#666'
              }}>
                Buat masa ini, iHRAM adalah platform discovery sahaja. Anda perlu hubungi agensi secara terus melalui WhatsApp atau telefon untuk membuat tempahan.
              </p>
            </div>

            {/* FAQ 4 */}
            <div style={{ 
              padding: '24px',
              backgroundColor: '#F5F5F0',
              borderRadius: '12px'
            }}>
              <h4 style={{ 
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '12px'
              }}>
                Bagaimana untuk menjadi agensi berdaftar?
              </h4>
              <p style={{ 
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#666'
              }}>
                Hubungi kami melalui borang di atas atau email ke info@ihram.com.my untuk mendaftar agensi anda. Pendaftaran adalah percuma!
              </p>
            </div>

            {/* FAQ 5 */}
            <div style={{ 
              padding: '24px',
              backgroundColor: '#F5F5F0',
              borderRadius: '12px'
            }}>
              <h4 style={{ 
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '12px'
              }}>
                Bagaimana untuk hantar ulasan?
              </h4>
              <p style={{ 
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#666'
              }}>
                Pergi ke halaman <Link href="/ulasan/hantar" style={{ color: '#B8936D', fontWeight: '600' }}>Hantar Ulasan</Link> dan isi borang. Semua ulasan akan disemak oleh admin sebelum dipaparkan.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="hb-cta" style={{ 
          marginTop: '48px',
          background: 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
          borderRadius: '20px',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '16px',
            fontFamily: 'Georgia, serif'
          }}>
            Masih Ada Soalan?
          </h3>
          <p style={{ 
            fontSize: '18px',
            color: 'rgba(255,255,255,0.95)',
            marginBottom: '24px'
          }}>
            Jangan teragak-agak untuk hubungi kami. Kami sedia membantu!
          </p>
          <a 
            href="https://wa.me/60123456789?text=Salam, saya ada soalan tentang iHRAM"
            target="_blank"
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 32px',
              backgroundColor: '#25D366',
              color: 'white',
              borderRadius: '50px',
              fontSize: '16px',
              fontWeight: '700',
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
            }}
          >
            <span style={{ fontSize: '20px' }}>💬</span>
            <span>WhatsApp Kami</span>
          </a>
        </div>
      </div>

      <Footer />
    </div>
  )
}