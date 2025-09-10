//src\js\app.js
import { DomAppService } from './services/domApp_service.js';
import { NoteAppService } from './services/noteApp_service.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize elements - mark non-essential ones as optional
  const elements = {
    noteText: DomAppService.getElement('noteText', true),
    createNoteBtn: DomAppService.getElement('createNoteBtn', true),
    clearBtn: DomAppService.getElement('clearBtn'), // Optional
    linkContainer: DomAppService.getElement('linkContainer'),
    noteLink: DomAppService.getElement('noteLink'),
    copyFeedback: DomAppService.getElement('copyFeedback'),
    whatsappShare: DomAppService.getElement('whatsappShare'),
    whatsappBtn: DomAppService.getElement('whatsappBtn')
  };

  // Check only essential elements
  if (!elements.createNoteBtn || !elements.noteText) {
    const feedback = DomAppService.getElement('copyFeedback');
    if (feedback) {
      DomAppService.showFeedback(feedback, 'Application failed to initialize', 'error');
    }
    return;
  }

  // Set up event listeners only for existing elements
  elements.createNoteBtn.addEventListener('click', async () => {
    const content = elements.noteText.value.trim();
    if (!content) {
      DomAppService.showFeedback(elements.copyFeedback, 'Please enter note content', 'error');
      return;
    }

    DomAppService.toggleButtonState(elements.createNoteBtn, true, 'Creating...');
    
    try {
      await NoteAppService.handleNoteCreation(content, elements);
      DomAppService.showFeedback(elements.copyFeedback, 'Note created!', 'success');
    } catch (error) {
      DomAppService.showFeedback(elements.copyFeedback, `Error: ${error.message}`, 'error');
    } finally {
      DomAppService.toggleButtonState(elements.createNoteBtn, false, 'Create Secure Note');
    }
  });

  if (elements.clearBtn) {
    elements.clearBtn.addEventListener('click', () => {
      DomAppService.clearUI(elements);
    });
  }

  // Initialize UI
  DomAppService.toggleButtonState(elements.createNoteBtn, false, 'Create Secure Note');
});