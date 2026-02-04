'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitDonation(formData: FormData) {
  const supabase = await createClient()

  // Get payment settings
  const { data: settings } = await supabase
    .from('payment_settings')
    .select('*')
    .eq('is_active', true)
    .single()

  if (!settings) {
    return { error: 'Payment settings not configured' }
  }

  const amount = parseFloat(formData.get('amount') as string)
  const isAnonymous = formData.get('is_anonymous') === 'true'

  if (!amount || amount < 1) {
    return { error: 'Please enter a valid amount' }
  }

  // Prepare donation data
  const donationData = {
    donor_name: isAnonymous ? 'Anonymous' : (formData.get('donor_name') as string),
    donor_email: isAnonymous ? null : (formData.get('donor_email') as string || null),
    donor_phone: isAnonymous ? null : (formData.get('donor_phone') as string || null),
    amount: amount,
    message: formData.get('message') as string || null,
    payment_method: settings.gateway_provider,
    payment_status: 'pending',
    is_anonymous: isAnonymous
  }

  // Insert donation record
  const { data: donation, error: insertError } = await supabase
    .from('donations')
    .insert([donationData])
    .select()
    .single()

  if (insertError) {
    return { error: insertError.message }
  }

  // Handle different payment gateways
  if (settings.gateway_provider === 'manual') {
    // Manual bank transfer - just return success
    revalidatePath('/sumbangan')
    return { success: true }
  } 
  else if (settings.gateway_provider === 'toyyibpay') {
    // Toyyibpay integration
    const paymentUrl = await createToyyibpayBill(donation, settings)
    return { paymentUrl }
  } 
  else if (settings.gateway_provider === 'billplz') {
    // Billplz integration
    const paymentUrl = await createBillplzBill(donation, settings)
    return { paymentUrl }
  } 
  else if (settings.gateway_provider === 'senangpay') {
    // Senangpay integration
    const paymentUrl = await createSenangpayPayment(donation, settings)
    return { paymentUrl }
  }

  return { error: 'Unknown payment gateway' }
}

// Toyyibpay Integration
async function createToyyibpayBill(donation: any, settings: any) {
  const baseUrl = settings.is_sandbox 
    ? 'https://dev.toyyibpay.com' 
    : 'https://toyyibpay.com'

  try {
    const response = await fetch(`${baseUrl}/index.php/api/createBill`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        userSecretKey: settings.toyyibpay_secret_key,
        categoryCode: settings.toyyibpay_category_code,
        billName: 'Sumbangan iHRAM',
        billDescription: donation.message || 'Sumbangan untuk iHRAM',
        billPriceSetting: '1',
        billPayorInfo: '1',
        billAmount: (donation.amount * 100).toString(), // Toyyibpay uses cents
        billReturnUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sumbangan/callback`,
        billCallbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/sumbangan/toyyibpay-callback`,
        billExternalReferenceNo: donation.id,
        billTo: donation.donor_name,
        billEmail: donation.donor_email || '',
        billPhone: donation.donor_phone || '',
      })
    })

    const data = await response.json()

    if (data[0]?.BillCode) {
      return `${baseUrl}/${data[0].BillCode}`
    } else {
      throw new Error('Failed to create bill')
    }
  } catch (error) {
    console.error('Toyyibpay error:', error)
    return '/sumbangan?error=payment_failed'
  }
}

// Billplz Integration
async function createBillplzBill(donation: any, settings: any) {
  const baseUrl = settings.is_sandbox
    ? 'https://www.billplz-sandbox.com/api/v3'
    : 'https://www.billplz.com/api/v3'

  try {
    const auth = Buffer.from(`${settings.billplz_api_key}:`).toString('base64')

    const response = await fetch(`${baseUrl}/bills`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        collection_id: settings.billplz_collection_id,
        description: 'Sumbangan iHRAM',
        email: donation.donor_email || 'noreply@ihram.com.my',
        name: donation.donor_name,
        amount: (donation.amount * 100).toString(), // Billplz uses cents
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/sumbangan/billplz-callback`,
        redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sumbangan/callback`,
        reference_1_label: 'Donation ID',
        reference_1: donation.id,
      })
    })

    const data = await response.json()

    if (data.url) {
      return data.url
    } else {
      throw new Error('Failed to create bill')
    }
  } catch (error) {
    console.error('Billplz error:', error)
    return '/sumbangan?error=payment_failed'
  }
}

// Senangpay Integration
async function createSenangpayPayment(donation: any, settings: any) {
  const baseUrl = settings.is_sandbox
    ? 'https://sandbox.senangpay.my/payment'
    : 'https://app.senangpay.my/payment'

  // Generate hash for Senangpay
  const crypto = require('crypto')
  const hashString = `${settings.senangpay_secret_key}${donation.id}${(donation.amount * 100).toString()}${donation.donor_name}${donation.donor_email || ''}`
  const hash = crypto.createHash('md5').update(hashString).digest('hex')

  // Build payment URL with query params
  const params = new URLSearchParams({
    merchant_id: settings.senangpay_merchant_id,
    order_id: donation.id,
    amount: (donation.amount * 100).toString(),
    name: donation.donor_name,
    email: donation.donor_email || 'noreply@ihram.com.my',
    phone: donation.donor_phone || '',
    hash: hash,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sumbangan/callback`,
  })

  return `${baseUrl}?${params.toString()}`
}

// Update donation status (for callbacks)
export async function updateDonationStatus(
  donationId: string, 
  status: 'success' | 'failed' | 'pending',
  transactionId?: string,
  gatewayResponse?: any
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('donations')
    .update({
      payment_status: status,
      transaction_id: transactionId || null,
      gateway_response: gatewayResponse || null
    })
    .eq('id', donationId)

  if (error) {
    console.error('Update donation error:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/sumbangan')
  return { success: true }
}