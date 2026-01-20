'use server'

import { createClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/admin'
import { revalidatePath } from 'next/cache'

export async function approveReview(reviewId: string) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('reviews')
    .update({ is_approved: true })
    .eq('id', reviewId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/ulasan')
  return { success: true }
}

export async function rejectReview(reviewId: string) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  // Option 1: Delete the review
  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)

  // Option 2: Just mark as not approved (if you want to keep record)
  // const { error } = await supabase
  //   .from('reviews')
  //   .update({ is_approved: false })
  //   .eq('id', reviewId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/ulasan')
  return { success: true }
}