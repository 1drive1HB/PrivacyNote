// src/js/services/whatsappUI.js
import { DomService } from './dom.service.js';

export class WhatsAppUI {
    static init() {
        this.setupWhatsAppHandler();
    }

    static setupWhatsAppHandler() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#whatsappBtn')) {
                this.shareViaWhatsApp();
            }
        });
    }

    static shareViaWhatsApp(url = '') {
        if (!url) {
            const noteLink = document.getElementById('noteLink');
            url = noteLink?.getAttribute('data-url') || noteLink?.textContent;
        }

        if (!url) {
            const feedbackElement = document.getElementById('copyFeedback');
            DomService.showFeedback(feedbackElement, 'No link available to share', 'error');
            return;
        }

        const message = `🔒 Check out this secure note: ${url}`;
        const encodedMessage = encodeURIComponent(message);
        
        // Detect device type for proper WhatsApp URL
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const whatsappUrl = isMobile 
            ? `whatsapp://send?text=${encodedMessage}`
            : `https://web.whatsapp.com/send?text=${encodedMessage}`;

        // Open WhatsApp
        const newWindow = window.open(whatsappUrl, '_blank');
        
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            // Fallback for desktop if popup blocked
            window.location.href = `https://api.whatsapp.com/send?text=${encodedMessage}`;
        }

        const feedbackElement = document.getElementById('copyFeedback');
        DomService.showFeedback(feedbackElement, 'Opening WhatsApp...', 'success');
    }
}