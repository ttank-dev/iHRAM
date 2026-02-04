import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ReelsActions from './ReelsActions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ReelsPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  const supabase = await createClient()
  
  // Fetch reels
  const { data: reels } = await supabase
    .from('reels')
    .select(`
      *,
      agencies:agency_id (name)
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  const safeReels = Array.isArray(reels) ? reels : []

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
            {safeReels.length}
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
            {safeReels.filter(r => r.is_active).length}
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
            {safeReels.filter(r => !r.is_active).length}
          </div>
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
            Recent Reels
          </h2>
        </div>

        {safeReels.length === 0 ? (
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
              No Reels Yet
            </div>
            <div style={{
              fontSize: '15px',
              color: '#666'
            }}>
              Agency reels will appear here
            </div>
          </div>
        ) : (
          <div style={{
            padding: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px'
          }}>
            {safeReels.map((reel: any) => (
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
                <div style={{
                  width: '100%',
                  paddingBottom: '177.78%', // 9:16 aspect ratio
                  position: 'relative',
                  backgroundColor: '#1A1A1A'
                }}>
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
                    {reel.is_active ? '✓' : '✗'}
                  </div>

                  {/* Play Icon */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
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

                  {/* Actions */}
                  <ReelsActions reel={reel} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}