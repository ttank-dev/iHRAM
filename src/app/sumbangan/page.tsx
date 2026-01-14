export default function SumbanganPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">
          Sumbangan <span className="text-yellow-500">Ikhlas</span>
        </h1>

        <div className="space-y-8">
          <div className="bg-gray-950 border border-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Mengapa iHRAM Percuma?</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              iHRAM dibangunkan dengan niat ikhlas untuk memudahkan umat Islam Malaysia 
              dalam mencari pakej umrah yang sesuai. Kami tidak mengenakan sebarang bayaran 
              kepada pengguna atau agensi pada peringkat MVP ini.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Jika anda mendapati platform ini bermanfaat dan ingin menyokong usaha kami, 
              sumbangan ikhlas anda amat dihargai untuk menampung kos operasi dan pembangunan.
            </p>
          </div>

          <div className="bg-gray-950 border border-yellow-500 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center">Maklumat Bank</h2>
            <div className="space-y-4 text-center">
              <div>
                <p className="text-sm text-gray-400 mb-1">Nama Syarikat</p>
                <p className="text-xl font-semibold">Think Tank Sdn Bhd</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">Bank</p>
                <p className="text-xl font-semibold">[Bank Name]</p>
              </div>
              <div>
                <p className="text-sm text-gray-400 mb-1">No. Akaun</p>
                <p className="text-xl font-semibold">[Account Number]</p>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-sm text-gray-400 text-center">
                QR Code untuk DuitNow / Touch n Go akan disediakan tidak lama lagi
              </p>
            </div>
          </div>

          <div className="bg-gray-950 border border-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Penggunaan Sumbangan</h2>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">•</span>
                <span>Kos penyelenggaraan pelayan dan domain</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">•</span>
                <span>Pembangunan ciri-ciri baru</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">•</span>
                <span>Pemasaran untuk menjangkau lebih ramai pengguna</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">•</span>
                <span>Sokongan pelanggan yang lebih baik</span>
              </li>
            </ul>
          </div>

          <p className="text-center text-gray-400 text-sm">
            Terima kasih atas sokongan anda! 🤲
          </p>
        </div>
      </div>
    </div>
  )
}