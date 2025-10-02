// src/js/services/note.service.js
import { DomService } from './dom.service.js';
import { config } from '../config.js';

export class NoteService {
  static getEnvironment() {
    const hostname = window.location.hostname;
    const isGitHubPages = hostname.includes('github.io');

    return {
      isGitHubPages,
      basePath: isGitHubPages ? '/PrivacyNote' : '',
      assetsPath: isGitHubPages ? '/PrivacyNote' : ''
    };
  }

  // Note Creation - FIXED VERSION
  static async createNote(content, settings) {
    try {
      console.log('📝 Creating note with settings:', settings);
      console.log('🔐 Encryption setting:', {
        raw: settings.encryption,
        type: typeof settings.encryption
      });

      const env = this.getEnvironment();

      // FIX: Remove the string comparison - settings.encryption is already boolean
      const isEncrypted = Boolean(settings.encryption);
      const expiresIn = settings.expiration === '48h' ? 172800 : 86400; // 48h or 24h in seconds

      console.log('🎯 Final parameters:', {
        contentLength: content.length,
        isEncrypted,
        expiresIn
      });

      const { createNote } = await import('../actions/noteQuery.js');
      const newNote = await createNote(content, expiresIn, isEncrypted);

      if (!newNote?.id) {
        throw new Error('Failed to create note');
      }

      // Generate URL with encryption key in hash if encrypted
      const url = this.generateNoteUrl(newNote.id, isEncrypted, env);
      return url;
    } catch (error) {
      console.error('NoteService Error:', error);
      throw error;
    }
  }

  static generateNoteUrl(noteId, isEncrypted, env) {
    let url = `${window.location.origin}${env.basePath}/note.html?id=${noteId}`;

    // Add encryption key to URL hash for true E2E encryption
    // if (isEncrypted && config.encryptionKey) {
    //   url += `#key=${encodeURIComponent(config.encryptionKey)}`;
    // }

    return url;
  }

  static displayNoteLink(url, elements) {
    elements.linkContainer.classList.remove('hidden');
    elements.noteLink.textContent = url;
    elements.noteLink.setAttribute('data-url', url);

    elements.noteLink.onclick = () => DomService.copyToClipboard(url, elements.copyFeedback);

    // Setup WhatsApp sharing
    if (elements.whatsappBtn) {
      elements.whatsappBtn.setAttribute('data-url', url);
    }
  }

  // Note Viewing - FIXED VERSION
  static async viewNote() {
    try {
      console.log('🔍 Starting note viewing process...');

      const noteId = this.getNoteIdFromUrl();

      if (!noteId) {
        this.showError('This note does not exist or has been deleted.');
        return false;
      }

      console.log('Loading note with ID:', noteId);

      await this.setupEnvironment();
      const { content, markAsRead } = await this.getNoteContent(noteId);

      // Hide loading spinner and show content
      this.hideLoading();

      const noteContentEl = DomService.getElement('noteContent');
      if (noteContentEl) {
        noteContentEl.innerHTML = content.replace(/\n/g, '<br>');
        noteContentEl.classList.remove('hidden');
      }

      await markAsRead();

      // Clean URL after reading
      window.history.replaceState({}, document.title, window.location.pathname);

      console.log('✅ Note loaded successfully');
      return true;

    } catch (error) {
      console.error('❌ Note viewing failed:', error);
      this.hideLoading();
      this.handleViewError(error);
      return false;
    }
  }

  static getNoteIdFromUrl() {
    const noteId = new URLSearchParams(window.location.search).get('id');
    return noteId || null;
  }

  static async getNoteContent(noteId) {
    try {
      console.log('Fetching note content...');
      const noteQuery = await import('../actions/noteQuery.js');
      const note = await noteQuery.getNote(noteId);

      if (note === null) {
        throw new Error('This note has been read and destroyed or does not exist.');
      }

      return note;
    } catch (error) {
      console.error('Failed to get note:', error);

      // Provide user-friendly error messages
      if (error.message.includes('already been read') || error.message.includes('destroyed')) {
        throw new Error('This note has already been read and destroyed.');
      } else if (error.message.includes('expired')) {
        throw new Error('This note has expired.');
      } else if (error.message.includes('not found')) {
        throw new Error('This note does not exist or has been deleted.');
      } else {
        throw new Error('Failed to load note. Please try again.');
      }
    }
  }

  static handleViewError(error) {
    const errorContainer = DomService.getElement('errorContainer');
    const errorMessage = DomService.getElement('errorMessage');

    if (errorContainer && errorMessage) {
      errorMessage.textContent = error.message;
      errorContainer.classList.remove('hidden');
    }

    console.error('Note Viewing Error:', error);
  }

  static showError(message) {
    const errorContainer = DomService.getElement('errorContainer');
    const errorMessage = DomService.getElement('errorMessage');
    const noteContent = DomService.getElement('noteContent');
    const infoContainer = DomService.getElement('infoContainer');

    if (noteContent) noteContent.classList.add('hidden');
    if (infoContainer) infoContainer.classList.add('hidden');

    if (errorContainer && errorMessage) {
      errorMessage.textContent = message;
      errorContainer.classList.remove('hidden');
    }
  }

  static hideLoading() {
    const noteContentEl = DomService.getElement('noteContent');
    if (noteContentEl) {
      // Remove the loading spinner but keep the element visible for content
      const loadingElement = noteContentEl.querySelector('.loading');
      if (loadingElement) {
        loadingElement.remove();
      }
    }
  }

  static async setupEnvironment() {
    const env = this.getEnvironment();
    const cssLink = DomService.getElement('css-link');
    if (cssLink) cssLink.href = `${env.assetsPath}/src/css/styles.css`;
  }
}