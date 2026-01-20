import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Package, Plus, Edit, Eye, Trash2 } from 'lucide-react'

export default async function PakejPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get agency
  const { data: agency } = await supabase
    .from('agencies')
    .select('id, name')
    .eq('user_id', user?.id)
    .single()

  // Get all packages for this agency
  const { data: packages } = await supabase
    .from('packages')
    .select('*')
    .eq('agency_id', agency?.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Pakej Saya</h1>
          <p className="text-gray-400">
            Urus semua pakej umrah anda
          </p>
        </div>
        <Link
          href="/dashboard/pakej/new"
          className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold px-6 py-3 rounded transition-colors"
        >
          <Plus size={20} />
          <span>Tambah Pakej Baru</span>
        </Link>
      </div>

      {/* Packages List */}
      {!packages || packages.length === 0 ? (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-12 text-center">
          <Package size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            Tiada Pakej Lagi
          </h3>
          <p className="text-gray-400 mb-6">
            Mulakan dengan menambah pakej umrah pertama anda
          </p>
          <Link
            href="/dashboard/pakej/new"
            className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold px-6 py-3 rounded transition-colors"
          >
            <Plus size={20} />
            <span>Tambah Pakej Baru</span>
          </Link>
        </div>
      ) : (
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#0A0A0A] border-b border-[#2A2A2A]">
              <tr>
                <th className="text-left text-gray-400 font-semibold px-6 py-4">
                  Pakej
                </th>
                <th className="text-left text-gray-400 font-semibold px-6 py-4">
                  Jenis
                </th>
                <th className="text-left text-gray-400 font-semibold px-6 py-4">
                  Harga
                </th>
                <th className="text-left text-gray-400 font-semibold px-6 py-4">
                  Status
                </th>
                <th className="text-right text-gray-400 font-semibold px-6 py-4">
                  Tindakan
                </th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr
                  key={pkg.id}
                  className="border-b border-[#2A2A2A] hover:bg-[#0A0A0A] transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="text-white font-semibold">{pkg.title}</p>
                    <p className="text-gray-400 text-sm">
                      {pkg.duration_nights} malam
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-block px-3 py-1 bg-[#2A2A2A] text-gray-300 text-sm rounded-full capitalize">
                      {pkg.package_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-semibold">
                      RM {pkg.price_quad?.toLocaleString()}
                    </p>
                    <p className="text-gray-400 text-sm">dari</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 text-sm rounded-full ${
                        pkg.status === 'published'
                          ? 'bg-green-500/20 text-green-400'
                          : pkg.status === 'draft'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {pkg.status === 'published'
                        ? 'Published'
                        : pkg.status === 'draft'
                        ? 'Draft'
                        : 'Archived'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/pakej/${pkg.slug}`}
                        target="_blank"
                        className="p-2 text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded transition-colors"
                        title="Preview"
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        href={`/dashboard/pakej/edit/${pkg.id}`}
                        className="p-2 text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </Link>
                      <button
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}