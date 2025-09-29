import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { initializeConfig } from '../config.js'

let supabaseClient = null

export const getSupabaseClient = async () => {
  if (!supabaseClient) {
    console.log('Initializing Supabase client...');
    
    const config = await initializeConfig();
    
    if (!config.supabaseUrl || !config.supabaseKey) {
      const errorMsg = 'Missing Supabase configuration';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    try {
      supabaseClient = createClient(
        config.supabaseUrl,
        config.supabaseKey,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
          },
          db: {
            schema: 'public'
          }
        }
      );
      
    } catch (error) {
      console.error('Supabase client initialization failed:', error.message);
      throw error;
    }
  }
  return supabaseClient;
}