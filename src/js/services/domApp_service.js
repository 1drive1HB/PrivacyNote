//src\js\services\domApp_service.js
export class DomAppService {
  static getElement(id, required = false) {
    try {
      const el = document.getElementById(id);
      if (!el && required) {
        throw new Error(`Element ${id} not found`);
      }
      return el;
    } catch (error) {
      console.error(error.message);
      return null;
    }
  }

  static toggleButtonState(button, disabled, text) {
    if (!button) return;
    button.disabled = disabled;
    button.innerHTML = disabled
      ? `<i class="fas fa-spinner fa-spin"></i> ${text}`
      : `<i class="fas fa-lock"></i> ${text}`;
  }

  static showFeedback(element, message, type) {
    if (!element) return;
    element.textContent = message;
    element.className = `copy-feedback ${type} show`;
    setTimeout(() => this.hideFeedback(element), 3000);
  }

  static hideFeedback(element) {
    if (element) {
      element.classList.remove('show');
    }
  }

  static clearUI(elements) {
    if (elements.noteText) elements.noteText.value = '';
    if (elements.linkContainer) elements.linkContainer.classList.add('hidden');
    if (elements.copyFeedback) this.hideFeedback(elements.copyFeedback);
    
    this.resetSettings();
  }

  static resetSettings() {
    const encryptionRadio = document.querySelector('input[name="encryption"][value="true"]');
    const expirationRadio = document.querySelector('input[name="expiration"][value="24h"]');
    
    if (encryptionRadio) encryptionRadio.checked = true;
    if (expirationRadio) expirationRadio.checked = true;
    
    console.log('Settings reset to defaults: encryption=true, expiration=24h');
  }

  static getSettingValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : null;
  }

  static async copyToClipboard(text, feedbackElement) {
    try {
      await navigator.clipboard.writeText(text);
      this.showFeedback(feedbackElement, '✅ Copied to clipboard!', 'success');
      return true;
    } catch (err) {
      this.showFeedback(feedbackElement, '❌ Failed to copy', 'error');
      return false;
    }
  }
}