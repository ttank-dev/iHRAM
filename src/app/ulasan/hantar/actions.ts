'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitReview(formData: FormData) {
  const supabase = await createClient()

  console.log('=== REVIEW SUBMISSION DEBUG ===')
  
  // Handle image uploads
  const uploadedPhotoUrls: string[] = []
  const imageFiles = formData.getAll('images') as File[]
  
  console.log('Image files found:', imageFiles.length)
  console.log('Image files details:', imageFiles.map(f => ({ name: f.name, size: f.size, type: f.type })))

  for (const file of imageFiles) {
    if (file && file.size > 0) {
      console.log('Processing file:', file.name, 'Size:', file.size)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(7)}-${Date.now()}.${fileExt}`
      const filePath = `reviews/${fileName}`

      console.log('Uploading to path:', filePath)

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('packages')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
      } else {
        console.log('Upload success:', uploadData)
        
        const { data: { publicUrl } } = supabase.storage
          .from('packages')
          .getPublicUrl(filePath)
        
        console.log('Public URL:', publicUrl)
        uploadedPhotoUrls.push(publicUrl)
      }
    } else {
      console.log('Skipping empty file')
    }
  }

  console.log('Total uploaded URLs:', uploadedPhotoUrls.length)
  console.log('URLs:', uploadedPhotoUrls)

  const reviewData = {
    reviewer_name: formData.get('name') as string,
    reviewer_email: formData.get('email') as string,
    agency_id: formData.get('agency_id') as string,
    package_id: formData.get('package_id') as string || null,
    rating: parseInt(formData.get('rating') as string),
    review_text: formData.get('review_text') as string,
    travel_date: formData.get('travel_date') as string || null,
    photos: uploadedPhotoUrls.length > 0 ? uploadedPhotoUrls : null,
    is_approved: false,
    is_verified: false
  }

  console.log('Review data to insert:', reviewData)

  const { error, data } = await supabase
    .from('reviews')
    .insert([reviewData])
    .select()

  if (error) {
    console.error('Error submitting review:', error)
    return { error: error.message }
  }

  console.log('Review inserted successfully:', data)

  revalidatePath('/ulasan')
  redirect('/ulasan?submitted=true')
}