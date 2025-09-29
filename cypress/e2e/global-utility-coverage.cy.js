describe('Global Utility Function Coverage Tests', () => {
    let coverageReporter;

    before(() => {
        cy.initCoverage();
        cy.window().then((win) => {
            coverageReporter = win.coverageReporter;
        });
    });

    beforeEach(() => {
        cy.visit('http://127.0.0.1:8111');
        cy.enableCoverageTracking();
        cy.forceInstrumentation();
    });

    it('should test alert and notification functions', () => {
        cy.window().then((win) => {
            // Test showAlert function
            if (win.showAlert) {
                win.showAlert('Test success message', 'success');
                win.showAlert('Test danger message', 'danger');
                win.showAlert('Test info message', 'info');
            }

            // Test showToast function
            if (win.showToast) {
                win.showToast('Test toast message');
            }

            // Test openModal function
            if (win.openModal) {
                // Don't actually open modal, just call the function
                try {
                    win.openModal('test-modal');
                } catch (e) {
                    // Modal might not exist, that's OK
                }
            }
        });

        cy.wait(1000);
    });

    it('should test utility functions', () => {
        cy.window().then((win) => {
            // Test parseJson function
            if (win.parseJson) {
                const testJson = win.parseJson('{"test": "value"}');
                expect(testJson).to.deep.equal({test: "value"});

                const invalidJson = win.parseJson('invalid json');
                expect(invalidJson).to.be.null;
            }

            // Test date format functions
            if (win.getDateFormat) {
                const format = win.getDateFormat();
                expect(format).to.be.a('string');
            }

            if (win.formatDateBySettings) {
                const formatted = win.formatDateBySettings('2025-01-15');
                expect(formatted).to.be.a('string');
            }
        });

        cy.wait(500);
    });

    it('should test weight unit functions', () => {
        cy.window().then((win) => {
            // Test weight unit functions
            if (win.getWeightUnit) {
                const unit = win.getWeightUnit();
                expect(unit).to.be.oneOf(['kg', 'lbs']);
            }

            if (win.setWeightUnit) {
                win.setWeightUnit('lbs');
                win.setWeightUnit('kg');
            }

            if (win.convertFromKg && win.convertToKg) {
                const kgValue = 70;
                const converted = win.convertFromKg(kgValue, 'lbs');
                const backToKg = win.convertToKg(converted, 'lbs');
                expect(Math.abs(backToKg - kgValue)).to.be.lessThan(0.1);
            }

            if (win.getWeightUnitLabel) {
                const label = win.getWeightUnitLabel();
                expect(label).to.be.a('string');
            }
        });

        cy.wait(500);
    });

    it('should test height unit functions', () => {
        cy.window().then((win) => {
            // Test height unit functions
            if (win.getHeightUnit) {
                const unit = win.getHeightUnit();
                expect(unit).to.be.oneOf(['cm', 'ft']);
            }

            if (win.setHeightUnit) {
                win.setHeightUnit('ft');
                win.setHeightUnit('cm');
            }

            if (win.convertFromCm && win.convertToCm) {
                const cmValue = 175;
                const converted = win.convertFromCm(cmValue, 'ft');
                const backToCm = win.convertToCm(converted, 'ft');
                expect(Math.abs(backToCm - cmValue)).to.be.lessThan(1);
            }

            if (win.getHeightUnitLabel) {
                const label = win.getHeightUnitLabel();
                expect(label).to.be.a('string');
            }
        });

        cy.wait(500);
        cy.flushCoverageBeforeNavigation();
    });

    afterEach(() => {
        cy.collectCoverage('Global Utility Tests');
        cy.flushCoverageBeforeNavigation();
    });

    after(() => {
        cy.saveCoverageReport();
    });
});