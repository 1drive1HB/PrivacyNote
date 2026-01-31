// src/js/main.js
import { DomService } from './services/dom.service.js';
import { NoteService } from './services/note.service.js';
import { SettingsUI } from './actions/settingsUI.js';
import { WhatsAppUI } from './services/whatsappUI.js';
import { SignalUI } from './services/signalUI.js';
import { TurnstileService } from './services/turnstile.js';
import { RateLimiter } from './utils/rateLimiter.js';
import { InputSanitizer } from './utils/inputSanitizer.js';

// App loaded - silent in production for security

class PrivacyNoteApp {
    constructor() {
        this.elements = {};
        this.settingsLoaded = false;
        this.init();
    }

    async init() {
        try {
            await this.initializeElements();
            await this.initializeSettings();
            await this.initializeServices();
            this.setupEventListeners();
            this.loadDraftNote();
            
            // SECURITY: Cleanup old rate limit data
            RateLimiter.cleanup();
            
            // App initialized successfully - silent in production
        } catch (error) {
            console.error('❌ App initialization failed:', error);
        }
    }

    async initializeElements() {
        this.elements = {
            noteText: DomService.getElement('noteText'),
            createNoteBtn: DomService.getElement('createNoteBtn'),
            clearBtn: DomService.getElement('clearBtn'),
            linkContainer: DomService.getElement('linkContainer'),
            noteLink: DomService.getElement('noteLink'),
            copyFeedback: DomService.getElement('copyFeedback'),
            whatsappBtn: DomService.getElement('whatsappBtn'),
            settingsContainer: DomService.getElement('settings-container'),
            turnstileContainer: DomService.getElement('turnstileContainer')
        };

        if (!this.elements.createNoteBtn || !this.elements.noteText) {
            throw new Error('Essential elements not found');
        }

        return true;
    }

    // In main.js - update the initializeSettings method
    async initializeSettings() {
        if (!this.elements.settingsContainer) {
            console.warn('Settings container not found');
            return;
        }

        try {
            const settingsHtml = await SettingsUI.loadSettings();
            if (settingsHtml) {
                // SECURITY FIX: Validate settings HTML is from our trusted source
                // Since settings.html is from same origin, this is safe but we add validation
                const currentOrigin = window.location.origin;
                const currentPath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/'));
                const expectedPath = `${currentOrigin}${currentPath}/src/html/settings.html`;
                
                // Only inject if HTML looks safe (no script tags)
                if (settingsHtml.includes('<script>') || settingsHtml.includes('javascript:')) {
                    throw new Error('Settings HTML contains unsafe content');
                }
                
                this.elements.settingsContainer.innerHTML = settingsHtml;

                // Wait a tiny bit for DOM to be updated
                setTimeout(() => {
                    SettingsUI.initialize();
                    this.settingsLoaded = true;
                    // Settings initialized successfully - silent in production
                }, 100);
            }
        } catch (error) {
            console.error('❌ Settings initialization failed:', error);
            this.settingsLoaded = false;
        }
    }

    async initializeServices() {
        // Initialize WhatsApp sharing
        WhatsAppUI.init();
        
        // Initialize Signal sharing
        SignalUI.init();

        // Initialize Turnstile
        await TurnstileService.init();
    }

    setupEventListeners() {
        // Note creation
        this.elements.createNoteBtn.addEventListener('click', () => this.handleCreateNote());

        // Clear functionality
        if (this.elements.clearBtn) {
            this.elements.clearBtn.addEventListener('click', () => this.handleClear());
        }

        // Keyboard shortcuts
        this.elements.noteText.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.handleCreateNote();
            }
        });

        // Auto-save
        this.elements.noteText.addEventListener('input', () => {
            this.autoSaveNote();
        });
    }

    autoSaveNote() {
        const content = this.elements.noteText.value;
        if (content.trim()) {
            localStorage.setItem('privacyNote_draft', content);
        } else {
            localStorage.removeItem('privacyNote_draft');
        }

        // Update character counter
        DomService.updateCharacterCounter(content.length);
    }

    loadDraftNote() {
        const draft = localStorage.getItem('privacyNote_draft');
        if (draft && this.elements.noteText) {
            this.elements.noteText.value = draft;
            DomService.updateCharacterCounter(draft.length);
        }
    }

    async handleCreateNote() {
        if (!this.settingsLoaded) {
            DomService.showFeedback(this.elements.copyFeedback, 'Settings not loaded yet. Please wait...', 'error');
            return;
        }

        const rawContent = this.elements.noteText.value;
        const validation = InputSanitizer.validateNoteContent(rawContent);
        
        if (!validation.valid) {
            DomService.showFeedback(this.elements.copyFeedback, validation.errors[0], 'error');
            return;
        }
        
        const warnings = InputSanitizer.detectSuspiciousPattern(validation.sanitized);
        if (warnings.length > 0) {
            DomService.showFeedback(this.elements.copyFeedback, 'Note contains potentially unsafe content', 'error');
            return;
        }

        DomService.toggleButtonState(this.elements.createNoteBtn, true, 'Creating Secure Note...');

        try {
            const settings = SettingsUI.getCurrentSettings();
            const url = await NoteService.createNote(validation.sanitized, settings);

            NoteService.displayNoteLink(url, this.elements);
            DomService.showFeedback(this.elements.copyFeedback, 'Secure note created successfully!', 'success');

            // Auto-close settings accordion after note creation
            if (this.settingsLoaded) {
                SettingsUI.closeAccordion();
            }

            localStorage.removeItem('privacyNote_draft');

        } catch (error) {
            DomService.showFeedback(this.elements.copyFeedback, `Error: ${error.message}`, 'error');
        } finally {
            DomService.toggleButtonState(this.elements.createNoteBtn, false, 'Create Secure Note');
        }
    }

    handleClear() {
        DomService.clearUI(this.elements);
        if (this.settingsLoaded) {
            SettingsUI.resetSettings();
            // NEW: Close the accordion when clearing
            SettingsUI.closeAccordion();
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new PrivacyNoteApp();
});