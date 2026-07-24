import { createClient } from '@supabase/supabase-js'

const trackingSupabaseUrl =
  import.meta.env.VITE_SUPABASE_TRACKING_URL

const trackingSupabaseAnonKey =
  import.meta.env.VITE_SUPABASE_TRACKING_ANON_KEY

if (
  !trackingSupabaseUrl ||
  !trackingSupabaseAnonKey
) {
  console.warn(
    'Supabase tracking não configurado.'
  )
}

const trackingSupabase = createClient(
  trackingSupabaseUrl,
  trackingSupabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
)

export function useSupabaseTracking() {
  return {
    supabase: trackingSupabase
  }
}