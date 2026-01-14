import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold text-yellow-500 mb-4">iHRAM</h3>
            <p className="text-gray-400 text-sm mb-4">
              Platform discovery pakej umrah pertama di Malaysia yang telus dan mudah. 
              Perjalanan anda bermula di sini.
            </p>
            <p className="text-xs text-gray-500">
              © 2026 Think Tank Sdn Bhd. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Navigasi</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/pakej" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  Pakej Umrah
                </Link>
              </li>
              <li>
                <Link href="/agensi" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  Direktori Agensi
                </Link>
              </li>
              <li>
                <Link href="/ulasan" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  Ulasan Jemaah
                </Link>
              </li>
              <li>
                <Link href="/panduan" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  Panduan Umrah
                </Link>
              </li>
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h4 className="font-semibold mb-4">Maklumat</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tentang" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link href="/hubungi" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  Hubungi
                </Link>
              </li>
              <li>
                <Link href="/sumbangan" className="text-gray-400 hover:text-yellow-500 transition-colors">
                  Sumbangan Ikhlas
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}