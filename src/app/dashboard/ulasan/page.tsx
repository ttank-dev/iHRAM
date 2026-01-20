import { createClient } from '@/lib/supabase/server'
import { Star } from 'lucide-react'

export default async function UlasanPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="text-white p-8">Please login</div>
  }

  // Get agency
  const { data: agency } = await supabase
    .from('agencies')
    .select('id, name')
    .eq('user_id', user.id)
    .single()

  if (!agency) {
    return <div className="text-white p-8">Agency not found</div>
  }

  // Get all reviews for this agency
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      packages (
        id,
        title
      )
    `)
    .eq('agency_id', agency.id)
    .order('created_at', { ascending: false })

  const approvedReviews = reviews?.filter(r => r.is_approved) || []
  const pendingReviews = reviews?.filter(r => !r.is_approved) || []

  function renderStars(rating: number) {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-gray-600'}
          />
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Ulasan</h1>
        <p className="text-gray-400">Lihat semua ulasan untuk pakej anda</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-1">Jumlah Ulasan</p>
          <p className="text-3xl font-bold text-white">{reviews?.length || 0}</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-1">Diluluskan</p>
          <p className="text-3xl font-bold text-green-400">{approvedReviews.length}</p>
        </div>
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
          <p className="text-gray-400 text-sm mb-1">Menunggu</p>
          <p className="text-3xl font-bold text-yellow-400">{pendingReviews.length}</p>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {/* Approved Reviews */}
        {approvedReviews.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Ulasan Diluluskan</h2>
            <div className="space-y-4">
              {approvedReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-white">
                        {review.reviewer_name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {review.packages?.title || 'Unknown Package'}
                      </p>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-300 mb-3">{review.review_text}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {review.travel_date && (
                      <span>Travel: {review.travel_date}</span>
                    )}
                    <span>
                      {new Date(review.created_at).toLocaleDateString('ms-MY')}
                    </span>
                    {review.is_verified && (
                      <span className="text-green-400">✓ Verified</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Reviews */}
        {pendingReviews.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Menunggu Kelulusan</h2>
            <div className="space-y-4">
              {pendingReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-[#1A1A1A] border border-yellow-500/30 rounded-lg p-6"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-white">
                        {review.reviewer_name || 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {review.packages?.title || 'Unknown Package'}
                      </p>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-300 mb-3">{review.review_text}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {review.travel_date && (
                      <span>Travel: {review.travel_date}</span>
                    )}
                    <span>
                      {new Date(review.created_at).toLocaleDateString('ms-MY')}
                    </span>
                    <span className="text-yellow-400">⏳ Pending Admin Approval</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {reviews?.length === 0 && (
          <div className="text-center py-20">
            <Star size={48} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-500 text-lg mb-2">Belum ada ulasan</p>
            <p className="text-gray-600 text-sm">
              Ulasan akan muncul di sini selepas jemaah submit feedback
            </p>
          </div>
        )}
      </div>
    </div>
  )
}