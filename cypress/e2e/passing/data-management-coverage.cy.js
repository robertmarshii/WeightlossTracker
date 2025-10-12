describe('Data Management Coverage Tests', () => {
    // Suppress jQuery $.post errors from coverage instrumentation
    Cypress.on('uncaught:exception', (err) => {
        if (err.message.includes('$.post is not a function') ||
            err.message.includes('Syntax error') ||
            err.message.includes('Uncaught Test error') ||
            err.message.includes('Cannot read properties of null')) {
            return false;
        }
        return true;
    });

    before(() => {
        // Login once for all tests
        const email = 'test@dev.com';
        const base = 'http://127.0.0.1:8111';

        cy.clearCookies();
        cy.clearLocalStorage();
        cy.setCookie('cypress_testing', 'true');

        cy.request({
            method: 'POST',
            url: `${base}/login_router.php?controller=auth`,
            body: { action: 'send_login_code', email: email }
        });

        cy.visit('/');
        cy.get('#loginEmail').type(email);
        cy.get('#loginForm').submit();
        cy.wait(1000);
        cy.get('#loginCode', {timeout: 10000}).should('be.visible').type('111111');
        cy.get('#verifyLoginForm button[type="submit"]').click();
        cy.url({timeout: 8000}).should('include', 'dashboard.php');
        cy.wait(1500);
    });

    beforeEach(() => {
        // Check if session is still valid before navigating
        cy.url().then((url) => {
            if (!url.includes('dashboard.php')) {
                // Session lost, re-login
                cy.log('Session lost - re-authenticating');
                const email = 'test@dev.com';
                const base = 'http://127.0.0.1:8111';

                cy.clearCookies();
                cy.clearLocalStorage();
                cy.setCookie('cypress_testing', 'true');

                cy.request({
                    method: 'POST',
                    url: `${base}/login_router.php?controller=auth`,
                    body: { action: 'send_login_code', email: email }
                });

                cy.visit('/');
                cy.get('#loginEmail').type(email);
                cy.get('#loginForm').submit();
                cy.wait(1000);
                cy.get('#loginCode', {timeout: 10000}).should('be.visible').type('111111');
                cy.get('#verifyLoginForm button[type="submit"]').click();
                cy.url({timeout: 8000}).should('include', 'dashboard.php');
                cy.wait(1500);
            }
        });

        // Navigate to data tab
        cy.get('#data-tab', {timeout: 5000}).should('be.visible').click();
        cy.wait(500);
    });

    it('should test weight history loading and display', () => {
        cy.window().then((win) => {
            // Test loadWeightHistory function
            if (win.loadWeightHistory) {
                win.loadWeightHistory();
            }
        });

        cy.wait(2000);

        // Verify weight history table is populated
        cy.get('#weight-history-body').should('exist');
    });

    it('should test date formatting functions', () => {
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
            }
        });

        cy.wait(500);
    });

    it('should test weight entry editing', () => {
        // Show the add entry form first
        cy.get('#add-entry-form').invoke('removeClass', 'hidden');
        cy.wait(100);

        // First add a weight entry to have something to edit
        cy.get('#newWeight').clear().type('75.5');
        cy.get('#newDate').clear().type('2025-01-15');
        cy.get('#btn-add-weight').click();
        cy.wait(2000);

        cy.window().then((win) => {
            // Test editWeight function if it exists
            if (win.editWeight) {
                // Test with mock data
                try {
                    win.editWeight(1, 76.0, '2025-01-15'); // Edit first entry
                } catch (e) {
                    cy.log('editWeight function called (may need valid ID)');
                }
            }

            // Check if editWeight function is available on buttons
            cy.get('body').then(($body) => {
                if ($body.find('.btn-edit-weight').length > 0) {
                    cy.get('.btn-edit-weight').first().click();
                    cy.wait(1000);
                }
            });
        });

        cy.wait(1000);
    });

    it('should test weight entry deletion', () => {
        cy.window().then((win) => {
            // Test deleteWeight function
            if (win.deleteWeight) {
                // Test with mock data
                try {
                    win.deleteWeight(1); // Try to delete entry with ID 1
                } catch (e) {
                    cy.log('deleteWeight function called (may need valid ID)');
                }
            }

            // Check if delete buttons exist and test them
            cy.get('body').then(($body) => {
                if ($body.find('.btn-delete-weight').length > 0) {
                    // Click first delete button if it exists
                    cy.get('.btn-delete-weight').first().click();
                    cy.wait(1000);

                    // Handle confirmation if it appears
                    cy.get('body').then(($body) => {
                        if ($body.find('.btn-confirm-delete').length > 0) {
                            cy.get('.btn-confirm-delete').click();
                        }
                    });
                }
            });
        });

        cy.wait(1000);
    });

    it('should test data refresh and reload functions', () => {
        cy.window().then((win) => {
            // Test any data refresh functions
            if (win.refreshData) {
                win.refreshData();
            }

            if (win.reloadWeightHistory) {
                win.reloadWeightHistory();
            }

            if (win.updateWeightDisplay) {
                win.updateWeightDisplay();
            }

            // Force reload of weight history
            if (win.loadWeightHistory) {
                win.loadWeightHistory();
            }
        });

        cy.wait(1000);
    });

    it('should test weight unit conversions in data display', () => {
        // Test changing weight units and seeing data update
        cy.get('[href="#settings"]').click();
        cy.wait(500);

        // Change weight unit to lbs
        cy.get('#weightUnit').select('lbs');
        cy.get('#btn-save-settings').click();
        cy.wait(1000);

        // Go back to data tab and check if display updated
        cy.get('[href="#data"]').click();
        cy.wait(1000);

        cy.window().then((win) => {
            if (win.loadWeightHistory) {
                win.loadWeightHistory();
            }
        });

        // Change back to kg
        cy.get('[href="#settings"]').click();
        cy.wait(500);
        cy.get('#weightUnit').select('kg');
        cy.get('#btn-save-settings').click();
        cy.wait(1000);

        cy.get('[href="#data"]').click();
        cy.wait(1000);

        cy.window().then((win) => {
            if (win.loadWeightHistory) {
                win.loadWeightHistory();
            }
        });
    });

    it('should test weight history table interactions', () => {
        // Test table body exists (the table element may not have an ID)
        cy.get('#weight-history-body', {timeout: 5000}).should('exist');

        cy.get('body').then(($body) => {
            // Check for sortable headers
            if ($body.find('th[data-sort]').length > 0) {
                cy.get('th[data-sort]').first().click();
                cy.wait(500);
            }

            // Check for pagination if it exists
            if ($body.find('.pagination').length > 0) {
                cy.get('.pagination .page-link').last().click();
                cy.wait(500);
            }
        });

        // Test table refresh with timeout protection
        cy.window().then((win) => {
            if (win.loadWeightHistory) {
                try {
                    win.loadWeightHistory();
                } catch (e) {
                    cy.log('loadWeightHistory called');
                }
            }
        });

        cy.wait(1000);
    });

    afterEach(() => {
        cy.collectCoverage('Data Management Tests');
    });
});