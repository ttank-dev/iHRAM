import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Agency, Package } from '@/types/database.types'

interface PageProps {
  params: {
    slug: string
  }
}

async function getAgency(slug: string): Promise<Agency | null> {
  const { data, error } = await supabase
    .from('agencies')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data
}

async function getAgencyPackages(agencyId: string): Promise<Package[]> {
  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('agency_id', agencyId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) return []
  return data || []
}

export default async function AgencyProfilePage({ params }: PageProps) {
  const { slug } = await params
  const agency = await getAgency(slug)

  if (!agency) {
    notFound()
  }

  const packages = await getAgencyPackages(agency.id)

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-yellow-500">Home</Link>
          <span>/</span>
          <Link href="/agensi" className="hover:text-yellow-500">Agensi</Link>
          <span>/</span>
          <span className="text-white">{agency.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-950 border border-gray-800 rounded-lg p-8">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl">🏢</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{agency.name}</h1>
                    {agency.is_verified && (
                      <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-sm font-medium rounded-full">
                        Disahkan
                      </span>
                    )}
                  </div>
                  {agency.about && (
                    <p className="text-gray-400">{agency.about}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-800">
                {agency.phone && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Telefon</p>
                    <p className="font-medium">{agency.phone}</p>
                  </div>
                )}
                {agency.email && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-sm">{agency.email}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-6">
                Pakej Tersedia ({packages.length})
              </h2>

              {packages.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  Tiada pakej tersedia
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {packages.map((pkg) => (
                    <Link
                      key={pkg.id}
                      href={`/pakej/${pkg.slug}`}
                      className="bg-gray-950 border border-gray-800 rounded-lg p-6 hover:border-yellow-500 transition-all group"
                    >
                      <span className="inline-block px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-medium rounded-full mb-3 capitalize">
                        {pkg.package_type}
                      </span>
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-yellow-500 transition-colors line-clamp-2">
                        {pkg.title}
                      </h3>
                      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
                        <div>
                          <p className="text-xs text-gray-500">Dari</p>
                          <p className="text-xl font-bold text-yellow-500">
                            RM {pkg.price_quad?.toLocaleString()}
                          </p>
                        </div>
                        <span className="text-sm text-yellow-500">Lihat</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-gray-950 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Hubungi Agensi</h3>
              <Link
                href={`https://wa.me/${agency.phone?.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors text-center"
              >
                WhatsApp
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}