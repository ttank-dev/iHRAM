'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface SettingToggleProps {
  title: string
  description: string
  settingKey: string
  defaultValue?: boolean
}

export default function SettingToggle({ title, description, settingKey, defaultValue = false }: SettingToggleProps) {
  const supabase = createClient()
  const [enabled, setEnabled] = useState(defaultValue)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    const newValue = !enabled
    setEnabled(newValue)
    setLoading(true)
    try {
      const { error } = await supabase.from('site_settings').update({ [settingKey]: newValue }).eq('id', 1)
      if (error) { setEnabled(!newValue); throw error }
    } catch (error: any) {
      alert(`❌ Failed to update setting: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', backgroundColor: '#F5F5F0', borderRadius: '12px', gap: '16px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: '600', color: '#2C2C2C', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '13px', color: '#666' }}>{description}</div>
      </div>
      <button onClick={handleToggle} disabled={loading} style={{
        position: 'relative', width: '52px', height: '28px',
        backgroundColor: enabled ? '#B8936D' : '#D1D5DB', borderRadius: '14px', border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s',
        opacity: loading ? 0.6 : 1, flexShrink: 0
      }}>
        <div style={{
          position: 'absolute', top: '2px', left: enabled ? '26px' : '2px',
          width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '50%',
          transition: 'left 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }} />
      </button>
    </div>
  )
}