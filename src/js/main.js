// src/js/main.js
import { DomAppService } from './services/domApp_service.js';
import { NoteAppService } from './services/noteApp_service.js';

console.log('=== MAIN.JS LOADED ===');

class PrivacyNoteApp {
  constructor() {
    this.elements = {};
    this.init();
  }

  async init() {
    try {
      console.log('=== APP INITIALIZING ===');
      await this.initializeElements();
      this.setupEventListeners();
      console.log('✅ PrivacyNote App initialized successfully');
    } catch (error) {
      console.error('❌ App initialization failed:', error);
    }
  }

  initializeElements() {
    console.log('Initializing elements...');
    
    this.elements = {
      noteText: document.getElementById('noteText'),
      createNoteBtn: document.getElementById('createNoteBtn'),
      clearBtn: document.getElementById('clearBtn'),
      linkContainer: document.getElementById('linkContainer'),
      noteLink: document.getElementById('noteLink'),
      copyFeedback: document.getElementById('copyFeedback'),
      whatsappBtn: document.getElementById('whatsappBtn')
    };

    // Check essential elements
    if (!this.elements.createNoteBtn || !this.elements.noteText) {
      throw new Error('Essential elements not found');
    }

    console.log('✅ Elements initialized');
    return true;
  }

  setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Create Note button
    this.elements.createNoteBtn.addEventListener('click', () => this.handleCreateNote());
    
    // Clear button
    if (this.elements.clearBtn) {
      this.elements.clearBtn.addEventListener('click', () => this.handleClear());
    }
    
    console.log('✅ Event listeners set up');
  }

  async handleCreateNote() {
    const content = this.elements.noteText.value.trim();
    if (!content) {
      DomAppService.showFeedback(this.elements.copyFeedback, 'Please enter note content', 'error');
      return;
    }

    console.log('=== HANDLE CREATE NOTE CALLED ===');
    
    DomAppService.toggleButtonState(this.elements.createNoteBtn, true, 'Creating...');
    
    try {
      // Test: Get radio values directly here
      const encryptionRadio = document.querySelector('input[name="encryption"]:checked');
      const expirationRadio = document.querySelector('input[name="expiration"]:checked');
      
      console.log('Direct radio values - Encryption:', encryptionRadio?.value, 'Expiration:', expirationRadio?.value);
      
      await NoteAppService.handleNoteCreation(content, this.elements);
    } catch (error) {
      console.error('Create note error:', error);
      DomAppService.showFeedback(this.elements.copyFeedback, `Error: ${error.message}`, 'error');
    } finally {
      DomAppService.toggleButtonState(this.elements.createNoteBtn, false, 'Create Secure Note');
    }
  }

  handleClear() {
    DomAppService.clearUI(this.elements);
    console.log('UI cleared');
  }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('=== DOM CONTENT LOADED ===');
  new PrivacyNoteApp();
});