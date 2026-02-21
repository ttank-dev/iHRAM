import { checkMerchantAccess } from '@/lib/merchant'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const getServiceRoleClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function MerchantDashboardPage() {
  const { isMerchant, user, agencyId, role } = await checkMerchantAccess()

  if (!isMerchant || !user || !agencyId) {
    redirect('/merchant/login')
  }

  const adminClient = getServiceRoleClient()

  // Ambil agency data
  const { data: agency } = await adminClient
    .from('agencies')
    .select('*')
    .eq('id', agencyId)
    .single()

  if (!agency) {
    redirect('/merchant/login')
  }

  // Stats
  const { data: packages } = await adminClient
    .from('packages')
    .select('id, status')
    .eq('agency_id', agencyId)

  const { data: reviews } = await adminClient
    .from('reviews')
    .select('id, rating')
    .eq('agency_id', agencyId)
    .eq('is_approved', true)

  const totalPackages = packages?.length || 0
  const publishedPackages = packages?.filter(p => p.status === 'published').length || 0
  const draftPackages = packages?.filter(p => p.status === 'draft').length || 0
  const totalReviews = reviews?.length || 0
  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  // License expiry check
  const getLicenseWarning = () => {
    if (!agency.motac_license_expiry) return null
    const today = new Date()
    const expiryDate = new Date(agency.motac_license_expiry)
    const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysLeft < 0) return {
      type: 'expired', icon: '🔴', title: 'LESEN TELAH TAMAT',
      message: `Lesen MOTAC anda telah tamat ${Math.abs(daysLeft)} hari lalu. Agensi anda telah disembunyikan daripada carian. Sila perbaharui segera.`,
      bg: '#FEE2E2', borderColor: '#EF4444', textColor: '#B91C1C', daysLeft
    }
    if (daysLeft <= 30) return {
      type: 'critical', icon: '🟠', title: 'SEGERA: LESEN HAMPIR TAMAT',
      message: `Lesen MOTAC anda akan tamat dalam ${daysLeft} hari (${agency.motac_license_expiry}). Sila perbaharui secepat mungkin.`,
      bg: '#FFEDD5', borderColor: '#F97316', textColor: '#C2410C', daysLeft
    }
    if (daysLeft <= 90) return {
      type: 'warning', icon: '🟡', title: 'Peringatan Pembaharuan Lesen',
      message: `Lesen MOTAC anda akan tamat dalam ${daysLeft} hari (${agency.motac_license_expiry}). Sila sediakan dokumen pembaharuan.`,
      bg: '#FEF9C3', borderColor: '#EAB308', textColor: '#A16207', daysLeft
    }
    return null
  }

  const licenseWarning = getLicenseWarning()

  return (
    <>
      <div className="md-page">
        {/* ── HEADER ── */}
        <div className="md-header">
          <div className="md-header-top">
            <div>
              <h1 className="md-title">
                Selamat kembali, {agency.name}! 👋
              </h1>
              <p className="md-subtitle">
                Ringkasan aktiviti agensi anda hari ini
              </p>
            </div>
            <div className={`md-role-badge ${role === 'owner' ? 'owner' : 'staff'}`}>
              {role === 'owner' ? '👑 Owner' : '👤 Staff'}
            </div>
          </div>
        </div>

        {/* ── LICENSE WARNING ── */}
        {licenseWarning && (
          <div
            className="md-license-warning"
            style={{
              backgroundColor: licenseWarning.bg,
              borderColor: licenseWarning.borderColor,
              color: licenseWarning.textColor,
            }}
          >
            <div className="md-license-icon">{licenseWarning.icon}</div>
            <div className="md-license-body">
              <h3 className="md-license-title" style={{ color: licenseWarning.textColor }}>
                {licenseWarning.title}
              </h3>
              <p className="md-license-msg">{licenseWarning.message}</p>
              <div className="md-license-actions">
                <Link
                  href="/merchant/dashboard/verifikasi"
                  className="md-license-btn-primary"
                  style={{ backgroundColor: licenseWarning.borderColor }}
                >
                  📋 Status Verifikasi
                </Link>
                <a
                  href="https://www.motac.gov.my/kategori-semakan-new/agensi-pelancongan-umrah/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="md-license-btn-secondary"
                  style={{ color: licenseWarning.textColor, borderColor: licenseWarning.borderColor }}
                >
                  🏛️ Portal MOTAC
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── STATS ── */}
        <div className="md-stats-grid">
          <div className="md-stat-card">
            <div className="md-stat-header">
              <span className="md-stat-icon" style={{ background: 'rgba(44,44,44,0.08)' }}>📦</span>
              <span className="md-stat-label">Jumlah Pakej</span>
            </div>
            <div className="md-stat-value">{totalPackages}</div>
            <div className="md-stat-sub">
              <span className="md-stat-tag green">{publishedPackages} published</span>
              {draftPackages > 0 && <span className="md-stat-tag gray">{draftPackages} draft</span>}
            </div>
          </div>

          <div className="md-stat-card">
            <div className="md-stat-header">
              <span className="md-stat-icon" style={{ background: 'rgba(16,185,129,0.08)' }}>✅</span>
              <span className="md-stat-label">Published</span>
            </div>
            <div className="md-stat-value green">{publishedPackages}</div>
            <div className="md-stat-sub">
              <span className="md-stat-meta">daripada {totalPackages} pakej</span>
            </div>
          </div>

          <div className="md-stat-card">
            <div className="md-stat-header">
              <span className="md-stat-icon" style={{ background: 'rgba(59,130,246,0.08)' }}>💬</span>
              <span className="md-stat-label">Ulasan</span>
            </div>
            <div className="md-stat-value">{totalReviews}</div>
            <div className="md-stat-sub">
              <span className="md-stat-meta">ulasan yang diluluskan</span>
            </div>
          </div>

          <div className="md-stat-card">
            <div className="md-stat-header">
              <span className="md-stat-icon" style={{ background: 'rgba(184,147,109,0.1)' }}>⭐</span>
              <span className="md-stat-label">Rating Purata</span>
            </div>
            <div className="md-stat-value gold">{avgRating}</div>
            <div className="md-stat-sub">
              <span className="md-stat-stars">
                {[1,2,3,4,5].map(s => (
                  <span key={s} style={{ color: s <= Math.round(Number(avgRating)) ? '#B8936D' : '#ddd' }}>★</span>
                ))}
              </span>
            </div>
          </div>
        </div>

        {/* ── QUICK ACTIONS ── */}
        <div className="md-section">
          <h2 className="md-section-title">Tindakan Pantas</h2>
          <div className="md-actions-grid">
            {[
              { href: '/merchant/dashboard/pakej/new', icon: '➕', label: 'Tambah Pakej', desc: 'Buat pakej baru' },
              { href: '/merchant/dashboard/pakej', icon: '📦', label: 'Urus Pakej', desc: 'Edit & publish' },
              { href: '/merchant/dashboard/newsfeed/new', icon: '📰', label: 'Tulis Berita', desc: 'Kongsi update' },
              { href: '/merchant/dashboard/reels', icon: '🎬', label: 'Reels', desc: 'Video pendek' },
              { href: '/merchant/dashboard/galeri', icon: '🖼️', label: 'Galeri', desc: 'Muat naik gambar' },
              { href: '/merchant/dashboard/profil', icon: '🏢', label: 'Profil Agensi', desc: 'Kemaskini profil' },
            ].map((action) => (
              <Link key={action.href} href={action.href} className="md-action-card">
                <div className="md-action-icon">{action.icon}</div>
                <div className="md-action-label">{action.label}</div>
                <div className="md-action-desc">{action.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── AGENCY INFO ── */}
        <div className="md-section">
          <h2 className="md-section-title">Maklumat Agensi</h2>
          <div className="md-info-card">
            <div className="md-info-grid">
              <div className="md-info-item">
                <div className="md-info-label">Nama Agensi</div>
                <div className="md-info-value">{agency.name}</div>
              </div>
              <div className="md-info-item">
                <div className="md-info-label">Emel</div>
                <div className="md-info-value">{agency.email || user.email}</div>
              </div>
              <div className="md-info-item">
                <div className="md-info-label">Status</div>
                <div>
                  <span className={`md-status-badge ${agency.is_verified ? 'verified' : 'pending'}`}>
                    {agency.is_verified ? '✓ Disahkan' : '⏳ Menunggu Pengesahan'}
                  </span>
                </div>
              </div>
              {agency.motac_license_expiry && (
                <div className="md-info-item">
                  <div className="md-info-label">Tamat Lesen MOTAC</div>
                  <div className="md-info-value" style={{ color: licenseWarning ? licenseWarning.textColor : '#2C2C2C' }}>
                    {new Date(agency.motac_license_expiry).toLocaleDateString('ms-MY', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                    {licenseWarning && <span style={{ marginLeft: '8px' }}>{licenseWarning.icon}</span>}
                  </div>
                </div>
              )}
              {agency.phone && (
                <div className="md-info-item">
                  <div className="md-info-label">Telefon</div>
                  <div className="md-info-value">{agency.phone}</div>
                </div>
              )}
              {agency.ssm_number && (
                <div className="md-info-item">
                  <div className="md-info-label">No. SSM</div>
                  <div className="md-info-value">{agency.ssm_number}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── STYLES ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        .md-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ── HEADER ── */
        .md-header { margin-bottom: 28px; }
        .md-header-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .md-title {
          font-size: 28px;
          font-weight: 700;
          color: #2C2C2C;
          margin: 0 0 6px;
          line-height: 1.2;
        }
        .md-subtitle {
          font-size: 15px;
          color: #888;
          margin: 0;
        }
        .md-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .md-role-badge.owner { background: #FEE2E2; color: #EF4444; }
        .md-role-badge.staff { background: #FFF8F0; color: #B8936D; }

        /* ── LICENSE WARNING ── */
        .md-license-warning {
          display: flex;
          gap: 16px;
          padding: 20px 24px;
          border: 2px solid;
          border-radius: 12px;
          margin-bottom: 28px;
          align-items: flex-start;
        }
        .md-license-icon { font-size: 36px; line-height: 1; flex-shrink: 0; }
        .md-license-body { flex: 1; min-width: 0; }
        .md-license-title { font-size: 17px; font-weight: 700; margin: 0 0 6px; }
        .md-license-msg { font-size: 14px; margin: 0 0 14px; line-height: 1.5; opacity: 0.9; }
        .md-license-actions { display: flex; gap: 10px; flex-wrap: wrap; }
        .md-license-btn-primary {
          padding: 10px 20px;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          transition: opacity 0.2s;
        }
        .md-license-btn-primary:hover { opacity: 0.9; }
        .md-license-btn-secondary {
          padding: 10px 20px;
          background: white;
          text-decoration: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          border: 2px solid;
          transition: opacity 0.2s;
        }
        .md-license-btn-secondary:hover { opacity: 0.85; }

        /* ── STATS ── */
        .md-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 32px;
        }
        .md-stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #E5E5E0;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .md-stat-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          transform: translateY(-1px);
        }
        .md-stat-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .md-stat-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }
        .md-stat-label {
          font-size: 13px;
          color: #888;
          font-weight: 500;
        }
        .md-stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #2C2C2C;
          line-height: 1;
          margin-bottom: 8px;
        }
        .md-stat-value.green { color: #10B981; }
        .md-stat-value.gold { color: #B8936D; }
        .md-stat-sub {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .md-stat-tag {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 4px;
        }
        .md-stat-tag.green { background: #ECFDF5; color: #10B981; }
        .md-stat-tag.gray { background: #F5F5F0; color: #999; }
        .md-stat-meta { font-size: 12px; color: #aaa; }
        .md-stat-stars { font-size: 16px; letter-spacing: 2px; }

        /* ── SECTIONS ── */
        .md-section { margin-bottom: 32px; }
        .md-section-title {
          font-size: 18px;
          font-weight: 700;
          color: #2C2C2C;
          margin: 0 0 16px;
        }

        /* ── QUICK ACTIONS ── */
        .md-actions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .md-action-card {
          padding: 20px;
          background: white;
          border-radius: 12px;
          border: 1px solid #E5E5E0;
          text-decoration: none;
          text-align: center;
          transition: all 0.2s;
          cursor: pointer;
        }
        .md-action-card:hover {
          border-color: #B8936D;
          box-shadow: 0 4px 16px rgba(184,147,109,0.1);
          transform: translateY(-2px);
        }
        .md-action-icon { font-size: 28px; margin-bottom: 8px; }
        .md-action-label { font-size: 14px; font-weight: 600; color: #2C2C2C; margin-bottom: 2px; }
        .md-action-desc { font-size: 12px; color: #aaa; }

        /* ── INFO CARD ── */
        .md-info-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #E5E5E0;
        }
        .md-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .md-info-item {}
        .md-info-label { font-size: 12px; color: #999; margin-bottom: 4px; font-weight: 500; letter-spacing: 0.3px; }
        .md-info-value { font-size: 15px; font-weight: 600; color: #2C2C2C; word-break: break-word; }
        .md-status-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 700;
        }
        .md-status-badge.verified { background: #ECFDF5; color: #10B981; }
        .md-status-badge.pending { background: #FEF3C7; color: #F59E0B; }

        /* ── RESPONSIVE ── */

        /* Tablet */
        @media (max-width: 1023px) {
          .md-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .md-actions-grid { grid-template-columns: repeat(3, 1fr); }
          .md-title { font-size: 24px; }
        }

        /* Mobile */
        @media (max-width: 639px) {
          .md-header-top { flex-direction: column; gap: 8px; }
          .md-title { font-size: 22px; }
          .md-stats-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .md-stat-card { padding: 16px; }
          .md-stat-value { font-size: 26px; }
          .md-stat-icon { width: 32px; height: 32px; font-size: 14px; }
          .md-actions-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .md-action-card { padding: 16px; }
          .md-action-icon { font-size: 24px; }
          .md-info-grid { grid-template-columns: 1fr; gap: 16px; }
          .md-license-warning { flex-direction: column; gap: 12px; padding: 16px; }
          .md-license-icon { font-size: 28px; }
          .md-license-title { font-size: 15px; }
          .md-license-btn-primary, .md-license-btn-secondary {
            padding: 10px 16px;
            font-size: 12px;
            width: 100%;
            text-align: center;
          }
        }

        /* Small mobile */
        @media (max-width: 400px) {
          .md-stats-grid { grid-template-columns: 1fr; }
          .md-actions-grid { grid-template-columns: 1fr; }
        }
      `}} />
    </>
  )
}