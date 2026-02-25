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

  const { id } = await params

  const supabase = await createClient()
  const { data: category, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !category) redirect('/admin/panduan/categories')

  return (
    <div>
      <style>{`
        .cep-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; gap: 16px; }
        .cep-title { font-size: 32px; font-weight: bold; color: #2C2C2C; margin-bottom: 8px; }
        .cep-sub { font-size: 16px; color: #666; }
        .cep-back {
          padding: 10px 20px; background: transparent; color: #666;
          border: 1px solid #E5E5E0; border-radius: 8px; font-size: 14px;
          font-weight: 600; text-decoration: none; display: flex;
          align-items: center; gap: 8px; white-space: nowrap; flex-shrink: 0;
        }
        @media (max-width: 639px) {
          .cep-header { flex-direction: column; align-items: flex-start; margin-bottom: 20px; }
          .cep-title { font-size: 22px; }
          .cep-sub { font-size: 14px; }
          .cep-back { font-size: 13px; padding: 8px 14px; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .cep-title { font-size: 26px; }
        }
      `}</style>

      <div className="cep-header">
        <div>
          <h1 className="cep-title">Edit Category</h1>
          <p className="cep-sub">Update category details</p>
        </div>
        <Link href="/admin/panduan/categories" className="cep-back">← Back to Categories</Link>
      </div>

      <CategoryForm category={category} />
    </div>
  )
}