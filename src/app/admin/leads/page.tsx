import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LeadsPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  const supabase = await createClient()
  
  // Fetch all leads
  const { data: leads, error } = await supabase
    .from('leads')
    .select(`
      *,
      packages:package_id (title, slug),
      agencies:agency_id (name)
    `)
    .order('created_at', { ascending: false })

  const safeLeads = Array.isArray(leads) ? leads : []

  // Calculate stats
  const totalLeads = safeLeads.length
  const todayLeads = safeLeads.filter(lead => {
    const today = new Date().toISOString().split('T')[0]
    const leadDate = new Date(lead.created_at).toISOString().split('T')[0]
    return leadDate === today
  }).length
  
  const last7DaysLeads = safeLeads.filter(lead => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return new Date(lead.created_at) >= sevenDaysAgo
  }).length

  // Group by source
  const leadsBySource = safeLeads.reduce((acc: any, lead) => {
    const source = lead.source || 'unknown'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {})

  // Top packages by leads
  const leadsByPackage = safeLeads.reduce((acc: any, lead) => {
    if (lead.packages) {
      const title = lead.packages.title
      acc[title] = (acc[title] || 0) + 1
    }
    return acc
  }, {})

  const topPackages = Object.entries(leadsByPackage)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 5)

  return (
    <div>
      {/* PAGE HEADER */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#2C2C2C',
          marginBottom: '8px'
        }}>
          Leads Analytics
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666'
        }}>
          Track WhatsApp clicks and user engagement
        </p>
      </div>

      {/* STATS CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        
        {/* Total Leads */}
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
              🎯
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '13px',
                color: '#999',
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                Total Leads
              </div>
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#2C2C2C'
              }}>
                {totalLeads}
              </div>
            </div>
          </div>
        </div>

        {/* Today */}
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
              📅
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '13px',
                color: '#999',
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                Today
              </div>
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#10B981'
              }}>
                {todayLeads}
              </div>
            </div>
          </div>
        </div>

        {/* Last 7 Days */}
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
              backgroundColor: '#EFF6FF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              📈
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '13px',
                color: '#999',
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                Last 7 Days
              </div>
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#3B82F6'
              }}>
                {last7DaysLeads}
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Clicks */}
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
              backgroundColor: '#F0FDF4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              💬
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '13px',
                color: '#999',
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                WhatsApp
              </div>
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#22C55E'
              }}>
                {leadsBySource['whatsapp_click'] || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOP PACKAGES */}
      {topPackages.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E5E0',
          marginBottom: '32px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#2C2C2C',
            marginBottom: '20px'
          }}>
            🏆 Top Performing Packages
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topPackages.map(([title, count]: any, index) => (
              <div
                key={title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  backgroundColor: '#F5F5F0',
                  borderRadius: '12px'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: index === 0 ? '#B8936D' : '#E5E5E0',
                  color: index === 0 ? 'white' : '#666',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#2C2C2C'
                  }}>
                    {title}
                  </div>
                </div>
                <div style={{
                  padding: '6px 16px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#B8936D'
                }}>
                  {count} leads
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECENT LEADS TABLE */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        border: '1px solid #E5E5E0',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #E5E5E0'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#2C2C2C'
          }}>
            Recent Leads
          </h2>
        </div>

        {safeLeads.length === 0 ? (
          // Empty State
          <div style={{
            padding: '80px 40px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎯</div>
            <div style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              No Leads Yet
            </div>
            <div style={{
              fontSize: '15px',
              color: '#666'
            }}>
              Leads will appear here when users click WhatsApp buttons
            </div>
          </div>
        ) : (
          // Leads Table
          <div style={{ overflowX: 'auto' }}>
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
                    Date & Time
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
                    Package
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
                    Agency
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
                    Source
                  </th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '13px',
                    fontWeight: '700',
                    color: '#666',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    width: '120px'
                  }}>
                    Ref Code
                  </th>
                </tr>
              </thead>
              <tbody>
                {safeLeads.map((lead: any) => (
                  <tr
                    key={lead.id}
                    style={{
                      borderBottom: '1px solid #E5E5E0'
                    }}
                  >
                    {/* Date Time */}
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#2C2C2C',
                        marginBottom: '4px'
                      }}>
                        {new Date(lead.created_at).toLocaleDateString('ms-MY', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#999'
                      }}>
                        {new Date(lead.created_at).toLocaleTimeString('ms-MY', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>

                    {/* Package */}
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: '600',
                        color: '#2C2C2C'
                      }}>
                        {lead.packages?.title || '-'}
                      </div>
                    </td>

                    {/* Agency */}
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{
                        fontSize: '14px',
                        color: '#666'
                      }}>
                        {lead.agencies?.name || '-'}
                      </div>
                    </td>

                    {/* Source */}
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
                        backgroundColor: '#F0FDF4',
                        color: '#22C55E'
                      }}>
                        💬 WhatsApp
                      </span>
                    </td>

                    {/* Ref Code */}
                    <td style={{ padding: '20px 24px' }}>
                      <code style={{
                        fontSize: '12px',
                        color: '#666',
                        backgroundColor: '#F5F5F0',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontFamily: 'monospace'
                      }}>
                        {lead.ref_code || '-'}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}