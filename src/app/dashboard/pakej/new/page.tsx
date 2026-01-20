'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Upload, X, Plus } from 'lucide-react'

export default function NewPackagePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadingImages, setUploadingImages] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    package_type: 'standard',
    price_quad: '',
    price_triple: '',
    price_double: '',
    price_child: '',
    price_infant: '',
    duration_nights: '',
    departure_city: 'Kuala Lumpur',
    visa_type: 'Visa Umrah',
    itinerary: '',
    quota: '',
    status: 'draft',
  })
  
  const [inclusions, setInclusions] = useState([''])
  const [exclusions, setExclusions] = useState([''])
  const [departureDates, setDepartureDates] = useState([''])
  const [images, setImages] = useState<File[]>([])
  const [imagePreview, setImagePreview] = useState<string[]>([])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const addInclusion = () => setInclusions([...inclusions, ''])
  const removeInclusion = (index: number) => setInclusions(inclusions.filter((_, i) => i !== index))
  const updateInclusion = (index: number, value: string) => {
    const newInclusions = [...inclusions]
    newInclusions[index] = value
    setInclusions(newInclusions)
  }

  const addExclusion = () => setExclusions([...exclusions, ''])
  const removeExclusion = (index: number) => setExclusions(exclusions.filter((_, i) => i !== index))
  const updateExclusion = (index: number, value: string) => {
    const newExclusions = [...exclusions]
    newExclusions[index] = value
    setExclusions(newExclusions)
  }

  const addDepartureDate = () => setDepartureDates([...departureDates, ''])
  const removeDepartureDate = (index: number) => setDepartureDates(departureDates.filter((_, i) => i !== index))
  const updateDepartureDate = (index: number, value: string) => {
    const newDates = [...departureDates]
    newDates[index] = value
    setDepartureDates(newDates)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (images.length + files.length > 10) {
      setError('Maximum 10 images allowed')
      return
    }

    setImages([...images, ...files])
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
    setImagePreview(imagePreview.filter((_, i) => i !== index))
  }

  const uploadImages = async (packageId: string) => {
    const uploadedUrls: string[] = []
    
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${packageId}/${Date.now()}_${i}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('package-images')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        continue
      }

      const { data } = supabase.storage
        .from('package-images')
        .getPublicUrl(fileName)

      uploadedUrls.push(data.publicUrl)
    }
    
    return uploadedUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Get user & agency
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: agency } = await supabase
        .from('agencies')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (!agency) throw new Error('Agency not found')

      // Generate slug
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Upload images first
      setUploadingImages(true)
      const packageId = crypto.randomUUID()
      const imageUrls = await uploadImages(packageId)
      setUploadingImages(false)

      // Prepare package data
      const packageData = {
        id: packageId,
        agency_id: agency.id,
        title: formData.title,
        slug: slug,
        description: formData.description,
        package_type: formData.package_type,
        price_quad: parseFloat(formData.price_quad) || null,
        price_triple: parseFloat(formData.price_triple) || null,
        price_double: parseFloat(formData.price_double) || null,
        price_child: parseFloat(formData.price_child) || null,
        price_infant: parseFloat(formData.price_infant) || null,
        departure_dates: departureDates.filter(d => d.trim() !== ''),
        duration_nights: parseInt(formData.duration_nights) || null,
        departure_city: formData.departure_city,
        visa_type: formData.visa_type,
        itinerary: formData.itinerary,
        inclusions: inclusions.filter(i => i.trim() !== ''),
        exclusions: exclusions.filter(e => e.trim() !== ''),
        photos: imageUrls,
        quota: parseInt(formData.quota) || null,
        status: formData.status,
        is_featured: false,
      }

      const { error: insertError } = await supabase
        .from('packages')
        .insert(packageData)

      if (insertError) throw insertError

      // Success - redirect
      router.push('/dashboard/pakej')
      router.refresh()

    } catch (err: any) {
      console.error('Submit error:', err)
      setError(err.message || 'Failed to create package')
      setLoading(false)
      setUploadingImages(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Tambah Pakej Baru</h1>
        <p className="text-gray-400">Isi semua maklumat pakej umrah anda</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Maklumat Asas</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 mb-2">Tajuk Pakej *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                style={{ color: '#FFFFFF' }}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                placeholder="Contoh: Pakej Umrah 10 Hari Murah"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Penerangan *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                style={{ color: '#FFFFFF' }}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                placeholder="Terangkan pakej anda..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-2">Jenis Pakej *</label>
                <select
                  name="package_type"
                  value={formData.package_type}
                  onChange={handleChange}
                  style={{ color: '#FFFFFF' }}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="ekonomi">Ekonomi</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  style={{ color: '#FFFFFF' }}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Harga (RM)</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-2">Quad Sharing *</label>
              <input
                type="number"
                name="price_quad"
                value={formData.price_quad}
                onChange={handleChange}
                style={{ color: '#FFFFFF' }}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                placeholder="8000"
                required
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Triple Sharing</label>
              <input
                type="number"
                name="price_triple"
                value={formData.price_triple}
                onChange={handleChange}
                style={{ color: '#FFFFFF' }}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                placeholder="9000"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Double Sharing</label>
              <input
                type="number"
                name="price_double"
                value={formData.price_double}
                onChange={handleChange}
                style={{ color: '#FFFFFF' }}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                placeholder="10000"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Kanak-kanak</label>
              <input
                type="number"
                name="price_child"
                value={formData.price_child}
                onChange={handleChange}
                style={{ color: '#FFFFFF' }}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                placeholder="7000"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Bayi</label>
              <input
                type="number"
                name="price_infant"
                value={formData.price_infant}
                onChange={handleChange}
                style={{ color: '#FFFFFF' }}
                className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                placeholder="2000"
              />
            </div>
          </div>
        </div>

        {/* Travel Details */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Butiran Perjalanan</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-2">Tempoh (Malam) *</label>
                <input
                  type="number"
                  name="duration_nights"
                  value={formData.duration_nights}
                  onChange={handleChange}
                  style={{ color: '#FFFFFF' }}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  placeholder="10"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Kuota</label>
                <input
                  type="number"
                  name="quota"
                  value={formData.quota}
                  onChange={handleChange}
                  style={{ color: '#FFFFFF' }}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  placeholder="40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 mb-2">Bandar Berlepas *</label>
                <select
                  name="departure_city"
                  value={formData.departure_city}
                  onChange={handleChange}
                  style={{ color: '#FFFFFF' }}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="Kuala Lumpur">Kuala Lumpur</option>
                  <option value="Penang">Penang</option>
                  <option value="Johor Bahru">Johor Bahru</option>
                  <option value="Kota Kinabalu">Kota Kinabalu</option>
                  <option value="Kuching">Kuching</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Jenis Visa *</label>
                <input
                  type="text"
                  name="visa_type"
                  value={formData.visa_type}
                  onChange={handleChange}
                  style={{ color: '#FFFFFF' }}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  placeholder="Visa Umrah"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Tarikh Berlepas</label>
              {departureDates.map((date, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => updateDepartureDate(index, e.target.value)}
                    style={{ color: '#FFFFFF' }}
                    className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                  {departureDates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDepartureDate(index)}
                      className="p-3 text-red-400 hover:bg-red-500/10 rounded"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addDepartureDate}
                className="flex items-center gap-2 text-[#D4AF37] hover:text-[#C4A030] mt-2"
              >
                <Plus size={18} />
                <span>Tambah Tarikh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Itinerary */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Itinerari</h2>
          <textarea
            name="itinerary"
            value={formData.itinerary}
            onChange={handleChange}
            rows={8}
            style={{ color: '#FFFFFF' }}
            className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
            placeholder="Hari 1: ...&#10;Hari 2: ...&#10;Hari 3: ..."
          />
        </div>

        {/* Inclusions */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Termasuk Dalam Pakej</h2>
          {inclusions.map((inclusion, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={inclusion}
                onChange={(e) => updateInclusion(index, e.target.value)}
                style={{ color: '#FFFFFF' }}
                className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                placeholder="Contoh: Tiket penerbangan pulang pergi"
              />
              {inclusions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeInclusion(index)}
                  className="p-3 text-red-400 hover:bg-red-500/10 rounded"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addInclusion}
            className="flex items-center gap-2 text-[#D4AF37] hover:text-[#C4A030] mt-2"
          >
            <Plus size={18} />
            <span>Tambah Item</span>
          </button>
        </div>

        {/* Exclusions */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Tidak Termasuk</h2>
          {exclusions.map((exclusion, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={exclusion}
                onChange={(e) => updateExclusion(index, e.target.value)}
                style={{ color: '#FFFFFF' }}
                className="flex-1 bg-[#0A0A0A] border border-[#2A2A2A] rounded px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]"
                placeholder="Contoh: Perbelanjaan peribadi"
              />
              {exclusions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExclusion(index)}
                  className="p-3 text-red-400 hover:bg-red-500/10 rounded"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addExclusion}
            className="flex items-center gap-2 text-[#D4AF37] hover:text-[#C4A030] mt-2"
          >
            <Plus size={18} />
            <span>Tambah Item</span>
          </button>
        </div>

        {/* Images */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Gambar Pakej (Max 10)</h2>
          
          <div className="mb-4">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#2A2A2A] border-dashed rounded-lg cursor-pointer hover:border-[#D4AF37] transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="text-sm text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 5MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={images.length >= 10}
              />
            </label>
          </div>

          {imagePreview.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {imagePreview.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || uploadingImages}
            className="flex-1 bg-[#D4AF37] hover:bg-[#C4A030] text-black font-semibold py-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadingImages
              ? 'Uploading images...'
              : loading
              ? 'Saving...'
              : 'Simpan Pakej'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 border border-[#2A2A2A] text-gray-400 hover:text-white hover:border-gray-400 py-4 rounded transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}