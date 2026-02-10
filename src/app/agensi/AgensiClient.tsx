'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

interface Agency {
  id: string
  name: string
  slug: string
  logo_url?: string
  cover_url?: string
  about?: string
  phone?: string
  email?: string
  is_verified: boolean
  is_active: boolean
  motac_license_number?: string
  motac_license_expiry?: string
}

interface Ratings {
  [key: string]: { total: number; count: number }
}

export default function AgensiClient({ 
  agencies, 
  ratings 
}: { 
  agencies: Agency[]
  ratings: Ratings
}) {
  const searchRef = useRef<HTMLDivElement>(null)
  
  const [filteredAgencies, setFilteredAgencies] = useState<Agency[]>(agencies)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'verified'>('all')

  useEffect(() => {
    let filtered = agencies

    if (selectedFilter === 'verified') {
      filtered = filtered.filter(a => a.is_verified)
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(agency =>
        agency.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredAgencies(filtered)
  }, [searchTerm, agencies, selectedFilter])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleQuickJump = (agency: Agency) => {
    setSearchTerm('')
    setShowSuggestions(false)
    
    const element = document.getElementById(`agency-${agency.id}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.style.transform = 'scale(1.02)'
      element.style.boxShadow = '0 8px 32px rgba(184, 147, 109, 0.3)'
      setTimeout(() => {
        element.style.transform = ''
        element.style.boxShadow = ''
      }, 2000)
    }
  }

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
            <Link href="/agensi" style={{ color: '#B8936D', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Agensi</Link>
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
        padding: '80px 40px',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '48px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '20px',
            fontFamily: 'Georgia, serif'
          }}>
            Agensi
          </h1>
          <p style={{ 
            fontSize: '18px',
            color: 'rgba(255,255,255,0.95)',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Direktori agensi umrah di seluruh Malaysia
          </p>
        </div>
      </section>

      {/* ========== SEARCH SECTION (NEW) ========== */}
      <div style={{
        maxWidth: '1200px',
        margin: '-40px auto 0',
        padding: '0 40px',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          marginBottom: '40px'
        }}>
          
          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            marginBottom: '32px',
            paddingBottom: '24px',
            borderBottom: '1px solid #E5E5E0'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#B8936D', marginBottom: '4px' }}>
                {agencies.length}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Agensi Berdaftar</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50', marginBottom: '4px' }}>
                {agencies.filter(a => a.is_verified).length}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Disahkan MOTAC</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '4px' }}>
                {agencies.filter(a => !a.is_verified).length}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Belum Disahkan</div>
            </div>
          </div>

          {/* Autocomplete Search */}
          <div ref={searchRef}>
            <label style={{ 
              display: 'block',
              fontSize: '16px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '12px'
            }}>
              🔍 Cari Agensi
            </label>

            <div style={{ position: 'relative' }}>
              <input 
                type="text"
                placeholder="Taip nama agensi untuk cari..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                style={{ 
                  width: '96%',
                  padding: '16px 20px',
                  border: '2px solid #E5E5E0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              />

              {/* Autocomplete Dropdown */}
              {showSuggestions && searchTerm.trim() && (
                <div style={{ 
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '2px solid #E5E5E0',
                  borderRadius: '12px',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  zIndex: 50
                }}>
                  {filteredAgencies.length > 0 ? (
                    <>
                      <div style={{ 
                        padding: '12px 20px',
                        fontSize: '13px',
                        color: '#999',
                        fontWeight: '600',
                        backgroundColor: '#F5F5F0',
                        borderBottom: '1px solid #E5E5E0'
                      }}>
                        {filteredAgencies.length} HASIL CARIAN
                      </div>
                      {filteredAgencies.map((agency) => (
                        <div
                          key={agency.id}
                          onClick={() => handleQuickJump(agency)}
                          style={{ 
                            padding: '16px 20px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #F5F5F0',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#FFF8F0'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'white'
                          }}
                        >
                          <div style={{ 
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            backgroundColor: agency.logo_url ? 'white' : '#B8936D',
                            backgroundImage: agency.logo_url ? `url(${agency.logo_url})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            flexShrink: 0,
                            border: '2px solid #E5E5E0'
                          }}>
                            {!agency.logo_url && agency.name.charAt(0)}
                          </div>
                          
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <div style={{ fontSize: '16px', fontWeight: '600', color: '#2C2C2C' }}>
                                {agency.name}
                              </div>
                              {agency.is_verified && (
                                <div style={{
                                  padding: '4px 10px',
                                  backgroundColor: '#E8F5E9',
                                  color: '#2E7D32',
                                  borderRadius: '12px',
                                  fontSize: '11px',
                                  fontWeight: '700'
                                }}>
                                  ✅ VERIFIED
                                </div>
                              )}
                            </div>
                            <div style={{ fontSize: '13px', color: '#666' }}>
                              {agency.phone || 'Tiada telefon'}
                            </div>
                          </div>

                          <div style={{ color: '#B8936D', fontSize: '20px' }}>→</div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div style={{ 
                      padding: '40px 20px',
                      textAlign: 'center',
                      color: '#999'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
                      <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                        Tiada agensi dijumpai
                      </div>
                      <div style={{ fontSize: '14px' }}>
                        Cuba cari dengan nama lain
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
              {agencies.length > 0 
                ? `${agencies.length} agensi tersedia`
                : 'Tiada agensi berdaftar'
              }
            </div>
          </div>

          {/* Filter Tabs */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '24px'
          }}>
            <button
              onClick={() => setSelectedFilter('all')}
              style={{
                padding: '10px 20px',
                backgroundColor: selectedFilter === 'all' ? '#B8936D' : 'transparent',
                color: selectedFilter === 'all' ? 'white' : '#666',
                border: '2px solid ' + (selectedFilter === 'all' ? '#B8936D' : '#E5E5E0'),
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Semua ({agencies.length})
            </button>
            <button
              onClick={() => setSelectedFilter('verified')}
              style={{
                padding: '10px 20px',
                backgroundColor: selectedFilter === 'verified' ? '#4CAF50' : 'transparent',
                color: selectedFilter === 'verified' ? 'white' : '#666',
                border: '2px solid ' + (selectedFilter === 'verified' ? '#4CAF50' : '#E5E5E0'),
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              ✅ Disahkan ({agencies.filter(a => a.is_verified).length})
            </button>
          </div>
        </div>
      </div>
      {/* ========== END SEARCH SECTION ========== */}

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0px auto 48px', padding: '0 40px' }}>
        
        {filteredAgencies && filteredAgencies.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {filteredAgencies.map((agency) => {
              const ratingData = ratings[agency.id]
              const avgRating = ratingData ? (ratingData.total / ratingData.count).toFixed(1) : null
              const reviewCount = ratingData ? ratingData.count : 0

              return (
                <Link 
                  key={agency.id}
                  id={`agency-${agency.id}`}
                  href={`/agensi/${agency.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{ 
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #E5E5E0',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    height: '100%',
                    transition: 'all 0.3s'
                  }}>
                    
                    {/* Cover Image */}
                    <div style={{ 
                      height: '120px',
                      backgroundImage: agency.cover_url ? `url(${agency.cover_url})` : 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}>
                      {agency.is_verified && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 16px',
                          backgroundColor: '#E8F5E9',
                          border: '2px solid #4CAF50',
                          borderRadius: '20px',
                          marginTop: '8px',
                          position: 'absolute',
                          top: '8px',
                          right: '8px'
                        }}>
                          <span style={{ fontSize: '20px' }}>✅</span>
                          <div>
                            <div style={{ 
                              fontSize: '12px', 
                              fontWeight: '700', 
                              color: '#2E7D32'
                            }}>
                              VERIFIED AGENCY
                            </div>
                            <div style={{ 
                              fontSize: '10px', 
                              color: '#666'
                            }}>
                              MOTAC License: {agency.motac_license_number}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ padding: '24px', position: 'relative', marginTop: '-40px' }}>
                      
                      {/* Logo */}
                      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                        {agency.logo_url ? (
                          <img 
                            src={agency.logo_url}
                            alt={agency.name}
                            style={{ 
                              width: '80px',
                              height: '80px',
                              borderRadius: '12px',
                              objectFit: 'cover',
                              border: '4px solid white',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                              backgroundColor: 'white'
                            }}
                          />
                        ) : (
                          <div style={{ 
                            width: '80px',
                            height: '80px',
                            borderRadius: '12px',
                            backgroundColor: '#B8936D',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '32px',
                            fontWeight: 'bold',
                            border: '4px solid white',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}>
                            {agency.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Agency Name */}
                      <h3 style={{ 
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#2C2C2C',
                        marginBottom: '12px',
                        textAlign: 'center',
                        lineHeight: '1.3'
                      }}>
                        {agency.name}
                      </h3>

                      {/* Rating Display */}
                      {avgRating ? (
                        <div style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          marginBottom: '16px'
                        }}>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span 
                                key={star}
                                style={{ 
                                  fontSize: '16px',
                                  color: star <= Math.round(parseFloat(avgRating)) ? '#B8936D' : '#E5E5E0'
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#B8936D' }}>
                            {avgRating}
                          </span>
                          <span style={{ fontSize: '14px', color: '#999' }}>
                            ({reviewCount} ulasan)
                          </span>
                        </div>
                      ) : (
                        <div style={{ 
                          textAlign: 'center',
                          fontSize: '13px',
                          color: '#999',
                          marginBottom: '16px'
                        }}>
                          Tiada ulasan lagi
                        </div>
                      )}

                      {/* About */}
                      {agency.about && (
                        <p style={{ 
                          fontSize: '14px',
                          color: '#666',
                          lineHeight: '1.6',
                          marginBottom: '16px',
                          textAlign: 'center',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {agency.about}
                        </p>
                      )}

                      {/* Contact Info */}
                      <div style={{ 
                        paddingTop: '16px',
                        borderTop: '1px solid #F5F5F0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        {agency.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
                            <span>📞</span>
                            <span>{agency.phone}</span>
                          </div>
                        )}
                        {agency.email && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#666' }}>
                            <span>📧</span>
                            <span>{agency.email}</span>
                          </div>
                        )}
                      </div>

                      {/* View Button */}
                      <div style={{ 
                        marginTop: '20px',
                        padding: '12px',
                        backgroundColor: '#F5F5F0',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: '#B8936D',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        Lihat Profil →
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '80px 40px',
            textAlign: 'center',
            border: '1px solid #E5E5E0'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏢</div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px' }}>
              Tiada Agensi
            </h3>
            <p style={{ fontSize: '16px', color: '#666' }}>
              {searchTerm ? 'Tiada agensi dijumpai. Cuba cari dengan nama lain.' : 'Belum ada agensi berdaftar pada masa ini'}
            </p>
          </div>
        )}
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