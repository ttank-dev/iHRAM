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
      <style>{`
        .cnp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; gap: 16px; }
        .cnp-title { font-size: 32px; font-weight: bold; color: #2C2C2C; margin-bottom: 8px; }
        .cnp-sub { font-size: 16px; color: #666; }
        .cnp-back {
          padding: 10px 20px; background: transparent; color: #666;
          border: 1px solid #E5E5E0; border-radius: 8px; font-size: 14px;
          font-weight: 600; text-decoration: none; display: flex;
          align-items: center; gap: 8px; white-space: nowrap; flex-shrink: 0;
        }
        @media (max-width: 639px) {
          .cnp-header { flex-direction: column; align-items: flex-start; margin-bottom: 20px; }
          .cnp-title { font-size: 22px; }
          .cnp-sub { font-size: 14px; }
          .cnp-back { font-size: 13px; padding: 8px 14px; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .cnp-title { font-size: 26px; }
        }
      `}</style>

      <div className="cnp-header">
        <div>
          <h1 className="cnp-title">Add New Category</h1>
          <p className="cnp-sub">Create a new category for panduan guides</p>
        </div>
        <Link href="/admin/panduan/categories" className="cnp-back">← Back to Categories</Link>
      </div>

      <CategoryForm />
    </div>
  )
}