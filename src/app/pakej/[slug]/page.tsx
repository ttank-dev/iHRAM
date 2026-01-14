import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { PackageWithAgency } from '@/types/database.types'

interface PageProps {
  params: {
    slug: string
  }
}

async function getPackage(slug: string): Promise<PackageWithAgency | null> {
  const { data, error } = await supabase
    .from('packages')
    .select(`
      *,
      agencies (*)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function PackageDetailPage({ params }: PageProps) {
  const { slug } = await params
  const pkg = await getPackage(slug)

  if (!pkg) {
    notFound()
  }

  const whatsappMessage = `Salam, saya berminat dengan pakej ${pkg.title} dari iHRAM`
  const whatsappNumber = pkg.agencies?.phone?.replace(/[^0-9]/g, '') || '60123456789'
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-yellow-500">Home</Link>
          <span>/</span>
          <Link href="/pakej" className="hover:text-yellow-500">Pakej</Link>
          <span>/</span>
          <span className="text-white">{pkg.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-96 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
              <span className="text-gray-600 text-6xl">🕌</span>
            </div>

            <div>
              <span className="inline-block px-4 py-1 bg-yellow-500/10 text-yellow-500 text-sm font-medium rounded-full mb-3 capitalize">
                {pkg.package_type}
              </span>
              <h1 className="text-4xl font-bold mb-4">{pkg.title}</h1>
              <p className="text-gray-400">{pkg.description}</p>
            </div>

            <div className="bg-gray-950 border border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Maklumat Pakej</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tempoh</p>
                  <p className="font-medium">{pkg.duration_nights} Hari</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Berlepas Dari</p>
                  <p className="font-medium">{pkg.departure_city}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              <div className="bg-gray-950 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Harga Pakej</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quad Sharing</span>
                    <span className="font-bold text-yellow-500">RM {pkg.price_quad?.toLocaleString()}</span>
                  </div>
                  {pkg.price_triple && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Triple Sharing</span>
                      <span className="font-semibold">RM {pkg.price_triple.toLocaleString()}</span>
                    </div>
                  )}
                  {pkg.price_double && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Double Sharing</span>
                      <span className="font-semibold">RM {pkg.price_double.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <Link
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors text-center"
                >
                  WhatsApp Agensi
                </Link>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Klik untuk hubungi terus
                </p>
              </div>

              <div className="bg-gray-950 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Maklumat Agensi</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Nama Agensi</p>
                    <p className="font-medium">{pkg.agencies?.name}</p>
                  </div>
                  {pkg.agencies?.phone && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Telefon</p>
                      <p className="font-medium">{pkg.agencies.phone}</p>
                    </div>
                  )}
                  {pkg.agencies?.is_verified && (
                    <div className="pt-3 border-t border-gray-800">
                      <span className="inline-flex items-center gap-2 text-yellow-500 text-sm">
                        <span>✓</span>
                        <span>Agensi Disahkan</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}