'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Guide {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  category: string | null
  is_published: boolean
  created_at: string
}

export default function AdminPanduanPage() {
  const supabase = createClient()
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0
  })

  useEffect(() => {
    fetchGuides()
  }, [filter])

  const fetchGuides = async () => {
    setLoading(true)
    
    try {
      let query = supabase
        .from('guides')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filter
      if (filter === 'published') {
        query = query.eq('is_published', true)
      } else if (filter === 'draft') {
        query = query.eq('is_published', false)
      }

      const { data, error } = await query

      if (error) throw error

      setGuides(data || [])

      // Calculate stats
      const { data: allGuides } = await supabase
        .from('guides')
        .select('id, is_published')

      if (allGuides) {
        setStats({
          total: allGuides.length,
          published: allGuides.filter(g => g.is_published).length,
          draft: allGuides.filter(g => !g.is_published).length
        })
      }

    } catch (error) {
      console.error('Error fetching guides:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublish = async (guideId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'unpublish' : 'publish'
    
    if (!confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} this guide?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('guides')
        .update({ is_published: !currentStatus })
        .eq('id', guideId)

      if (error) throw error

      alert(currentStatus ? '📝 Guide unpublished!' : '✅ Guide published!')
      fetchGuides()
    } catch (error) {
      console.error('Error toggling publish:', error)
      alert('❌ Error updating guide status')
    }
  }

  const handleDelete = async (guideId: string, guideTitle: string) => {
    if (!confirm(
      `⚠️ DELETE GUIDE: ${guideTitle}\n\n` +
      `This action CANNOT be undone!\n\n` +
      `Are you sure?`
    )) {
      return
    }

    const userInput = prompt(`Type "${guideTitle}" to confirm deletion:`)
    
    if (userInput !== guideTitle) {
      alert('❌ Guide title does not match. Deletion cancelled.')
      return
    }

    try {
      const { error } = await supabase
        .from('guides')
        .delete()
        .eq('id', guideId)

      if (error) throw error

      alert('🗑️ Guide deleted successfully!')
      fetchGuides()
    } catch (error: any) {
      console.error('Error deleting guide:', error)
      alert(`❌ Error deleting guide: ${error.message}`)
    }
  }

  const filteredGuides = guides.filter(guide => 
    guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guide.category?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <div style={{ fontSize: '16px', fontWeight: '600' }}>Loading guides...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      
      {/* PAGE HEADER */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              Urus Panduan
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#666'
            }}>
              Create and manage umrah guides and articles
            </p>
          </div>
          
          <Link
            href="/admin/panduan/new"
            style={{
              padding: '12px 24px',
              backgroundColor: '#B8936D',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ➕ Tambah Panduan
          </Link>
        </div>
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
              backgroundColor: '#B8936D15',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              📚
            </div>
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '8px',
            fontWeight: '500'
          }}>
            Total Panduan
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
              placeholder="Search guides by title, excerpt, or category..."
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
            {filteredGuides.length} results
          </div>
        </div>
      </div>

      {/* GUIDES TABLE */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid #E5E5E0',
        overflow: 'hidden'
      }}>
        
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 200px',
          padding: '16px 24px',
          backgroundColor: '#F5F5F0',
          borderBottom: '1px solid #E5E5E0',
          fontSize: '13px',
          fontWeight: '700',
          color: '#666',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <div>Guide</div>
          <div>Category</div>
          <div>Created</div>
          <div>Status</div>
          <div>Actions</div>
        </div>

        {/* Table Body */}
        {filteredGuides.map((guide) => (
          <div
            key={guide.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr 200px',
              padding: '20px 24px',
              borderBottom: '1px solid #E5E5E0',
              alignItems: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {/* Guide Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '8px',
                backgroundColor: '#F5F5F0',
                backgroundImage: guide.cover_image ? `url(${guide.cover_image})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0
              }}>
                {!guide.cover_image && '📖'}
              </div>
              <div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#2C2C2C',
                  marginBottom: '4px'
                }}>
                  {guide.title}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#999',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '300px'
                }}>
                  {guide.excerpt || 'No excerpt'}
                </div>
              </div>
            </div>

            {/* Category */}
            <div>
              {guide.category ? (
                <span style={{
                  padding: '6px 12px',
                  backgroundColor: '#B8936D15',
                  color: '#B8936D',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  textTransform: 'capitalize'
                }}>
                  {guide.category}
                </span>
              ) : (
                <span style={{ fontSize: '14px', color: '#999' }}>-</span>
              )}
            </div>

            {/* Created Date */}
            <div style={{
              fontSize: '14px',
              color: '#666'
            }}>
              {new Date(guide.created_at).toLocaleDateString('ms-MY', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>

            {/* Status */}
            <div>
              {guide.is_published ? (
                <span style={{
                  padding: '6px 12px',
                  backgroundColor: '#10B98115',
                  color: '#10B981',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  PUBLISHED
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
                  DRAFT
                </span>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {/* View */}
              <Link
                href={`/panduan/${guide.slug}`}
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
                title="View Guide"
              >
                👁️
              </Link>

              {/* Edit */}
              <Link
                href={`/admin/panduan/edit/${guide.id}`}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Edit Guide"
              >
                ✏️
              </Link>

              {/* Publish/Unpublish */}
              <button
                onClick={() => handleTogglePublish(guide.id, guide.is_published)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: guide.is_published ? '#F59E0B' : '#10B981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                title={guide.is_published ? 'Unpublish' : 'Publish'}
              >
                {guide.is_published ? '📝' : '✓'}
              </button>

              {/* Delete */}
              <button
                onClick={() => handleDelete(guide.id, guide.title)}
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
                title="Delete Guide"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}

        {filteredGuides.length === 0 && (
          <div style={{
            padding: '60px',
            textAlign: 'center',
            color: '#999'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              No guides found
            </div>
            <div style={{ fontSize: '14px', marginBottom: '24px' }}>
              {searchQuery ? 'Try adjusting your search query' : 'No guides created yet'}
            </div>
            {!searchQuery && (
              <Link
                href="/admin/panduan/new"
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#B8936D',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                ➕ Create Your First Guide
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}