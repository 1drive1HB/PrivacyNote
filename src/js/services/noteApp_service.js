//src\js\services\noteApp_service.js
import { DomAppService } from './domApp_service.js';

export class NoteAppService {
  static getEnvironment() {
    const isLocal = window.location.hostname === 'localhost' || 
                   window.location.hostname === '127.0.0.1';
    const isGitHubPages = window.location.hostname.includes('github.io');
    
    return {
      isLocal,
      isGitHubPages,
      basePath: isGitHubPages ? '/PrivacyNote' : '',
      assetsPath: isGitHubPages ? '/PrivacyNote' : ''
    };
  }

  static async handleNoteCreation(content, elements) {
    try {
      const env = this.getEnvironment();
      console.log('[NoteApp] Environment:', env);
      
      // Corrected import path
      const modulePath = `${env.assetsPath}/src/js/actions/noteQuery.js`;
      console.log('[NoteApp] Importing from:', modulePath);
      
      const { createNote } = await import(modulePath);
      console.log('[NoteApp] Module loaded successfully');
      
      const newNote = await createNote(content, 86400);
      
      if (!newNote?.id) {
        throw new Error('Invalid note response from server');
      }
      
      const url = `${window.location.origin}${env.basePath}/note.html?id=${newNote.id}`;
      this.updateUIForNewNote(url, elements);
      
      return true;
    } catch (error) {
      console.error('[NoteApp] Note creation failed:', error);
      throw error;
    }
  }

  static updateUIForNewNote(url, elements) {
    elements.linkContainer.classList.remove('hidden');
    this.setupNoteLink(url, elements.noteLink, elements.copyFeedback);
    this.setupWhatsAppShare(url, elements.whatsappBtn, elements.copyFeedback);
  }

  static setupNoteLink(url, noteLinkElement, feedbackElement) {
    noteLinkElement.textContent = url;
    
    noteLinkElement.onclick = async (e) => {
      e.preventDefault();
      try {
        await navigator.clipboard.writeText(url);
        noteLinkElement.classList.add('copied');
        DomAppService.showFeedback(feedbackElement, '✅ Link copied!', 'success');
        setTimeout(() => {
          noteLinkElement.classList.remove('copied');
        }, 2000);
      } catch (err) {
        DomAppService.showFeedback(feedbackElement, '❌ Failed to copy', 'error');
      }
    };
  }

  static setupWhatsAppShare(url, whatsappBtn, feedbackElement) {
    if (!whatsappBtn) return;
    
    whatsappBtn.onclick = () => {
      try {
        const message = `Check out this secret note: ${url}`;
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const whatsappUrl = isMobile 
          ? `whatsapp://send?text=${encodeURIComponent(message)}` 
          : `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
      } catch (err) {
        DomAppService.showFeedback(feedbackElement, 'Failed to open WhatsApp', 'error');
      }
    };
  }
}