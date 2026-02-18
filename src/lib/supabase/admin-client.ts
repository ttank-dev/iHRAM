import { createClient } from '@supabase/supabase-js'

// These are injected at BUILD TIME by Next.js
// They become string literals in the built code
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || ''

// Create client only if both exist
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Helper to check availability
export function isAdminClientAvailable(): boolean {
  return supabaseAdmin !== null
}

// Debug helper (remove after testing)
if (typeof window !== 'undefined') {
  console.log('🔍 Admin Client Debug:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseServiceKey,
    clientAvailable: supabaseAdmin !== null
  })
}