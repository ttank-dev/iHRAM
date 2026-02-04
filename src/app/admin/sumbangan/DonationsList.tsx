'use client'

export default function DonationsList({ donations = [] }: { donations?: any[] }) {
  
  if (donations.length === 0) {
    return (
      <div style={{
        padding: '80px 40px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>💰</div>
        <div style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#2C2C2C',
          marginBottom: '8px'
        }}>
          No Donations Yet
        </div>
        <div style={{
          fontSize: '15px',
          color: '#666'
        }}>
          Donations will appear here when received
        </div>
      </div>
    )
  }

  return (
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
              Donor
            </th>
            <th style={{
              padding: '16px 24px',
              textAlign: 'right',
              fontSize: '13px',
              fontWeight: '700',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              width: '140px'
            }}>
              Amount
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
              Method
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
              textAlign: 'left',
              fontSize: '13px',
              fontWeight: '700',
              color: '#666',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              width: '140px'
            }}>
              Reference
            </th>
          </tr>
        </thead>
        <tbody>
          {donations.map((donation: any) => (
            <tr
              key={donation.id}
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
                  {new Date(donation.created_at).toLocaleDateString('ms-MY', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#999'
                }}>
                  {new Date(donation.created_at).toLocaleTimeString('ms-MY', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </td>

              {/* Donor */}
              <td style={{ padding: '20px 24px' }}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#2C2C2C',
                  marginBottom: '2px'
                }}>
                  {donation.donor_name || 'Anonymous'}
                </div>
                {donation.donor_email && (
                  <div style={{
                    fontSize: '13px',
                    color: '#999'
                  }}>
                    {donation.donor_email}
                  </div>
                )}
              </td>

              {/* Amount */}
              <td style={{
                padding: '20px 24px',
                textAlign: 'right'
              }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  color: '#B8936D'
                }}>
                  RM {donation.amount?.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                </div>
              </td>

              {/* Method */}
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
                  backgroundColor: '#EFF6FF',
                  color: '#3B82F6'
                }}>
                  {donation.payment_method || 'Bank'}
                </span>
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
                  backgroundColor: 
                    donation.status === 'completed' ? '#ECFDF5' :
                    donation.status === 'pending' ? '#FEF3C7' :
                    '#FEE2E2',
                  color:
                    donation.status === 'completed' ? '#10B981' :
                    donation.status === 'pending' ? '#F59E0B' :
                    '#EF4444'
                }}>
                  {donation.status === 'completed' && '✓ '}
                  {donation.status === 'pending' && '⏳ '}
                  {donation.status === 'failed' && '✗ '}
                  {donation.status}
                </span>
              </td>

              {/* Reference */}
              <td style={{ padding: '20px 24px' }}>
                <code style={{
                  fontSize: '12px',
                  color: '#666',
                  backgroundColor: '#F5F5F0',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontFamily: 'monospace'
                }}>
                  {donation.reference_id || '-'}
                </code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}