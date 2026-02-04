import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MerchantPasswordChange from './MerchantPasswordChange'
import MerchantStaffList from './MerchantStaffList'
import AddStaffForm from './AddStaffForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function MerchantSettingsPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/merchant-login')

  // Get merchant agency
  const { data: agency } = await supabase
    .from('agencies')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!agency) redirect('/merchant-login')

  // Get staff members
  const { data: staff } = await supabase
    .from('merchant_staff')
    .select('*')
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false })

  const safeStaff = Array.isArray(staff) ? staff : []

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
          Settings
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666'
        }}>
          Manage your account and staff members
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* ACCOUNT SECURITY */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            paddingBottom: '24px',
            borderBottom: '1px solid #E5E5E0'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#F5F5F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🔐
            </div>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '4px'
              }}>
                Account Security
              </h2>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Change your password
              </p>
            </div>
          </div>

          <MerchantPasswordChange />
        </div>

        {/* STAFF MANAGEMENT */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            paddingBottom: '24px',
            borderBottom: '1px solid #E5E5E0'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#F5F5F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              👥
            </div>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '4px'
              }}>
                Staff Management
              </h2>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Add and manage staff members who can access your dashboard
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              padding: '20px',
              backgroundColor: '#FFF8F0',
              borderRadius: '12px',
              border: '1px solid #F5E5D3'
            }}>
              <div style={{ fontSize: '13px', color: '#999', marginBottom: '8px' }}>
                Total Staff
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#B8936D' }}>
                {safeStaff.length}
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#FFF8F0',
              borderRadius: '12px',
              border: '1px solid #F5E5D3'
            }}>
              <div style={{ fontSize: '13px', color: '#999', marginBottom: '8px' }}>
                Active Staff
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10B981' }}>
                {safeStaff.filter(s => s.is_active).length}
              </div>
            </div>
          </div>

          {/* Add Staff Form */}
          <AddStaffForm />

          {/* Staff List */}
          <div style={{ marginTop: '32px' }}>
            <MerchantStaffList staff={safeStaff} />
          </div>
        </div>

        {/* AGENCY INFO */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '24px',
            paddingBottom: '24px',
            borderBottom: '1px solid #E5E5E0'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#F5F5F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🏢
            </div>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '4px'
              }}>
                Agency Information
              </h2>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Your agency details
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#F5F5F0',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>
                Agency Name
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#2C2C2C' }}>
                {agency.name}
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#F5F5F0',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>
                Email
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#2C2C2C' }}>
                {agency.email || user.email}
              </div>
            </div>

            <div style={{
              padding: '16px',
              backgroundColor: '#F5F5F0',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '13px', color: '#999', marginBottom: '4px' }}>
                Status
              </div>
              <span style={{
                padding: '6px 12px',
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
    </div>
  )
}