import { createClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const supabase = await createClient()

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(7)}-${Date.now()}.${fileExt}`
    const filePath = `guides/${fileName}`

    const { data, error } = await supabase.storage
      .from('packages')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('packages')
      .getPublicUrl(filePath)

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error('Server error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}