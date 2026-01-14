import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Review {
  id: string
  created_at: string
  reviewer_name: string | null
  rating: number
  review_text: string
  travel_date: string | null
  is_verified: boolean
  agencies: {
    name: string
    slug: string
  } | null
  packages: {
    title: string
    slug: string
  } | null
}

async function getReviews(): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      agencies (name, slug),
      packages (title, slug)
    `)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching reviews:', error)
    return []
  }

  return data || []
}

export default async function UlasanPage() {
  const reviews = await getReviews()

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-4">
              Ulasan <span className="text-yellow-500">Jemaah</span>
            </h1>
            <p className="text-gray-400">
              {reviews.length} ulasan daripada jemaah yang berpengalaman
            </p>
          </div>
          <Link
            href="/ulasan/hantar"
            className="px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Hantar Ulasan
          </Link>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">Tiada ulasan buat masa ini</p>
            <Link
              href="/ulasan/hantar"
              className="text-yellow-500 hover:underline"
            >
              Jadilah yang pertama untuk berkongsi pengalaman!
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-gray-950 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {review.reviewer_name || 'Anonymous'}
                      </h3>
                      {review.is_verified && (
                        <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-medium rounded">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      {review.packages && (
                        <Link 
                          href={`/pakej/${review.packages.slug}`}
                          className="hover:text-yellow-500 transition-colors"
                        >
                          {review.packages.title}
                        </Link>
                      )}
                      {review.agencies && (
                        <>
                          <span>•</span>
                          <Link 
                            href={`/agensi/${review.agencies.slug}`}
                            className="hover:text-yellow-500 transition-colors"
                          >
                            {review.agencies.name}
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={i < review.rating ? 'text-yellow-500' : 'text-gray-700'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <p className="text-gray-300 mb-4">{review.review_text}</p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  {review.travel_date && (
                    <span>Tarikh Travel: {review.travel_date}</span>
                  )}
                  <span>
                    {new Date(review.created_at).toLocaleDateString('ms-MY', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}