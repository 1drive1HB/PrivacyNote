// settingsUI.js
export class SettingsUI {
    static async loadSettings() {
        try {
            const response = await fetch('./src/html/settings.html');
            return await response.text();
        } catch (error) {
            console.error('Failed to load settings:', error);
            return '';
        }
    }

    static initialize() {
        this.initializeAccordion();
        this.initializeRadioButtons();
        this.initializeCharacterCounter();
    }

    static initializeAccordion() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.accordion-header')) {
                const header = e.target.closest('.accordion-header');
                const content = header.nextElementSibling;
                const arrow = header.querySelector('.accordion-arrow');
                
                content.classList.toggle('active');
                arrow.className = content.classList.contains('active') 
                    ? 'fas fa-chevron-up accordion-arrow'
                    : 'fas fa-chevron-down accordion-arrow';
            }
        });
    }

    static initializeRadioButtons() {
        document.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                const radio = e.target;
                const groupName = radio.name;
                
                // Update visual state for all radios in group
                document.querySelectorAll(`[name="${groupName}"]`).forEach(r => {
                    const label = r.closest('.radio-label');
                    label.classList.toggle('selected', r.checked);
                });
            }
        });

        // Initialize current state with default values
        this.setDefaultSettings();
    }

    static setDefaultSettings() {
        // Set encryption to Enable and expiration to 24h by default
        const encryptionEnable = document.querySelector('[name="encryption"][value="true"]');
        const expiration24h = document.querySelector('[name="expiration"][value="24h"]');
        
        if (encryptionEnable && expiration24h) {
            encryptionEnable.checked = true;
            expiration24h.checked = true;
            
            // Update visual state
            document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
                radio.closest('.radio-label').classList.add('selected');
            });
        }
    }

    static initializeCharacterCounter() {
        const noteText = document.getElementById('noteText');
        const charCount = document.getElementById('charCount');
        
        if (noteText && charCount) {
            // Initialize counter
            charCount.textContent = noteText.value.length.toLocaleString();
            
            noteText.addEventListener('input', function() {
                const length = this.value.length;
                charCount.textContent = length.toLocaleString();
                
                // Change color when approaching limit
                if (length > 8000) {
                    charCount.style.color = '#dc2626';
                } else if (length > 3500) {
                    charCount.style.color = '#ea580c';
                } else {
                    charCount.style.color = '';
                }
            });
        }
    }

    static getCurrentSettings() {
        return {
            encryption: document.querySelector('[name="encryption"]:checked')?.value === 'true',
            expiration: document.querySelector('[name="expiration"]:checked')?.value || '24h'
        };
    }

    static resetSettings() {
        this.setDefaultSettings();
        console.log('Settings reset to defaults');
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    SettingsUI.initialize();
});