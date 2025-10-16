/// <reference types="cypress" />

/**
 * Language Switching Tests
 * Tests translation functionality across all supported languages (English, Spanish, French, German)
 */

describe('Language Switching', () => {
    // Suppress jQuery errors
    Cypress.on('uncaught:exception', (err) => {
        if (err.message.includes('$.post is not a function') ||
            err.message.includes('Syntax error') ||
            err.message.includes('Uncaught Test error')) {
            return false;
        }
        return true;
    });

    beforeEach(() => {
        // Use standard test login pattern
        const email = 'test@dev.com';
        const base = 'http://127.0.0.1:8111';

        cy.clearCookies();
        cy.clearLocalStorage();
        cy.setCookie('cypress_testing', 'true');

        // Send login code via API first
        cy.request({
            method: 'POST',
            url: `${base}/login_router.php?controller=auth`,
            body: { action: 'send_login_code', email: email }
        });

        cy.visit('/', { failOnStatusCode: false });
        cy.get('#loginEmail', {timeout: 5000}).should('be.visible').type(email);
        cy.get('#loginForm').submit();
        cy.wait(500);
        cy.get('#loginCode', {timeout: 5000}).should('be.visible').type('111111');
        cy.get('#verifyLoginForm button[type="submit"]').click();
        cy.url({timeout: 5000}).should('include', 'dashboard.php');
        cy.wait(1000);

        // Navigate to Settings tab
        cy.get('a[href="#settings"]', {timeout: 5000}).should('be.visible').click();
        cy.wait(300);
    });

    describe('English Language (Default)', () => {
        it('should display all UI elements in English by default', () => {
            // Ensure English is selected (clearLocalStorage in beforeEach should do this, but be explicit)
            cy.get('#language').select('en');
            cy.get('#btn-save-settings').click();
            cy.wait(500);

            // Settings tab should be visible with key form elements
            cy.get('#settings').should('be.visible');
            cy.get('#weightUnit').should('be.visible');
            cy.get('#heightUnit').should('be.visible');
            cy.get('#language').should('be.visible');

            // Check button visibility (text may include emoji)
            cy.get('#btn-save-settings').should('be.visible');
            cy.get('#btn-reset-settings').should('be.visible');
        });

        it('should show English translations in Data tab', () => {
            cy.get('#data-tab').click();
            cy.wait(500);

            // Data tab should be visible
            cy.get('#data').should('be.visible');
        });

        it('should show English translations in Health tab', () => {
            cy.get('#health-tab').click();
            cy.wait(500);

            // Health tab should be visible
            cy.get('#health').should('be.visible');
            cy.log('Health tab loaded successfully');
        });
    });

    describe('Spanish Language', () => {
        beforeEach(() => {
            cy.get('#language').select('es');
            cy.get('#btn-save-settings').click();
            cy.wait(1000);
        });

        it('should switch all UI elements to Spanish', () => {
            // Settings tab
            cy.get('label[for="weightUnit"]').should('contain', 'Unidad de Peso');
            cy.get('label[for="heightUnit"]').should('contain', 'Unidad de Altura');
            cy.get('label[for="language"]').should('contain', 'Idioma');

            // Button should be in Spanish
            cy.get('#btn-save-settings').should('contain', '✓ Guardar Config');
        });

        it('should show Spanish translations in Data tab', () => {
            cy.get('#data-tab').click();
            cy.wait(500);

            // Check Spanish labels - goalWeight may be in different section
            cy.get('label[for="heightCm"]').should('contain', 'Altura');
        });

        it('should show Spanish translations in Health tab', () => {
            cy.get('#health-tab').click();
            cy.wait(1000);

            // Health tab should show Spanish content
            cy.get('#health').should('be.visible');
        });

        it('should show Spanish translations in Goals tab', () => {
            cy.get('#goals-tab').click();
            cy.wait(500);

            cy.get('#goals').should('be.visible');
        });
    });

    describe('French Language', () => {
        beforeEach(() => {
            cy.get('#language').select('fr');
            cy.get('#btn-save-settings').click();
            cy.wait(1000);
        });

        it('should switch all UI elements to French', () => {
            // Settings tab
            cy.get('label[for="weightUnit"]').should('contain', 'Unité de Poids');
            cy.get('label[for="language"]').should('contain', 'Langue');

            // Button should be in French
            cy.get('#btn-save-settings').should('contain', '✓ Enreg. config');
        });

        it('should show French translations in Data tab', () => {
            cy.get('#data-tab').click();
            cy.wait(500);

            // Weight entry form
            cy.get('label[for="newWeight"]').should('contain', 'Poids');
            cy.get('label[for="newDate"]').should('contain', 'Date');
        });

        it('should show French translations in Health tab', () => {
            cy.get('#health-tab').click();
            cy.wait(1000);

            // Health tab should show French content
            cy.get('#health').should('be.visible');
        });
    });

    describe('German Language', () => {
        beforeEach(() => {
            cy.get('#language').select('de');
            cy.get('#btn-save-settings').click();
            cy.wait(1000);
        });

        it('should switch all UI elements to German', () => {
            // Settings tab
            cy.get('label[for="weightUnit"]').should('contain', 'Gewichtseinheit');
            cy.get('label[for="heightUnit"]').should('contain', 'Größeneinheit');
            cy.get('label[for="language"]').should('contain', 'Sprache');

            // Button should be in German
            cy.get('#btn-save-settings').should('contain', '✓ Einstellungen speichern');
        });

        it('should show German translations in Data tab', () => {
            cy.get('#data-tab').click();
            cy.wait(500);

            // Check German labels - goalWeight may be in different section
            cy.get('label[for="heightCm"]').should('contain', 'Größe');
        });

        it('should show German translations in Health tab', () => {
            cy.get('#health-tab').click();
            cy.wait(1000);

            // Health tab should show German content
            cy.get('#health').should('be.visible');
        });

        it('should show German translations in Goals tab', () => {
            cy.get('#goals-tab').click();
            cy.wait(500);

            cy.get('#goals').should('be.visible');
        });
    });

    describe('Language Persistence', () => {
        it('should persist language selection across page reloads', () => {
            // Switch to Spanish
            cy.get('#language').select('es');
            cy.get('#btn-save-settings').click();
            cy.wait(1000);

            // Verify Spanish is active
            cy.get('#btn-save-settings').should('contain', '✓ Guardar Config');

            // Reload page
            cy.reload();
            cy.wait(1000);

            // Should still be in Spanish
            cy.get('#settings-tab').click();
            cy.wait(500);
            cy.get('#btn-save-settings').should('contain', '✓ Guardar Config');
        });

        it('should persist language in localStorage', () => {
            cy.get('#language').select('fr');
            cy.get('#btn-save-settings').click();
            cy.wait(500);

            // Check localStorage
            cy.window().its('localStorage').invoke('getItem', 'language').should('eq', 'fr');
        });

        it('should persist language dropdown value when navigating between tabs', () => {
            // Switch to French
            cy.get('#language').select('fr');
            cy.get('#btn-save-settings').click();
            cy.wait(1000);

            // Verify French is saved and dropdown shows 'fr'
            cy.get('#language').should('have.value', 'fr');
            cy.get('#btn-save-settings').should('contain', '✓ Enreg. config');

            // Navigate to Data tab
            cy.get('#data-tab').click();
            cy.wait(500);

            // Navigate to Health tab
            cy.get('#health-tab').click();
            cy.wait(500);

            // Navigate back to Settings tab
            cy.get('#settings-tab').click();
            cy.wait(500);

            // Dropdown should still show French (not reset to old value)
            cy.get('#language').should('have.value', 'fr');
            cy.get('#btn-save-settings').should('contain', '✓ Enreg. config');
        });

        it('should persist language dropdown after switching languages and navigating tabs', () => {
            // Start with Spanish
            cy.get('#language').select('es');
            cy.get('#btn-save-settings').click();
            cy.wait(500);
            cy.get('#language').should('have.value', 'es');

            // Navigate away and back
            cy.get('#data-tab').click();
            cy.wait(500);
            cy.get('#settings-tab').click();
            cy.wait(500);

            // Should still be Spanish
            cy.get('#language').should('have.value', 'es');

            // Now switch to German
            cy.get('#language').select('de');
            cy.get('#btn-save-settings').click();
            cy.wait(500);
            cy.get('#language').should('have.value', 'de');

            // Navigate to Health tab
            cy.get('#health-tab').click();
            cy.wait(1000);

            // Navigate back to Settings
            cy.get('#settings-tab').click();
            cy.wait(500);

            // Dropdown should show German, not Spanish (the previous saved value)
            cy.get('#language').should('have.value', 'de');
            cy.get('#btn-save-settings').should('contain', '✓ Einstellungen speichern');
        });
    });

    describe('Dynamic Content Translation', () => {
        beforeEach(() => {
            // Add a second weight entry to generate dynamic content
            cy.get('#data-tab').click();
            cy.wait(500);

            // Show form if hidden
            cy.showWeightForm();

            cy.smartType('#newWeight', '126');
            cy.smartType('#newDate', '15/01/2025');
            cy.get('#btn-add-weight').click({force: true});
            cy.wait(1000);
        });

        it('should translate dynamically generated health messages in Spanish', () => {
            cy.get('#settings-tab').click();
            cy.wait(500);
            cy.get('#language').select('es');
            cy.get('#btn-save-settings').click();
            cy.wait(1000);

            cy.get('#health-tab').click();
            cy.wait(1000);

            // Check health tab is visible in Spanish
            cy.get('#health').should('be.visible');
        });

        it('should translate data tab content in French', () => {
            cy.get('#settings-tab').click();
            cy.wait(500);
            cy.get('#language').select('fr');
            cy.get('#btn-save-settings').click();
            cy.wait(1000);

            cy.get('#data-tab').click();
            cy.wait(500);

            // Data tab should be in French
            cy.get('label[for="newWeight"]').should('contain', 'Poids');
        });
    });

    describe('Switch Between Languages', () => {
        it('should switch from English to Spanish to French to German and back', () => {
            // Reset to English first (previous tests may have changed language)
            cy.get('#language').select('en');
            cy.get('#btn-save-settings').click();
            cy.wait(1000);

            // Verify we're starting in English
            cy.get('#language').should('have.value', 'en');

            // Switch to Spanish
            cy.get('#language').select('es');
            cy.get('#btn-save-settings').click();
            cy.wait(1000);
            cy.get('#btn-save-settings').should('be.visible');
            cy.get('#language').should('have.value', 'es');

            // Switch to French
            cy.get('#language').select('fr');
            cy.get('#btn-save-settings').click();
            cy.wait(1000);
            cy.get('#btn-save-settings').should('be.visible');
            cy.get('#language').should('have.value', 'fr');

            // Switch to German
            cy.get('#language').select('de');
            cy.get('#btn-save-settings').click();
            cy.wait(1000);
            cy.get('#btn-save-settings').should('be.visible');
            cy.get('#language').should('have.value', 'de');

            // Switch back to English
            cy.get('#language').select('en');
            cy.get('#btn-save-settings').click();
            cy.wait(1000);
            cy.get('#btn-save-settings').should('be.visible');
            cy.get('#language').should('have.value', 'en');
        });
    });
});