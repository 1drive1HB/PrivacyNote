// src/js/services/turnstile.js
import { config, initializeConfig } from '../config.js';

export class TurnstileService {
    static isInitialized = false;

    static async init() {
        if (this.isInitialized) return;
        
        console.log('🛡️ Initializing Turnstile service...');
        
        try {
            await initializeConfig();
            const isLocalhost = this.checkIsLocalhost();
            
            if (isLocalhost) {
                console.log('🔓 Localhost - showing test widget');
                this.showTestTurnstile();
            } else {
                console.log('🌐 Production - loading real Turnstile');
                await this.loadRealTurnstile();
            }
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('❌ Turnstile init error:', error);
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
                    <input type="checkbox" id="testCfCheckbox">
                    <label for="testCfCheckbox">
                        <span class="test-cf-icon">✓</span>
                        I'm not a robot
                    </label>
                </div>
                <div class="test-cf-footer">
                    <span class="test-cf-badge">Test</span>
                    <span class="test-cf-text">Protected by Cloudflare</span>
                </div>
            </div>
        `;
        
        // Set up checkbox behavior
        const checkbox = document.getElementById('testCfCheckbox');
        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    console.log('✅ Test Turnstile completed');
                    window.lastTurnstileToken = 'test-token-' + Date.now();
                } else {
                    window.lastTurnstileToken = null;
                }
            });
        }
        
        this.enableSubmitButton();
    }

    static async loadRealTurnstile() {
        const sitekey = config.cfTr || '';
        
        if (!sitekey || sitekey === 'undefined' || sitekey === 'null') {
            console.log('🚫 No Turnstile sitekey - using fallback');
            this.enableSubmitButton();
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
            this.enableSubmitButton();
        };
        
        document.head.appendChild(script);
    }

    static renderRealTurnstile(sitekey) {
        try {
            const container = document.getElementById('turnstileContainer');
            if (!container || !window.turnstile) return;
            
            window.turnstile.render(container, {
                sitekey: sitekey,
                callback: (token) => {
                    this.enableSubmitButton();
                    window.lastTurnstileToken = token;
                },
                'error-callback': () => {
                    this.enableSubmitButton();
                },
                'expired-callback': () => {
                    this.disableSubmitButton();
                }
            });
            
        } catch (error) {
            this.enableSubmitButton();
        }
    }

    static enableSubmitButton() {
        const submitBtn = document.getElementById('createNoteBtn');
        if (submitBtn) {
            submitBtn.disabled = false;
        }
    }

    static disableSubmitButton() {
        const submitBtn = document.getElementById('createNoteBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
        }
    }

    static async validateToken(clientToken) {
        const isLocalhost = this.checkIsLocalhost();
        if (isLocalhost) return true;
        
        // Production validation logic here
        return true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    TurnstileService.init();
});