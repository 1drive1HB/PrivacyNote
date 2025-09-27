//src\js\actions\noteQuery.js
import { getSupabaseClient } from '../services/supabase.js';
import { config } from '../config.js';
import { encryptData, decryptData } from './cryptoActions.js';

export const createNote = async (content, expiresIn, isEncrypted = false, password = null) => {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not initialized');

    let processedContent = content;
    console.log('Creating note with encryption:', isEncrypted, 'password:', !!password);
    
    // Encrypt content if encryption is enabled
    if (isEncrypted && password) {
      console.log('Encrypting content...');
      processedContent = await encryptData(content, password);
    } else if (isEncrypted) {
      // If encryption is selected but no password, use a default one
      password = 'default-secret';
      processedContent = await encryptData(content, password);
    }

    // Determine expiration flags based on expiresIn (seconds)
    const expiresIn24h = expiresIn === 24 * 60 * 60;
    const expiresIn48h = expiresIn === 48 * 60 * 60;

    console.log('Inserting into database:', {
      content_length: processedContent.length,
      is_encrypted: isEncrypted,
      expires_in_24h: expiresIn24h,
      expires_in_48h: expiresIn48h
    });

    // Insert directly into the table (let the trigger handle expires_at)
    const { data, error } = await supabase
      .from('notes')
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

    console.log('Note created successfully:', data.id);
    return data;

  } catch (error) {
    console.error('[NoteQuery] Error creating note:', error);
    throw error;
  }
};

export const getNote = async (id, password = null) => {
  try {
    if (!id) throw new Error('Missing note ID');
    
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not initialized');

    console.log('Retrieving note:', id);
    
    // First, get the note without marking as read
    const { data: noteData, error: fetchError } = await supabase
      .from('notes')
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
      expires_at: noteData.expires_at
    });

    // Check if already read
    if (noteData.read_count > 0) {
      throw new Error('Note has already been read and destroyed');
    }

    // Check for expiration
    if (new Date(noteData.expires_at) < new Date()) {
      throw new Error('Note has expired');
    }

    let content = noteData.content;
    
    // Decrypt content if it's encrypted
    if (noteData.is_encrypted) {
      console.log('Decrypting encrypted content...');
      if (!password) {
        // Try with default password if none provided
        password = prompt('This note is encrypted. Please enter the password:');
        if (!password) {
          throw new Error('Password required for encrypted note');
        }
      }
      content = await decryptData(noteData.content, password);
    }

    // Mark as read by incrementing read_count
    console.log('Marking note as read...');
    const { error: updateError } = await supabase
      .from('notes')
      .update({ read_count: 1 })
      .eq('id', id);

    if (updateError) {
      console.error('Error marking as read:', updateError);
      throw new Error('Failed to mark note as read');
    }

    console.log('Note retrieved and marked as read successfully');
    return {
      content: content,
      markAsRead: async () => {
        // Already handled above
      }
    };

  } catch (error) {
    console.error('[NoteQuery] Error retrieving note:', error);
    throw error;
  }
};