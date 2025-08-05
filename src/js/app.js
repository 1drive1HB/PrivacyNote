document.addEventListener('DOMContentLoaded', async () => {
  // Safe element getter with error handling
  const getElement = (id) => {
    const el = document.getElementById(id);
    if (!el) {
      console.error(`Element ${id} not found`);
      return null;
    }
    return el;
  };

  const elements = {
    noteText: getElement('noteText'),
    createNoteBtn: getElement('createNoteBtn'),
    clearBtn: getElement('clearBtn'),
    linkContainer: getElement('linkContainer'),
    noteLink: getElement('noteLink'),
    copyFeedback: getElement('copyFeedback'),
    whatsappShare: getElement('whatsappShare'),
    whatsappBtn: getElement('whatsappBtn')
  };

  // Exit if essential elements are missing
  if (!elements.createNoteBtn || !elements.noteText) {
    console.error('Essential elements missing - cannot initialize app');
    return;
  }

  // Environment detection
  const isLocal = window.location.hostname === 'localhost' || 
                 window.location.hostname === '127.0.0.1';
  const isGitHubPages = window.location.hostname.includes('github.io');
  const basePath = isGitHubPages ? '/PrivacyNote' : '';

  // Initialize button state
  toggleButtonState(false, 'Create Secure Note');

  // Create Note button handler
  elements.createNoteBtn.addEventListener('click', async () => {
    try {
      const content = elements.noteText.value.trim();
      if (!content) {
        showFeedback('Please enter note content', 'error');
        return;
      }

      toggleButtonState(true, 'Creating...');
      
      const { createNote } = await import(
        isLocal ? './actions/noteQuery.js' : 
        isGitHubPages ? '/PrivacyNote/src/js/actions/noteQuery.js' : 
        './actions/noteQuery.js'
      );
      
      const newNote = await createNote(content, 86400);
      
      const url = `${window.location.origin}${basePath}/note.html?id=${newNote.id}`;
      
      // Update UI
      elements.noteLink.textContent = url;
      elements.linkContainer.classList.remove('hidden');
      
      // Copy handler
      elements.noteLink.onclick = async (e) => {
        e.preventDefault();
        try {
          await navigator.clipboard.writeText(url);
          elements.noteLink.classList.add('copied');
          showFeedback('✅ Link copied!', 'success');
          setTimeout(() => {
            elements.noteLink.classList.remove('copied');
          }, 2000);
        } catch (err) {
          showFeedback('❌ Failed to copy', 'error');
        }
      };

      // WhatsApp Share
      if (elements.whatsappBtn) {
        elements.whatsappBtn.onclick = () => {
          const message = `Check out this secret note: ${url}`;
          const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
          window.open(
            isMobile 
              ? `whatsapp://send?text=${encodeURIComponent(message)}` 
              : `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`,
            '_blank'
          );
        };
      }
      
      showFeedback('Note created!', 'success');
    } catch (error) {
      console.error('Error creating note:', error);
      showFeedback(`Error: ${error.message}`, 'error');
    } finally {
      toggleButtonState(false, 'Create Secure Note');
    }
  });

  // Clear button handler
  if (elements.clearBtn) {
    elements.clearBtn.addEventListener('click', () => {
      elements.noteText.value = '';
      elements.linkContainer.classList.add('hidden');
      if (elements.whatsappShare) elements.whatsappShare.classList.add('hidden');
      hideFeedback();
    });
  }

  function toggleButtonState(disabled, text) {
    if (!elements.createNoteBtn) return;
    elements.createNoteBtn.disabled = disabled;
    elements.createNoteBtn.innerHTML = disabled
      ? `<i class="fas fa-spinner fa-spin"></i> ${text}`
      : `<i class="fas fa-lock"></i> ${text}`;
  }

  function showFeedback(message, type) {
    if (!elements.copyFeedback) return;
    elements.copyFeedback.textContent = message;
    elements.copyFeedback.className = `copy-feedback ${type} show`;
    setTimeout(hideFeedback, 3000);
  }

  function hideFeedback() {
    if (elements.copyFeedback) {
      elements.copyFeedback.classList.remove('show');
    }
  }
});