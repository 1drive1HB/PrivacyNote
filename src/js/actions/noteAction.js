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
    if (!noteId) 
    //throw new Error('Missing URL 2/ Message Deleted ');
    console.log('Missing URL parameter / Message Deleted');
    return noteId;
  }

  static async getNoteContent(noteId) {
    try {
      const noteQuery = await import('./noteQuery.js');
      const note = await noteQuery.getNote(noteId);
      if (!note) {
        throw new Error('This note has been read and destroyed.');
      }
      return note;
    } catch (e) {
      console.error('Failed to import or get noteQuery:', e);
      throw new Error(e.message || 'Failed to load application resources');
    }
  }

static handleError(error) {
    const noteContentEl = document.getElementById('noteContent');
    if (noteContentEl) {
      // 1. Remove the successful content class
      noteContentEl.classList.remove('note-content-area'); 
      
      // 2. Add the error styling class (which now has width: 100% and min-height: 140px)
      noteContentEl.classList.add('error');
      
      // 3. Inject the error message
      noteContentEl.innerHTML = `Error: ${error.message}`;
    }
    console.error('NoteAction Error:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => NoteAction.initialize());