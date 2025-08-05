// config.js
const config = {
  supabaseUrl: '',
  supabaseKey: '',
  isProduction: true
};

// Try to load from window.__ENV first (set by load-Env.js)
if (window.__ENV) {
  config.supabaseUrl = window.__ENV.SUPABASE_URL;
  config.supabaseKey = window.__ENV.SUPABASE_KEY;
}

// Validate config
if (!config.supabaseUrl || !config.supabaseKey) {
  console.error('Missing Supabase configuration');
}

// Secure logging
console.log('Config loaded:', { 
  ...config, 
  supabaseKey: config.supabaseKey ? '***MASKED***' : 'MISSING',
  isProduction: config.isProduction ? '***MASKED***' : 'MISSING',
});

export { config };