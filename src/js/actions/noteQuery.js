import { getSupabaseClient } from '../services/supabase.js';
import { config } from '../config.js';

export const createNote = async (content, expiresIn) => {
  console.log('[NoteQuery] Creating new note...');
  try {
    const supabase = await getSupabaseClient();
    
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    console.debug('[NoteQuery] Inserting note into table:', config.tableName);
    const { data, error } = await supabase
      .from(config.tableName)
      .insert({
        content: content,
        is_encrypted: false,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('[NoteQuery] Database error:', error);
      throw new Error(error.message || 'Failed to create note');
    }

    console.log('[NoteQuery] Note created successfully. ID: *******************');
    return data;
  } catch (error) {
    console.error('[NoteQuery] Error creating note:', error);
    throw error;
  }
};

export const getNote = async (id) => {
  console.log('[NoteQuery] Retrieving note ID:', id);
  try {
    if (!id) {
      throw new Error('Missing note ID');
    }
    
    const supabase = await getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }
    
    console.debug('[NoteQuery] Calling get_and_delete_note RPC');
    const { data, error } = await supabase
      .rpc('get_and_delete_note', { note_id: id });

    if (error) {
      console.error('[NoteQuery] Database error:', error);
      throw new Error(error.message || 'Failed to retrieve note');
    }
    
    if (!data || data.length === 0) {
      throw new Error('Note not found or already destroyed');
    }
    
    console.log('[NoteQuery] Note retrieved successfully');
    return data[0].content;
  } catch (error) {
    console.error('[NoteQuery] Error retrieving note:', error);
    throw error;
  }
};