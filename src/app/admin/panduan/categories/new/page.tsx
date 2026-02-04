import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import CategoryForm from '../CategoryForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function NewCategoryPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

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
              Add New Category
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#666'
            }}>
              Create a new category for panduan guides
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
      <CategoryForm />
    </div>
  )
}