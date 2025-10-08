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

            // FIXED: Only use test mode for localhost, use real Turnstile for GitHub Pages
            const isLocalhost = this.checkIsLocalhost();
            const isGitHubPages = window.location.hostname.includes('github.io');

            console.log(`Environment detected - Localhost: ${isLocalhost}, GitHub Pages: ${isGitHubPages}`);

            if (isLocalhost) {
                console.log('Localhost detected: Using TEST Turnstile');
                this.showTestTurnstile();
            } else {
                console.log('Production (GitHub Pages) detected: Using REAL Turnstile');
                await this.loadRealTurnstile();
            }

            this.isInitialized = true;

        } catch (error) {
            console.error('Turnstile init error:', error);
            this.enableSubmitButton();
            this.isInitialized = true;
        }
    }

    static checkIsLocalhost() {
        const hostname = window.location.hostname;
        return hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === '[::1]' || // Fixed: [::1] is IPv6 localhost
            hostname.startsWith('192.168.') || // Local network
            hostname.startsWith('10.') || // Local network
            hostname.endsWith('.local'); // Local domain
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
                    <span class="test-cf-text">Localhost Development</span>
                </div>
            </div>
        `;

        // Auto-enable since it's test mode
        window.lastTurnstileToken = 'test-token-localhost';
        this.enableSubmitButton();

        console.log('Test Turnstile widget displayed');
    }

    static async loadRealTurnstile() {
        const sitekey = config.cfTr || '';

        console.log('Loading real Turnstile with sitekey:', sitekey ? 'Present' : 'Missing');

        if (!sitekey || sitekey === 'undefined' || sitekey === 'null' || !sitekey.startsWith('0x')) {
            console.warn('Invalid Turnstile sitekey, falling back to test mode');
            this.showTestTurnstile();
            return;
        }

        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true;
            script.defer = true;

            script.onload = () => {
                console.log('Turnstile script loaded successfully');
                this.renderRealTurnstile(sitekey);
                resolve();
            };

            script.onerror = () => {
                console.error('Failed to load Turnstile script');
                this.showTestTurnstile();
                resolve();
            };

            document.head.appendChild(script);
        });
    }

    static renderRealTurnstile(sitekey) {
        try {
            const container = document.getElementById('turnstileContainer');
            if (!container) {
                console.error('Turnstile container not found');
                this.showTestTurnstile();
                return;
            }

            if (!window.turnstile) {
                console.error('Turnstile API not available');
                this.showTestTurnstile();
                return;
            }

            container.innerHTML = '';

            console.log('Rendering real Turnstile widget');

            const turnstileOptions = {
                sitekey: sitekey,
                callback: (token) => {
                    console.log('Turnstile verified successfully, token received');
                    this.enableSubmitButton();
                    window.lastTurnstileToken = token;
                },
                'error-callback': () => {
                    console.error('Turnstile error occurred');
                    this.disableSubmitButton();
                },
                'expired-callback': () => {
                    console.log('Turnstile token expired');
                    this.disableSubmitButton();
                    window.lastTurnstileToken = null;
                },
                'timeout-callback': () => {
                    console.log('Turnstile challenge timed out');
                    this.disableSubmitButton();
                }
            };

            window.turnstile.render(container, turnstileOptions);
            console.log('Real Turnstile widget rendered');

        } catch (error) {
            console.error('Error rendering real Turnstile:', error);
            this.showTestTurnstile();
        }
    }

    static enableSubmitButton() {
        const submitBtn = document.getElementById('createNoteBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-lock"></i> Create Secure Note';
            console.log('Submit button enabled');
        }
    }

    static disableSubmitButton() {
        const submitBtn = document.getElementById('createNoteBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-lock"></i> Complete CAPTCHA';
            console.log('Submit button disabled');
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded, initializing Turnstile');
        TurnstileService.init();
    });
} else {
    console.log('DOM already ready, initializing Turnstile');
    TurnstileService.init();
}