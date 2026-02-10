'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface ApprovalButtonsProps {
  requestId: string
  agencyId: string
  motacLicenseNumber: string
  motacLicenseExpiry: string
}

export default function ApprovalButtons({
  requestId,
  agencyId,
  motacLicenseNumber,
  motacLicenseExpiry
}: ApprovalButtonsProps) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  // 🔥 NEW: Calculate license status based on expiry date
  const calculateLicenseStatus = (expiryDate: string): string => {
    // Parse DD/MM/YYYY format
    const [day, month, year] = expiryDate.split('/')
    const expiry = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (daysLeft < 0) return 'expired'
    if (daysLeft <= 30) return 'expiring_critical'
    if (daysLeft <= 90) return 'expiring_soon'
    return 'active'
  }

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this verification request?')) {
      return
    }

    setLoading(true)

    try {
      console.log('🔵 Starting approval process...')

      // 🔥 NEW: Calculate license status from new expiry date
      const newLicenseStatus = calculateLicenseStatus(motacLicenseExpiry)
      console.log('🔵 Calculated license status:', newLicenseStatus)

      // Step 1: Update verification request status
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || null
        })
        .eq('id', requestId)

      if (requestError) throw requestError
      console.log('✅ Request approved')

      // Step 2: Update agency with verification details + NEW LICENSE STATUS
      const { error: agencyError } = await supabase
        .from('agencies')
        .update({
          is_verified: true,
          verification_status: 'approved',
          motac_verified_at: new Date().toISOString(),
          motac_license_number: motacLicenseNumber,
          motac_license_expiry: motacLicenseExpiry,
          license_status: newLicenseStatus  // 🔥 NEW: Set calculated status
        })
        .eq('id', agencyId)

      if (agencyError) throw agencyError
      console.log('✅ Agency verified and license status updated')

      alert('✅ Verification approved successfully!')
      router.refresh()
      window.location.href = '/admin/verifikasi'
      
    } catch (error: any) {
      console.error('❌ Error:', error)
      alert(`❌ Error: ${error.message}`)
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    if (!confirm('Are you sure you want to reject this verification request?')) {
      return
    }

    setLoading(true)

    try {
      console.log('🔵 Rejecting request...')

      // Update verification request
      const { error: requestError } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
          admin_notes: adminNotes || null
        })
        .eq('id', requestId)

      if (requestError) throw requestError

      // Update agency status
      const { error: agencyError } = await supabase
        .from('agencies')
        .update({
          verification_status: 'rejected'
        })
        .eq('id', agencyId)

      if (agencyError) throw agencyError

      console.log('✅ Request rejected')

      alert('✅ Verification rejected')
      router.refresh()
      window.location.href = '/admin/verifikasi'
      
    } catch (error: any) {
      console.error('❌ Error:', error)
      alert(`❌ Error: ${error.message}`)
      setLoading(false)
    }
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #E5E5E0'
    }}>
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '16px' }}>
        ⚡ Actions
      </h3>

      {!showRejectForm ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Admin Notes (Optional for both approve/reject) */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
              Admin Notes (Optional)
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add any internal notes..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            onClick={handleApprove}
            disabled={loading}
            style={{
              padding: '12px 20px',
              backgroundColor: loading ? '#ccc' : '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Processing...' : '✅ Approve Verification'}
          </button>

          <button
            onClick={() => setShowRejectForm(true)}
            disabled={loading}
            style={{
              padding: '12px 20px',
              backgroundColor: 'white',
              color: '#EF4444',
              border: '2px solid #EF4444',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ❌ Reject Verification
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '8px' }}>
              Rejection Reason <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explain why this request is being rejected..."
              rows={4}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #EF4444',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleReject}
              disabled={loading || !rejectionReason.trim()}
              style={{
                flex: 1,
                padding: '12px 20px',
                backgroundColor: loading || !rejectionReason.trim() ? '#ccc' : '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: loading || !rejectionReason.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Processing...' : 'Confirm Rejection'}
            </button>

            <button
              onClick={() => {
                setShowRejectForm(false)
                setRejectionReason('')
              }}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 20px',
                backgroundColor: 'white',
                color: '#666',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}