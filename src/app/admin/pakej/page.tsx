'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Package {
  id: string
  title: string
  slug: string
  description: string | null
  package_type: string | null
  price_quad: number | null
  price_triple: number | null
  price_double: number | null
  price_child: number | null
  price_infant: number | null
  departure_dates: string[] | null
  duration_nights: number | null
  departure_city: string | null
  visa_type: string | null
  itinerary: string | null
  inclusions: string[] | null
  exclusions: string[] | null
  photos: string[] | null
  quota: number | null
  status: string
  is_featured: boolean
  created_at: string
  agency_id: string
  agencies?: {
    name: string
    slug: string
    is_verified: boolean
  }
}

export default function AdminPakejPage() {
  const supabase = createClient()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    archived: 0
  })

  useEffect(() => {
    fetchPackages()
  }, [filter])

  const fetchPackages = async () => {
    setLoading(true)
    
    try {
      let query = supabase
        .from('packages')
        .select(`
          *,
          agencies (
            name,
            slug,
            is_verified
          )
        `)
        .order('created_at', { ascending: false })

      // Apply filter
      if (filter === 'published') {
        query = query.eq('status', 'published')
      } else if (filter === 'draft') {
        query = query.eq('status', 'draft')
      } else if (filter === 'archived') {
        query = query.eq('status', 'archived')
      }

      const { data, error } = await query

      if (error) throw error

      setPackages(data || [])

      // Calculate stats from all packages
      const { data: allPackages } = await supabase
        .from('packages')
        .select('id, status')

      if (allPackages) {
        setStats({
          total: allPackages.length,
          published: allPackages.filter(p => p.status === 'published').length,
          draft: allPackages.filter(p => p.status === 'draft').length,
          archived: allPackages.filter(p => p.status === 'archived').length
        })
      }

    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFeatured = async (packageId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('packages')
        .update({ is_featured: !currentStatus })
        .eq('id', packageId)

      if (error) throw error

      alert(currentStatus ? '⭐ Removed from featured!' : '⭐ Added to featured!')
      fetchPackages()
    } catch (error) {
      console.error('Error toggling featured:', error)
      alert('❌ Error updating featured status')
    }
  }

  const handleChangeStatus = async (packageId: string, newStatus: string) => {
    if (!confirm(`Change package status to "${newStatus}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('packages')
        .update({ status: newStatus })
        .eq('id', packageId)

      if (error) throw error

      alert(`✅ Status changed to ${newStatus}!`)
      fetchPackages()
    } catch (error) {
      console.error('Error changing status:', error)
      alert('❌ Error updating package status')
    }
  }

  const handleDelete = async (packageId: string, packageTitle: string) => {
    if (!confirm(
      `⚠️ DELETE PACKAGE: ${packageTitle}\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Are you sure?`
    )) {
      return
    }

    const userInput = prompt(`Type "${packageTitle}" to confirm deletion:`)
    
    if (userInput !== packageTitle) {
      alert('❌ Package title does not match. Deletion cancelled.')
      return
    }

    try {
      const { error } = await supabase
        .from('packages')
        .delete()
        .eq('id', packageId)

      if (error) throw error

      alert('🗑️ Package deleted successfully!')
      fetchPackages()
    } catch (error: any) {
      console.error('Error deleting package:', error)
      alert(`❌ Error deleting package: ${error.message}`)
    }
  }

  const filteredPackages = packages.filter(pkg => 
    pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.agencies?.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>Loading packages...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      
      {/* PAGE HEADER */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#2C2C2C',
          marginBottom: '8px'
        }}>
          Urus Pakej
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666'
        }}>
          Monitor and moderate all umrah packages across the platform
        </p>
      </div>

      {/* STATS CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div
          onClick={() => setFilter('all')}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: filter === 'all' ? '2px solid #B8936D' : '1px solid #E5E5E0',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#8B5CF615',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              📦
            </div>
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Total Pakej
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#2C2C2C'
          }}>
            {stats.total}
          </div>
        </div>

        <div
          onClick={() => setFilter('published')}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: filter === 'published' ? '2px solid #B8936D' : '1px solid #E5E5E0',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#10B98115',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              ✅
            </div>
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Published
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#2C2C2C'
          }}>
            {stats.published}
          </div>
        </div>

        <div
          onClick={() => setFilter('draft')}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: filter === 'draft' ? '2px solid #B8936D' : '1px solid #E5E5E0',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#F59E0B15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              📝
            </div>
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Draft
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#2C2C2C'
          }}>
            {stats.draft}
          </div>
        </div>

        <div
          onClick={() => setFilter('archived')}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: filter === 'archived' ? '2px solid #B8936D' : '1px solid #E5E5E0',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#EF444415',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🗄️
            </div>
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Archived
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#2C2C2C'
          }}>
            {stats.archived}
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #E5E5E0',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Search packages by title or agency name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '15px',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                outline: 'none'
              }}
            />
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            fontWeight: '600'
          }}>
            {filteredPackages.length} results
          </div>
        </div>
      </div>

      {/* PACKAGES TABLE */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid #E5E5E0',
        overflow: 'hidden'
      }}>
        
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 240px',
          padding: '16px 24px',
          backgroundColor: '#F5F5F0',
          borderBottom: '1px solid #E5E5E0',
          fontSize: '13px',
          fontWeight: '700',
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <div>Package</div>
          <div>Agency</div>
          <div>Type</div>
          <div>Price</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {/* Table Body */}
        {filteredPackages.map((pkg) => (
          <div
            key={pkg.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 240px',
              padding: '20px 24px',
              borderBottom: '1px solid #E5E5E0',
              alignItems: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {/* Package Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '8px',
                backgroundColor: '#F5F5F0',
                backgroundImage: pkg.photos?.[0] ? `url(${pkg.photos[0]})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0
              }}>
                {!pkg.photos?.[0] && '🕌'}
              </div>
              <div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#2C2C2C',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {pkg.title}
                  {pkg.is_featured && <span style={{ fontSize: '16px' }}>⭐</span>}
                </div>
                <div style={{ fontSize: '13px', color: '#999' }}>
                  {pkg.duration_nights} malam • {pkg.departure_city || 'N/A'}
                </div>
              </div>
            </div>

            {/* Agency */}
            <div>
              <div style={{
                fontSize: '14px',
                color: '#2C2C2C',
                fontWeight: '600',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {pkg.agencies?.name || 'N/A'}
                {pkg.agencies?.is_verified && (
                  <span style={{ fontSize: '14px', color: '#10B981' }}>✓</span>
                )}
              </div>
            </div>

            {/* Type */}
            <div>
              <span style={{
                padding: '6px 12px',
                backgroundColor: '#B8936D15',
                color: '#B8936D',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                {pkg.package_type || 'Standard'}
              </span>
            </div>

            {/* Price */}
            <div style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#2C2C2C'
            }}>
              RM {pkg.price_quad?.toLocaleString() || 'N/A'}
            </div>

            {/* Status */}
            <div>
              {pkg.status === 'published' ? (
                <span style={{
                  padding: '6px 12px',
                  backgroundColor: '#10B98115',
                  color: '#10B981',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  PUBLISHED
                </span>
              ) : pkg.status === 'draft' ? (
                <span style={{
                  padding: '6px 12px',
                  backgroundColor: '#F59E0B15',
                  color: '#F59E0B',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  DRAFT
                </span>
              ) : (
                <span style={{
                  padding: '6px 12px',
                  backgroundColor: '#EF444415',
                  color: '#EF4444',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'uppercase'
                }}>
                  ARCHIVED
                </span>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {/* View */}
              <Link
                href={`/pakej/${pkg.slug}`}
                target="_blank"
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#F5F5F0',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  color: '#2C2C2C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="View Package"
              >
                👁️
              </Link>

              {/* Featured */}
              <button
                onClick={() => handleToggleFeatured(pkg.id, pkg.is_featured)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: pkg.is_featured ? '#F59E0B' : '#F5F5F0',
                  color: pkg.is_featured ? 'white' : '#2C2C2C',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                title={pkg.is_featured ? 'Remove Featured' : 'Add to Featured'}
              >
                ⭐
              </button>

              {/* Status Toggle */}
              {pkg.status === 'draft' && (
                <button
                  onClick={() => handleChangeStatus(pkg.id, 'published')}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  title="Publish Package"
                >
                  ✓
                </button>
              )}

              {pkg.status === 'published' && (
                <button
                  onClick={() => handleChangeStatus(pkg.id, 'archived')}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#F59E0B',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  title="Archive Package"
                >
                  🗄️
                </button>
              )}

              {/* Delete */}
              <button
                onClick={() => handleDelete(pkg.id, pkg.title)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                title="Delete Package"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        {filteredPackages.length === 0 && (
          <div style={{
            padding: '60px',
            textAlign: 'center',
            color: '#999'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              No packages found
            </div>
            <div style={{ fontSize: '14px' }}>
              {searchQuery ? 'Try adjusting your search query' : 'No packages created yet'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}