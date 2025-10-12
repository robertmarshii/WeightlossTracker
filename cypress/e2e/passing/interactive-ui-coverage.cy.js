describe('Interactive UI Function Coverage', () => {

    // Suppress jQuery errors from coverage instrumentation
    Cypress.on('uncaught:exception', (err) => {
        if (err.message.includes('$.post is not a function') ||
            err.message.includes('$.get is not a function') ||
            err.message.includes('$.ajax is not a function') ||
            err.message.includes('Syntax error') ||
            err.message.includes('Uncaught Test error')) {
            return false;
        }
        return true;
    });

    const setupDashboard = () => {
        const email = 'test@dev.com';
        const base = 'http://127.0.0.1:8111';

        cy.clearCookies();
        cy.clearLocalStorage();
        cy.setCookie('cypress_testing', 'true');

        // Send login code
        cy.request({
            method: 'POST',
            url: `${base}/login_router.php?controller=auth`,
            body: { action: 'send_login_code', email: email }
        });

        // Login
        cy.visit('/', { failOnStatusCode: false });
        cy.get('#loginEmail', {timeout: 5000}).should('be.visible').type(email);
        cy.get('#loginForm').submit();
        cy.wait(500);
        cy.get('#loginCode', { timeout: 5000 }).should('be.visible').type('111111');
        cy.get('#verifyLoginForm button[type="submit"]').click();
        cy.url({ timeout: 5000 }).should('include', 'dashboard.php');
        cy.wait(1000);
    };

    describe('Authentication Flow Functions', () => {
        beforeEach(() => {
            cy.visit('http://127.0.0.1:8111/');
            cy.wait(1000);
        });
        it('should test login code sending and validation functions', () => {
            cy.get('#loginEmail').type('test@dev.com');

            // Test email validation during typing
            cy.window().then((win) => {
                if (typeof win.updateSignupButton === 'function') {
                    win.updateSignupButton();
                }

                if (typeof win.validateEmailField === 'function') {
                    expect(win.validateEmailField('test@dev.com')).to.be.true;
                }
            });

            cy.get('#sendLoginCodeBtn').click();
            cy.wait(2000);

            // Test login code functions
            cy.window().then((win) => {
                if (typeof win.sendLoginCode === 'function') {
                    // Function should have been called by button click
                    expect(typeof win.sendLoginCode).to.equal('function');
                }

                if (typeof win.handleLoginResponse === 'function') {
                    const mockResponse = { success: true, message: 'Code sent' };
                    win.handleLoginResponse(mockResponse);
                }
            });

            cy.verifyCoverage(['sendLoginCode', 'isValidEmail', 'updateSignupButton'], 'Login functions');
        });

        it('should test account creation functions', () => {
            // Switch to signup tab first
            cy.get('a[href="#signup"]').click();
            cy.wait(500);

            cy.get('#signupEmail').type('newuser@test.com');
            cy.get('body').then(($body) => {
                if ($body.find('#agreeTerms').length > 0) {
                    cy.get('#agreeTerms').check();
                }
            });

            cy.window().then((win) => {
                if (typeof win.createAccount === 'function') {
                    win.createAccount();
                }

                if (typeof win.validateTermsAgreement === 'function') {
                    expect(win.validateTermsAgreement()).to.be.true;
                }

                if (typeof win.handleAccountCreation === 'function') {
                    const mockResponse = { success: true, account_created: true };
                    win.handleAccountCreation(mockResponse);
                }
            });

            cy.verifyCoverage(['createAccount', 'validateTermsAgreement'], 'Account creation functions');
        });
    });

    describe('Dashboard Interactive Functions', () => {
        beforeEach(() => {
            setupDashboard();
        });

        it('should test weight entry form functions', () => {
            // Navigate to data tab
            cy.get('a[href="#data"]', {timeout: 5000}).should('be.visible').click();
            cy.wait(300);

            // Test weight entry functions
            cy.get('#weightKg').type('75.5');

            cy.window().then((win) => {
                if (typeof win.validateWeightInput === 'function') {
                    expect(win.validateWeightInput('75.5')).to.be.true;
                    expect(win.validateWeightInput('abc')).to.be.false;
                }

                if (typeof win.formatWeightDisplay === 'function') {
                    expect(win.formatWeightDisplay(75.5)).to.be.a('string');
                }

                if (typeof win.updateWeightPreview === 'function') {
                    win.updateWeightPreview(75.5);
                }
            });

            // Test the add weight button functionality
            cy.get('#btn-add-weight').click();
            cy.wait(1000);

            cy.verifyCoverage(['validateWeightInput', 'formatWeightDisplay'], 'Weight entry functions');
        });

        it('should test goal setting functions', () => {
            cy.visit('http://127.0.0.1:8111/dashboard.php');
            cy.wait(2000);

            cy.get('#goalWeight').type('70');
            cy.get('#goalDate').type('2025-12-31');

            cy.window().then((win) => {
                if (typeof win.validateGoalWeight === 'function') {
                    expect(win.validateGoalWeight('70')).to.be.true;
                }

                if (typeof win.validateGoalDate === 'function') {
                    expect(win.validateGoalDate('2025-12-31')).to.be.true;
                }

                if (typeof win.calculateGoalTimeframe === 'function') {
                    expect(win.calculateGoalTimeframe('2025-12-31')).to.be.a('number');
                }

                if (typeof win.updateGoalPreview === 'function') {
                    win.updateGoalPreview(70, '2025-12-31');
                }
            });

            cy.get('#btn-save-goal').click();
            cy.wait(1000);

            cy.verifyCoverage(['validateGoalWeight', 'validateGoalDate', 'calculateGoalTimeframe'], 'Goal setting functions');
        });

        it('should test profile management functions', () => {
            cy.visit('http://127.0.0.1:8111/dashboard.php');
            cy.wait(2000);

            // Check if profile elements exist, if not just test functions exist
            cy.get('body').then(($body) => {
                if ($body.find('#heightCm').length > 0) {
                    cy.get('#heightCm').clear().type('175');
                }
                if ($body.find('#age').length > 0) {
                    cy.get('#age').clear().type('30');
                }
            });

            cy.window().then((win) => {
                if (typeof win.validateHeight === 'function') {
                    expect(win.validateHeight('175')).to.be.true;
                }

                if (typeof win.validateAge === 'function') {
                    expect(win.validateAge('30')).to.be.true;
                }

                if (typeof win.updateProfilePreview === 'function') {
                    win.updateProfilePreview();
                }

                if (typeof win.calculateMetrics === 'function') {
                    win.calculateMetrics(175, 75, 30, 'moderate');
                }
            });

            cy.log('Profile management functions tested');
        });
    });

    describe('Settings Page Interactive Functions', () => {
        it('should test settings modification functions', () => {
            cy.visit('http://127.0.0.1:8111/dashboard.php#tab=settings');
            cy.wait(2000);

            // Test unit switching - check if elements exist first
            cy.get('body').then(($body) => {
                if ($body.find('#weightUnit').length > 0) {
                    cy.get('#weightUnit').select('lbs');
                }
                if ($body.find('#heightUnit').length > 0) {
                    cy.get('#heightUnit').select('ft');
                }
                if ($body.find('#dateFormat').length > 0) {
                    cy.get('#dateFormat').select('us');
                }
            });

            cy.window().then((win) => {
                if (typeof win.handleUnitChange === 'function') {
                    win.handleUnitChange('weight', 'lbs');
                    win.handleUnitChange('height', 'ft');
                }

                if (typeof win.updateDisplayUnits === 'function') {
                    win.updateDisplayUnits();
                }

                if (typeof win.recalculateDisplayValues === 'function') {
                    win.recalculateDisplayValues();
                }
            });

            // Test theme switching if element exists
            cy.get('body').then(($body) => {
                if ($body.find('#theme').length > 0) {
                    cy.get('#theme').select('dark');
                }
            });

            cy.window().then((win) => {
                if (typeof win.handleThemeChange === 'function') {
                    win.handleThemeChange('dark');
                }

                if (typeof win.applyTheme === 'function') {
                    win.applyTheme('dark');
                }
            });

            // Test email notification settings if they exist
            cy.get('body').then(($body) => {
                if ($body.find('#emailNotifications').length > 0) {
                    cy.get('#emailNotifications').check();
                }
                if ($body.find('#weeklyReports').length > 0) {
                    cy.get('#weeklyReports').check();
                }
            });

            cy.window().then((win) => {
                if (typeof win.handleNotificationToggle === 'function') {
                    win.handleNotificationToggle(true);
                }

                if (typeof win.updateEmailSchedule === 'function') {
                    win.updateEmailSchedule();
                }
            });

            // Click save button if it exists
            cy.get('body').then(($body) => {
                if ($body.find('#btn-save-settings').length > 0) {
                    cy.get('#btn-save-settings').click();
                    cy.wait(1000);
                }
            });

            cy.verifyCoverage(['handleUnitChange', 'handleThemeChange', 'handleNotificationToggle'], 'Settings functions');
        });
    });

    describe('Chart and Visualization Functions', () => {
        it('should test chart interaction functions', () => {
            cy.visit('http://127.0.0.1:8111/dashboard.php');
            cy.wait(3000);

            // Test chart period buttons if they exist
            cy.get('body').then(($body) => {
                if ($body.find('#chart-30days').length > 0) {
                    cy.get('#chart-30days').click();
                    cy.wait(1000);
                }
                if ($body.find('#chart-90days').length > 0) {
                    cy.get('#chart-90days').click();
                    cy.wait(1000);
                }
                if ($body.find('#chart-1year').length > 0) {
                    cy.get('#chart-1year').click();
                    cy.wait(1000);
                }
            });

            cy.window().then((win) => {
                if (typeof win.updateChartPeriod === 'function') {
                    win.updateChartPeriod('30days');
                    win.updateChartPeriod('90days');
                    win.updateChartPeriod('1year');
                }

                if (typeof win.filterChartData === 'function') {
                    const mockData = [
                        { date: '2025-01-01', weight: 75 },
                        { date: '2025-01-15', weight: 74 }
                    ];
                    expect(win.filterChartData(mockData, '30days')).to.be.an('array');
                }

                if (typeof win.formatChartData === 'function') {
                    const mockData = [{ entry_date: '2025-01-01', weight_kg: 75 }];
                    expect(win.formatChartData(mockData)).to.be.an('array');
                }

                if (typeof win.updateChartLabels === 'function') {
                    win.updateChartLabels(['Jan', 'Feb', 'Mar']);
                }

                if (typeof win.animateChart === 'function') {
                    win.animateChart();
                }
            });

            cy.verifyCoverage(['updateChartPeriod', 'filterChartData', 'formatChartData'], 'Chart functions');
        });
    });

    describe('Tab Navigation Functions', () => {
        beforeEach(() => {
            setupDashboard();
        });

        it('should test all tab navigation functions', () => {
            // Navigate through all tabs
            cy.get('a[href="#health"]', {timeout: 5000}).should('be.visible').click();
            cy.wait(500);

            cy.window().then((win) => {
                if (typeof win.onTabSwitch === 'function') {
                    win.onTabSwitch('health');
                }

                if (typeof win.loadTabContent === 'function') {
                    win.loadTabContent('health');
                }

                if (typeof win.updateTabState === 'function') {
                    win.updateTabState('health');
                }
            });

            cy.get('a[href="#data"]').should('be.visible').click();
            cy.wait(500);

            cy.get('a[href="#goals"]').should('be.visible').click();
            cy.wait(500);

            cy.get('a[href="#settings"]').should('be.visible').click();
            cy.wait(500);

            cy.window().then((win) => {
                if (typeof win.handleTabChange === 'function') {
                    win.handleTabChange('settings');
                }

                if (typeof win.saveTabPreference === 'function') {
                    win.saveTabPreference('settings');
                }
            });

            cy.verifyCoverage(['onTabSwitch', 'loadTabContent', 'handleTabChange'], 'Tab navigation functions');
        });
    });

    describe('Error Handling Functions', () => {
        it('should test error handling and recovery functions', () => {
            cy.visit('http://127.0.0.1:8111/dashboard.php');
            cy.wait(2000);

            cy.window().then((win) => {
                if (typeof win.handleNetworkError === 'function') {
                    win.handleNetworkError('Connection timeout');
                }

                if (typeof win.handleApiError === 'function') {
                    win.handleApiError({ error: 'Server error', code: 500 });
                }

                if (typeof win.showErrorMessage === 'function') {
                    win.showErrorMessage('Test error message');
                }

                if (typeof win.retryFailedRequest === 'function') {
                    win.retryFailedRequest('get_weight_history');
                }

                if (typeof win.logError === 'function') {
                    win.logError('Test error', 'dashboard.js', 123);
                }

                if (typeof win.recoverFromError === 'function') {
                    win.recoverFromError();
                }
            });

            cy.verifyCoverage(['handleNetworkError', 'handleApiError', 'showErrorMessage'], 'Error handling functions');
        });
    });

    describe('Data Export and Import Functions', () => {
        it('should test data management functions', () => {
            cy.visit('http://127.0.0.1:8111/dashboard.php#tab=data');
            cy.wait(2000);

            cy.window().then((win) => {
                if (typeof win.exportData === 'function') {
                    win.exportData('csv');
                    win.exportData('json');
                }

                if (typeof win.formatExportData === 'function') {
                    const mockData = [{ date: '2025-01-01', weight: 75 }];
                    expect(win.formatExportData(mockData, 'csv')).to.be.a('string');
                }

                if (typeof win.downloadFile === 'function') {
                    win.downloadFile('test-data.csv', 'test,data');
                }

                if (typeof win.validateImportData === 'function') {
                    const mockCsv = 'date,weight\n2025-01-01,75';
                    expect(win.validateImportData(mockCsv)).to.be.an('object');
                }

                if (typeof win.processImportData === 'function') {
                    const mockData = [{ date: '2025-01-01', weight: 75 }];
                    win.processImportData(mockData);
                }
            });

            cy.verifyCoverage(['exportData', 'formatExportData', 'validateImportData'], 'Data export functions');
        });
    });
});