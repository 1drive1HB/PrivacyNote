// load-Env.js
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('./env.json');
    if (!response.ok) throw new Error('Failed to load env.json');
    
    const env = await response.json();
    window.__ENV = {
      SUPABASE_URL: env.SUPABASE_URL,
      SUPABASE_KEY: env.SUPABASE_KEY
    };
    
    console.log('Local environment loaded successfully');
  } catch (error) {
    console.warn('Error loading local environment:', error.message);
    // Production will use the empty config which gets filled by GitHub Actions
  }
});