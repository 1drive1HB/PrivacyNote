import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { config } from '../config.js'

let supabaseClient = null

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    console.log('Initializing Supabase client...');
    
    // Additional validation
    if (!config.supabaseUrl || !config.supabaseKey) {
      const errorMsg = 'Missing Supabase configuration - check your config.js or environment variables';
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
            autoRefreshToken: false
          },
          db: { 
            schema: 'public' 
          }
        }
      );
      
      // Test connection
      (async () => {
        try {
          const { data, error } = await supabaseClient
            .from('notes')
            .select('*')
            .limit(1);
            
          if (error) {
            console.error('Supabase connection test failed:', error.message);
          } else {
            console.log('Supabase client initialized and connected successfully');
          }
        } catch (e) {
          console.error('Supabase connection test error:', e.message);
        }
      })();
      
    } catch (error) {
      console.error('Supabase client initialization failed:', error.message);
      throw error;
    }
  }
  return supabaseClient;
}