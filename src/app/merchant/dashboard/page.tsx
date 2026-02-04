import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MerchantDashboardPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    console.log('No user, redirecting to login')
    redirect('/merchant/login')
  }

  console.log('User found:', user.id)

  // Get merchant agency
  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  console.log('Agency query:', { agency, agencyError })

  if (agencyError) {
    console.error('Agency error:', agencyError)
  }

  if (!agency) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>❌ No Agency Found</h1>
        <p style={{ marginBottom: '20px' }}>
          Your account is not linked to any agency. Please contact admin.
        </p>
        <Link 
          href="/merchant/login"
          style={{
            padding: '12px 24px',
            backgroundColor: '#B8936D',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px'
          }}
        >
          Back to Login
        </Link>
      </div>
    )
  }

  // Get stats
  const { data: packages } = await supabase
    .from('packages')
    .select('id, status')
    .eq('agency_id', agency.id)

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id, rating')
    .eq('agency_id', agency.id)
    .eq('is_approved', true)

  const totalPackages = packages?.length || 0
  const publishedPackages = packages?.filter(p => p.status === 'published').length || 0
  const totalReviews = reviews?.length || 0
  const avgRating = reviews && reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  return (
    <div style={{ padding: '40px', backgroundColor: '#F5F5F0', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
          Welcome back, {agency.name}! 👋
        </h1>
        <p style={{ fontSize: '16px', color: '#666' }}>
          Here's what's happening with your agency today
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>Total Packages</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C' }}>{totalPackages}</div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>Published</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10B981' }}>{publishedPackages}</div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>Total Reviews</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C' }}>{totalReviews}</div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>Average Rating</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#B8936D' }}>{avgRating} ⭐</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '16px' }}>
          ⚡ Quick Actions
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px'
        }}>
          <Link
            href="/merchant/dashboard/pakej"
            style={{
              padding: '24px',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #E5E5E0',
              textDecoration: 'none',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#2C2C2C' }}>Manage Packages</div>
          </Link>

          <Link
            href="/merchant/dashboard/newsfeed"
            style={{
              padding: '24px',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #E5E5E0',
              textDecoration: 'none',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📰</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#2C2C2C' }}>News Feed</div>
          </Link>

          <Link
            href="/merchant/dashboard/reels"
            style={{
              padding: '24px',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #E5E5E0',
              textDecoration: 'none',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎬</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#2C2C2C' }}>Reels</div>
          </Link>

          <Link
            href="/merchant/dashboard/settings"
            style={{
              padding: '24px',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #E5E5E0',
              textDecoration: 'none',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚙️</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#2C2C2C' }}>Settings</div>
          </Link>
        </div>
      </div>

      {/* Agency Info */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '16px',
        border: '1px solid #E5E5E0'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '16px' }}>
          🏢 Agency Information
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>Agency Name</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#2C2C2C' }}>{agency.name}</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>Email</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#2C2C2C' }}>{agency.email || user.email}</div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>Status</div>
            <span style={{
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '700',
              backgroundColor: agency.is_verified ? '#ECFDF5' : '#FEF3C7',
              color: agency.is_verified ? '#10B981' : '#F59E0B'
            }}>
              {agency.is_verified ? '✓ Verified' : '⏳ Pending Verification'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}