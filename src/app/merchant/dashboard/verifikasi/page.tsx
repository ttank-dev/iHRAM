'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerificationPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 🔥 NEW: Check for update mode
  const action = searchParams.get('action')
  const isUpdateMode = action === 'update'
  
  const [loading, setLoading] = useState(false)
  const [existingRequest, setExistingRequest] = useState<any>(null)
  const [agencyId, setAgencyId] = useState<string | null>(null)
  const [agencyData, setAgencyData] = useState<any>(null)
  
  const [formData, setFormData] = useState({
    company_name: '',
    ssm_number: '',
    company_registration_date: '',
    owner_name: '',
    motac_license_number: '',
    motac_license_expiry: '',
    office_phone: '',
    office_email: '',
    office_address: '',
    years_in_operation: '',
    total_pilgrims_served: '',
    website_url: '',
    facebook_url: '',
    instagram_url: '',
    additional_notes: ''
  })
  
  const [documents, setDocuments] = useState({
    ssm_certificate: null as File | null,
    motac_license: null as File | null,
    business_license: null as File | null
  })

  useEffect(() => {
    fetchAgencyAndRequest()
  }, [])

  const fetchAgencyAndRequest = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Fetch agency with cache bypass
      const { data: agency } = await supabase
        .from('agencies')
        .select('*')
        .eq('email', user.email)
        .single()

      if (agency) {
        setAgencyId(agency.id)
        setAgencyData(agency)
        
        setFormData(prev => ({
          ...prev,
          company_name: agency.name || '',
          office_phone: agency.phone || '',
          office_email: agency.email || '',
          website_url: agency.website || ''
        }))

        // Fetch latest verification request
        const { data: request } = await supabase
          .from('verification_requests')
          .select('*')
          .eq('agency_id', agency.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (request) {
          setExistingRequest(request)
          
          // 🔥 UPDATED: Pre-fill form if pending, rejected, OR update mode
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
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const uploadDocument = async (file: File, type: string): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${agencyId}/${type}_${Date.now()}.${fileExt}`
      
      console.log('🔵 Uploading:', fileName)
      
      const { error: uploadError, data } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('❌ Upload error:', uploadError)
        throw uploadError
      }

      console.log('✅ Upload success:', data)

      // Use signed URL instead of public URL
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('verification-documents')
        .createSignedUrl(fileName, 31536000) // 1 year

      if (urlError) throw urlError

      return signedUrlData.signedUrl
    } catch (error) {
      console.error('❌ Upload failed:', error)
      throw error
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!agencyId) {
      alert('❌ Agency not found')
      return
    }

    // 🔥 UPDATED: For update mode, documents are optional if already verified
    if (!isUpdateMode && (!documents.ssm_certificate || !documents.motac_license)) {
      alert('❌ Please upload SSM Certificate and MOTAC License')
      return
    }

    // For update mode, require at least MOTAC license re-upload
    if (isUpdateMode && !documents.motac_license) {
      alert('❌ Please upload the renewed MOTAC License document')
      return
    }

    setLoading(true)

    try {
      console.log('🔵 Starting upload process...')
      
      // Upload documents (use existing URLs if not re-uploaded)
      const ssmUrl = documents.ssm_certificate 
        ? await uploadDocument(documents.ssm_certificate, 'ssm')
        : existingRequest?.ssm_certificate_url
        
      const motacUrl = documents.motac_license
        ? await uploadDocument(documents.motac_license, 'motac')
        : existingRequest?.motac_license_url
        
      const businessUrl = documents.business_license 
        ? await uploadDocument(documents.business_license, 'business')
        : existingRequest?.business_license_url

      console.log('🔵 Documents uploaded, saving to database...')

      const { error } = await supabase
        .from('verification_requests')
        .insert({
          agency_id: agencyId,
          company_name: formData.company_name,
          ssm_number: formData.ssm_number,
          company_registration_date: formData.company_registration_date || null,
          owner_name: formData.owner_name || null,
          motac_license_number: formData.motac_license_number,
          motac_license_expiry: formData.motac_license_expiry,
          office_phone: formData.office_phone,
          office_email: formData.office_email,
          office_address: formData.office_address,
          ssm_certificate_url: ssmUrl,
          motac_license_url: motacUrl,
          business_license_url: businessUrl,
          years_in_operation: formData.years_in_operation ? parseInt(formData.years_in_operation) : null,
          total_pilgrims_served: formData.total_pilgrims_served ? parseInt(formData.total_pilgrims_served) : null,
          website_url: formData.website_url || null,
          facebook_url: formData.facebook_url || null,
          instagram_url: formData.instagram_url || null,
          additional_notes: formData.additional_notes || null,
          status: 'pending'
        })

      if (error) {
        console.error('❌ Database error:', error)
        throw error
      }

      console.log('🔵 Updating agency status...')

      await supabase
        .from('agencies')
        .update({ verification_status: 'pending' })
        .eq('id', agencyId)

      console.log('✅ All done!')
      
      setLoading(false)

      // 🔥 UPDATED: Different success message for update mode
      if (isUpdateMode) {
        alert('✅ License update submitted successfully! Admin will review your updated license details.')
      } else {
        alert('✅ Verification request submitted successfully!')
      }
      
      // Force reload with delay
      setTimeout(() => {
        window.location.href = window.location.pathname
      }, 1000)
      
    } catch (error: any) {
      console.error('❌ Error:', error)
      alert(`❌ Error: ${error.message}`)
      setLoading(false)
    }
  }

  // 🔥 UPDATED: Only show success if NOT in update mode
  const showVerifiedSuccess = existingRequest?.status === 'approved' 
    && agencyData?.is_verified 
    && !isUpdateMode

  if (showVerifiedSuccess) {
    return (
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#E8F5E9',
          border: '2px solid #4CAF50',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px' }}>
            Verified by MOTAC
          </h2>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>
            Your agency has been successfully verified!
          </p>
          <div style={{ fontSize: '14px', color: '#999' }}>
            License: {agencyData.motac_license_number || existingRequest.motac_license_number}
          </div>
          <div style={{ fontSize: '14px', color: '#999' }}>
            Verified on: {new Date(agencyData.motac_verified_at || existingRequest.reviewed_at).toLocaleDateString('ms-MY', {
              timeZone: 'Asia/Kuala_Lumpur',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    )
  }

  if (existingRequest?.status === 'pending' && !isUpdateMode) {
    return (
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#FFF9E6',
          border: '2px solid #FFC107',
          borderRadius: '16px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⏳</div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px' }}>
            Verification Pending
          </h2>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '8px' }}>
            Your verification request is being reviewed by our admin team.
          </p>
          <div style={{ fontSize: '14px', color: '#999' }}>
            Submitted on: {new Date(existingRequest.created_at).toLocaleDateString('ms-MY', {
              timeZone: 'Asia/Kuala_Lumpur',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
          {isUpdateMode ? '🔄 Update License Verification' : '✅ MOTAC Verification'}
        </h1>
        <p style={{ fontSize: '16px', color: '#666' }}>
          {isUpdateMode 
            ? 'Update your license details with the renewed MOTAC license information' 
            : 'Get verified to build trust with customers and display the verified badge'
          }
        </p>
      </div>

      {/* 🔥 NEW: Update mode notice */}
      {isUpdateMode && (
        <div style={{
          backgroundColor: '#FFF7ED',
          border: '3px solid #F97316',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#C2410C', marginBottom: '12px' }}>
            📝 Updating Your License Verification
          </div>
          <div style={{ fontSize: '14px', color: '#9A3412', lineHeight: '1.8' }}>
            • Your current data has been <strong>pre-filled</strong> below<br/>
            • Update the <strong>License Expiry Date</strong> with your renewed license<br/>
            • <strong>Re-upload your MOTAC License document</strong> (new version - required)<br/>
            • SSM Certificate can be re-uploaded if needed (optional)<br/>
            • Other details can be updated as needed<br/>
            • Your previous verification history will be preserved<br/>
            • Admin will review and approve your updated license
          </div>
        </div>
      )}

      {existingRequest?.status === 'rejected' && !isUpdateMode && (
        <div style={{
          backgroundColor: '#FFEBEE',
          border: '2px solid #F44336',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#D32F2F', marginBottom: '8px' }}>
            ❌ Previous Request Rejected
          </div>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            Reason: {existingRequest.rejection_reason || 'No reason provided'}
          </p>
          <p style={{ fontSize: '14px', color: '#999' }}>
            Please correct the issues and resubmit below.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
            📋 Company Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                Company Name <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                style={{
                  width: '90%',
                  padding: '12px',
                  border: '1px solid #E5E5E0',
                  borderRadius: '8px',
                  fontSize: '15px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                SSM Number <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.ssm_number}
                onChange={(e) => setFormData({...formData, ssm_number: e.target.value})}
                placeholder="e.g., 202301234567"
                style={{
                  width: '90%',
                  padding: '12px',
                  border: '1px solid #E5E5E0',
                  borderRadius: '8px',
                  fontSize: '15px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                Registration Date
              </label>
              <input
                type="date"
                value={formData.company_registration_date}
                onChange={(e) => setFormData({...formData, company_registration_date: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #E5E5E0',
                  borderRadius: '8px',
                  fontSize: '15px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                Owner / Director Name
              </label>
              <input
                type="text"
                value={formData.owner_name}
                onChange={(e) => setFormData({...formData, owner_name: e.target.value})}
                style={{
                  width: '90%',
                  padding: '12px',
                  border: '1px solid #E5E5E0',
                  borderRadius: '8px',
                  fontSize: '15px'
                }}
              />
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
            🏛️ MOTAC License
          </h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '24px' }}>
            Verify at: <a href="https://www.motac.gov.my/kategori-semakan-new/agensi-pelancongan-umrah/" target="_blank" style={{ color: '#B8936D' }}>
              MOTAC Portal
            </a>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                MOTAC License Number <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                required
                value={formData.motac_license_number}
                onChange={(e) => setFormData({...formData, motac_license_number: e.target.value})}
                placeholder="e.g., KPL/LN 1234"
                style={{
                  width: '90%',
                  padding: '12px',
                  border: '1px solid #E5E5E0',
                  borderRadius: '8px',
                  fontSize: '15px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                License Expiry Date <span style={{ color: 'red' }}>*</span>
                {isUpdateMode && (
                  <span style={{ color: '#F97316', fontSize: '13px', marginLeft: '8px' }}>
                    ← Update with new date
                  </span>
                )}
              </label>
              <input
                type="date"
                required
                value={formData.motac_license_expiry}
                onChange={(e) => setFormData({...formData, motac_license_expiry: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: isUpdateMode ? '2px solid #F97316' : '1px solid #E5E5E0',
                  borderRadius: '8px',
                  fontSize: '15px',
                  backgroundColor: isUpdateMode ? '#FFF7ED' : 'white'
                }}
              />
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
            📞 Contact Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                Office Phone <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.office_phone}
                onChange={(e) => setFormData({...formData, office_phone: e.target.value})}
                placeholder="+60 12-345 6789"
                style={{
                  width: '90%',
                  padding: '12px',
                  border: '1px solid #E5E5E0',
                  borderRadius: '8px',
                  fontSize: '15px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                Office Email <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="email"
                required
                value={formData.office_email}
                onChange={(e) => setFormData({...formData, office_email: e.target.value})}
                placeholder="info@company.com"
                style={{
                  width: '90%',
                  padding: '12px',
                  border: '1px solid #E5E5E0',
                  borderRadius: '8px',
                  fontSize: '15px'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
              Office Address <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              required
              value={formData.office_address}
              onChange={(e) => setFormData({...formData, office_address: e.target.value})}
              rows={3}
              placeholder="Full office address"
              style={{
                width: '95%',
                padding: '12px',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                fontSize: '15px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          marginBottom: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '24px' }}>
            📄 Documents Upload
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                SSM Certificate {!isUpdateMode && <span style={{ color: 'red' }}>*</span>}
                {isUpdateMode && (
                  <span style={{ fontSize: '13px', color: '#999', marginLeft: '8px' }}>
                    (Optional - only if updated)
                  </span>
                )}
              </label>
              <input
                type="file"
                required={!existingRequest && !isUpdateMode}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setDocuments({...documents, ssm_certificate: e.target.files?.[0] || null})}
                style={{
                  width: '50%',
                  padding: '12px',
                  border: '1px solid #E5E5E0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                PDF, JPG, or PNG (Max 5MB)
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                MOTAC License <span style={{ color: 'red' }}>*</span>
                {isUpdateMode && (
                  <span style={{ color: '#F97316', fontSize: '13px', marginLeft: '8px' }}>
                    ← Upload renewed license (Required)
                  </span>
                )}
              </label>
              <input
                type="file"
                required={!existingRequest || isUpdateMode}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setDocuments({...documents, motac_license: e.target.files?.[0] || null})}
                style={{
                  width: '50%',
                  padding: '12px',
                  border: isUpdateMode ? '2px solid #F97316' : '1px solid #E5E5E0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: isUpdateMode ? '#FFF7ED' : 'white'
                }}
              />
              <p style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                PDF, JPG, or PNG (Max 5MB)
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
                Business License (Optional)
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setDocuments({...documents, business_license: e.target.files?.[0] || null})}
                style={{
                  width: '50%',
                  padding: '12px',
                  border: '1px solid #E5E5E0',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px 32px',
              backgroundColor: loading ? '#ccc' : (isUpdateMode ? '#F97316' : '#B8936D'),
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading 
              ? 'Submitting...' 
              : isUpdateMode 
                ? '🔄 Submit Updated License' 
                : '📤 Submit Verification Request'
            }
          </button>
        </div>

      </form>
    </div>
  )
}