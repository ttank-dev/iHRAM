import { createClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/admin'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin } = await checkAdminAccess()
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from('agencies')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/agensi')
    
    return NextResponse.redirect(new URL('/admin/agensi', request.url))
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}