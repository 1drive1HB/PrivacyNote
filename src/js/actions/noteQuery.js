import { getSupabaseClient } from '../services/supabase.js';

export const createNote = async (content, expiresIn) => {
  const supabase = getSupabaseClient();
  
  // First check if client is initialized
  if (!supabase) throw new Error('Supabase client not initialized');
  
  const { data, error } = await supabase
    .from('notes')
    .insert({
      content: content,
      is_encrypted: false,
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase create error:', error);
    throw new Error(error.message || 'Failed to create note');
  }
  return data;
};

export const getNote = async (id) => {
  if (!id) throw new Error('Missing note ID');
  
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase client not initialized');
  
  // Use the function we created
  const { data, error } = await supabase
    .rpc('get_and_delete_note', { note_id: id });

  if (error) {
    console.error('Supabase retrieve error:', error);
    throw new Error(error.message || 'Failed to retrieve note');
  }
  
  if (!data || data.length === 0) {
    throw new Error('Note not found or already destroyed');
  }
  
  return data[0].content;
};