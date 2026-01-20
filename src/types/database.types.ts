export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agencies: {
        Row: Agency
        Insert: Omit<Agency, 'id' | 'created_at'>
        Update: Partial<Omit<Agency, 'id' | 'created_at'>>
      }
      packages: {
        Row: Package
        Insert: Omit<Package, 'id' | 'created_at'>
        Update: Partial<Omit<Package, 'id' | 'created_at'>>
      }
      reviews: {
        Row: Review
        Insert: Omit<Review, 'id' | 'created_at'>
        Update: Partial<Omit<Review, 'id' | 'created_at'>>
      }
      leads: {
        Row: Lead
        Insert: Omit<Lead, 'id' | 'created_at'>
        Update: Partial<Omit<Lead, 'id' | 'created_at'>>
      }
      guides: {
        Row: Guide
        Insert: Omit<Guide, 'id' | 'created_at'>
        Update: Partial<Omit<Guide, 'id' | 'created_at'>>
      }
    }
  }
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

export interface Package {
  id: string
  created_at: string
  agency_id: string
  title: string
  slug: string
  description: string | null
  package_type: 'ekonomi' | 'standard' | 'premium' | 'vip' | null
  price_quad: number | null
  price_triple: number | null
  price_double: number | null
  price_child: number | null
  price_infant: number | null
  departure_dates: string[] | null
  duration_nights: number | null
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

export interface Review {
  id: string
  created_at: string
  agency_id: string
  package_id: string | null
  reviewer_name: string | null
  reviewer_email: string | null
  rating: number
  review_text: string | null
  travel_date: string | null
  photos: string[] | null
  is_verified: boolean
  is_approved: boolean
}

export interface Lead {
  id: string
  created_at: string
  package_id: string | null
  agency_id: string | null
  source: string
  ref_code: string | null
}

export interface Guide {
  id: string
  created_at: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  category: string | null
  is_published: boolean
}