describe('High Priority Function Coverage Tests', () => {
    beforeEach(() => {
        cy.visit('http://127.0.0.1:8111/dashboard.php?coverage=1');
        cy.wait(2000);
    });

    describe('Core Global Functions', () => {
        it('should test weight and height unit conversion functions', () => {
            cy.window().then((win) => {
                // Test weight conversions
                if (typeof win.convertToKg === 'function') {
                    const result1 = win.convertToKg('154');  // lbs to kg
                    expect(result1).to.be.a('number');

                    const result2 = win.convertToKg('70');   // kg to kg
                    expect(result2).to.be.a('number');
                }

                if (typeof win.convertFromKg === 'function') {
                    const result3 = win.convertFromKg(70);
                    expect(result3).to.be.a('string');
                }

                // Test height conversions
                if (typeof win.convertToCm === 'function') {
                    const result4 = win.convertToCm('5.9');  // ft to cm
                    expect(result4).to.be.a('number');

                    const result5 = win.convertToCm('175');  // cm to cm
                    expect(result5).to.be.a('number');
                }

                if (typeof win.convertFromCm === 'function') {
                    const result6 = win.convertFromCm(175);
                    expect(result6).to.be.a('string');
                }

                // Test unit setters
                if (typeof win.setWeightUnit === 'function') {
                    win.setWeightUnit('lbs');
                    win.setWeightUnit('kg');
                    win.setWeightUnit('st');
                }

                if (typeof win.setHeightUnit === 'function') {
                    win.setHeightUnit('ft');
                    win.setHeightUnit('cm');
                }

                // Test unit label functions
                if (typeof win.getHeightUnit === 'function') {
                    const heightUnit = win.getHeightUnit();
                    expect(heightUnit).to.be.a('string');
                }

                if (typeof win.getHeightUnitLabel === 'function') {
                    const heightLabel = win.getHeightUnitLabel();
                    expect(heightLabel).to.be.a('string');
                }
            });

            cy.verifyCoverage(['convertToKg', 'convertFromKg', 'convertToCm', 'convertFromCm', 'setWeightUnit', 'setHeightUnit'], 'Unit conversion functions');
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
    });

    describe('Dashboard Core Functions', () => {
        it('should test dashboard data management functions', () => {
            cy.window().then((win) => {
                // Test global data reload
                if (typeof win.reloadGlobalDashboardData === 'function') {
                    win.reloadGlobalDashboardData();
                }

                if (typeof win.testConsolidatedDashboardData === 'function') {
                    win.testConsolidatedDashboardData();
                }

                // Test refresh functions
                if (typeof win.refreshLatestWeight === 'function') {
                    win.refreshLatestWeight();
                }

                if (typeof win.refreshHistoricalWeights === 'function') {
                    win.refreshHistoricalWeights();
                }

                if (typeof win.findAndDisplayHistoricalWeights === 'function') {
                    win.findAndDisplayHistoricalWeights();
                }

                if (typeof win.refreshGoal === 'function') {
                    win.refreshGoal();
                }

                if (typeof win.loadProfile === 'function') {
                    win.loadProfile();
                }

                if (typeof win.refreshWeightProgress === 'function') {
                    win.refreshWeightProgress();
                }

                if (typeof win.refreshGallbladderHealth === 'function') {
                    win.refreshGallbladderHealth();
                }

                if (typeof win.refreshPersonalHealthBenefits === 'function') {
                    win.refreshPersonalHealthBenefits();
                }
            });

            cy.verifyCoverage(['reloadGlobalDashboardData', 'testConsolidatedDashboardData', 'refreshLatestWeight', 'refreshGoal'], 'Dashboard data functions');
        });

        it('should test weight display and unit functions', () => {
            cy.window().then((win) => {
                // Test weight unit functions
                if (typeof win.initializeWeightUnit === 'function') {
                    win.initializeWeightUnit();
                }

                if (typeof win.updateWeightUnitDisplay === 'function') {
                    win.updateWeightUnitDisplay();
                }

                if (typeof win.refreshAllWeightDisplays === 'function') {
                    win.refreshAllWeightDisplays();
                }

                // Test height unit functions
                if (typeof win.initializeHeightUnit === 'function') {
                    win.initializeHeightUnit();
                }

                if (typeof win.updateHeightUnitDisplay === 'function') {
                    win.updateHeightUnitDisplay();
                }
            });

            cy.verifyCoverage(['initializeWeightUnit', 'updateWeightUnitDisplay', 'initializeHeightUnit'], 'Weight/height display functions');
        });
    });

    describe('Chart and Theme Functions', () => {
        it('should test chart styling and color functions', () => {
            cy.window().then((win) => {
                // Test chart color functions
                if (typeof win.updateChartThemeColors === 'function') {
                    win.updateChartThemeColors();
                }

                if (typeof win.getChartGridColor === 'function') {
                    const gridColor = win.getChartGridColor();
                    expect(gridColor).to.be.a('string');
                }

                if (typeof win.getChartLineColor === 'function') {
                    const lineColor = win.getChartLineColor();
                    expect(lineColor).to.be.a('string');
                }

                if (typeof win.getChartStyling === 'function') {
                    const styling = win.getChartStyling();
                    expect(styling).to.be.an('object');
                }

                // Test chart reset functions
                if (typeof win.resetToLineChart === 'function') {
                    win.resetToLineChart();
                }

                if (typeof win.resetToBarChart === 'function') {
                    win.resetToBarChart();
                }

                // Test chart initialization
                if (typeof win.initWeightChart === 'function') {
                    win.initWeightChart();
                }

                if (typeof win.updateWeightChart === 'function') {
                    win.updateWeightChart('30days');
                    win.updateWeightChart('90days');
                    win.updateWeightChart('1year');
                }
            });

            cy.verifyCoverage(['getChartGridColor', 'getChartLineColor', 'getChartStyling', 'resetToLineChart'], 'Chart styling functions');
        });

        it('should test chart period and data functions', () => {
            cy.window().then((win) => {
                // Test monthly chart functions
                if (typeof win.updateMonthlyChart === 'function') {
                    win.updateMonthlyChart();
                }

                if (typeof win.updateMonthlyAchievementCards === 'function') {
                    win.updateMonthlyAchievementCards();
                }

                // Test weekly chart functions
                if (typeof win.updateWeeklyChart === 'function') {
                    win.updateWeeklyChart();
                }

                if (typeof win.getWeekNumber === 'function') {
                    const weekNum = win.getWeekNumber(new Date());
                    expect(weekNum).to.be.a('number');
                }

                if (typeof win.updateWeeklyAchievementCards === 'function') {
                    win.updateWeeklyAchievementCards();
                }

                // Test yearly chart functions
                if (typeof win.updateYearlyChart === 'function') {
                    win.updateYearlyChart();
                }

                if (typeof win.updateYearlyAchievementCards === 'function') {
                    win.updateYearlyAchievementCards();
                }
            });

            cy.verifyCoverage(['updateMonthlyChart', 'getWeekNumber', 'updateWeeklyChart', 'updateYearlyChart'], 'Chart period functions');
        });
    });

    describe('Settings and Navigation Functions', () => {
        it('should test settings management functions', () => {
            cy.window().then((win) => {
                // Test settings functions
                if (typeof win.loadSettings === 'function') {
                    win.loadSettings();
                }

                if (typeof win.saveSettings === 'function') {
                    // Mock settings data
                    const mockSettings = {
                        weightUnit: 'kg',
                        heightUnit: 'cm',
                        dateFormat: 'uk',
                        theme: 'glassmorphism',
                        emailNotifications: true
                    };
                    win.saveSettings();
                }

                if (typeof win.resetSettings === 'function') {
                    win.resetSettings();
                }

                if (typeof win.toggleEmailSchedule === 'function') {
                    win.toggleEmailSchedule();
                }

                // Test tab navigation
                if (typeof win.initTabNavigation === 'function') {
                    win.initTabNavigation();
                }
            });

            cy.verifyCoverage(['loadSettings', 'saveSettings', 'resetSettings', 'toggleEmailSchedule', 'initTabNavigation'], 'Settings management functions');
        });
    });

    describe('Data Tab Functions', () => {
        it('should test data management functions', () => {
            cy.window().then((win) => {
                // Test edit and delete functions
                if (typeof win.editWeight === 'function') {
                    win.editWeight(123, '75.5', '2025-01-15');
                }

                if (typeof win.deleteWeight === 'function') {
                    // Mock confirm to return false to avoid actual deletion
                    const originalConfirm = win.confirm;
                    win.confirm = () => false;
                    win.deleteWeight(123);
                    win.confirm = originalConfirm;
                }

                // Test data.js functions
                if (typeof win.dataEditWeight === 'function') {
                    win.dataEditWeight(124, '76.0', '2025-01-16');
                }

                if (typeof win.dataDeleteWeight === 'function') {
                    const originalConfirm = win.confirm;
                    win.confirm = () => false;
                    win.dataDeleteWeight(124);
                    win.confirm = originalConfirm;
                }
            });

            cy.verifyCoverage(['editWeight', 'deleteWeight', 'dataEditWeight', 'dataDeleteWeight'], 'Data management functions');
        });
    });
});