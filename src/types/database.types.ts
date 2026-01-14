export interface Package {
  id: string
  created_at: string
  agency_id: string
  title: string
  slug: string
  description: string | null
  package_type: 'ekonomi' | 'standard' | 'premium' | 'vip'
  price_quad: number
  price_triple: number | null
  price_double: number | null
  price_child: number | null
  price_infant: number | null
  departure_dates: string[] | null
  duration_nights: number
  departure_city: string | null
  visa_type: string | null
  itinerary: string | null
  inclusions: string[] | null
  exclusions: string[] | null
  photos: string[] | null
  quota: number | null
  status: 'draft' | 'published' | 'archived'
  is_featured: boolean
}

export interface Agency {
  id: string
  created_at: string
  name: string
  slug: string
  logo_url: string | null
  cover_url: string | null
  about: string | null
  ssm_number: string | null
  phone: string | null
  email: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  is_verified: boolean
  is_active: boolean
  user_id: string | null
}

export interface PackageWithAgency extends Package {
  agencies: Agency
}