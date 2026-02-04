'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Agency {
  id: string
  name: string
  slug: string
  logo_url: string | null
  cover_url: string | null
  about: string | null
  ssm_number: string | null
  phone: string | null
  email: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  is_verified: boolean
  is_active: boolean
  user_id: string
  created_at: string
  packages?: { count: number }[]
  reviews?: { count: number }[]
}

export default function AdminAgensiPage() {
  const supabase = createClient()
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified' | 'inactive'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    unverified: 0,
    inactive: 0
  })

  useEffect(() => {
    fetchAgencies()
  }, [filter])

  const fetchAgencies = async () => {
    setLoading(true)
    
    try {
      let query = supabase
        .from('agencies')
        .select(`
          *,
          packages:packages(count),
          reviews:reviews(count)
        `)
        .order('created_at', { ascending: false })

      // Apply filter
      if (filter === 'verified') {
        query = query.eq('is_verified', true)
      } else if (filter === 'unverified') {
        query = query.eq('is_verified', false)
      } else if (filter === 'inactive') {
        query = query.eq('is_active', false)
      }

      const { data, error } = await query

      if (error) throw error

      setAgencies(data || [])

      // Calculate stats from all agencies
      const { data: allAgencies } = await supabase
        .from('agencies')
        .select('id, is_verified, is_active')

      if (allAgencies) {
        setStats({
          total: allAgencies.length,
          verified: allAgencies.filter(a => a.is_verified).length,
          unverified: allAgencies.filter(a => !a.is_verified).length,
          inactive: allAgencies.filter(a => !a.is_active).length
        })
      }

    } catch (error) {
      console.error('Error fetching agencies:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleVerification = async (agencyId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'unverify' : 'verify'
    
    if (!confirm(`Are you sure you want to ${action} this agency?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('agencies')
        .update({ is_verified: !currentStatus })
        .eq('id', agencyId)

      if (error) throw error

      alert(currentStatus ? '❌ Agency unverified!' : '✅ Agency verified!')
      fetchAgencies()
    } catch (error) {
      console.error('Error toggling verification:', error)
      alert('❌ Error updating agency verification')
    }
  }

  const handleToggleActive = async (agencyId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'suspend' : 'activate'
    
    if (!confirm(`Are you sure you want to ${action} this agency?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('agencies')
        .update({ is_active: !currentStatus })
        .eq('id', agencyId)

      if (error) throw error

      alert(currentStatus ? '⏸️ Agency suspended!' : '✅ Agency activated!')
      fetchAgencies()
    } catch (error) {
      console.error('Error toggling active status:', error)
      alert('❌ Error updating agency status')
    }
  }

  const handleDelete = async (agencyId: string, agencyName: string) => {
    const agency = agencies.find(a => a.id === agencyId)
    
    // Double confirmation
    if (!confirm(
      `⚠️ DELETE AGENCY: ${agencyName}\n\n` +
      `This will permanently delete:\n` +
      `- Agency profile\n` +
      `- ${getPackageCount(agency!)} packages\n` +
      `- ${getReviewCount(agency!)} reviews\n` +
      `- All news feed posts\n` +
      `- All reels\n` +
      `- All leads data\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Are you absolutely sure?`
    )) {
      return
    }

    const userInput = prompt(`Type "${agencyName}" exactly to confirm deletion:`)
    
    if (userInput !== agencyName) {
      alert('❌ Agency name does not match. Deletion cancelled.')
      return
    }

    try {
      console.log('🗑️ Starting delete for agency:', agencyId)

      // Delete packages
      console.log('Deleting packages...')
      const { error: packagesError } = await supabase
        .from('packages')
        .delete()
        .eq('agency_id', agencyId)

      if (packagesError) {
        console.error('Error deleting packages:', packagesError)
        throw new Error('Failed to delete packages: ' + packagesError.message)
      }

      // Delete reviews
      console.log('Deleting reviews...')
      const { error: reviewsError } = await supabase
        .from('reviews')
        .delete()
        .eq('agency_id', agencyId)

      if (reviewsError) {
        console.error('Error deleting reviews:', reviewsError)
        throw new Error('Failed to delete reviews: ' + reviewsError.message)
      }

      // Delete news_feed (CORRECT TABLE NAME WITH UNDERSCORE!)
      console.log('Deleting news_feed...')
      const { error: newsFeedError } = await supabase
        .from('news_feed')
        .delete()
        .eq('agency_id', agencyId)

      if (newsFeedError) {
        console.error('Error deleting news_feed:', newsFeedError)
        // Don't throw, just log
      }

      // Delete reels
      console.log('Deleting reels...')
      const { error: reelsError } = await supabase
        .from('reels')
        .delete()
        .eq('agency_id', agencyId)

      if (reelsError) {
        console.error('Error deleting reels:', reelsError)
        // Don't throw, just log
      }

      // Delete leads
      console.log('Deleting leads...')
      const { error: leadsError } = await supabase
        .from('leads')
        .delete()
        .eq('agency_id', agencyId)

      if (leadsError) {
        console.error('Error deleting leads:', leadsError)
        // Don't throw, just log
      }

      // Finally delete the agency
      console.log('Deleting agency...')
      const { error: agencyError } = await supabase
        .from('agencies')
        .delete()
        .eq('id', agencyId)

      if (agencyError) {
        console.error('Error deleting agency:', agencyError)
        throw new Error('Failed to delete agency: ' + agencyError.message)
      }

      console.log('✅ Delete completed successfully!')
      alert('🗑️ Agency deleted successfully!')
      fetchAgencies()
      
    } catch (error: any) {
      console.error('❌ Delete operation failed:', error)
      alert(
        `❌ Error deleting agency:\n\n` +
        `${error.message}\n\n` +
        `Check browser console for details.`
      )
    }
  }

  const filteredAgencies = agencies.filter(agency => 
    agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agency.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getPackageCount = (agency: Agency) => {
    return agency.packages?.[0]?.count || 0
  }

  const getReviewCount = (agency: Agency) => {
    return agency.reviews?.[0]?.count || 0
  }

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
          <div style={{ fontSize: '16px', fontWeight: '600' }}>Loading agencies...</div>
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
          Urus Agensi
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666'
        }}>
          Verify, manage, and monitor all registered travel agencies
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
              backgroundColor: '#3B82F615',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🏢
            </div>
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Total Agensi
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
          onClick={() => setFilter('verified')}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: filter === 'verified' ? '2px solid #B8936D' : '1px solid #E5E5E0',
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
            Verified
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#2C2C2C'
          }}>
            {stats.verified}
          </div>
        </div>

        <div
          onClick={() => setFilter('unverified')}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: filter === 'unverified' ? '2px solid #B8936D' : '1px solid #E5E5E0',
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
              ⏳
            </div>
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Unverified
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#2C2C2C'
          }}>
            {stats.unverified}
          </div>
        </div>

        <div
          onClick={() => setFilter('inactive')}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: filter === 'inactive' ? '2px solid #B8936D' : '1px solid #E5E5E0',
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
              ⛔
            </div>
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Inactive
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#2C2C2C'
          }}>
            {stats.inactive}
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
              placeholder="Search agencies by name or email..."
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
            {filteredAgencies.length} results
          </div>
        </div>
      </div>

      {/* AGENCIES TABLE - (Same as before, truncated for brevity) */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid #E5E5E0',
        overflow: 'hidden'
      }}>
        
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
          <div>Agency</div>
          <div>Contact</div>
          <div>Pakej</div>
          <div>Ulasan</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {filteredAgencies.map((agency) => (
          <div
            key={agency.id}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '8px',
                backgroundColor: agency.logo_url ? 'transparent' : '#F5F5F0',
                backgroundImage: agency.logo_url ? `url(${agency.logo_url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#B8936D',
                flexShrink: 0
              }}>
                {!agency.logo_url && agency.name.charAt(0)}
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
                  {agency.name}
                  {agency.is_verified && <span style={{ fontSize: '16px', color: '#10B981' }}>✓</span>}
                </div>
                <div style={{ fontSize: '13px', color: '#999' }}>
                  Joined {new Date(agency.created_at).toLocaleDateString('ms-MY', {
                    year: 'numeric', month: 'short', day: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '14px', color: '#2C2C2C', marginBottom: '4px' }}>
                {agency.phone || '-'}
              </div>
              <div style={{ fontSize: '13px', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {agency.email || '-'}
              </div>
            </div>

            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C' }}>
              {getPackageCount(agency)}
            </div>

            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C' }}>
              {getReviewCount(agency)}
            </div>

            <div>
              {!agency.is_active ? (
                <span style={{ padding: '6px 12px', backgroundColor: '#EF444415', color: '#EF4444', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>INACTIVE</span>
              ) : agency.is_verified ? (
                <span style={{ padding: '6px 12px', backgroundColor: '#10B98115', color: '#10B981', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>VERIFIED</span>
              ) : (
                <span style={{ padding: '6px 12px', backgroundColor: '#F59E0B15', color: '#F59E0B', borderRadius: '6px', fontSize: '12px', fontWeight: '700' }}>PENDING</span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Link href={`/agensi/${agency.slug}`} target="_blank" style={{ padding: '8px 12px', backgroundColor: '#F5F5F0', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textDecoration: 'none', color: '#2C2C2C', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="View Profile">👁️</Link>
              
              <button onClick={() => handleToggleVerification(agency.id, agency.is_verified)} style={{ padding: '8px 12px', backgroundColor: agency.is_verified ? '#F59E0B' : '#10B981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} title={agency.is_verified ? 'Unverify Agency' : 'Verify Agency'}>
                {agency.is_verified ? '❌' : '✓'}
              </button>

              <button onClick={() => handleToggleActive(agency.id, agency.is_active)} style={{ padding: '8px 12px', backgroundColor: agency.is_active ? '#8B5CF6' : '#10B981', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} title={agency.is_active ? 'Suspend Agency' : 'Activate Agency'}>
                {agency.is_active ? '⏸️' : '▶️'}
              </button>

              <button onClick={() => handleDelete(agency.id, agency.name)} style={{ padding: '8px 12px', backgroundColor: '#EF4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} title="Delete Agency">🗑️</button>
            </div>
          </div>
        ))}

        {filteredAgencies.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', color: '#999' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No agencies found</div>
            <div style={{ fontSize: '14px' }}>
              {searchQuery ? 'Try adjusting your search query' : 'No agencies registered yet'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}