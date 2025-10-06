// src/js/config.js
const config = {
  supabaseUrl: '',
  supabaseKey: '',
  tableName: '',
  cfTr: '',
  cfSecretKey: '',
  encryptionKey: '',
  isProduction: false
};

export const initializeConfig = async () => {
  try {
    // Wait for load-Env.js or env.js to populate window.__ENV
    let waitCount = 0;
    while (!window.__ENV && waitCount < 20) {
      await new Promise(resolve => setTimeout(resolve, 100));
      waitCount++;
    }

    if (window.__ENV) {
      // Load environment from window.__ENV (Development Path)
      config.supabaseUrl = window.__ENV.SUPABASE_URL || '';
      config.supabaseKey = window.__ENV.SUPABASE_KEY || '';
      config.tableName = window.__ENV.SUPABASE_TABLE_M || '';
      config.cfTr = window.__ENV.CF_TR || '';
      config.cfSecretKey = window.__ENV.CF_SECRET_KEY || '';
      config.encryptionKey = window.__ENV.ENCRYPTION_KEY || '';

      // Determine if running in production
      const hostname = window.location.hostname;
      const isLocalhost = hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '[::]' ||
        window.location.href.includes('http://localhost:8080') ||
        window.location.href.includes('http://[::]:8080') ||
        window.location.href.includes('http://localhost:8080/note.html') ||
        window.location.href.includes('http://localhost:8080/index.html');

      config.isProduction = !isLocalhost;
    }

    // Get encryption key from URL hash if available (true E2E encryption)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const urlEncryptionKey = hashParams.get('key');
    if (urlEncryptionKey) {
      config.encryptionKey = urlEncryptionKey;
      //console.log('Using URL hash encryption key');
    }

    return config;
  } catch (error) {
    console.error('Config initialization failed:', error);
    return config;
  }
};

export { config };