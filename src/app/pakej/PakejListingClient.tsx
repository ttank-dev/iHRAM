'use client'

import { useState } from 'react'
import Link from 'next/link'

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

  const filteredPackages = activeFilter === 'all'
    ? packages
    : packages.filter(pkg => pkg.package_type === activeFilter)

  return (
    <div>
      {/* Filter Tabs */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '8px',
        display: 'inline-flex',
        gap: '8px',
        marginBottom: '32px',
        border: '1px solid #E5E5E0'
      }}>
        <button
          onClick={() => setActiveFilter('all')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeFilter === 'all' ? '#B8936D' : 'transparent',
            color: activeFilter === 'all' ? 'white' : '#666',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          Semua ({packages.length})
        </button>
        <button
          onClick={() => setActiveFilter('ekonomi')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeFilter === 'ekonomi' ? '#B8936D' : 'transparent',
            color: activeFilter === 'ekonomi' ? 'white' : '#666',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          Ekonomi ({packages.filter(p => p.package_type === 'ekonomi').length})
        </button>
        <button
          onClick={() => setActiveFilter('standard')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeFilter === 'standard' ? '#B8936D' : 'transparent',
            color: activeFilter === 'standard' ? 'white' : '#666',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          Standard ({packages.filter(p => p.package_type === 'standard').length})
        </button>
        <button
          onClick={() => setActiveFilter('premium')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeFilter === 'premium' ? '#B8936D' : 'transparent',
            color: activeFilter === 'premium' ? 'white' : '#666',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          Premium ({packages.filter(p => p.package_type === 'premium').length})
        </button>
        <button
          onClick={() => setActiveFilter('vip')}
          style={{
            padding: '12px 24px',
            backgroundColor: activeFilter === 'vip' ? '#B8936D' : 'transparent',
            color: activeFilter === 'vip' ? 'white' : '#666',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
        >
          VIP ({packages.filter(p => p.package_type === 'vip').length})
        </button>
      </div>

      {/* Package Grid */}
      {filteredPackages && filteredPackages.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          {filteredPackages.map((pkg) => (
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
              {/* Package Image */}
              <div style={{
                height: '240px',
                backgroundColor: '#F5F5F0',
                backgroundImage: pkg.photos && pkg.photos[0] ? `url(${pkg.photos[0]})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative'
              }}>
                {(!pkg.photos || pkg.photos.length === 0) && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '64px',
                    opacity: 0.2
                  }}>
                    🕌
                  </div>
                )}

                {/* Package Type Badge */}
                <div style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  padding: '8px 16px',
                  backgroundColor: 'rgba(184, 147, 109, 0.95)',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  {pkg.package_type || 'Standard'}
                </div>
              </div>

              {/* Package Info */}
              <div style={{ padding: '24px' }}>
                <h3 style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  color: '#2C2C2C', 
                  marginBottom: '12px',
                  lineHeight: '1.3'
                }}>
                  {pkg.title}
                </h3>

                {/* Agency */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    oleh
                  </span>
                  <span style={{ fontSize: '14px', color: '#B8936D', fontWeight: '600' }}>
                    {pkg.agencies?.name}
                  </span>
                  {pkg.agencies?.is_verified && (
                    <span style={{ fontSize: '12px' }}>✓</span>
                  )}
                </div>

                {/* Details */}
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '16px',
                  fontSize: '14px',
                  color: '#666'
                }}>
                  {pkg.duration_nights && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>🌙</span>
                      <span>{pkg.duration_nights} malam</span>
                    </div>
                  )}
                  {pkg.departure_city && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>✈️</span>
                      <span>{pkg.departure_city}</span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div style={{ 
                  paddingTop: '16px',
                  borderTop: '1px solid #E5E5E0'
                }}>
                  <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>
                    Dari
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#B8936D' }}>
                    RM {pkg.price_quad?.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    per person
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '80px 40px',
          textAlign: 'center',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px' }}>
            Tiada Pakej {activeFilter !== 'all' && activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
          </h3>
          <p style={{ fontSize: '16px', color: '#666' }}>
            Tiada pakej tersedia untuk kategori ini
          </p>
        </div>
      )}
    </div>
  )
}