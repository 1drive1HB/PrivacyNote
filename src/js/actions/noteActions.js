import { getSupabaseClient } from '../services/supabase'
import { encryptData, decryptData } from './cryptoActions'

export const createNote = async (content, password, expiresIn) => {
  const supabase = getSupabaseClient()
  const encrypted = await encryptData(content, password)
  
  const { data, error } = await supabase
    .from('notes')
    .insert({
      content: encrypted,
      is_encrypted: !!password,
      expires_at: new Date(Date.now() + expiresIn * 1000).toISOString()
    })
    .select()
    .single()

  if (error) throw new Error(`Note creation failed: ${error.message}`)
  return data
}

export const getNote = async (id, password) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw new Error('Note not found')
  
  const decrypted = await decryptData(data.content, password)
  await supabase.from('notes').delete().eq('id', id)
  
  return decrypted
}