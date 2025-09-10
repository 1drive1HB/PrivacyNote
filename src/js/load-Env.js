// src\js\load-Env.js
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Try local development path first
    const localResponse = await fetch('./env.json');
    if (localResponse.ok) {
      const env = await localResponse.json();
      window.__ENV = {
        SUPABASE_URL: env.SUPABASE_URL,
        SUPABASE_KEY: env.SUPABASE_KEY,
        SUPABASE_TABLE_M: env.SUPABASE_TABLE_M,
        CF_TR: env.CF_TR
      };
      console.log('Local environment loaded successfully');
      return;
    }
    
    // Fall back to production path (GitHub Pages)
    const prodResponse = await fetch('/PrivacyNote/env.json');
    if (prodResponse.ok) {
      const env = await prodResponse.json();
      window.__ENV = {
        SUPABASE_URL: env.SUPABASE_URL,
        SUPABASE_KEY: env.SUPABASE_KEY,
        SUPABASE_TABLE_M: env.SUPABASE_TABLE_M,
        CF_TR: env.CF_TR
      };
      console.log('Production environment loaded successfully');
      return;
    }
    
    throw new Error('Failed to load environment from both paths');
    
  } catch (error) {
    console.error('Error loading environment:', error.message);
    // Set empty config as fallback
    window.__ENV = {
      SUPABASE_URL: '',
      SUPABASE_KEY: '',
      SUPABASE_TABLE_M: '',
      CF_TR: ''
    };
  }
});