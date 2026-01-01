// Client-side rate limiting (localStorage-based, can be bypassed)

export class RateLimiter {
  static checkLimit(action, maxAttempts = 5, windowMs = 60000) {
    const storageKey = `rl_${action}`;
    const now = Date.now();
    
    let attempts = [];
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        attempts = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Rate limiter storage error:', e);
      return { allowed: true, retryAfter: 0 };
    }
    
    attempts = attempts.filter(timestamp => now - timestamp < windowMs);
    
    if (attempts.length >= maxAttempts) {
      const oldestAttempt = Math.min(...attempts);
      const retryAfter = Math.ceil((oldestAttempt + windowMs - now) / 1000);
      return { 
        allowed: false, 
        retryAfter,
        message: `Too many attempts. Please wait ${retryAfter} seconds.`
      };
    }
    
    attempts.push(now);
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(attempts));
    } catch (e) {
      console.warn('Rate limiter storage save error:', e);
    }
    
    return { allowed: true, retryAfter: 0 };
  }
  
  static resetLimit(action) {
    const storageKey = `rl_${action}`;
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.warn('Rate limiter reset error:', e);
    }
  }
  
  static cleanup() {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      keys.forEach(key => {
        if (key.startsWith('rl_')) {
          try {
            const attempts = JSON.parse(localStorage.getItem(key));
            if (Array.isArray(attempts) && attempts.every(t => now - t > 3600000)) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            localStorage.removeItem(key);
          }
        }
      });
    } catch (e) {
      console.warn('Rate limiter cleanup error:', e);
    }
  }
}
