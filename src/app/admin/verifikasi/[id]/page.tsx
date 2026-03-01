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

    const { isAdmin } = await checkAdminAccess()
    if (!isAdmin) redirect('/admin-login')

    const supabase = await createClient()

    const { data: request } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('id', id)
      .single()

    if (!request) {
      return (
        <div className="vd-empty">
          <h2>Request Not Found</h2>
          <p>ID: {id}</p>
          <a href="/admin/verifikasi" className="vd-back-btn">← Back</a>
          <style dangerouslySetInnerHTML={{ __html: `
            .vd-empty { padding: 60px 20px; text-align: center; }
            .vd-empty h2 { font-size: 22px; margin-bottom: 12px; color: #2C2C2C; }
            .vd-empty p { color: #888; margin-bottom: 24px; }
            .vd-back-btn { padding: 12px 24px; background: #B8936D; color: white; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600; }
          `}} />
        </div>
      )
    }

    const { data: agency } = await supabase
      .from('agencies')
      .select('id, name, slug, logo_url, email, phone')
      .eq('id', request.agency_id)
      .single()

    const isExpired = new Date(request.motac_license_expiry) < new Date()

    const statusMap: Record<string, { label: string; bg: string; color: string }> = {
      pending: { label: '⏳ PENDING REVIEW', bg: '#FFF9E6', color: '#F57C00' },
      approved: { label: '✅ APPROVED', bg: '#E8F5E9', color: '#2E7D32' },
      rejected: { label: '❌ REJECTED', bg: '#FFEBEE', color: '#C62828' },
    }
    const status = statusMap[request.status] || statusMap.pending

    const documents = [
      { label: '📋 SSM Certificate', url: request.ssm_certificate_url },
      { label: '🏛️ MOTAC License', url: request.motac_license_url },
      { label: '📜 Business License', url: request.business_license_url },
    ].filter(d => d.url)

    const checklist = [
      'Verify company name on MOTAC portal',
      'Check license number matches',
      'Ensure license is ACTIVE (not expired)',
      'Check uploaded documents',
      'Verify contact information',
      'Check SSM number validity',
    ]

    return (
      <>
        <div className="vd-page">

          {/* ── HEADER ── */}
          <div className="vd-header">
            <a href="/admin/verifikasi" className="vd-breadcrumb">← Back to Verifications</a>
            <h1 className="vd-title">Review Verification Request</h1>
            <div className="vd-status-badge" style={{ background: status.bg, color: status.color }}>
              {status.label}
            </div>
          </div>

          {/* ── CONTENT GRID ── */}
          <div className="vd-grid">

            {/* LEFT COLUMN */}
            <div className="vd-left">

              {/* Company Details */}
              <div className="vd-card">
                <h3 className="vd-card-title">📋 Company Details</h3>
                <div className="vd-fields-2col">
                  <InfoField label="Company Name" value={request.company_name} />
                  <InfoField label="No. SSM" value={request.ssm_number} />
                  <InfoField
                    label="Registration Date"
                    value={request.company_registration_date ? new Date(request.company_registration_date).toLocaleDateString('en-MY') : '-'}
                  />
                  <InfoField label="Owner / Director" value={request.owner_name || '-'} />
                </div>
              </div>

              {/* MOTAC License */}
              <div className="vd-card">
                <div className="vd-card-header-row">
                  <h3 className="vd-card-title">🏛️ MOTAC License</h3>
                  <a
                    href="https://www.motac.gov.my/kategori-semakan-new/agensi-pelancongan-umrah/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="vd-motac-link"
                  >
                    Check MOTAC Portal →
                  </a>
                </div>
                <div className="vd-fields-2col">
                  <InfoField label="License Number" value={request.motac_license_number} />
                  <InfoField
                    label="Expiry Date"
                    value={new Date(request.motac_license_expiry).toLocaleDateString('en-MY')}
                    highlight={isExpired}
                  />
                </div>
                {isExpired && (
                  <div className="vd-expired-warning">
                    ⚠️ LICENSE EXPIRED — DO NOT APPROVE
                  </div>
                )}
              </div>

              {/* Contact */}
              <div className="vd-card">
                <h3 className="vd-card-title">📞 Contact Information</h3>
                <div className="vd-fields-stack">
                  <InfoField label="Phone" value={request.office_phone} />
                  <InfoField label="Email" value={request.office_email} />
                  <InfoField label="Address" value={request.office_address} />
                </div>
              </div>

              {/* Documents */}
              <div className="vd-card">
                <h3 className="vd-card-title">📄 Uploaded Documents</h3>
                {documents.length > 0 ? (
                  <div className="vd-docs-list">
                    {documents.map((doc, i) => (
                      <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="vd-doc-link">
                        <span>{doc.label}</span>
                        <span className="vd-doc-view">View →</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="vd-no-docs">No documents uploaded</div>
                )}
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="vd-right">

              {/* Agency Info */}
              {agency && (
                <div className="vd-card">
                  <h3 className="vd-card-title-sm">Agency Info</h3>
                  <div className="vd-agency-avatar" style={{
                    backgroundImage: agency.logo_url ? `url(${agency.logo_url})` : 'none',
                    backgroundColor: agency.logo_url ? 'white' : '#B8936D',
                  }}>
                    {!agency.logo_url && agency.name.charAt(0)}
                  </div>
                  <div className="vd-agency-name">{agency.name}</div>
                  <div className="vd-agency-contact">{agency.email}</div>
                  <div className="vd-agency-contact">{agency.phone}</div>
                  <a href={`/agensi/${agency.slug}`} target="_blank" rel="noopener noreferrer" className="vd-profile-link">
                    View Profile →
                  </a>
                </div>
              )}

              {/* Checklist */}
              <div className="vd-card">
                <h3 className="vd-card-title-sm">✅ Review Checklist</h3>
                <div className="vd-checklist">
                  {checklist.map((item, i) => (
                    <label key={i} className="vd-check-item">
                      <input type="checkbox" className="vd-checkbox" />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Approval */}
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
                <div className="vd-card">
                  <h3 className="vd-card-title-sm">📋 Review History</h3>
                  {request.reviewed_at && (
                    <div className="vd-review-date">
                      Reviewed: {new Date(request.reviewed_at).toLocaleDateString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })}
                    </div>
                  )}
                  {request.rejection_reason && (
                    <div className="vd-rejection-box">
                      <strong>Rejection Reason:</strong><br />{request.rejection_reason}
                    </div>
                  )}
                  {request.admin_notes && (
                    <div className="vd-notes-box">
                      <strong>Admin Notes:</strong><br />{request.admin_notes}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── STYLES ── */}
        <style dangerouslySetInnerHTML={{ __html: `
          .vd-page { max-width: 1200px; margin: 0 auto; }

          /* Header */
          .vd-header { margin-bottom: 28px; }
          .vd-breadcrumb { font-size: 14px; color: #B8936D; text-decoration: none; display: inline-block; margin-bottom: 16px; transition: opacity 0.15s; }
          .vd-breadcrumb:hover { opacity: 0.7; }
          .vd-title { font-size: 26px; font-weight: 700; color: #2C2C2C; margin: 0 0 12px; }
          .vd-status-badge { display: inline-block; padding: 6px 18px; border-radius: 20px; font-size: 13px; font-weight: 700; }

          /* Grid */
          .vd-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
          .vd-left, .vd-right { display: flex; flex-direction: column; gap: 16px; }

          /* Cards */
          .vd-card { background: white; border-radius: 12px; padding: 24px; border: 1px solid #E5E5E0; }
          .vd-card-title { font-size: 18px; font-weight: 700; color: #2C2C2C; margin: 0 0 20px; }
          .vd-card-title-sm { font-size: 16px; font-weight: 700; color: #2C2C2C; margin: 0 0 16px; }
          .vd-card-header-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
          .vd-card-header-row .vd-card-title { margin: 0; }
          .vd-motac-link { font-size: 13px; color: #B8936D; text-decoration: none; font-weight: 600; }
          .vd-motac-link:hover { text-decoration: underline; }

          /* Fields */
          .vd-fields-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
          .vd-fields-stack { display: flex; flex-direction: column; gap: 14px; }
          .vd-field-label { font-size: 12px; color: #999; font-weight: 600; margin-bottom: 4px; letter-spacing: 0.3px; }
          .vd-field-value { font-size: 15px; color: #2C2C2C; font-weight: 500; word-break: break-word; }
          .vd-field-value.danger { color: #F44336; font-weight: 700; }

          /* Expired warning */
          .vd-expired-warning {
            margin-top: 16px; padding: 12px 16px; background: #FFEBEE; border: 1px solid #F44336;
            border-radius: 8px; color: #C62828; font-size: 14px; font-weight: 700;
          }

          /* Documents */
          .vd-docs-list { display: flex; flex-direction: column; gap: 8px; }
          .vd-doc-link {
            padding: 14px 16px; background: #F5F5F0; border-radius: 8px; text-decoration: none;
            display: flex; align-items: center; justify-content: space-between;
            transition: background 0.15s;
          }
          .vd-doc-link:hover { background: #eeeee8; }
          .vd-doc-link span:first-child { font-size: 14px; color: #2C2C2C; font-weight: 500; }
          .vd-doc-view { font-size: 13px; color: #B8936D; font-weight: 600; }
          .vd-no-docs { padding: 20px; text-align: center; color: #999; font-size: 14px; }

          /* Agency sidebar */
          .vd-agency-avatar {
            width: 64px; height: 64px; border-radius: 12px; display: flex;
            align-items: center; justify-content: center; color: white;
            font-size: 28px; font-weight: 700; margin-bottom: 14px;
            background-size: cover; background-position: center;
          }
          .vd-agency-name { font-size: 17px; font-weight: 700; color: #2C2C2C; margin-bottom: 6px; }
          .vd-agency-contact { font-size: 13px; color: #888; margin-bottom: 3px; word-break: break-word; }
          .vd-profile-link {
            display: block; padding: 10px; background: #F5F5F0; color: #B8936D;
            text-align: center; border-radius: 8px; text-decoration: none;
            font-size: 14px; font-weight: 600; margin-top: 14px;
            transition: background 0.15s;
          }
          .vd-profile-link:hover { background: #e8e8e3; }

          /* Checklist */
          .vd-checklist { display: flex; flex-direction: column; gap: 10px; }
          .vd-check-item { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: #555; cursor: pointer; line-height: 1.4; }
          .vd-checkbox {
            width: 18px; height: 18px; margin-top: 1px; flex-shrink: 0;
            accent-color: #B8936D; cursor: pointer;
          }

          /* Review history */
          .vd-review-date { font-size: 13px; color: #999; margin-bottom: 10px; }
          .vd-rejection-box { padding: 12px; background: #FFEBEE; border-radius: 8px; font-size: 14px; color: #C62828; margin-bottom: 10px; line-height: 1.5; }
          .vd-notes-box { padding: 12px; background: #F5F5F0; border-radius: 8px; font-size: 14px; color: #666; line-height: 1.5; }

          /* ── RESPONSIVE ── */
          @media (max-width: 1023px) {
            .vd-grid { grid-template-columns: 1fr; }
            .vd-right { order: -1; }
          }

          @media (max-width: 639px) {
            .vd-title { font-size: 22px; }
            .vd-card { padding: 18px; }
            .vd-fields-2col { grid-template-columns: 1fr; gap: 14px; }
            .vd-agency-avatar { width: 52px; height: 52px; font-size: 22px; }
          }
        `}} />
      </>
    )
  } catch (error) {
    console.error('❌ Error loading verification detail:', error)
    return (
      <div style={{ padding: '40px' }}>
        <h1 style={{ marginBottom: 16 }}>Error Loading Page</h1>
        <pre style={{ background: '#f5f5f5', padding: 20, borderRadius: 8, overflow: 'auto', fontSize: 13 }}>
          {JSON.stringify(error, null, 2)}
        </pre>
        <a href="/admin/verifikasi" style={{ marginTop: 20, padding: '12px 24px', background: '#B8936D', color: 'white', textDecoration: 'none', borderRadius: 8, display: 'inline-block', fontWeight: 600 }}>
          ← Back
        </a>
      </div>
    )
  }
}

function InfoField({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div>
      <div className="vd-field-label">{label}</div>
      <div className={`vd-field-value ${highlight ? 'danger' : ''}`}>{value}</div>
    </div>
  )
}