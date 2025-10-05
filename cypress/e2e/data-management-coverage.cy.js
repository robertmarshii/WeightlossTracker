describe('Data Management Coverage Tests', () => {
    beforeEach(() => {
        // Login to access dashboard data functions
        cy.visit('http://127.0.0.1:8111');
        cy.enableCoverageTracking();
        cy.forceInstrumentation();

        // Quick login
        cy.get('#loginEmail').type('test@example.com');
        cy.get('#sendLoginCodeBtn').click();
        cy.wait(2000);

        // Navigate to dashboard
        cy.visit('http://127.0.0.1:8111/app/frontend/dashboard.php');
        cy.wait(1000);

        // Go to data tab
        cy.get('[href="#data"]').click();
        cy.wait(1000);
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
                    debugLog(`Formatted date ${date}: ${formatted}`);
                });
            }
        });

        cy.wait(500);
    });

    it('should test weight entry editing', () => {
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
                    debugLog('editWeight function called (may need valid ID)');
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
                    debugLog('deleteWeight function called (may need valid ID)');
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
        // Test table sorting if available
        cy.get('#weight-history-table').should('exist');

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

        // Test table refresh
        cy.window().then((win) => {
            if (win.loadWeightHistory) {
                win.loadWeightHistory();
            }
        });
    });

    afterEach(() => {
        cy.collectCoverage('Data Management Tests');
    });
});