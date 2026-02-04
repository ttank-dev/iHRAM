'use server'

import { createClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createGuide(formData: FormData) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const title = formData.get('title') as string
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const guideData = {
    title,
    slug,
    excerpt: (formData.get('excerpt') as string) || null,
    content: formData.get('content') as string,
    category: (formData.get('category') as string) || null,
    is_published: formData.get('is_published') === 'true'
  }

  const { error } = await supabase
    .from('guides')
    .insert([guideData])

  if (error) {
    console.error('Insert error:', error)
    throw new Error(error.message)
  }

  revalidatePath('/admin/panduan')
  redirect('/admin/panduan')
}

export async function updateGuide(id: string, formData: FormData) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const title = formData.get('title') as string
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const guideData = {
    title,
    slug,
    excerpt: (formData.get('excerpt') as string) || null,
    content: formData.get('content') as string,
    category: (formData.get('category') as string) || null,
    is_published: formData.get('is_published') === 'true'
  }

  const { error } = await supabase
    .from('guides')
    .update(guideData)
    .eq('id', id)

  if (error) {
    console.error('Update error:', error)
    throw new Error(error.message)
  }

  revalidatePath('/admin/panduan')
  redirect('/admin/panduan')
}

export async function deleteGuide(id: string) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('guides')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/panduan')
  return { success: true }
}

export async function togglePublish(id: string, currentStatus: boolean) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('guides')
    .update({ is_published: !currentStatus })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/panduan')
  return { success: true }
}