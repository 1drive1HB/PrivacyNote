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

  // In noteApp_service.js - update the createNote call
  static async handleNoteCreation(content, elements) {
    try {
      const env = this.getEnvironment();
      console.log('[NoteApp] Environment:', env);
      
      // Get settings from radio buttons
      const encryptionType = document.querySelector('input[name="encryption"]:checked')?.value || 'encryption';
      const expirationType = document.querySelector('input[name="expiration"]:checked')?.value || '24h';
      
      const isEncrypted = encryptionType === 'encryption';
      const password = isEncrypted ? prompt('Enter encryption password:') : null;
      
      if (isEncrypted && !password) {
        throw new Error('Password required for encrypted note');
      }

      // Convert expiration to seconds
      let expiresIn = 24 * 60 * 60; // Default 24 hours
      if (expirationType === '48h') {
        expiresIn = 48 * 60 * 60;
      }

      const { createNote } = await import('../actions/noteQuery.js');
      console.log('[NoteApp] Module loaded successfully');
      
      // FIXED: Pass all required parameters including isEncrypted
      const newNote = await createNote(content, expiresIn, isEncrypted, password);
      
      if (!newNote?.id) {
        throw new Error('Invalid note response from server');
      }
      
      let url = `${window.location.origin}${env.basePath}/note.html?id=${newNote.id}`;
      if (isEncrypted) {
        url += '&encrypted=true';
      }
      
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