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
        const encodedMessage = encodeURIComponent(message);
        const feedbackElement = document.getElementById('copyFeedback');

        // Copy message to clipboard first
        try {
            await navigator.clipboard.writeText(message);
        } catch (err) {
            console.error('Failed to copy:', err);
        }

        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isMobile) {
            // Mobile: Use Signal deep link (works on Android & iOS)
            const signalUrl = `sgnl://send?text=${encodedMessage}`;
            
            // Try to open Signal app
            window.location.href = signalUrl;
            
            // Fallback after 2 seconds if app doesn't open
            setTimeout(() => {
                // If user is still on page, show web fallback option
                if (!document.hidden) {
                    const openWeb = confirm('Signal app not found. Open Signal Web to scan QR code?');
                    if (openWeb) {
                        window.open('https://signal.org/download/', '_blank');
                    }
                }
            }, 2000);

            DomService.showFeedback(feedbackElement, 'Message copied! Opening Signal...', 'success');
        } else {
            // Desktop: Try desktop app first, fallback to web
            const desktopUrl = `sgnl://send?text=${encodedMessage}`;
            
            // Try to open desktop app
            const newWindow = window.open(desktopUrl, '_blank');
            
            // Set timeout to check if app opened, fallback to web
            setTimeout(() => {
                if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                    // Desktop app not available, open Signal Web for QR code login
                    window.open('https://signal.org/download/', '_blank');
                }
            }, 1000);

            DomService.showFeedback(feedbackElement, 'Message copied! Opening Signal...', 'success');
        }
    }
}
