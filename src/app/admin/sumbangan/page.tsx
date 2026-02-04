import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PaymentSettingsForm from './PaymentSettingsForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SumbanganPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  const supabase = await createClient()
  
  // Fetch payment settings
  const { data: settings } = await supabase
    .from('payment_settings')
    .select('*')
    .limit(1)
    .maybeSingle()

  return (
    <div>
      {/* PAGE HEADER */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#2C2C2C',
              marginBottom: '8px'
            }}>
              Sumbangan Ikhlas
            </h1>
            <p style={{
              fontSize: '16px',
              color: '#666'
            }}>
              Manage bank transfer and QR code payment details
            </p>
          </div>

          <Link
            href="/sumbangan"
            target="_blank"
            style={{
              padding: '12px 24px',
              backgroundColor: '#B8936D',
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>🌐</span>
            <span>View Public Page</span>
          </Link>
        </div>
      </div>

      {/* INFO BANNER */}
      <div style={{
        backgroundColor: '#EFF6FF',
        border: '1px solid #BFDBFE',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '32px',
        display: 'flex',
        gap: '16px'
      }}>
        <div style={{ fontSize: '24px' }}>ℹ️</div>
        <div>
          <div style={{
            fontSize: '15px',
            fontWeight: '600',
            color: '#1E40AF',
            marginBottom: '4px'
          }}>
            Simple Payment Method
          </div>
          <div style={{
            fontSize: '14px',
            color: '#1E40AF',
            lineHeight: '1.6'
          }}>
            iHRAM uses simple bank transfer and QR code payments. Donors will see your bank details and can scan QR codes to donate.
          </div>
        </div>
      </div>

      {/* PAYMENT SETTINGS FORM */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #E5E5E0',
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          paddingBottom: '24px',
          borderBottom: '1px solid #E5E5E0'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#F5F5F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            🏦
          </div>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#2C2C2C',
              marginBottom: '4px'
            }}>
              Bank Transfer & QR Code Details
            </h2>
            <p style={{ fontSize: '14px', color: '#666' }}>
              Configure your bank account and payment QR codes
            </p>
          </div>
        </div>

        <PaymentSettingsForm initialSettings={settings} />
      </div>

      {/* PREVIEW CARD */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '32px',
        border: '1px solid #E5E5E0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '24px',
          paddingBottom: '24px',
          borderBottom: '1px solid #E5E5E0'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: '#F5F5F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            👁️
          </div>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#2C2C2C',
              marginBottom: '4px'
            }}>
              Preview
            </h2>
            <p style={{ fontSize: '14px', color: '#666' }}>
              How donors will see your payment details
            </p>
          </div>
        </div>

        {settings ? (
          <div style={{
            backgroundColor: '#F5F5F0',
            borderRadius: '12px',
            padding: '24px'
          }}>
            {/* Bank Details */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{
                fontSize: '13px',
                color: '#999',
                fontWeight: '600',
                marginBottom: '12px'
              }}>
                PINDAHAN BANK
              </div>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Bank</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#2C2C2C' }}>
                    {settings.bank_name || '-'}
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>Nama Akaun</div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#2C2C2C' }}>
                    {settings.account_name || '-'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>No. Akaun</div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#B8936D',
                    fontFamily: 'monospace'
                  }}>
                    {settings.account_number || '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* QR Codes */}
            {(settings.duitnow_qr_url || settings.tng_qr_url) && (
              <div>
                <div style={{
                  fontSize: '13px',
                  color: '#999',
                  fontWeight: '600',
                  marginBottom: '12px'
                }}>
                  SCAN QR CODE
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  {settings.duitnow_qr_url && (
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '16px',
                      flex: 1,
                      textAlign: 'center'
                    }}>
                      <img
                        src={settings.duitnow_qr_url}
                        alt="DuitNow QR"
                        style={{
                          width: '150px',
                          height: '150px',
                          objectFit: 'contain',
                          marginBottom: '8px'
                        }}
                      />
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#2C2C2C' }}>
                        DuitNow
                      </div>
                    </div>
                  )}
                  {settings.tng_qr_url && (
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '16px',
                      flex: 1,
                      textAlign: 'center'
                    }}>
                      <img
                        src={settings.tng_qr_url}
                        alt="Touch n Go QR"
                        style={{
                          width: '150px',
                          height: '150px',
                          objectFit: 'contain',
                          marginBottom: '8px'
                        }}
                      />
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#2C2C2C' }}>
                        Touch n Go
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            color: '#999'
          }}>
            No payment details configured yet
          </div>
        )}
      </div>
    </div>
  )
}