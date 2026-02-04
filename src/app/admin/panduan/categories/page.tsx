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
  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  const safeCategories = Array.isArray(categories) ? categories : []

  // Count stats
  const activeCount = safeCategories.filter(c => c.is_active).length
  const inactiveCount = safeCategories.filter(c => !c.is_active).length

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
              Guide Categories
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#666'
            }}>
              Manage categories for panduan guides
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

      {/* STATS CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Total */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#F5F5F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🏷️
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '13px',
                color: '#999',
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                Total Categories
              </div>
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#2C2C2C'
              }}>
                {safeCategories.length}
              </div>
            </div>
          </div>
        </div>

        {/* Active */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#ECFDF5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              ✅
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '13px',
                color: '#999',
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                Active
              </div>
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#10B981'
              }}>
                {activeCount}
              </div>
            </div>
          </div>
        </div>

        {/* Inactive */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#FEF3C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              ⏸️
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '13px',
                color: '#999',
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                Inactive
              </div>
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#F59E0B'
              }}>
                {inactiveCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ADD NEW BUTTON */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '20px 24px',
        border: '1px solid #E5E5E0',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{
            fontSize: '15px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '4px'
          }}>
            Add New Category
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>
            Create a new category for organizing guides
          </div>
        </div>
        <Link
          href="/admin/panduan/categories/new"
          style={{
            padding: '12px 24px',
            backgroundColor: '#B8936D',
            color: 'white',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span>➕</span>
          <span>Add Category</span>
        </Link>
      </div>

      {/* CATEGORIES TABLE */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid #E5E5E0',
        overflow: 'hidden'
      }}>
        {safeCategories.length === 0 ? (
          // Empty State
          <div style={{
            padding: '80px 40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏷️</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              No Categories Yet
            </div>
            <div style={{
              fontSize: '15px',
              color: '#666',
              marginBottom: '24px'
            }}>
              Create your first category to start organizing guides
            </div>
            <Link
              href="/admin/panduan/categories/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                backgroundColor: '#B8936D',
                color: 'white',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              <span>➕</span>
              <span>Create First Category</span>
            </Link>
          </div>
        ) : (
          // Categories Table
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{
                backgroundColor: '#F5F5F0',
                borderBottom: '1px solid #E5E5E0'
              }}>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Category
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'left',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Slug
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  width: '120px'
                }}>
                  Status
                </th>
                <th style={{
                  padding: '16px 24px',
                  textAlign: 'right',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#666',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  width: '180px'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {safeCategories.map((category: any) => (
                <tr
                  key={category.id}
                  style={{
                    borderBottom: '1px solid #E5E5E0'
                  }}
                >
                  {/* Category Name */}
                  <td style={{ padding: '20px 24px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: '#F5F5F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px'
                      }}>
                        🏷️
                      </div>
                      <div>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#2C2C2C',
                          marginBottom: '2px'
                        }}>
                          {category.name}
                        </div>
                        {category.description && (
                          <div style={{
                            fontSize: '13px',
                            color: '#999'
                          }}>
                            {category.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Slug */}
                  <td style={{ padding: '20px 24px' }}>
                    <code style={{
                      fontSize: '13px',
                      color: '#666',
                      backgroundColor: '#F5F5F0',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}>
                      {category.slug}
                    </code>
                  </td>

                  {/* Status */}
                  <td style={{
                    padding: '20px 24px',
                    textAlign: 'center'
                  }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      backgroundColor: category.is_active ? '#ECFDF5' : '#FEF3C7',
                      color: category.is_active ? '#10B981' : '#F59E0B'
                    }}>
                      {category.is_active ? '✓ Active' : '⏸ Inactive'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{
                    padding: '20px 24px',
                    textAlign: 'right'
                  }}>
                    <CategoryActions category={category} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}