// src/js/actions/noteAction.js

export class NoteAction {
  static async initialize() {
    try {
      const noteContentEl = document.getElementById('noteContent');
      if (!noteContentEl) return;

      await this.setupEnvironment();
      const noteId = this.getNoteIdFromUrl();
      
      // Check if note is encrypted from URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      const isEncrypted = urlParams.get('encrypted') === 'true';
      
      console.log('Loading note:', { noteId, isEncrypted });
      
      const { content, markAsRead } = await this.getNoteContent(noteId);
      
      noteContentEl.innerHTML = content.replace(/\n/g, '<br>');
      
      await markAsRead();
      
      // Clean URL after reading
      window.history.replaceState({}, document.title, window.location.pathname);

    } catch (error) {
      this.handleError(error);
    }
  }

  static async setupEnvironment() {
    const isGitHubPages = window.location.hostname.includes('github.io');
    const assetsPath = isGitHubPages ? '/PrivacyNote' : '.';
    
    const cssLink = document.getElementById('css-link');
    if (cssLink) cssLink.href = `${assetsPath}/src/css/styles.css`;
  }

  static getNoteIdFromUrl() {
    const noteId = new URLSearchParams(window.location.search).get('id');
    if (!noteId) throw new Error('Missing note ID in URL');
    return noteId;
  }

  static async getNoteContent(noteId) {
    try {
      const noteQuery = await import('./noteQuery.js');
      // No password needed - encryption is handled automatically
      return await noteQuery.getNote(noteId);
    } catch (e) {
      console.error('Failed to import noteQuery:', e);
      throw new Error('Failed to load application resources');
    }
  }

  static handleError(error) {
    const noteContentEl = document.getElementById('noteContent');
    if (noteContentEl) {
      noteContentEl.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    }
    console.error('NoteAction Error:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => NoteAction.initialize());