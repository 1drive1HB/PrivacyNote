// src/js/actions/cryptoActions.js
const encoder = new TextEncoder()
const decoder = new TextDecoder()
const salt = encoder.encode('secure-note-salt')

export const encryptData = async (text, password = null) => {
  try {
    // Use provided password or config encryption key
    const encryptionKey = password || '';

    if (!encryptionKey) {
      console.log('🔓 No encryption key provided - using base64 encoding');
      return btoa(unescape(encodeURIComponent(text)));
    }

    console.log('🔐 Encrypting with key:', encryptionKey ? '***MASKED***' : 'MISSING');

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(encryptionKey),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const key = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(text)
    );

    return JSON.stringify({
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    });
  } catch (error) {
    console.error('❌ Encryption failed, falling back to base64:', error);
    return btoa(unescape(encodeURIComponent(text)));
  }
}

export const decryptData = async (encrypted, password = null) => {
  try {
    // Use provided password or config encryption key
    const decryptionKey = password || '';

    if (!decryptionKey) {
      console.log('🔓 No decryption key provided - trying base64 decoding');
      try {
        return decodeURIComponent(escape(atob(encrypted)));
      } catch {
        throw new Error('Unable to decrypt: no password provided');
      }
    }

    console.log('🔐 Decrypting with key:', decryptionKey ? '***MASKED***' : 'MISSING');

    const { iv, data } = JSON.parse(encrypted);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(decryptionKey),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    const derivedKey = await crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(iv) },
      derivedKey,
      new Uint8Array(data)
    );

    return decoder.decode(decrypted);
  } catch (error) {
    console.error('❌ Decryption failed:', error);

    // Try base64 fallback if AES decryption fails
    try {
      console.log('🔄 Trying base64 fallback decryption');
      return decodeURIComponent(escape(atob(encrypted)));
    } catch (fallbackError) {
      throw new Error('Unable to decrypt: invalid key or corrupted data');
    }
  }
}