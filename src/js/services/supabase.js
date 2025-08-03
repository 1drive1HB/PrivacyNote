import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { config } from '../config.js'

let supabaseClient = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient(
      config.supabaseUrl,
      config.supabaseKey,
      {
        auth: { persistSession: false }
      }
    )
  }
  return supabaseClient
}