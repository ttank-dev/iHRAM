'use server'

import { createClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/admin'
import { revalidatePath } from 'next/cache'

export async function savePaymentSettings(payload: {
  id?: string | null
  bank_name: string
  account_name: string
  account_number: string
  bank_instruction: string
  duitnow_qr_url: string
  tng_qr_url: string
}) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { id, ...fields } = payload

  if (id) {
    const { error } = await supabase
      .from('payment_settings')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return { error: error.message }
  } else {
    const { data: inserted, error } = await supabase
      .from('payment_settings')
      .insert(fields)
      .select('id')
      .single()
    if (error) return { error: error.message }

    revalidatePath('/admin/sumbangan')
    revalidatePath('/sumbangan')
    return { success: true, id: inserted?.id }
  }

  revalidatePath('/admin/sumbangan')
  revalidatePath('/sumbangan')
  return { success: true, id }
}