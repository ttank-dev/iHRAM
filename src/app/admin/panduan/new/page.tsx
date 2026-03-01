import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import NewGuideFormWrapper from './NewGuideFormWrapper'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function NewPanduanPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  const safeCategories = Array.isArray(categories) ? categories : []

  return (
    <div>
      <style>{`
        .ngp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          gap: 16px;
        }
        .ngp-title { font-size: 32px; font-weight: bold; color: #2C2C2C; margin-bottom: 8px; }
        .ngp-sub { font-size: 16px; color: #666; }
        .ngp-back {
          padding: 10px 20px;
          background: transparent;
          color: #666;
          border: 1px solid #E5E5E0;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        @media (max-width: 639px) {
          .ngp-header { flex-direction: column; align-items: flex-start; margin-bottom: 20px; }
          .ngp-title { font-size: 22px; }
          .ngp-sub { font-size: 14px; }
          .ngp-back { font-size: 13px; padding: 8px 14px; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .ngp-title { font-size: 26px; }
        }
      `}</style>

      <div className="ngp-header">
        <div>
          <h1 className="ngp-title">New Guide</h1>
          <p className="ngp-sub">Create a new Umrah guide article</p>
        </div>
        <Link href="/admin/panduan" className="ngp-back">← Back to Guides</Link>
      </div>

      <NewGuideFormWrapper categories={safeCategories} />
    </div>
  )
}