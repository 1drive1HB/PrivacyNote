//src\js\actions\noteQuery.js
import { getSupabaseClient } from '../services/supabase.js';
import { config } from '../config.js';

export const createNote = async (content, expiresIn) => {
  try {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not initialized');

    const { data, error } = await supabase
      .from(config.tableName)
      .insert({
        content: content,
        is_encrypted: false,
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

export const getNote = async (id) => {
  try {
    if (!id) throw new Error('Missing note ID');
    
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase client not initialized');
    
    // 1. First retrieve the note content
    const { data: noteData, error: retrieveError } = await supabase
      .from(config.tableName)
      .select('content, expires_at, is_read')
      .eq('id', id)
      .single();

    if (retrieveError || !noteData) throw new Error('Note not found');
    
    // 2. Check if note is expired or already read
    if (new Date(noteData.expires_at) < new Date()) {
      throw new Error('Note has expired');
    }
    if (noteData.is_read) {
      throw new Error('Note has already been read');
    }

    // 3. Return content and markAsRead function
    return {
      content: noteData.content,
      markAsRead: async () => {
        const { error: updateError } = await supabase
          .from(config.tableName)
          .update({ 
            is_read: true, 
            read_at: new Date().toISOString() 
          })
          .eq('id', id);

        if (updateError) {
          console.error('Failed to mark note as read:', updateError);
          throw new Error('Failed to mark note as read');
        }
      }
    };
  } catch (error) {
    console.error('[NoteQuery] Error:', error);
    throw error;
  }
};