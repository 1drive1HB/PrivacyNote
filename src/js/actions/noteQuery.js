// src/js/actions/noteQuery.js
import { getSupabaseClient } from '../services/supabase.js';
import { config } from '../config.js';
import { encryptData, decryptData } from './cryptoActions.js';

export const createNote = async (content, expiresIn, isEncrypted = false) => {
  try {
    console.log('=== NOTEQUERY CREATE NOTE CALLED ===');
    console.log('Parameters received:', {
      contentLength: content.length,
      expiresIn,
      isEncrypted,
      sampleContent: content.substring(0, 20) + '...'
    });

    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not initialized');

    let processedContent = content;

    if (isEncrypted) {
      console.log('🔄 Encrypting content...');
      processedContent = await encryptData(content, true);
      console.log('✅ Content encrypted:', processedContent !== content ? 'YES' : 'NO');
      console.log('🔐 Encrypted sample:', processedContent.substring(0, 50) + '...');
    } else {
      console.log('🔓 Encryption disabled - storing as PLAIN TEXT');
      processedContent = await encryptData(content, false); // This will return plain text
      console.log('📝 Plain text sample:', processedContent.substring(0, 20) + '...');
    }

    const expiresIn24h = expiresIn === 24 * 60 * 60;
    const expiresIn48h = expiresIn === 48 * 60 * 60;

    console.log('Inserting into database with settings:', {
      is_encrypted: isEncrypted,
      expires_in_24h: expiresIn24h,
      expires_in_48h: expiresIn48h,
      content_type: isEncrypted ? 'encrypted' : 'plain_text'
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
      content_sample: note.content.substring(0, 50) + '...',
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
      try {
        content = await decryptData(note.content, true);
        console.log('✅ Content decrypted successfully');
        console.log('📝 Decrypted sample:', content.substring(0, 20) + '...');
      } catch (decryptError) {
        console.error('❌ Decryption failed:', decryptError);
        throw new Error('Unable to decrypt this note. It may have been encrypted with a different key.');
      }
    } else {
      console.log('🔓 No encryption - using plain text');
      content = await decryptData(note.content, false);
      console.log('📝 Plain text sample:', content.substring(0, 20) + '...');
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