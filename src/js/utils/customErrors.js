// src/js/utils/customErrors.js
// Custom error classes for better error handling and user experience

export class NoteError extends Error {
  constructor(message, type, userMessage, actionAdvice) {
    super(message);
    this.name = 'NoteError';
    this.type = type;
    this.userMessage = userMessage;
    this.actionAdvice = actionAdvice;
  }
}

export class NetworkError extends NoteError {
  constructor(message = 'Network connection failed') {
    super(
      message,
      'NETWORK_ERROR',
      'Unable to connect to the server',
      'Please check your internet connection and try again.'
    );
    this.name = 'NetworkError';
    this.retryable = true;
  }
}

export class NoteNotFoundError extends NoteError {
  constructor() {
    super(
      'Note not found',
      'NOT_FOUND',
      'This note does not exist',
      'The link may be incorrect or the note may have already been deleted.'
    );
    this.name = 'NoteNotFoundError';
    this.retryable = false;
  }
}

export class NoteAlreadyReadError extends NoteError {
  constructor() {
    super(
      'Note already read',
      'ALREADY_READ',
      'This note has already been viewed',
      'Notes can only be read once for security. The sender needs to create a new note.'
    );
    this.name = 'NoteAlreadyReadError';
    this.retryable = false;
  }
}

export class NoteExpiredError extends NoteError {
  constructor() {
    super(
      'Note expired',
      'EXPIRED',
      'This note has expired',
      'Notes are automatically deleted after their expiration time. The sender needs to create a new note.'
    );
    this.name = 'NoteExpiredError';
    this.retryable = false;
  }
}

export class DecryptionError extends NoteError {
  constructor() {
    super(
      'Decryption failed',
      'DECRYPTION_ERROR',
      'Unable to decrypt this note',
      'This note may have been encrypted with a different key. Ensure you\'re using the correct link.'
    );
    this.name = 'DecryptionError';
    this.retryable = false;
  }
}

export class ValidationError extends NoteError {
  constructor(message, userMessage) {
    super(
      message,
      'VALIDATION_ERROR',
      userMessage || 'Invalid input',
      'Please check your input and try again.'
    );
    this.name = 'ValidationError';
    this.retryable = false;
  }
}

export class RateLimitError extends NoteError {
  constructor(retryAfter = 60) {
    super(
      'Rate limit exceeded',
      'RATE_LIMIT',
      'Too many requests',
      `Please wait ${retryAfter} seconds before trying again.`
    );
    this.name = 'RateLimitError';
    this.retryable = true;
    this.retryAfter = retryAfter;
  }
}

/**
 * Parse error and return appropriate custom error
 */
export function parseError(error) {
  // Already a custom error
  if (error instanceof NoteError) {
    return error;
  }

  const message = error.message?.toLowerCase() || '';

  // Network errors
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return new NetworkError(error.message);
  }

  // Note already read
  if (message.includes('already been read') || message.includes('destroyed')) {
    return new NoteAlreadyReadError();
  }

  // Note expired
  if (message.includes('expired')) {
    return new NoteExpiredError();
  }

  // Not found
  if (message.includes('not found') || message.includes('does not exist') || message.includes('deleted')) {
    return new NoteNotFoundError();
  }

  // Decryption error
  if (message.includes('decrypt') || message.includes('encryption')) {
    return new DecryptionError();
  }

  // Rate limit
  if (message.includes('rate limit') || message.includes('too many')) {
    return new RateLimitError();
  }

  // Generic error
  return new NoteError(
    error.message,
    'UNKNOWN_ERROR',
    'An unexpected error occurred',
    'Please try again. If the problem persists, contact support.'
  );
}
