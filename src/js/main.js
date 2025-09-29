// src/js/main.js
import { DomAppService } from './services/domApp_service.js';
import { NoteAppService } from './services/noteApp_service.js';
import { SettingsUI } from './actions/settingsUI.js';

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

        if (!this.elements.createNoteBtn || !this.elements.noteText) {
            throw new Error('Essential elements not found');
        }

        console.log('✅ Elements initialized');
        return true;
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        this.elements.createNoteBtn.addEventListener('click', () => this.handleCreateNote());
        
        if (this.elements.clearBtn) {
            this.elements.clearBtn.addEventListener('click', () => this.handleClear());
        }
        
        console.log('✅ Event listeners set up');
    }

    async handleCreateNote() {
        const content = this.elements.noteText.value.trim();
        if (!content) {
            this.showFeedback('Please enter note content', 'error');
            return;
        }

        console.log('=== HANDLE CREATE NOTE CALLED ===');
        
        this.toggleButtonState(true, 'Creating...');
        
        try {
            await NoteAppService.handleNoteCreation(content, this.elements);
        } catch (error) {
            console.error('Create note error:', error);
            this.showFeedback(`Error: ${error.message}`, 'error');
        } finally {
            this.toggleButtonState(false, 'Create Secure Note');
        }
    }

    handleClear() {
        if (this.elements.noteText) this.elements.noteText.value = '';
        if (this.elements.linkContainer) this.elements.linkContainer.classList.add('hidden');
        if (this.elements.copyFeedback) this.elements.copyFeedback.classList.remove('show');
        
        // Reset settings using SettingsUI
        SettingsUI.resetSettings();
        
        console.log('UI cleared');
    }

    toggleButtonState(disabled, text) {
        if (!this.elements.createNoteBtn) return;
        this.elements.createNoteBtn.disabled = disabled;
        this.elements.createNoteBtn.innerHTML = disabled
            ? `<i class="fas fa-spinner fa-spin"></i> ${text}`
            : `<i class="fas fa-lock"></i> ${text}`;
    }

    showFeedback(message, type) {
        if (!this.elements.copyFeedback) return;
        this.elements.copyFeedback.textContent = message;
        this.elements.copyFeedback.className = `copy-feedback ${type} show`;
        setTimeout(() => {
            if (this.elements.copyFeedback) this.elements.copyFeedback.classList.remove('show');
        }, 3000);
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== DOM CONTENT LOADED ===');
    new PrivacyNoteApp();
});