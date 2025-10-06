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
        console.log('Setting up accordion...');

        const accordionHeaders = document.querySelectorAll('.accordion-header');

        accordionHeaders.forEach(header => {
            // Remove any existing click listeners
            header.replaceWith(header.cloneNode(true));
        });

        // Re-select after cloning
        const newHeaders = document.querySelectorAll('.accordion-header');

        newHeaders.forEach(header => {
            header.addEventListener('click', () => {
                console.log('Accordion clicked!');
                const content = header.nextElementSibling;
                const arrow = header.querySelector('.accordion-arrow');

                // Toggle active class
                content.classList.toggle('active');

                // Update arrow
                if (arrow) {
                    arrow.className = content.classList.contains('active')
                        ? 'fas fa-chevron-up accordion-arrow'
                        : 'fas fa-chevron-down accordion-arrow';
                }

                console.log('Accordion state:', content.classList.contains('active'));
            });
        });
    }

    static initializeRadioButtons() {
        //console.log('Setting up radio buttons...');

        // Set default settings first
        this.setDefaultSettings();

        // Then add change listeners
        document.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                const radio = e.target;
                const groupName = radio.name;

                console.log('Radio changed:', groupName, radio.value);

                // Update visual state for all radios in group
                document.querySelectorAll(`[name="${groupName}"]`).forEach(r => {
                    const label = r.closest('.radio-label');
                    if (label) {
                        label.classList.toggle('selected', r.checked);
                    }
                });
            }
        });
    }

    static setDefaultSettings() {
        console.log('Setting default settings...');

        // Set encryption to Enable and expiration to 24h by default
        const encryptionEnable = document.querySelector('[name="encryption"][value="true"]');
        const expiration24h = document.querySelector('[name="expiration"][value="24h"]');

        if (encryptionEnable && expiration24h) {
            encryptionEnable.checked = true;
            expiration24h.checked = true;

            // Update visual state
            document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
                const label = radio.closest('.radio-label');
                if (label) {
                    label.classList.add('selected');
                }
            });

            console.log('Default settings applied: encryption=true, expiration=24h');
        } else {
            console.warn('Could not find radio buttons for default settings');
        }
    }

    static initializeCharacterCounter() {
        const noteText = document.getElementById('noteText');
        const charCount = document.getElementById('charCount');

        if (noteText && charCount) {
            console.log('Setting up character counter...');

            // Initialize counter
            charCount.textContent = noteText.value.length.toLocaleString();

            noteText.addEventListener('input', function () {
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
        } else {
            console.warn('Character counter elements not found');
        }
    }

    static getCurrentSettings() {
        // Debug: Check all radio elements
        const allEncryptionRadios = document.querySelectorAll('[name="encryption"]');
        console.log('🔍 All encryption radios:');
        allEncryptionRadios.forEach(radio => {
            console.log(`- ${radio.value}: checked=${radio.checked}, type=${typeof radio.value}`);
        });

        const encryptionElement = document.querySelector('[name="encryption"]:checked');
        const expirationElement = document.querySelector('[name="expiration"]:checked');

        // FIX: Proper boolean conversion
        const encryption = encryptionElement ? encryptionElement.value === 'true' : true;
        const expiration = expirationElement ? expirationElement.value : '24h';

        console.log('🎯 Final settings:', {
            encryption,
            expiration,
            encryptionType: typeof encryption
        });

        return {
            encryption: encryption, // This is boolean true/false
            expiration: expiration
        };
    }

    static resetSettings() {
        console.log('Resetting settings to defaults...');
        this.setDefaultSettings();
    }

    // NEW: Method to close accordion
    static closeAccordion() {
        const accordionContent = document.querySelector('.accordion-content');
        const accordionArrow = document.querySelector('.accordion-arrow');

        if (accordionContent) {
            accordionContent.classList.remove('active');
        }

        if (accordionArrow) {
            accordionArrow.className = 'fas fa-chevron-down accordion-arrow';
        }

        console.log('Accordion closed');
    }
}