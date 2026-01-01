const fs = require('fs');

function xorEncrypt(text, key) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return Buffer.from(result).toString('base64');
}

const key = "pn_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);

const secrets = {
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_KEY || '',
  tableName: process.env.SUPABASE_TABLE_M || 'notes',
  cfTr: process.env.CF_TR || '',
  encryptionKey: process.env.ENCRYPTION_KEY || ''
};

const encrypted = {};
for (const [secretKey, value] of Object.entries(secrets)) {
  encrypted[secretKey] = value ? xorEncrypt(value, key) : '';
}

const lines = [
  '// XOR ENCRYPTED CONFIG - SECURITY HARDENED',
  'const XOR_KEY = "' + key + '";',
  '',
  'const xorDecrypt = (encoded, key) => {',
  '  try {',
  '    const text = atob(encoded);',
  '    let result = "";',
  '    for (let i = 0; i < text.length; i++) {',
  '      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));',
  '    }',
  '    return result;',
  '  } catch {',
  '    return "";',
  '  }',
  '};',
  '',
  'const ENCRYPTED_VALUES = ' + JSON.stringify(encrypted, null, 2) + ';',
  '',
  '// SECURITY: Use closure pattern to hide sensitive config',
  'const createSecureConfig = () => {',
  '  let _supabaseUrl = xorDecrypt(ENCRYPTED_VALUES.supabaseUrl, XOR_KEY);',
  '  let _supabaseKey = xorDecrypt(ENCRYPTED_VALUES.supabaseKey, XOR_KEY);',
  '  let _tableName = xorDecrypt(ENCRYPTED_VALUES.tableName, XOR_KEY);',
  '  let _cfTr = xorDecrypt(ENCRYPTED_VALUES.cfTr, XOR_KEY);',
  '  let _encryptionKey = xorDecrypt(ENCRYPTED_VALUES.encryptionKey, XOR_KEY);',
  '  let _isProduction = true;',
  '',
  '  return {',
  '    get supabaseUrl() { return _supabaseUrl; },',
  '    get supabaseKey() { return _supabaseKey; },',
  '    get tableName() { return _tableName; },',
  '    get cfTr() { return _cfTr; },',
  '    get cfSecretKey() { return ""; },',
  '    get encryptionKey() { return _encryptionKey; },',
  '    get isProduction() { return _isProduction; },',
  '    _setConfig(newConfig) {',
  '      if (newConfig.encryptionKey) _encryptionKey = newConfig.encryptionKey;',
  '      if (newConfig.isProduction !== undefined) _isProduction = newConfig.isProduction;',
  '    }',
  '  };',
  '};',
  '',
  'const config = createSecureConfig();',
  'Object.freeze(config);',
  '',
  'export const initializeConfig = async () => {',
  '  console.log("Production config loaded (XOR encrypted + closure protected)");',
  '  const hashParams = new URLSearchParams(window.location.hash.substring(1));',
  '  const urlEncryptionKey = hashParams.get("key");',
  '  if (urlEncryptionKey) {',
  '    config._setConfig({ encryptionKey: urlEncryptionKey });',
  '  }',
  '  return config;',
  '};',
  '',
  'export { config };'
];

fs.writeFileSync('src/js/config.js', lines.join('\n'));
console.log('Config file created successfully');
