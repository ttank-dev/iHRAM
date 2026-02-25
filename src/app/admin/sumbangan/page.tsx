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
  const { data: settings } = await supabase.from('payment_settings').select('*').limit(1).maybeSingle()

  return (
    <div>
      <style>{`
        .sum-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; gap: 16px; flex-wrap: wrap; }
        .sum-title { font-size: 32px; font-weight: bold; color: #2C2C2C; margin-bottom: 8px; }
        .sum-sub { font-size: 16px; color: #666; }
        .sum-view-btn { padding: 12px 24px; background: #B8936D; color: white; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 8px; white-space: nowrap; flex-shrink: 0; }

        .sum-banner { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 20px 24px; margin-bottom: 32px; display: flex; gap: 16px; }
        .sum-banner-title { font-size: 15px; font-weight: 600; color: #1E40AF; margin-bottom: 4px; }
        .sum-banner-text { font-size: 14px; color: #1E40AF; line-height: 1.6; }

        .sum-card { background: white; border-radius: 16px; padding: 32px; border: 1px solid #E5E5E0; margin-bottom: 32px; }
        .sum-card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #E5E5E0; }
        .sum-card-icon { width: 48px; height: 48px; border-radius: 12px; background: #F5F5F0; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
        .sum-card-title { font-size: 20px; font-weight: bold; color: #2C2C2C; margin-bottom: 4px; }
        .sum-card-sub { font-size: 14px; color: #666; }

        .sum-preview { background: #F5F5F0; border-radius: 12px; padding: 24px; }
        .sum-preview-label { font-size: 13px; color: #999; font-weight: 600; margin-bottom: 12px; }
        .sum-preview-bank { background: white; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
        .sum-preview-field { margin-bottom: 12px; }
        .sum-preview-field:last-child { margin-bottom: 0; }
        .sum-preview-field-label { font-size: 12px; color: #999; margin-bottom: 4px; }
        .sum-preview-field-value { font-size: 16px; font-weight: 600; color: #2C2C2C; }
        .sum-qr-row { display: flex; gap: 16px; }
        .sum-qr-item { background: white; border-radius: 8px; padding: 16px; flex: 1; text-align: center; }
        .sum-qr-img { width: 150px; height: 150px; object-fit: contain; margin-bottom: 8px; }
        .sum-qr-label { font-size: 14px; font-weight: 600; color: #2C2C2C; }

        @media (max-width: 1023px) {
          .sum-title { font-size: 26px; }
          .sum-card { padding: 24px; }
        }

        @media (max-width: 639px) {
          .sum-header { flex-direction: column; align-items: flex-start; margin-bottom: 20px; }
          .sum-title { font-size: 22px; }
          .sum-sub { font-size: 14px; }
          .sum-view-btn { width: 70%; justify-content: center; }

          .sum-banner { padding: 16px; gap: 12px; }
          .sum-banner-title { font-size: 14px; }
          .sum-banner-text { font-size: 13px; }

          .sum-card { padding: 20px 16px; margin-bottom: 20px; }
          .sum-card-head { gap: 10px; margin-bottom: 20px; padding-bottom: 20px; }
          .sum-card-icon { width: 40px; height: 40px; font-size: 20px; }
          .sum-card-title { font-size: 17px; }

          .sum-preview { padding: 16px; }
          .sum-qr-row { flex-direction: column; gap: 12px; }
          .sum-qr-img { width: 120px; height: 120px; }
        }
      `}</style>

      {/* Header */}
      <div className="sum-header">
        <div>
          <h1 className="sum-title">Sumbangan Ikhlas</h1>
          <p className="sum-sub">Manage bank transfer and QR code payment details.</p>
        </div>
        <Link href="/sumbangan" target="_blank" className="sum-view-btn">
          <span>🌐</span><span>View Public Page</span>
        </Link>
      </div>

      {/* Banner */}
      <div className="sum-banner">
        <div style={{ fontSize: '24px', flexShrink: 0 }}>ℹ️</div>
        <div>
          <div className="sum-banner-title">Simple Payment Method</div>
          <div className="sum-banner-text">iHRAM uses simple bank transfer and QR code payments. Donors will see your bank details and can scan QR codes to donate.</div>
        </div>
      </div>

      {/* Settings Form Card */}
      <div className="sum-card">
        <div className="sum-card-head">
          <div className="sum-card-icon">🏦</div>
          <div>
            <div className="sum-card-title">Bank Transfer & QR Code Details</div>
            <p className="sum-card-sub">Configure your bank account and payment QR codes</p>
          </div>
        </div>
        <PaymentSettingsForm initialSettings={settings} />
      </div>

      {/* Preview Card */}
      <div className="sum-card">
        <div className="sum-card-head">
          <div className="sum-card-icon">👁️</div>
          <div>
            <div className="sum-card-title">Preview</div>
            <p className="sum-card-sub">How donors will see your payment details</p>
          </div>
        </div>

        {settings ? (
          <div className="sum-preview">
            <div className="sum-preview-label">PINDAHAN BANK</div>
            <div className="sum-preview-bank">
              <div className="sum-preview-field">
                <div className="sum-preview-field-label">Bank</div>
                <div className="sum-preview-field-value">{settings.bank_name || '-'}</div>
              </div>
              <div className="sum-preview-field">
                <div className="sum-preview-field-label">Nama Akaun</div>
                <div className="sum-preview-field-value">{settings.account_name || '-'}</div>
              </div>
              <div className="sum-preview-field">
                <div className="sum-preview-field-label">No. Akaun</div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#B8936D', fontFamily: 'monospace' }}>
                  {settings.account_number || '-'}
                </div>
              </div>
            </div>

            {(settings.duitnow_qr_url || settings.tng_qr_url) && (
              <>
                <div className="sum-preview-label">SCAN QR CODE</div>
                <div className="sum-qr-row">
                  {settings.duitnow_qr_url && (
                    <div className="sum-qr-item">
                      <img src={settings.duitnow_qr_url} alt="DuitNow QR" className="sum-qr-img" />
                      <div className="sum-qr-label">DuitNow</div>
                    </div>
                  )}
                  {settings.tng_qr_url && (
                    <div className="sum-qr-item">
                      <img src={settings.tng_qr_url} alt="Touch n Go QR" className="sum-qr-img" />
                      <div className="sum-qr-label">Touch n Go</div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
            No payment details configured yet
          </div>
        )}
      </div>
    </div>
  )
}