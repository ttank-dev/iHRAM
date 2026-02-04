'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function PakejSayaPage() {
  const [packages, setPackages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadPackages()
  }, [])

  const loadPackages = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!agency) return

    const { data } = await supabase
      .from('packages')
      .select('*')
      .eq('agency_id', agency.id)
      .order('created_at', { ascending: false })

    setPackages(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Anda pasti nak padam pakej "${title}"?`)) return

    setDeleting(id)
    
    const { error } = await supabase
      .from('packages')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Gagal padam: ' + error.message)
      setDeleting(null)
      return
    }

    // Reload packages
    await loadPackages()
    setDeleting(null)
  }

  const handleDuplicate = async (pkg: any) => {
    if (!confirm(`Duplicate pakej "${pkg.title}"?`)) return

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: agency } = await supabase
      .from('agencies')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!agency) return

    // Create duplicate with modified title
    const newSlug = `${pkg.slug}-copy-${Date.now()}`
    
    const { error } = await supabase
      .from('packages')
      .insert({
        ...pkg,
        id: undefined,
        created_at: undefined,
        agency_id: agency.id,
        title: `${pkg.title} (Copy)`,
        slug: newSlug,
        status: 'draft'
      })

    if (error) {
      alert('Gagal duplicate: ' + error.message)
      return
    }

    await loadPackages()
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <div style={{ fontSize: '16px', color: '#666' }}>Loading packages...</div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
            Pakej Saya
          </h1>
          <p style={{ fontSize: '15px', color: '#666' }}>
            Urus semua pakej umrah anda
          </p>
        </div>
        <Link
          href="/merchant/dashboard/pakej/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 24px',
            backgroundColor: '#B8936D',
            color: 'white',
            borderRadius: '10px',
            fontSize: '15px',
            fontWeight: '700',
            textDecoration: 'none'
          }}
        >
          <span style={{ fontSize: '20px' }}>➕</span>
          <span>Tambah Pakej</span>
        </Link>
      </div>

      {packages.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid #E5E5E0'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#2C2C2C', marginBottom: '8px' }}>
                    {pkg.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                    <span>💰 RM {pkg.price_quad?.toLocaleString()}</span>
                    <span>🌙 {pkg.duration_nights} malam</span>
                    <span>📦 {pkg.package_type}</span>
                    <span>📅 {new Date(pkg.created_at).toLocaleDateString('ms-MY')}</span>
                  </div>
                  {pkg.description && (
                    <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
                      {pkg.description.substring(0, 150)}{pkg.description.length > 150 ? '...' : ''}
                    </p>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginLeft: '24px' }}>
                  <div style={{
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    backgroundColor: pkg.status === 'published' ? '#E8F5E9' : pkg.status === 'archived' ? '#F5F5F5' : '#FFF8E1',
                    color: pkg.status === 'published' ? '#2E7D32' : pkg.status === 'archived' ? '#666' : '#F57C00'
                  }}>
                    {pkg.status === 'published' ? 'PUBLISHED' : pkg.status === 'archived' ? 'ARCHIVED' : 'DRAFT'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E5E5E0' }}>
                <Link
                  href={`/merchant/dashboard/pakej/edit/${pkg.id}`}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#B8936D',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  ✏️ Edit
                </Link>

                <button
                  onClick={() => handleDuplicate(pkg)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#F5F5F0',
                    color: '#2C2C2C',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  📋 Duplicate
                </button>

                <Link
                  href={`/pakej/${pkg.slug}`}
                  target="_blank"
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#F5F5F0',
                    color: '#2C2C2C',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textDecoration: 'none',
                    display: 'inline-block'
                  }}
                >
                  👁️ Preview
                </Link>

                <button
                  onClick={() => handleDelete(pkg.id, pkg.title)}
                  disabled={deleting === pkg.id}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: deleting === pkg.id ? '#CCC' : '#FEE',
                    color: deleting === pkg.id ? '#666' : '#C33',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: deleting === pkg.id ? 'not-allowed' : 'pointer',
                    marginLeft: 'auto'
                  }}
                >
                  {deleting === pkg.id ? '⏳ Deleting...' : '🗑️ Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ 
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '80px 40px',
          textAlign: 'center',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📦</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px' }}>
            Tiada Pakej Lagi
          </h3>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
            Mulakan dengan menambah pakej umrah pertama anda
          </p>
          <Link
            href="/merchant/dashboard/pakej/new"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              backgroundColor: '#B8936D',
              color: 'white',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '700',
              textDecoration: 'none'
            }}
          >
            Tambah Pakej
          </Link>
        </div>
      )}
    </div>
  )
}