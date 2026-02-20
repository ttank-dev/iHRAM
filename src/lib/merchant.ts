import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const getServiceRoleClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function checkMerchantAccess() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { isMerchant: false, user: null, agencyId: null, role: null }

  const adminClient = getServiceRoleClient()

  const { data: staffMember } = await adminClient
    .from('agency_staff')
    .select('agency_id, role, is_active')
    .eq('id', user.id)
    .single()

  if (staffMember?.is_active && staffMember.agency_id) {
    return {
      isMerchant: true,
      user,
      agencyId: staffMember.agency_id as string,
      role: staffMember.role as 'owner' | 'staff'
    }
  }

  const { data: agency } = await adminClient
    .from('agencies')
    .select('id, is_active')
    .eq('user_id', user.id)
    .single()

  if (agency?.is_active) {
    return {
      isMerchant: true,
      user,
      agencyId: agency.id as string,
      role: 'owner' as 'owner' | 'staff'
    }
  }

  return { isMerchant: false, user: null, agencyId: null, role: null }
}