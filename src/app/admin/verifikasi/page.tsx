import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminVerificationPage() {
  // 1. AUTH CHECK FIRST (outside try-catch)
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  // 2. FETCH DATA (inside try-catch)
  const supabase = await createClient()

  const { data: requests } = await supabase
    .from('verification_requests')
    .select(`
      id,
      created_at,
      company_name,
      motac_license_number,
      status
    `)
    .order('created_at', { ascending: false })

  const pendingCount = requests?.filter(r => r.status === 'pending').length || 0
  const approvedCount = requests?.filter(r => r.status === 'approved').length || 0
  const rejectedCount = requests?.filter(r => r.status === 'rejected').length || 0

  // 3. RENDER (no try-catch needed here)
  return (
    <div style={{ padding: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
          Verification Requests
        </h1>
        <p style={{ fontSize: '16px', color: '#666' }}>
          Review and approve MOTAC verification requests
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>
            ⏳ Pending Review
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#FFC107' }}>
            {pendingCount}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>
            ✅ Approved
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4CAF50' }}>
            {approvedCount}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>
            ❌ Rejected
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#F44336' }}>
            {rejectedCount}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #E5E5E0'
      }}>
        {requests && requests.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {requests.map((request: any) => (
              <Link
                key={request.id}
                href={`/admin/verifikasi/${request.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '20px',
                  backgroundColor: '#F5F5F0',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  border: '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  backgroundColor: '#B8936D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {request.company_name.charAt(0)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '4px' }}>
                    {request.company_name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                    License: {request.motac_license_number}
                  </div>
                  <div style={{ fontSize: '13px', color: '#999' }}>
  Submitted: {new Date(request.created_at).toLocaleDateString('ms-MY', {
    timeZone: 'Asia/Kuala_Lumpur'
  })}
</div>
                </div>

                <div style={{
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  backgroundColor: 
                    request.status === 'pending' ? '#FFF9E6' :
                    request.status === 'approved' ? '#E8F5E9' :
                    '#FFEBEE',
                  color: 
                    request.status === 'pending' ? '#F57C00' :
                    request.status === 'approved' ? '#2E7D32' :
                    '#C62828'
                }}>
                  {request.status === 'pending' ? '⏳ PENDING' :
                   request.status === 'approved' ? '✅ APPROVED' :
                   '❌ REJECTED'}
                </div>

                <div style={{ fontSize: '24px', color: '#B8936D' }}>
                  →
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
            <p style={{ fontSize: '16px', color: '#666' }}>
              No verification requests yet
            </p>
          </div>
        )}
      </div>
    </div>
  )
}