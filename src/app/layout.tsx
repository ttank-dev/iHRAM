import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'iHRAM - Platform Discovery Umrah Malaysia',
  description: 'Platform discovery pakej umrah pertama di Malaysia yang telus dan mudah. Perjalanan anda bermula di sini.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ms">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}