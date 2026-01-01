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
    }

    static initializeAccordion() {
        const accordionHeaders = document.querySelectorAll('.accordion-header');

        accordionHeaders.forEach(header => {
            header.replaceWith(header.cloneNode(true));
        });

        const newHeaders = document.querySelectorAll('.accordion-header');

        newHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const arrow = header.querySelector('.accordion-arrow');

                content.classList.toggle('active');

                if (arrow) {
                    arrow.className = content.classList.contains('active')
                        ? 'fas fa-chevron-up accordion-arrow'
                        : 'fas fa-chevron-down accordion-arrow';
                }
            });
        });
    }

    static initializeRadioButtons() {
        this.setDefaultSettings();

        document.addEventListener('change', (e) => {
            if (e.target.type === 'radio') {
                const radio = e.target;
                const groupName = radio.name;

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
        const encryptionEnable = document.querySelector('[name="encryption"][value="true"]');
        const expiration24h = document.querySelector('[name="expiration"][value="24h"]');

        if (encryptionEnable && expiration24h) {
            encryptionEnable.checked = true;
            expiration24h.checked = true;

            document.querySelectorAll('input[type="radio"]:checked').forEach(radio => {
                const label = radio.closest('.radio-label');
                if (label) {
                    label.classList.add('selected');
                }
            });
        }
    }


    static getCurrentSettings() {
        const encryptionElement = document.querySelector('[name="encryption"]:checked');
        const expirationElement = document.querySelector('[name="expiration"]:checked');

        const encryption = encryptionElement ? encryptionElement.value === 'true' : true;
        const expiration = expirationElement ? expirationElement.value : '24h';

        return {
            encryption: encryption,
            expiration: expiration
        };
    }

    static resetSettings() {
        this.setDefaultSettings();
    }

    static closeAccordion() {
        const accordionContent = document.querySelector('.accordion-content');
        const accordionArrow = document.querySelector('.accordion-arrow');

        if (accordionContent) {
            accordionContent.classList.remove('active');
        }

        if (accordionArrow) {
            accordionArrow.className = 'fas fa-chevron-down accordion-arrow';
        }
    }
}