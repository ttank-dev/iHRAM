import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-black/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-yellow-500">iHRAM</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/pakej" className="text-sm font-medium hover:text-yellow-500 transition-colors">
              Pakej
            </Link>
            <Link href="/agensi" className="text-sm font-medium hover:text-yellow-500 transition-colors">
              Agensi
            </Link>
            <Link href="/ulasan" className="text-sm font-medium hover:text-yellow-500 transition-colors">
              Ulasan
            </Link>
            <Link href="/panduan" className="text-sm font-medium hover:text-yellow-500 transition-colors">
              Panduan
            </Link>
            <Link href="/sumbangan" className="px-4 py-2 text-sm font-medium bg-yellow-500 text-black rounded-md hover:bg-yellow-600 transition-colors">
              Sumbangan
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-md hover:bg-gray-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}