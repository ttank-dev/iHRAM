'use client'

import { useEffect, useRef, useState } from 'react'

interface Reel {
  id: string
  title: string
  video_url: string
  views: number
}

interface ReelsTabProps {
  reels: Reel[]
}

export default function ReelsTab({ reels }: ReelsTabProps) {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null)
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({})

  useEffect(() => {
    // Setup Intersection Observer for autoplay on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement
          
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            // Video is 50%+ visible - play it
            video.play().catch(() => {
              // Autoplay might be blocked, that's ok
            })
            setCurrentlyPlaying(video.id)
          } else {
            // Video not visible - pause it
            video.pause()
          }
        })
      },
      {
        threshold: [0, 0.5, 1],
        rootMargin: '-10% 0px -10% 0px'
      }
    )

    // Observe all videos
    Object.values(videoRefs.current).forEach((video) => {
      if (video) observer.observe(video)
    })

    return () => observer.disconnect()
  }, [reels])

  if (!reels || reels.length === 0) {
    return (
      <div style={{
        padding: '80px 20px',
        textAlign: 'center',
        color: '#999'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎬</div>
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#666' }}>
          Tiada reels lagi
        </div>
        <div style={{ fontSize: '14px', color: '#999' }}>
          Agensi ini belum upload sebarang video reels
        </div>
      </div>
    )
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '24px',
      padding: '20px 0'
    }}>
      {reels.map((reel) => (
        <div
          key={reel.id}
          style={{
            position: 'relative',
            backgroundColor: '#000',
            borderRadius: '12px',
            overflow: 'hidden',
            aspectRatio: '9/16', // Vertical video ratio (like TikTok/Reels)
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          {/* Video Element */}
          <video
            id={reel.id}
            ref={(el) => { videoRefs.current[reel.id] = el }}
            src={reel.video_url}
            loop
            playsInline
            muted={false}
            controls={false}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onClick={(e) => {
              const video = e.currentTarget
              if (video.paused) {
                video.play()
              } else {
                video.pause()
              }
            }}
          />

          {/* Overlay Info (Bottom) */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
            padding: '40px 16px 16px',
            color: 'white'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '4px',
              textShadow: '0 1px 3px rgba(0,0,0,0.5)'
            }}>
              {reel.title}
            </div>
            <div style={{
              fontSize: '13px',
              opacity: 0.9,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              👁️ {reel.views} tontonan
            </div>
          </div>

          {/* Play/Pause Indicator (Center) */}
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              opacity: 0,
              transition: 'opacity 0.2s'
            }}
            id={`indicator-${reel.id}`}
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px'
            }}>
              ▶️
            </div>
          </div>

          {/* Custom Controls Overlay (tap to play/pause) */}
          <div style={{
            position: 'absolute',
            inset: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={(e) => {
            const video = videoRefs.current[reel.id]
            if (!video) return

            if (video.paused) {
              video.play()
            } else {
              video.pause()
            }
          }} />

        </div>
      ))}
    </div>
  )
}