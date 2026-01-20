'use client'

import { useState } from 'react'
import { submitReview } from './actions'

type Agency = {
  id: string
  name: string
}

type Package = {
  id: string
  title: string
  agency_id: string
  departure_dates: string[]
}

export default function ReviewForm({ 
  agencies, 
  packages 
}: { 
  agencies: Agency[]
  packages: Package[]
}) {
  const [selectedAgency, setSelectedAgency] = useState('')
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([])
  const [travelDate, setTravelDate] = useState('')
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const handleAgencyChange = (agencyId: string) => {
    setSelectedAgency(agencyId)
    setTravelDate('')
    
    if (agencyId) {
      const filtered = packages.filter(pkg => pkg.agency_id === agencyId)
      setFilteredPackages(filtered)
    } else {
      setFilteredPackages([])
    }
  }

  const handlePackageChange = (packageId: string) => {
    if (packageId) {
      const selectedPackage = packages.find(pkg => pkg.id === packageId)
      if (selectedPackage && selectedPackage.departure_dates && selectedPackage.departure_dates.length > 0) {
        setTravelDate(selectedPackage.departure_dates[0])
      }
    } else {
      setTravelDate('')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const fileArray = Array.from(files).slice(0, 3)
    const previews: string[] = []

    fileArray.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        previews.push(reader.result as string)
        if (previews.length === fileArray.length) {
          setImagePreviews(previews)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <form action={submitReview} style={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: '8px', padding: '32px' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#E5E5E5', fontWeight: '500' }}>
          Nama <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <input
          type="text"
          name="name"
          required
          placeholder="Nama penuh anda"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#0A0A0A',
            border: '1px solid #2A2A2A',
            borderRadius: '6px',
            color: 'white',
            fontSize: '16px'
          }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#E5E5E5', fontWeight: '500' }}>
          Email <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <input
          type="email"
          name="email"
          required
          placeholder="email@example.com"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#0A0A0A',
            border: '1px solid #2A2A2A',
            borderRadius: '6px',
            color: 'white',
            fontSize: '16px'
          }}
        />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#E5E5E5', fontWeight: '500' }}>
          Pilih Agensi <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <select
          name="agency_id"
          required
          value={selectedAgency}
          onChange={(e) => handleAgencyChange(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#0A0A0A',
            border: '1px solid #2A2A2A',
            borderRadius: '6px',
            color: 'white',
            fontSize: '16px'
          }}
        >
          <option value="">-- Pilih Agensi --</option>
          {agencies.map((agency) => (
            <option key={agency.id} value={agency.id}>
              {agency.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#E5E5E5', fontWeight: '500' }}>
          Pilih Pakej (Optional)
        </label>
        <select
          name="package_id"
          disabled={!selectedAgency}
          onChange={(e) => handlePackageChange(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#0A0A0A',
            border: '1px solid #2A2A2A',
            borderRadius: '6px',
            color: 'white',
            fontSize: '16px',
            opacity: !selectedAgency ? 0.5 : 1,
            cursor: !selectedAgency ? 'not-allowed' : 'pointer'
          }}
        >
          <option value="">
            {!selectedAgency ? '-- Pilih agensi dahulu --' : '-- Pilih Pakej (Optional) --'}
          </option>
          {filteredPackages.map((pkg) => (
            <option key={pkg.id} value={pkg.id}>
              {pkg.title}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#E5E5E5', fontWeight: '500' }}>
          Rating <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <select
          name="rating"
          required
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#0A0A0A',
            border: '1px solid #2A2A2A',
            borderRadius: '6px',
            color: 'white',
            fontSize: '16px'
          }}
        >
          <option value="">-- Pilih Rating --</option>
          <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
          <option value="4">⭐⭐⭐⭐ (4 - Good)</option>
          <option value="3">⭐⭐⭐ (3 - Average)</option>
          <option value="2">⭐⭐ (2 - Below Average)</option>
          <option value="1">⭐ (1 - Poor)</option>
        </select>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#E5E5E5', fontWeight: '500' }}>
          Ulasan <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <textarea
          name="review_text"
          required
          rows={6}
          placeholder="Kongsi pengalaman umrah anda... (50-500 patah perkataan)"
          minLength={50}
          maxLength={500}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#0A0A0A',
            border: '1px solid #2A2A2A',
            borderRadius: '6px',
            color: 'white',
            fontSize: '16px',
            resize: 'vertical'
          }}
        />
        <p style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
          Minimum 50 patah perkataan, maksimum 500 patah perkataan
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#E5E5E5', fontWeight: '500' }}>
          Tarikh Travel
        </label>
        <input
          type="text"
          name="travel_date"
          value={travelDate}
          onChange={(e) => setTravelDate(e.target.value)}
          placeholder="Contoh: Januari 2024"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#0A0A0A',
            border: '1px solid #2A2A2A',
            borderRadius: '6px',
            color: 'white',
            fontSize: '16px'
          }}
        />
        <p style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
          Auto-fill bila pilih pakej, atau tulis sendiri
        </p>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#E5E5E5', fontWeight: '500' }}>
          Upload Gambar (Optional)
        </label>
        <input
          type="file"
          name="images"
          accept="image/*"
          multiple
          onChange={handleImageChange}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#0A0A0A',
            border: '1px solid #2A2A2A',
            borderRadius: '6px',
            color: 'white',
            fontSize: '16px'
          }}
        />
        <p style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
          Maximum 3 gambar (JPG, PNG)
        </p>

        {imagePreviews.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
            {imagePreviews.map((preview, index) => (
              <img
                key={index}
                src={preview}
                alt={`Preview ${index + 1}`}
                style={{
                  width: '100%',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  border: '1px solid #2A2A2A'
                }}
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="submit"
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: '#D4AF37',
          color: 'black',
          border: 'none',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        Hantar Ulasan
      </button>

      <p style={{ color: '#A0A0A0', fontSize: '14px', marginTop: '16px', textAlign: 'center' }}>
        Ulasan akan disemak oleh admin sebelum dipublish
      </p>
    </form>
  )
}