describe('Data Module Coverage Tests', () => {
    beforeEach(() => {
        // Initialize coverage tracking
        cy.initCoverage();
        cy.enableCoverageTracking();

        // Visit dashboard to load all scripts
        cy.visit('/dashboard.php', { failOnStatusCode: false });
        cy.wait(1500); // Ensure scripts are loaded
    });

    afterEach(() => {
        // Collect coverage after each test
        cy.collectCoverage();
        cy.collectBackendCoverage();
    });

    describe('Weight History Functions', () => {
        it('should test loadWeightHistory() function with successful data', () => {
            // Mock successful weight history response
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: {
                    success: true,
                    history: [
                        { id: 1, entry_date: '2024-01-01', weight_kg: '80.5', bmi: '24.2' },
                        { id: 2, entry_date: '2024-01-15', weight_kg: '79.2', bmi: '23.8' },
                        { id: 3, entry_date: '2024-02-01', weight_kg: '78.0', bmi: '23.4' }
                    ]
                }
            }).as('getWeightHistory');

            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.dataLoadWeightHistory).to.be.a('function');

                // Add mock table to the page
                win.$('body').append(`
                    <table>
                        <tbody id="weight-history-body"></tbody>
                    </table>
                `);

                // Call the function
                win.dataLoadWeightHistory();

                cy.wait('@getWeightHistory');

                // Verify table was populated
                cy.get('#weight-history-body tr').should('have.length', 3);
                cy.get('#weight-history-body').should('contain', '80.5 kg');
                cy.get('#weight-history-body').should('contain', '79.2 kg');
                cy.get('#weight-history-body').should('contain', '78.0 kg');
            });

            cy.verifyCoverage(['loadWeightHistory'], 'Weight history loading with successful data response');
        });

        it('should test loadWeightHistory() function with no data', () => {
            // Mock empty weight history response
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: {
                    success: true,
                    history: []
                }
            }).as('getEmptyHistory');

            cy.window().then((win) => {
                // Add mock table to the page
                win.$('body').append(`
                    <table>
                        <tbody id="weight-history-body"></tbody>
                    </table>
                `);

                // Call the function
                win.dataLoadWeightHistory();

                cy.wait('@getEmptyHistory');

                // Should show no data message
                cy.get('#weight-history-body').should('contain', 'No weight entries found');
            });

            cy.verifyCoverage(['loadWeightHistory'], 'Weight history handling with empty data array');
        });

        it('should test loadWeightHistory() function with network failure', () => {
            // Mock network failure
            cy.intercept('POST', '**/router.php?controller=profile', {
                forceNetworkError: true
            }).as('getHistoryFail');

            cy.window().then((win) => {
                // Add mock table to the page
                win.$('body').append(`
                    <table>
                        <tbody id="weight-history-body"></tbody>
                    </table>
                `);

                // Call the function
                win.dataLoadWeightHistory();

                cy.wait('@getHistoryFail');

                // Should show error message
                cy.get('#weight-history-body').should('contain', 'Failed to load weight history');
            });

            cy.verifyCoverage(['loadWeightHistory'], 'Weight history error handling for network failures');
        });

        it('should test formatDate() function with various date formats', () => {
            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.dataFormatDate).to.be.a('function');

                // Test with ISO date string
                const result1 = win.dataFormatDate('2024-01-15');
                expect(result1).to.match(/\d{2}\/\d{2}\/\d{4}/);

                // Test with another date
                const result2 = win.dataFormatDate('2024-12-25');
                expect(result2).to.match(/\d{2}\/\d{2}\/\d{4}/);

                // Verify it returns UK format (DD/MM/YYYY)
                const testDate = win.dataFormatDate('2024-01-15');
                expect(testDate).to.equal('15/01/2024');
            });

            cy.verifyCoverage(['formatDate'], 'Date formatting with various input formats');
        });

        it('should test editWeight() function UI interactions', () => {
            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.dataEditWeight).to.be.a('function');

                // Add mock form elements to the page
                win.$('body').append(`
                    <input id="newWeight" type="number" />
                    <input id="newDate" type="date" />
                    <div id="add-entry-form" style="display: none;">
                        <p>Add Entry Form</p>
                    </div>
                `);

                // Mock showToast function
                win.showToast = cy.stub();

                // Call the function with test data
                win.dataEditWeight(123, 75.5, '2024-01-15');

                // Verify form fields are populated
                cy.get('#newWeight').should('have.value', '75.5');
                cy.get('#newDate').should('have.value', '2024-01-15');

                // Verify form is shown
                cy.get('#add-entry-form').should('be.visible');
            });

            cy.verifyCoverage(['editWeight'], 'Weight entry editing UI state management');
        });

        it('should test deleteWeight() function with successful deletion', () => {
            // Mock successful delete response
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: { success: true }
            }).as('deleteWeight');

            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.dataDeleteWeight).to.be.a('function');

                // Mock required functions
                win.showToast = cy.stub();
                win.dataLoadWeightHistory = cy.stub();
                win.refreshLatestWeight = cy.stub();
                win.healthRefreshBMI = cy.stub();
                win.healthRefreshHealth = cy.stub();
                win.healthRefreshIdealWeight = cy.stub();

                // Mock confirm dialog to return true
                cy.stub(win, 'confirm').returns(true);

                // Call the function
                win.dataDeleteWeight(123);

                cy.wait('@deleteWeight');

                // Verify success toast was called
                expect(win.showToast).to.have.been.calledWith('Weight entry deleted');
                expect(win.dataLoadWeightHistory).to.have.been.called;
                expect(win.refreshLatestWeight).to.have.been.called;
            });

            cy.verifyCoverage(['deleteWeight'], 'Weight entry deletion with successful server response');
        });

        it('should test deleteWeight() function with user cancellation', () => {
            cy.window().then((win) => {
                // Mock confirm dialog to return false (user cancels)
                cy.stub(win, 'confirm').returns(false);

                // Mock to ensure these functions are not called
                win.showToast = cy.stub();
                win.dataLoadWeightHistory = cy.stub();

                // Call the function
                win.dataDeleteWeight(123);

                // Verify no network calls or UI updates happened
                expect(win.showToast).to.not.have.been.called;
                expect(win.dataLoadWeightHistory).to.not.have.been.called;
            });

            cy.verifyCoverage(['deleteWeight'], 'Weight entry deletion cancellation by user');
        });

        it('should test deleteWeight() function with server error', () => {
            // Mock failed delete response
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: { success: false }
            }).as('deleteWeightFail');

            cy.window().then((win) => {
                // Mock functions
                win.showToast = cy.stub();
                win.dataLoadWeightHistory = cy.stub();
                cy.stub(win, 'confirm').returns(true);

                // Call the function
                win.dataDeleteWeight(123);

                cy.wait('@deleteWeightFail');

                // Verify error toast was called
                expect(win.showToast).to.have.been.calledWith('Failed to delete weight entry');
                // Should not refresh data on failure
                expect(win.dataLoadWeightHistory).to.not.have.been.called;
            });

            cy.verifyCoverage(['deleteWeight'], 'Weight entry deletion error handling for server failures');
        });
    });
});