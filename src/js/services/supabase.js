import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { initializeConfig } from '../conf/config.js';

let supabaseClient = null

export const getSupabaseClient = async () => {
  if (!supabaseClient) {
    const config = await initializeConfig();
    
    if (!config.supabaseUrl || !config.supabaseKey) {
      throw new Error('Missing Supabase configuration');
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
            schema: 'apinotes'
          }
        }
      );
      
    } catch (error) {
      throw error;
    }
  }
  return supabaseClient;
}