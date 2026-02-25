import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import EditGuideFormWrapper from './EditGuideFormWrapper'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function EditPanduanPage({ params }: { params: Promise<{ id: string }> }) {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  const { id } = await params

  const supabase = await createClient()
  
  const { data: guide, error: guideError } = await supabase
    .from('guides')
    .select('*')
    .eq('id', id)
    .single()

  if (guideError || !guide) redirect('/admin/panduan')

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  const safeCategories = Array.isArray(categories) ? categories : []

  return (
    <div>
      <style>{`
        .egp-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          gap: 16px;
        }
        .egp-title { font-size: 32px; font-weight: bold; color: #2C2C2C; margin-bottom: 8px; }
        .egp-sub { font-size: 16px; color: #666; }
        .egp-back {
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
          .egp-header { flex-direction: column; align-items: flex-start; margin-bottom: 20px; }
          .egp-title { font-size: 22px; }
          .egp-sub { font-size: 14px; }
          .egp-back { font-size: 13px; padding: 8px 14px; }
        }
        @media (min-width: 640px) and (max-width: 1023px) {
          .egp-title { font-size: 26px; }
        }
      `}</style>

      <div className="egp-header">
        <div>
          <h1 className="egp-title">Edit Panduan</h1>
          <p className="egp-sub">Update guide details and content</p>
        </div>
        <Link href="/admin/panduan" className="egp-back">← Back to Panduan</Link>
      </div>

      <EditGuideFormWrapper guide={guide} categories={safeCategories} />
    </div>
  )
}