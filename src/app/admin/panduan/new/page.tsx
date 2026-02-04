import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import NewGuideForm from './NewGuideForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function NewPanduanPage() {
  // Check admin access
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  // Get categories from database
  const supabase = await createClient()
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : []

  return (
    <div>
      {/* PAGE HEADER */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              Tambah Panduan Baru
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#666'
            }}>
              Create a new umrah guide article
            </p>
          </div>

          <Link
            href="/admin/panduan"
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: '#666',
              border: '1px solid #E5E5E0',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ← Back to Panduan
          </Link>
        </div>
      </div>

      {/* FORM COMPONENT */}
      <NewGuideForm categories={safeCategories} />
    </div>
  )
}