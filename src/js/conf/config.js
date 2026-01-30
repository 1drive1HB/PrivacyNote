// Unified configuration manager for dev and production environments
// Production: XOR-encrypted values injected during build
// Development: Plain values loaded from env.json via window.__ENV

const isProductionBuild = typeof XOR_KEY !== 'undefined';

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

// Closure pattern prevents console inspection of config values
const createSecureConfig = () => {
  // Private variables - inaccessible from browser console
  let _supabaseUrl = '';
  let _supabaseKey = '';
  let _tableName = '';
  let _cfTr = '';
  let _cfSecretKey = '';
  let _encryptionKey = '';
  let _isProduction = false;

  return {
    get supabaseUrl() { return _supabaseUrl; },
    get supabaseKey() { return _supabaseKey; },
    get tableName() { return _tableName; },
    get cfTr() { return _cfTr; },
    get cfSecretKey() { return _cfSecretKey; },
    get encryptionKey() { return _encryptionKey; },
    get isProduction() { return _isProduction; },

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
      // Production mode - silent logging
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
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          hostname === '[::]';

        config._setConfig({
          supabaseUrl: window.__ENV.SUPABASE_URL || '',
          supabaseKey: window.__ENV.SUPABASE_KEY || '',
          tableName: window.__ENV.SUPABASE_TABLE_M || 'notes',
          cfTr: window.__ENV.CF_TR || '',
          encryptionKey: window.__ENV.ENCRYPTION_KEY || '',
          isProduction: !isLocalhost
        });

        // Clear temporary environment object
        delete window.__ENV;
      }
    }

    // Allow custom encryption key via URL hash (#key=xxx)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const urlEncryptionKey = hashParams.get('key');
    if (urlEncryptionKey) {
      config._setConfig({ encryptionKey: urlEncryptionKey });
    }

    return config;
  } catch (error) {
    console.error('❌ Config initialization failed:', error);
    return config;
  }
};

export { config };
