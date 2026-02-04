'use server'

import { createClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/admin'
import { revalidatePath } from 'next/cache'

export async function updatePaymentSettings(formData: FormData) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const gateway = formData.get('gateway_provider') as string

  const settingsData: any = {
    gateway_provider: gateway,
    is_sandbox: formData.get('is_sandbox') === 'on',
    updated_at: new Date().toISOString()
  }

  // Add gateway-specific fields
  if (gateway === 'manual') {
    settingsData.bank_name = formData.get('bank_name') as string
    settingsData.account_number = formData.get('account_number') as string
    settingsData.account_name = formData.get('account_name') as string
    settingsData.bank_instruction = formData.get('bank_instruction') as string
  } else if (gateway === 'toyyibpay') {
    settingsData.toyyibpay_secret_key = formData.get('toyyibpay_secret_key') as string
    settingsData.toyyibpay_category_code = formData.get('toyyibpay_category_code') as string
  } else if (gateway === 'billplz') {
    settingsData.billplz_api_key = formData.get('billplz_api_key') as string
    settingsData.billplz_collection_id = formData.get('billplz_collection_id') as string
    settingsData.billplz_x_signature = formData.get('billplz_x_signature') as string
  } else if (gateway === 'senangpay') {
    settingsData.senangpay_merchant_id = formData.get('senangpay_merchant_id') as string
    settingsData.senangpay_secret_key = formData.get('senangpay_secret_key') as string
  }

  // Check if settings exist
  const { data: existing } = await supabase
    .from('payment_settings')
    .select('id')
    .single()

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from('payment_settings')
      .update(settingsData)
      .eq('id', existing.id)

    if (error) {
      return { error: error.message }
    }
  } else {
    // Insert new
    const { error } = await supabase
      .from('payment_settings')
      .insert([settingsData])

    if (error) {
      return { error: error.message }
    }
  }

  revalidatePath('/admin/sumbangan')
  return { success: true }
}

export async function updateDonationStatus(donationId: string, status: string) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('donations')
    .update({ payment_status: status })
    .eq('id', donationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/sumbangan')
  return { success: true }
}

export async function deleteDonation(donationId: string) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('donations')
    .delete()
    .eq('id', donationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/sumbangan')
  return { success: true }
}