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
  const notePagePath = `${basePath}/note.html`;

  // Create Note button handler
  elements.createNoteBtn.addEventListener('click', async () => {
    try {
      const content = elements.noteText.value.trim();
      if (!content) {
        showFeedback('Please enter note content', 'error');
        return;
      }

      toggleButtonState(true, 'Creating...');
      
      const { createNote } = await import('./actions/noteActions.js');
      const newNote = await createNote(content, '', 86400);
      
      const url = `${window.location.origin}${notePagePath}?id=${newNote.id}`;
      
      elements.noteLink.textContent = url;
      elements.linkContainer.classList.remove('hidden');
      
      // Copy handler
      elements.noteLink.onclick = async () => {
        try {
          await navigator.clipboard.writeText(url);
          showFeedback('✅ Link copied!', 'success');
          setTimeout(() => showFeedback('', ''), 2000);
        } catch (err) {
          showFeedback('❌ Failed to copy', 'error');
        }
      };

      showFeedback('Note created!', 'success');
    } catch (error) {
      showFeedback(`Error: ${error.message}`, 'error');
    } finally {
      toggleButtonState(false, 'Create Note');
    }
  });

  // Clear button handler
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