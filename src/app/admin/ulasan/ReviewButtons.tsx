'use client'

import { useState } from 'react'
import { approveReview, rejectReview } from './actions'

export default function ReviewButtons({ reviewId }: { reviewId: string }) {
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    if (!confirm('Approve ulasan ini?')) return

    setLoading(true)
    const result = await approveReview(reviewId)
    
    if (result.error) {
      alert('Error: ' + result.error)
    }
    
    setLoading(false)
  }

  const handleReject = async () => {
    if (!confirm('Reject ulasan ini? Ulasan akan dipadam.')) return

    setLoading(true)
    const result = await rejectReview(reviewId)
    
    if (result.error) {
      alert('Error: ' + result.error)
    }
    
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button 
        onClick={handleApprove}
        disabled={loading}
        style={{ 
          padding: '8px 16px', 
          backgroundColor: loading ? '#666' : '#10B981', 
          color: 'white', 
          border: 'none', 
          borderRadius: '6px', 
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1
        }}
      >
        {loading ? 'Processing...' : 'Approve'}
      </button>
      <button 
        onClick={handleReject}
        disabled={loading}
        style={{ 
          padding: '8px 16px', 
          backgroundColor: loading ? '#666' : '#EF4444', 
          color: 'white', 
          border: 'none', 
          borderRadius: '6px', 
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1
        }}
      >
        {loading ? 'Processing...' : 'Reject'}
      </button>
    </div>
  )
}