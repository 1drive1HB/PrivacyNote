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
      
      // Test connection
      try {
        const { error } = await supabaseClient
          .rpc('get_and_delete_note', { note_id: '00000000-0000-0000-0000-000000000000' });
          
        if (error && error.code !== '22P02') {
          console.error('Supabase connection test failed:', error.message);
        } else {
          console.log('Supabase client initialized successfully');
        }
      } catch (e) {
        console.error('Supabase connection test error:', e.message);
      }
      
    } catch (error) {
      console.error('Supabase client initialization failed:', error.message);
      throw error;
    }
  }
  return supabaseClient;
}