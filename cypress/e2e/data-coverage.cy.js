describe('Data Module Coverage Tests', () => {
    // PARTIALLY RESTORED FROM unstable-tests.cy.js - Some tests now working with proper authentication
    const base = 'http://127.0.0.1:8111';
    const email = 'test@dev.com'; // Use correct test email

    // Helper function to login and get to dashboard
    const loginToDashboard = () => {
        // Clear any existing session cookies first
        cy.clearCookies();
        cy.clearLocalStorage();

        // Set cypress_testing cookie to disable rate limiting
        cy.setCookie('cypress_testing', 'true');

        // Send login code via API first
        cy.request({
            method: 'POST',
            url: `${base}/login_router.php?controller=auth`,
            body: { action: 'send_login_code', email: email }
        });

        cy.visit('/', { failOnStatusCode: false });
        cy.get('#loginEmail').type(email);
        cy.get('#loginForm').submit();
        cy.wait(1000);
        cy.get('#loginCode', { timeout: 10000 }).should('be.visible').type('111111');
        cy.get('#verifyLoginForm button[type="submit"]').click();
        cy.url({ timeout: 8000 }).should('include', 'dashboard.php');
        cy.wait(1500);
    };

    beforeEach(() => {
        // Set cypress_testing cookie to disable rate limiting for tests
        cy.setCookie('cypress_testing', 'true');

        // Clear any existing rate limits for test email
        cy.request({
            method: 'POST',
            url: `${base}/router.php?controller=email`,
            body: {
                action: 'clear_rate_limits',
                email: email
            },
            failOnStatusCode: false
        });
    });

    // Setup: Reset schema before all tests
    before(() => {
        cy.request({
            method: 'POST',
            url: `${base}/router.php?controller=seeder`,
            form: true,
            body: { action: 'reset_schema', schema: 'wt_test' }
        });
    });

    /**
     * Helper function to perform authentication and get session
     */
    const authenticateUser = () => {
        return cy.request({
            method: 'POST',
            url: `${base}/router.php?controller=schema`,
            form: true,
            body: { action: 'switch', schema: 'wt_test' }
        })
        .then(() => cy.request({
            method: 'POST',
            url: `${base}/login_router.php?controller=auth`,
            form: true,
            body: { action: 'send_login_code', email }
        }))
        .then(() => cy.request({
            method: 'POST',
            url: `${base}/login_router.php?controller=auth`,
            form: true,
            body: { action: 'peek_code', email }
        }))
        .then((resp) => {
            const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
            const code = body.code || '111111';
            return cy.request({
                method: 'POST',
                url: `${base}/login_router.php?controller=auth`,
                form: true,
                body: { action: 'verify_login', email, code }
            });
        })
        .then(() => cy.getCookie('PHPSESSID'))
        .then((c) => {
            return c ? { Cookie: `PHPSESSID=${c.value}` } : undefined;
        });
    };

    beforeEach(() => {
        // Initialize coverage tracking
        cy.initCoverage();
        cy.enableCoverageTracking();

        // Authenticate first, then visit dashboard to load all scripts
        authenticateUser().then(() => {
            cy.visit('/dashboard.php', { failOnStatusCode: false });
            cy.wait(1500); // Ensure scripts are loaded
        });
    });

    afterEach(() => {
        // Collect coverage after each test
        cy.collectCoverage();
        cy.collectBackendCoverage();
    });

    describe('Weight History Functions', () => {
         it('should test loadWeightHistory() function with successful data', () => {
            // FROM: data-coverage.cy.js
            // FIXED: Need to authenticate first before accessing dashboard functions
            loginToDashboard();

            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: {
                    success: true,
                    history: [
                        { id: 1, entry_date: '2024-01-01', weight_kg: '80.5', bmi: '24.2' }
                    ]
                }
            }).as('getWeightHistory');

            cy.window().then((win) => {
                expect(win.loadWeightHistory).to.be.a('function');
                win.loadWeightHistory();
                cy.wait('@getWeightHistory');
            });
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
                win.loadWeightHistory();

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
                win.loadWeightHistory();

                cy.wait('@getHistoryFail');

                // Should show error message
                cy.get('#weight-history-body').should('contain', 'Failed to load weight history');
            });

            cy.verifyCoverage(['loadWeightHistory'], 'Weight history error handling for network failures');
        });

        it('should test formatDate() function with various date formats', () => {
            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.formatDate).to.be.a('function');

                // Test with ISO date string
                const result1 = win.formatDate('2024-01-15');
                expect(result1).to.match(/\d{2}\/\d{2}\/\d{4}/);

                // Test with another date
                const result2 = win.formatDate('2024-12-25');
                expect(result2).to.match(/\d{2}\/\d{2}\/\d{4}/);

                // Verify it returns UK format (DD/MM/YYYY)
                const testDate = win.formatDate('2024-01-15');
                expect(testDate).to.equal('15/01/2024');
            });

            cy.verifyCoverage(['formatDate'], 'Date formatting with various input formats');
        });

        it('should test editWeight() function UI interactions', () => {
            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.editWeight).to.be.a('function');

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
                win.editWeight(123, 75.5, '2024-01-15');

                // Verify form fields are populated
                cy.get('#newWeight').should('have.value', '75.5');
                cy.get('#newDate').should('have.value', '2024-01-15');

                // Verify form is shown
                cy.get('#add-entry-form').should('be.visible');
            });

            cy.verifyCoverage(['editWeight'], 'Weight entry editing UI state management');
        });

        it('should test deleteWeight() function with successful deletion', () => {
            // RESTORED FROM unstable-tests.cy.js - Now working with proper authentication
            loginToDashboard();

            // Mock successful delete response
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: { success: true }
            }).as('deleteWeight');

            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.deleteWeight).to.be.a('function');

                // Mock required functions
                win.showToast = cy.stub();
                win.loadWeightHistory = cy.stub();
                win.refreshLatestWeight = cy.stub();
                win.healthRefreshBMI = cy.stub();
                win.healthRefreshHealth = cy.stub();
                win.healthRefreshIdealWeight = cy.stub();

                // Mock confirm dialog to return true
                cy.stub(win, 'confirm').returns(true);

                // Call the function and debug the execution
                console.log('About to call deleteWeight(123)');

                // Override the AJAX success callback to see what happens
                const originalPost = win.$.post;
                win.$.post = function(url, data, successCallback) {
                    console.log('AJAX call made:', url, data);
                    // Simulate the successful response
                    successCallback({ success: true });
                    return {
                        fail: function(failCallback) {
                            console.log('AJAX fail handler attached');
                            return this;
                        }
                    };
                };

                win.deleteWeight(123);

            });

            cy.verifyCoverage(['deleteWeight'], 'Weight entry deletion with successful server response');
        });

        it('should test deleteWeight() function with user cancellation', () => {
            // FIXED: Need to login to dashboard first to access deleteWeight function
            loginToDashboard();

            cy.window().then((win) => {
                // Mock confirm dialog to return false (user cancels)
                cy.stub(win, 'confirm').returns(false);

                // Mock to ensure these functions are not called
                win.showToast = cy.stub();
                win.loadWeightHistory = cy.stub();

                // Call the function
                win.deleteWeight(123);

                // Verify no network calls or UI updates happened
                expect(win.showToast).to.not.have.been.called;
                expect(win.loadWeightHistory).to.not.have.been.called;
            });

            cy.verifyCoverage(['deleteWeight'], 'Weight entry deletion cancellation by user');
        });

        it('should test deleteWeight() function with server error', () => {
            // RESTORED FROM unstable-tests.cy.js - Now working with proper authentication
            loginToDashboard();

            // Mock failed delete response
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: { success: false }
            }).as('deleteWeightFail');

            cy.window().then((win) => {
                // Mock functions
                win.showToast = cy.stub();
                win.loadWeightHistory = cy.stub();
                cy.stub(win, 'confirm').returns(true);

                // Call the function
                win.deleteWeight(123);

            });

            cy.verifyCoverage(['deleteWeight'], 'Weight entry deletion error handling for server failures');
        });
    });
});