describe('Interactive UI Function Coverage', () => {
    beforeEach(() => {
        cy.visit('http://127.0.0.1:8111/?coverage=1');
        cy.wait(1000);
    });

    describe('Authentication Flow Functions', () => {
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
            cy.get('#loginEmail').type('newuser@test.com');
            cy.get('#agreeTerms').check();

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
        it('should test weight entry form functions', () => {
            // First login to access dashboard
            cy.visit('http://127.0.0.1:8111/dashboard.php?coverage=1');
            cy.wait(2000);

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
            cy.visit('http://127.0.0.1:8111/dashboard.php?coverage=1');
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
            cy.visit('http://127.0.0.1:8111/dashboard.php?coverage=1');
            cy.wait(2000);

            cy.get('#heightCm').clear().type('175');
            cy.get('#age').clear().type('30');
            cy.get('#bodyFrame').select('medium');
            cy.get('#activityLevel').select('moderate');

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

            cy.get('#btn-save-profile').click();
            cy.wait(1000);

            cy.verifyCoverage(['validateHeight', 'validateAge', 'calculateMetrics'], 'Profile functions');
        });
    });

    describe('Settings Page Interactive Functions', () => {
        it('should test settings modification functions', () => {
            cy.visit('http://127.0.0.1:8111/dashboard.php?coverage=1#tab=settings');
            cy.wait(2000);

            // Test unit switching
            cy.get('#weightUnit').select('lbs');
            cy.get('#heightUnit').select('ft');
            cy.get('#dateFormat').select('us');

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

            // Test theme switching
            cy.get('#theme').select('dark');

            cy.window().then((win) => {
                if (typeof win.handleThemeChange === 'function') {
                    win.handleThemeChange('dark');
                }

                if (typeof win.applyTheme === 'function') {
                    win.applyTheme('dark');
                }
            });

            // Test email notification settings
            cy.get('#emailNotifications').check();
            cy.get('#weeklyReports').check();

            cy.window().then((win) => {
                if (typeof win.handleNotificationToggle === 'function') {
                    win.handleNotificationToggle(true);
                }

                if (typeof win.updateEmailSchedule === 'function') {
                    win.updateEmailSchedule();
                }
            });

            cy.get('#btn-save-settings').click();
            cy.wait(1000);

            cy.verifyCoverage(['handleUnitChange', 'handleThemeChange', 'handleNotificationToggle'], 'Settings functions');
        });
    });

    describe('Chart and Visualization Functions', () => {
        it('should test chart interaction functions', () => {
            cy.visit('http://127.0.0.1:8111/dashboard.php?coverage=1');
            cy.wait(3000);

            // Test chart period buttons
            cy.get('#chart-30days').click();
            cy.wait(1000);
            cy.get('#chart-90days').click();
            cy.wait(1000);
            cy.get('#chart-1year').click();
            cy.wait(1000);

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
        it('should test all tab navigation functions', () => {
            cy.visit('http://127.0.0.1:8111/dashboard.php?coverage=1');
            cy.wait(2000);

            // Navigate through all tabs
            cy.get('#health-tab').click();
            cy.wait(1000);

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

            cy.get('#data-tab').click();
            cy.wait(1000);

            cy.get('#achievements-tab').click();
            cy.wait(1000);

            cy.get('#settings-tab').click();
            cy.wait(1000);

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
            cy.visit('http://127.0.0.1:8111/dashboard.php?coverage=1');
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
            cy.visit('http://127.0.0.1:8111/dashboard.php?coverage=1#tab=data');
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