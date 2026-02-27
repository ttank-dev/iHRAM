'use client'

import Link from 'next/link'
import { useState } from 'react'
import Pagination from '@/app/Pagination'

interface Review {
  id: string
  reviewer_name: string | null
  travel_date: string | null
  rating: number
  review_text: string | null
  is_verified: boolean
  agencies: {
    name: string
    slug: string
    logo_url: string | null
  } | null
  packages: {
    title: string
    slug: string
  } | null
}

export default function UlasanClient({ reviews }: { reviews: Review[] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE)
  const paginatedReviews = reviews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <div className="ul-main">
      {reviews && reviews.length > 0 ? (
        <>
          <div style={{ display: 'grid', gap: '24px' }}>
            {paginatedReviews.map((review) => (
              <div
                key={review.id}
                style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #E5E5E0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
              >
                <div className="ul-review-inner">
                  <div style={{ flex: 1 }}>
                    {/* Reviewer Info */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#B8936D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', fontWeight: 'bold', flexShrink: 0 }}>
                        {review.reviewer_name ? review.reviewer_name.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#2C2C2C' }}>
                          {review.reviewer_name || 'Anonymous'}
                        </div>
                        {review.travel_date && (
                          <div style={{ fontSize: '14px', color: '#999' }}>Perjalanan: {review.travel_date}</div>
                        )}
                      </div>
                    </div>

                    {/* Stars */}
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} style={{ fontSize: '20px', color: star <= review.rating ? '#B8936D' : '#E5E5E0' }}>★</span>
                      ))}
                      <span style={{ marginLeft: '8px', fontSize: '16px', fontWeight: '600', color: '#B8936D' }}>{review.rating}.0</span>
                    </div>

                    {/* Review Text */}
                    <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#4A4A4A', marginBottom: '20px' }}>
                      {review.review_text}
                    </p>

                    {/* Agency & Package */}
                    <div className="ul-review-footer">
                      {review.agencies && (
                        <Link href={`/agensi/${review.agencies.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                          {review.agencies.logo_url ? (
                            <img src={review.agencies.logo_url} alt={review.agencies.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#B8936D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: 'bold' }}>
                              {review.agencies.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div style={{ fontSize: '13px', color: '#999' }}>Agensi</div>
                            <div style={{ fontSize: '14px', color: '#2C2C2C', fontWeight: '600' }}>{review.agencies.name}</div>
                          </div>
                        </Link>
                      )}
                      {review.packages && (
                        <Link href={`/pakej/${review.packages.slug}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#F5F5F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>&#128230;</div>
                          <div>
                            <div style={{ fontSize: '13px', color: '#999' }}>Pakej</div>
                            <div style={{ fontSize: '14px', color: '#2C2C2C', fontWeight: '600' }}>{review.packages.title}</div>
                          </div>
                        </Link>
                      )}
                    </div>
                  </div>

                  {review.is_verified && (
                    <div style={{ padding: '6px 14px', backgroundColor: '#F5F5F0', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#B8936D', flexShrink: 0 }}>
                      &#10003; Verified
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      ) : (
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '80px 40px', textAlign: 'center', border: '1px solid #E5E5E0' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>&#11088;</div>
          <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2C2C2C', marginBottom: '12px' }}>Belum Ada Ulasan</h3>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>Jadilah yang pertama untuk berkongsi pengalaman anda</p>
          <Link href="/ulasan/hantar" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', backgroundColor: '#B8936D', color: 'white', borderRadius: '10px', fontSize: '15px', fontWeight: '600', textDecoration: 'none' }}>
            <span>&#9997;&#65039;</span><span>Tulis Ulasan</span>
          </Link>
        </div>
      )}
    </div>
  )
}