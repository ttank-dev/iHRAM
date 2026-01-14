export default function HubungiPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">
          Hubungi <span className="text-yellow-500">Kami</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-950 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Maklumat Syarikat</h2>
            <div className="space-y-3 text-gray-300">
              <p className="font-medium text-white">Think Tank Sdn Bhd</p>
              <div className="flex items-start gap-3">
                <span className="text-yellow-500">📧</span>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Email</p>
                  <a href="mailto:info@ihram.com.my" className="hover:text-yellow-500">
                    info@ihram.com.my
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Soalan Lazim</h2>
            <p className="text-gray-300 mb-4">
              Ada pertanyaan tentang iHRAM atau pakej umrah?
            </p>
            <p className="text-sm text-gray-400">
              Hantar email kepada kami dan kami akan balas dalam masa 1-2 hari bekerja.
            </p>
          </div>
        </div>

        <div className="bg-gray-950 border border-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6">Hantar Mesej</h2>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Nama</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subjek</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mesej</label>
              <textarea
                rows={6}
                className="w-full px-4 py-3 bg-black border border-gray-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors"
            >
              Hantar Mesej
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}