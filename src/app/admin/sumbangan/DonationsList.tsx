'use client'

export default function DonationsList({ donations = [] }: { donations?: any[] }) {
  if (donations.length === 0) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>💰</div>
        <div style={{ fontSize: '20px', fontWeight: '600', color: '#2C2C2C', marginBottom: '8px' }}>No Donations Yet</div>
        <div style={{ fontSize: '15px', color: '#666' }}>Donations will appear here when received</div>
      </div>
    )
  }

  const statusStyle = (status: string) => ({
    bg: status === 'completed' ? '#ECFDF5' : status === 'pending' ? '#FEF3C7' : '#FEE2E2',
    color: status === 'completed' ? '#10B981' : status === 'pending' ? '#F59E0B' : '#EF4444',
    icon: status === 'completed' ? '✓ ' : status === 'pending' ? '⏳ ' : '✗ '
  })

  return (
    <>
      <style>{`
        /* Desktop table */
        .dl-table-scroll { overflow-x: auto; }
        .dl-table { width: 100%; border-collapse: collapse; }
        .dl-thead { background: #F5F5F0; border-bottom: 1px solid #E5E5E0; }
        .dl-th { padding: 16px 24px; text-align: left; font-size: 13px; font-weight: 700; color: #666; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
        .dl-th-right { text-align: right; }
        .dl-th-center { text-align: center; }
        .dl-tr { border-bottom: 1px solid #E5E5E0; }
        .dl-td { padding: 20px 24px; }
        .dl-td-right { padding: 20px 24px; text-align: right; }
        .dl-td-center { padding: 20px 24px; text-align: center; }
        .dl-date-main { font-size: 15px; font-weight: 600; color: #2C2C2C; margin-bottom: 4px; }
        .dl-date-time { font-size: 13px; color: #999; }
        .dl-badge { display: inline-block; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; }

        /* Mobile cards */
        .dl-mobile { display: none; flex-direction: column; gap: 12px; padding: 16px; }
        .dl-card { background: #F9F9F7; border-radius: 10px; padding: 16px; border: 1px solid #E5E5E0; }
        .dl-card-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 10px; }
        .dl-card-donor { font-size: 15px; font-weight: 600; color: #2C2C2C; }
        .dl-card-email { font-size: 12px; color: #999; }
        .dl-card-amount { font-size: 18px; font-weight: bold; color: #B8936D; white-space: nowrap; }
        .dl-card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid #E5E5E0; flex-wrap: wrap; gap: 8px; }
        .dl-card-date { font-size: 12px; color: #999; }

        @media (max-width: 639px) {
          .dl-table-scroll .dl-table { display: none; }
          .dl-mobile { display: flex; }
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .dl-th, .dl-td, .dl-td-right, .dl-td-center { padding: 12px 16px; }
        }
      `}</style>

      <div className="dl-table-scroll">
        {/* Desktop Table */}
        <table className="dl-table">
          <thead className="dl-thead">
            <tr>
              <th className="dl-th">Date & Time</th>
              <th className="dl-th">Donor</th>
              <th className="dl-th dl-th-right">Amount</th>
              <th className="dl-th dl-th-center">Method</th>
              <th className="dl-th dl-th-center">Status</th>
              <th className="dl-th">Reference</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation: any) => {
              const s = statusStyle(donation.status)
              return (
                <tr key={donation.id} className="dl-tr">
                  <td className="dl-td">
                    <div className="dl-date-main">
                      {new Date(donation.created_at).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="dl-date-time">
                      {new Date(donation.created_at).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="dl-td">
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#2C2C2C', marginBottom: '2px' }}>{donation.donor_name || 'Anonymous'}</div>
                    {donation.donor_email && <div style={{ fontSize: '13px', color: '#999' }}>{donation.donor_email}</div>}
                  </td>
                  <td className="dl-td-right">
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#B8936D' }}>
                      RM {donation.amount?.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="dl-td-center">
                    <span className="dl-badge" style={{ backgroundColor: '#EFF6FF', color: '#3B82F6' }}>
                      {donation.payment_method || 'Bank'}
                    </span>
                  </td>
                  <td className="dl-td-center">
                    <span className="dl-badge" style={{ backgroundColor: s.bg, color: s.color }}>
                      {s.icon}{donation.status}
                    </span>
                  </td>
                  <td className="dl-td">
                    <code style={{ fontSize: '12px', color: '#666', backgroundColor: '#F5F5F0', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                      {donation.reference_id || '-'}
                    </code>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {/* Mobile Cards */}
        <div className="dl-mobile">
          {donations.map((donation: any) => {
            const s = statusStyle(donation.status)
            return (
              <div key={donation.id} className="dl-card">
                <div className="dl-card-row">
                  <div>
                    <div className="dl-card-donor">{donation.donor_name || 'Anonymous'}</div>
                    {donation.donor_email && <div className="dl-card-email">{donation.donor_email}</div>}
                  </div>
                  <div className="dl-card-amount">
                    RM {donation.amount?.toLocaleString('ms-MY', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="dl-card-footer">
                  <div className="dl-card-date">
                    {new Date(donation.created_at).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {' · '}
                    {new Date(donation.created_at).toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span className="dl-badge" style={{ backgroundColor: '#EFF6FF', color: '#3B82F6', padding: '4px 8px', fontSize: '11px' }}>
                      {donation.payment_method || 'Bank'}
                    </span>
                    <span className="dl-badge" style={{ backgroundColor: s.bg, color: s.color, padding: '4px 8px', fontSize: '11px' }}>
                      {s.icon}{donation.status}
                    </span>
                  </div>
                </div>
                {donation.reference_id && (
                  <code style={{ display: 'block', marginTop: '8px', fontSize: '11px', color: '#666', backgroundColor: '#F5F5F0', padding: '4px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                    {donation.reference_id}
                  </code>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}