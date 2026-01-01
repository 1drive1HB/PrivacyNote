// src/js/conf/config.js - UNIFIED CONFIG (Dev + Prod)
// This file is overwritten by GitHub Actions in production with XOR encrypted values
// In development, it reads from window.__ENV (populated by load-Env.js)

// Check if running in production (this will be true when GitHub Actions builds)
const isProductionBuild = typeof XOR_KEY !== 'undefined';

// XOR decryption function (only used in production builds)
const xorDecrypt = (encoded, key) => {
  try {
    const text = atob(encoded);
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch {
    return "";
  }
};

// SECURITY: Use closure pattern to hide sensitive config
const createSecureConfig = () => {
  // Private variables (hidden from console inspection)
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
      if (newConfig.supabaseUrl !== undefined) _supabaseUrl = newConfig.supabaseUrl;
      if (newConfig.supabaseKey !== undefined) _supabaseKey = newConfig.supabaseKey;
      if (newConfig.tableName !== undefined) _tableName = newConfig.tableName;
      if (newConfig.cfTr !== undefined) _cfTr = newConfig.cfTr;
      if (newConfig.cfSecretKey !== undefined) _cfSecretKey = newConfig.cfSecretKey;
      if (newConfig.encryptionKey !== undefined) _encryptionKey = newConfig.encryptionKey;
      if (newConfig.isProduction !== undefined) _isProduction = newConfig.isProduction;
    }
  };
};

const config = createSecureConfig();
Object.freeze(config);

export const initializeConfig = async () => {
  try {
    // PRODUCTION PATH: Config built by GitHub Actions with XOR encryption
    if (isProductionBuild) {
      config._setConfig({
        supabaseUrl: xorDecrypt(ENCRYPTED_VALUES.supabaseUrl, XOR_KEY),
        supabaseKey: xorDecrypt(ENCRYPTED_VALUES.supabaseKey, XOR_KEY),
        tableName: xorDecrypt(ENCRYPTED_VALUES.tableName, XOR_KEY),
        cfTr: xorDecrypt(ENCRYPTED_VALUES.cfTr, XOR_KEY),
        encryptionKey: xorDecrypt(ENCRYPTED_VALUES.encryptionKey, XOR_KEY),
        cfSecretKey: '',
        isProduction: true
      });
      console.log('🔧 Production config loaded (XOR encrypted + closure protected)');
    } 
    // DEVELOPMENT PATH: Load from window.__ENV (set by load-Env.js)
    else {
      // Wait for load-Env.js to populate window.__ENV
      let waitCount = 0;
      while (!window.__ENV && waitCount < 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        waitCount++;
      }

      if (window.__ENV) {
        // Determine if localhost
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          hostname === '[::]';

        config._setConfig({
          supabaseUrl: window.__ENV.SUPABASE_URL || '',
          supabaseKey: window.__ENV.SUPABASE_KEY || '',
          tableName: window.__ENV.SUPABASE_TABLE_M || 'notes',
          cfTr: window.__ENV.CF_TR || '',
          cfSecretKey: window.__ENV.CF_SECRET_KEY || '',
          encryptionKey: window.__ENV.ENCRYPTION_KEY || '',
          isProduction: !isLocalhost
        });

        // SECURITY: Delete window.__ENV to prevent console access
        delete window.__ENV;
        console.log('🔧 Development config loaded from env.json (window.__ENV cleared)');
      }
    }

    // Get encryption key from URL hash if available (overrides default)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const urlEncryptionKey = hashParams.get('key');
    if (urlEncryptionKey) {
      config._setConfig({ encryptionKey: urlEncryptionKey });
      console.log('🔑 Encryption key overridden from URL hash');
    }

    return config;
  } catch (error) {
    console.error('❌ Config initialization failed:', error);
    return config;
  }
};

export { config };
