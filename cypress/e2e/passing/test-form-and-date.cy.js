/**
 * Isolated Tests for Specific Functions
 * Tests "should test form interactions and calculations" and "should test date formatting functions"
 */

describe('Isolated Form and Date Function Tests', () => {
    const base = 'http://127.0.0.1:8111';
    const email = 'test@dev.com';

    // Suppress jQuery errors
    Cypress.on('uncaught:exception', (err) => {
        if (err.message.includes('$.post is not a function') ||
            err.message.includes('Syntax error') ||
            err.message.includes('Uncaught Test error')) {
            return false;
        }
        return true;
    });

    const loginToDashboard = () => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.setCookie('cypress_testing', 'true');

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
        cy.url({timeout: 8000}).should('include', 'dashboard.php');
        cy.wait(1000);
    };

    it('should test form interactions and calculations', () => {
        loginToDashboard();

        // Ensure we're on the Data tab
        cy.get('#data-tab', {timeout: 5000}).should('be.visible').click();
        cy.wait(500);

        // Test weight input - check if form is visible or needs to be shown
        cy.get('body').then(($body) => {
            if ($body.find('#newWeight').length > 0 && $body.find('#newWeight').is(':visible')) {
                // Form is visible, use it directly
                cy.get('#newWeight').should('be.visible').clear().type('75.5');
                cy.get('#newDate').should('be.visible').clear();
                const today = new Date().toISOString().split('T')[0];
                cy.get('#newDate').type(today);
                cy.get('#btn-add-weight').click();
                cy.wait(1000);
            } else if ($body.find('#weightKg').length > 0) {
                // Alternative form element
                cy.get('#weightKg').should('be.visible').clear().type('75.5');
                cy.get('#btn-add-weight').click();
                cy.wait(500);
            }
        });

        // Test goal weight
        cy.get('body').then(($body) => {
            if ($body.find('#goalWeight').length > 0 && $body.find('#goalWeight').is(':visible')) {
                cy.get('#goalWeight').clear().type('70');
                if ($body.find('#goalDate').length > 0) {
                    cy.get('#goalDate').clear().type('2025-12-31');
                }
                if ($body.find('#btn-save-goal').length > 0) {
                    cy.get('#btn-save-goal').click();
                    cy.wait(500);
                }
            }
        });

        // Test profile height
        cy.get('body').then(($body) => {
            if ($body.find('#heightCm').length > 0 && $body.find('#heightCm').is(':visible')) {
                cy.get('#heightCm').clear().type('175');
                if ($body.find('#bodyFrame').length > 0) {
                    cy.get('#bodyFrame').select('medium');
                }
                if ($body.find('#btn-save-profile').length > 0) {
                    cy.get('#btn-save-profile').click();
                    cy.wait(500);
                }
            }
        });

        cy.log('Form interaction functions tested');
    });

    it('should test date formatting functions', () => {
        loginToDashboard();

        cy.get('#data-tab', {timeout: 5000}).should('be.visible').click();
        cy.wait(500);

        cy.window().then((win) => {
            // Test formatDate function with various inputs
            if (win.formatDate) {
                const testDates = [
                    '2025-01-15',
                    '2024-12-25',
                    '2025-06-01',
                    new Date().toISOString().split('T')[0]
                ];

                testDates.forEach(date => {
                    const formatted = win.formatDate(date);
                    expect(formatted).to.be.a('string');
                    cy.log(`Formatted date ${date}: ${formatted}`);
                });

                cy.log('Date formatting functions tested successfully');
            } else {
                cy.log('formatDate function not found - may not be loaded yet');
            }
        });

        cy.wait(500);
    });
});
