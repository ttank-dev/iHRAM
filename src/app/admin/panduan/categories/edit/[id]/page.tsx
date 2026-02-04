import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CategoryForm from '../../CategoryForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  // Await params in Next.js 15+
  const { id } = await params

  const supabase = await createClient()
  
  // Fetch the category
  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !category) {
    redirect('/admin/panduan/categories')
  }

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
              Edit Category
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#666'
            }}>
              Update category details
            </p>
          </div>

          <Link
            href="/admin/panduan/categories"
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
            ← Back to Categories
          </Link>
        </div>
      </div>

      {/* FORM */}
      <CategoryForm category={category} />
    </div>
  )
}