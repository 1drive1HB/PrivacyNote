import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { config } from '../config.js'

let supabaseClient = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    console.log('Initializing Supabase client...');
    if (!config.supabaseUrl || !config.supabaseKey) {
      const errorMsg = 'Missing Supabase configuration - check your config.js';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    supabaseClient = createClient(
      config.supabaseUrl,
      config.supabaseKey,
      {
        auth: { persistSession: false },
        db: { schema: 'public' }
      }
    );
    console.log('Supabase client initialized');
  }
  return supabaseClient
}