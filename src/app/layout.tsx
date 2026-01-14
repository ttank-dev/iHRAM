import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'iHRAM - Platform Discovery Umrah Malaysia',
  description: 'Platform discovery pakej umrah pertama di Malaysia yang telus dan mudah. Perjalanan anda bermula di sini.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="ms">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}