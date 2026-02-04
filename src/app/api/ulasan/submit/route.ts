import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    const reviewer_name = formData.get('reviewer_name') as string
    const reviewer_email = formData.get('reviewer_email') as string
    const agency_id = formData.get('agency_id') as string
    const rating = parseInt(formData.get('rating') as string)
    const review_text = formData.get('review_text') as string
    const travel_date = formData.get('travel_date') as string

    // Validation
    if (!reviewer_name || !reviewer_email || !agency_id || !rating || !review_text || !travel_date) {
      return NextResponse.json(
        { error: 'Semua field wajib diisi' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating mesti antara 1-5' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Insert review
    const { error } = await supabase
      .from('reviews')
      .insert({
        reviewer_name,
        reviewer_email,
        agency_id,
        rating,
        review_text,
        travel_date,
        is_approved: false, // Need admin approval
        is_verified: false
      })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Gagal menghantar ulasan. Sila cuba lagi.' },
        { status: 500 }
      )
    }

    // Redirect to success page
    return NextResponse.redirect(new URL('/ulasan/terima-kasih', request.url))
    
  } catch (error) {
    console.error('Submit error:', error)
    return NextResponse.json(
      { error: 'Ralat sistem. Sila cuba lagi.' },
      { status: 500 }
    )
  }
}