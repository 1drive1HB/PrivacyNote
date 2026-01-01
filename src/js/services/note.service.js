import { DomService } from './dom.service.js';
import { config } from '../conf/config.js';
import { parseError, NetworkError } from '../utils/customErrors.js';

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

  static async createNote(content, settings) {
    try {
      const env = this.getEnvironment();

      const isEncrypted = Boolean(settings.encryption);
      const expiresIn = settings.expiration === '48h' ? 172800 : 86400;

      const { createNote } = await import('../actions/noteQuery.js');
      const newNote = await createNote(content, expiresIn, isEncrypted);

      if (!newNote?.id) {
        throw new Error('Failed to create note');
      }

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

    if (elements.whatsappBtn) {
      elements.whatsappBtn.setAttribute('data-url', url);
    }
  }

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

      if (noteResult === null) {
        console.log('❌ This note does not exist or has been deleted.');
        this.showError('This note does not exist or has been deleted.');
        return false;
      }

      const { content, markAsRead } = noteResult;

      this.hideLoading();
      this.hideError();

      const noteContentEl = DomService.getElement('noteContent');
      if (noteContentEl) {
        noteContentEl.textContent = '';
        const lines = content.split('\n');
        lines.forEach((line, index) => {
          const textNode = document.createTextNode(line);
          noteContentEl.appendChild(textNode);
          if (index < lines.length - 1) {
            noteContentEl.appendChild(document.createElement('br'));
          }
        });
        noteContentEl.classList.remove('hidden');
      }

      if (markAsRead) {
        await markAsRead();
      }

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

      if (note === null) {
        return null;
      }

      return note;
    } catch (error) {
      if (error.message.includes('already been read') ||
        error.message.includes('destroyed') ||
        error.message.includes('expired') ||
        error.message.includes('not found')) {
        return null;
      }

      throw error;
    }
  }

  static handleViewError(error) {
    this.hideLoading();
    this.hideNoteContent();

    const parsedError = parseError(error);
    
    const errorContainer = DomService.getElement('errorContainer');
    const errorMessage = DomService.getElement('errorMessage');

    if (errorContainer && errorMessage) {
      errorMessage.innerHTML = `
        <strong>${parsedError.userMessage}</strong>
        <p class="error-advice">${parsedError.actionAdvice}</p>
      `;
      
      errorContainer.classList.remove('hidden');
      
      if (parsedError.retryable) {
        const retryBtn = document.createElement('button');
        retryBtn.textContent = 'Retry';
        retryBtn.className = 'retry-btn';
        retryBtn.onclick = () => {
          window.location.reload();
        };
        errorMessage.appendChild(retryBtn);
      }
    }
  }

  static showError(message, isHtml = false) {
    this.hideLoading();
    this.hideNoteContent();
    this.hideInfo();

    const errorContainer = DomService.getElement('errorContainer');
    const errorMessage = DomService.getElement('errorMessage');

    if (errorContainer && errorMessage) {
      if (isHtml) {
        errorMessage.innerHTML = message;
      } else {
        errorMessage.textContent = message;
      }
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