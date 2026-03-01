'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerificationPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const action = searchParams.get('action')
  const isUpdateMode = action === 'update'

  const [loading, setLoading] = useState(false)
  const [existingRequest, setExistingRequest] = useState<any>(null)
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [agencyData, setAgencyData] = useState<any>(null)

  const [formData, setFormData] = useState({
    company_name: '', ssm_number: '', company_registration_date: '',
    owner_name: '', motac_license_number: '', motac_license_expiry: '',
    office_phone: '', office_email: '', office_address: '',
    years_in_operation: '', total_pilgrims_served: '',
    website_url: '', facebook_url: '', instagram_url: '', additional_notes: ''
  })

  const [documents, setDocuments] = useState({
    ssm_certificate: null as File | null,
    motac_license: null as File | null,
    business_license: null as File | null
  })

  useEffect(() => { fetchAgencyAndRequest() }, [])

  const fetchAgencyAndRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: agency } = await supabase.from('agencies').select('*').eq('email', user.email).single()
      if (agency) {
        setAgencyId(agency.id)
        setAgencyData(agency)
        setFormData(prev => ({
          ...prev, company_name: agency.name || '',
          office_phone: agency.phone || '', office_email: agency.email || '',
          website_url: agency.website || ''
        }))

        const { data: request } = await supabase
          .from('verification_requests').select('*').eq('agency_id', agency.id)
          .order('created_at', { ascending: false }).limit(1).single()

        if (request) {
          setExistingRequest(request)
          if (request.status === 'pending' || request.status === 'rejected' || isUpdateMode) {
            setFormData({
              company_name: request.company_name || agency.name || '',
              ssm_number: request.ssm_number || '',
              company_registration_date: request.company_registration_date || '',
              owner_name: request.owner_name || '',
              motac_license_number: request.motac_license_number || agency.motac_license_number || '',
              motac_license_expiry: request.motac_license_expiry || agency.motac_license_expiry || '',
              office_phone: request.office_phone || agency.phone || '',
              office_email: request.office_email || agency.email || '',
              office_address: request.office_address || '',
              years_in_operation: request.years_in_operation || '',
              total_pilgrims_served: request.total_pilgrims_served || '',
              website_url: request.website_url || agency.website || '',
              facebook_url: request.facebook_url || agency.facebook || '',
              instagram_url: request.instagram_url || agency.instagram || '',
              additional_notes: request.additional_notes || ''
            })
          }
        }
      }
    } catch (error) { console.error('Error:', error) }
  }

  const uploadDocument = async (file: File, type: string): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${agencyId}/${type}_${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('verification-documents').upload(fileName, file, { cacheControl: '3600', upsert: false })
    if (uploadError) throw uploadError
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('verification-documents').createSignedUrl(fileName, 31536000)
    if (urlError) throw urlError
    return signedUrlData.signedUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agencyId) { alert('❌ Agency not found'); return }
    if (!isUpdateMode && (!documents.ssm_certificate || !documents.motac_license)) {
      alert('❌ Please upload SSM Certificate and MOTAC License'); return
    }
    if (isUpdateMode && !documents.motac_license) {
      alert('❌ Please upload the renewed MOTAC License document'); return
    }
    setLoading(true)
    try {
      const ssmUrl = documents.ssm_certificate
        ? await uploadDocument(documents.ssm_certificate, 'ssm') : existingRequest?.ssm_certificate_url
      const motacUrl = documents.motac_license
        ? await uploadDocument(documents.motac_license, 'motac') : existingRequest?.motac_license_url
      const businessUrl = documents.business_license
        ? await uploadDocument(documents.business_license, 'business') : existingRequest?.business_license_url

      const { error } = await supabase.from('verification_requests').insert({
        agency_id: agencyId,
        company_name: formData.company_name, ssm_number: formData.ssm_number,
        company_registration_date: formData.company_registration_date || null,
        owner_name: formData.owner_name || null,
        motac_license_number: formData.motac_license_number,
        motac_license_expiry: formData.motac_license_expiry,
        office_phone: formData.office_phone, office_email: formData.office_email,
        office_address: formData.office_address,
        ssm_certificate_url: ssmUrl, motac_license_url: motacUrl, business_license_url: businessUrl,
        years_in_operation: formData.years_in_operation ? parseInt(formData.years_in_operation) : null,
        total_pilgrims_served: formData.total_pilgrims_served ? parseInt(formData.total_pilgrims_served) : null,
        website_url: formData.website_url || null, facebook_url: formData.facebook_url || null,
        instagram_url: formData.instagram_url || null, additional_notes: formData.additional_notes || null,
        status: 'pending'
      })
      if (error) throw error

      await supabase.from('agencies').update({ verification_status: 'pending' }).eq('id', agencyId)
      setLoading(false)
      alert(isUpdateMode
        ? '✅ License update submitted! Admin will review your updated details.'
        : '✅ Verification request submitted successfully!')
      setTimeout(() => { window.location.href = window.location.pathname }, 1000)
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`)
      setLoading(false)
    }
  }

  const set = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }))
  const setDoc = (k: string, v: File | null) => setDocuments(p => ({ ...p, [k]: v }))

  const showVerifiedSuccess = existingRequest?.status === 'approved' && agencyData?.is_verified && !isUpdateMode
  const showPending = existingRequest?.status === 'pending' && !isUpdateMode

  /* ── VERIFIED STATE ── */
  if (showVerifiedSuccess) return (
    <>
      <style>{`.vp-state{max-width:900px;width:100%;overflow:hidden}.vp-state *{box-sizing:border-box}.vp-box{border-radius:16px;padding:40px;text-align:center;border:2px solid}.vp-box-icon{font-size:56px;margin-bottom:14px}.vp-box-title{font-size:22px;font-weight:700;color:#2C2C2C;margin-bottom:10px}.vp-box-sub{font-size:14px;color:#666;margin-bottom:6px}.vp-box-meta{font-size:13px;color:#999}@media(max-width:639px){.vp-box{padding:28px 20px}.vp-box-icon{font-size:44px}.vp-box-title{font-size:19px}}`}</style>
      <div className="vp-state">
        <div className="vp-box" style={{ background: '#ECFDF5', borderColor: '#10B981' }}>
          <div className="vp-box-icon">✅</div>
          <div className="vp-box-title">Verified by MOTAC</div>
          <p className="vp-box-sub">Your agency has been successfully verified!</p>
          <div className="vp-box-meta">License: {agencyData.motac_license_number || existingRequest.motac_license_number}</div>
          <div className="vp-box-meta">Verified on: {new Date(agencyData.motac_verified_at || existingRequest.reviewed_at).toLocaleDateString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>
    </>
  )

  /* ── PENDING STATE ── */
  if (showPending) return (
    <>
      <style>{`.vp-state{max-width:900px;width:100%;overflow:hidden}.vp-state *{box-sizing:border-box}.vp-box{border-radius:16px;padding:40px;text-align:center;border:2px solid}.vp-box-icon{font-size:56px;margin-bottom:14px}.vp-box-title{font-size:22px;font-weight:700;color:#2C2C2C;margin-bottom:10px}.vp-box-sub{font-size:14px;color:#666;margin-bottom:6px}.vp-box-meta{font-size:13px;color:#999}@media(max-width:639px){.vp-box{padding:28px 20px}.vp-box-icon{font-size:44px}.vp-box-title{font-size:19px}}`}</style>
      <div className="vp-state">
        <div className="vp-box" style={{ background: '#FFFBEB', borderColor: '#F59E0B' }}>
          <div className="vp-box-icon">⏳</div>
          <div className="vp-box-title">Verification Pending</div>
          <p className="vp-box-sub">Your request is being reviewed by our admin team.</p>
          <div className="vp-box-meta">Submitted on: {new Date(existingRequest.created_at).toLocaleDateString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
      </div>
    </>
  )

  /* ── MAIN FORM ── */
  return (
    <>
      <style>{`
        .vp,.vp *{box-sizing:border-box}
        .vp{max-width:900px;width:100%;overflow:hidden}

        /* Header */
        .vp-header{margin-bottom:24px}
        .vp-title{font-size:28px;font-weight:700;color:#2C2C2C;margin:0 0 6px}
        .vp-sub{font-size:14px;color:#888;margin:0}

        /* Notice banners */
        .vp-notice{border-radius:14px;padding:20px;margin-bottom:20px;border:3px solid}
        .vp-notice-title{font-size:15px;font-weight:700;margin-bottom:10px}
        .vp-notice-list{font-size:13px;line-height:1.9}
        .vp-rejected{border-radius:12px;padding:18px;margin-bottom:20px;border:2px solid #EF4444;background:#FEE2E2}
        .vp-rejected-title{font-size:15px;font-weight:700;color:#B91C1C;margin-bottom:6px}
        .vp-rejected-sub{font-size:13px;color:#666}

        /* Cards */
        .vp-card{background:white;border-radius:14px;padding:28px;border:1px solid #E5E5E0;margin-bottom:20px}
        .vp-card-title{font-size:17px;font-weight:700;color:#2C2C2C;margin:0 0 6px}
        .vp-card-sub{font-size:13px;color:#888;margin:0 0 20px}
        .vp-card-sub a{color:#B8936D}
        .vp-divider{border:none;border-top:1px solid #f0f0ec;margin:0 0 20px}

        /* Form fields */
        .vp-2col{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .vp-field{margin-bottom:16px}
        .vp-field:last-child{margin-bottom:0}
        .vp-label{display:block;font-size:13px;font-weight:600;color:#555;margin-bottom:6px}
        .vp-req{color:#EF4444;margin-left:2px}
        .vp-tag{font-size:11px;color:#F97316;margin-left:6px;font-weight:500}
        .vp-tag-gray{font-size:11px;color:#999;margin-left:6px;font-weight:400}
        .vp-input,.vp-textarea{
          width:100%;padding:11px 13px;font-size:14px;
          border:1.5px solid #E5E5E0;border-radius:9px;
          outline:none;transition:border-color .15s;
          font-family:inherit;color:#2C2C2C;background:white;
        }
        .vp-input:focus,.vp-textarea:focus{border-color:#B8936D}
        .vp-input-orange{border:2px solid #F97316!important;background:#FFF7ED!important}
        .vp-textarea{resize:vertical;min-height:90px}
        .vp-hint{font-size:11px;color:#aaa;margin-top:4px}

        /* File inputs */
        .vp-file{
          width:100%;padding:10px 12px;font-size:13px;
          border:1.5px solid #E5E5E0;border-radius:9px;
          cursor:pointer;background:white;color:#555;
        }
        .vp-file-orange{border:2px solid #F97316!important;background:#FFF7ED!important}

        /* Submit */
        .vp-footer{display:flex;justify-content:flex-end;gap:12px;flex-wrap:wrap}
        .vp-submit{
          padding:13px 28px;color:white;border:none;border-radius:9px;
          font-size:15px;font-weight:700;cursor:pointer;transition:filter .15s;white-space:nowrap;
        }
        .vp-submit:hover:not(:disabled){filter:brightness(.92)}
        .vp-submit:disabled{opacity:.6;cursor:not-allowed}

        /* ── TABLET ── */
        @media(max-width:1023px){
          .vp-title{font-size:24px}
          .vp-card{padding:22px}
        }

        /* ── MOBILE ── */
        @media(max-width:639px){
          .vp-title{font-size:20px}
          .vp-card{padding:16px;border-radius:12px;margin-bottom:14px}
          .vp-card-title{font-size:15px}
          .vp-2col{grid-template-columns:1fr;gap:0}
          .vp-2col .vp-field{margin-bottom:14px}
          .vp-notice{padding:16px}
          .vp-notice-title{font-size:14px}
          .vp-footer{justify-content:stretch}
          .vp-submit{width:100%;padding:14px;font-size:15px}
        }

        /* ── SMALL MOBILE ── */
        @media(max-width:380px){
          .vp-card{padding:14px}
          .vp-title{font-size:18px}
        }
      `}</style>

      <div className="vp">

        {/* Header */}
        <div className="vp-header">
          <h1 className="vp-title">
            {isUpdateMode ? '🔄 Update License Verification' : '✅ MOTAC Verification'}
          </h1>
          <p className="vp-sub">
            {isUpdateMode
              ? 'Update your license details with the renewed MOTAC license information'
              : 'Get verified to build trust with pilgrims and display the verified badge'}
          </p>
        </div>

        {/* Update mode notice */}
        {isUpdateMode && (
          <div className="vp-notice" style={{ background: '#FFF7ED', borderColor: '#F97316' }}>
            <div className="vp-notice-title" style={{ color: '#C2410C' }}>📝 Updating Your License Verification</div>
            <div className="vp-notice-list" style={{ color: '#9A3412' }}>
              • Your current data has been <strong>pre-filled</strong> below<br />
              • Update the <strong>License Expiry Date</strong> with your renewed license<br />
              • <strong>Re-upload your MOTAC License document</strong> (new version — required)<br />
              • SSM Certificate can be re-uploaded if needed (optional)<br />
              • Admin will review and approve your updated license
            </div>
          </div>
        )}

        {/* Rejected notice */}
        {existingRequest?.status === 'rejected' && !isUpdateMode && (
          <div className="vp-rejected">
            <div className="vp-rejected-title">❌ Previous Request Rejected</div>
            <p className="vp-rejected-sub">Reason: {existingRequest.rejection_reason || 'No reason provided'}</p>
            <p className="vp-rejected-sub" style={{ marginTop: 6 }}>Please correct the issues and resubmit below.</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* ── Company Details ── */}
          <div className="vp-card">
            <div className="vp-card-title">📋 Company Details</div>
            <hr className="vp-divider" />
            <div className="vp-2col">
              <div className="vp-field">
                <label className="vp-label">Company Name <span className="vp-req">*</span></label>
                <input type="text" required className="vp-input"
                  value={formData.company_name} onChange={e => set('company_name', e.target.value)} />
              </div>
              <div className="vp-field">
                <label className="vp-label">SSM Number <span className="vp-req">*</span></label>
                <input type="text" required className="vp-input"
                  value={formData.ssm_number} onChange={e => set('ssm_number', e.target.value)}
                  placeholder="e.g. 202301234567" />
              </div>
              <div className="vp-field">
                <label className="vp-label">Registration Date</label>
                <input type="date" className="vp-input"
                  value={formData.company_registration_date} onChange={e => set('company_registration_date', e.target.value)} />
              </div>
              <div className="vp-field">
                <label className="vp-label">Owner / Director Name</label>
                <input type="text" className="vp-input"
                  value={formData.owner_name} onChange={e => set('owner_name', e.target.value)} />
              </div>
            </div>
          </div>

          {/* ── MOTAC License ── */}
          <div className="vp-card">
            <div className="vp-card-title">🏛️ MOTAC License</div>
            <p className="vp-card-sub">
              Verify at: <a href="https://www.motac.gov.my/kategori-semakan-new/agensi-pelancongan-umrah/" target="_blank">MOTAC Portal →</a>
            </p>
            <hr className="vp-divider" style={{ margin: '0 0 20px' }} />
            <div className="vp-2col">
              <div className="vp-field">
                <label className="vp-label">License Number <span className="vp-req">*</span></label>
                <input type="text" required className="vp-input"
                  value={formData.motac_license_number} onChange={e => set('motac_license_number', e.target.value)}
                  placeholder="e.g. KPL/LN 1234" />
              </div>
              <div className="vp-field">
                <label className="vp-label">
                  License Expiry Date <span className="vp-req">*</span>
                  {isUpdateMode && <span className="vp-tag">← Update with new date</span>}
                </label>
                <input type="date" required
                  className={`vp-input${isUpdateMode ? ' vp-input-orange' : ''}`}
                  value={formData.motac_license_expiry} onChange={e => set('motac_license_expiry', e.target.value)} />
              </div>
            </div>
          </div>

          {/* ── Contact Details ── */}
          <div className="vp-card">
            <div className="vp-card-title">📞 Contact Details</div>
            <hr className="vp-divider" />
            <div className="vp-2col">
              <div className="vp-field">
                <label className="vp-label">Office Phone <span className="vp-req">*</span></label>
                <input type="tel" required className="vp-input"
                  value={formData.office_phone} onChange={e => set('office_phone', e.target.value)}
                  placeholder="+60 12-345 6789" />
              </div>
              <div className="vp-field">
                <label className="vp-label">Office Email <span className="vp-req">*</span></label>
                <input type="email" required className="vp-input"
                  value={formData.office_email} onChange={e => set('office_email', e.target.value)}
                  placeholder="info@company.com" />
              </div>
            </div>
            <div className="vp-field" style={{ marginBottom: 0 }}>
              <label className="vp-label">Office Address <span className="vp-req">*</span></label>
              <textarea required className="vp-textarea"
                value={formData.office_address} onChange={e => set('office_address', e.target.value)}
                placeholder="Full office address" />
            </div>
          </div>

          {/* ── Documents ── */}
          <div className="vp-card">
            <div className="vp-card-title">📄 Document Upload</div>
            <hr className="vp-divider" />
            <div className="vp-field">
              <label className="vp-label">
                SSM Certificate
                {!isUpdateMode && <span className="vp-req">*</span>}
                {isUpdateMode && <span className="vp-tag-gray">(Optional — only if updated)</span>}
              </label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                required={!existingRequest && !isUpdateMode}
                className="vp-file"
                onChange={e => setDoc('ssm_certificate', e.target.files?.[0] || null)} />
              <div className="vp-hint">PDF, JPG or PNG — max 5MB</div>
            </div>
            <div className="vp-field">
              <label className="vp-label">
                MOTAC License <span className="vp-req">*</span>
                {isUpdateMode && <span className="vp-tag">← Upload renewed license (required)</span>}
              </label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                required={!existingRequest || isUpdateMode}
                className={`vp-file${isUpdateMode ? ' vp-file-orange' : ''}`}
                onChange={e => setDoc('motac_license', e.target.files?.[0] || null)} />
              <div className="vp-hint">PDF, JPG or PNG — max 5MB</div>
            </div>
            <div className="vp-field" style={{ marginBottom: 0 }}>
              <label className="vp-label">Business License <span className="vp-tag-gray">(Optional)</span></label>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                className="vp-file"
                onChange={e => setDoc('business_license', e.target.files?.[0] || null)} />
            </div>
          </div>

          {/* ── Submit ── */}
          <div className="vp-footer">
            <button type="submit" disabled={loading}
              className="vp-submit"
              style={{ background: loading ? '#ccc' : isUpdateMode ? '#F97316' : '#B8936D' }}>
              {loading ? '⏳ Submitting...'
                : isUpdateMode ? '🔄 Submit Updated License'
                : '📤 Submit Verification Request'}
            </button>
          </div>

        </form>
      </div>
    </>
  )
}