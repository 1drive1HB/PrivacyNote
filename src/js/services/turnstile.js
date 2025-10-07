// src/js/services/turnstile.js
import { config, initializeConfig } from '../config.js';

// Cloudflare error suppression - add this at the top
const originalError = console.error;
console.error = function (...args) {
    const message = args[0]?.toString() || '';
    if (message.includes('Turnstile') ||
        message.includes('Cloudflare') ||
        message.includes('cdn-cgi') ||
        message.includes('405') && message.includes('Method Not Allowed')) {
        return;
    }
    originalError.apply(console, args);
};

const originalWarn = console.warn;
console.warn = function (...args) {
    const message = args[0]?.toString() || '';
    if (message.includes('preload') ||
        message.includes('script-src') ||
        message.includes('default-src')) {
        return;
    }
    originalWarn.apply(console, args);
};

export class TurnstileService {
    static isInitialized = false;

    static async init() {
        if (this.isInitialized) return;

        try {
            await initializeConfig();

            // Auto-detect GitHub Pages and use test mode
            const isGitHubPages = window.location.hostname.includes('github.io');
            const isLocalhost = this.checkIsLocalhost();

            if (isLocalhost || isGitHubPages) {
                this.showTestTurnstile();
            } else {
                await this.loadRealTurnstile();
            }

            this.isInitialized = true;

        } catch (error) {
            this.enableSubmitButton();
            this.isInitialized = true;
        }
    }

    static checkIsLocalhost() {
        const hostname = window.location.hostname;
        return hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '[::]' ||
            window.location.href.includes('http://localhost:8080') ||
            window.location.href.includes('http://[::]:8080') ||
            window.location.href.includes('http://localhost:8080/note.html') ||
            window.location.href.includes('http://localhost:8080/index.html');
    }

    static showTestTurnstile() {
        const container = document.getElementById('turnstileContainer');
        if (!container) return;

        container.innerHTML = `
            <div class="test-cf-widget">
                <div class="test-cf-checkbox">
                    <input type="checkbox" id="testCfCheckbox" checked>
                    <label for="testCfCheckbox">
                        <span class="test-cf-icon">✓</span>
                        I'm not a robot
                    </label>
                </div>
                <div class="test-cf-footer">
                    <span class="test-cf-badge">Test Mode</span>
                    <span class="test-cf-text">GitHub Pages Domain</span>
                </div>
            </div>
        `;

        // Auto-enable since it's test mode
        window.lastTurnstileToken = 'test-token-github-pages';
        this.enableSubmitButton();
    }

    static async loadRealTurnstile() {
        const sitekey = config.cfTr || '';

        if (!sitekey || sitekey === 'undefined' || sitekey === 'null' || !sitekey.startsWith('0x')) {
            this.showTestTurnstile();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
        script.async = true;
        script.defer = true;

        script.onload = () => {
            this.renderRealTurnstile(sitekey);
        };

        script.onerror = () => {
            this.showTestTurnstile();
        };

        document.head.appendChild(script);
    }

    static renderRealTurnstile(sitekey) {
        try {
            const container = document.getElementById('turnstileContainer');
            if (!container || !window.turnstile) {
                this.showTestTurnstile();
                return;
            }

            container.innerHTML = '';

            const turnstileOptions = {
                sitekey: sitekey,
                callback: (token) => {
                    this.enableSubmitButton();
                    window.lastTurnstileToken = token;
                },
                'error-callback': () => {
                    this.showTestTurnstile();
                },
                'expired-callback': () => {
                    this.disableSubmitButton();
                    window.lastTurnstileToken = null;
                },
                'timeout-callback': () => {
                    this.showTestTurnstile();
                }
            };

            window.turnstile.render(container, turnstileOptions);

        } catch (error) {
            this.showTestTurnstile();
        }
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
            submitBtn.innerHTML = '<i class="fas fa-lock"></i> Complete CAPTCHA';
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        TurnstileService.init();
    });
} else {
    TurnstileService.init();
}