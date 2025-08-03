import { getSupabaseClient } from '../services/supabase.js'

export const createNote = async (content, password, expiresIn) => {
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase
    .from('notes')
    .insert({
      content: content, // No encryption for now
      is_encrypted: false,
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString()
    })
    .select()
    .single()

  if (error) throw new Error(`Note creation failed: ${error.message}`)
  return data
}

export const getNote = async (id, password) => {
  const supabase = getSupabaseClient()
  
  // Get the note
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error('Note not found or already read')
  
  // Delete the note after reading
  await supabase.from('notes').delete().eq('id', id)
  
  return data.content
}