import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PaymentSettingsForm from './PaymentSettingsForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminSumbanganPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  const supabase = await createClient()
  const { data: settings } = await supabase
    .from('payment_settings')
    .select('*')
    .limit(1)
    .maybeSingle()

  return (
    <div>
      <style>{`
        .as-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:28px;gap:16px;flex-wrap:wrap}
        .as-title{font-size:32px;font-weight:bold;color:#2C2C2C;margin-bottom:6px}
        .as-sub{font-size:15px;color:#666}
        .as-view{padding:10px 22px;background:#B8936D;color:#fff;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;display:flex;align-items:center;gap:6px;white-space:nowrap;flex-shrink:0}

        .as-banner{background:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:18px 20px;margin-bottom:28px;display:flex;gap:14px;align-items:flex-start}
        .as-banner-icon{font-size:22px;flex-shrink:0}
        .as-banner-title{font-size:14px;font-weight:600;color:#1E40AF;margin-bottom:2px}
        .as-banner-text{font-size:13px;color:#1E40AF;line-height:1.6}

        .as-card{background:#fff;border-radius:16px;padding:28px;border:1px solid #E5E5E0;margin-bottom:28px}
        .as-card-head{display:flex;align-items:center;gap:12px;margin-bottom:22px;padding-bottom:22px;border-bottom:1px solid #E5E5E0}
        .as-card-icon{width:44px;height:44px;border-radius:10px;background:#F5F5F0;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0}
        .as-card-title{font-size:18px;font-weight:bold;color:#2C2C2C;margin-bottom:2px}
        .as-card-sub{font-size:13px;color:#666}

        /* Preview */
        .as-preview{background:#F5F5F0;border-radius:12px;padding:24px}
        .as-pv-label{font-size:12px;color:#999;font-weight:600;margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px}
        .as-pv-bank{background:#fff;border-radius:8px;padding:16px;margin-bottom:20px}
        .as-pv-field{margin-bottom:12px}
        .as-pv-field:last-child{margin-bottom:0}
        .as-pv-key{font-size:11px;color:#999;margin-bottom:3px;font-weight:600}
        .as-pv-val{font-size:15px;font-weight:600;color:#2C2C2C}
        .as-pv-acct{font-size:20px;font-weight:700;color:#B8936D;font-family:monospace;letter-spacing:2px}
        .as-pv-instruction{padding:12px;background:#FFF8F0;border-radius:8px;border:1px solid #F5E5D3;font-size:13px;color:#666;line-height:1.6;margin-bottom:20px}
        .as-pv-qr-row{display:flex;gap:16px}
        .as-pv-qr-item{background:#fff;border-radius:8px;padding:16px;flex:1;text-align:center}
        .as-pv-qr-img{width:140px;height:140px;object-fit:contain;margin-bottom:8px}
        .as-pv-qr-label{font-size:13px;font-weight:600;color:#2C2C2C}
        .as-pv-empty{padding:40px 20px;text-align:center;color:#999;font-size:14px}

        @media(max-width:1023px){
          .as-title{font-size:26px}
          .as-card{padding:22px}
        }
        @media(max-width:639px){
          .as-header{flex-direction:column;align-items:flex-start;margin-bottom:20px}
          .as-title{font-size:22px}
          .as-sub{font-size:13px}
          .as-view{width:100%;justify-content:center}
          .as-banner{padding:14px;gap:10px}
          .as-card{padding:18px 14px;margin-bottom:20px}
          .as-card-head{gap:10px;margin-bottom:18px;padding-bottom:18px}
          .as-card-icon{width:38px;height:38px;font-size:18px}
          .as-card-title{font-size:16px}
          .as-preview{padding:16px}
          .as-pv-qr-row{flex-direction:column;gap:12px}
          .as-pv-qr-img{width:120px;height:120px}
        }
      `}</style>

      {/* Header */}
      <div className="as-header">
        <div>
          <h1 className="as-title">Donations</h1>
          <p className="as-sub">Manage bank transfer and QR code payment details</p>
        </div>
        <Link href="/sumbangan" target="_blank" className="as-view">🌐 View Public Page</Link>
      </div>

      {/* Banner */}
      <div className="as-banner">
        <div className="as-banner-icon">ℹ️</div>
        <div>
          <div className="as-banner-title">Simple Payment Method</div>
          <div className="as-banner-text">iHRAM uses bank transfer and QR code payments. Donors will see your bank details and can scan QR codes to donate.</div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="as-card">
        <div className="as-card-head">
          <div className="as-card-icon">🏦</div>
          <div>
            <div className="as-card-title">Bank Transfer & QR Code Details</div>
            <p className="as-card-sub">Configure your bank account and payment QR codes</p>
          </div>
        </div>
        <PaymentSettingsForm initialSettings={settings} />
      </div>

      {/* Live Preview */}
      <div className="as-card">
        <div className="as-card-head">
          <div className="as-card-icon">👁️</div>
          <div>
            <div className="as-card-title">Preview</div>
            <p className="as-card-sub">How donors will see your payment details on /sumbangan</p>
          </div>
        </div>

        {settings ? (
          <div className="as-preview">
            {/* Bank info */}
            <div className="as-pv-label">Bank Transfer</div>
            <div className="as-pv-bank">
              <div className="as-pv-field">
                <div className="as-pv-key">Bank</div>
                <div className="as-pv-val">{settings.bank_name || '-'}</div>
              </div>
              <div className="as-pv-field">
                <div className="as-pv-key">Account Name</div>
                <div className="as-pv-val">{settings.account_name || '-'}</div>
              </div>
              <div className="as-pv-field">
                <div className="as-pv-key">Account Number</div>
                <div className="as-pv-acct">{settings.account_number || '-'}</div>
              </div>
            </div>

            {/* Instruction */}
            {settings.bank_instruction && (
              <div className="as-pv-instruction">{settings.bank_instruction}</div>
            )}

            {/* QR codes */}
            {(settings.duitnow_qr_url || settings.tng_qr_url) && (
              <>
                <div className="as-pv-label">Scan QR Code</div>
                <div className="as-pv-qr-row">
                  {settings.duitnow_qr_url && (
                    <div className="as-pv-qr-item">
                      <img src={settings.duitnow_qr_url} alt="DuitNow QR" className="as-pv-qr-img" />
                      <div className="as-pv-qr-label">DuitNow</div>
                    </div>
                  )}
                  {settings.tng_qr_url && (
                    <div className="as-pv-qr-item">
                      <img src={settings.tng_qr_url} alt="Touch n Go QR" className="as-pv-qr-img" />
                      <div className="as-pv-qr-label">Touch n Go</div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="as-pv-empty">
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏦</div>
            No payment details configured yet. Fill in the form above and click Save.
          </div>
        )}
      </div>
    </div>
  )
}