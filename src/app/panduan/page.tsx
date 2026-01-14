import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Guide {
  id: string
  created_at: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  category: string | null
}

async function getGuides(): Promise<Guide[]> {
  const { data, error } = await supabase
    .from('guides')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching guides:', error)
    return []
  }

  return data || []
}

export default async function PanduanPage() {
  const guides = await getGuides()

  const categories = [
    { name: 'Semua', slug: 'semua' },
    { name: 'Tips First-Timer', slug: 'tips' },
    { name: 'Senarai Packing', slug: 'packing' },
    { name: 'Persediaan Rohani', slug: 'rohani' },
    { name: 'Panduan Visa', slug: 'visa' },
  ]

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Panduan <span className="text-yellow-500">Umrah</span>
          </h1>
          <p className="text-gray-400">
            Panduan lengkap untuk perjalanan umrah anda
          </p>
        </div>

        {/* Categories */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              className="px-4 py-2 bg-gray-950 border border-gray-800 rounded-lg text-sm font-medium hover:border-yellow-500 hover:text-yellow-500 transition-colors whitespace-nowrap"
            >
              {cat.name}
            </button>
          ))}
        </div>

        {guides.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">Panduan akan ditambah tidak lama lagi</p>
            <p className="text-gray-600 text-sm">
              Kami sedang menyediakan panduan berkualiti untuk anda
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <Link
                key={guide.id}
                href={`/panduan/${guide.slug}`}
                className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden hover:border-yellow-500 transition-all duration-300 group"
              >
                <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  {guide.cover_image ? (
                    <img 
                      src={guide.cover_image} 
                      alt={guide.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 text-4xl">📖</span>
                  )}
                </div>

                <div className="p-6">
                  {guide.category && (
                    <span className="inline-block px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-medium rounded-full mb-3">
                      {guide.category}
                    </span>
                  )}

                  <h3 className="text-xl font-semibold mb-2 group-hover:text-yellow-500 transition-colors line-clamp-2">
                    {guide.title}
                  </h3>

                  {guide.excerpt && (
                    <p className="text-gray-400 text-sm line-clamp-3">
                      {guide.excerpt}
                    </p>
                  )}

                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <span className="text-sm text-yellow-500 group-hover:underline">
                      Baca Selanjutnya →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Featured Tips (Static for now) */}
        {guides.length === 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Panduan Popular</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'Tips First-Timer', icon: '✈️', desc: 'Panduan untuk jemaah pertama kali' },
                { title: 'Senarai Packing', icon: '🎒', desc: 'Apa yang perlu dibawa' },
                { title: 'Persediaan Rohani', icon: '🤲', desc: 'Persediaan mental dan rohani' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-gray-950 border border-gray-800 rounded-lg p-6 text-center"
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                  <p className="text-xs text-gray-600 mt-4">Coming soon</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}