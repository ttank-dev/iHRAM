import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import CategoryActions from './CategoryActions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CategoriesPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  const supabase = await createClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  const safeCategories = Array.isArray(categories) ? categories : []
  const activeCount = safeCategories.filter(c => c.is_active).length
  const inactiveCount = safeCategories.filter(c => !c.is_active).length

  return (
    <div>
      <style>{`
        /* Header */
        .cp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; gap: 16px; }
        .cp-title { font-size: 32px; font-weight: bold; color: #2C2C2C; margin-bottom: 8px; }
        .cp-sub { font-size: 16px; color: #666; }
        .cp-back {
          padding: 10px 20px; background: transparent; color: #666;
          border: 1px solid #E5E5E0; border-radius: 8px; font-size: 14px;
          font-weight: 600; text-decoration: none; display: flex;
          align-items: center; gap: 8px; white-space: nowrap; flex-shrink: 0;
        }

        /* Stats */
        .cp-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 32px; }
        .cp-stat-card { background: white; border-radius: 16px; padding: 24px; border: 1px solid #E5E5E0; }
        .cp-stat-inner { display: flex; align-items: center; gap: 16px; }
        .cp-stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
        .cp-stat-label { font-size: 13px; color: #999; font-weight: 600; margin-bottom: 4px; }
        .cp-stat-value { font-size: 32px; font-weight: bold; }

        /* Add bar */
        .cp-add-bar {
          background: white; border-radius: 16px; padding: 20px 24px;
          border: 1px solid #E5E5E0; margin-bottom: 24px;
          display: flex; justify-content: space-between; align-items: center; gap: 16px;
          overflow: hidden;
        }
        .cp-add-title { font-size: 15px; font-weight: 600; color: #2C2C2C; margin-bottom: 4px; }
        .cp-add-sub { font-size: 13px; color: #666; }
        .cp-add-btn {
          padding: 12px 24px; background: #B8936D; color: white;
          border-radius: 8px; font-size: 14px; font-weight: 600;
          text-decoration: none; display: flex; align-items: center; gap: 8px;
          white-space: nowrap; flex-shrink: 0;
        }

        /* Table */
        .cp-table-wrap { background: white; border-radius: 16px; border: 1px solid #E5E5E0; overflow: hidden; }
        .cp-table { width: 100%; border-collapse: collapse; }
        .cp-thead { background: #F5F5F0; border-bottom: 1px solid #E5E5E0; }
        .cp-th {
          padding: 16px 24px; text-align: left; font-size: 13px;
          font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .cp-th-center { text-align: center; width: 120px; }
        .cp-th-right { text-align: right; width: 220px; }
        .cp-tr { border-bottom: 1px solid #E5E5E0; }
        .cp-td { padding: 20px 24px; }
        .cp-td-center { padding: 20px 24px; text-align: center; }
        .cp-td-right { padding: 20px 24px; text-align: right; }

        .cp-cat-row { display: flex; align-items: center; gap: 12px; }
        .cp-cat-icon { width: 40px; height: 40px; border-radius: 8px; background: #F5F5F0; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .cp-cat-name { font-size: 15px; font-weight: 600; color: #2C2C2C; margin-bottom: 2px; }
        .cp-cat-desc { font-size: 13px; color: #999; }
        .cp-slug { font-size: 13px; color: #666; background: #F5F5F0; padding: 4px 8px; border-radius: 4px; font-family: monospace; }

        /* Mobile cards */
        .cp-mobile-list { display: none; flex-direction: column; gap: 12px; padding: 16px; }
        .cp-mobile-card { background: #F9F9F7; border-radius: 10px; padding: 16px; border: 1px solid #E5E5E0; }
        .cp-mobile-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
        .cp-mobile-card-name { font-size: 15px; font-weight: 600; color: #2C2C2C; }
        .cp-mobile-card-desc { font-size: 13px; color: #999; margin-top: 2px; }
        .cp-mobile-card-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .cp-mobile-card-actions { display: flex; gap: 8px; }

        /* Empty state */
        .cp-empty { padding: 60px 24px; text-align: center; }
        .cp-empty-icon { font-size: 56px; margin-bottom: 16px; }
        .cp-empty-title { font-size: 20px; font-weight: 600; color: #2C2C2C; margin-bottom: 8px; }
        .cp-empty-sub { font-size: 15px; color: #666; margin-bottom: 24px; }

        /* ── TABLET ── */
        @media (max-width: 1023px) {
          .cp-title { font-size: 26px; }
          .cp-stats { gap: 14px; }
          .cp-stat-card { padding: 18px; }
          .cp-stat-value { font-size: 26px; }
          .cp-th, .cp-td, .cp-td-center, .cp-td-right { padding: 14px 16px; }
          .cp-th-right { width: 180px; }
        }

        /* ── MOBILE ── */
        @media (max-width: 639px) {
          .cp-header { flex-direction: column; align-items: flex-start; margin-bottom: 20px; }
          .cp-title { font-size: 22px; }
          .cp-sub { font-size: 14px; }
          .cp-back { font-size: 13px; padding: 8px 14px; }

          .cp-stats { grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
          .cp-stats > :last-child { grid-column: 1 / -1; }
          .cp-stat-card { padding: 16px; }
          .cp-stat-icon { width: 36px; height: 36px; font-size: 18px; }
          .cp-stat-label { font-size: 12px; }
          .cp-stat-value { font-size: 24px; }

          .cp-add-bar { flex-direction: column; align-items: flex-start; padding: 16px; }
          .cp-add-btn { width: 100%; justify-content: center; box-sizing: border-box; }

          /* Hide table, show cards */
          .cp-table { display: none; }
          .cp-thead { display: none; }
          .cp-mobile-list { display: flex; }
        }
      `}</style>

      {/* Header */}
      <div className="cp-header">
        <div>
          <h1 className="cp-title">Guide Categories</h1>
          <p className="cp-sub">Manage categories for panduan guides</p>
        </div>
        <Link href="/admin/panduan" className="cp-back">← Back to Panduan</Link>
      </div>

      {/* Stats */}
      <div className="cp-stats">
        <div className="cp-stat-card">
          <div className="cp-stat-inner">
            <div className="cp-stat-icon" style={{ backgroundColor: '#F5F5F0' }}>🏷️</div>
            <div>
              <div className="cp-stat-label">Total</div>
              <div className="cp-stat-value" style={{ color: '#2C2C2C' }}>{safeCategories.length}</div>
            </div>
          </div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-inner">
            <div className="cp-stat-icon" style={{ backgroundColor: '#ECFDF5' }}>✅</div>
            <div>
              <div className="cp-stat-label">Active</div>
              <div className="cp-stat-value" style={{ color: '#10B981' }}>{activeCount}</div>
            </div>
          </div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-inner">
            <div className="cp-stat-icon" style={{ backgroundColor: '#FEF3C7' }}>⏸️</div>
            <div>
              <div className="cp-stat-label">Inactive</div>
              <div className="cp-stat-value" style={{ color: '#F59E0B' }}>{inactiveCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Bar */}
      <div className="cp-add-bar">
        <div>
          <div className="cp-add-title">Add New Category</div>
          <div className="cp-add-sub">Create a new category for organizing guides</div>
        </div>
        <Link href="/admin/panduan/categories/new" className="cp-add-btn">
          <span>➕</span><span>Add Category</span>
        </Link>
      </div>

      {/* Table Wrap */}
      <div className="cp-table-wrap">
        {safeCategories.length === 0 ? (
          <div className="cp-empty">
            <div className="cp-empty-icon">🏷️</div>
            <div className="cp-empty-title">No Categories Yet</div>
            <div className="cp-empty-sub">Create your first category to start organizing guides</div>
            <Link href="/admin/panduan/categories/new" className="cp-add-btn" style={{ display: 'inline-flex' }}>
              <span>➕</span><span>Create First Category</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <table className="cp-table">
              <thead className="cp-thead">
                <tr>
                  <th className="cp-th">Category</th>
                  <th className="cp-th">Slug</th>
                  <th className="cp-th cp-th-center">Status</th>
                  <th className="cp-th cp-th-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {safeCategories.map((category: any) => (
                  <tr key={category.id} className="cp-tr">
                    <td className="cp-td">
                      <div className="cp-cat-row">
                        <div className="cp-cat-icon">🏷️</div>
                        <div>
                          <div className="cp-cat-name">{category.name}</div>
                          {category.description && <div className="cp-cat-desc">{category.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="cp-td">
                      <code className="cp-slug">{category.slug}</code>
                    </td>
                    <td className="cp-td-center">
                      <span style={{
                        display: 'inline-block', padding: '6px 12px', borderRadius: '6px',
                        fontSize: '12px', fontWeight: '700', textTransform: 'uppercase',
                        backgroundColor: category.is_active ? '#ECFDF5' : '#FEF3C7',
                        color: category.is_active ? '#10B981' : '#F59E0B'
                      }}>
                        {category.is_active ? '✓ Active' : '⏸ Inactive'}
                      </span>
                    </td>
                    <td className="cp-td-right">
                      <CategoryActions category={category} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="cp-mobile-list">
              {safeCategories.map((category: any) => (
                <div key={category.id} className="cp-mobile-card">
                  <div className="cp-mobile-card-header">
                    <div className="cp-cat-icon">🏷️</div>
                    <div>
                      <div className="cp-mobile-card-name">{category.name}</div>
                      {category.description && <div className="cp-mobile-card-desc">{category.description}</div>}
                    </div>
                  </div>
                  <div className="cp-mobile-card-meta">
                    <code className="cp-slug">{category.slug}</code>
                    <span style={{
                      padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                      backgroundColor: category.is_active ? '#ECFDF5' : '#FEF3C7',
                      color: category.is_active ? '#10B981' : '#F59E0B'
                    }}>
                      {category.is_active ? '✓ Active' : '⏸ Inactive'}
                    </span>
                  </div>
                  <CategoryActions category={category} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}