import { createNote } from './actions/noteActions.js'

document.addEventListener('DOMContentLoaded', async () => {
  // Get DOM elements
  const noteText = document.getElementById('noteText')
  const createNoteBtn = document.getElementById('createNoteBtn')
  const clearBtn = document.getElementById('clearBtn')
  const linkContainer = document.getElementById('linkContainer')
  const noteLink = document.getElementById('noteLink')

  createNoteBtn.addEventListener('click', async () => {
    try {
      const content = noteText.value
      if (!content) {
        alert('Please enter note content')
        return
      }

      // Create note with empty password and 24h expiration
      const newNote = await createNote(content, '', 86400)
      
      // Generate correct URL - works for both local and production
      const baseUrl = window.location.origin
      const isLocal = window.location.href.includes('localhost') || 
                      window.location.href.includes('127.0.0.1')
      const pathPrefix = isLocal ? '/src/html' : '/html'
      const url = `${baseUrl}${pathPrefix}/messageURL.html?id=${newNote.id}`
      
      noteLink.textContent = url
      linkContainer.classList.remove('hidden')
      
      // Copy to clipboard functionality
      noteLink.addEventListener('click', () => {
        navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
      })
    } catch (error) {
      console.error('Error:', error)
      alert(`Error: ${error.message}`)
    }
  })

  clearBtn.addEventListener('click', () => {
    noteText.value = ''
    linkContainer.classList.add('hidden')
  })
})