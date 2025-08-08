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
    if (elements.whatsappShare) elements.whatsappShare.classList.add('hidden');
    if (elements.copyFeedback) this.hideFeedback(elements.copyFeedback);
  }
}