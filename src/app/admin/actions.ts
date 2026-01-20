'use server'

import { createClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/admin'
import { revalidatePath } from 'next/cache'

// Agency Actions
export async function verifyAgency(agencyId: string) {
  try {
    const { isAdmin } = await checkAdminAccess()
    if (!isAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()

    const { error } = await supabase
      .from('agencies')
      .update({ is_verified: true })
      .eq('id', agencyId)

    if (error) throw error

    revalidatePath('/admin/agensi')
    return { success: true }
  } catch (error: any) {
    console.error('verifyAgency error:', error)
    throw new Error(error.message || 'Failed to verify agency')
  }
}
export async function unverifyAgency(agencyId: string) {
  console.log('=== UNVERIFY AGENCY START ===')
  console.log('Agency ID:', agencyId)
  
  try {
    const { isAdmin } = await checkAdminAccess()
    console.log('Is Admin:', isAdmin)
    
    if (!isAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()

    // First, check current state
    const { data: before } = await supabase
      .from('agencies')
      .select('is_verified, name')
      .eq('id', agencyId)
      .single()
    
    console.log('Before unverify:', before)

    const { data, error } = await supabase
      .from('agencies')
      .update({ is_verified: false })
      .eq('id', agencyId)
      .select()

    console.log('Unverify result:', { data, error })

    if (error) throw error

    revalidatePath('/admin/agensi')
    console.log('=== UNVERIFY AGENCY SUCCESS ===')
    return { success: true }
  } catch (error: any) {
    console.error('=== UNVERIFY AGENCY ERROR ===')
    console.error('Error:', error)
    throw new Error(error.message || 'Failed to unverify agency')
  }
}
export async function suspendAgency(agencyId: string) {
  try {
    const { isAdmin } = await checkAdminAccess()
    if (!isAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()

    const { error } = await supabase
      .from('agencies')
      .update({ is_active: false })
      .eq('id', agencyId)

    if (error) throw error

    revalidatePath('/admin/agensi')
    return { success: true }
  } catch (error: any) {
    console.error('suspendAgency error:', error)
    throw new Error(error.message || 'Failed to suspend agency')
  }
}

export async function activateAgency(agencyId: string) {
  try {
    const { isAdmin } = await checkAdminAccess()
    if (!isAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()

    const { error } = await supabase
      .from('agencies')
      .update({ is_active: true })
      .eq('id', agencyId)

    if (error) throw error

    revalidatePath('/admin/agensi')
    return { success: true }
  } catch (error: any) {
    console.error('activateAgency error:', error)
    throw new Error(error.message || 'Failed to activate agency')
  }
}

// Review Actions
export async function approveReview(reviewId: string) {
  try {
    const { isAdmin } = await checkAdminAccess()
    if (!isAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()

    const { error } = await supabase
      .from('reviews')
      .update({ is_approved: true })
      .eq('id', reviewId)

    if (error) throw error

    revalidatePath('/admin/ulasan')
    return { success: true }
  } catch (error: any) {
    console.error('approveReview error:', error)
    throw new Error(error.message || 'Failed to approve review')
  }
}

export async function rejectReview(reviewId: string) {
  try {
    const { isAdmin } = await checkAdminAccess()
    if (!isAdmin) throw new Error('Unauthorized')

    const supabase = await createClient()

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId)

    if (error) throw error

    revalidatePath('/admin/ulasan')
    return { success: true }
  } catch (error: any) {
    console.error('rejectReview error:', error)
    throw new Error(error.message || 'Failed to reject review')
  }
}