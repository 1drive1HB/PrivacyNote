// Simple config that works for both environments
const config = {
  supabaseUrl: window.__SUPABASE_ENV?.SUPABASE_URL || '',
  supabaseKey: window.__SUPABASE_ENV?.SUPABASE_KEY || '',
  isProduction: true
};

// Local development override
if (window.location.hostname === 'localhost' || 
    window.location.hostname === 'http://localhost:8080/') {
  config.supabaseUrl = 'https://quksabgaubzgkupdvzya.supabase.co';
  config.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1a3NhYmdhdWJ6Z2t1cGR2enlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMTkyNjIsImV4cCI6MjA2OTc5NTI2Mn0.hZJjFWWFwT0tAJGtPNI9uMw1dvgq_pfinFioO4TUfMU';
  config.isProduction = true;
}

// Validate config
if (!config.supabaseUrl || !config.supabaseKey) {
  console.error('Missing Supabase configuration');
}

// Secure logging
if (console?.log) {
  const safeConfig = {...config, supabaseKey: '***MASKED***'};
  console.log('Config loaded:', safeConfig);
}

export { config };