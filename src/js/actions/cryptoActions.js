// src/js/actions/cryptoActions.js
const encoder = new TextEncoder()
const decoder = new TextDecoder()
const salt = encoder.encode('secure-note-salt')

export const encryptData = async (text, useEncryption = false) => {
  try {
    if (!useEncryption) {
      return text; // Return plain text when encryption is disabled
    }

    // Import your existing config
    const { config } = await import('../config.js');
    const encryptionKey = config.encryptionKey;

    // Ensure key is proper length for AES (16 or 32 bytes)
    let keyBytes = encoder.encode(encryptionKey);

    // Pad or truncate to 32 bytes (256 bits)
    if (keyBytes.length < 32) {
      const padded = new Uint8Array(32);
      padded.set(keyBytes);
      keyBytes = padded;
    } else if (keyBytes.length > 32) {
      keyBytes = keyBytes.slice(0, 32);
    }

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      keyBytes,
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

    const result = JSON.stringify({
      iv: Array.from(iv),
      data: Array.from(new Uint8Array(encrypted))
    });

    return result;

  } catch (error) {
    console.error('❌ Encryption failed, storing as plain text:', error);
    return text; // Fallback to plain text
  }
}

export const decryptData = async (encrypted, useEncryption = false) => {
  try {
    if (!useEncryption) {
      console.log('🔓 No encryption - returning plain text');
      return encrypted; // Return as-is when no encryption
    }

    // Import your existing config
    const { config } = await import('../config.js');
    const decryptionKey = config.encryptionKey;

    // Ensure key is proper length for AES (16 or 32 bytes)
    let keyBytes = encoder.encode(decryptionKey);

    // Pad or truncate to 32 bytes (256 bits)
    if (keyBytes.length < 32) {
      const padded = new Uint8Array(32);
      padded.set(keyBytes);
      keyBytes = padded;
    } else if (keyBytes.length > 32) {
      keyBytes = keyBytes.slice(0, 32);
    }

    const { iv, data } = JSON.parse(encrypted);

    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      keyBytes,
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

    // If decryption fails, try to return as plain text
    console.log('🔄 Returning as plain text (decryption failed)');
    return encrypted;
  }
}