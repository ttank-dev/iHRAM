'use client'

import { useState } from 'react'
import NewsFeedActions from './NewsFeedActions'

export default function NewsFeedClient({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all')
  const [agencyFilter, setAgencyFilter] = useState<string>('all')
  
  // Get unique agencies
  const agencies = Array.from(new Set(posts.map(p => p.agencies?.name).filter(Boolean)))

  // Filter posts
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.agencies?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && post.is_active) ||
      (statusFilter === 'hidden' && !post.is_active)
    
    const matchesAgency = agencyFilter === 'all' ||
      post.agencies?.name === agencyFilter
    
    return matchesSearch && matchesStatus && matchesAgency
  })

  const stats = {
    total: posts.length,
    active: posts.filter(p => p.is_active).length,
    hidden: posts.filter(p => !p.is_active).length
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
          News Feed Management
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666'
        }}>
          Moderate agency news feed posts
        </p>
      </div>

      {/* STATS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '13px', color: '#999', fontWeight: '600', marginBottom: '8px' }}>
            Total Posts
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C' }}>
            {stats.total}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '13px', color: '#999', fontWeight: '600', marginBottom: '8px' }}>
            Active Posts
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10B981' }}>
            {stats.active}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '13px', color: '#999', fontWeight: '600', marginBottom: '8px' }}>
            Hidden Posts
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F59E0B' }}>
            {stats.hidden}
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #E5E5E0',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: '16px'
        }}>
          {/* Search */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              🔍 Search
            </label>
            <input
              type="text"
              placeholder="Search content or agency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '90%',
                padding: '10px 16px',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              style={{
                width: '100%',
                padding: '10px 16px',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Status</option>
              <option value="active">✅ Active</option>
              <option value="hidden">❌ Hidden</option>
            </select>
          </div>

          {/* Agency Filter */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              Agency
            </label>
            <select
              value={agencyFilter}
              onChange={(e) => setAgencyFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Agencies</option>
              {agencies.map(agency => (
                <option key={agency} value={agency}>{agency}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results count */}
        <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
          Showing <strong>{filteredPosts.length}</strong> of <strong>{posts.length}</strong> posts
        </div>
      </div>

      {/* POSTS LIST */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid #E5E5E0',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #E5E5E0'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#2C2C2C'
          }}>
            News Feed Posts
          </h2>
        </div>

        {filteredPosts.length === 0 ? (
          <div style={{
            padding: '80px 40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📰</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              {searchTerm || statusFilter !== 'all' || agencyFilter !== 'all' 
                ? 'No posts match your filters' 
                : 'No News Feed Posts Yet'}
            </div>
            <div style={{
              fontSize: '15px',
              color: '#666'
            }}>
              {searchTerm || statusFilter !== 'all' || agencyFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Agency posts will appear here'}
            </div>
          </div>
        ) : (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredPosts.map((post: any) => {
              // Get first image from images array
              const firstImage = post.images && Array.isArray(post.images) && post.images.length > 0 
                ? post.images[0] 
                : null
              
              return (
                <div
                  key={post.id}
                  style={{
                    padding: '20px',
                    backgroundColor: '#F5F5F0',
                    borderRadius: '12px',
                    display: 'flex',
                    gap: '16px'
                  }}
                >
                  {/* Post Image - Show first image from array */}
                  {firstImage && (
                    <div style={{
                      width: '160px',
                      height: '160px',
                      borderRadius: '8px',
                      backgroundImage: `url(${firstImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      flexShrink: 0,
                      border: '1px solid #E5E5E0'
                    }} />
                  )}

                  {/* Post Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '8px'
                    }}>
                      <div>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#2C2C2C',
                          marginBottom: '4px'
                        }}>
                          {post.agencies?.name || 'Unknown Agency'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#999' }}>
                          {new Date(post.created_at).toLocaleDateString('ms-MY', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: post.is_active ? '#ECFDF5' : '#FEE2E2',
                        color: post.is_active ? '#10B981' : '#EF4444'
                      }}>
                        {post.is_active ? '✅ Active' : '❌ Hidden'}
                      </span>
                    </div>

                    {/* Title if exists */}
                    {post.title && (
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#2C2C2C',
                        marginBottom: '8px'
                      }}>
                        {post.title}
                      </h3>
                    )}

                    {/* Content */}
                    <p style={{
                      fontSize: '14px',
                      color: '#666',
                      lineHeight: '1.6',
                      marginBottom: '8px'
                    }}>
                      {post.content}
                    </p>

                    {/* Image count badge */}
                    {post.images && post.images.length > 0 && (
                      <div style={{
                        display: 'inline-block',
                        padding: '4px 8px',
                        backgroundColor: '#E3F2FD',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#2196F3',
                        marginBottom: '12px'
                      }}>
                        📷 {post.images.length} {post.images.length === 1 ? 'image' : 'images'}
                      </div>
                    )}

                    <NewsFeedActions post={post} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}