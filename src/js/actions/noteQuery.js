// src/js/actions/noteQuery.js
import { getSupabaseClient } from '../services/supabase.js';
import { config } from '../conf/config.js';
import { encryptData, decryptData } from './cryptoActions.js';
import { RateLimiter } from '../utils/rateLimiter.js';

export const createNote = async (content, expiresIn, isEncrypted = false) => {
  try {
    // SECURITY: Rate limiting - 5 notes per minute
    const rateCheck = RateLimiter.checkLimit('createNote', 5, 60000);
    if (!rateCheck.allowed) {
      throw new Error(rateCheck.message);
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
        expires_in_48h: expiresIn48h,
        read_count: 0
      })
      .select('id, content, is_encrypted, created_at, expires_at')
      .single();

    if (error) {
      console.error('Database insert error:', error);
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
    if (!id) {
      return null;
    }

    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data: noteData, error: fetchError } = await supabase
      .from(config.tableName)
      .select('*')
      .eq('id', id);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      throw new Error('Note not found or has been deleted');
    }

    if (!noteData || noteData.length === 0) {
      return null;
    }

    const note = noteData[0];

    // Check if note has been read
    if (note.read_count > 0) {
      throw new Error('This note has already been read and destroyed');
    }

    // Check if note has expired
    if (new Date(note.expires_at) < new Date()) {
      throw new Error('This note has expired');
    }

    let content = note.content;

    if (note.is_encrypted) {
      try {
        content = await decryptData(note.content, true);
      } catch (decryptError) {
        console.error('Decryption failed:', decryptError);
        throw new Error('Unable to decrypt this note. It may have been encrypted with a different key.');
      }
    } else {
      content = await decryptData(note.content, false);
    }

    const { error: updateError } = await supabase
      .from(config.tableName)
      .update({ read_count: 1 })
      .eq('id', id);

    if (updateError) {
      console.error('Error marking as read:', updateError);
    }

    return {
      content: content,
      markAsRead: async () => { }
    };

  } catch (error) {
    console.error('[NoteQuery] Error retrieving note:', error);

    // Re-throw specific errors for proper handling
    if (error.message.includes('already been read') ||
      error.message.includes('expired') ||
      error.message.includes('not found') ||
      error.message.includes('Unable to decrypt')) {
      throw error;
    }

    throw new Error('Note not found or has been deleted');
  }
};