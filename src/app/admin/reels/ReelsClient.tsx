'use client'

import { useState } from 'react'
import ReelsActions from './ReelsActions'

export default function ReelsClient({ initialReels }: { initialReels: any[] }) {
  const [reels, setReels] = useState(initialReels)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'hidden'>('all')
  const [agencyFilter, setAgencyFilter] = useState<string>('all')
  const [playingReel, setPlayingReel] = useState<any>(null)
  
  // Get unique agencies
  const agencies = Array.from(new Set(reels.map(r => r.agencies?.name).filter(Boolean)))

  // Filter reels
  const filteredReels = reels.filter(reel => {
    const matchesSearch = !searchTerm || 
      reel.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reel.agencies?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && reel.is_active) ||
      (statusFilter === 'hidden' && !reel.is_active)
    
    const matchesAgency = agencyFilter === 'all' ||
      reel.agencies?.name === agencyFilter
    
    return matchesSearch && matchesStatus && matchesAgency
  })

  const stats = {
    total: reels.length,
    active: reels.filter(r => r.is_active).length,
    hidden: reels.filter(r => !r.is_active).length
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
          Reels Management
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666'
        }}>
          Moderate agency reels and short videos
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
            Total Reels
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
            Active Reels
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
            Hidden Reels
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
              placeholder="Search title or agency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
          </div>

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

        <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
          Showing <strong>{filteredReels.length}</strong> of <strong>{reels.length}</strong> reels
        </div>
      </div>

      {/* REELS GRID */}
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
            Reels
          </h2>
        </div>

        {filteredReels.length === 0 ? (
          <div style={{
            padding: '80px 40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎬</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              {searchTerm || statusFilter !== 'all' || agencyFilter !== 'all'
                ? 'No reels match your filters'
                : 'No Reels Yet'}
            </div>
            <div style={{
              fontSize: '15px',
              color: '#666'
            }}>
              {searchTerm || statusFilter !== 'all' || agencyFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Agency reels will appear here'}
            </div>
          </div>
        ) : (
          <div style={{
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px'
          }}>
            {filteredReels.map((reel: any) => (
              <div
                key={reel.id}
                style={{
                  backgroundColor: '#F5F5F0',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {/* Reel Thumbnail */}
                <div 
                  onClick={() => setPlayingReel(reel)}
                  style={{
                    width: '100%',
                    paddingBottom: '177.78%',
                    position: 'relative',
                    backgroundColor: '#1A1A1A',
                    cursor: 'pointer'
                  }}
                >
                  {reel.thumbnail_url ? (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      backgroundImage: `url(${reel.thumbnail_url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }} />
                  ) : (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px'
                    }}>
                      🎬
                    </div>
                  )}

                  {/* Status Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor: reel.is_active ? '#10B981' : '#EF4444',
                    color: 'white'
                  }}>
                    {reel.is_active ? '✅' : '❌'}
                  </div>

                  {/* Play Icon */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    cursor: 'pointer'
                  }}>
                    ▶️
                  </div>
                </div>

                {/* Reel Info */}
                <div style={{ padding: '12px' }}>
                  <div style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#2C2C2C',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {reel.agencies?.name || 'Unknown'}
                  </div>
                  
                  {reel.title && (
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {reel.title}
                    </div>
                  )}
                  
                  <div style={{
                    fontSize: '12px',
                    color: '#999',
                    marginBottom: '8px'
                  }}>
                    {new Date(reel.created_at).toLocaleDateString('ms-MY', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </div>

                  <ReelsActions reel={reel} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VIDEO PLAYER MODAL */}
      {playingReel && (
        <div 
          onClick={() => setPlayingReel(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'pointer'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '600px',
              width: '90%',
              backgroundColor: '#000',
              borderRadius: '16px',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setPlayingReel(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.9)',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>

            {/* Video Player */}
            <video
              src={playingReel.video_url}
              controls
              autoPlay
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '80vh',
                display: 'block'
              }}
            />

            {/* Video Info */}
            <div style={{
              padding: '16px',
              backgroundColor: '#1A1A1A',
              color: 'white'
            }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                {playingReel.title || 'Untitled'}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#999'
              }}>
                {playingReel.agencies?.name || 'Unknown Agency'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}