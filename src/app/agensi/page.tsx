import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { Agency } from '@/types/database.types'

async function getAgencies(): Promise<Agency[]> {
  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('is_active', true)
    .order('is_verified', { ascending: false })
    .order('name')

  if (error) {
    console.error('Error fetching agencies:', error)
    return []
  }

  return data || []
}

export default async function AgensiPage() {
  const agencies = await getAgencies()

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Direktori <span className="text-yellow-500">Agensi</span>
          </h1>
          <p className="text-gray-400">
            {agencies.length} agensi umrah dipercayai di Malaysia
          </p>
        </div>

        {agencies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Tiada agensi buat masa ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agencies.map((agency) => (
              <Link
                key={agency.id}
                href={`/agensi/${agency.slug}`}
                className="bg-gray-950 border border-gray-800 rounded-lg p-6 hover:border-yellow-500 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                    {agency.logo_url ? (
                      <img 
                        src={agency.logo_url} 
                        alt={agency.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-2xl">🏢</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-semibold group-hover:text-yellow-500 transition-colors line-clamp-2">
                        {agency.name}
                      </h3>
                      {agency.is_verified && (
                        <span className="text-yellow-500 flex-shrink-0" title="Disahkan">
                          ✓
                        </span>
                      )}
                    </div>

                    {agency.about && (
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                        {agency.about}
                      </p>
                    )}

                    <div className="space-y-1 text-sm text-gray-500">
                      {agency.phone && (
                        <div className="flex items-center gap-2">
                          <span>📞</span>
                          <span>{agency.phone}</span>
                        </div>
                      )}
                      {agency.email && (
                        <div className="flex items-center gap-2">
                          <span>✉️</span>
                          <span className="truncate">{agency.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}