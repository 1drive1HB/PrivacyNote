// export const config = {
//   supabaseUrl: import.meta.env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL,
//   supabaseKey: import.meta.env.VITE_SUPABASE_KEY || process.env.VITE_SUPABASE_KEY,
//   isProduction: import.meta.env.MODE === 'production' || process.env.NODE_ENV === 'production'
// }

export const config = {
  supabaseUrl: 'https://quksabgaubzgkupdvzya.supabase.co', // REPLACE WITH YOUR URL
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1a3NhYmdhdWJ6Z2t1cGR2enlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyMTkyNjIsImV4cCI6MjA2OTc5NTI2Mn0.hZJjFWWFwT0tAJGtPNI9uMw1dvgq_pfinFioO4TUfMU', // REPLACE WITH YOUR KEY
  isProduction: true
};

console.log('Config loaded:', config);