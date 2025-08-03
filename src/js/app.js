import { createNote } from './actions/noteActions.js';

document.addEventListener('DOMContentLoaded', async () => {
  const noteText = document.getElementById('noteText');
  const createNoteBtn = document.getElementById('createNoteBtn');
  const clearBtn = document.getElementById('clearBtn');
  const linkContainer = document.getElementById('linkContainer');
  const noteLink = document.getElementById('noteLink');

  createNoteBtn.addEventListener('click', async () => {
    try {
      const content = noteText.value.trim();
      if (!content) {
        alert('Please enter note content');
        return;
      }

      const newNote = await createNote(content, '', 86400);
      
      const isLocal = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
      
      const url = isLocal
        ? `${window.location.origin}/src/html/messageURL.html?id=${newNote.id}`
        : `${window.location.origin}/PrivacyNote/html/messageURL.html?id=${newNote.id}`;
      
      noteLink.textContent = url;
      linkContainer.classList.remove('hidden');
      
      const copyHandler = () => {
        navigator.clipboard.writeText(url)
          .then(() => alert('Link copied to clipboard!'))
          .catch(err => console.error('Copy failed:', err));
      };
      noteLink.addEventListener('click', copyHandler);
      
    } catch (error) {
      console.error('Error creating note:', error);
      alert(`Error: ${error.message}`);
    }
  });

  clearBtn.addEventListener('click', () => {
    noteText.value = '';
    linkContainer.classList.add('hidden');
  });
});