import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { PackageWithAgency } from '@/types/database.types'

async function getPackages(): Promise<PackageWithAgency[]> {
  const { data, error } = await supabase
    .from('packages')
    .select(`
      *,
      agencies (*)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching packages:', error)
    return []
  }

  return data || []
}

export default async function PakejPage() {
  const packages = await getPackages()

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Pakej <span className="text-yellow-500">Umrah</span>
          </h1>
          <p className="text-gray-400">
            Terokai {packages.length} pakej umrah dari agensi dipercayai di Malaysia
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-gray-950 border border-gray-800 rounded-lg p-6 mb-8">
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Cari pakej umrah..."
              className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select className="px-4 py-2 bg-black border border-gray-800 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option>Semua Harga</option>
              <option>Bawah RM 10,000</option>
              <option>RM 10,000 - RM 15,000</option>
              <option>RM 15,000 - RM 20,000</option>
              <option>Atas RM 20,000</option>
            </select>

            <select className="px-4 py-2 bg-black border border-gray-800 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option>Semua Bulan</option>
              <option>Januari 2026</option>
              <option>Februari 2026</option>
              <option>Mac 2026</option>
            </select>

            <select className="px-4 py-2 bg-black border border-gray-800 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option>Semua Jenis</option>
              <option>Ekonomi</option>
              <option>Standard</option>
              <option>Premium</option>
              <option>VIP</option>
            </select>

            <select className="px-4 py-2 bg-black border border-gray-800 rounded-lg text-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500">
              <option>Harga: Rendah ke Tinggi</option>
              <option>Harga: Tinggi ke Rendah</option>
              <option>Terbaru</option>
            </select>
          </div>
        </div>

        {/* Package Grid */}
        {packages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">Tiada pakej tersedia buat masa ini</p>
            <p className="text-gray-600 text-sm">Pakej akan ditambah tidak lama lagi!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <Link
                key={pkg.id}
                href={`/pakej/${pkg.slug}`}
                className="bg-gray-950 border border-gray-800 rounded-lg overflow-hidden hover:border-yellow-500 transition-all duration-300 group block"
              >
                {/* Image */}
                <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
                  {pkg.photos && pkg.photos[0] ? (
                    <img 
                      src={pkg.photos[0]} 
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <span className="text-gray-600 text-4xl">🕌</span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Badge */}
                  <span className="inline-block px-3 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-medium rounded-full mb-3 capitalize">
                    {pkg.package_type}
                  </span>

                  {/* Title */}
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-yellow-500 transition-colors line-clamp-2">
                    {pkg.title}
                  </h3>

                  {/* Details */}
                  <div className="space-y-2 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{pkg.duration_nights} Hari {pkg.duration_nights + 1} Malam</span>
                    </div>
                    {pkg.departure_city && (
                      <div className="flex items-center gap-2">
                        <span>✈️</span>
                        <span>Berlepas: {pkg.departure_city}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span>🏢</span>
                      <span>{pkg.agencies?.name || 'Agensi'}</span>
                    </div>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                    <div>
                      <p className="text-xs text-gray-500">Dari</p>
                      <p className="text-2xl font-bold text-yellow-500">
                        RM {pkg.price_quad?.toLocaleString()}
                      </p>
                    </div>
                    <span className="px-4 py-2 bg-yellow-500 text-black font-medium rounded-lg group-hover:bg-yellow-600 transition-colors">
                      Lihat
                    </span>
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