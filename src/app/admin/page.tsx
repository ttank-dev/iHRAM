'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface DashboardStats {
  totalAgencies: number
  totalPackages: number
  totalReviews: number
  pendingReviews: number
  totalLeads: number
  totalGuides: number
  recentLeads: any[]
  recentReviews: any[]
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAgencies: 0,
    totalPackages: 0,
    totalReviews: 0,
    pendingReviews: 0,
    totalLeads: 0,
    totalGuides: 0,
    recentLeads: [],
    recentReviews: []
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch real data from Supabase
    // This is mock data for now
    setTimeout(() => {
      setStats({
        totalAgencies: 24,
        totalPackages: 156,
        totalReviews: 89,
        pendingReviews: 12,
        totalLeads: 342,
        totalGuides: 18,
        recentLeads: [
          { id: '1', package: 'Pakej Ramadhan 2026', agency: 'Al-Hijrah Travel', timestamp: '2 min ago' },
          { id: '2', package: 'Umrah Premium Gold', agency: 'Safa Marwa', timestamp: '15 min ago' },
          { id: '3', package: 'Ekonomi Makkah', agency: 'Rasikh Tours', timestamp: '1 hour ago' },
        ],
        recentReviews: [
          { id: '1', reviewer: 'Ahmad Abdullah', rating: 5, package: 'Pakej Ramadhan', status: 'pending' },
          { id: '2', reviewer: 'Fatimah Zahra', rating: 4, package: 'Premium VIP', status: 'pending' },
          { id: '3', reviewer: 'Zainab Hassan', rating: 5, package: 'Standard Plus', status: 'pending' },
        ]
      })
      setLoading(false)
    }, 500)
  }, [])

  const statCards = [
    {
      title: 'Total Agensi',
      value: stats.totalAgencies,
      icon: '🏢',
      color: '#3B82F6',
      link: '/admin/agensi',
      change: '+3 bulan ini'
    },
    {
      title: 'Pakej Umrah',
      value: stats.totalPackages,
      icon: '📦',
      color: '#8B5CF6',
      link: '/admin/pakej',
      change: '+12 bulan ini'
    },
    {
      title: 'Total Ulasan',
      value: stats.totalReviews,
      icon: '⭐',
      color: '#F59E0B',
      link: '/admin/ulasan',
      change: `${stats.pendingReviews} pending`
    },
    {
      title: 'WhatsApp Leads',
      value: stats.totalLeads,
      icon: '🎯',
      color: '#10B981',
      link: '/admin/leads',
      change: '+45 minggu ini'
    },
    {
      title: 'Panduan',
      value: stats.totalGuides,
      icon: '📚',
      color: '#B8936D',
      link: '/admin/panduan',
      change: 'All published'
    },
    {
      title: 'Ulasan Pending',
      value: stats.pendingReviews,
      icon: '⏳',
      color: '#EF4444',
      link: '/admin/ulasan?status=pending',
      change: 'Perlu approval'
    },
  ]

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>Loading dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      
      {/* PAGE HEADER */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#2C2C2C',
          marginBottom: '8px'
        }}>
          Dashboard Overview
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666'
        }}>
          Welcome back, Admin! Here's what's happening with iHRAM today.
        </p>
      </div>

      {/* STATS GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
        marginBottom: '40px'
      }}>
        {statCards.map((card, index) => (
          <Link
            key={index}
            href={card.link}
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              textDecoration: 'none',
              border: '1px solid #E5E5E0',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: `${card.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                {card.icon}
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: card.color,
                backgroundColor: `${card.color}10`,
                padding: '4px 12px',
                borderRadius: '12px'
              }}>
                {card.change}
              </div>
            </div>

            <div style={{
              fontSize: '14px',
              color: '#666',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              {card.title}
            </div>

            <div style={{
              fontSize: '36px',
              fontWeight: 'bold',
              color: '#2C2C2C'
            }}>
              {card.value.toLocaleString()}
            </div>
          </Link>
        ))}
      </div>

      {/* TWO COLUMN LAYOUT */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '24px'
      }}>
        
        {/* RECENT LEADS */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#2C2C2C'
            }}>
              🎯 Recent Leads
            </h2>
            <Link
              href="/admin/leads"
              style={{
                fontSize: '14px',
                color: '#B8936D',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              View All →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.recentLeads.map((lead) => (
              <div
                key={lead.id}
                style={{
                  padding: '16px',
                  backgroundColor: '#F5F5F0',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#2C2C2C',
                    marginBottom: '4px'
                  }}>
                    {lead.package}
                  </div>
                  <div style={{
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    {lead.agency}
                  </div>
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#999',
                  whiteSpace: 'nowrap'
                }}>
                  {lead.timestamp}
                </div>
              </div>
            ))}
          </div>

          {stats.recentLeads.length === 0 && (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#999'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
              <div>No recent leads</div>
            </div>
          )}
        </div>

        {/* PENDING REVIEWS */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid #E5E5E0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#2C2C2C'
            }}>
              ⏳ Pending Reviews
            </h2>
            <Link
              href="/admin/ulasan?status=pending"
              style={{
                fontSize: '14px',
                color: '#B8936D',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              View All →
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.recentReviews.map((review) => (
              <div
                key={review.id}
                style={{
                  padding: '16px',
                  backgroundColor: '#FFF7ED',
                  borderRadius: '12px',
                  borderLeft: '3px solid #F59E0B'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#2C2C2C'
                  }}>
                    {review.reviewer}
                  </div>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {'⭐'.repeat(review.rating)}
                  </div>
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#666',
                  marginBottom: '8px'
                }}>
                  {review.package}
                </div>
                <div style={{
                  display: 'flex',
                  gap: '8px'
                }}>
                  <button style={{
                    padding: '6px 16px',
                    backgroundColor: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    ✓ Approve
                  </button>
                  <button style={{
                    padding: '6px 16px',
                    backgroundColor: 'transparent',
                    color: '#EF4444',
                    border: '1px solid #EF4444',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          {stats.recentReviews.length === 0 && (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#999'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
              <div>All caught up!</div>
            </div>
          )}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div style={{
        marginTop: '40px',
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #E5E5E0'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 'bold',
          color: '#2C2C2C',
          marginBottom: '24px'
        }}>
          ⚡ Quick Actions
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px'
        }}>
          <Link
            href="/admin/panduan/new"
            style={{
              padding: '20px',
              backgroundColor: '#F5F5F0',
              borderRadius: '12px',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#B8936D'
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement
              const text = e.currentTarget.querySelector('.text') as HTMLElement
              if (icon) icon.style.transform = 'scale(1.2)'
              if (text) text.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F5F5F0'
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement
              const text = e.currentTarget.querySelector('.text') as HTMLElement
              if (icon) icon.style.transform = 'scale(1)'
              if (text) text.style.color = '#2C2C2C'
            }}
          >
            <div className="icon" style={{ fontSize: '32px', marginBottom: '8px', transition: 'transform 0.2s' }}>
              📝
            </div>
            <div className="text" style={{ fontSize: '14px', fontWeight: '600', color: '#2C2C2C', transition: 'color 0.2s' }}>
              New Panduan
            </div>
          </Link>

          <Link
            href="/admin/agensi"
            style={{
              padding: '20px',
              backgroundColor: '#F5F5F0',
              borderRadius: '12px',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#B8936D'
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement
              const text = e.currentTarget.querySelector('.text') as HTMLElement
              if (icon) icon.style.transform = 'scale(1.2)'
              if (text) text.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F5F5F0'
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement
              const text = e.currentTarget.querySelector('.text') as HTMLElement
              if (icon) icon.style.transform = 'scale(1)'
              if (text) text.style.color = '#2C2C2C'
            }}
          >
            <div className="icon" style={{ fontSize: '32px', marginBottom: '8px', transition: 'transform 0.2s' }}>
              🏢
            </div>
            <div className="text" style={{ fontSize: '14px', fontWeight: '600', color: '#2C2C2C', transition: 'color 0.2s' }}>
              Manage Agensi
            </div>
          </Link>

          <Link
            href="/admin/ulasan?status=pending"
            style={{
              padding: '20px',
              backgroundColor: '#FFF7ED',
              borderRadius: '12px',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'all 0.2s',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F59E0B'
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement
              const text = e.currentTarget.querySelector('.text') as HTMLElement
              if (icon) icon.style.transform = 'scale(1.2)'
              if (text) text.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFF7ED'
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement
              const text = e.currentTarget.querySelector('.text') as HTMLElement
              if (icon) icon.style.transform = 'scale(1)'
              if (text) text.style.color = '#2C2C2C'
            }}
          >
            {stats.pendingReviews > 0 && (
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                backgroundColor: '#EF4444',
                color: 'white',
                fontSize: '11px',
                fontWeight: '700',
                padding: '4px 8px',
                borderRadius: '12px'
              }}>
                {stats.pendingReviews}
              </div>
            )}
            <div className="icon" style={{ fontSize: '32px', marginBottom: '8px', transition: 'transform 0.2s' }}>
              ⏳
            </div>
            <div className="text" style={{ fontSize: '14px', fontWeight: '600', color: '#2C2C2C', transition: 'color 0.2s' }}>
              Review Ulasan
            </div>
          </Link>

          <Link
            href="/admin/leads"
            style={{
              padding: '20px',
              backgroundColor: '#F5F5F0',
              borderRadius: '12px',
              textDecoration: 'none',
              textAlign: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#B8936D'
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement
              const text = e.currentTarget.querySelector('.text') as HTMLElement
              if (icon) icon.style.transform = 'scale(1.2)'
              if (text) text.style.color = 'white'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F5F5F0'
              const icon = e.currentTarget.querySelector('.icon') as HTMLElement
              const text = e.currentTarget.querySelector('.text') as HTMLElement
              if (icon) icon.style.transform = 'scale(1)'
              if (text) text.style.color = '#2C2C2C'
            }}
          >
            <div className="icon" style={{ fontSize: '32px', marginBottom: '8px', transition: 'transform 0.2s' }}>
              📊
            </div>
            <div className="text" style={{ fontSize: '14px', fontWeight: '600', color: '#2C2C2C', transition: 'color 0.2s' }}>
              View Analytics
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}