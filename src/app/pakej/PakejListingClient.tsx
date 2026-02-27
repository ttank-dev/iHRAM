'use client'

import { useState } from 'react'
import Link from 'next/link'
import Pagination from '@/app/Pagination'

interface Package {
  id: string
  title: string
  slug: string
  package_type: string | null
  price_quad: number | null
  duration_nights: number | null
  departure_city: string | null
  photos: string[] | null
  agencies: {
    name: string
    is_verified: boolean
  }
}

export default function PakejListingClient({ packages }: { packages: Package[] }) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'ekonomi' | 'standard' | 'premium' | 'vip'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 12

  const filteredPackages = activeFilter === 'all'
    ? packages
    : packages.filter(pkg => pkg.package_type === activeFilter)

  const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE)
  const paginatedPackages = filteredPackages.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const handleFilter = (f: typeof activeFilter) => {
    setActiveFilter(f)
    setCurrentPage(1)
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="pl-filter-tabs">
        {(['all', 'ekonomi', 'standard', 'premium', 'vip'] as const).map((f) => (
          <button
            key={f}
            className="pl-filter-btn"
            onClick={() => handleFilter(f)}
            style={{
              backgroundColor: activeFilter === f ? '#B8936D' : 'transparent',
              color: activeFilter === f ? 'white' : '#666'
            }}
          >
            {f === 'all' ? 'Semua' : f.charAt(0).toUpperCase() + f.slice(1)}
            {' '}({f === 'all' ? packages.length : packages.filter(p => p.package_type === f).length})
          </button>
        ))}
      </div>

      {filteredPackages && filteredPackages.length > 0 ? (
        <>
          <div className="pl-grid">
            {paginatedPackages.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/pakej/${pkg.slug}`}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  textDecoration: 'none',
                  border: '1px solid #E5E5E0',
                  transition: 'all 0.3s',
                  display: 'block'
                }}
              >
                <div style={{
                  height: '240px',
                  backgroundColor: '#F5F5F0',
                  backgroundImage: pkg.photos && pkg.photos[0] ? `url(${pkg.photos[0]})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}>
                  {(!pkg.photos || pkg.photos.length === 0) && (
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '64px', opacity: 0.2 }}>
                      🕌
                    </div>
                  )}
                  <div style={{ position: 'absolute', top: '16px', left: '16px', padding: '8px 16px', backgroundColor: 'rgba(184, 147, 109, 0.95)', color: 'white', borderRadius: '20px', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
                    {pkg.package_type || 'Standard'}
                  </div>
                </div>

                <div style={{ padding: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px', lineHeight: '1.3' }}>
                    {pkg.title}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '14px', color: '#666' }}>oleh</span>
                    <span style={{ fontSize: '14px', color: '#B8936D', fontWeight: '600' }}>{pkg.agencies?.name}</span>
                    {pkg.agencies?.is_verified && <span style={{ fontSize: '12px' }}>&#10003;</span>}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '16px', fontSize: '14px', color: '#666' }}>
                    {pkg.duration_nights && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>&#127769;</span><span>{pkg.duration_nights} malam</span>
                      </div>
                    )}
                    {pkg.departure_city && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>&#9992;&#65039;</span><span>{pkg.departure_city}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ paddingTop: '16px', borderTop: '1px solid #E5E5E0' }}>
                    <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>Dari</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#B8936D' }}>
                      RM {pkg.price_quad?.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>per person</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '80px 40px', textAlign: 'center', border: '1px solid #E5E5E0' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>&#128230;</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px' }}>
            Tiada Pakej {activeFilter !== 'all' && activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
          </h3>
          <p style={{ fontSize: '16px', color: '#666' }}>Tiada pakej tersedia untuk kategori ini</p>
        </div>
      )}
    </div>
  )
}