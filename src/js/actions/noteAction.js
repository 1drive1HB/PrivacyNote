// src/js/actions/noteAction.js

export class NoteAction {
  static async initialize() {
    try {
      const noteContentEl = document.getElementById('noteContent');
      if (!noteContentEl) return;

      await this.setupEnvironment();
      const noteId = this.getNoteIdFromUrl();
      
      //noteContentEl.textContent = 'Loading note...';
      
      const { content, markAsRead } = await this.getNoteContent(noteId);
      
      noteContentEl.innerHTML = content.replace(/\n/g, '<br>');
      
      await markAsRead();
      
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
      // The single line that needs to be fixed.
      // Correct relative path to noteQuery.js, which is in the same folder.
      const noteQuery = await import('./noteQuery.js');
      return await noteQuery.getNote(noteId);
    } catch (e) {
      console.error('Failed to import noteQuery:', e);
      throw new Error('Failed to load application resources');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => NoteAction.initialize());