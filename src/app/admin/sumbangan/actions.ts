'use server'

import { createClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/admin'
import { revalidatePath } from 'next/cache'

// Not used by PaymentSettingsForm (client handles upsert directly)
// Kept for potential server-side usage
export async function updatePaymentSettings(data: {
  id?: string
  bank_name: string
  account_name: string
  account_number: string
  bank_instruction?: string
  duitnow_qr_url?: string
  tng_qr_url?: string
}) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) return { error: 'Unauthorized' }

  const supabase = await createClient()

  if (data.id) {
    const { error } = await supabase
      .from('payment_settings')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', data.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('payment_settings')
      .insert(data)
    if (error) return { error: error.message }
  }

  revalidatePath('/admin/sumbangan')
  revalidatePath('/sumbangan')
  return { success: true }
}