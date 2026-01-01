import { config, initializeConfig } from '../conf/config.js';

// Suppress expected Cloudflare/GitHub Pages errors
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
    static #turnstileToken = null;
    
    static getToken() {
        return this.#turnstileToken;
    }
    
    static setToken(token) {
        this.#turnstileToken = token;
    }

    static async init() {
        if (this.isInitialized) return;

        try {
            await initializeConfig();

            const isLocalhost = this.checkIsLocalhost();
            const isGitHubPages = window.location.hostname.includes('github.io');

            if (isLocalhost) {
                this.showTestTurnstile();
            } else {
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
        this.setToken('test-token-localhost');
        this.enableSubmitButton();

        // Test widget displayed
    }

    static async loadRealTurnstile() {
        const sitekey = config.cfTr || '';

        // Loading real Turnstile

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
                // Turnstile script loaded
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

            // Rendering widget

            const turnstileOptions = {
                sitekey: sitekey,
                callback: (token) => {
                    // Token received
                    this.enableSubmitButton();
                    TurnstileService.setToken(token);
                },
                'error-callback': () => {
                    console.error('Turnstile error occurred');
                    this.disableSubmitButton();
                },
                'expired-callback': () => {
                    // Token expired
                    this.disableSubmitButton();
                    TurnstileService.setToken(null);
                },
                'timeout-callback': () => {
                    // Challenge timed out
                    this.disableSubmitButton();
                }
            };

            window.turnstile.render(container, turnstileOptions);
            // Widget rendered

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
            // Submit button enabled
        }
    }

    static disableSubmitButton() {
        const submitBtn = document.getElementById('createNoteBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-lock"></i> Complete CAPTCHA';
            // Submit button disabled
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Initializing Turnstile
        TurnstileService.init();
    });
} else {
    // Initializing Turnstile
    TurnstileService.init();
}