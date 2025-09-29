// src/js/services/whatsappUI.js
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
            this.showFeedback('No link available to share', 'error');
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

        this.showFeedback('Opening WhatsApp...', 'success');
    }

    static showFeedback(message, type) {
        const existingFeedback = document.querySelector('.whatsapp-feedback');
        if (existingFeedback) {
            existingFeedback.remove();
        }

        const feedback = document.createElement('div');
        feedback.className = `whatsapp-feedback ${type}`;
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 1rem 2rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            background: ${type === 'success' ? '#25D366' : '#f56565'};
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.remove();
        }, 2000);
    }
}