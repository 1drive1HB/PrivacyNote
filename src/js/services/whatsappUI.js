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

    static async shareViaWhatsApp(url = '') {
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

        // Copy message to clipboard first
        try {
            await navigator.clipboard.writeText(message);
        } catch (err) {
            console.error('Failed to copy:', err);
        }

        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const feedbackElement = document.getElementById('copyFeedback');

        if (isMobile) {
            // Mobile: Try to open WhatsApp app directly
            const whatsappUrl = `whatsapp://send?text=${encodedMessage}`;
            window.location.href = whatsappUrl;
            DomService.showFeedback(feedbackElement, 'Message copied! Opening WhatsApp...', 'success');
        } else {
            // Desktop: Try desktop app first, fallback to web
            const desktopUrl = `whatsapp://send?text=${encodedMessage}`;
            
            // Try to open desktop app
            const newWindow = window.open(desktopUrl, '_blank');
            
            // Set timeout to check if app opened, fallback to web
            setTimeout(() => {
                if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                    // Desktop app not available, open WhatsApp Web with QR code
                    window.open(`https://web.whatsapp.com/send?text=${encodedMessage}`, '_blank');
                }
            }, 1000);

            DomService.showFeedback(feedbackElement, 'Message copied! Opening WhatsApp...', 'success');
        }
    }
}
