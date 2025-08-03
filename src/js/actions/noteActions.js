import { getSupabaseClient } from '../services/supabase.js';

export const createNote = async (content, password, expiresIn) => {
  const supabase = getSupabaseClient();
  
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
    console.error('Supabase error:', error);
    throw new Error('Failed to create note. Please try again.');
  }
  return data;
};

export const getNote = async (id, password) => {
  const supabase = getSupabaseClient();
  
  // First get the note
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error('Note not found or already read');
  
  // Then delete it
  await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  return data.content;
};