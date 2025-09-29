// src/js/actions/settingsUI.js
export class SettingsUI {
    static async loadSettings() {
        try {
            const response = await fetch('./src/html/settings.html');
            if (!response.ok) throw new Error('Failed to load settings');
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading settings:', error);
            // return this.getFallbackSettings();
        }
    }

    // static getFallbackSettings() {
    //     return `
    //         <div class="settings-accordion">
    //             <div class="accordion-header">
    //                 <i class="fas fa-cog"></i>
    //                 <h3>Security Settings</h3>
    //                 <i class="fas fa-chevron-down accordion-arrow"></i>
    //             </div>
    //             <div class="accordion-content">
    //                 <div class="settings-grid">
    //                     <div class="setting-group">
    //                         <label class="setting-label">Encryption</label>
    //                         <div class="radio-group">
    //                             <label class="radio-label">
    //                                 <input type="radio" name="encryption" value="true" checked>
    //                                 <span class="radio-custom"></span>
    //                                 <span class="radio-text">Encryption</span>
    //                             </label>
    //                             <label class="radio-label">
    //                                 <input type="radio" name="encryption" value="false">
    //                                 <span class="radio-custom"></span>
    //                                 <span class="radio-text">No Encryption</span>
    //                             </label>
    //                         </div>
    //                     </div>
    //                     <div class="setting-group">
    //                         <label class="setting-label">Expiration Time</label>
    //                         <div class="radio-group">
    //                             <label class="radio-label">
    //                                 <input type="radio" name="expiration" value="24h" checked>
    //                                 <span class="radio-custom"></span>
    //                                 <span class="radio-text">24 Hours</span>
    //                             </label>
    //                             <label class="radio-label">
    //                                 <input type="radio" name="expiration" value="48h">
    //                                 <span class="radio-custom"></span>
    //                                 <span class="radio-text">48 Hours</span>
    //                             </label>
    //                         </div>
    //                     </div>
    //                 </div>
    //             </div>
    //         </div>
    //     `;
    // }

    static initializeAccordion() {
        const accordionHeader = document.querySelector('.accordion-header');
        const accordionContent = document.querySelector('.accordion-content');
        const accordionArrow = document.querySelector('.accordion-arrow');
        
        if (accordionHeader && accordionContent) {
            accordionHeader.addEventListener('click', function() {
                const isActive = accordionContent.classList.toggle('active');
                
                if (accordionArrow) {
                    accordionArrow.className = isActive 
                        ? 'fas fa-chevron-up accordion-arrow'
                        : 'fas fa-chevron-down accordion-arrow';
                }
            });
        }
    }

    static getCurrentSettings() {
        const encryptionValue = document.querySelector('input[name="encryption"]:checked')?.value;
        const expirationValue = document.querySelector('input[name="expiration"]:checked')?.value;
        
        return {
            encryption: encryptionValue === 'true',
            expiration: expirationValue || '24h'
        };
    }

    static resetSettings() {
        const encryptionRadio = document.querySelector('input[name="encryption"][value="true"]');
        const expirationRadio = document.querySelector('input[name="expiration"][value="24h"]');
        
        if (encryptionRadio) encryptionRadio.checked = true;
        if (expirationRadio) expirationRadio.checked = true;
        
        console.log('Settings reset to defaults');
    }
}