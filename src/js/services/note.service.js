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
      const env = this.getEnvironment();

      // FIX: Remove the string comparison - settings.encryption is already boolean
      const isEncrypted = Boolean(settings.encryption);
      const expiresIn = settings.expiration === '48h' ? 172800 : 86400; // 48h or 24h in seconds

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

  // Note Viewing - FIXED VERSION with proper error handling
  static async viewNote() {
    try {
      const noteId = this.getNoteIdFromUrl();

      if (!noteId) {
        console.log('❌ This note does not exist or has been deleted.');
        this.showError('This note does not exist or has been deleted.');
        return false;
      }

      await this.setupEnvironment();
      const noteResult = await this.getNoteContent(noteId);

      // If noteResult is null, it means the note doesn't exist or was already read
      if (noteResult === null) {
        console.log('❌ This note does not exist or has been deleted.');
        this.showError('This note does not exist or has been deleted.');
        return false;
      }

      const { content, markAsRead } = noteResult;

      // Hide loading spinner and show content
      this.hideLoading();
      this.hideError();

      const noteContentEl = DomService.getElement('noteContent');
      if (noteContentEl) {
        noteContentEl.innerHTML = content.replace(/\n/g, '<br>');
        noteContentEl.classList.remove('hidden');
      }

      if (markAsRead) {
        await markAsRead();
      }

      // Clean URL after reading
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;

    } catch (error) {
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
      const noteQuery = await import('../actions/noteQuery.js');
      const note = await noteQuery.getNote(noteId);

      // If note is null, return null instead of throwing error
      if (note === null) {
        return null;
      }

      return note;
    } catch (error) {
      // For specific errors, return null instead of throwing
      if (error.message.includes('already been read') ||
        error.message.includes('destroyed') ||
        error.message.includes('expired') ||
        error.message.includes('not found')) {
        return null;
      }

      // Re-throw only unexpected errors
      throw error;
    }
  }

  static handleViewError(error) {
    this.hideLoading();
    this.hideNoteContent();

    const errorContainer = DomService.getElement('errorContainer');
    const errorMessage = DomService.getElement('errorMessage');

    if (errorContainer && errorMessage) {
      // Use a generic user-friendly message
      errorMessage.textContent = 'This note does not exist or has been deleted.';
      errorContainer.classList.remove('hidden');
    }
  }

  static showError(message) {
    this.hideLoading();
    this.hideNoteContent();
    this.hideInfo();

    const errorContainer = DomService.getElement('errorContainer');
    const errorMessage = DomService.getElement('errorMessage');

    if (errorContainer && errorMessage) {
      errorMessage.textContent = message;
      errorContainer.classList.remove('hidden');
    }
  }

  static hideLoading() {
    const noteContentEl = DomService.getElement('noteContent');
    if (noteContentEl) {
      const loadingElement = noteContentEl.querySelector('.loading');
      if (loadingElement) {
        loadingElement.remove();
      }
    }
  }

  static hideNoteContent() {
    const noteContentEl = DomService.getElement('noteContent');
    if (noteContentEl) {
      noteContentEl.classList.add('hidden');
      noteContentEl.innerHTML = '';
    }
  }

  static hideError() {
    const errorContainer = DomService.getElement('errorContainer');
    if (errorContainer) {
      errorContainer.classList.add('hidden');
    }
  }

  static hideInfo() {
    const infoContainer = DomService.getElement('infoContainer');
    if (infoContainer) {
      infoContainer.classList.add('hidden');
    }
  }

  static async setupEnvironment() {
    const env = this.getEnvironment();
    const cssLink = DomService.getElement('css-link');
    if (cssLink) cssLink.href = `${env.assetsPath}/src/css/styles.css`;
  }
}