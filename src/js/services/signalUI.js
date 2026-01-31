import { DomService } from './dom.service.js';

export class SignalUI {
    static init() {
        this.setupSignalHandler();
    }

    static setupSignalHandler() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#signalBtn')) {
                this.shareViaSignal();
            }
        });
    }

    static async shareViaSignal(url = '') {
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
        const feedbackElement = document.getElementById('copyFeedback');

        // Copy message to clipboard first
        try {
            await navigator.clipboard.writeText(message);
        } catch (err) {
            console.error('Failed to copy:', err);
        }

        // Signal deep link (opens Signal app)
        const signalUrl = 'sgnl://';
        const newWindow = window.open(signalUrl, '_blank');
        
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
            // Fallback: try location redirect
            window.location.href = signalUrl;
        }

        DomService.showFeedback(feedbackElement, 'Message copied! Opening Signal...', 'success');
    }
}
