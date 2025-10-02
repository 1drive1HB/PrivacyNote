// src/js/actions/noteQuery.js
import { getSupabaseClient } from '../services/supabase.js';
import { config } from '../config.js';
import { encryptData, decryptData } from './cryptoActions.js';

export const createNote = async (content, expiresIn, isEncrypted = false) => {
  try {
    console.log('=== NOTEQUERY CREATE NOTE CALLED ===');
    console.log('Parameters received:', { contentLength: content.length, expiresIn, isEncrypted });
    console.log('Encryption key available:', config.encryptionKey ? 'YES' : 'NO');

    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not initialized');

    let processedContent = content;

    if (isEncrypted) {
      console.log('🔄 Encrypting content...');

      if (!config.encryptionKey) {
        console.warn('⚠️ No encryption key found, storing as plain text');
      } else {
        processedContent = await encryptData(content, config.encryptionKey);
        console.log('✅ Content encrypted');
      }
    } else {
      console.log('🔓 No encryption - storing as plain text');
    }

    const expiresIn24h = expiresIn === 24 * 60 * 60;
    const expiresIn48h = expiresIn === 48 * 60 * 60;

    console.log('Inserting into database with settings:', {
      is_encrypted: isEncrypted,
      expires_in_24h: expiresIn24h,
      expires_in_48h: expiresIn48h
    });

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

    console.log('✅ Note created successfully:', data.id);
    return data;

  } catch (error) {
    console.error('[NoteQuery] Error creating note:', error);
    throw error;
  }
};

export const getNote = async (id) => {
  try {
    if (!id) {
      console.log('Missing note ID - returning null');
      return null;
    }

    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not initialized');

    console.log('Retrieving note:', id);
    console.log('Encryption key available for decryption:', config.encryptionKey ? 'YES' : 'NO');

    const { data: noteData, error: fetchError } = await supabase
      .from(config.tableName)
      .select('*')
      .eq('id', id);

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      throw new Error('Note not found or has been deleted');
    }

    if (!noteData || noteData.length === 0) {
      console.log('Note not found (empty result)');
      return null;
    }

    const note = noteData[0];

    console.log('Note found:', {
      id: note.id,
      is_encrypted: note.is_encrypted,
      read_count: note.read_count,
      expired: new Date(note.expires_at) < new Date()
    });

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
      console.log('🔓 Decrypting encrypted content...');

      if (!config.encryptionKey) {
        console.error('❌ No encryption key available for decryption');
        throw new Error('Unable to decrypt: encryption key not available');
      }

      try {
        content = await decryptData(note.content, config.encryptionKey);
        console.log('✅ Content decrypted successfully');
      } catch (decryptError) {
        console.error('❌ Decryption failed:', decryptError);
        throw new Error('Unable to decrypt this note. It may have been encrypted with a different key.');
      }
    }

    console.log('Marking note as read...');
    const { error: updateError } = await supabase
      .from(config.tableName)
      .update({ read_count: 1 })
      .eq('id', id);

    if (updateError) {
      console.error('Error marking as read:', updateError);
    }

    console.log('Note retrieved successfully');
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