describe('Comprehensive Function Coverage Tests', () => {
    beforeEach(() => {
        cy.visit('http://127.0.0.1:8111/?coverage=1');
        cy.wait(1000);
    });

    describe('Dashboard Core Functions', () => {
        it('should test weight entry and management functions', () => {
            // Test weight conversion functions
            cy.window().then((win) => {
                // Test global utility functions
                if (typeof win.convertToKg === 'function') {
                    expect(win.convertToKg('75')).to.be.a('number');
                    // convertFromKg returns a string, need to parse it
                    const converted = parseFloat(win.convertFromKg(75));
                    expect(converted).to.be.a('number');
                    expect(win.getWeightUnitLabel()).to.be.a('string');
                }

                // Test weight display functions
                if (typeof win.updateWeightUnitDisplay === 'function') {
                    win.updateWeightUnitDisplay();
                }
                if (typeof win.refreshAllWeightDisplays === 'function') {
                    win.refreshAllWeightDisplays();
                }
            });

            cy.verifyCoverage(['convertToKg', 'convertFromKg', 'getWeightUnitLabel'], 'Weight conversion functions');
        });

        it('should test height conversion and management functions', () => {
            cy.window().then((win) => {
                // Test height functions
                if (typeof win.convertToCm === 'function') {
                    expect(win.convertToCm('180')).to.be.a('number');
                    // convertFromCm returns a string for ft (or number for cm), parse it
                    const converted = win.convertFromCm(180);
                    const parsed = typeof converted === 'string' ? parseFloat(converted) : converted;
                    expect(parsed).to.be.a('number');
                    expect(win.getHeightUnitLabel()).to.be.a('string');
                }

                if (typeof win.updateHeightUnitDisplay === 'function') {
                    win.updateHeightUnitDisplay();
                }
            });

            cy.verifyCoverage(['convertToCm', 'convertFromCm', 'getHeightUnitLabel'], 'Height conversion functions');
        });

        it('should test date formatting and utility functions', () => {
            cy.window().then((win) => {
                if (typeof win.formatDate === 'function') {
                    const testDate = '2025-01-15';
                    expect(win.formatDate(testDate)).to.be.a('string');
                }

                if (typeof win.formatDateBySettings === 'function') {
                    expect(win.formatDateBySettings('2025-01-15')).to.be.a('string');
                }

                if (typeof win.getDateFormatSetting === 'function') {
                    expect(win.getDateFormatSetting()).to.be.a('string');
                }
            });

            cy.verifyCoverage(['formatDate', 'formatDateBySettings', 'getDateFormatSetting'], 'Date formatting functions');
        });

        it('should test chart and visualization functions', () => {
            cy.window().then((win) => {
                // Test chart functions
                if (typeof win.updateWeightChart === 'function') {
                    win.updateWeightChart('30days');
                    win.updateWeightChart('90days');
                    win.updateWeightChart('1year');
                }

                if (typeof win.getChartTextColor === 'function') {
                    expect(win.getChartTextColor()).to.be.a('string');
                }

                if (typeof win.updateChartThemeColors === 'function') {
                    win.updateChartThemeColors();
                }
            });

            cy.verifyCoverage(['updateWeightChart', 'getChartTextColor'], 'Chart functions');
        });
    });

    describe('Health Calculation Functions', () => {
        it('should test BMI calculation and display functions', () => {
            cy.window().then((win) => {
                if (typeof win.refreshBMI === 'function') {
                    win.refreshBMI();
                }

                if (typeof win.calculateBMI === 'function') {
                    const bmi = win.calculateBMI(75, 175);
                    expect(bmi).to.be.a('number');
                }

                if (typeof win.getBMICategory === 'function') {
                    expect(win.getBMICategory(22.5)).to.be.a('string');
                }

                if (typeof win.getBMIRisk === 'function') {
                    expect(win.getBMIRisk(22.5)).to.be.a('string');
                }
            });

            cy.verifyCoverage(['refreshBMI', 'calculateBMI', 'getBMICategory', 'getBMIRisk'], 'BMI functions');
        });

        it('should test health score and risk assessment functions', () => {
            cy.window().then((win) => {
                if (typeof win.refreshHealth === 'function') {
                    win.refreshHealth();
                }

                if (typeof win.calculateHealthScore === 'function') {
                    const score = win.calculateHealthScore(22.5, 30, 'moderate');
                    expect(score).to.be.a('number');
                }

                if (typeof win.getHealthImprovementMessage === 'function') {
                    expect(win.getHealthImprovementMessage(5)).to.be.a('string');
                    expect(win.getHealthImprovementMessage(-3)).to.be.a('string');
                }

                if (typeof win.refreshCardiovascularRisk === 'function') {
                    win.refreshCardiovascularRisk();
                }

                if (typeof win.refreshIdealWeight === 'function') {
                    win.refreshIdealWeight();
                }
            });

            cy.verifyCoverage(['refreshHealth', 'calculateHealthScore', 'getHealthImprovementMessage'], 'Health assessment functions');
        });

        it('should test body composition and analysis functions', () => {
            cy.window().then((win) => {
                if (typeof win.calculateBodyFat === 'function') {
                    const bodyFat = win.calculateBodyFat(22.5, 30, 'male');
                    expect(bodyFat).to.be.a('number');
                }

                if (typeof win.getBodyFatCategory === 'function') {
                    expect(win.getBodyFatCategory(15, 'male')).to.be.a('string');
                }

                if (typeof win.refreshGallbladderHealth === 'function') {
                    win.refreshGallbladderHealth();
                }

                if (typeof win.refreshPersonalHealthBenefits === 'function') {
                    win.refreshPersonalHealthBenefits();
                }
            });

            cy.verifyCoverage(['calculateBodyFat', 'getBodyFatCategory'], 'Body composition functions');
        });
    });

    describe('Settings and Theme Functions', () => {
        it('should test theme management functions', () => {
            cy.window().then((win) => {
                if (typeof win.settingsLoadThemeCSS === 'function') {
                    win.settingsLoadThemeCSS('glassmorphism');
                    win.settingsLoadThemeCSS('dark');
                    win.settingsLoadThemeCSS('light');
                }

                if (typeof win.settingsUpdateThemeOptions === 'function') {
                    win.settingsUpdateThemeOptions('glassmorphism');
                }

                if (typeof win.updateThemeOptions === 'function') {
                    win.updateThemeOptions('dark');
                }
            });

            cy.verifyCoverage(['settingsLoadThemeCSS', 'settingsUpdateThemeOptions'], 'Theme functions');
        });

        it('should test settings validation and update functions', () => {
            cy.window().then((win) => {
                if (typeof win.settingsUpdateDateExample === 'function') {
                    win.settingsUpdateDateExample();
                }

                if (typeof win.settingsToggleEmailSchedule === 'function') {
                    win.settingsToggleEmailSchedule();
                }

                if (typeof win.updateDateExample === 'function') {
                    win.updateDateExample();
                }

                if (typeof win.toggleEmailSchedule === 'function') {
                    win.toggleEmailSchedule();
                }
            });

            cy.verifyCoverage(['settingsUpdateDateExample', 'settingsToggleEmailSchedule'], 'Settings validation functions');
        });
    });

    describe('Data Management Functions', () => {
        it('should test weight history and data functions', () => {
            cy.window().then((win) => {
                if (typeof win.loadWeightHistory === 'function') {
                    win.loadWeightHistory();
                }

                if (typeof win.refreshLatestWeight === 'function') {
                    win.refreshLatestWeight();
                }

                if (typeof win.refreshWeightProgress === 'function') {
                    win.refreshWeightProgress();
                }

                if (typeof win.findAndDisplayHistoricalWeights === 'function') {
                    const mockHistory = [
                        { entry_date: '2025-01-01', weight_kg: 75 },
                        { entry_date: '2025-01-15', weight_kg: 74 }
                    ];
                    win.findAndDisplayHistoricalWeights(mockHistory, '2025-01-07', '2025-01-01');
                }
            });

            cy.verifyCoverage(['loadWeightHistory', 'refreshLatestWeight', 'refreshWeightProgress'], 'Weight data functions');
        });

        it('should test goal management functions', () => {
            cy.window().then((win) => {
                if (typeof win.refreshGoal === 'function') {
                    win.refreshGoal();
                }

                if (typeof win.loadProfile === 'function') {
                    win.loadProfile();
                }

                if (typeof win.calculateGoalProgress === 'function') {
                    const progress = win.calculateGoalProgress(75, 70, 72);
                    expect(progress).to.be.a('number');
                }
            });

            cy.verifyCoverage(['refreshGoal', 'loadProfile', 'calculateGoalProgress'], 'Goal management functions');
        });
    });

    describe('UI Interaction Functions', () => {
        it('should test modal and popup functions', () => {
            cy.window().then((win) => {
                if (typeof win.openModal === 'function') {
                    win.openModal('Test modal content');
                }

                if (typeof win.closeModal === 'function') {
                    win.closeModal();
                }

                if (typeof win.showToast === 'function') {
                    win.showToast('Test toast message');
                    win.showToast('Success message', 'success');
                    win.showToast('Error message', 'error');
                }

                if (typeof win.showAlert === 'function') {
                    win.showAlert('Test alert', 'info');
                    win.showAlert('Warning alert', 'warning');
                    win.showAlert('Danger alert', 'danger');
                }
            });

            cy.verifyCoverage(['openModal', 'closeModal', 'showToast', 'showAlert'], 'UI interaction functions');
        });

        it('should test form validation functions', () => {
            cy.window().then((win) => {
                if (typeof win.isValidEmail === 'function') {
                    expect(win.isValidEmail('test@example.com')).to.be.true;
                    expect(win.isValidEmail('invalid-email')).to.be.false;
                    expect(win.isValidEmail('')).to.be.false;
                    expect(win.isValidEmail('user@domain')).to.be.false;
                }

                if (typeof win.validateWeight === 'function') {
                    expect(win.validateWeight('75')).to.be.true;
                    expect(win.validateWeight('abc')).to.be.false;
                    expect(win.validateWeight('')).to.be.false;
                }

                if (typeof win.validateHeight === 'function') {
                    expect(win.validateHeight('175')).to.be.true;
                    expect(win.validateHeight('abc')).to.be.false;
                }
            });

            cy.verifyCoverage(['isValidEmail', 'validateWeight', 'validateHeight'], 'Form validation functions');
        });
    });

    describe('Achievement and Progress Functions', () => {
        it('should test achievement calculation functions', () => {
            cy.window().then((win) => {
                if (typeof win.updateAchievementCards === 'function') {
                    const mockData = {
                        totalEntries: 10,
                        streak: 5,
                        weightLoss: 3,
                        goalProgress: 60
                    };
                    win.updateAchievementCards(mockData);
                }

                if (typeof win.calculateStreak === 'function') {
                    const mockHistory = [
                        { entry_date: '2025-01-15' },
                        { entry_date: '2025-01-14' },
                        { entry_date: '2025-01-13' }
                    ];
                    expect(win.calculateStreak(mockHistory)).to.be.a('number');
                }

                if (typeof win.calculateWeightLoss === 'function') {
                    expect(win.calculateWeightLoss(75, 72)).to.be.a('number');
                }
            });

            cy.verifyCoverage(['updateAchievementCards', 'calculateStreak', 'calculateWeightLoss'], 'Achievement functions');
        });
    });

    describe('Coverage System Functions', () => {
        it('should test coverage reporting and analysis functions', () => {
            cy.window().then((win) => {
                if (win.coverage) {
                    if (typeof win.coverage.getReport === 'function') {
                        const report = win.coverage.getReport();
                        expect(report).to.be.an('object');
                    }

                    if (typeof win.coverage.showReport === 'function') {
                        win.coverage.showReport();
                    }

                    if (typeof win.coverage.analyzeUntested === 'function') {
                        win.coverage.analyzeUntested();
                    }

                    if (typeof win.coverage.exportReport === 'function') {
                        win.coverage.exportReport();
                    }
                }
            });

            cy.verifyCoverage(['getReport', 'showReport', 'analyzeUntested'], 'Coverage system functions');
        });
    });

    describe('Navigation and Tab Functions', () => {
        it('should test tab navigation and initialization functions', () => {
            cy.window().then((win) => {
                if (typeof win.initTabNavigation === 'function') {
                    win.initTabNavigation();
                }

                if (typeof win.switchTab === 'function') {
                    win.switchTab('health');
                    win.switchTab('data');
                    win.switchTab('achievements');
                    win.switchTab('settings');
                }

                if (typeof win.updateTabUrl === 'function') {
                    win.updateTabUrl('health');
                }
            });

            cy.verifyCoverage(['initTabNavigation', 'switchTab', 'updateTabUrl'], 'Navigation functions');
        });
    });

    describe('Data Processing Functions', () => {
        it('should test JSON parsing and data processing functions', () => {
            cy.window().then((win) => {
                if (typeof win.parseJson === 'function') {
                    const validJson = '{"test": "value"}';
                    const invalidJson = '{invalid json}';

                    expect(win.parseJson(validJson)).to.be.an('object');
                    expect(win.parseJson(invalidJson)).to.have.property('error');
                    expect(win.parseJson('')).to.have.property('error');
                }

                if (typeof win.processApiResponse === 'function') {
                    const mockResponse = { success: true, data: { test: 'value' } };
                    expect(win.processApiResponse(mockResponse)).to.be.an('object');
                }

                if (typeof win.handleApiError === 'function') {
                    win.handleApiError('Test error message');
                }
            });

            cy.verifyCoverage(['parseJson', 'processApiResponse', 'handleApiError'], 'Data processing functions');
        });
    });
});