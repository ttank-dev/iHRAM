'use client'

import Footer from '@/app/Footer'
import Link from 'next/link'
import { useState } from 'react'
import MobileNav from '@/app/MobileNav'
import Pagination from '@/app/Pagination'

interface Guide {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  category: string | null
  created_at: string
}

export default function PanduanClient({ 
  guides = [], 
  categories = [] 
}: { 
  guides?: Guide[]
  categories?: string[]
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 12

  const filteredGuides = selectedCategory
    ? guides.filter(g => g.category === selectedCategory)
    : guides

  const totalPages = Math.ceil(filteredGuides.length / ITEMS_PER_PAGE)
  const paginatedGuides = filteredGuides.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleCategory = (cat: string | null) => {
    setSelectedCategory(cat)
    setCurrentPage(1)
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
            <Link href="/panduan" style={{ color: '#B8936D', textDecoration: 'none', fontSize: '16px', fontWeight: '500' }}>Panduan</Link>
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
            Panduan Umrah
          </h1>
          <p style={{ 
            fontSize: '18px',
            color: 'rgba(255,255,255,0.95)',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            Segala yang anda perlu tahu untuk perjalanan umrah yang sempurna
          </p>
        </div>
      </section>

      {/* Categories Filter - NOW WORKING */}
      {categories.length > 0 && (
        <div style={{ 
          backgroundColor: 'white', 
          borderBottom: '1px solid #E5E5E0',
          padding: '24px 40px'
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              
              {/* Semua Button */}
              <button 
                onClick={() => handleCategory(null)}
                style={{ 
                  padding: '10px 24px',
                  backgroundColor: selectedCategory === null ? '#B8936D' : 'transparent',
                  color: selectedCategory === null ? 'white' : '#666',
                  border: selectedCategory === null ? 'none' : '2px solid #E5E5E0',
                  borderRadius: '50px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                Semua
              </button>

              {/* Category Buttons */}
              {categories.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => handleCategory(cat)}
                  style={{ 
                    padding: '10px 24px',
                    backgroundColor: selectedCategory === cat ? '#B8936D' : 'transparent',
                    color: selectedCategory === cat ? 'white' : '#666',
                    border: selectedCategory === cat ? 'none' : '2px solid #E5E5E0',
                    borderRadius: '50px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '48px auto', padding: '0 40px' }}>
        
        {filteredGuides && filteredGuides.length > 0 ? (
          <>
            {/* Results Count */}
            <div style={{ 
              marginBottom: '24px',
              fontSize: '16px',
              color: '#666',
              textAlign: 'center'
            }}>
              Menunjukkan <strong style={{ color: '#B8936D' }}>{filteredGuides.length}</strong> panduan
              {selectedCategory && ` dalam kategori "${selectedCategory}"`}
            </div>

            {/* Guides Grid */}
            <div className="pn-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
              {paginatedGuides.map((guide) => (
                <Link 
                  key={guide.id}
                  href={`/panduan/${guide.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{ 
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #E5E5E0',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    height: '100%',
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}>
                    
                    {/* Cover Image */}
                    {guide.cover_image ? (
                      <div style={{ 
                        height: '220px',
                        backgroundImage: `url(${guide.cover_image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }} />
                    ) : (
                      <div style={{ 
                        height: '220px',
                        background: 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '64px'
                      }}>
                        📚
                      </div>
                    )}

                    <div style={{ padding: '24px' }}>
                      
                      {/* Category Badge */}
                      {guide.category && (
                        <div style={{ 
                          display: 'inline-block',
                          padding: '6px 16px',
                          backgroundColor: '#FFF8F0',
                          color: '#B8936D',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          marginBottom: '12px'
                        }}>
                          {guide.category}
                        </div>
                      )}

                      {/* Title */}
                      <h3 style={{ 
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#2C2C2C',
                        marginBottom: '12px',
                        lineHeight: '1.4'
                      }}>
                        {guide.title}
                      </h3>

                      {/* Excerpt */}
                      {guide.excerpt && (
                        <p style={{ 
                          fontSize: '15px',
                          color: '#666',
                          lineHeight: '1.6',
                          marginBottom: '16px',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {guide.excerpt}
                        </p>
                      )}

                      {/* Read More */}
                      <div style={{ 
                        color: '#B8936D',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        Baca Selanjutnya →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </>
        ) : (
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '80px 40px',
            textAlign: 'center',
            border: '1px solid #E5E5E0'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📚</div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px' }}>
              Tiada Panduan
            </h3>
            <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
              {selectedCategory 
                ? `Tiada panduan dalam kategori "${selectedCategory}"`
                : 'Panduan akan ditambah tidak lama lagi'
              }
            </p>
            {selectedCategory && (
              <button
                onClick={() => handleCategory(null)}
                style={{ 
                  padding: '12px 32px',
                  backgroundColor: '#B8936D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Lihat Semua Panduan
              </button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}