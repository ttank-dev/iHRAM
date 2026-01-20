'use client'

import { useState } from 'react'
import { approveReview, rejectReview } from '../actions'
import { Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ReviewActionButtonsProps {
  reviewId: string
}

export default function ReviewActionButtons({ reviewId }: ReviewActionButtonsProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleApprove() {
    if (!confirm('Approve ulasan ini?')) return
    setLoading(true)
    try {
      const result = await approveReview(reviewId)
      if (result.success) {
        alert('Ulasan berjaya di-approve!')
        router.refresh()
      }
    } catch (error: any) {
      console.error('Error:', error)
      alert('Gagal approve ulasan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleReject() {
    if (!confirm('Reject dan delete ulasan ini?')) return
    setLoading(true)
    try {
      const result = await rejectReview(reviewId)
      if (result.success) {
        alert('Ulasan berjaya di-reject!')
        router.refresh()
      }
    } catch (error: any) {
      console.error('Error:', error)
      alert('Gagal reject ulasan: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleApprove}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        <Check size={16} />
        {loading ? 'Loading...' : 'Approve'}
      </button>
      <button
        onClick={handleReject}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
      >
        <X size={16} />
        {loading ? 'Loading...' : 'Reject'}
      </button>
    </>
  )
}