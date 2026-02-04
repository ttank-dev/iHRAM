import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewsFeedActions from './NewsFeedActions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function NewsFeedPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  const supabase = await createClient()
  
  // Fetch news feed posts
  const { data: posts } = await supabase
    .from('news_feed')
    .select(`
      *,
      agencies:agency_id (name)
    `)
    .order('created_at', { ascending: false })
    .limit(20)

  const safePosts = Array.isArray(posts) ? posts : []

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
            {safePosts.length}
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
            {safePosts.filter(p => p.is_active).length}
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
            {safePosts.filter(p => !p.is_active).length}
          </div>
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
            Recent Posts
          </h2>
        </div>

        {safePosts.length === 0 ? (
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
              No News Feed Posts Yet
            </div>
            <div style={{
              fontSize: '15px',
              color: '#666'
            }}>
              Agency posts will appear here
            </div>
          </div>
        ) : (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {safePosts.map((post: any) => (
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
                {/* Post Image */}
                {post.image_url && (
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '8px',
                    backgroundImage: `url(${post.image_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    flexShrink: 0
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
                      {post.is_active ? '✓ Active' : '✗ Hidden'}
                    </span>
                  </div>

                  <p style={{
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.6',
                    marginBottom: '12px'
                  }}>
                    {post.content}
                  </p>

                  <NewsFeedActions post={post} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}