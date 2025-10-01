/// <reference types="cypress" />

/**
 * Language Switching Tests
 * Tests translation functionality across all supported languages (English, Spanish, French, German)
 */

describe('Language Switching', () => {
    beforeEach(() => {
        // Register user and log in
        cy.clearAllSessionStorage();
        cy.clearAllCookies();
        cy.clearAllLocalStorage();

        const testEmail = `test_lang_${Date.now()}@example.com`;
        cy.visit('http://127.0.0.1:8111');

        // Click signup tab first
        cy.get('a[href="#signup"]').click();
        cy.wait(500);

        // Register
        cy.get('#agreeTerms').check();
        cy.get('#signupEmail').type(testEmail);
        cy.get('#signupForm').submit();
        cy.wait(1000);

        // Get verification code from backend
        cy.task('getLatestVerificationCode', testEmail).then((code) => {
            cy.get('#signupCode').type(code);
            cy.get('#agreeTerms').check();
            cy.get('#verifySignupForm').submit();
            cy.wait(2000);
        });

        // Add profile data
        cy.get('#heightCm').clear().type('175');
        cy.get('#newWeight').clear().type('128');
        cy.get('#newDate').clear().type('01/01/2025');
        cy.get('#btn-add-weight').click();
        cy.wait(1000);

        // Navigate to Settings tab
        cy.get('a[href="#settings"]').click();
        cy.wait(500);
    });

    describe('English Language (Default)', () => {
        it('should display all UI elements in English by default', () => {
            // Settings tab
            cy.get('#settings').should('contain', 'Settings');
            cy.contains('Weight Unit').should('be.visible');
            cy.contains('Height Unit').should('be.visible');
            cy.contains('Date Format').should('be.visible');
            cy.contains('Language').should('be.visible');

            // Check button text
            cy.get('#btn-save-settings').should('contain', '✓ Save Settings');
            cy.get('#btn-reset-settings').should('contain', '↻ Reset to Defaults');
        });

        it('should show English translations in Overview tab', () => {
            cy.get('a[href="#overview"]').click();
            cy.wait(500);

            // Check weight displays
            cy.get('#latest-weight').should('contain', 'Latest:');
            cy.get('#last-week-weight').should('contain', 'Last Week:');
            cy.get('#last-month-weight').should('contain', 'Last Month:');
        });

        it('should show English translations in Health tab', () => {
            cy.get('a[href="#health"]').click();
            cy.wait(500);

            // Health score should be visible with English text
            cy.get('#personal-benefits-calculator').within(() => {
                cy.contains('Health Score').should('be.visible');
                cy.contains('Progress Summary').should('be.visible');
            });
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

        it('should show Spanish translations in Overview tab', () => {
            cy.get('a[href="#overview"]').click();
            cy.wait(500);

            // Check translated text
            cy.get('#latest-weight').should('contain', 'Último:');
            cy.get('#last-week-weight').should('contain', 'Semana Pasada:');
            cy.get('#last-month-weight').should('contain', 'Mes Pasado:');
        });

        it('should show Spanish translations in Health tab', () => {
            cy.get('a[href="#health"]').click();
            cy.wait(1000);

            // Health score
            cy.get('#personal-benefits-calculator').within(() => {
                cy.contains('Puntuación de Salud').should('be.visible');
                cy.contains('Resumen de Progreso').should('be.visible');
            });

            // BMI card
            cy.get('[data-spa="📊 IMC"]').should('contain', 'IMC');
        });

        it('should show Spanish translations in Achievements tab', () => {
            cy.get('a[href="#achievements"]').click();
            cy.wait(500);

            cy.get('#total-progress').should('exist');
            cy.get('#streak-counter').should('exist');
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
            cy.get('label[for="heightUnit"]').should('contain', 'Unité de Hauteur');
            cy.get('label[for="language"]').should('contain', 'Langue');

            // Button should be in French
            cy.get('#btn-save-settings').should('contain', '✓ Enreg. config');
        });

        it('should show French translations in Overview tab', () => {
            cy.get('a[href="#overview"]').click();
            cy.wait(500);

            // Check translated text
            cy.get('#latest-weight').should('contain', 'Dernier:');
            cy.get('#last-week-weight').should('contain', 'Semaine Dernière:');
            cy.get('#last-month-weight').should('contain', 'Mois Dernier:');
        });

        it('should show French translations in Health tab', () => {
            cy.get('a[href="#health"]').click();
            cy.wait(1000);

            // Health score
            cy.get('#personal-benefits-calculator').within(() => {
                cy.contains('Score de Santé').should('be.visible');
                cy.contains('Résumé des Progrès').should('be.visible');
            });

            // BMI card
            cy.get('[data-fre="📊 IMC"]').should('contain', 'IMC');
        });

        it('should show French translations in Data tab', () => {
            cy.get('a[href="#data"]').click();
            cy.wait(500);

            // Weight entry form
            cy.get('label[for="newWeight"]').should('contain', 'Poids');
            cy.get('label[for="newDate"]').should('contain', 'Date');
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

        it('should show German translations in Overview tab', () => {
            cy.get('a[href="#overview"]').click();
            cy.wait(500);

            // Check translated text
            cy.get('#latest-weight').should('contain', 'Neueste:');
            cy.get('#last-week-weight').should('contain', 'Letzte Woche:');
            cy.get('#last-month-weight').should('contain', 'Letzter Monat:');
        });

        it('should show German translations in Health tab', () => {
            cy.get('a[href="#health"]').click();
            cy.wait(1000);

            // Health score
            cy.get('#personal-benefits-calculator').within(() => {
                cy.contains('Gesundheitspunktzahl').should('be.visible');
                cy.contains('Fortschritts-Zusammenfassung').should('be.visible');
            });

            // BMI card
            cy.get('[data-ger="📊 BMI"]').should('contain', 'BMI');
        });

        it('should show German translations in Achievements tab', () => {
            cy.get('a[href="#achievements"]').click();
            cy.wait(500);

            cy.get('#total-progress').should('exist');
            cy.get('#streak-counter').should('exist');
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
            cy.get('a[href="#settings"]').click();
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

            // Navigate to Overview tab
            cy.get('a[href="#overview"]').click();
            cy.wait(500);

            // Navigate to Data tab
            cy.get('a[href="#data"]').click();
            cy.wait(500);

            // Navigate back to Settings tab
            cy.get('a[href="#settings"]').click();
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
            cy.get('a[href="#overview"]').click();
            cy.wait(500);
            cy.get('a[href="#settings"]').click();
            cy.wait(500);

            // Should still be Spanish
            cy.get('#language').should('have.value', 'es');

            // Now switch to German
            cy.get('#language').select('de');
            cy.get('#btn-save-settings').click();
            cy.wait(500);
            cy.get('#language').should('have.value', 'de');

            // Navigate to Health tab
            cy.get('a[href="#health"]').click();
            cy.wait(1000);

            // Navigate back to Settings
            cy.get('a[href="#settings"]').click();
            cy.wait(500);

            // Dropdown should show German, not Spanish (the previous saved value)
            cy.get('#language').should('have.value', 'de');
            cy.get('#btn-save-settings').should('contain', '✓ Einstellungen speichern');
        });
    });

    describe('Dynamic Content Translation', () => {
        beforeEach(() => {
            // Add a second weight entry to generate dynamic content
            cy.get('a[href="#data"]').click();
            cy.wait(500);
            cy.get('#newWeight').clear().type('126');
            cy.get('#newDate').clear().type('15/01/2025');
            cy.get('#btn-add-weight').click();
            cy.wait(1000);
        });

        it('should translate dynamically generated health messages in Spanish', () => {
            cy.get('a[href="#settings"]').click();
            cy.wait(500);
            cy.get('#language').select('es');
            cy.get('#btn-save-settings').click();
            cy.wait(1000);

            cy.get('a[href="#health"]').click();
            cy.wait(1000);

            // Check health improvement messages are in Spanish
            cy.get('#personal-benefits-calculator').should('exist');
        });

        it('should translate weight progress in French', () => {
            cy.get('a[href="#settings"]').click();
            cy.wait(500);
            cy.get('#language').select('fr');
            cy.get('#btn-save-settings').click();
            cy.wait(1000);

            cy.get('a[href="#overview"]').click();
            cy.wait(500);

            // Weight progress should be in French
            cy.get('#progress-block').should('contain', 'Poids Total Perdu');
        });
    });

    describe('Switch Between Languages', () => {
        it('should switch from English to Spanish to French to German and back', () => {
            // Start in English
            cy.get('#btn-save-settings').should('contain', '✓ Save Settings');

            // Switch to Spanish
            cy.get('#language').select('es');
            cy.get('#btn-save-settings').click();
            cy.wait(500);
            cy.get('#btn-save-settings').should('contain', '✓ Guardar Config');

            // Switch to French
            cy.get('#language').select('fr');
            cy.get('#btn-save-settings').click();
            cy.wait(500);
            cy.get('#btn-save-settings').should('contain', '✓ Enreg. config');

            // Switch to German
            cy.get('#language').select('de');
            cy.get('#btn-save-settings').click();
            cy.wait(500);
            cy.get('#btn-save-settings').should('contain', '✓ Einstellungen speichern');

            // Switch back to English
            cy.get('#language').select('en');
            cy.get('#btn-save-settings').click();
            cy.wait(500);
            cy.get('#btn-save-settings').should('contain', '✓ Save Settings');
        });
    });
});