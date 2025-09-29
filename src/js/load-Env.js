// src\js\load-Env.js
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check if we're in production (GitHub Pages)
    const isProduction = window.location.hostname.includes('github.io');
    
    if (isProduction) {
      // In production, config is already built into config.js via GitHub Actions
      console.log('✅ Production environment - config injected via GitHub Secrets');
      // Set empty ENV since config.js already has all the values
      window.__ENV = {};
      return;
    }
    
    // Only in local development: try to load env.json
    console.log('🔧 Local development - loading env.json');
    const response = await fetch('./env.json');
    if (!response.ok) {
      throw new Error('env.json not found');
    }
    
    const env = await response.json();
    window.__ENV = {
      SUPABASE_URL: env.SUPABASE_URL,
      SUPABASE_KEY: env.SUPABASE_KEY,
      SUPABASE_TABLE_M: env.SUPABASE_TABLE_M,
      CF_TR: env.CF_TR,
      ENCRYPTION_KEY: env.ENCRYPTION_KEY
    };
    console.log('✅ Local environment loaded successfully');
    
  } catch (error) {
    console.error('Error loading environment:', error.message);
    // Empty fallback - config.js will handle initialization
    window.__ENV = {};
  }
});