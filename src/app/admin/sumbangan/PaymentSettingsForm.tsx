'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { savePaymentSettings } from './actions'

export default function PaymentSettingsForm({ initialSettings }: { initialSettings: any }) {
  const supabase = createClient()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploadingDuitnow, setUploadingDuitnow] = useState(false)
  const [uploadingTng, setUploadingTng] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [settingsId, setSettingsId] = useState<string | null>(initialSettings?.id || null)

  const [form, setForm] = useState({
    bank_name: initialSettings?.bank_name || '',
    account_name: initialSettings?.account_name || '',
    account_number: initialSettings?.account_number || '',
    bank_instruction: initialSettings?.bank_instruction || 'Hantar resit ke WhatsApp kami',
    duitnow_qr_url: initialSettings?.duitnow_qr_url || '',
    tng_qr_url: initialSettings?.tng_qr_url || ''
  })

  const formRef = useRef(form)
  const idRef = useRef(settingsId)

  const update = (patch: Partial<typeof form>) => {
    const next = { ...formRef.current, ...patch }
    formRef.current = next
    setForm(next)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'duitnow' | 'tng') => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('❌ Sila upload fail imej sahaja'); return }
    if (file.size > 5 * 1024 * 1024) { alert('❌ Saiz mesti kurang 5MB'); return }

    const setUploading = type === 'duitnow' ? setUploadingDuitnow : setUploadingTng
    setUploading(true)

    try {
      const ext = file.name.split('.').pop()
      const path = `qr-codes/qr-${type}-${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('public').upload(path, file)
      if (error) throw error

      const { data } = supabase.storage.from('public').getPublicUrl(path)
      update({ [`${type === 'duitnow' ? 'duitnow_qr_url' : 'tng_qr_url'}`]: data.publicUrl })
      e.target.value = ''
    } catch (err: any) {
      alert(`❌ Upload error: ${err.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const data = formRef.current
    if (!data.bank_name.trim() || !data.account_name.trim() || !data.account_number.trim()) {
      alert('❌ Sila isi semua field wajib (*)'); return
    }

    setSaving(true)
    setSaveSuccess(false)

    try {
      const result = await savePaymentSettings({ id: idRef.current, ...data })
      if (result.error) throw new Error(result.error)

      if (result.id) {
        idRef.current = result.id as string
        setSettingsId(result.id as string)
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      router.refresh()
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const busy = saving || uploadingDuitnow || uploadingTng

  return (
    <>
      <style>{`
        .pf-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px}
        .pf-field{margin-bottom:16px}
        .pf-label{display:block;font-size:13px;font-weight:600;color:#2C2C2C;margin-bottom:6px}
        .pf-req{color:#EF4444}
        .pf-input{width:100%;padding:10px 14px;font-size:14px;border:1px solid #E5E5E0;border-radius:8px;outline:none;background:#fff;color:#2C2C2C;box-sizing:border-box;font-family:inherit}
        .pf-input:focus{border-color:#B8936D}
        .pf-sep{border:none;border-top:1px solid #E5E5E0;margin:24px 0}
        .pf-sub{font-size:15px;font-weight:700;color:#2C2C2C;margin-bottom:14px}
        .pf-qr-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .pf-qr-preview{width:120px;height:120px;border-radius:8px;background-size:contain;background-position:center;background-repeat:no-repeat;background-color:#F5F5F0;border:1px solid #E5E5E0;margin-bottom:8px}
        .pf-qr-rm{padding:5px 12px;background:#FEE2E2;color:#DC2626;border:1px solid #FECACA;border-radius:6px;font-size:12px;font-weight:600;cursor:pointer}
        .pf-actions{display:flex;align-items:center;gap:14px;padding-top:20px;border-top:1px solid #E5E5E0;flex-wrap:wrap}
        .pf-save{padding:12px 28px;background:#B8936D;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px}
        .pf-save:disabled{background:#999;cursor:not-allowed}
        .pf-ok{font-size:13px;color:#10B981;font-weight:600}
        .pf-uploading{font-size:11px;background:#FEF3C7;color:#D97706;padding:3px 10px;border-radius:20px;font-weight:600}
        .pf-hint{font-size:12px;color:#F59E0B;margin-top:4px}
        @media(max-width:639px){
          .pf-row,.pf-qr-row{grid-template-columns:1fr}
          .pf-save{width:100%;justify-content:center}
          .pf-actions{flex-direction:column;align-items:stretch}
        }
      `}</style>

      <form onSubmit={handleSave}>
        <div className="pf-sub">Bank Transfer Details</div>
        <div className="pf-row">
          <div className="pf-field">
            <label className="pf-label">Bank Name <span className="pf-req">*</span></label>
            <input className="pf-input" value={form.bank_name} onChange={e => update({ bank_name: e.target.value })} placeholder="e.g. Maybank" required />
          </div>
          <div className="pf-field">
            <label className="pf-label">Account Name <span className="pf-req">*</span></label>
            <input className="pf-input" value={form.account_name} onChange={e => update({ account_name: e.target.value })} placeholder="e.g. Think Tank Sdn Bhd" required />
          </div>
        </div>
        <div className="pf-field">
          <label className="pf-label">Account Number <span className="pf-req">*</span></label>
          <input className="pf-input" value={form.account_number} onChange={e => update({ account_number: e.target.value })} placeholder="e.g. 5642 8910 1234" required style={{ fontFamily: 'monospace' }} />
        </div>
        <div className="pf-field">
          <label className="pf-label">Instruction for Donors</label>
          <textarea className="pf-input" value={form.bank_instruction} onChange={e => update({ bank_instruction: e.target.value })} rows={2} placeholder="e.g. Hantar resit ke WhatsApp kami" style={{ resize: 'vertical' }} />
        </div>

        <hr className="pf-sep" />
        <div className="pf-sub">QR Code Payment (Optional)</div>
        <div className="pf-qr-row">
          <div>
            <label className="pf-label">DuitNow QR</label>
            {form.duitnow_qr_url ? (
              <>
                <div className="pf-qr-preview" style={{ backgroundImage: `url(${form.duitnow_qr_url})` }} />
                <button type="button" className="pf-qr-rm" onClick={() => update({ duitnow_qr_url: '' })}>🗑️ Remove</button>
              </>
            ) : (
              <>
                <input type="file" accept="image/*" className="pf-input" disabled={uploadingDuitnow} onChange={e => handleUpload(e, 'duitnow')} style={{ cursor: uploadingDuitnow ? 'not-allowed' : 'pointer', padding: '8px' }} />
                {uploadingDuitnow && <div className="pf-hint">⏳ Uploading...</div>}
              </>
            )}
          </div>
          <div>
            <label className="pf-label">Touch n Go QR</label>
            {form.tng_qr_url ? (
              <>
                <div className="pf-qr-preview" style={{ backgroundImage: `url(${form.tng_qr_url})` }} />
                <button type="button" className="pf-qr-rm" onClick={() => update({ tng_qr_url: '' })}>🗑️ Remove</button>
              </>
            ) : (
              <>
                <input type="file" accept="image/*" className="pf-input" disabled={uploadingTng} onChange={e => handleUpload(e, 'tng')} style={{ cursor: uploadingTng ? 'not-allowed' : 'pointer', padding: '8px' }} />
                {uploadingTng && <div className="pf-hint">⏳ Uploading...</div>}
              </>
            )}
          </div>
        </div>

        {(form.duitnow_qr_url || form.tng_qr_url) && (
          <p style={{ fontSize: '12px', color: '#999', marginTop: '12px' }}>
            💡 Upload baru? Klik <strong>Save Settings</strong> untuk simpan.
          </p>
        )}

        <div className="pf-actions">
          <button type="submit" disabled={busy} className="pf-save">
            {saving ? '⏳ Saving...' : '💾 Save Settings'}
          </button>
          {(uploadingDuitnow || uploadingTng) && <span className="pf-uploading">⏳ Uploading image...</span>}
          {saveSuccess && <span className="pf-ok">✅ Saved!</span>}
        </div>
      </form>
    </>
  )
}