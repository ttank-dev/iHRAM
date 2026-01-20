import { createClient } from '@/lib/supabase/server'
import { Package, Eye, Star, TrendingUp, User } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log('=== DASHBOARD DEBUG ===')
    console.log('Current user ID:', user?.id)

    if (!user) {
      return (
        <div className="text-white p-8">
          <p>No user found</p>
        </div>
      )
    }

    // Get agency
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('*')
      .eq('user_id', user.id)
      .single()

    console.log('Agency found:', agency?.id)
    console.log('Agency name:', agency?.name)
    console.log('Agency error:', agencyError)

    if (agencyError || !agency) {
      return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Profil Agensi Tidak Dijumpai</h2>
            <p className="text-gray-400 mb-6">Sila daftar semula untuk membuat profil agensi.</p>
            <Link
              href="/signup"
              className="bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold px-6 py-3 rounded inline-block"
            >
              Daftar Semula
            </Link>
          </div>
        </div>
      )
    }

    // Get all packages for this agency (with full data for debugging)
    const { data: allPackages, error: packagesError } = await supabase
      .from('packages')
      .select('*')
      .eq('agency_id', agency.id)

    console.log('Total packages found:', allPackages?.length || 0)
    console.log('Packages:', allPackages)
    console.log('Packages error:', packagesError)

    // Count packages
    const packageCount = allPackages?.length || 0
    const publishedCount = allPackages?.filter(p => p.status === 'published').length || 0

    // Get reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('agency_id', agency.id)
      .eq('is_approved', true)

    console.log('Reviews found:', reviews?.length || 0)
    console.log('Reviews error:', reviewsError)

    const averageRating =
      reviews && reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0.0'

    const stats = [
      {
        label: 'Jumlah Pakej',
        value: packageCount,
        icon: Package,
        color: 'text-blue-400',
      },
      {
        label: 'Pakej Published',
        value: publishedCount,
        icon: Eye,
        color: 'text-green-400',
      },
      {
        label: 'Ulasan',
        value: reviews?.length || 0,
        icon: Star,
        color: 'text-yellow-400',
      },
      {
        label: 'Rating Purata',
        value: averageRating,
        icon: TrendingUp,
        color: 'text-[#D4AF37]',
      },
    ]

    console.log('Final stats:', stats)
    console.log('=== END DASHBOARD DEBUG ===')

    return (
      <div>
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Selamat kembali, {agency.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <Icon className={stat.color} size={24} />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/dashboard/pakej/new"
              className="flex items-center gap-3 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold px-6 py-4 rounded transition-colors"
            >
              <Package size={20} />
              <span>Tambah Pakej Baru</span>
            </Link>
            <Link
              href="/dashboard/profil"
              className="flex items-center gap-3 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 font-semibold px-6 py-4 rounded transition-colors"
            >
              <User size={20} />
              <span>Edit Profil Agensi</span>
            </Link>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Dashboard error:', error)
    return (
      <div className="text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Error Loading Dashboard</h1>
        <p className="text-red-400">Something went wrong. Check console for details.</p>
      </div>
    )
  }
}