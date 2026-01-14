export default function TentangPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">
          Tentang <span className="text-yellow-500">iHRAM</span>
        </h1>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Apa Itu iHRAM?</h2>
            <p className="leading-relaxed">
              iHRAM adalah platform discovery pakej umrah pertama di Malaysia yang telus dan mudah. 
              Kami membantu umat Islam Malaysia membuat keputusan umrah dengan bijak melalui 
              perbandingan pakej, ulasan jemaah, dan direktori agensi yang dipercayai.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Misi Kami</h2>
            <p className="leading-relaxed">
              Bantu umat Islam Malaysia buat keputusan umrah dengan bijak melalui perbandingan pakej, 
              ulasan jemaah, dan direktori agensi yang dipercayai.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Visi 3 Tahun</h2>
            <p className="leading-relaxed">
              Menjadi platform umrah paling dipercayai di Malaysia dan membantu 10,000+ jemaah 
              setiap tahun menunaikan umrah mereka.
            </p>
          </section>

          <section className="bg-gray-950 border border-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-white">Kenapa iHRAM?</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">✓</span>
                <span>Platform agregasi pakej dari pelbagai agensi</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">✓</span>
                <span>Ulasan sebenar dari jemaah yang berpengalaman</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">✓</span>
                <span>Perbandingan harga yang telus</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">✓</span>
                <span>Panduan lengkap untuk jemaah pertama kali</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 mt-1">✓</span>
                <span>Direktori agensi yang disahkan</span>
              </li>
            </ul>
          </section>

          <section>
            <p className="text-center text-gray-400 italic">
              "Perjalanan Anda Bermula Di Sini"
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}