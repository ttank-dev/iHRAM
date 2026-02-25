'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className="hp-burger" onClick={() => setOpen(!open)} aria-label="Menu">
        <span /><span /><span />
      </button>
      <div className={`hp-mob-menu ${open ? 'open' : ''}`}>
        {[
          { href: '/', label: 'Home' },
          { href: '/pakej', label: 'Pakej Umrah' },
          { href: '/agensi', label: 'Agensi' },
          { href: '/panduan', label: 'Panduan' },
          { href: '/ulasan', label: 'Ulasan' },
          { href: '/tentang', label: 'Tentang' },
          { href: '/merchant/signup', label: 'DAFTAR AGENSI' },
        ].map(link => (
          <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </Link>
        ))}
      </div>
    </>
  )
}