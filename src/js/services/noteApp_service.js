//src\js\services\noteApp_service.js
import { DomAppService } from './domApp_service.js';

console.log('=== NOTEAPP SERVICE LOADED ===');
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
      console.log('=== NOTEAPP SERVICE CALLED ===');
      
      const env = this.getEnvironment();
      
      // Get settings directly to ensure they're read
      const encryptionValue = this.getEncryptionSetting();
      const expirationType = this.getExpirationSetting();
      
      console.log('Encryption setting:', encryptionValue);
      console.log('Expiration setting:', expirationType);
      
      const isEncrypted = encryptionValue === 'true';
      const expiresIn = expirationType === '48h' ? 48 * 60 * 60 : 24 * 60 * 60;

      console.log('Final values - isEncrypted:', isEncrypted, 'expiresIn:', expiresIn);

      const { createNote } = await import('../actions/noteQuery.js');
      console.log('Calling createNote...');
      
      const newNote = await createNote(content, expiresIn, isEncrypted);
      
      if (!newNote?.id) {
        throw new Error('Failed to create note');
      }
      
      const url = this.generateNoteUrl(newNote.id, isEncrypted, env);
      this.displayNoteLink(url, elements);
      
      DomAppService.showFeedback(elements.copyFeedback, 'Secure note created successfully!', 'success');
      return true;
    } catch (error) {
      console.error('NoteAppService Error:', error);
      throw error;
    }
  }

  static getEncryptionSetting() {
    try {
      const radio = document.querySelector('input[name="encryption"]:checked');
      const value = radio ? radio.value : 'true'; // Default to encryption ON
      console.log('Encryption radio value:', value);
      return value;
    } catch (error) {
      console.error('Error getting encryption setting:', error);
      return 'true'; // Default to encryption ON
    }
  }

  static getExpirationSetting() {
    try {
      const radio = document.querySelector('input[name="expiration"]:checked');
      const value = radio ? radio.value : '24h'; // Default to 24h
      console.log('Expiration radio value:', value);
      return value;
    } catch (error) {
      console.error('Error getting expiration setting:', error);
      return '24h'; // Default to 24h
    }
  }

  static generateNoteUrl(noteId, isEncrypted, env) {
    let url = `${window.location.origin}${env.basePath}/note.html?id=${noteId}`;
    if (isEncrypted) {
      url += '&encrypted=true';
    }
    return url;
  }

  static displayNoteLink(url, elements) {
    elements.linkContainer.classList.remove('hidden');
    elements.noteLink.textContent = url;
    elements.noteLink.setAttribute('data-url', url);
    
    elements.noteLink.onclick = () => DomAppService.copyToClipboard(url, elements.copyFeedback);
    
    if (elements.whatsappBtn) {
      elements.whatsappBtn.onclick = () => this.shareViaWhatsApp(url, elements.copyFeedback);
    }
  }

  // static shareViaWhatsApp(url, feedbackElement) {
  //   try {
  //     const message = `Check out this secret note: ${url}`;
  //     const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  //     window.open(whatsappUrl, '_blank');
  //   } catch (err) {
  //     DomAppService.showFeedback(feedbackElement, 'Failed to open WhatsApp', 'error');
  //   }
  // }
}