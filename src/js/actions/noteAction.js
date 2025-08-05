document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Environment detection
    const isLocal = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';
    const isGitHubPages = window.location.hostname.includes('github.io');

    // Set CSS path
    const cssLink = document.getElementById('css-link');
    if (cssLink) {
      cssLink.href = isLocal ? '../src/css/styles.css' : 
                     isGitHubPages ? '/PrivacyNote/src/css/styles.css' : './src/css/styles.css';
    }

    // Get elements
    const noteContentEl = document.getElementById('noteContent');
    if (!noteContentEl) throw new Error('Note content element not found');

    // Get note ID
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('id');
    if (!noteId) throw new Error('Invalid note URL - missing ID');

    // Import noteQuery
    const { getNote } = await import(
      isLocal ? './noteQuery.js' : 
      isGitHubPages ? '/PrivacyNote/src/js/actions/noteQuery.js' : 
      './noteQuery.js'
    );
    
    // Get and destroy note
    const content = await getNote(noteId);
    noteContentEl.textContent = content;
    
    // Clear URL to prevent reload
    window.history.replaceState({}, document.title, window.location.pathname);

  } catch (error) {
    console.error('Error:', error);
    const noteContentEl = document.getElementById('noteContent') || document.body;
    noteContentEl.innerHTML = `
      <div class="error-message">
        <p>Error: ${error.message}</p>
        <button onclick="window.location.href='${isLocal ? 'http://127.0.0.1:8080/' : 
                         isGitHubPages ? 'https://1drive1hb.github.io/PrivacyNote/' : './'}'">
          Back to Home
        </button>
      </div>
    `;
  }
});