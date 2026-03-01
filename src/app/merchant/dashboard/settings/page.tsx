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

  // Staff only sees password change — no need to fetch staff list
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
    <>
      <style>{`
        .st,.st *{box-sizing:border-box}
        .st{max-width:900px;width:100%;overflow:hidden}

        /* Header */
        .st-header{margin-bottom:24px}
        .st-title{font-size:28px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .st-sub{font-size:15px;color:#666;margin:0 0 10px}
        .st-role-badge{
          display:inline-flex;align-items:center;gap:6px;
          padding:4px 12px;border-radius:20px;font-size:13px;font-weight:600;
        }

        /* Section cards */
        .st-card{background:white;border-radius:14px;padding:28px;border:1px solid #E5E5E0;margin-bottom:20px}
        .st-card-header{display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:20px;border-bottom:1px solid #f0f0ec}
        .st-card-icon{width:48px;height:48px;border-radius:12px;background:#F5F5F0;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
        .st-card-title{font-size:18px;font-weight:700;color:#2C2C2C;margin:0 0 2px}
        .st-card-sub{font-size:14px;color:#888;margin:0}

        /* Stats grid */
        .st-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
        .st-stat{padding:18px;background:#FFF8F0;border-radius:12px;border:1px solid #F5E5D3}
        .st-stat-l{font-size:12px;color:#999;margin-bottom:6px}
        .st-stat-v{font-size:26px;font-weight:700;color:#B8936D}

        /* ── TABLET ── */
        @media(max-width:1023px){
          .st-title{font-size:24px}
          .st-card{padding:22px}
        }

        /* ── MOBILE ── */
        @media(max-width:639px){
          .st-title{font-size:20px}
          .st-card{padding:16px;border-radius:12px;margin-bottom:14px}
          .st-card-title{font-size:16px}
          .st-stats{grid-template-columns:repeat(3,1fr);gap:8px}
          .st-stat{padding:12px 8px;border-radius:8px}
          .st-stat-l{font-size:11px}
          .st-stat-v{font-size:22px}
        }

        /* ── SMALL MOBILE ── */
        @media(max-width:380px){
          .st-card{padding:14px}
          .st-stats{grid-template-columns:1fr 1fr}
        }
      `}</style>

      <div className="st">

        {/* Header */}
        <div className="st-header">
          <h1 className="st-title">Settings</h1>
          <p className="st-sub">
            {isOwner ? 'Manage your account and staff members' : 'Manage your account'}
          </p>
          <div className="st-role-badge" style={{
            backgroundColor: isOwner ? '#FEE2E2' : '#FFF8F0',
            color: isOwner ? '#EF4444' : '#B8936D'
          }}>
            {isOwner ? '👑 Owner' : '👤 Staff'} · {agencyName}
          </div>
        </div>

        {/* Account Security — visible to all */}
        <div className="st-card">
          <div className="st-card-header">
            <div className="st-card-icon">🔐</div>
            <div>
              <div className="st-card-title">Account Security</div>
              <div className="st-card-sub">Change your password</div>
            </div>
          </div>
          <MerchantPasswordChange />
        </div>

        {/* Staff Management — owner only */}
        {isOwner && (
          <div className="st-card">
            <div className="st-card-header">
              <div className="st-card-icon">👥</div>
              <div>
                <div className="st-card-title">Staff Management</div>
                <div className="st-card-sub">Add and manage staff members</div>
              </div>
            </div>

            {/* Stats */}
            <div className="st-stats">
              {[
                { label: 'Total Staff',   value: safeStaffMembers.length },
                { label: 'Owners',        value: safeStaffMembers.filter(s => s.role === 'owner').length },
                { label: 'Active Staff',  value: safeStaffMembers.filter(s => s.is_active).length },
              ].map(stat => (
                <div key={stat.label} className="st-stat">
                  <div className="st-stat-l">{stat.label}</div>
                  <div className="st-stat-v">{stat.value}</div>
                </div>
              ))}
            </div>

            <AddStaffForm agencyId={merchantAgencyId} />

            <div style={{ marginTop: '28px' }}>
              <MerchantStaffList staff={safeStaffMembers} />
            </div>
          </div>
        )}
      </div>
    </>
  )
}