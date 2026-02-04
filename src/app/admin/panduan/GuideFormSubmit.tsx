'use client'

import Link from 'next/link'

export default function GuideFormSubmit() {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Trigger hidden button to update content value before submit
    const updateButton = document.getElementById('update-content') as HTMLButtonElement
    if (updateButton) {
      updateButton.click()
    }
  }

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <button
        type="submit"
        onClick={(e) => {
          const form = e.currentTarget.form
          if (form) {
            const updateButton = document.getElementById('update-content') as HTMLButtonElement
            if (updateButton) {
              updateButton.click()
            }
          }
        }}
        style={{ padding: '12px 32px', backgroundColor: '#D4AF37', color: 'black', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}
      >
        Create Guide
      </button>
      <Link
        href="/admin/panduan"
        style={{ padding: '12px 32px', backgroundColor: '#2A2A2A', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', display: 'inline-block' }}
      >
        Cancel
      </Link>
    </div>
  )
}