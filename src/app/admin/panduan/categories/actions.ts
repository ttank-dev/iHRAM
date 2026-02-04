'use server'

import { createClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/admin'
import { revalidatePath } from 'next/cache'

export async function createCategory(formData: FormData) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const name = formData.get('name') as string
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const categoryData = {
    name,
    slug,
    description: (formData.get('description') as string) || null,
    is_active: true
  }

  const { error } = await supabase
    .from('categories')
    .insert([categoryData])

  if (error) {
    return { error: error.message }
  }

  // Revalidate all related paths
  revalidatePath('/admin/panduan/categories')
  revalidatePath('/admin/panduan/new')
  revalidatePath('/admin/panduan/edit/[id]', 'page')
  
  return { success: true }
}

export async function updateCategory(id: string, formData: FormData) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const name = formData.get('name') as string
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const categoryData = {
    name,
    slug,
    description: (formData.get('description') as string) || null
  }

  const { error } = await supabase
    .from('categories')
    .update(categoryData)
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/panduan/categories')
  revalidatePath('/admin/panduan/new')
  revalidatePath('/admin/panduan/edit/[id]', 'page')
  
  return { success: true }
}

export async function deleteCategory(id: string) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/panduan/categories')
  revalidatePath('/admin/panduan/new')
  revalidatePath('/admin/panduan/edit/[id]', 'page')
  
  return { success: true }
}

export async function toggleActive(id: string, currentStatus: boolean) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) {
    return { error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('categories')
    .update({ is_active: !currentStatus })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/panduan/categories')
  revalidatePath('/admin/panduan/new')
  revalidatePath('/admin/panduan/edit/[id]', 'page')
  
  return { success: true }
}