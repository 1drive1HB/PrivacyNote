// src/js/load-Env.js
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check if we're in production (GitHub Pages)
    const isProduction = window.location.hostname.includes('github.io');

    if (isProduction) {
      // In production, config is already built into config.js via GitHub Actions
      console.log('✅ Production environment - config injected via GitHub Secrets');
      window.__ENV = {};
      return;
    }

    // Only in local development: try to load env.json
    console.log('🔧 Local development - loading env.json');

    // FIXED: Use correct path for env.json based on current page
    const isNotePage = window.location.pathname.includes('note.html');
    const envJsonPath = isNotePage ? '../env.json' : './env.json';

    console.log('Loading env.json from:', envJsonPath);

    const response = await fetch(envJsonPath);
    if (!response.ok) {
      throw new Error(`env.json not found at: ${envJsonPath}`);
    }

    const env = await response.json();
    // SECURITY: Store temporarily, will be deleted by config.js after initialization
    window.__ENV = {
      SUPABASE_URL: env.SUPABASE_URL,
      SUPABASE_KEY: env.SUPABASE_KEY,
      SUPABASE_TABLE_M: env.SUPABASE_TABLE_M,
      CF_TR: env.CF_TR,
      CF_SECRET_KEY: env.CF_SECRET_KEY,
      ENCRYPTION_KEY: env.ENCRYPTION_KEY
    };
    console.log('✅ Local environment loaded successfully (will be cleared after init)');

  } catch (error) {
    console.error('❌ Error loading environment:', error.message);
    // Empty fallback - config.js will handle initialization
    window.__ENV = {};
  }
});