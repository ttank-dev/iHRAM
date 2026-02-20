import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const getServiceRoleClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export async function GET() {
  try {
    // Verify user session dulu
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Guna service role untuk bypass RLS
    const adminClient = getServiceRoleClient()

    // Check agency_staff table dulu
    const { data: staffMember } = await adminClient
      .from('agency_staff')
      .select('agency_id, role, is_active')
      .eq('id', user.id)
      .single()

    if (staffMember?.is_active && staffMember.agency_id) {
      // Ambil nama agensi
      const { data: agency } = await adminClient
        .from('agencies')
        .select('name')
        .eq('id', staffMember.agency_id)
        .single()

      return NextResponse.json({
        agencyId: staffMember.agency_id,
        agencyName: agency?.name || 'Your Agency',
        role: staffMember.role
      })
    }

    // Check agencies table (old owners yang tak ada dalam agency_staff)
    const { data: agency } = await adminClient
      .from('agencies')
      .select('id, name, is_active')
      .eq('user_id', user.id)
      .single()

    if (agency?.is_active) {
      return NextResponse.json({
        agencyId: agency.id,
        agencyName: agency.name,
        role: 'owner'
      })
    }

    // Tiada agency
    return NextResponse.json({ error: 'No agency found' }, { status: 404 })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}