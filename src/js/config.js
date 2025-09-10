//src\js\config.js
const config = {
  supabaseUrl: '',
  supabaseKey: '',
  tableName: '', // Default table name notes
  isProduction: false
};

export const initializeConfig = async () => {
  try {
    let waitCount = 0;
    while (!window.__ENV && waitCount < 20) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waitCount++;
    }

    if (window.__ENV) {
      config.supabaseUrl = window.__ENV.SUPABASE_URL || '';
      config.supabaseKey = window.__ENV.SUPABASE_KEY || '';
      config.tableName = window.__ENV.SUPABASE_TABLE_M || 'notes';
      config.isProduction = !(window.location.hostname === 'http://127.0.0.1:8080' || 
                                          window.location.hostname === 'localhost' ||
                                          window.location.hostname === '127.0.0.1');
    }

    console.log('Config loaded:', { 
      ...config, 
      supabaseKey: '***MASKED***',
      supabaseUrl: config.supabaseUrl ? '***MASKED***' : 'MISSING'
    });

    return config;
  } catch (error) {
    console.error('Config initialization failed:', error);
    return config;
  }
};

export { config };