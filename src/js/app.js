import { createNote, getNote } from './actions/noteActions'
import { config } from './config'

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize with environment checks
  if (!config.supabaseUrl || !config.supabaseKey) {
    console.error('Missing Supabase configuration')
    return
  }

  // Example usage:
  try {
    const newNote = await createNote('My secret', 'mypassword', 3600)
    console.log('Note created:', newNote.id)
    
    const content = await getNote(newNote.id, 'mypassword')
    console.log('Retrieved note:', content)
  } catch (error) {
    console.error('Error:', error.message)
  }
})