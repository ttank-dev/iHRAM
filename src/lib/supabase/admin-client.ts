import { createClient } from '@supabase/supabase-js'

// This uses environment variables that are prefixed with NEXT_PUBLIC_
// So they're safe to use in client components
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!, // We'll add this
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)