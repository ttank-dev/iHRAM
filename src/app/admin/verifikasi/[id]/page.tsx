import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ApprovalButtons from './ApprovalButtons'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function VerificationDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  try {
    const { id } = await params
    
    console.log('🔵 Loading verification:', id)
    
    const { isAdmin } = await checkAdminAccess()
    if (!isAdmin) redirect('/admin-login')

    const supabase = await createClient()

    // Fetch verification request
    const { data: request, error } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('id', id)
      .single()

    console.log('🔵 Request:', request)
    console.log('🔵 Error:', error)

    if (!request) {
      return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Request Not Found</h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>ID: {id}</p>
          <a 
            href="/admin/verifikasi"
            style={{
              padding: '12px 24px',
              backgroundColor: '#B8936D',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              display: 'inline-block'
            }}
          >
            ← Back to Verifications
          </a>
        </div>
      )
    }

    // Fetch agency separately
    const { data: agency } = await supabase
      .from('agencies')
      .select('id, name, slug, logo_url, email, phone')
      .eq('id', request.agency_id)
      .single()

    return (
      <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <a 
            href="/admin/verifikasi"
            style={{ 
              fontSize: '14px', 
              color: '#B8936D',
              textDecoration: 'none',
              marginBottom: '16px',
              display: 'inline-block'
            }}
          >
            ← Back to Verification Requests
          </a>
          
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '16px' }}>
            Review Verification Request
          </h1>
          
          {/* Status Badge */}
          <div style={{
            display: 'inline-block',
            padding: '8px 20px',
            borderRadius: '20px',
            fontSize: '13px',
            fontWeight: '700',
            backgroundColor: 
              request.status === 'pending' ? '#FFF9E6' :
              request.status === 'approved' ? '#E8F5E9' :
              '#FFEBEE',
            color: 
              request.status === 'pending' ? '#F57C00' :
              request.status === 'approved' ? '#2E7D32' :
              '#C62828'
          }}>
            {request.status === 'pending' ? '⏳ PENDING REVIEW' :
             request.status === 'approved' ? '✅ APPROVED' :
             '❌ REJECTED'}
          </div>
        </div>

        {/* Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          
          {/* Left Column - Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Company Details */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid #E5E5E0'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
                📋 Company Details
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <InfoField label="Company Name" value={request.company_name} />
                <InfoField label="SSM Number" value={request.ssm_number} />
                <InfoField 
                  label="Registration Date" 
                  value={request.company_registration_date ? new Date(request.company_registration_date).toLocaleDateString('ms-MY') : '-'} 
                />
                <InfoField label="Owner/Director" value={request.owner_name || '-'} />
              </div>
            </div>

            {/* MOTAC License */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid #E5E5E0'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
                🏛️ MOTAC License
              </h3>
              <a 
                href="https://www.motac.gov.my/kategori-semakan-new/agensi-pelancongan-umrah/" 
                target="_blank"
                style={{ fontSize: '14px', color: '#B8936D', marginBottom: '24px', display: 'block' }}
              >
                Verify at MOTAC Portal →
              </a>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <InfoField label="License Number" value={request.motac_license_number} />
                <InfoField 
                  label="Expiry Date" 
                  value={new Date(request.motac_license_expiry).toLocaleDateString('ms-MY')}
                  highlight={new Date(request.motac_license_expiry) < new Date()}
                />
              </div>

              {new Date(request.motac_license_expiry) < new Date() && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: '#FFEBEE',
                  border: '1px solid #F44336',
                  borderRadius: '8px',
                  color: '#C62828',
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  ⚠️ LICENSE EXPIRED - DO NOT APPROVE
                </div>
              )}
            </div>

            {/* Contact Details */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid #E5E5E0'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
                📞 Contact Details
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <InfoField label="Phone" value={request.office_phone} />
                <InfoField label="Email" value={request.office_email} />
                <InfoField label="Address" value={request.office_address} />
              </div>
            </div>

            {/* Documents */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid #E5E5E0'
            }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
                📄 Uploaded Documents
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {request.ssm_certificate_url && (
                  <a
                    href={request.ssm_certificate_url}
                    target="_blank"
                    style={{
                      padding: '16px',
                      backgroundColor: '#F5F5F0',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: '15px', color: '#2C2C2C' }}>
                      📋 SSM Certificate
                    </span>
                    <span style={{ fontSize: '14px', color: '#B8936D' }}>
                      View →
                    </span>
                  </a>
                )}

                {request.motac_license_url && (
                  <a
                    href={request.motac_license_url}
                    target="_blank"
                    style={{
                      padding: '16px',
                      backgroundColor: '#F5F5F0',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: '15px', color: '#2C2C2C' }}>
                      🏛️ MOTAC License
                    </span>
                    <span style={{ fontSize: '14px', color: '#B8936D' }}>
                      View →
                    </span>
                  </a>
                )}

                {request.business_license_url && (
                  <a
                    href={request.business_license_url}
                    target="_blank"
                    style={{
                      padding: '16px',
                      backgroundColor: '#F5F5F0',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontSize: '15px', color: '#2C2C2C' }}>
                      📜 Business License
                    </span>
                    <span style={{ fontSize: '14px', color: '#B8936D' }}>
                      View →
                    </span>
                  </a>
                )}

                {!request.ssm_certificate_url && !request.motac_license_url && (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                    No documents uploaded
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column - Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Agency Quick Info */}
            {agency && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #E5E5E0'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '16px' }}>
                  Agency Info
                </h3>
                
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '12px',
                  backgroundColor: agency.logo_url ? 'white' : '#B8936D',
                  backgroundImage: agency.logo_url ? `url(${agency.logo_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '32px',
                  fontWeight: 'bold',
                  marginBottom: '16px'
                }}>
                  {!agency.logo_url && agency.name.charAt(0)}
                </div>

                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
                  {agency.name}
                </div>

                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  {agency.email}
                </div>
                
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
                  {agency.phone}
                </div>

                <a
                  href={`/agensi/${agency.slug}`}
                  target="_blank"
                  style={{
                    display: 'block',
                    padding: '10px',
                    backgroundColor: '#F5F5F0',
                    color: '#B8936D',
                    textAlign: 'center',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  View Profile →
                </a>
              </div>
            )}

            {/* Verification Checklist */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid #E5E5E0'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '16px' }}>
                ✅ Verification Checklist
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#666' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span>☐</span>
                  <span>Verify company name on MOTAC portal</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span>☐</span>
                  <span>Check license number matches</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span>☐</span>
                  <span>Verify license is ACTIVE (not expired)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span>☐</span>
                  <span>Review uploaded documents</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span>☐</span>
                  <span>Verify contact details</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span>☐</span>
                  <span>Check SSM number validity</span>
                </div>
              </div>
            </div>

            {/* Approval Buttons */}
{request.status === 'pending' && (
  <ApprovalButtons
    requestId={request.id}
    agencyId={request.agency_id}
    motacLicenseNumber={request.motac_license_number}
    motacLicenseExpiry={request.motac_license_expiry}
  />
)}

            {/* Review History */}
            {(request.reviewed_at || request.rejection_reason || request.admin_notes) && (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #E5E5E0'
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '16px' }}>
                  📋 Review History
                </h3>

                {request.reviewed_at && (
                  <div style={{ fontSize: '14px', color: '#999' }}>
  Reviewed: {new Date(request.created_at).toLocaleDateString('ms-MY', {
    timeZone: 'Asia/Kuala_Lumpur'
  })}
</div>
                )}

                {request.rejection_reason && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#FFEBEE',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#C62828',
                    marginTop: '12px'
                  }}>
                    <strong>Rejection Reason:</strong><br/>
                    {request.rejection_reason}
                  </div>
                )}

                {request.admin_notes && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#F5F5F0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#666',
                    marginTop: '12px'
                  }}>
                    <strong>Admin Notes:</strong><br/>
                    {request.admin_notes}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('❌ Error loading verification detail:', error)
    return (
      <div style={{ padding: '40px' }}>
        <h1>Error Loading Page</h1>
        <pre style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', overflow: 'auto' }}>
          {JSON.stringify(error, null, 2)}
        </pre>
        <a 
          href="/admin/verifikasi"
          style={{
            marginTop: '20px',
            padding: '12px 24px',
            backgroundColor: '#B8936D',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '8px',
            display: 'inline-block'
          }}
        >
          ← Back to Verifications
        </a>
      </div>
    )
  }
}

// Helper component for displaying info
function InfoField({ 
  label, 
  value, 
  highlight = false 
}: { 
  label: string
  value: string | number
  highlight?: boolean
}) {
  return (
    <div>
      <div style={{ 
        fontSize: '13px', 
        color: '#999', 
        marginBottom: '6px',
        fontWeight: '600'
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: '15px', 
        color: highlight ? '#F44336' : '#2C2C2C',
        fontWeight: highlight ? '700' : '500'
      }}>
        {value}
      </div>
    </div>
  )
}