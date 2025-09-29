// src/js/services/turnstile.js
import { config } from '../config.js';

export class TurnstileService {
    static SITE_KEY = config.cfTr || '1x00000000000000000000AA'; // Fallback key

    static init() {
        // Wait for config to be initialized before setting up
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
            const siteKey = config.cfTr || this.SITE_KEY;
            console.log('Rendering Turnstile with site key:', siteKey ? '***MASKED***' : 'MISSING');
            
            return window.turnstile.render(`#${containerId}`, {
                sitekey: siteKey,
                theme: 'auto',
                size: 'normal',
                callback: window.onSuccess,
                'error-callback': window.onError,
                ...options
            });
        } else {
            console.error('Turnstile not loaded');
        }
    }
}

// Initialize when DOM is ready and config is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Wait a bit for config to initialize
    setTimeout(() => {
        TurnstileService.init();
    }, 100);
});