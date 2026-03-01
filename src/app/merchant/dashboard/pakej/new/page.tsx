'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewPackagePage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    package_type: 'ekonomi',
    price_quad: '',
    price_triple: '',
    price_double: '',
    price_child: '',
    price_infant: '',
    departure_dates: '',
    duration_nights: '',
    departure_city: '',
    visa_type: '',
    itinerary: '',
    inclusions: '',
    exclusions: '',
    quota: '',
    status: 'draft'
  })

  const [photos, setPhotos] = useState<File[]>([])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setPhotos(Array.from(files).slice(0, 10))
  }

  const removePhoto = (i: number) => setPhotos(photos.filter((_, idx) => idx !== i))

  const uploadImages = async (agencyId: string) => {
    if (photos.length === 0) return []
    setUploading(true)
    const urls: string[] = []
    for (const photo of photos) {
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
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data: agency } = await supabase.from('agencies').select('id').eq('user_id', user.id).single()
      if (!agency) throw new Error('Agency not found')
      const photoUrls = await uploadImages(agency.id)
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      const departureDatesArray = formData.departure_dates.split(',').map(d => d.trim()).filter(Boolean)
      const inclusionsArray = formData.inclusions.split('\n').map(i => i.trim()).filter(Boolean)
      const exclusionsArray = formData.exclusions.split('\n').map(e => e.trim()).filter(Boolean)
      const { error: insertError } = await supabase.from('packages').insert({
        agency_id: agency.id,
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
        photos: photoUrls,
        quota: parseInt(formData.quota) || null,
        status: formData.status
      })
      if (insertError) throw insertError
      router.push('/merchant/dashboard/pakej')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const set = (k: string, v: string) => setFormData(p => ({ ...p, [k]: v }))
  const isBusy = loading || uploading

  return (
    <>
      <style>{`
        .np,.np *{box-sizing:border-box}
        .np{max-width:900px;width:100%;overflow:hidden}

        /* Header */
        .np-header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:24px;flex-wrap:wrap}
        .np-title{font-size:28px;font-weight:700;color:#2C2C2C;margin:0 0 4px}
        .np-sub{font-size:14px;color:#888;margin:0}
        .np-back{
          padding:10px 20px;background:#F5F5F0;color:#2C2C2C;
          border-radius:8px;font-size:14px;font-weight:600;
          text-decoration:none;white-space:nowrap;flex-shrink:0;
          transition:background .15s;display:inline-block;
        }
        .np-back:hover{background:#e8e8e3}

        /* Error */
        .np-error{padding:14px 16px;background:#FEE2E2;border:1px solid #FCA5A5;
          border-radius:8px;margin-bottom:20px;color:#991B1B;font-size:14px}

        /* Cards */
        .np-card{background:white;border-radius:14px;padding:28px;border:1px solid #E5E5E0;margin-bottom:20px}
        .np-card-title{font-size:17px;font-weight:700;color:#2C2C2C;margin:0 0 6px}
        .np-divider{border:none;border-top:1px solid #f0f0ec;margin:0 0 20px}

        /* Fields */
        .np-field{margin-bottom:18px}
        .np-field:last-child{margin-bottom:0}
        .np-label{display:block;font-size:13px;font-weight:600;color:#555;margin-bottom:6px}
        .np-req{color:#EF4444;margin-left:2px}
        .np-hint{font-size:12px;color:#aaa;margin-top:5px}

        .np-input,.np-textarea,.np-select{
          width:100%;padding:12px 14px;font-size:14px;
          border:1.5px solid #E5E5E0;border-radius:9px;
          outline:none;transition:border-color .15s;
          font-family:inherit;color:#2C2C2C;background:white;
        }
        .np-input:focus,.np-textarea:focus,.np-select:focus{border-color:#B8936D}
        .np-textarea{resize:vertical}
        .np-input[type=file]{cursor:pointer;padding:10px 12px;font-size:13px}

        /* Grids */
        .np-2col{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        .np-3col{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px}

        /* Price grid — 2 wide */
        .np-price-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}

        /* Photo preview */
        .np-photo-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:14px}
        .np-photo-wrap{position:relative}
        .np-photo-img{width:100%;height:100px;object-fit:cover;border-radius:8px;border:1.5px solid #E5E5E0;display:block}
        .np-photo-num{
          position:absolute;top:4px;left:4px;
          background:#B8936D;color:white;border-radius:50%;
          width:22px;height:22px;display:flex;align-items:center;
          justify-content:center;font-size:11px;font-weight:700;
        }
        .np-photo-del{
          position:absolute;top:4px;right:4px;
          background:#EF4444;color:white;border:none;border-radius:50%;
          width:22px;height:22px;display:flex;align-items:center;
          justify-content:center;font-size:13px;font-weight:700;
          cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,.2);
        }
        .np-photo-del:hover{background:#dc2626}

        /* Submit */
        .np-footer{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
        .np-save{
          padding:13px 28px;background:#B8936D;color:white;
          border:none;border-radius:9px;font-size:15px;font-weight:700;
          cursor:pointer;transition:background .15s;white-space:nowrap;
        }
        .np-save:hover:not(:disabled){background:#a07d5a}
        .np-save:disabled{opacity:.6;cursor:not-allowed}
        .np-cancel{
          padding:13px 24px;background:#F5F5F0;color:#555;
          border-radius:9px;font-size:15px;font-weight:700;
          text-decoration:none;display:inline-block;
          transition:background .15s;white-space:nowrap;
        }
        .np-cancel:hover{background:#e8e8e3}

        /* ── TABLET ── */
        @media(max-width:1023px){
          .np-title{font-size:24px}
          .np-card{padding:22px}
          .np-photo-grid{grid-template-columns:repeat(4,1fr)}
        }

        /* ── MOBILE ── */
        @media(max-width:639px){
          .np-header{flex-direction:column;align-items:stretch;gap:10px;margin-bottom:16px}
          .np-back{text-align:center}
          .np-title{font-size:20px}
          .np-card{padding:16px;border-radius:12px;margin-bottom:14px}
          .np-card-title{font-size:15px}

          /* All grids → single column */
          .np-2col,.np-3col,.np-price-grid{grid-template-columns:1fr;gap:0}
          .np-2col .np-field,.np-3col .np-field,.np-price-grid .np-field{margin-bottom:16px}

          /* Inclusions/exclusions stack vertically */
          .np-incexc{grid-template-columns:1fr!important}

          .np-photo-grid{grid-template-columns:repeat(3,1fr);gap:8px}
          .np-photo-img{height:80px}

          .np-footer{flex-direction:column;align-items:stretch}
          .np-save,.np-cancel{width:100%;text-align:center;padding:14px}
        }

        /* ── SMALL MOBILE ── */
        @media(max-width:380px){
          .np-card{padding:14px}
          .np-title{font-size:18px}
          .np-photo-grid{grid-template-columns:repeat(2,1fr)}
        }
      `}</style>

      <div className="np">

        {/* Header */}
        <div className="np-header">
          <div>
            <h1 className="np-title">Add New Package</h1>
            <p className="np-sub">Fill in your Umrah package details</p>
          </div>
          <Link href="/merchant/dashboard/pakej" className="np-back">← Back</Link>
        </div>

        {error && <div className="np-error">❌ {error}</div>}

        <form onSubmit={handleSubmit}>

          {/* ── Basic Info ── */}
          <div className="np-card">
            <div className="np-card-title">📋 Basic Information</div>
            <hr className="np-divider" />

            <div className="np-field">
              <label className="np-label">Package Name <span className="np-req">*</span></label>
              <input type="text" required className="np-input"
                value={formData.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. Economy Umrah Package 10 Days" />
            </div>

            <div className="np-field">
              <label className="np-label">Description</label>
              <textarea rows={5} className="np-textarea"
                value={formData.description} onChange={e => set('description', e.target.value)}
                placeholder="Describe your package..." />
            </div>

            <div className="np-2col">
              <div className="np-field">
                <label className="np-label">Package Type <span className="np-req">*</span></label>
                <select required className="np-select"
                  value={formData.package_type} onChange={e => set('package_type', e.target.value)}>
                  <option value="ekonomi">Economy</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
              <div className="np-field">
                <label className="np-label">Status <span className="np-req">*</span></label>
                <select required className="np-select"
                  value={formData.status} onChange={e => set('status', e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── Pricing ── */}
          <div className="np-card">
            <div className="np-card-title">💰 Pricing (RM)</div>
            <hr className="np-divider" />
            <div className="np-price-grid">
              <div className="np-field">
                <label className="np-label">Quad Sharing <span className="np-req">*</span></label>
                <input type="number" required step="0.01" className="np-input"
                  value={formData.price_quad} onChange={e => set('price_quad', e.target.value)}
                  placeholder="8000" />
              </div>
              <div className="np-field">
                <label className="np-label">Triple Sharing</label>
                <input type="number" step="0.01" className="np-input"
                  value={formData.price_triple} onChange={e => set('price_triple', e.target.value)}
                  placeholder="9000" />
              </div>
              <div className="np-field">
                <label className="np-label">Double Sharing</label>
                <input type="number" step="0.01" className="np-input"
                  value={formData.price_double} onChange={e => set('price_double', e.target.value)}
                  placeholder="10000" />
              </div>
              <div className="np-field">
                <label className="np-label">Child</label>
                <input type="number" step="0.01" className="np-input"
                  value={formData.price_child} onChange={e => set('price_child', e.target.value)}
                  placeholder="6000" />
              </div>
              <div className="np-field" style={{ marginBottom: 0 }}>
                <label className="np-label">Infant</label>
                <input type="number" step="0.01" className="np-input"
                  value={formData.price_infant} onChange={e => set('price_infant', e.target.value)}
                  placeholder="2000" />
              </div>
            </div>
          </div>

          {/* ── Travel Details ── */}
          <div className="np-card">
            <div className="np-card-title">✈️ Travel Details</div>
            <hr className="np-divider" />
            <div className="np-2col">
              <div className="np-field">
                <label className="np-label">Duration (Nights) <span className="np-req">*</span></label>
                <input type="number" required className="np-input"
                  value={formData.duration_nights} onChange={e => set('duration_nights', e.target.value)}
                  placeholder="9" />
              </div>
              <div className="np-field">
                <label className="np-label">Departure City</label>
                <input type="text" className="np-input"
                  value={formData.departure_city} onChange={e => set('departure_city', e.target.value)}
                  placeholder="Kuala Lumpur" />
              </div>
              <div className="np-field">
                <label className="np-label">Visa Type</label>
                <input type="text" className="np-input"
                  value={formData.visa_type} onChange={e => set('visa_type', e.target.value)}
                  placeholder="Umrah Visa" />
              </div>
              <div className="np-field">
                <label className="np-label">Quota (Seats)</label>
                <input type="number" className="np-input"
                  value={formData.quota} onChange={e => set('quota', e.target.value)}
                  placeholder="40" />
              </div>
            </div>
            <div className="np-field" style={{ marginBottom: 0 }}>
              <label className="np-label">Departure Dates (comma-separated)</label>
              <input type="text" className="np-input"
                value={formData.departure_dates} onChange={e => set('departure_dates', e.target.value)}
                placeholder="15 March 2025, 20 April 2025, 10 May 2025" />
              <div className="np-hint">e.g. 15 March 2025, 20 April 2025</div>
            </div>
          </div>

          {/* ── Itinerary ── */}
          <div className="np-card">
            <div className="np-card-title">🗓️ Itinerary</div>
            <hr className="np-divider" />
            <div className="np-field" style={{ marginBottom: 0 }}>
              <label className="np-label">Day-by-Day Schedule</label>
              <textarea rows={10} className="np-textarea"
                value={formData.itinerary} onChange={e => set('itinerary', e.target.value)}
                placeholder={'Day 1: Depart from KLIA...\nDay 2: Arrival in Jeddah...'} />
            </div>
          </div>

          {/* ── Inclusions & Exclusions ── */}
          <div className="np-card">
            <div className="np-card-title">✅ Inclusions & Exclusions</div>
            <hr className="np-divider" />
            <div className="np-2col np-incexc">
              <div className="np-field">
                <label className="np-label">✅ Included (one item per line)</label>
                <textarea rows={8} className="np-textarea"
                  value={formData.inclusions} onChange={e => set('inclusions', e.target.value)}
                  placeholder={'Return flights\n4-star hotel\nTransport\nMutawwif guide'} />
              </div>
              <div className="np-field" style={{ marginBottom: 0 }}>
                <label className="np-label">❌ Not Included (one item per line)</label>
                <textarea rows={8} className="np-textarea"
                  value={formData.exclusions} onChange={e => set('exclusions', e.target.value)}
                  placeholder={'Extra meals\nPersonal expenses\nTravel insurance'} />
              </div>
            </div>
          </div>

          {/* ── Photos ── */}
          <div className="np-card">
            <div className="np-card-title">📸 Package Photos</div>
            <hr className="np-divider" />
            <div className="np-field" style={{ marginBottom: photos.length > 0 ? 0 : undefined }}>
              <label className="np-label">Upload Photos (max 10)</label>
              <input id="image-upload" type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple className="np-input" onChange={handleImageUpload} />
              <div className="np-hint">
                {photos.length > 0
                  ? `✅ ${photos.length} photo${photos.length > 1 ? 's' : ''} selected (max 10)`
                  : '📸 Select photos (Ctrl/Cmd + click to select multiple)'}
              </div>
            </div>

            {photos.length > 0 && (
              <div>
                <div className="np-label" style={{ marginTop: 14, marginBottom: 10 }}>Photo Preview:</div>
                <div className="np-photo-grid">
                  {photos.map((photo, i) => (
                    <div key={i} className="np-photo-wrap">
                      <img src={URL.createObjectURL(photo)} alt={`Preview ${i + 1}`} className="np-photo-img" />
                      <div className="np-photo-num">{i + 1}</div>
                      <button type="button" className="np-photo-del" onClick={() => removePhoto(i)} title="Remove photo">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Submit ── */}
          <div className="np-footer">
            <button type="submit" disabled={isBusy} className="np-save">
              {uploading ? '⏳ Uploading photos...' : loading ? '⏳ Saving...' : '💾 Save Package'}
            </button>
            <Link href="/merchant/dashboard/pakej" className="np-cancel">Cancel</Link>
          </div>

        </form>
      </div>
    </>
  )
}