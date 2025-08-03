import { createNote } from './actions/noteActions.js';

document.addEventListener('DOMContentLoaded', async () => {
  const elements = {
    noteText: document.getElementById('noteText'),
    createNoteBtn: document.getElementById('createNoteBtn'),
    clearBtn: document.getElementById('clearBtn'),
    linkContainer: document.getElementById('linkContainer'),
    noteLink: document.getElementById('noteLink'),
    copyFeedback: document.getElementById('copyFeedback')
  };

  // Environment detection
  const isLocal = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1';
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  // Base path configuration
  const basePath = isGitHubPages ? '/PrivacyNote' : '';
  const notePagePath = isLocal ? '/note.html' : `${basePath}/note`;

  elements.createNoteBtn.addEventListener('click', async () => {
    try {
      const content = elements.noteText.value.trim();
      if (!content) {
        showFeedback('Please enter note content', 'error');
        return;
      }

      // Disable button during creation
      toggleButtonState(true, 'Creating...');

      const newNote = await createNote(content, '', 86400);
      
      // Construct URL based on environment
      const url = `${window.location.origin}${notePagePath}?id=${newNote.id}`;
      
      elements.noteLink.textContent = url;
      elements.linkContainer.classList.remove('hidden');
      
      // Copy handler with better feedback
      elements.noteLink.onclick = async () => {
        try {
          await navigator.clipboard.writeText(url);
          showFeedback('✅ Link copied to clipboard!', 'success');
          elements.noteLink.classList.add('copied');
          setTimeout(() => elements.noteLink.classList.remove('copied'), 1000);
        } catch (err) {
          console.error('Copy failed:', err);
          showFeedback('❌ Failed to copy link', 'error');
        }
      };

      showFeedback('Note created successfully!', 'success');
    } catch (error) {
      console.error('Error creating note:', error);
      showFeedback(`Error: ${error.message}`, 'error');
    } finally {
      toggleButtonState(false, 'Create Note');
    }
  });

  elements.clearBtn.addEventListener('click', () => {
    elements.noteText.value = '';
    elements.linkContainer.classList.add('hidden');
    hideFeedback();
  });

  function toggleButtonState(disabled, text) {
    elements.createNoteBtn.disabled = disabled;
    elements.createNoteBtn.textContent = text;
  }

  function showFeedback(message, type) {
    elements.copyFeedback.textContent = message;
    elements.copyFeedback.className = `copy-feedback ${type} show`;
    setTimeout(hideFeedback, 3000);
  }

  function hideFeedback() {
    elements.copyFeedback.classList.remove('show');
  }
});