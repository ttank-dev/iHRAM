'use client'

import Footer from '@/app/Footer'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import MobileNav from '@/app/MobileNav'

interface Agency {
  id: string
  name: string
  slug: string
}

export default function HantarUlasanClient({ agencies }: { agencies: Agency[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedRating, setSelectedRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const searchRef = useRef<HTMLDivElement>(null)

  // Better filtering - trim and case insensitive
  const filteredAgencies = searchTerm.trim() === '' 
    ? agencies.slice(0, 8) // Show first 8 when empty
    : agencies.filter(agency =>
        agency.name.toLowerCase().trim().includes(searchTerm.toLowerCase().trim())
      ).slice(0, 8)

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectAgency = (agency: Agency) => {
    setSelectedAgency(agency)
    setSearchTerm('')
    setShowSuggestions(false)
  }

  const handleClearAgency = () => {
    setSelectedAgency(null)
    setSearchTerm('')
  }

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
            <Link href="/ulasan" style={{ color: '#B8936D', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Ulasan</Link>
            <Link href="/tentang" style={{ color: '#2C2C2C', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Tentang</Link>
            <Link href="/hubungi" style={{ padding: '12px 32px', backgroundColor: '#B8936D', color: 'white', textDecoration: 'none', borderRadius: '50px', fontSize: '15px', fontWeight: '600' }}>
              HUBUNGI KAMI
            </Link>
          </div>
          <MobileNav />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hu-hero" style={{ 
        background: 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
        padding: '80px 40px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 className="hu-hero-title" style={{ 
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '20px',
            fontFamily: 'Georgia, serif'
          }}>
            Hantar Ulasan
          </h1>
          <p className="hu-hero-sub" style={{ 
            color: 'rgba(255,255,255,0.95)',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Kongsi pengalaman umrah anda dan bantu jemaah lain membuat keputusan yang lebih baik
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="hu-main" style={{ maxWidth: '900px', margin: '48px auto', padding: '0 40px' }}>
        
        <div className="hu-card" style={{ 
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '48px',
          border: '1px solid #E5E5E0',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }}>
          
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#2C2C2C',
              marginBottom: '12px',
              fontFamily: 'Georgia, serif'
            }}>
              ✍️ Borang Ulasan
            </h2>
            <p style={{ 
              fontSize: '16px',
              color: '#666',
              lineHeight: '1.6'
            }}>
              Ulasan anda membantu jemaah lain membuat keputusan yang lebih baik. Semua ulasan akan disemak sebelum diterbitkan.
            </p>
          </div>

          <form action="/api/ulasan/submit" method="POST" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Nama - REQUIRED */}
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2C2C2C',
                marginBottom: '8px'
              }}>
                Nama <span style={{ color: '#B8936D' }}>*</span>
              </label>
              <input 
                type="text"
                name="reviewer_name"
                required
                placeholder="Nama penuh anda"
                style={{ 
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid #E5E5E0',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />
            </div>

            {/* Email - REQUIRED */}
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2C2C2C',
                marginBottom: '8px'
              }}>
                Email <span style={{ color: '#B8936D' }}>*</span>
              </label>
              <input 
                type="email"
                name="reviewer_email"
                required
                placeholder="email@example.com"
                style={{ 
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid #E5E5E0',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Agensi - Autocomplete Search */}
            <div ref={searchRef}>
              <label style={{ 
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2C2C2C',
                marginBottom: '8px'
              }}>
                Cari Agensi <span style={{ color: '#B8936D' }}>*</span>
              </label>

              {/* Hidden input for form submission */}
              <input 
                type="hidden" 
                name="agency_id" 
                value={selectedAgency?.id || ''} 
                required 
              />

              {selectedAgency ? (
                // Selected Agency Display
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  border: '2px solid #B8936D',
                  borderRadius: '10px',
                  backgroundColor: '#FFF8F0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ 
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      backgroundColor: '#B8936D',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: 'bold'
                    }}>
                      {selectedAgency.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#2C2C2C' }}>
                        {selectedAgency.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666' }}>Dipilih</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearAgency}
                    style={{ 
                      padding: '6px 16px',
                      backgroundColor: 'transparent',
                      border: '1px solid #E5E5E0',
                      borderRadius: '6px',
                      color: '#666',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Tukar
                  </button>
                </div>
              ) : (
                // Search Input
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text"
                    placeholder="🔍 Taip nama agensi untuk cari..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setShowSuggestions(true)
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    style={{ 
                      width: '100%',
                      padding: '14px 16px',
                      border: '1px solid #E5E5E0',
                      borderRadius: '10px',
                      fontSize: '15px',
                      outline: 'none'
                    }}
                  />

                  {/* Autocomplete Suggestions */}
                  {showSuggestions && (
                    <div style={{ 
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #E5E5E0',
                      borderRadius: '10px',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      maxHeight: '320px',
                      overflowY: 'auto',
                      zIndex: 50
                    }}>
                      {filteredAgencies.length > 0 ? (
                        <>
                          {searchTerm.trim() === '' && (
                            <div style={{ 
                              padding: '12px 16px',
                              fontSize: '13px',
                              color: '#999',
                              fontWeight: '600',
                              backgroundColor: '#F5F5F0',
                              borderBottom: '1px solid #E5E5E0'
                            }}>
                              PILIH DARI SENARAI ({agencies.length} agensi berdaftar)
                            </div>
                          )}
                          {filteredAgencies.map((agency) => (
                            <div
                              key={agency.id}
                              onClick={() => handleSelectAgency(agency)}
                              style={{ 
                                padding: '12px 16px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #F5F5F0',
                                transition: 'background-color 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFF8F0'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                            >
                              <div style={{ 
                                width: '36px',
                                height: '36px',
                                borderRadius: '8px',
                                backgroundColor: '#B8936D',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '16px',
                                fontWeight: 'bold',
                                flexShrink: 0
                              }}>
                                {agency.name.charAt(0)}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '15px', fontWeight: '500', color: '#2C2C2C' }}>
                                  {agency.name}
                                </div>
                              </div>
                            </div>
                          ))}
                          {searchTerm.trim() !== '' && filteredAgencies.length < agencies.length && (
                            <div style={{ 
                              padding: '12px 16px',
                              fontSize: '13px',
                              color: '#999',
                              textAlign: 'center',
                              borderTop: '1px solid #E5E5E0'
                            }}>
                              Tunjuk {filteredAgencies.length} daripada {agencies.length} agensi
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ 
                          padding: '20px',
                          textAlign: 'center',
                          color: '#999',
                          fontSize: '14px'
                        }}>
                          {searchTerm.trim() === '' ? (
                            <>
                              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏢</div>
                              <div>Tiada agensi berdaftar</div>
                            </>
                          ) : (
                            <>
                              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
                              <div>Tiada agensi dijumpai untuk &quot;{searchTerm}&quot;</div>
                              <div style={{ fontSize: '13px', marginTop: '4px' }}>Cuba cari dengan nama lain</div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!selectedAgency && (
                <div style={{ fontSize: '13px', color: '#999', marginTop: '6px' }}>
                  {agencies.length > 0 
                    ? `${agencies.length} agensi tersedia - klik atau taip untuk cari`
                    : 'Tiada agensi berdaftar'
                  }
                </div>
              )}
            </div>

            {/* Rating - Interactive */}
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2C2C2C',
                marginBottom: '8px'
              }}>
                Rating <span style={{ color: '#B8936D' }}>*</span>
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <label 
                    key={star}
                    className="hu-star"
                    style={{ 
                      cursor: 'pointer',
                      fontSize: '40px',
                      color: (hoveredRating >= star || selectedRating >= star) ? '#B8936D' : '#E5E5E0',
                      transition: 'color 0.2s',
                      userSelect: 'none'
                    }}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setSelectedRating(star)}
                  >
                    <input 
                      type="radio"
                      name="rating"
                      value={star}
                      required
                      checked={selectedRating === star}
                      onChange={() => setSelectedRating(star)}
                      style={{ display: 'none' }}
                    />
                    ★
                  </label>
                ))}
                {selectedRating > 0 && (
                  <span style={{ 
                    marginLeft: '12px',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#B8936D'
                  }}>
                    {selectedRating}.0
                  </span>
                )}
              </div>
            </div>

            {/* Ulasan Text */}
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2C2C2C',
                marginBottom: '8px'
              }}>
                Ulasan Anda <span style={{ color: '#B8936D' }}>*</span>
              </label>
              <textarea 
                name="review_text"
                required
                rows={6}
                placeholder="Kongsi pengalaman anda dengan agensi ini. Apa yang anda suka? Apa yang boleh diperbaiki?"
                style={{ 
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid #E5E5E0',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: '1.6'
                }}
              />
              <div style={{ fontSize: '13px', color: '#999', marginTop: '6px' }}>
                Minimum 50 patah perkataan
              </div>
            </div>

            {/* Tarikh Travel */}
            <div>
              <label style={{ 
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#2C2C2C',
                marginBottom: '8px'
              }}>
                Tarikh Perjalanan <span style={{ color: '#B8936D' }}>*</span>
              </label>
              <input 
                type="text"
                name="travel_date"
                required
                placeholder="Contoh: Januari 2026"
                style={{ 
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid #E5E5E0',
                  borderRadius: '10px',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Notice */}
            <div style={{ 
              padding: '20px',
              backgroundColor: '#FFF8F0',
              border: '1px solid #FFE8D0',
              borderRadius: '10px',
              fontSize: '14px',
              color: '#666',
              lineHeight: '1.6'
            }}>
              <strong style={{ color: '#B8936D' }}>📝 Nota Penting:</strong><br />
              • Ulasan anda akan disemak oleh admin sebelum diterbitkan<br />
              • Sila berikan ulasan yang jujur dan membina<br />
              • Elakkan bahasa yang kasar atau tidak sopan
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={!selectedAgency}
              style={{ 
                width: '100%',
                padding: '16px',
                backgroundColor: selectedAgency ? '#B8936D' : '#E5E5E0',
                color: selectedAgency ? 'white' : '#999',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: selectedAgency ? 'pointer' : 'not-allowed',
                boxShadow: selectedAgency ? '0 4px 16px rgba(184,147,109,0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              Hantar Ulasan
            </button>

            <div style={{ textAlign: 'center', fontSize: '14px', color: '#999' }}>
              Dengan menghantar ulasan, anda bersetuju dengan <Link href="/tentang" style={{ color: '#B8936D' }}>Terma & Syarat</Link> kami
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}