// src/js/main.js
import { DomAppService } from './services/domApp_service.js';
import { NoteAppService } from './services/noteApp_service.js';
import { SettingsUI } from './actions/settingsUI.js';

console.log('=== MAIN.JS LOADED ===');

class PrivacyNoteApp {
    constructor() {
        this.elements = {};
        this.settingsLoaded = false;
        this.init();
    }

    async init() {
        try {
            console.log('=== APP INITIALIZING ===');
            await this.initializeElements();
            await this.initializeSettings(); // Wait for settings to load
            this.setupEventListeners();
            console.log('✅ PrivacyNote App initialized successfully');
        } catch (error) {
            console.error('❌ App initialization failed:', error);
        }
    }

    async initializeElements() {
        console.log('Initializing elements...');
        
        this.elements = {
            noteText: document.getElementById('noteText'),
            createNoteBtn: document.getElementById('createNoteBtn'),
            clearBtn: document.getElementById('clearBtn'),
            linkContainer: document.getElementById('linkContainer'),
            noteLink: document.getElementById('noteLink'),
            copyFeedback: document.getElementById('copyFeedback'),
            whatsappBtn: document.getElementById('whatsappBtn'),
            settingsContainer: document.getElementById('settings-container')
        };

        if (!this.elements.createNoteBtn || !this.elements.noteText) {
            throw new Error('Essential elements not found');
        }

        console.log('✅ Elements initialized');
        return true;
    }

    async initializeSettings() {
        console.log('Loading settings...');
        
        if (!this.elements.settingsContainer) {
            console.warn('Settings container not found');
            return;
        }

        try {
            const settingsHtml = await SettingsUI.loadSettings();
            if (settingsHtml) {
                this.elements.settingsContainer.innerHTML = settingsHtml;
                SettingsUI.initialize();
                this.settingsLoaded = true;
                console.log('✅ Settings initialized successfully');
            }
        } catch (error) {
            console.error('❌ Settings initialization failed:', error);
            this.settingsLoaded = false;
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        this.elements.createNoteBtn.addEventListener('click', () => this.handleCreateNote());
        
        if (this.elements.clearBtn) {
            this.elements.clearBtn.addEventListener('click', () => this.handleClear());
        }

        // Add keyboard shortcut for creating note (Ctrl/Cmd + Enter)
        this.elements.noteText.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.handleCreateNote();
            }
        });

        // Auto-save note content to localStorage
        this.elements.noteText.addEventListener('input', () => {
            this.autoSaveNote();
        });

        console.log('✅ Event listeners set up');
    }

    autoSaveNote() {
        const content = this.elements.noteText.value;
        if (content.trim()) {
            localStorage.setItem('privacyNote_draft', content);
        } else {
            localStorage.removeItem('privacyNote_draft');
        }
    }

    loadDraftNote() {
        const draft = localStorage.getItem('privacyNote_draft');
        if (draft && this.elements.noteText) {
            this.elements.noteText.value = draft;
            // Trigger character counter update
            const event = new Event('input', { bubbles: true });
            this.elements.noteText.dispatchEvent(event);
        }
    }

    async handleCreateNote() {
        // Ensure settings are loaded
        if (!this.settingsLoaded) {
            this.showFeedback('Settings not loaded yet. Please wait...', 'error');
            return;
        }

        const content = this.elements.noteText.value.trim();
        if (!content) {
            this.showFeedback('Please enter note content', 'error');
            return;
        }

        if (content.length > 10000) {
            this.showFeedback('Note exceeds 10,000 character limit', 'error');
            return;
        }

        console.log('=== HANDLE CREATE NOTE CALLED ===');
        
        this.toggleButtonState(true, 'Creating Secure Note...');
        
        try {
            // Get current settings
            const settings = SettingsUI.getCurrentSettings();
            console.log('Creating note with settings:', settings);
            
            await NoteAppService.handleNoteCreation(content, this.elements, settings);
            
            // Clear draft after successful creation
            localStorage.removeItem('privacyNote_draft');
            
        } catch (error) {
            console.error('Create note error:', error);
            this.showFeedback(`Error: ${error.message}`, 'error');
        } finally {
            this.toggleButtonState(false, 'Create Secure Note');
        }
    }

    handleClear() {
        if (this.elements.noteText) {
            this.elements.noteText.value = '';
            // Trigger character counter update
            const event = new Event('input', { bubbles: true });
            this.elements.noteText.dispatchEvent(event);
        }
        
        if (this.elements.linkContainer) {
            this.elements.linkContainer.classList.add('hidden');
        }
        
        if (this.elements.copyFeedback) {
            this.elements.copyFeedback.classList.remove('show');
        }
        
        // Clear localStorage draft
        localStorage.removeItem('privacyNote_draft');
        
        // Reset settings using SettingsUI
        if (this.settingsLoaded) {
            SettingsUI.resetSettings();
        }
        
        console.log('UI cleared');
    }

    toggleButtonState(disabled, text) {
        if (!this.elements.createNoteBtn) return;
        
        this.elements.createNoteBtn.disabled = disabled;
        
        if (disabled) {
            this.elements.createNoteBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
        } else {
            this.elements.createNoteBtn.innerHTML = `<i class="fas fa-lock"></i> ${text}`;
        }
    }

    showFeedback(message, type) {
        if (!this.elements.copyFeedback) return;
        
        this.elements.copyFeedback.textContent = message;
        this.elements.copyFeedback.className = `copy-feedback ${type} show`;
        
        setTimeout(() => {
            if (this.elements.copyFeedback) {
                this.elements.copyFeedback.classList.remove('show');
            }
        }, 3000);
    }

    // Method to handle Turnstile callbacks
    setupTurnstileCallbacks() {
        window.onSuccess = (token) => {
            console.log('Turnstile verification successful:', token);
            this.elements.createNoteBtn.disabled = false;
        };

        window.onError = () => {
            console.log('Turnstile verification failed');
            this.elements.createNoteBtn.disabled = true;
            this.showFeedback('Please complete the verification', 'error');
        };
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    console.log('=== DOM CONTENT LOADED ===');
    
    const app = new PrivacyNoteApp();
    
    // Load any draft note from localStorage
    setTimeout(() => {
        app.loadDraftNote();
    }, 1000);
    
    // Setup Turnstile callbacks
    app.setupTurnstileCallbacks();
});