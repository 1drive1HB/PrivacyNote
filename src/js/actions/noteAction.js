document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Environment detection
    const isLocal = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';
    const isGitHubPages = window.location.hostname.includes('github.io');
    const assetsPath = isGitHubPages ? '/PrivacyNote' : '';

    // Set CSS path
    const cssLink = document.getElementById('css-link');
    if (cssLink) {
      cssLink.href = `${assetsPath}/src/css/styles.css`;
    }

    // Get note ID
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('id');
    if (!noteId) throw new Error('Invalid note URL - missing ID');

    // Corrected import path
    const { getNote } = await import(`${assetsPath}/src/js/actions/noteQuery.js`);
    
    // Get and destroy note
    const content = await getNote(noteId);
    document.getElementById('noteContent').textContent = content;
    
    // Clear URL to prevent reload
    window.history.replaceState({}, document.title, window.location.pathname);

  } catch (error) {
    console.error('Error:', error);
    const homeUrl = window.location.hostname.includes('github.io') 
      ? 'https://1drive1hb.github.io/PrivacyNote/' 
      : './';
    
    const noteContentEl = document.getElementById('noteContent') || document.body;
    noteContentEl.innerHTML = `
      <div class="error-message">
        <p>Error: ${error.message}</p>
        <button onclick="window.location.href='${homeUrl}'">
          Back to Home
        </button>
      </div>
    `;
  }
});