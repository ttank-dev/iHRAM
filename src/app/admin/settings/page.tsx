import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingToggle from './SettingToggle'
import AdminUsersList from './AdminUsersList'
import AddAdminForm from './AddAdminForm'
import ChangePasswordForm from './ChangePasswordForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SettingsPage() {
  const { isAdmin, role } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  const isSuperAdmin = role === 'super_admin'
  const supabase = await createClient()

  const { data: adminUsers } = await supabase.from('admin_users').select('*').order('created_at', { ascending: false })
  const safeAdminUsers = Array.isArray(adminUsers) ? adminUsers : []

  const { data: siteSettings } = await supabase.from('site_settings').select('*').eq('id', 1).single()

  return (
    <div>
      <style>{`
        .st-title { font-size: 32px; font-weight: bold; color: #2C2C2C; margin-bottom: 8px; }
        .st-sub { font-size: 16px; color: #666; }
        .st-role-badge { margin-top: 8px; display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; }

        .st-card { background: white; border-radius: 16px; padding: 32px; border: 1px solid #E5E5E0; }
        .st-card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #E5E5E0; }
        .st-card-icon { width: 48px; height: 48px; border-radius: 12px; background: #F5F5F0; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
        .st-card-title { font-size: 20px; font-weight: bold; color: #2C2C2C; margin-bottom: 4px; }
        .st-card-sub { font-size: 14px; color: #666; }

        .st-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .st-stat { padding: 20px; background: #FFF8F0; border-radius: 12px; border: 1px solid #F5E5D3; }
        .st-stat-label { font-size: 13px; color: #999; margin-bottom: 8px; }
        .st-stat-value { font-size: 28px; font-weight: bold; color: #B8936D; }

        .st-info-box { padding: 20px; background: #FFF8F0; border-radius: 12px; border: 1px solid #F5E5D3; font-size: 14px; color: #B8936D; }

        @media (max-width: 1023px) {
          .st-title { font-size: 26px; }
          .st-card { padding: 24px; }
        }

        @media (max-width: 639px) {
          .st-title { font-size: 22px; }
          .st-sub { font-size: 14px; }
          .st-card { padding: 20px 16px; }
          .st-card-head { gap: 10px; }
          .st-card-icon { width: 40px; height: 40px; font-size: 20px; }
          .st-card-title { font-size: 17px; }
          .st-stats { grid-template-columns: 1fr 1fr; gap: 10px; }
          .st-stats > :last-child { grid-column: 1 / -1; }
          .st-stat { padding: 14px; }
          .st-stat-value { font-size: 22px; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="st-title">Settings</h1>
        <p className="st-sub">System configuration and admin management</p>
        <div className="st-role-badge" style={{
          backgroundColor: isSuperAdmin ? '#FEE2E2' : '#FFF8F0',
          color: isSuperAdmin ? '#EF4444' : '#B8936D'
        }}>
          {isSuperAdmin ? '👑 Super Admin' : '🔧 Admin'}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Admin Users */}
        <div className="st-card">
          <div className="st-card-head">
            <div className="st-card-icon">👥</div>
            <div>
              <div className="st-card-title">Admin Users</div>
              <p className="st-card-sub">Manage admin and super admin accounts</p>
            </div>
          </div>

          <div className="st-stats">
            {[
              { label: 'Total Admins', value: safeAdminUsers.length },
              { label: 'Super Admins', value: safeAdminUsers.filter(u => u.role === 'super_admin').length },
              { label: 'Regular Admins', value: safeAdminUsers.filter(u => u.role === 'admin').length },
            ].map((stat) => (
              <div key={stat.label} className="st-stat">
                <div className="st-stat-label">{stat.label}</div>
                <div className="st-stat-value">{stat.value}</div>
              </div>
            ))}
          </div>

          {isSuperAdmin ? (
            <AddAdminForm />
          ) : (
            <div className="st-info-box">
              ℹ️ Only <strong>Super Admins</strong> can add, edit, or delete admin users.
            </div>
          )}

          <div style={{ marginTop: '32px' }}>
            <AdminUsersList users={safeAdminUsers} isSuperAdmin={isSuperAdmin} />
          </div>
        </div>

        {/* Account Security */}
        <div className="st-card">
          <div className="st-card-head">
            <div className="st-card-icon">🔐</div>
            <div>
              <div className="st-card-title">Account Security</div>
              <p className="st-card-sub">Change your password</p>
            </div>
          </div>
          <ChangePasswordForm />
        </div>

        {/* Notifications */}
        <div className="st-card">
          <div className="st-card-head">
            <div className="st-card-icon">🔔</div>
            <div>
              <div className="st-card-title">Notifications</div>
              <p className="st-card-sub">Configure email notifications</p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <SettingToggle title="New Review Notifications" description="Get notified when a new review is submitted" settingKey="notify_new_reviews" defaultValue={siteSettings?.notify_new_reviews ?? true} />
            <SettingToggle title="New Lead Notifications" description="Get notified when someone clicks WhatsApp on a package" settingKey="notify_new_leads" defaultValue={siteSettings?.notify_new_leads ?? true} />
            <SettingToggle title="Email Digest" description="Receive a daily summary of platform activity" settingKey="email_digest" defaultValue={siteSettings?.email_digest ?? false} />
          </div>
        </div>

      </div>
    </div>
  )
}