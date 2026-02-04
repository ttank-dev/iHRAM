'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Review {
  id: string
  reviewer_name: string | null
  reviewer_email: string | null
  rating: number
  review_text: string
  travel_date: string | null
  photos: string[] | null
  is_verified: boolean
  is_approved: boolean
  created_at: string
  agency_id: string
  package_id: string | null
  agencies?: {
    name: string
    slug: string
  }
  packages?: {
    title: string
    slug: string
  }
}

export default function AdminUlasanPage() {
  const supabase = createClient()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0
  })

  useEffect(() => {
    fetchReviews()
  }, [filter])

  const fetchReviews = async () => {
    setLoading(true)
    
    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          agencies (
            name,
            slug
          ),
          packages (
            title,
            slug
          )
        `)
        .order('created_at', { ascending: false })

      // Apply filter
      if (filter === 'pending') {
        query = query.eq('is_approved', false)
      } else if (filter === 'approved') {
        query = query.eq('is_approved', true)
      }

      const { data, error } = await query

      if (error) throw error

      setReviews(data || [])

      // Calculate stats
      const { data: allReviews } = await supabase
        .from('reviews')
        .select('id, is_approved')

      if (allReviews) {
        setStats({
          total: allReviews.length,
          pending: allReviews.filter(r => !r.is_approved).length,
          approved: allReviews.filter(r => r.is_approved).length
        })
      }

    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (reviewId: string) => {
    if (!confirm('Approve this review?')) return

    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: true })
        .eq('id', reviewId)

      if (error) throw error

      alert('✅ Review approved!')
      fetchReviews()
    } catch (error) {
      console.error('Error approving review:', error)
      alert('❌ Error approving review')
    }
  }

  const handleReject = async (reviewId: string) => {
    if (!confirm('Reject/Hide this review?')) return

    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: false })
        .eq('id', reviewId)

      if (error) throw error

      alert('❌ Review rejected!')
      fetchReviews()
    } catch (error) {
      console.error('Error rejecting review:', error)
      alert('❌ Error rejecting review')
    }
  }

  const handleToggleVerified = async (reviewId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('reviews')
        .update({ is_verified: !currentStatus })
        .eq('id', reviewId)

      if (error) throw error

      alert(currentStatus ? '⭐ Removed verified badge!' : '⭐ Added verified badge!')
      fetchReviews()
    } catch (error) {
      console.error('Error toggling verified:', error)
      alert('❌ Error updating verified status')
    }
  }

  const handleDelete = async (reviewId: string, reviewerName: string) => {
    if (!confirm(
      `⚠️ DELETE REVIEW by ${reviewerName || 'Anonymous'}\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Are you sure?`
    )) {
      return
    }

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)

      if (error) throw error

      alert('🗑️ Review deleted successfully!')
      fetchReviews()
    } catch (error: any) {
      console.error('Error deleting review:', error)
      alert(`❌ Error deleting review: ${error.message}`)
    }
  }

  const filteredReviews = reviews.filter(review => 
    review.reviewer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.review_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.agencies?.name.toLowerCase().includes(searchQuery.toLowerCase())
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
          <div style={{ fontSize: '16px', fontWeight: '600' }}>Loading reviews...</div>
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
          Urus Ulasan
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666'
        }}>
          Review, approve, and moderate all customer reviews
        </p>
      </div>

      {/* STATS CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
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
              backgroundColor: '#F59E0B15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              ⭐
            </div>
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Total Ulasan
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
          onClick={() => setFilter('pending')}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: filter === 'pending' ? '2px solid #B8936D' : '1px solid #E5E5E0',
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
            Pending
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#2C2C2C'
          }}>
            {stats.pending}
          </div>
        </div>

        <div
          onClick={() => setFilter('approved')}
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            border: filter === 'approved' ? '2px solid #B8936D' : '1px solid #E5E5E0',
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
            Approved
          </div>
          <div style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#2C2C2C'
          }}>
            {stats.approved}
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
              placeholder="Search reviews by reviewer name, agency, or review text..."
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
            {filteredReviews.length} results
          </div>
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {filteredReviews.map((review) => (
          <div
            key={review.id}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #E5E5E0',
              transition: 'all 0.2s'
            }}
          >
            {/* Review Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#2C2C2C'
                  }}>
                    {review.reviewer_name || 'Anonymous'}
                  </div>
                  
                  {review.is_verified && (
                    <span style={{
                      padding: '4px 8px',
                      backgroundColor: '#10B98115',
                      color: '#10B981',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      VERIFIED
                    </span>
                  )}

                  <div style={{ display: 'flex', gap: '2px' }}>
                    {'⭐'.repeat(review.rating)}
                  </div>
                </div>

                <div style={{
                  fontSize: '13px',
                  color: '#999',
                  marginBottom: '4px'
                }}>
                  {review.agencies?.name} {review.packages?.title && `• ${review.packages.title}`}
                </div>

                <div style={{
                  fontSize: '13px',
                  color: '#999'
                }}>
                  {new Date(review.created_at).toLocaleDateString('ms-MY', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                  {review.travel_date && ` • Travel: ${review.travel_date}`}
                </div>
              </div>

              {/* Status Badge */}
              <div>
                {review.is_approved ? (
                  <span style={{
                    padding: '6px 12px',
                    backgroundColor: '#10B98115',
                    color: '#10B981',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    APPROVED
                  </span>
                ) : (
                  <span style={{
                    padding: '6px 12px',
                    backgroundColor: '#F59E0B15',
                    color: '#F59E0B',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    PENDING
                  </span>
                )}
              </div>
            </div>

            {/* Review Text */}
            <div style={{
              fontSize: '15px',
              color: '#2C2C2C',
              lineHeight: '1.6',
              marginBottom: '16px',
              padding: '16px',
              backgroundColor: '#F5F5F0',
              borderRadius: '8px'
            }}>
              {review.review_text}
            </div>

            {/* Review Photos */}
            {review.photos && review.photos.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '16px',
                overflowX: 'auto'
              }}>
                {review.photos.slice(0, 4).map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Review photo ${index + 1}`}
                    style={{
                      width: '100px',
                      height: '100px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      flexShrink: 0
                    }}
                  />
                ))}
                {review.photos.length > 4 && (
                  <div style={{
                    width: '100px',
                    height: '100px',
                    backgroundColor: '#F5F5F0',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#666'
                  }}>
                    +{review.photos.length - 4}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid #E5E5E0'
            }}>
              {!review.is_approved && (
                <button
                  onClick={() => handleApprove(review.id)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ✓ Approve
                </button>
              )}

              {review.is_approved && (
                <button
                  onClick={() => handleReject(review.id)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: 'transparent',
                    color: '#EF4444',
                    border: '1px solid #EF4444',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ✕ Unapprove
                </button>
              )}

              <button
                onClick={() => handleToggleVerified(review.id, review.is_verified)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: review.is_verified ? '#F59E0B' : '#F5F5F0',
                  color: review.is_verified ? 'white' : '#2C2C2C',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ⭐ {review.is_verified ? 'Unverify' : 'Verify'}
              </button>

              <div style={{ flex: 1 }} />

              <button
                onClick={() => handleDelete(review.id, review.reviewer_name || 'Anonymous')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  color: '#EF4444',
                  border: '1px solid #E5E5E0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}

        {filteredReviews.length === 0 && (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '60px',
            textAlign: 'center',
            border: '1px solid #E5E5E0',
            color: '#999'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              No reviews found
            </div>
            <div style={{ fontSize: '14px' }}>
              {searchQuery ? 'Try adjusting your search query' : 'No reviews submitted yet'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}