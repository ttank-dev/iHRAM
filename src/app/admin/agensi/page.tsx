import { createClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'

export default async function AdminAgensiPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  const supabase = await createClient()

  const { data: agencies } = await supabase
    .from('agencies')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div style={{ color: 'white' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>Manage Agensi</h1>
      <p style={{ color: '#A0A0A0', marginBottom: '32px' }}>Verify, suspend atau activate agensi</p>

      <div style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #2A2A2A', backgroundColor: '#0A0A0A' }}>
              <th style={{ padding: '16px', textAlign: 'left', color: '#A0A0A0', fontSize: '14px' }}>Nama Agensi</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#A0A0A0', fontSize: '14px' }}>Contact</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#A0A0A0', fontSize: '14px' }}>Pakej</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#A0A0A0', fontSize: '14px' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'left', color: '#A0A0A0', fontSize: '14px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {agencies?.map((agency: any) => (
              <tr key={agency.id} style={{ borderBottom: '1px solid #2A2A2A' }}>
                <td style={{ padding: '16px' }}>
                  <p style={{ fontWeight: '600' }}>{agency.name}</p>
                </td>
                <td style={{ padding: '16px', color: '#A0A0A0', fontSize: '14px' }}>
                  <p>{agency.phone || '-'}</p>
                  <p>{agency.email || '-'}</p>
                </td>
                <td style={{ padding: '16px', color: '#A0A0A0' }}>1</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {agency.is_verified && (
                      <span style={{ padding: '4px 12px', backgroundColor: '#10B981', color: 'white', borderRadius: '999px', fontSize: '12px' }}>
                        ✓Verified
                      </span>
                    )}
                    {!agency.is_active && (
                      <span style={{ padding: '4px 12px', backgroundColor: '#EF4444', color: 'white', borderRadius: '999px', fontSize: '12px' }}>
                        ⊗Suspended
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ padding: '8px 16px', backgroundColor: '#D4AF37', color: 'black', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
                      {agency.is_verified ? 'Unverify' : 'Verify'}
                    </button>
                    <button style={{ padding: '8px 16px', backgroundColor: agency.is_active ? '#EF4444' : '#10B981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
                      {agency.is_active ? 'Suspend' : 'Activate'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}