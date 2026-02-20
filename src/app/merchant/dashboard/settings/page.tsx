import { checkMerchantAccess } from '@/lib/merchant'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import AddStaffForm from './AddStaffForm'
import MerchantStaffList from './MerchantStaffList'
import MerchantPasswordChange from './MerchantPasswordChange'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const getServiceRoleClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function MerchantSettingsPage() {
  const { isMerchant, user, agencyId: merchantAgencyId, role } = await checkMerchantAccess()
  if (!isMerchant || !user || !merchantAgencyId) redirect('/merchant/login')

  const isOwner = role === 'owner'
  const adminClient = getServiceRoleClient()

  const { data: agencyData } = await adminClient
    .from('agencies')
    .select('name')
    .eq('id', merchantAgencyId)
    .single()

  const agencyName = agencyData?.name || 'Your Agency'

  // Staff hanya nampak password change — tak perlu fetch staff list
  let safeStaffMembers: any[] = []
  if (isOwner) {
    const { data: staffMembers } = await adminClient
      .from('agency_staff')
      .select('*')
      .eq('agency_id', merchantAgencyId)
      .order('created_at', { ascending: false })
    safeStaffMembers = Array.isArray(staffMembers) ? staffMembers : []
  }

  return (
    <div>
      {/* HEADER */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
          Settings
        </h1>
        <p style={{ fontSize: '16px', color: '#666' }}>
          {isOwner ? 'Manage your account and staff members' : 'Manage your account'}
        </p>
        <div style={{
          marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
          backgroundColor: isOwner ? '#FEE2E2' : '#FFF8F0',
          color: isOwner ? '#EF4444' : '#B8936D'
        }}>
          {isOwner ? '👑 Owner' : '👤 Staff'} · {agencyName}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* ACCOUNT SECURITY - Semua boleh, letak atas sekali untuk staff */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #E5E5E0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #E5E5E0' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F5F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
              🔐
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '4px' }}>Account Security</h2>
              <p style={{ fontSize: '14px', color: '#666' }}>Change your password</p>
            </div>
          </div>
          <MerchantPasswordChange />
        </div>

        {/* STAFF MANAGEMENT - Owner sahaja */}
        {isOwner && (
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #E5E5E0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid #E5E5E0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F5F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                👥
              </div>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '4px' }}>Staff Management</h2>
                <p style={{ fontSize: '14px', color: '#666' }}>Add and manage staff members</p>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Total Staff', value: safeStaffMembers.length },
                { label: 'Owners', value: safeStaffMembers.filter(s => s.role === 'owner').length },
                { label: 'Active Staff', value: safeStaffMembers.filter(s => s.is_active).length },
              ].map((stat) => (
                <div key={stat.label} style={{ padding: '20px', backgroundColor: '#FFF8F0', borderRadius: '12px', border: '1px solid #F5E5D3' }}>
                  <div style={{ fontSize: '13px', color: '#999', marginBottom: '8px' }}>{stat.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#B8936D' }}>{stat.value}</div>
                </div>
              ))}
            </div>

            <AddStaffForm agencyId={merchantAgencyId} />

            <div style={{ marginTop: '32px' }}>
              <MerchantStaffList staff={safeStaffMembers} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}