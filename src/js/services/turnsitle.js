// src/js/services/turnstile.js
export class TurnstileService {
    static SITE_KEY = '1x00000000000000000000AA'; // Replace with your actual site key

    static init() {
        this.setupTurnstileCallbacks();
    }

    static setupTurnstileCallbacks() {
        window.onSuccess = (token) => {
            console.log('Turnstile verification successful:', token);
            this.enableSubmitButton();
        };

        window.onError = () => {
            console.log('Turnstile verification failed');
            this.disableSubmitButton();
        };
    }

    static enableSubmitButton() {
        const submitBtn = document.getElementById('createNoteBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-lock"></i> Create Secure Note';
        }
    }

    static disableSubmitButton() {
        const submitBtn = document.getElementById('createNoteBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-ban"></i> Complete Verification';
        }
    }

    static verifyToken(token) {
        // Implement server-side token verification
        return fetch('/verify-turnstile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
        })
        .then(response => response.json())
        .then(data => data.success);
    }

    static renderExplicit(containerId, options = {}) {
        if (window.turnstile) {
            return window.turnstile.render(`#${containerId}`, {
                sitekey: this.SITE_KEY,
                theme: 'auto',
                size: 'normal',
                callback: window.onSuccess,
                'error-callback': window.onError,
                ...options
            });
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    TurnstileService.init();
});