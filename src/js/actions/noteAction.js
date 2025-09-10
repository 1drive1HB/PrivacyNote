
//src\js\actions\noteAction.js
export class NoteAction {
  static async initialize() {
    try {
      const noteContentEl = document.getElementById('noteContent');
      if (!noteContentEl) return;

      await this.setupEnvironment();
      const noteId = this.getNoteIdFromUrl();
      
      noteContentEl.textContent = 'Loading note...';
      
      // Get note content and markAsRead function
      const { content, markAsRead } = await this.getNoteContent(noteId);
      
      // Display content first
      noteContentEl.innerHTML = content.replace(/\n/g, '<br>');
      
      // Then mark as read
      await markAsRead();
      
      // Clear URL after successful load
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
    const isGitHubPages = window.location.hostname.includes('github.io');
    const assetsPath = isGitHubPages ? '/PrivacyNote' : '.';
    
    try {
      const noteQuery = await import(`${assetsPath}/src/js/actions/noteQuery.js`);
      return await noteQuery.getNote(noteId);
    } catch (e) {
      console.error('Failed to import noteQuery:', e);
      throw new Error('Failed to load application resources');
    }
  }

  static handleError(error) {
    console.error('Error:', error);
    const homeUrl = window.location.hostname.includes('github.io') 
      ? 'https://1drive1hb.github.io/PrivacyNote/' 
      : './';
    
    const displayEl = document.getElementById('noteContent') || document.body;
    displayEl.innerHTML = `
      <div class="error-message">
        <p>${this.getUserFriendlyError(error)}</p>
        <a href="${homeUrl}" class="home-link">
          <i class="fas fa-home"></i> Back to Home
        </a>
      </div>
    `;
  }

  static getUserFriendlyError(error) {
    if (error.message.includes('expired')) return 'This note has expired';
    if (error.message.includes('read')) return 'This note has already been read';
    if (error.message.includes('not found')) return 'Note not found';
    return 'Failed to load note';
  }
}

document.addEventListener('DOMContentLoaded', () => NoteAction.initialize());