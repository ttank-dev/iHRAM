'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface LicenseStats {
  expired: number
  expiring_critical: number
  expiring_soon: number
}

export default function LicenseExpiryAlerts() {
  const supabase = createClient()
  const [stats, setStats] = useState<LicenseStats>({
    expired: 0,
    expiring_critical: 0,
    expiring_soon: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('agencies')
        .select('license_status')
        .eq('is_verified', true)
        .not('license_status', 'is', null)

      if (error) throw error

      const counts: LicenseStats = {
        expired: 0,
        expiring_critical: 0,
        expiring_soon: 0
      }

      data?.forEach(agency => {
        if (agency.license_status === 'expired') counts.expired++
        else if (agency.license_status === 'expiring_critical') counts.expiring_critical++
        else if (agency.license_status === 'expiring_soon') counts.expiring_soon++
      })

      setStats(counts)
    } catch (error) {
      console.error('Error fetching license stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const hasAlerts = stats.expired > 0 || stats.expiring_critical > 0 || stats.expiring_soon > 0

  if (loading) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #E5E5E0'
      }}>
        <div style={{ fontSize: '16px', color: '#999' }}>Loading license alerts...</div>
      </div>
    )
  }

  if (!hasAlerts) {
    return (
      <div style={{
        backgroundColor: '#E8F5E9',
        border: '2px solid #4CAF50',
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>✅</div>
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#2E7D32' }}>
          All Licenses Valid
        </div>
        <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
          No expiring or expired licenses
        </div>
      </div>
    )
  }

  return (
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
        <h3 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#2C2C2C',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ⚠️ License Expiry Alerts
        </h3>
        <Link
          href="/admin/agensi?filter=expiring"
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
        
        {/* EXPIRED - Critical Alert */}
        {stats.expired > 0 && (
          <Link
            href="/admin/agensi?filter=expired"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: '#FFEBEE',
              border: '2px solid #F44336',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FFCDD2'
              e.currentTarget.style.transform = 'translateX(4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFEBEE'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
          >
            <div>
              <div style={{
                fontSize: '15px',
                fontWeight: '700',
                color: '#C62828',
                marginBottom: '4px'
              }}>
                🔴 EXPIRED LICENSES
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                Requires immediate action - Auto-revoked
              </div>
            </div>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#C62828'
            }}>
              {stats.expired}
            </div>
          </Link>
        )}

        {/* EXPIRING CRITICAL - Urgent */}
        {stats.expiring_critical > 0 && (
          <Link
            href="/admin/agensi?filter=expiring_critical"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: '#FFF3E0',
              border: '2px solid #FF9800',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FFE0B2'
              e.currentTarget.style.transform = 'translateX(4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFF3E0'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
          >
            <div>
              <div style={{
                fontSize: '15px',
                fontWeight: '700',
                color: '#E65100',
                marginBottom: '4px'
              }}>
                🟠 EXPIRING SOON (&lt;30 Days)
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                Contact agencies for renewal
              </div>
            </div>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#E65100'
            }}>
              {stats.expiring_critical}
            </div>
          </Link>
        )}

        {/* EXPIRING SOON - Warning */}
        {stats.expiring_soon > 0 && (
          <Link
            href="/admin/agensi?filter=expiring_soon"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              backgroundColor: '#FFFDE7',
              border: '2px solid #FFC107',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FFF9C4'
              e.currentTarget.style.transform = 'translateX(4px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFDE7'
              e.currentTarget.style.transform = 'translateX(0)'
            }}
          >
            <div>
              <div style={{
                fontSize: '15px',
                fontWeight: '700',
                color: '#F57C00',
                marginBottom: '4px'
              }}>
                🟡 EXPIRING (30-90 Days)
              </div>
              <div style={{ fontSize: '13px', color: '#666' }}>
                Monitor for renewal
              </div>
            </div>
            <div style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#F57C00'
            }}>
              {stats.expiring_soon}
            </div>
          </Link>
        )}

      </div>

      {/* Last Updated */}
      <div style={{
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #E5E5E0',
        fontSize: '12px',
        color: '#999',
        textAlign: 'center'
      }}>
        Auto-updated daily at 12:01 AM • Click to view details
      </div>
    </div>
  )
}