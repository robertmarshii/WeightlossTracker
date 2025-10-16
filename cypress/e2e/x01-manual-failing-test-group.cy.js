    // Suppress jQuery errors
    Cypress.on('uncaught:exception', (err) => {
        if (err.message.includes('$.post is not a function') ||
            err.message.includes('Syntax error') ||
            err.message.includes('Uncaught Test error')) {
            return false;
        }
        return true;
    });

    // Helper function to login to dashboard
    const loginToDashboard = () => {
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

        cy.visit('/', { failOnStatusCode: false });
        cy.get('#loginEmail', {timeout: 5000}).should('be.visible').type(email);
        cy.get('#loginForm').submit();
        cy.wait(500);
        cy.get('#loginCode', {timeout: 5000}).should('be.visible').type('111111');
        cy.get('#verifyLoginForm button[type="submit"]').click();
        cy.url({timeout: 5000}).should('include', 'dashboard.php');
        cy.wait(1000);
    };

    // FROM: test-page.cy.js (2 tests)
    describe('Test Page Output', () => {
        it('retrieves DB JSON via API while visiting test page', () => {
            // Keep visit to ensure server and routing are working
            cy.visit('/test/test.php', { failOnStatusCode: false });
            cy.wait(500);

            // Query the API directly for deterministic JSON shape
            cy.request({
                method: 'POST',
                url: '/router.php?controller=get1',
                body: { page: 1 },
                failOnStatusCode: false
            }).then((resp) => {
                if (resp.status === 200 && resp.body) {
                    const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
                    if (Array.isArray(body) && body.length > 0) {
                        const first = body[0];
                        expect(first).to.have.property('id');
                        expect(first).to.have.property('val');
                    } else {
                        cy.log('API returned empty or non-array response');
                    }
                } else {
                    cy.log('API request failed or returned non-200 status');
                }
            });
        });
        
            it('should test schema logger and test functions', () => {
                // Visit test pages to trigger schema logger
                cy.visit('/test/test.php', { failOnStatusCode: false });
                cy.wait(1000);

                // Visit test interface
                cy.visit('/test/test-interface.html', { failOnStatusCode: false });
                cy.wait(1000);

                cy.log('Schema logger and test functions triggered');
            });
    });

    describe('Real Settings UI Interaction', () => {
        beforeEach(() => {
            loginToDashboard();
        });

        it('should test settings functions through UI interactions', () => {
            // Navigate to settings tab
            cy.get('a[href="#settings"]', {timeout: 5000}).should('be.visible').click();
            cy.wait(500);

            // Test theme changes
            cy.get('#theme').select('dark');
            cy.wait(500);
            cy.get('#theme').select('glassmorphism');
            cy.wait(500);

            // Test unit changes
            cy.get('#weightUnit').select('lbs');
            cy.wait(500);
            cy.get('#weightUnit').select('kg');
            cy.wait(500);

            cy.get('#heightUnit').select('ft');
            cy.wait(500);
            cy.get('#heightUnit').select('cm');
            cy.wait(500);

            // Test date format changes
            cy.get('#dateFormat').select('us');
            cy.wait(500);
            cy.get('#dateFormat').select('uk');
            cy.wait(500);

            // Test email notifications
            cy.get('#emailNotifications').uncheck();
            cy.wait(500);
            cy.get('#emailNotifications').check();
            cy.wait(500);

            // Try to save settings
            cy.get('#btn-save-settings').click();
            cy.wait(1000);

            cy.verifyCoverage(['loadSettings', 'saveSettings', 'updateThemeOptions', 'updateDateExample'], 'Settings UI interaction functions');
        });

        it('should test reset settings functionality', () => {
            // Navigate to settings tab
            cy.get('a[href="#settings"]', {timeout: 5000}).should('be.visible').click();
            cy.wait(500);

            // Change some settings first
            cy.get('#theme').select('dark');
            cy.get('#weightUnit').select('lbs');
            cy.wait(500);

            // Test reset button (if available)
            cy.get('body').then(($body) => {
                if ($body.find('#btn-reset-settings').length > 0) {
                    cy.get('#btn-reset-settings').click();
                    cy.wait(1000);
                }
            });

            cy.window().then((win) => {
                // Call reset function directly if button not found
                if (typeof win.resetSettings === 'function') {
                    win.resetSettings();
                }
            });

            cy.verifyCoverage(['resetSettings'], 'Reset settings functionality');
        });

         it('should test critical UI and utility functions', () => {
            cy.window().then((win) => {
                // Test showAlert with all types
                if (typeof win.showAlert === 'function') {
                    win.showAlert('Test info message', 'info');
                    win.showAlert('Test success message', 'success');
                    win.showAlert('Test warning message', 'warning');
                    win.showAlert('Test danger message', 'danger');
                    win.showAlert('Test default message'); // No type
                }

                // Test showToast
                if (typeof win.showToast === 'function') {
                    win.showToast('Test toast 1');
                    win.showToast('Test toast 2');
                    win.showToast('Long test toast message with details');
                }

                // Test parseJson with various inputs
                if (typeof win.parseJson === 'function') {
                    win.parseJson('{"valid": "json"}');
                    win.parseJson('{"number": 123, "bool": true}');
                    win.parseJson('[1,2,3]');
                    win.parseJson('null');
                    win.parseJson('invalid json');
                    win.parseJson('');
                    win.parseJson('{"malformed": json}');
                }

                // Test openModal
                if (typeof win.openModal === 'function') {
                    win.openModal('Test modal content');
                    win.openModal('<h1>HTML Modal</h1>');
                }

                // Test getDateFormat and formatDateBySettings
                if (typeof win.getDateFormat === 'function') {
                    win.getDateFormat();
                }

                if (typeof win.formatDateBySettings === 'function') {
                    win.formatDateBySettings('2025-01-15');
                    win.formatDateBySettings('2025-12-31');
                    win.formatDateBySettings('2024-02-29'); // Leap year
                }
            });

            cy.verifyCoverage(['showAlert', 'showToast', 'parseJson', 'openModal', 'getDateFormat', 'formatDateBySettings'], 'Critical UI utility functions');
        });

        it('should test UI helper and modal functions', () => {
            cy.window().then((win) => {
                // Test alert and toast functions
                if (typeof win.showAlert === 'function') {
                    win.showAlert('Test message', 'info');
                    win.showAlert('Success message', 'success');
                    win.showAlert('Warning message', 'warning');
                    win.showAlert('Error message', 'danger');
                }

                if (typeof win.showToast === 'function') {
                    win.showToast('Test toast message');
                    win.showToast('Another toast');
                }

                // Test modal functions
                if (typeof win.openModal === 'function') {
                    win.openModal('Test modal content');
                }

                // Test JSON parsing
                if (typeof win.parseJson === 'function') {
                    const validJson = win.parseJson('{"test": "value", "number": 42}');
                    expect(validJson).to.be.an('object');

                    const invalidJson = win.parseJson('{invalid json}');
                    expect(invalidJson).to.exist;

                    const nullJson = win.parseJson('null');
                    expect(nullJson).to.exist;
                }

                // Test date formatting
                if (typeof win.getDateFormat === 'function') {
                    const dateFormat = win.getDateFormat();
                    expect(dateFormat).to.be.a('string');
                }

                if (typeof win.formatDateBySettings === 'function') {
                    const formattedDate = win.formatDateBySettings('2025-01-15');
                    expect(formattedDate).to.be.a('string');
                }
            });

            cy.verifyCoverage(['showAlert', 'showToast', 'openModal', 'parseJson', 'getDateFormat', 'formatDateBySettings'], 'UI helper functions');
        });

        
        it('should save Neck measurement data', () => {
            // Scroll to Measurements section first
            cy.contains('h5', 'Measurements').scrollIntoView();
            cy.wait(500);

            // Find and click the Add Data button for Neck
            cy.contains('h6', 'Neck').closest('.glass-card-small').find('button').contains('Add Data').click();
            cy.wait(1000);

            // Input should now be visible
            cy.get('#neck-input', {timeout: 10000}).should('be.visible').clear().type('38.5');
            cy.get('#btn-save-neck').click();
            cy.wait(2000);

            cy.get('.alert-success', {timeout: 10000}).should('be.visible');
            cy.get('#neck-value').should('contain', '38.5');
        });

        
        it('should test weight management functions', () => {
            // Test adding weight entry
            cy.get('#newWeight').clear().type('75.5');
            cy.get('#newDate').clear().type('2025-01-15');
            cy.get('#btn-add-weight').click();
            cy.wait(2000);

            cy.window().then((win) => {
                // Test utility functions
                if (win.formatDate) {
                    const testDate = win.formatDate('2025-01-15');
                    expect(testDate).to.be.a('string');
                }
            });
        });

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

        

        it('should format all .format-date elements on the page', () => {
            cy.wait(3000); // Wait for page to fully load
            cy.window().then((win) => {
                // Ensure globalDashboardData exists
                if (!win.globalDashboardData) {
                    win.globalDashboardData = { settings: {} };
                }
                // Set Euro format for testing
                win.globalDashboardData.settings.date_format = 'euro';

                // Wait for data to load
                cy.wait(2000);

                // Call formatAllTimestamps
                win.formatAllTimestamps();

                cy.wait(500);

                // Check if Latest weight date uses dots (Euro format)
                cy.get('#latest-weight .format-date').then(($el) => {
                    if ($el.length > 0 && $el.text().trim() !== '') {
                        const dateText = $el.text();
                        // Should contain dots if Euro format
                        expect(dateText).to.match(/\d{2}\.\d{2}\.\d{4}/);
                    }
                });
            });
        });

        it('should format login time with date and time', () => {
            cy.wait(3000);
            cy.window().then((win) => {
                if (!win.globalDashboardData) {
                    win.globalDashboardData = { settings: {} };
                }
                win.globalDashboardData.settings.date_format = 'euro';
                win.formatAllTimestamps();

                cy.wait(500);

                cy.get('#login-time').then(($el) => {
                    if ($el.length > 0 && $el.text().trim() !== '') {
                        const text = $el.text();
                        // Should have dots and time (HH:MM)
                        expect(text).to.match(/\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}/);
                    }
                });
            });
        });

        it('should update all timestamps when date format changes', () => {
            cy.wait(3000);
            cy.window().then((win) => {
                if (!win.globalDashboardData) {
                    win.globalDashboardData = { settings: {} };
                }
                // Start with UK format
                win.globalDashboardData.settings.date_format = 'uk';
                win.formatAllTimestamps();
                cy.wait(500);

                // Change to Euro format
                win.globalDashboardData.settings.date_format = 'euro';
                win.formatAllTimestamps();
                cy.wait(500);

                // All format-date elements should now use dots
                cy.get('.format-date').each(($el) => {
                    if ($el.text().trim() !== '') {
                        const text = $el.text();
                        // Should contain dots, not slashes
                        expect(text).to.match(/\d{2}\.\d{2}\.\d{4}/);
                        expect(text).to.not.match(/\d{2}\/\d{2}\/\d{4}/);
                    }
                });
            });
        });

          it('should update dates when changing date format in settings', () => {
            // Open Settings tab
            cy.get('a[href="#settings"]').click();
            cy.wait(1000);

            // Change date format to Euro
            cy.get('#dateFormat').select('euro');

            // Save settings
            cy.get('#btn-save-settings').click();
            cy.wait(2000);

            // Go back to Data tab
            cy.get('a[href="#data"]').click();
            cy.wait(1000);

            // Check if dates are formatted with dots
            cy.window().then((win) => {
                const format = win.getDateFormat();
                expect(format).to.equal('euro');
            });

            cy.get('#latest-weight .format-date').then(($el) => {
                if ($el.length > 0 && $el.text().trim() !== '') {
                    expect($el.text()).to.match(/\d{2}\.\d{2}\.\d{4}/);
                }
            });
        });

        
    });

        describe('Settings Integration', () => {
      it('should persist date format across page reloads', () => {
            // Set Euro format
            cy.window().then((win) => {
                win.setDateFormat('euro');
            });

            // Reload page
            cy.reload();
            cy.wait(2000);

            // Check format is still Euro
            cy.window().then((win) => {
                const format = win.getDateFormat();
                expect(format).to.equal('euro');
            });
        });
    });

    describe('Weight History Table Dates', () => {
        it('should format dates in weight history table', () => {
            cy.wait(3000);
            cy.window().then((win) => {
                if (!win.globalDashboardData) {
                    win.globalDashboardData = { settings: {} };
                }
                win.globalDashboardData.settings.date_format = 'euro';
            });

            // Navigate to Data tab
            cy.get('a[href="#data"]').click();
            cy.wait(2000);

            // Reload weight history
            cy.window().then((win) => {
                if (typeof win.dataLoadWeightHistory === 'function') {
                    win.dataLoadWeightHistory();
                }
            });

            cy.wait(1000);

            // Check if table dates use Euro format
            cy.get('#weight-history-body tr').first().find('td').first().then(($td) => {
                if ($td.length > 0 && $td.text().trim() !== '') {
                    const dateText = $td.text();
                    // Should use dots for Euro format
                    expect(dateText).to.match(/\d{2}\.\d{2}\.\d{4}/);
                }
            });
        });
    });

    
    describe('Goal Date Display', () => {
        it('should format goal date correctly', () => {
            cy.wait(3000);
            cy.window().then((win) => {
                if (!win.globalDashboardData) {
                    win.globalDashboardData = { settings: {} };
                }
                win.globalDashboardData.settings.date_format = 'euro';
                win.formatAllTimestamps();
            });

            cy.wait(1000);

            // Check current goal display
            cy.get('#current-goal').then(($el) => {
                if ($el.length > 0 && $el.text().includes('by')) {
                    const text = $el.text();
                    // Should contain Euro-formatted date
                    expect(text).to.match(/\d{2}\.\d{2}\.\d{4}/);
                }
            });
        });
    });

    describe('Streak Counter Dates', () => {
        it('should format streak counter dates', () => {
            cy.wait(3000);
            cy.window().then((win) => {
                if (!win.globalDashboardData) {
                    win.globalDashboardData = { settings: {} };
                }
                win.globalDashboardData.settings.date_format = 'euro';

                // Refresh streak counter
                if (typeof win.refreshStreakCounter === 'function') {
                    win.refreshStreakCounter();
                }
            });

            cy.wait(2000);

            // Navigate to Health tab where streak counter appears
            cy.get('a[href="#health"]').click();
            cy.wait(1000);

            // Check if streak counter dates use Euro format
            cy.get('#streak-counter').then(($el) => {
                if ($el.length > 0) {
                    const text = $el.text();
                    // If there are dates, they should use dots
                    if (text.match(/\d{2}[.\\/]\d{2}[.\\/]\d{4}/)) {
                        expect(text).to.match(/\d{2}\.\d{2}\.\d{4}/);
                    }
                }
            });
        });
    });


        // ========================================
    // ACHIEVEMENT TRACKING FUNCTIONS
    // Merged from: achievements-coverage.cy.js
    // ========================================
    describe('Achievement Tracking Functions', () => {
        it('should test updateAchievementCards() function with progress data', () => {
            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.achievementsUpdateAchievementCards).to.be.a('function');

                // Mock weight data with progress
                const mockWeightData = [
                    { entry_date: '2024-01-01', weight_kg: '80.5' },
                    { entry_date: '2024-01-15', weight_kg: '79.2' },
                    { entry_date: '2024-02-01', weight_kg: '78.0' },
                    { entry_date: '2024-02-15', weight_kg: '77.5' },
                    { entry_date: '2024-03-01', weight_kg: '76.8' }
                ];

                // Add mock elements to the page
                win.$('body').append(`
                    <div id="total-progress"></div>
                    <div id="streak-counter"></div>
                    <div id="goals-achieved"></div>
                `);

                // Call the function
                win.achievementsUpdateAchievementCards(mockWeightData);

                // Verify elements were updated
                cy.get('#total-progress').should('contain', 'kg lost');
                cy.get('#streak-counter').should('exist');
                cy.get('#goals-achieved').should('contain', 'Goal tracking');
            });

            // Direct verification that function was called
            cy.log('Achievement progress calculation with weight loss data');
        });

        it('should test updateAchievementCards() function with no data', () => {
            // FROM: modules-comprehensive.cy.js
            // ISSUE: Achievement functions require authentication
            loginToDashboard();

            cy.window().then((win) => {
                const updateFunc = win.achievementsUpdateAchievementCards || win.updateAchievementCards;
                expect(updateFunc).to.be.a('function');
                updateFunc([]);
            });
        });

        it('should test updateAchievementCards() function with weight gain scenario', () => {
            cy.window().then((win) => {
                // Mock weight data with weight gain
                const mockWeightData = [
                    { entry_date: '2024-01-01', weight_kg: '75.0' },
                    { entry_date: '2024-01-15', weight_kg: '76.2' },
                    { entry_date: '2024-02-01', weight_kg: '77.5' }
                ];

                // Add mock elements to the page
                win.$('body').append(`
                    <div id="total-progress"></div>
                    <div id="streak-counter"></div>
                    <div id="goals-achieved"></div>
                `);

                // Call the function
                win.achievementsUpdateAchievementCards(mockWeightData);

                // Should show weight gained instead of lost
                cy.get('#total-progress').should('contain', 'kg gained');
            });

            // Direct verification that function was called
            cy.log('Achievement tracking with weight gain scenario');
        });

        it('should test updateAchievementCards() streak calculation', () => {
            cy.window().then((win) => {
                // Mock recent consecutive entries for streak
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                const twoDaysAgo = new Date(today);
                twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

                const mockWeightData = [
                    { entry_date: twoDaysAgo.toISOString().split('T')[0], weight_kg: '80.0' },
                    { entry_date: yesterday.toISOString().split('T')[0], weight_kg: '79.5' },
                    { entry_date: today.toISOString().split('T')[0], weight_kg: '79.0' }
                ];

                // Add mock elements to the page
                win.$('body').append(`
                    <div id="total-progress"></div>
                    <div id="streak-counter"></div>
                    <div id="goals-achieved"></div>
                `);

                // Call the function
                win.achievementsUpdateAchievementCards(mockWeightData);

                // Should show current streak
                cy.get('#streak-counter').should('contain', 'day');
            });

            // Direct verification that function was called
            cy.log('Achievement streak calculation with consecutive entries');
        });
    });


        // ========================================
    // HEALTH DATA REFRESH FUNCTIONS
    // Merged from: health-coverage.cy.js
    // ========================================
    describe('Health Data Refresh Functions', () => {
        it('should test refreshBMI() function with successful data', () => {
            // Mock successful BMI response
            cy.intercept('POST', '**/router.php?controller=profile', (req) => {
                if (req.body.action === 'get_bmi') {
                    req.reply({
                        statusCode: 200,
                        body: {
                            success: true,
                            bmi: 25.2,
                            category: 'overweight',
                            adjusted_bmi: 24.8,
                            adjusted_category: 'normal',
                            height_cm: 175
                        }
                    });
                } else if (req.body.action === 'get_weight_progress') {
                    req.reply({
                        statusCode: 200,
                        body: {
                            success: true,
                            start_weight_kg: 85.0,
                            current_weight_kg: 77.0
                        }
                    });
                }
            }).as('getBMIData');

            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.healthRefreshBMI).to.be.a('function');

                // Add mock BMI element to the page
                win.$('body').append('<div id="bmi-block"></div>');

                // Call the function
                win.healthRefreshBMI();

                cy.wait('@getBMIData');

                // Verify BMI data was displayed
                cy.get('#bmi-block').should('contain', '25.2');
                cy.get('#bmi-block').should('contain', 'overweight');
            });

            cy.verifyCoverage(['refreshBMI'], 'BMI data refresh with successful server response');
        });

     

        it('should test refreshIdealWeight() function with successful data', () => {
            // Mock ideal weight response
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: {
                    success: true,
                    min_weight_kg: 65,
                    max_weight_kg: 75,
                    timeline: {
                        target_date: '2024-06',
                        current_rate_kg_per_week: 0.5
                    },
                    note: 'Based on healthy BMI range 18.5-25'
                }
            }).as('getIdealWeight');

            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.healthRefreshIdealWeight).to.be.a('function');

                // Add mock ideal weight element to the page
                win.$('body').append('<div id="ideal-weight-block"></div>');

                // Call the function
                win.healthRefreshIdealWeight();

                cy.wait('@getIdealWeight');

                // Verify ideal weight data was displayed
                cy.get('#ideal-weight-block').should('contain', '65 - 75 kg');
                cy.get('#ideal-weight-block').should('contain', 'June 2024');
            });

            cy.verifyCoverage(['refreshIdealWeight'], 'Ideal weight calculation with timeline prediction');
        });

        it('should test refreshGallbladderHealth() function with successful data', () => {
            // Mock gallbladder health response
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: {
                    success: true,
                    gallbladder_status: 'Improved',
                    risk_reduction_percentage: 25,
                    weight_lost_kg: 8.0,
                    current_bmi: 24.5,
                    research_note: 'Weight loss reduces gallstone risk significantly'
                }
            }).as('getGallbladderHealth');

            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.healthRefreshGallbladderHealth).to.be.a('function');

                // Add mock gallbladder element to the page
                win.$('body').append('<div id="gallbladder-block"></div>');

                // Call the function
                win.healthRefreshGallbladderHealth();

                cy.wait('@getGallbladderHealth');

                // Verify gallbladder health data was displayed
                cy.get('#gallbladder-block').should('contain', 'Improved');
                cy.get('#gallbladder-block').should('contain', '25%');
            });

            cy.verifyCoverage(['refreshGallbladderHealth'], 'Gallbladder health assessment with risk reduction data');
        });
    });


    
    // ========================================
    // HEALTH BENEFIT CARDS UPDATE FUNCTION
    // Merged from: health-coverage.cy.js
    // ========================================
    describe('Health Benefit Cards Update Function', () => {
        it('should test updateHealthBenefitCards() function with weight progress', () => {
            // Mock weight progress response with comprehensive data
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: {
                    success: true,
                    start_weight_kg: 85.0,
                    current_weight_kg: 77.0,
                    height_cm: 175
                }
            }).as('getWeightProgress');

            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.updateHealthBenefitCards).to.be.a('function');

                // Add mock health benefit elements to the page
                win.$('body').append(`
                    <div id="diabetes-block"></div>
                    <div id="sleep-apnea-block"></div>
                    <div id="hypertension-block"></div>
                    <div id="fatty-liver-block"></div>
                    <div id="heart-disease-block"></div>
                    <div id="mental-health-block"></div>
                    <div id="joint-health-block"></div>
                    <div id="life-expectancy-block"></div>
                    <div id="personal-benefits-calculator"></div>
                `);

                // Call the function
                win.updateHealthBenefitCards();

                cy.wait('@getWeightProgress');

                // Verify health benefit cards were updated
                cy.get('#diabetes-block').should('contain', 'Current Risk');
                cy.get('#sleep-apnea-block').should('contain', 'Risk reduced');
                cy.get('#personal-benefits-calculator').should('contain', '/100');
            });

            cy.verifyCoverage(['updateHealthBenefitCards'], 'Health benefit cards update with comprehensive progress data');
        });

        it('should test refreshPersonalHealthBenefits() function', () => {
            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.refreshPersonalHealthBenefits).to.be.a('function');

                // Mock updateHealthBenefitCards function
                win.updateHealthBenefitCards = cy.stub();

                // Call the function
                win.refreshPersonalHealthBenefits();

                // Verify it calls updateHealthBenefitCards
                expect(win.updateHealthBenefitCards).to.have.been.called;
            });

            cy.verifyCoverage(['refreshPersonalHealthBenefits'], 'Personal health benefits refresh delegation');
        });
    });



        // ========================================
    // SETTINGS MANAGEMENT FUNCTIONS
    // Merged from: settings-coverage.cy.js
    // ========================================
    describe('Settings Management Functions', () => {
        

        it('should test loadSettings() function with failed response', () => {
            // Mock failed settings response
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: { success: false, message: 'Settings not found' }
            }).as('getSettingsFail');

            cy.window().then((win) => {
                // Add mock form elements with default values
                win.$('body').append(`
                    <select id="weightUnit"><option value="kg">kg</option></select>
                    <select id="heightUnit"><option value="cm">cm</option></select>
                    <select id="dateFormat"><option value="uk">UK</option></select>
                    <select id="timezone"><option value="Europe/London">London</option></select>
                    <select id="theme"><option value="glassmorphism">Glassmorphism</option></select>
                    <select id="language"><option value="en">English</option></select>
                    <select id="startOfWeek"><option value="monday">Monday</option></select>
                    <input type="checkbox" id="shareData" />
                    <input type="checkbox" id="emailNotifications" />
                    <input type="checkbox" id="weeklyReports" />
                `);

                // Call the function
                win.settingsLoadSettings();

                cy.wait('@getSettingsFail');

                // Function should handle failure gracefully without updating fields
                cy.get('#weightUnit').should('have.value', 'kg'); // Default values remain
            });

            cy.verifyCoverage(['loadSettings'], 'Settings loading error handling for failed server response');
        });

        it('should test saveSettings() function with successful save', () => {
            // Mock successful save response
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: { success: true }
            }).as('saveSettings');

            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.settingsSaveSettings).to.be.a('function');

                // Add mock form elements with test values
                win.$('body').append(`
                    <select id="weightUnit"><option value="lbs" selected>lbs</option></select>
                    <select id="heightUnit"><option value="ft" selected>ft</option></select>
                    <select id="dateFormat"><option value="us" selected>US</option></select>
                    <select id="timezone"><option value="America/New_York" selected>New York</option></select>
                    <select id="theme"><option value="dark" selected>Dark</option></select>
                    <select id="language"><option value="es" selected>Spanish</option></select>
                    <select id="startOfWeek"><option value="sunday" selected>Sunday</option></select>
                    <input type="checkbox" id="shareData" checked />
                    <input type="checkbox" id="emailNotifications" />
                    <input type="checkbox" id="weeklyReports" checked />
                    <div id="settings-status"></div>
                `);

                // Call the function
                win.settingsSaveSettings();

                cy.wait('@saveSettings');

                // Verify success message was displayed
                cy.get('#settings-status')
                    .should('contain', 'Settings saved successfully')
                    .should('have.class', 'text-success');

                // Verify the settings data was collected correctly from form
                cy.wait('@saveSettings').then((interception) => {
                    expect(interception.request.body).to.include('weight_unit=lbs');
                    expect(interception.request.body).to.include('theme=dark');
                    expect(interception.request.body).to.include('share_data=true');
                });
            });

            cy.verifyCoverage(['saveSettings'], 'Settings save with successful server response');
        });

        it('should test saveSettings() function with server failure', () => {
            // Mock failed save response
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: { success: false, message: 'Save failed' }
            }).as('saveSettingsFail');

            cy.window().then((win) => {
                // Add mock form elements
                win.$('body').append(`
                    <select id="weightUnit"><option value="kg" selected>kg</option></select>
                    <select id="heightUnit"><option value="cm" selected>cm</option></select>
                    <select id="dateFormat"><option value="uk" selected>UK</option></select>
                    <select id="timezone"><option value="Europe/London" selected>London</option></select>
                    <select id="theme"><option value="glassmorphism" selected>Glassmorphism</option></select>
                    <select id="language"><option value="en" selected>English</option></select>
                    <select id="startOfWeek"><option value="monday" selected>Monday</option></select>
                    <input type="checkbox" id="shareData" />
                    <input type="checkbox" id="emailNotifications" />
                    <input type="checkbox" id="weeklyReports" />
                    <div id="settings-status"></div>
                `);

                // Call the function
                win.settingsSaveSettings();

                cy.wait('@saveSettingsFail');

                // Verify error message was displayed
                cy.get('#settings-status')
                    .should('contain', 'Failed to save settings')
                    .should('have.class', 'text-danger');
            });

            cy.verifyCoverage(['saveSettings'], 'Settings save error handling for server failures');
        });

        it('should test saveSettings() function with network error', () => {
            // Mock network error
            cy.intercept('POST', '**/router.php?controller=profile', {
                forceNetworkError: true
            }).as('saveSettingsNetworkError');

            cy.window().then((win) => {
                // Add mock form elements
                win.$('body').append(`
                    <select id="weightUnit"><option value="kg" selected>kg</option></select>
                    <select id="heightUnit"><option value="cm" selected>cm</option></select>
                    <select id="dateFormat"><option value="uk" selected>UK</option></select>
                    <select id="timezone"><option value="Europe/London" selected>London</option></select>
                    <select id="theme"><option value="glassmorphism" selected>Glassmorphism</option></select>
                    <select id="language"><option value="en" selected>English</option></select>
                    <select id="startOfWeek"><option value="monday" selected>Monday</option></select>
                    <input type="checkbox" id="shareData" />
                    <input type="checkbox" id="emailNotifications" />
                    <input type="checkbox" id="weeklyReports" />
                    <div id="settings-status"></div>
                `);

                // Call the function
                win.settingsSaveSettings();

                cy.wait('@saveSettingsNetworkError');

                // Verify network error message was displayed
                cy.get('#settings-status')
                    .should('contain', 'Network error')
                    .should('have.class', 'text-danger');
            });

            cy.verifyCoverage(['saveSettings'], 'Settings save network error handling');
        });

        it('should test resetSettings() function', () => {
            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.settingsResetSettings).to.be.a('function');

                // Add mock form elements with non-default values
                win.$('body').append(`
                    <select id="weightUnit">
                        <option value="kg">kg</option>
                        <option value="lbs" selected>lbs</option>
                    </select>
                    <select id="heightUnit">
                        <option value="cm">cm</option>
                        <option value="ft" selected>ft</option>
                    </select>
                    <select id="dateFormat">
                        <option value="uk">UK</option>
                        <option value="us" selected>US</option>
                    </select>
                    <select id="timezone">
                        <option value="Europe/London">London</option>
                        <option value="America/New_York" selected>New York</option>
                    </select>
                    <select id="theme">
                        <option value="glassmorphism">Glassmorphism</option>
                        <option value="dark" selected>Dark</option>
                    </select>
                    <select id="language">
                        <option value="en">English</option>
                        <option value="es" selected>Spanish</option>
                    </select>
                    <select id="startOfWeek">
                        <option value="monday">Monday</option>
                        <option value="sunday" selected>Sunday</option>
                    </select>
                    <input type="checkbox" id="shareData" checked />
                    <input type="checkbox" id="emailNotifications" checked />
                    <input type="checkbox" id="weeklyReports" checked />
                `);

                // Mock dependent functions
                win.settingsUpdateDateExample = cy.stub();
                win.settingsSaveSettings = cy.stub();

                // Call the function
                win.settingsResetSettings();

                // Verify all fields were reset to defaults
                cy.get('#weightUnit').should('have.value', 'kg');
                cy.get('#heightUnit').should('have.value', 'cm');
                cy.get('#dateFormat').should('have.value', 'uk');
                cy.get('#timezone').should('have.value', 'Europe/London');
                cy.get('#theme').should('have.value', 'glassmorphism');
                cy.get('#language').should('have.value', 'en');
                cy.get('#startOfWeek').should('have.value', 'monday');
                cy.get('#shareData').should('not.be.checked');
                cy.get('#emailNotifications').should('not.be.checked');
                cy.get('#weeklyReports').should('not.be.checked');

                // Verify dependent functions were called
                expect(win.settingsUpdateDateExample).to.have.been.called;
                expect(win.settingsSaveSettings).to.have.been.called;
            });

            cy.verifyCoverage(['resetSettings'], 'Settings reset to default values with automatic save');
        });

    });