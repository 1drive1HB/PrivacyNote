// Input validation and sanitization for security

export class InputSanitizer {
  static sanitizeText(input) {
    if (typeof input !== 'string') {
      return '';
    }
    
    let sanitized = input.replace(/\0/g, '');
    sanitized = sanitized.normalize('NFKC');
    
    return sanitized;
  }

  static validateNoteContent(content) {
    const errors = [];
    
    if (!content || typeof content !== 'string') {
      errors.push('Content must be a valid string');
      return { valid: false, errors };
    }
    
    const trimmed = content.trim();
    
    if (trimmed.length === 0) {
      errors.push('Note content cannot be empty');
    }
    
    // Max 8,000 chars (accounts for 77% encryption overhead before 15KB DB limit)
    if (trimmed.length > 8000) {
      errors.push('Note content exceeds maximum length of 8,000 characters');
    }
    
    if (trimmed.includes('\0')) {
      errors.push('Note contains invalid null bytes');
    }
    
    const controlCharCount = (trimmed.match(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g) || []).length;
    if (controlCharCount > trimmed.length * 0.1) {
      errors.push('Note contains too many control characters');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      sanitized: this.sanitizeText(trimmed)
    };
  }

  /**
   * Validate UUID format
   */
  static validateUUID(uuid) {
    if (typeof uuid !== 'string') {
      return false;
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Escape HTML entities to prevent XSS
   */
  static escapeHTML(text) {
    if (typeof text !== 'string') {
      return '';
    }
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Validate URL for safe display
   */
  static validateURL(url) {
    try {
      const parsed = new URL(url);
      // Only allow https and http protocols
      return ['https:', 'http:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Rate limit helper - detect suspicious patterns
   */
  static detectSuspiciousPattern(content) {
    const warnings = [];
    
    // Check for repeated characters (potential DOS)
    const repeatedChars = content.match(/(.)\1{50,}/g);
    if (repeatedChars) {
      warnings.push('Contains suspiciously repeated characters');
    }
    
    // Check for excessive newlines
    const newlineCount = (content.match(/\n/g) || []).length;
    if (newlineCount > 500) {
      warnings.push('Contains excessive line breaks');
    }
    
    // Check for potential script injection patterns (additional layer)
    const scriptPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i, // onclick=, onload=, etc.
      /data:text\/html/i,
      /<iframe/i,
      /<embed/i,
      /<object/i
    ];
    
    for (const pattern of scriptPatterns) {
      if (pattern.test(content)) {
        warnings.push('Contains potentially dangerous HTML/JavaScript patterns');
        break;
      }
    }
    
    return warnings;
  }
}
