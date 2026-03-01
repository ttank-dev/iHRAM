'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function EditPackagePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: '', description: '', package_type: 'ekonomi',
    price_quad: '', price_triple: '', price_double: '',
    price_child: '', price_infant: '',
    departure_dates: '', duration_nights: '',
    departure_city: '', visa_type: '',
    itinerary: '', inclusions: '', exclusions: '',
    quota: '', status: 'draft'
  })

  const [existingPhotos, setExistingPhotos] = useState<string[]>([])
  const [newPhotos, setNewPhotos] = useState<File[]>([])

  useEffect(() => { loadPackage() }, [])

  const loadPackage = async () => {
    try {
      const { data: pkg, error } = await supabase.from('packages').select('*').eq('id', params.id).single()
      if (error) throw error
      if (!pkg) throw new Error('Package not found')
      setFormData({
        title: pkg.title || '', description: pkg.description || '',
        package_type: pkg.package_type || 'ekonomi',
        price_quad: pkg.price_quad?.toString() || '',
        price_triple: pkg.price_triple?.toString() || '',
        price_double: pkg.price_double?.toString() || '',
        price_child: pkg.price_child?.toString() || '',
        price_infant: pkg.price_infant?.toString() || '',
        departure_dates: pkg.departure_dates?.join(', ') || '',
        duration_nights: pkg.duration_nights?.toString() || '',
        departure_city: pkg.departure_city || '',
        visa_type: pkg.visa_type || '',
        itinerary: pkg.itinerary || '',
        inclusions: pkg.inclusions?.join('\n') || '',
        exclusions: pkg.exclusions?.join('\n') || '',
        quota: pkg.quota?.toString() || '',
        status: pkg.status || 'draft'
      })
      setExistingPhotos(pkg.photos || [])
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    setNewPhotos(Array.from(files).slice(0, 10 - existingPhotos.length))
  }

  const removeExistingPhoto = (url: string) =>
    setExistingPhotos(existingPhotos.filter(p => p !== url))

  const removeNewPhoto = (i: number) =>
    setNewPhotos(newPhotos.filter((_, idx) => idx !== i))

  const uploadImages = async (agencyId: string) => {
    if (newPhotos.length === 0) return []
    setUploading(true)
    const urls: string[] = []
    for (const photo of newPhotos) {
      const fileExt = photo.name.split('.').pop()
      const fileName = `${agencyId}/${Date.now()}-${Math.random()}.${fileExt}`
      const { error } = await supabase.storage.from('package-images').upload(fileName, photo)
      if (error) { console.error('Upload error:', error); continue }
      const { data: { publicUrl } } = supabase.storage.from('package-images').getPublicUrl(fileName)
      urls.push(publicUrl)
    }
    setUploading(false)
    return urls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data: agency } = await supabase.from('agencies').select('id').eq('user_id', user.id).single()
      if (!agency) throw new Error('Agency not found')
      const newPhotoUrls = await uploadImages(agency.id)
      const allPhotos = [...existingPhotos, ...newPhotoUrls]
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      const departureDatesArray = formData.departure_dates.split(',').map(d => d.trim()).filter(Boolean)
      const inclusionsArray = formData.inclusions.split('\n').map(i => i.trim()).filter(Boolean)
      const exclusionsArray = formData.exclusions.split('\n').map(e => e.trim()).filter(Boolean)
      const { error: updateError } = await supabase.from('packages').update({
        title: formData.title, slug,
        description: formData.description,
        package_type: formData.package_type,
        price_quad: parseFloat(formData.price_quad) || null,
        price_triple: parseFloat(formData.price_triple) || null,
        price_double: parseFloat(formData.price_double) || null,
        price_child: parseFloat(formData.price_child) || null,
        price_infant: parseFloat(formData.price_infant) || null,
        departure_dates: departureDatesArray,
        duration_nights: parseInt(formData.duration_nights) || null,
        departure_city: formData.departure_city,
        visa_type: formData.visa_type,
        itinerary: formData.itinerary,
        inclusions: inclusionsArray,
        exclusions: exclusionsArray,
        photos: allPhotos,
        quota: parseInt(formData.quota) || null,
        status: formData.status
      }).eq('id', params.id)
      if (updateError) throw updateError
      router.push('/merchant/dashboard/pakej')
    } catch (err: any) {
      setError(err.message)
      setSaving(false)
    }
  }

  const set = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }))
  const isBusy = saving || uploading

  /* ── LOADING ── */
  if (loading) return (
    <>
      <div className="ep-load"><div className="ep-spin" /><p>Loading package...</p></div>
      <style>{`.ep-load{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:400px;gap:16px;color:#999}.ep-spin{width:36px;height:36px;border:3px solid #e5e5e5;border-top-color:#B8936D;border-radius:50%;animation:eps .7s linear infinite}@keyframes eps{to{transform:rotate(360deg)}}`}</style>
    </>
  )

  return (
    <>
      <style>{`
        .ep,.ep *{box-sizing:border-box}
        .ep{max-width:900px;width:100%;overflow:hidden}

        /* Header */
        .ep-header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:24px;flex-wrap:wrap}
        .ep-title{font-size:28px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .ep-sub{font-size:14px;color:#888;margin:0}
        .ep-back{
          padding:10px 20px;background:#F5F5F0;color:#2C2C2C;
          border-radius:8px;font-size:14px;font-weight:600;
          text-decoration:none;white-space:nowrap;flex-shrink:0;
          transition:background .15s;display:inline-block;
        }
        .ep-back:hover{background:#e8e8e3}

        /* Error */
        .ep-error{padding:14px 16px;background:#FEE2E2;border:1px solid #FCA5A5;
          border-radius:8px;margin-bottom:20px;color:#991B1B;font-size:14px}

        /* Cards */
        .ep-card{background:white;border-radius:14px;padding:28px;border:1px solid #E5E5E0;margin-bottom:20px}
        .ep-card-title{font-size:17px;font-weight:700;color:#2C2C2C;margin:0 0 6px}
        .ep-divider{border:none;border-top:1px solid #f0f0ec;margin:0 0 20px}

        /* Fields */
        .ep-field{margin-bottom:18px}
        .ep-field:last-child{margin-bottom:0}
        .ep-label{display:block;font-size:13px;font-weight:600;color:#555;margin-bottom:6px}
        .ep-req{color:#EF4444;margin-left:2px}
        .ep-hint{font-size:12px;color:#aaa;margin-top:5px}

        .ep-input,.ep-textarea,.ep-select{
          width:100%;padding:12px 14px;font-size:14px;
          border:1.5px solid #E5E5E0;border-radius:9px;
          outline:none;transition:border-color .15s;
          font-family:inherit;color:#2C2C2C;background:white;
        }
        .ep-input:focus,.ep-textarea:focus,.ep-select:focus{border-color:#B8936D}
        .ep-textarea{resize:vertical}
        .ep-input[type=file]{cursor:pointer;padding:10px 12px;font-size:13px}

        /* Grids */
        .ep-2col{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .ep-price-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}

        /* Existing photos */
        .ep-existing-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
        .ep-ex-wrap{position:relative}
        .ep-ex-img{width:100%;height:120px;object-fit:cover;border-radius:8px;border:1.5px solid #E5E5E0;display:block}
        .ep-ex-del{
          position:absolute;top:6px;right:6px;
          background:#EF4444;color:white;border:none;border-radius:50%;
          width:24px;height:24px;display:flex;align-items:center;
          justify-content:center;font-size:13px;font-weight:700;
          cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,.2);
        }
        .ep-ex-del:hover{background:#dc2626}
        .ep-ex-num{
          position:absolute;top:6px;left:6px;
          background:#B8936D;color:white;border-radius:50%;
          width:22px;height:22px;display:flex;align-items:center;
          justify-content:center;font-size:11px;font-weight:700;
        }
        .ep-ex-count{font-size:12px;color:#888;margin-bottom:12px}

        /* New photo preview */
        .ep-photo-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:14px}
        .ep-photo-wrap{position:relative}
        .ep-photo-img{width:100%;height:100px;object-fit:cover;border-radius:8px;border:1.5px solid #E5E5E0;display:block}
        .ep-photo-num{
          position:absolute;top:4px;left:4px;
          background:#B8936D;color:white;border-radius:50%;
          width:22px;height:22px;display:flex;align-items:center;
          justify-content:center;font-size:11px;font-weight:700;
        }
        .ep-photo-del{
          position:absolute;top:4px;right:4px;
          background:#EF4444;color:white;border:none;border-radius:50%;
          width:22px;height:22px;display:flex;align-items:center;
          justify-content:center;font-size:13px;font-weight:700;
          cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,.2);
        }
        .ep-photo-del:hover{background:#dc2626}

        /* Submit */
        .ep-footer{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
        .ep-save{
          padding:13px 28px;background:#B8936D;color:white;
          border:none;border-radius:9px;font-size:15px;font-weight:700;
          cursor:pointer;transition:background .15s;white-space:nowrap;
        }
        .ep-save:hover:not(:disabled){background:#a07d5a}
        .ep-save:disabled{opacity:.6;cursor:not-allowed}
        .ep-cancel{
          padding:13px 24px;background:#F5F5F0;color:#555;
          border-radius:9px;font-size:15px;font-weight:700;
          text-decoration:none;display:inline-block;
          transition:background .15s;white-space:nowrap;
        }
        .ep-cancel:hover{background:#e8e8e3}

        /* ── TABLET ── */
        @media(max-width:1023px){
          .ep-title{font-size:24px}
          .ep-card{padding:22px}
          .ep-existing-grid{grid-template-columns:repeat(3,1fr)}
          .ep-photo-grid{grid-template-columns:repeat(4,1fr)}
        }

        /* ── MOBILE ── */
        @media(max-width:639px){
          .ep-header{flex-direction:column;align-items:stretch;gap:10px;margin-bottom:16px}
          .ep-back{text-align:center}
          .ep-title{font-size:20px}
          .ep-card{padding:16px;border-radius:12px;margin-bottom:14px}
          .ep-card-title{font-size:15px}

          .ep-2col,.ep-price-grid{grid-template-columns:1fr;gap:0}
          .ep-2col .ep-field,.ep-price-grid .ep-field{margin-bottom:16px}
          .ep-incexc{grid-template-columns:1fr!important}

          .ep-existing-grid{grid-template-columns:repeat(2,1fr);gap:8px}
          .ep-ex-img{height:90px}

          .ep-photo-grid{grid-template-columns:repeat(3,1fr);gap:8px}
          .ep-photo-img{height:80px}

          .ep-footer{flex-direction:column;align-items:stretch}
          .ep-save,.ep-cancel{width:100%;text-align:center;padding:14px}
        }

        /* ── SMALL MOBILE ── */
        @media(max-width:380px){
          .ep-card{padding:14px}
          .ep-title{font-size:18px}
          .ep-existing-grid{grid-template-columns:repeat(2,1fr)}
          .ep-photo-grid{grid-template-columns:repeat(2,1fr)}
        }
      `}</style>

      <div className="ep">

        {/* Header */}
        <div className="ep-header">
          <div>
            <h1 className="ep-title">✏️ Edit Package</h1>
            <p className="ep-sub">Update your Umrah package details</p>
          </div>
          <Link href="/merchant/dashboard/pakej" className="ep-back">← Back</Link>
        </div>

        {error && <div className="ep-error">❌ {error}</div>}

        <form onSubmit={handleSubmit}>

          {/* ── Basic Info ── */}
          <div className="ep-card">
            <div className="ep-card-title">📋 Basic Information</div>
            <hr className="ep-divider" />

            <div className="ep-field">
              <label className="ep-label">Package Name <span className="ep-req">*</span></label>
              <input type="text" required className="ep-input"
                value={formData.title} onChange={e => set('title', e.target.value)} />
            </div>

            <div className="ep-field">
              <label className="ep-label">Description</label>
              <textarea rows={5} className="ep-textarea"
                value={formData.description} onChange={e => set('description', e.target.value)}
                placeholder="Describe your package..." />
            </div>

            <div className="ep-2col">
              <div className="ep-field">
                <label className="ep-label">Package Type <span className="ep-req">*</span></label>
                <select required className="ep-select"
                  value={formData.package_type} onChange={e => set('package_type', e.target.value)}>
                  <option value="ekonomi">Economy</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div className="ep-field">
                <label className="ep-label">Status <span className="ep-req">*</span></label>
                <select required className="ep-select"
                  value={formData.status} onChange={e => set('status', e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Pricing ── */}
          <div className="ep-card">
            <div className="ep-card-title">💰 Pricing (RM)</div>
            <hr className="ep-divider" />
            <div className="ep-price-grid">
              <div className="ep-field">
                <label className="ep-label">Quad Sharing <span className="ep-req">*</span></label>
                <input type="number" required step="0.01" className="ep-input"
                  value={formData.price_quad} onChange={e => set('price_quad', e.target.value)} />
              </div>
              <div className="ep-field">
                <label className="ep-label">Triple Sharing</label>
                <input type="number" step="0.01" className="ep-input"
                  value={formData.price_triple} onChange={e => set('price_triple', e.target.value)} />
              </div>
              <div className="ep-field">
                <label className="ep-label">Double Sharing</label>
                <input type="number" step="0.01" className="ep-input"
                  value={formData.price_double} onChange={e => set('price_double', e.target.value)} />
              </div>
              <div className="ep-field">
                <label className="ep-label">Child</label>
                <input type="number" step="0.01" className="ep-input"
                  value={formData.price_child} onChange={e => set('price_child', e.target.value)} />
              </div>
              <div className="ep-field" style={{ marginBottom: 0 }}>
                <label className="ep-label">Infant</label>
                <input type="number" step="0.01" className="ep-input"
                  value={formData.price_infant} onChange={e => set('price_infant', e.target.value)} />
              </div>
            </div>
          </div>

          {/* ── Travel Details ── */}
          <div className="ep-card">
            <div className="ep-card-title">✈️ Travel Details</div>
            <hr className="ep-divider" />
            <div className="ep-2col">
              <div className="ep-field">
                <label className="ep-label">Duration (Nights) <span className="ep-req">*</span></label>
                <input type="number" required className="ep-input"
                  value={formData.duration_nights} onChange={e => set('duration_nights', e.target.value)}
                  placeholder="9" />
              </div>
              <div className="ep-field">
                <label className="ep-label">Departure City</label>
                <input type="text" className="ep-input"
                  value={formData.departure_city} onChange={e => set('departure_city', e.target.value)}
                  placeholder="Kuala Lumpur" />
              </div>
              <div className="ep-field">
                <label className="ep-label">Visa Type</label>
                <input type="text" className="ep-input"
                  value={formData.visa_type} onChange={e => set('visa_type', e.target.value)}
                  placeholder="Umrah Visa" />
              </div>
              <div className="ep-field">
                <label className="ep-label">Quota (Seats)</label>
                <input type="number" className="ep-input"
                  value={formData.quota} onChange={e => set('quota', e.target.value)}
                  placeholder="40" />
              </div>
            </div>
            <div className="ep-field" style={{ marginBottom: 0 }}>
              <label className="ep-label">Departure Dates (comma-separated)</label>
              <input type="text" className="ep-input"
                value={formData.departure_dates} onChange={e => set('departure_dates', e.target.value)}
                placeholder="15 March 2025, 20 April 2025" />
              <div className="ep-hint">Separate multiple dates with commas</div>
            </div>
          </div>

          {/* ── Itinerary ── */}
          <div className="ep-card">
            <div className="ep-card-title">🗓️ Itinerary</div>
            <hr className="ep-divider" />
            <div className="ep-field" style={{ marginBottom: 0 }}>
              <label className="ep-label">Day-by-Day Schedule</label>
              <textarea rows={10} className="ep-textarea"
                value={formData.itinerary} onChange={e => set('itinerary', e.target.value)}
                placeholder={'Day 1: Depart from KLIA...\nDay 2: Arrival in Jeddah...'} />
            </div>
          </div>

          {/* ── Inclusions & Exclusions ── */}
          <div className="ep-card">
            <div className="ep-card-title">✅ Inclusions & Exclusions</div>
            <hr className="ep-divider" />
            <div className="ep-2col ep-incexc">
              <div className="ep-field">
                <label className="ep-label">✅ Included (one item per line)</label>
                <textarea rows={8} className="ep-textarea"
                  value={formData.inclusions} onChange={e => set('inclusions', e.target.value)}
                  placeholder={'Return flights\n4-star hotel\nTransport'} />
              </div>
              <div className="ep-field" style={{ marginBottom: 0 }}>
                <label className="ep-label">❌ Not Included (one item per line)</label>
                <textarea rows={8} className="ep-textarea"
                  value={formData.exclusions} onChange={e => set('exclusions', e.target.value)}
                  placeholder={'Extra meals\nPersonal expenses\nTravel insurance'} />
              </div>
            </div>
          </div>

          {/* ── Existing Photos ── */}
          {existingPhotos.length > 0 && (
            <div className="ep-card">
              <div className="ep-card-title">🖼️ Current Photos</div>
              <hr className="ep-divider" />
              <div className="ep-ex-count">{existingPhotos.length} photo{existingPhotos.length > 1 ? 's' : ''} — click ✕ to remove</div>
              <div className="ep-existing-grid">
                {existingPhotos.map((url, i) => (
                  <div key={i} className="ep-ex-wrap">
                    <img src={url} alt={`Photo ${i + 1}`} className="ep-ex-img" />
                    <div className="ep-ex-num">{i + 1}</div>
                    <button type="button" className="ep-ex-del" onClick={() => removeExistingPhoto(url)} title="Remove photo">✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Add New Photos ── */}
          <div className="ep-card">
            <div className="ep-card-title">➕ Add New Photos</div>
            <hr className="ep-divider" />
            <div className="ep-field" style={{ marginBottom: newPhotos.length > 0 ? 0 : undefined }}>
              <label className="ep-label">
                Upload Photos
                {existingPhotos.length > 0 && (
                  <span style={{ fontWeight: 400, color: '#aaa', marginLeft: 6 }}>
                    (max {10 - existingPhotos.length} more)
                  </span>
                )}
              </label>
              <input type="file" accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple className="ep-input" onChange={handleImageUpload} />
              <div className="ep-hint">
                {newPhotos.length > 0
                  ? `✅ ${newPhotos.length} new photo${newPhotos.length > 1 ? 's' : ''} selected`
                  : 'No new photos selected'}
              </div>
            </div>

            {newPhotos.length > 0 && (
              <div>
                <div className="ep-label" style={{ marginTop: 14, marginBottom: 10 }}>New Photo Preview:</div>
                <div className="ep-photo-grid">
                  {newPhotos.map((photo, i) => (
                    <div key={i} className="ep-photo-wrap">
                      <img src={URL.createObjectURL(photo)} alt={`New ${i + 1}`} className="ep-photo-img" />
                      <div className="ep-photo-num">{i + 1}</div>
                      <button type="button" className="ep-photo-del" onClick={() => removeNewPhoto(i)} title="Remove">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Submit ── */}
          <div className="ep-footer">
            <button type="submit" disabled={isBusy} className="ep-save">
              {uploading ? '⏳ Uploading photos...' : saving ? '⏳ Saving...' : '💾 Save Changes'}
            </button>
            <Link href="/merchant/dashboard/pakej" className="ep-cancel">Cancel</Link>
          </div>

        </form>
      </div>
    </>
  )
}