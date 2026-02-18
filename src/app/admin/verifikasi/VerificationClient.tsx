'use client'

import { useState } from 'react'
import Link from 'next/link'

interface VerificationClientProps {
  requests: any[]
  pendingCount: number
  approvedCount: number
  rejectedCount: number
}

export default function VerificationClient({
  requests,
  pendingCount,
  approvedCount,
  rejectedCount
}: VerificationClientProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Pagination calculations
  const totalPages = Math.ceil(requests.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentRequests = requests.slice(startIndex, endIndex)

  // Smart pagination - show ellipsis for many pages
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    
    if (totalPages <= 7) {
      // Show all pages if 7 or less
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    
    // Always show first page
    pages.push(1)
    
    if (currentPage > 3) {
      pages.push('...')
    }
    
    // Show pages around current
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    
    if (currentPage < totalPages - 2) {
      pages.push('...')
    }
    
    // Always show last page
    pages.push(totalPages)
    
    return pages
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ padding: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '8px' }}>
          Verification Requests
        </h1>
        <p style={{ fontSize: '16px', color: '#666' }}>
          Showing {startIndex + 1}-{Math.min(endIndex, requests.length)} of {requests.length} requests
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>
            ⏳ Pending Review
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#FFC107' }}>
            {pendingCount}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>
            ✅ Approved
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#4CAF50' }}>
            {approvedCount}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{ fontSize: '14px', color: '#999', marginBottom: '8px' }}>
            ❌ Rejected
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#F44336' }}>
            {rejectedCount}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #E5E5E0'
      }}>
        {currentRequests.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {currentRequests.map((request: any) => (
              <Link
                key={request.id}
                href={`/admin/verifikasi/${request.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '20px',
                  backgroundColor: '#F5F5F0',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  border: '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  backgroundColor: '#B8936D',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  flexShrink: 0
                }}>
                  {request.company_name.charAt(0)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '4px' }}>
                    {request.company_name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                    License: {request.motac_license_number}
                  </div>
                  <div style={{ fontSize: '13px', color: '#999' }}>
                    Submitted: {new Date(request.created_at).toLocaleDateString('ms-MY', {
                      timeZone: 'Asia/Kuala_Lumpur'
                    })}
                  </div>
                </div>

                <div style={{
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
                  {request.status === 'pending' ? '⏳ PENDING' :
                   request.status === 'approved' ? '✅ APPROVED' :
                   '❌ REJECTED'}
                </div>

                <div style={{ fontSize: '24px', color: '#B8936D' }}>
                  →
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📋</div>
            <p style={{ fontSize: '16px', color: '#666' }}>
              No verification requests yet
            </p>
          </div>
        )}
      </div>

      {/* SMART PAGINATION */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          marginTop: '32px'
        }}>
          {/* Previous Button */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '10px 16px',
              backgroundColor: currentPage === 1 ? '#E5E5E0' : '#B8936D',
              color: currentPage === 1 ? '#999' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            ← Previous
          </button>

          {/* Page Numbers with Ellipsis */}
          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span 
                key={`ellipsis-${index}`} 
                style={{ 
                  padding: '0 8px', 
                  color: '#999',
                  fontSize: '14px'
                }}
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                onClick={() => goToPage(page as number)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: currentPage === page ? '#B8936D' : 'white',
                  color: currentPage === page ? 'white' : '#2C2C2C',
                  border: currentPage === page ? 'none' : '1px solid #E5E5E0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  minWidth: '44px',
                  transition: 'all 0.2s'
                }}
              >
                {page}
              </button>
            )
          ))}

          {/* Next Button */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '10px 16px',
              backgroundColor: currentPage === totalPages ? '#E5E5E0' : '#B8936D',
              color: currentPage === totalPages ? '#999' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}