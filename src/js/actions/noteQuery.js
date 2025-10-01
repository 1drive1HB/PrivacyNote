// src/js/actions/noteQuery.js
import { getSupabaseClient } from '../services/supabase.js';
import { config } from '../config.js';
import { encryptData, decryptData } from './cryptoActions.js';

export const createNote = async (content, expiresIn, isEncrypted = false) => {
  try {
    console.log('=== NOTEQUERY CREATE NOTE CALLED ===');
    console.log('Parameters received:', { contentLength: content.length, expiresIn, isEncrypted });
    
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not initialized');

    let processedContent = content;
    console.log('Creating note with encryption:', isEncrypted);
    
    if (isEncrypted) {
      console.log('🔄 Encrypting content...');
      processedContent = await encryptData(content, config.encryptionKey);
      console.log('✅ Content encrypted');
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
    if (!id) throw new Error('Missing note ID');
    
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not initialized');

    console.log('Retrieving note:', id);
    
    const { data: noteData, error: fetchError } = await supabase
      .from(config.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Fetch error:', fetchError);
      throw new Error(fetchError.message || 'Note not found');
    }

    if (!noteData) {
      throw new Error('Note not found');
    }

    console.log('Note found:', {
      id: noteData.id,
      is_encrypted: noteData.is_encrypted,
      read_count: noteData.read_count,
      expired: new Date(noteData.expires_at) < new Date()
    });

    if (noteData.read_count > 0) {
      throw new Error('Note has already been read and destroyed');
    }

    if (new Date(noteData.expires_at) < new Date()) {
      throw new Error('Note has expired');
    }

    let content = noteData.content;
    
    if (noteData.is_encrypted) {
      console.log('Decrypting encrypted content automatically...');
      content = await decryptData(noteData.content, config.encryptionKey);
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
      markAsRead: async () => {}
    };

  } catch (error) {
    console.error('[NoteQuery] Error retrieving note:', error);
    throw error;
  }
};