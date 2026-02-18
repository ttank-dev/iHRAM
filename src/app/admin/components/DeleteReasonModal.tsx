'use client'

import { useState } from 'react'

interface DeleteReasonModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  contentType: string
  contentTitle?: string
}

export default function DeleteReasonModal({
  isOpen,
  onClose,
  onConfirm,
  contentType,
  contentTitle
}: DeleteReasonModalProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!reason.trim()) {
      alert('Please enter a reason')
      return
    }

    setLoading(true)
    await onConfirm(reason)
    setLoading(false)
    setReason('')
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '90%'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#2C2C2C',
          marginBottom: '16px'
        }}>
          Confirm Delete
        </h2>

        <p style={{
          fontSize: '15px',
          color: '#666',
          marginBottom: '8px',
          lineHeight: '1.6'
        }}>
          You are about to delete this {contentType}:
        </p>

        {contentTitle && (
          <div style={{
            padding: '12px',
            backgroundColor: '#F5F5F0',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#2C2C2C'
            }}>
              {contentTitle}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#2C2C2C',
            marginBottom: '8px'
          }}>
            Reason for deletion <span style={{ color: 'red' }}>*</span>
          </label>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason (e.g., Inappropriate content, Spam, Violation of terms...)"
            required
            disabled={loading}
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E5E5E0',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none',
              marginBottom: '16px',
              resize: 'vertical'
            }}
          />

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 24px',
                backgroundColor: 'white',
                color: '#2C2C2C',
                border: '1px solid #E5E5E0',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !reason.trim()}
              style={{
                padding: '10px 24px',
                backgroundColor: loading || !reason.trim() ? '#CCC' : '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: loading || !reason.trim() ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}