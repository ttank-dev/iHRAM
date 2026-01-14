import Link from 'next/link'

export default function HantarUlasanPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link 
            href="/ulasan"
            className="text-gray-400 hover:text-yellow-500 transition-colors text-sm mb-4 inline-block"
          >
            ← Kembali ke Ulasan
          </Link>
          <h1 className="text-4xl font-bold mb-4">
            Hantar <span className="text-yellow-500">Ulasan</span>
          </h1>
          <p className="text-gray-400">
            Kongsi pengalaman umrah anda untuk membantu jemaah lain
          </p>
        </div>

        <div className="bg-gray-950 border border-gray-800 rounded-lg p-8">
          <form className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nama <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="Nama anda"
                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Biarkan kosong untuk ulasan anonymous
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="text-3xl text-gray-700 hover:text-yellow-500 transition-colors"
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Ulasan <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={6}
                placeholder="Kongsi pengalaman umrah anda..."
                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 50 patah perkataan
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tarikh Travel <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Januari 2025"
                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div className="pt-6 border-t border-gray-800">
              <p className="text-sm text-gray-400 mb-4">
                Ulasan anda akan disemak oleh admin sebelum diterbitkan
              </p>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Hantar Ulasan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}