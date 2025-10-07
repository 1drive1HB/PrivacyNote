// src/js/services/dom.service.js
export class DomService {
  // Element management
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

  // Button states
  static toggleButtonState(button, disabled, text) {
    if (!button) return;
    button.disabled = disabled;
    button.innerHTML = disabled
      ? `<i class="fas fa-spinner fa-spin"></i> ${text}`
      : `<i class="fas fa-lock"></i> ${text}`;
  }

  // Feedback messages
  static showFeedback(element, message, type = 'info') {
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

  // Clipboard
  static async copyToClipboard(text, feedbackElement = null) {
    try {
      await navigator.clipboard.writeText(text);
      if (feedbackElement) {
        this.showFeedback(feedbackElement, '✅ Copied to clipboard!', 'success');
      }
      return true;
    } catch (err) {
      if (feedbackElement) {
        this.showFeedback(feedbackElement, '❌ Failed to copy', 'error');
      }
      return false;
    }
  }

  // Settings management
  static getSettingValue(name) {
    const radio = document.querySelector(`input[name="${name}"]:checked`);
    return radio ? radio.value : null;
  }

  static setSettingValue(name, value) {
    const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // UI clearing
  static clearUI(elements) {
    if (elements.noteText) elements.noteText.value = '';
    if (elements.linkContainer) elements.linkContainer.classList.add('hidden');
    if (elements.copyFeedback) this.hideFeedback(elements.copyFeedback);

    // Clear localStorage draft
    localStorage.removeItem('privacyNote_draft');

    // Reset character counter
    this.updateCharacterCounter(0);
  }

  static updateCharacterCounter(count) {
    const charCount = document.getElementById('charCount');
    if (charCount) {
      charCount.textContent = count.toLocaleString();

      if (count > 2250) {
        charCount.style.color = '#dc2626';
      } else if (count > 1125) {
        charCount.style.color = '#ea580c';
      } else {
        charCount.style.color = '';
      }
    }
  }
}