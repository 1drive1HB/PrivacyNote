import { DomService } from './dom.service.js';

export class SignalUI {
    static init() {
        const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const shareBtn = document.getElementById('shareBtn');
        const signalBtn = document.getElementById('signalBtn');
        
        // Show appropriate button based on platform
        if (isMobile) {
            // Mobile: Show universal share button, hide Signal button
            if (shareBtn) shareBtn.style.display = '';
            if (signalBtn) signalBtn.style.display = 'none';
        } else {
            // Desktop: Show Signal button, hide share button
            if (shareBtn) shareBtn.style.display = 'none';
            if (signalBtn) signalBtn.style.display = '';
        }
        
        this.setupHandlers();
    }

    static setupHandlers() {
        document.addEventListener('click', (e) => {
            const shareBtn = e.target.closest('#shareBtn');
            const signalBtn = e.target.closest('#signalBtn');
            
            if (shareBtn) {
                // Get URL from button's data attribute
                const url = shareBtn.getAttribute('data-url');
                this.mobileShare(url);
            } else if (signalBtn) {
                // Get URL from button's data attribute
                const url = signalBtn.getAttribute('data-url');
                this.desktopSignal(url);
            }
        });
    }

    // Mobile: Universal share via native share sheet
    static async mobileShare(url = '') {
        const feedbackElement = document.getElementById('copyFeedback');
        const noteLink = document.getElementById('noteLink');
        
        // PRIORITY: Always use link container as source of truth
        const linkContainerUrl = noteLink?.getAttribute('data-url') || noteLink?.textContent;
        
        // If button URL is empty/missing, fallback to link container
        if (!url) {
            url = linkContainerUrl;
        }
        
        if (!url) {
            DomService.showFeedback(feedbackElement, 'No link available to share', 'error');
            return;
        }

        // VALIDATION: Ensure button URL matches link container URL (Android bug detection)
        if (linkContainerUrl && url !== linkContainerUrl) {
            console.error('URL MISMATCH:', { buttonUrl: url, linkContainerUrl: linkContainerUrl });
            DomService.showFeedback(feedbackElement, '⚠️ URL mismatch detected! Using correct link...', 'error');
            // Force use correct URL from link container
            url = linkContainerUrl;
        }

        const message = `🔒 Check out this secure note: ${url}`;

        // Copy message to clipboard first
        try {
            await navigator.clipboard.writeText(message);
        } catch (err) {
            console.error('Failed to copy:', err);
        }

        // Open native share sheet
        if (navigator.share) {
            try {
                DomService.showFeedback(feedbackElement, 'Opening share options...', 'success');
                await navigator.share({
                    title: 'Secure Note',
                    text: message
                });
                // User completed share
                DomService.showFeedback(feedbackElement, 'Shared successfully!', 'success');
            } catch (err) {
                // User cancelled share dialog
                if (err.name === 'AbortError') {
                    DomService.showFeedback(feedbackElement, 'Share cancelled', 'error');
                } else {
                    console.error('Share failed:', err);
                    DomService.showFeedback(feedbackElement, 'Share failed. Link copied to clipboard!', 'info');
                }
            }
        } else {
            // No Web Share API, fallback to clipboard copy
            DomService.showFeedback(feedbackElement, 'Link copied to clipboard!', 'success');
        }
    }

    // Desktop: Signal-specific deep link
    static async desktopSignal(url = '') {
        const feedbackElement = document.getElementById('copyFeedback');
        const noteLink = document.getElementById('noteLink');
        
        // PRIORITY: Always use link container as source of truth
        const linkContainerUrl = noteLink?.getAttribute('data-url') || noteLink?.textContent;
        
        // If button URL is empty/missing, fallback to link container
        if (!url) {
            url = linkContainerUrl;
        }
        
        if (!url) {
            DomService.showFeedback(feedbackElement, 'No link available to share', 'error');
            return;
        }

        // VALIDATION: Ensure button URL matches link container URL
        if (linkContainerUrl && url !== linkContainerUrl) {
            console.error('URL MISMATCH:', { buttonUrl: url, linkContainerUrl: linkContainerUrl });
            DomService.showFeedback(feedbackElement, '⚠️ URL mismatch detected! Using correct link...', 'error');
            // Force use correct URL from link container
            url = linkContainerUrl;
        }

        const message = `🔒 Check out this secure note: ${url}`;
        const encodedMessage = encodeURIComponent(message);

        // Copy message to clipboard first
        try {
            await navigator.clipboard.writeText(message);
        } catch (err) {
            console.error('Failed to copy:', err);
        }

        // Try to open Signal desktop app
        const desktopUrl = `sgnl://send?text=${encodedMessage}`;
        const newWindow = window.open(desktopUrl, '_blank');
        
        // Set timeout to check if app opened, fallback to web
        setTimeout(() => {
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
                // Desktop app not available, open Signal download page
                window.open('https://signal.org/download/', '_blank');
            }
        }, 1000);

        DomService.showFeedback(feedbackElement, 'Message copied! Opening Signal...', 'success');
    }
}
