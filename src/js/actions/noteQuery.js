//src\js\actions\noteQuery.js
// Make sure these paths are correct
import { getSupabaseClient } from '../services/supabase.js';
import { config } from '../config.js';
import { encryptData, decryptData } from './cryptoActions.js';

export const createNote = async (content, expiresIn, password) => {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not initialized');

    const encryptedContent = await encryptData(content, password);

    const { data, error } = await supabase
      .from(config.tableName)
      .insert({
        content: encryptedContent,
        is_encrypted: true,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        is_read: false
      })
      .select()
      .single();

    if (error) throw new Error(error.message || 'Failed to create note');
    return data;
  } catch (error) {
    console.error('[NoteQuery] Error creating note:', error);
    throw error;
  }
};

export const getNote = async (id, password) => {
  try {
    if (!id) throw new Error('Missing note ID');
    
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not initialized');

    // Use the database function to retrieve and delete the note in one call.
    const { data, error } = await supabase
      .rpc('get_and_delete_note', { note_id: id });
    
    // If there's a database error or the function returns nothing, the note is gone.
    if (error) {
        console.error('Supabase retrieve error:', error);
        throw new Error(error.message || 'Note not found or already destroyed');
    }
    if (!data || data.length === 0) {
        throw new Error('Note not found or already destroyed');
    }

    const noteData = data[0];

    // Check for expiration
    if (new Date(noteData.expires_at) < new Date()) {
        throw new Error('Note has expired');
    }

    let content = noteData.content;
    if (noteData.is_encrypted) {
        content = await decryptData(noteData.content, password);
    }

    // Now that the note has been retrieved and decrypted,
    // we can return the content. The database function has already deleted it.
    return {
        content: content,
        // The markAsRead function is no longer needed since the DB handled the deletion.
        markAsRead: async () => {} 
    };

  } catch (error) {
    console.error('[NoteQuery] Error:', error);
    throw error;
  }
};