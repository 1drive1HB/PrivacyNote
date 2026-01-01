// src/js/utils/rateLimiter.js
// SECURITY: Client-side rate limiting to prevent abuse

export class RateLimiter {
  /**
   * Check if action is allowed based on rate limits
   * @param {string} action - Action identifier (e.g., 'createNote')
   * @param {number} maxAttempts - Maximum attempts allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {Object} { allowed: boolean, retryAfter: number }
   */
  static checkLimit(action, maxAttempts = 5, windowMs = 60000) {
    const storageKey = `rl_${action}`;
    const now = Date.now();
    
    // Get existing attempts
    let attempts = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        attempts = JSON.parse(stored);
      }
    } catch (e) {
      // If localStorage fails, allow but log
      console.warn('Rate limiter storage error:', e);
      return { allowed: true, retryAfter: 0 };
    }
    
    // Filter out expired attempts
    attempts = attempts.filter(timestamp => now - timestamp < windowMs);
    
    // Check if limit exceeded
    if (attempts.length >= maxAttempts) {
      const oldestAttempt = Math.min(...attempts);
      const retryAfter = Math.ceil((oldestAttempt + windowMs - now) / 1000);
      return { 
        allowed: false, 
        retryAfter,
        message: `Too many attempts. Please wait ${retryAfter} seconds.`
      };
    }
    
    // Add current attempt
    attempts.push(now);
    
    // Save back to storage
    try {
      localStorage.setItem(storageKey, JSON.stringify(attempts));
    } catch (e) {
      console.warn('Rate limiter storage save error:', e);
    }
    
    return { allowed: true, retryAfter: 0 };
  }
  
  /**
   * Reset rate limit for an action (useful after successful completion)
   * @param {string} action - Action identifier
   */
  static resetLimit(action) {
    const storageKey = `rl_${action}`;
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.warn('Rate limiter reset error:', e);
    }
  }
  
  /**
   * Clean up old rate limit data (call periodically)
   */
  static cleanup() {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      keys.forEach(key => {
        if (key.startsWith('rl_')) {
          try {
            const attempts = JSON.parse(localStorage.getItem(key));
            // If all attempts are older than 1 hour, remove
            if (Array.isArray(attempts) && attempts.every(t => now - t > 3600000)) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // Invalid data, remove it
            localStorage.removeItem(key);
          }
        }
      });
    } catch (e) {
      console.warn('Rate limiter cleanup error:', e);
    }
  }
}
