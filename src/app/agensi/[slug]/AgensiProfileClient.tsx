'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Agency {
  id: string
  name: string
  slug: string
  logo_url: string | null
  cover_url: string | null
  about: string | null
  phone: string | null
  email: string | null
  website: string | null
  ssm_number: string | null
  is_verified: boolean
}

interface Package {
  id: string
  title: string
  slug: string
  package_type: string | null
  price_quad: number | null
  duration_nights: number | null
  departure_city: string | null
  photos: string[] | null
}

interface Review {
  id: string
  reviewer_name: string | null
  rating: number
  review_text: string
  travel_date: string
  created_at: string
}

interface NewsFeedPost {
  id: string
  title: string
  content: string
  images: string[] | null
  created_at: string
}

interface Reel {
  id: string
  title: string
  video_url: string
  thumbnail_url: string | null
  views: number
  created_at: string
}

// 🎬 VIDEO PLAYER MODAL COMPONENT
function VideoPlayerModal({ 
  reel, 
  onClose, 
  onNext, 
  onPrev,
  hasNext,
  hasPrev 
}: { 
  reel: Reel | null
  onClose: () => void
  onNext: () => void
  onPrev: () => void
  hasNext: boolean
  hasPrev: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    if (reel && videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch(err => console.log('Autoplay prevented:', err))
    }
  }, [reel])

  if (!reel) return null

  const togglePlay = () => {
    if (!videoRef.current) return
    
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const pos = (e.clientX - rect.left) / rect.width
    videoRef.current.currentTime = pos * duration
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '40px',
          height: '40px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          border: 'none',
          borderRadius: '50%',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10001
        }}
      >
        ✕
      </button>

      {/* Previous Button */}
      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '50px',
            height: '50px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001
          }}
        >
          ‹
        </button>
      )}

      {/* Next Button */}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          style={{
            position: 'absolute',
            right: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '50px',
            height: '50px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            borderRadius: '50%',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001
          }}
        >
          ›
        </button>
      )}

      {/* Video Container */}
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '500px',
          margin: '0 auto',
          position: 'relative'
        }}
      >
        {/* Video */}
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '80vh',
            backgroundColor: '#000',
            borderRadius: '12px'
          }}
          playsInline
          loop
          muted={isMuted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={togglePlay}
        >
          <source src={reel.video_url} type="video/mp4" />
          <source src={reel.video_url} type="video/webm" />
          <source src={reel.video_url} type="video/quicktime" />
          Your browser does not support video playback.
        </video>

        {/* Video Info Overlay */}
        <div style={{
          position: 'absolute',
          bottom: '80px',
          left: '20px',
          right: '20px',
          color: 'white',
          zIndex: 10
        }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '700', 
            marginBottom: '8px',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            {reel.title}
          </h3>
          <div style={{ 
            fontSize: '14px', 
            opacity: 0.9,
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            👁️ {reel.views.toLocaleString()} views
          </div>
        </div>

        {/* Controls */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          color: 'white',
          zIndex: 10
        }}>
          {/* Progress Bar */}
          <div 
            onClick={handleSeek}
            style={{
              width: '100%',
              height: '4px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '2px',
              marginBottom: '12px',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <div style={{
              width: `${(currentTime / duration) * 100}%`,
              height: '100%',
              backgroundColor: '#B8936D',
              borderRadius: '2px'
            }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>

            {/* Time */}
            <div style={{ fontSize: '14px' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            <div style={{ flex: 1 }} />

            {/* Mute/Unmute */}
            <button
              onClick={toggleMute}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>

        {/* Center Play Button (when paused) */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80px',
              height: '80px',
              backgroundColor: 'rgba(184, 147, 109, 0.9)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '32px'
            }}
          >
            ▶️
          </div>
        )}
      </div>
    </div>
  )
}

export default function AgensiProfileClient({
  agency,
  packages = [],
  reviews = [],
  newsFeed = [],
  reels = []
}: {
  agency: Agency
  packages: Package[]
  reviews: Review[]
  newsFeed: NewsFeedPost[]
  reels: Reel[]
}) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'pakej' | 'newsfeed' | 'reels' | 'tentang' | 'ulasan'>('pakej')
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [selectedReelIndex, setSelectedReelIndex] = useState<number | null>(null)

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null
  const reviewCount = reviews ? reviews.length : 0
const trackReelView = async (reelId: string) => {
  try {
    console.log('🔵 Tracking view for:', reelId)
    
    // Use RPC function instead of direct update
    const { error } = await supabase.rpc('increment_reel_views', {
      reel_id: reelId
    })
    
    if (error) {
      console.error('❌ Error:', error)
      return
    }
    
    console.log('✅ View tracked!')
  } catch (error) {
    console.error('❌ Error:', error)
  }
}
  const handleShare = async () => {
    const shareUrl = window.location.href
    const shareTitle = `${agency.name} - Agensi Umrah`
    const shareText = `Lihat profile ${agency.name} di iHRAM`

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl)
        alert('✅ Link disalin! Paste untuk share.')
      } catch (err) {
        setShowShareMenu(!showShareMenu)
      }
    }
  }

  const shareToSocial = (platform: string) => {
    const shareUrl = encodeURIComponent(window.location.href)
    const shareText = encodeURIComponent(`Lihat profile ${agency.name} di iHRAM`)
    
    let url = ''
    
    switch(platform) {
      case 'whatsapp':
        url = `https://wa.me/?text=${shareText}%20${shareUrl}`
        break
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
        break
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`
        break
      case 'telegram':
        url = `https://t.me/share/url?url=${shareUrl}&text=${shareText}`
        break
      case 'copy':
        navigator.clipboard.writeText(window.location.href)
        alert('✅ Link disalin!')
        setShowShareMenu(false)
        return
    }
    
    window.open(url, '_blank')
    setShowShareMenu(false)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showShareMenu) {
        setShowShareMenu(false)
      }
    }
    
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showShareMenu])

  // Handle keyboard navigation for video player
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (selectedReelIndex === null) return
      
      if (e.key === 'Escape') {
        setSelectedReelIndex(null)
      } else if (e.key === 'ArrowRight' && selectedReelIndex < reels.length - 1) {
        setSelectedReelIndex(selectedReelIndex + 1)
      } else if (e.key === 'ArrowLeft' && selectedReelIndex > 0) {
        setSelectedReelIndex(selectedReelIndex - 1)
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedReelIndex, reels.length])

  return (
    <div style={{ backgroundColor: '#F5F5F0', minHeight: '100vh' }}>
      
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

      <div style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E5E0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          
          <div style={{
            height: '400px',
            backgroundImage: agency.cover_url ? `url(${agency.cover_url})` : 'linear-gradient(135deg, #B8936D 0%, #8B6F47 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            borderRadius: '0 0 8px 8px'
          }}>
            {agency.is_verified && (
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                padding: '12px 24px',
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                borderRadius: '30px',
                fontSize: '14px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>✓</span>
                <span>VERIFIED</span>
              </div>
            )}
          </div>

          <div style={{ padding: '0 40px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-end',
              marginTop: '-80px',
              paddingBottom: '24px',
              gap: '24px'
            }}>
              
              <div style={{
                width: '168px',
                height: '168px',
                borderRadius: '50%',
                border: '6px solid white',
                backgroundColor: agency.logo_url ? 'white' : '#F5F5F0',
                backgroundImage: agency.logo_url ? `url(${agency.logo_url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '64px',
                flexShrink: 0,
                position: 'relative',
                zIndex: 20
              }}>
                {!agency.logo_url && agency.name.charAt(0).toUpperCase()}
              </div>

              <div style={{ flex: 1, paddingBottom: '8px' }}>
                <h1 style={{ 
                  fontSize: '32px', 
                  fontWeight: 'bold', 
                  color: '#2C2C2C',
                  marginBottom: '8px'
                }}>
                  {agency.name}
                </h1>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '24px',
                  fontSize: '15px',
                  color: '#666'
                }}>
                  {avgRating && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#B8936D' }}>⭐</span>
                      <span style={{ fontWeight: '600', color: '#2C2C2C' }}>{avgRating}</span>
                      <span>• {reviewCount} ulasan</span>
                    </div>
                  )}
                  <div>
                    <span style={{ fontWeight: '600', color: '#2C2C2C' }}>{packages.length}</span>
                    <span> pakej</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                {agency.phone && (
                  <a
                    href={`https://wa.me/6${agency.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '14px 32px',
                      backgroundColor: '#25D366',
                      color: 'white',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '700',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>💬</span>
                    <span>WhatsApp</span>
                  </a>
                )}

                <div style={{ position: 'relative' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare()
                    }}
                    style={{
                      padding: '14px 32px',
                      backgroundColor: 'white',
                      color: '#B8936D',
                      border: '2px solid #B8936D',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <span>🔗</span>
                    <span>Share</span>
                  </button>

                  {showShareMenu && (
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        marginTop: '8px',
                        backgroundColor: 'white',
                        border: '1px solid #E5E5E0',
                        borderRadius: '12px',
                        padding: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        minWidth: '200px',
                        zIndex: 100
                      }}
                    >
                      <div style={{ fontSize: '12px', color: '#999', padding: '8px 12px', fontWeight: '600' }}>
                        SHARE VIA
                      </div>
                      
                      <button
                        onClick={() => shareToSocial('whatsapp')}
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          fontSize: '15px',
                          color: '#2C2C2C',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>💬</span>
                        <span>WhatsApp</span>
                      </button>

                      <button
                        onClick={() => shareToSocial('facebook')}
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          fontSize: '15px',
                          color: '#2C2C2C',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>📘</span>
                        <span>Facebook</span>
                      </button>

                      <button
                        onClick={() => shareToSocial('telegram')}
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          fontSize: '15px',
                          color: '#2C2C2C',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>✈️</span>
                        <span>Telegram</span>
                      </button>

                      <div style={{ height: '1px', backgroundColor: '#E5E5E0', margin: '8px 0' }} />

                      <button
                        onClick={() => shareToSocial('copy')}
                        style={{
                          width: '100%',
                          padding: '12px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer',
                          fontSize: '15px',
                          color: '#2C2C2C',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ fontSize: '20px' }}>📋</span>
                        <span>Copy Link</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              borderBottom: '2px solid #E5E5E0',
              paddingBottom: '0'
            }}>
              <button
                onClick={() => setActiveTab('pakej')}
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'transparent',
                  color: activeTab === 'pakej' ? '#B8936D' : '#666',
                  border: 'none',
                  borderBottom: activeTab === 'pakej' ? '3px solid #B8936D' : '3px solid transparent',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                📦 Pakej ({packages.length})
              </button>

              <button
                onClick={() => setActiveTab('newsfeed')}
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'transparent',
                  color: activeTab === 'newsfeed' ? '#B8936D' : '#666',
                  border: 'none',
                  borderBottom: activeTab === 'newsfeed' ? '3px solid #B8936D' : '3px solid transparent',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                📰 News Feed ({newsFeed.length})
              </button>

              <button
                onClick={() => setActiveTab('reels')}
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'transparent',
                  color: activeTab === 'reels' ? '#B8936D' : '#666',
                  border: 'none',
                  borderBottom: activeTab === 'reels' ? '3px solid #B8936D' : '3px solid transparent',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                🎬 Reels ({reels.length})
              </button>

              <button
                onClick={() => setActiveTab('tentang')}
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'transparent',
                  color: activeTab === 'tentang' ? '#B8936D' : '#666',
                  border: 'none',
                  borderBottom: activeTab === 'tentang' ? '3px solid #B8936D' : '3px solid transparent',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                ℹ️ Tentang
              </button>

              <button
                onClick={() => setActiveTab('ulasan')}
                style={{
                  padding: '16px 32px',
                  backgroundColor: 'transparent',
                  color: activeTab === 'ulasan' ? '#B8936D' : '#666',
                  border: 'none',
                  borderBottom: activeTab === 'ulasan' ? '3px solid #B8936D' : '3px solid transparent',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                ⭐ Ulasan ({reviewCount})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>

        {activeTab === 'newsfeed' && (
          <div style={{ padding: '32px 0' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              
              {newsFeed && newsFeed.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {newsFeed.map((post) => (
                    <div
                      key={post.id}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        border: '1px solid #E5E5E0'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          backgroundColor: agency.logo_url ? 'transparent' : '#B8936D',
                          backgroundImage: agency.logo_url ? `url(${agency.logo_url})` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '18px',
                          fontWeight: 'bold'
                        }}>
                          {!agency.logo_url && agency.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', color: '#2C2C2C' }}>{agency.name}</div>
                          <div style={{ fontSize: '13px', color: '#999' }}>
                            {new Date(post.created_at).toLocaleDateString('ms-MY')}
                          </div>
                        </div>
                      </div>

                      <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#2C2C2C', marginBottom: '12px' }}>
                        {post.title}
                      </h3>

                      <p style={{ fontSize: '15px', color: '#2C2C2C', lineHeight: '1.6', marginBottom: '16px', whiteSpace: 'pre-wrap' }}>
                        {post.content}
                      </p>

                      {post.images && post.images.length > 0 && (
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: post.images.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                          gap: '8px',
                          marginTop: '16px'
                        }}>
                          {post.images.slice(0, 4).map((image, index) => (
                            <div 
                              key={index}
                              style={{
                                position: 'relative',
                                paddingBottom: post.images.length === 1 ? '50%' : '100%',
                                backgroundColor: '#F5F5F0',
                                borderRadius: '8px',
                                overflow: 'hidden'
                              }}
                            >
                              <img 
                                src={image}
                                alt={`${post.title} - Image ${index + 1}`}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                              {index === 3 && post.images.length > 4 && (
                                <div style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  backgroundColor: 'rgba(0,0,0,0.6)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontSize: '24px',
                                  fontWeight: 'bold'
                                }}>
                                  +{post.images.length - 4}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>📰</div>
                  <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px' }}>
                    News Feed
                  </h3>
                  <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
                    Kemaskini dan berita terkini dari {agency.name} akan dipaparkan di sini
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reels' && (
  <div style={{ padding: '32px 0' }}>
{reels && reels.length > 0 ? (
  <div style={{ 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    maxWidth: '1200px',
    margin: '0 auto'
  }}>
    {reels.map((reel, index) => (
      <div 
        key={reel.id}
        onClick={async () => {
  await trackReelView(reel.id)
  setSelectedReelIndex(index)
}}
        style={{
          aspectRatio: '9/16',
          backgroundColor: '#000',
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'transform 0.2s, box-shadow 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)'
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)'
        }}
      >
        {/* Video Element - Shows directly, no thumbnail needed */}
        <video
          src={reel.video_url}
          loop
          playsInline
          muted
          autoPlay
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Gradient Overlay at bottom */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 40%)',
          pointerEvents: 'none'
        }} />
        
        {/* Info Overlay - WITH VIEWS + DATE */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          color: 'white',
          pointerEvents: 'none'
        }}>
          {/* Title */}
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            marginBottom: '4px',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            lineHeight: '1.3',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {reel.title}
          </div>

          {/* 🔥 VIEWS + DATE (UPDATED) */}
          <div style={{ 
            fontSize: '12px', 
            opacity: 0.9,
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <span>👁️ {reel.views.toLocaleString()}</span>
            <span>•</span>
            <span>📅 {new Date(reel.created_at).toLocaleDateString('ms-MY', { 
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}</span>
          </div>
        </div>

        {/* Play icon indicator */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '40px',
          opacity: 0.8,
          pointerEvents: 'none',
          textShadow: '0 2px 8px rgba(0,0,0,0.5)'
        }}>
          ▶️
        </div>

        {/* Mute indicator */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          backgroundColor: 'rgba(0,0,0,0.5)',
          borderRadius: '50%',
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          pointerEvents: 'none'
        }}>
          🔇
        </div>
      </div>
    ))}
  </div>
) : (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '80px 40px',
    textAlign: 'center',
    border: '1px solid #E5E5E0',
    maxWidth: '800px',
    margin: '0 auto'
  }}>
    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎬</div>
    <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px' }}>
      Reels
    </h3>
    <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.6' }}>
      Video pendek dan reels dari {agency.name} akan dipaparkan di sini
    </p>
  </div>
)}
  </div>
)}

        {activeTab === 'pakej' && (
          <div style={{ padding: '32px 0' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
              Pakej Umrah ({packages.length})
            </h2>

            {packages && packages.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                {packages.map((pkg) => (
                  <Link
                    key={pkg.id}
                    href={`/pakej/${pkg.slug}`}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      textDecoration: 'none',
                      border: '1px solid #E5E5E0',
                      transition: 'all 0.3s'
                    }}
                  >
                    <div style={{
                      height: '200px',
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
                          fontSize: '48px',
                          opacity: 0.2
                        }}>
                          🕌
                        </div>
                      )}

                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        padding: '6px 12px',
                        backgroundColor: 'rgba(184, 147, 109, 0.95)',
                        color: 'white',
                        borderRadius: '16px',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase'
                      }}>
                        {pkg.package_type || 'Standard'}
                      </div>
                    </div>

                    <div style={{ padding: '20px' }}>
                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        color: '#2C2C2C', 
                        marginBottom: '12px',
                        lineHeight: '1.3'
                      }}>
                        {pkg.title}
                      </h3>

                      <div style={{ 
                        display: 'flex', 
                        gap: '12px',
                        marginBottom: '12px',
                        fontSize: '13px',
                        color: '#666'
                      }}>
                        {pkg.duration_nights && (
                          <span>🌙 {pkg.duration_nights} malam</span>
                        )}
                        {pkg.departure_city && (
                          <span>✈️ {pkg.departure_city}</span>
                        )}
                      </div>

                      <div style={{ 
                        paddingTop: '12px',
                        borderTop: '1px solid #E5E5E0'
                      }}>
                        <div style={{ fontSize: '12px', color: '#999', marginBottom: '2px' }}>
                          Dari
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#B8936D' }}>
                          RM {pkg.price_quad?.toLocaleString()}
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
                padding: '60px 40px',
                textAlign: 'center',
                border: '1px solid #E5E5E0'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
                <p style={{ fontSize: '16px', color: '#666' }}>
                  Tiada pakej tersedia buat masa ini
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tentang' && (
          <div style={{ padding: '32px 0' }}>
            <div style={{ maxWidth: '800px' }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '32px',
                border: '1px solid #E5E5E0'
              }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
                  Tentang {agency.name}
                </h2>

                {agency.about ? (
                  <p style={{ fontSize: '16px', color: '#666', lineHeight: '1.8', marginBottom: '24px' }}>
                    {agency.about}
                  </p>
                ) : (
                  <p style={{ fontSize: '16px', color: '#999', fontStyle: 'italic' }}>
                    Tiada maklumat lanjut tersedia
                  </p>
                )}

                <div style={{ paddingTop: '24px', borderTop: '1px solid #E5E5E0' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '16px' }}>
                    Maklumat Hubungan
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {agency.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>📞</span>
                        <span style={{ fontSize: '15px', color: '#2C2C2C' }}>{agency.phone}</span>
                      </div>
                    )}
                    {agency.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>📧</span>
                        <span style={{ fontSize: '15px', color: '#2C2C2C' }}>{agency.email}</span>
                      </div>
                    )}
                    {agency.website && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>🌐</span>
                        <a 
                          href={agency.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ fontSize: '15px', color: '#B8936D', textDecoration: 'none' }}
                        >
                          {agency.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ulasan' && (
          <div style={{ padding: '32px 0' }}>
            <div style={{ maxWidth: '800px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
                Ulasan Jemaah ({reviewCount})
              </h2>

              {reviews && reviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '24px',
                        border: '1px solid #E5E5E0'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#2C2C2C', marginBottom: '4px' }}>
                            {review.reviewer_name || 'Anonymous'}
                          </div>
                          <div style={{ fontSize: '13px', color: '#999' }}>
                            {new Date(review.created_at).toLocaleDateString('ms-MY')}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {'⭐'.repeat(review.rating)}
                        </div>
                      </div>

                      <p style={{ fontSize: '15px', color: '#2C2C2C', lineHeight: '1.6' }}>
                        {review.review_text}
                      </p>

                      {review.travel_date && (
                        <div style={{ 
                          marginTop: '12px',
                          paddingTop: '12px',
                          borderTop: '1px solid #E5E5E0',
                          fontSize: '13px',
                          color: '#666'
                        }}>
                          📅 Tarikh Travel: {review.travel_date}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  padding: '60px 40px',
                  textAlign: 'center',
                  border: '1px solid #E5E5E0'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>⭐</div>
                  <p style={{ fontSize: '16px', color: '#666' }}>
                    Tiada ulasan lagi
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 🎬 VIDEO PLAYER MODAL */}
      {selectedReelIndex !== null && (
        <VideoPlayerModal
          reel={reels[selectedReelIndex]}
          onClose={() => setSelectedReelIndex(null)}
          onNext={() => setSelectedReelIndex(selectedReelIndex + 1)}
          onPrev={() => setSelectedReelIndex(selectedReelIndex - 1)}
          hasNext={selectedReelIndex < reels.length - 1}
          hasPrev={selectedReelIndex > 0}
        />
      )}

      {/* Footer */}
      <footer style={{ backgroundColor: '#B8936D', color: 'white', padding: '60px 40px 30px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '60px', marginBottom: '40px' }}>
            
            <div>
              <div style={{ marginBottom: '20px' }}>
                <img 
                  src="/logo.png" 
                  alt="iHRAM" 
                  style={{ 
                    height: '50px',
                    filter: 'brightness(0) invert(1) drop-shadow(2px 2px 4px rgba(255,255,255,0.2))'
                  }} 
                />
              </div>
              <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'rgba(255,255,255,0.9)' }}>
                Platform discovery pakej umrah pertama di Malaysia yang memudahkan umat Islam mencari pakej yang sesuai dengan keperluan mereka.
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
                Pautan Pantas
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href="/" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Home</Link>
                <Link href="/pakej" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Pakej Umrah</Link>
                <Link href="/agensi" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Agensi</Link>
                <Link href="/panduan" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Panduan</Link>
                <Link href="/ulasan" style={{ color: 'rgba(255,255,255,0.9)', textDecoration: 'none', fontSize: '16px' }}>Ulasan</Link>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', fontFamily: 'Georgia, serif' }}>
                Hubungi Kami
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '16px', color: 'rgba(255,255,255,0.9)' }}>
                <div>
                  <strong>Email:</strong><br/>
                  info@ihram.com.my
                </div>
                <div>
                  <strong>WhatsApp:</strong><br/>
                  +60 12-345 6789
                </div>
                <div>
                  <strong>Waktu Operasi:</strong><br/>
                  Isnin - Jumaat: 9:00 AM - 6:00 PM
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '30px', textAlign: 'center', fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
            <p>© 2026 iHRAM - Think Tank Sdn Bhd. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}