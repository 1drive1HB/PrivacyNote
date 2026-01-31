// src/js/actions/noteQuery.js
import { getSupabaseClient } from '../services/supabase.js';
import { config } from '../conf/config.js';
import { encryptData, decryptData } from './cryptoActions.js';
import { RateLimiter } from '../utils/rateLimiter.js';
import { 
  NetworkError, 
  NoteNotFoundError, 
  NoteAlreadyReadError, 
  NoteExpiredError,
  DecryptionError,
  RateLimitError
} from '../utils/customErrors.js';

export const createNote = async (content, expiresIn, isEncrypted = false) => {
  try {
    // SECURITY: Rate limiting - 5 notes per minute
    const rateCheck = RateLimiter.checkLimit('createNote', 5, 60000);
    if (!rateCheck.allowed) {
      throw new RateLimitError(60);
    }
    
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not initialized');

    let processedContent = content;

    if (isEncrypted) {
      processedContent = await encryptData(content, true);
    } else {
      processedContent = await encryptData(content, false); // This will return plain text
    }

    const expiresIn24h = expiresIn === 24 * 60 * 60;
    const expiresIn48h = expiresIn === 48 * 60 * 60;

    const { data, error } = await supabase
      .from(config.tableName)
      .insert({
        content: processedContent,
        is_encrypted: isEncrypted,
        expires_in_24h: expiresIn24h,
        expires_in_48h: expiresIn48h
        // read_count removed - column doesn't exist in DB schema
      })
      .select('id, content, is_encrypted, created_at, expires_at')
      .single();

    if (error) {
      console.error('Database insert error:', error);
      if (error.message?.includes('fetch') || error.code === 'PGRST301') {
        throw new NetworkError('Unable to save note to database');
      }
      throw new Error(error.message || 'Failed to create note');
    }

    return data;

  } catch (error) {
    console.error('[NoteQuery] Error creating note:', error);
    throw error;
  }
};

export const getNote = async (id) => {
  try {
    // SECURITY: Validate UUID format to prevent injection
    if (!id || typeof id !== 'string') {
      return null;
    }
    
    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid note ID format');
    }

    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not initialized');

    // Use database function for secure one-time read with automatic deletion
    // This function retrieves the note and deletes it atomically
    const { data: noteData, error: fetchError } = await supabase
      .rpc('get_note_content', { note_id: id });

    if (fetchError) {
      if (fetchError.message?.includes('fetch') || fetchError.code === 'PGRST301') {
        console.error('[NoteQuery] Network error:', fetchError);
        throw new NetworkError('Unable to retrieve note from database');
      }
      // Database returned error - likely note doesn't exist
      console.log('[NoteQuery] Note not found in database');
      throw new NoteNotFoundError();
    }

    // If function returns empty array, note doesn't exist or was already read
    if (!noteData || noteData.length === 0) {
      throw new NoteNotFoundError();
    }

    const note = noteData[0];

    // Decrypt content if needed
    let content = note.content;
    if (note.is_encrypted) {
      try {
        content = await decryptData(note.content, true);
      } catch (decryptError) {
        console.error('[NoteQuery] Decryption failed:', decryptError);
        throw new DecryptionError();
      }
    } else {
      content = await decryptData(note.content, false);
    }

    // Note: The note is already deleted by the get_note_content() function
    // No need for manual DELETE or read_count update
    
    return {
      content: content,
      markAsRead: async () => { 
        // No-op: already deleted by database function
      }
    };

  } catch (error) {
    // Expected errors (note not found, already read, expired) - log as info
    if (error instanceof NoteNotFoundError || 
        error instanceof NoteAlreadyReadError || 
        error instanceof NoteExpiredError ||
        error.message.includes('already been read') ||
        error.message.includes('expired') ||
        error.message.includes('not found')) {
      console.log('[NoteQuery] Note retrieval:', error.userMessage || error.message);
      throw error;
    }

    // Unexpected errors - log as error
    console.error('[NoteQuery] Error retrieving note:', error);

    if (error.message.includes('Unable to decrypt')) {
      throw error;
    }

    throw new Error('Note not found or has been deleted');
  }
};