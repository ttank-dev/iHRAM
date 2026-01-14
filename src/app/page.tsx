import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-secondary to-background py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Perjalanan Anda <span className="text-primary">Bermula Di Sini</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Platform discovery pakej umrah pertama di Malaysia yang telus dan mudah.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Cari pakej umrah..."
                  className="flex-1 px-4 py-3 rounded-lg bg-card border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors">
                  Cari
                </button>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✓</span>
                <span>50+ Agensi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">★</span>
                <span>200+ Ulasan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🕌</span>
                <span>Dipercayai</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Packages Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pakej <span className="text-primary">Popular</span>
            </h2>
            <p className="text-muted-foreground">
              Pilihan terbaik dari agensi dipercayai
            </p>
          </div>

          {/* Package Cards Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors">
                <div className="h-48 bg-muted rounded-lg mb-4"></div>
                <h3 className="text-xl font-semibold mb-2">Pakej Ekonomi {i}</h3>
                <p className="text-muted-foreground text-sm mb-4">14 Hari 13 Malam</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-primary">RM 12,999</span>
                  <Link href="/pakej" className="text-sm text-primary hover:underline">
                    Lihat →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/pakej" className="inline-block px-8 py-3 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors">
              Terokai Semua Pakej
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}