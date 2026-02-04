import { checkAdminAccess } from '@/lib/admin'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SettingToggle from './SettingToggle'
import AdminUsersList from './AdminUsersList'
import AddAdminForm from './AddAdminForm'
import ChangePasswordForm from './ChangePasswordForm'
import GeneralSettings from './GeneralSettings'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SettingsPage() {
  const { isAdmin } = await checkAdminAccess()
  if (!isAdmin) redirect('/admin-login')

  const supabase = await createClient()

  // Fetch all admin users
  const { data: adminUsers } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false })

  const safeAdminUsers = Array.isArray(adminUsers) ? adminUsers : []

  // Fetch site settings
  const { data: siteSettings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .single()

  const defaultSettings = {
    platform_name: 'iHRAM - Platform Discovery Umrah',
    tagline: 'Perjalanan Anda Bermula Di Sini',
    contact_email: 'info@ihram.com.my',
    whatsapp_number: '+60 12-345 6789',
    support_email: 'support@ihram.com.my',
    company_name: 'Think Tank Sdn Bhd',
    ssm_number: '',
    address: '',
    facebook_url: '',
    instagram_url: '',
    terms_url: '',
    privacy_url: ''
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
          Settings
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#666'
        }}>
          System configuration and admin management
        </p>
      </div>

      {/* SETTINGS SECTIONS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* GENERAL SETTINGS */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid #E5E5E0'
        }}>
          <GeneralSettings settings={siteSettings || defaultSettings} />
        </div>

        {/* ADMIN USERS MANAGEMENT */}
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
              👥
            </div>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '4px'
              }}>
                Admin Users
              </h2>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Manage admin and super admin accounts
              </p>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div style={{
              padding: '20px',
              backgroundColor: '#FFF8F0',
              borderRadius: '12px',
              border: '1px solid #F5E5D3'
            }}>
              <div style={{ fontSize: '13px', color: '#999', marginBottom: '8px' }}>
                Total Admins
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#B8936D' }}>
                {safeAdminUsers.length}
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#FFF8F0',
              borderRadius: '12px',
              border: '1px solid #F5E5D3'
            }}>
              <div style={{ fontSize: '13px', color: '#999', marginBottom: '8px' }}>
                Super Admins
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#B8936D' }}>
                {safeAdminUsers.filter(u => u.role === 'super_admin').length}
              </div>
            </div>

            <div style={{
              padding: '20px',
              backgroundColor: '#FFF8F0',
              borderRadius: '12px',
              border: '1px solid #F5E5D3'
            }}>
              <div style={{ fontSize: '13px', color: '#999', marginBottom: '8px' }}>
                Regular Admins
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#B8936D' }}>
                {safeAdminUsers.filter(u => u.role === 'admin').length}
              </div>
            </div>
          </div>

          {/* Add Admin Form */}
          <AddAdminForm />

          {/* Admin Users List */}
          <div style={{ marginTop: '32px' }}>
            <AdminUsersList users={safeAdminUsers} />
          </div>
        </div>

        {/* ACCOUNT SECURITY */}
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
              🔐
            </div>
            <div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#2C2C2C',
                marginBottom: '4px'
              }}>
                Account Security
              </h2>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Change your password
              </p>
            </div>
          </div>

          <ChangePasswordForm />
        </div>

        {/* NOTIFICATIONS */}
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
      🔔
    </div>
    <div>
      <h2 style={{
        fontSize: '20px',
        fontWeight: 'bold',
        color: '#2C2C2C',
        marginBottom: '4px'
      }}>
        Notifications
      </h2>
      <p style={{ fontSize: '14px', color: '#666' }}>
        Configure email notifications
      </p>
    </div>
  </div>

  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    <SettingToggle
      title="New Review Notifications"
      description="Get notified when a new review is submitted"
      settingKey="notify_new_reviews"
      defaultValue={siteSettings?.notify_new_reviews ?? true}
    />
    <SettingToggle
      title="New Lead Notifications"
      description="Get notified when someone clicks WhatsApp on a package"
      settingKey="notify_new_leads"
      defaultValue={siteSettings?.notify_new_leads ?? true}
    />
    <SettingToggle
      title="Email Digest"
      description="Receive a daily summary of platform activity"
      settingKey="email_digest"
      defaultValue={siteSettings?.email_digest ?? false}
    />
  </div>
</div>
      </div>
    </div>
  )
}