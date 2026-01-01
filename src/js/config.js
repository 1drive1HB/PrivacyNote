// src/js/config.js
// SECURITY: Use closure pattern to hide sensitive config
const createSecureConfig = () => {
  // Private variables hidden from console
  let _supabaseUrl = '';
  let _supabaseKey = '';
  let _tableName = '';
  let _cfTr = '';
  let _cfSecretKey = '';
  let _encryptionKey = '';
  let _isProduction = false;

  // Public read-only proxy
  return {
    get supabaseUrl() { return _supabaseUrl; },
    get supabaseKey() { return _supabaseKey; },
    get tableName() { return _tableName; },
    get cfTr() { return _cfTr; },
    get cfSecretKey() { return _cfSecretKey; },
    get encryptionKey() { return _encryptionKey; },
    get isProduction() { return _isProduction; },
    
    // Internal setter (not enumerable)
    _setConfig(newConfig) {
      _supabaseUrl = newConfig.supabaseUrl || '';
      _supabaseKey = newConfig.supabaseKey || '';
      _tableName = newConfig.tableName || '';
      _cfTr = newConfig.cfTr || '';
      _cfSecretKey = newConfig.cfSecretKey || '';
      _encryptionKey = newConfig.encryptionKey || '';
      _isProduction = newConfig.isProduction || false;
    }
  };
};

const config = createSecureConfig();

// Make config non-writable
Object.freeze(config);

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
      const tempConfig = {
        supabaseUrl: window.__ENV.SUPABASE_URL || '',
        supabaseKey: window.__ENV.SUPABASE_KEY || '',
        tableName: window.__ENV.SUPABASE_TABLE_M || '',
        cfTr: window.__ENV.CF_TR || '',
        cfSecretKey: window.__ENV.CF_SECRET_KEY || '',
        encryptionKey: window.__ENV.ENCRYPTION_KEY || ''
      };

      // Determine if running in production
      const hostname = window.location.hostname;
      const isLocalhost = hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '[::]' ||
        window.location.href.includes('http://localhost:8080') ||
        window.location.href.includes('http://[::]:8080') ||
        window.location.href.includes('http://localhost:8080/note.html') ||
        window.location.href.includes('http://localhost:8080/index.html');

      tempConfig.isProduction = !isLocalhost;
      
      // Set config values
      config._setConfig(tempConfig);
      
      // SECURITY: Delete window.__ENV to prevent console access
      delete window.__ENV;
    }

    // Get encryption key from URL hash if available (true E2E encryption)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const urlEncryptionKey = hashParams.get('key');
    if (urlEncryptionKey) {
      config._setConfig({ ...config, encryptionKey: urlEncryptionKey });
    }

    return config;
  } catch (error) {
    console.error('Config initialization failed:', error);
    return config;
  }
};

export { config };