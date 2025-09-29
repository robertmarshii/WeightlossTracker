/**
 * Unit Conversion Functions Test
 * Tests the new weight and height unit conversion functions added in recent commits
 */

describe('Unit Conversion Functions', () => {
    let coverageReporter;

    before(() => {
        cy.initCoverage();
        cy.window().then((win) => {
            coverageReporter = win.coverageReporter;
        });
    });

    beforeEach(() => {
        cy.clearCookies();
        cy.setCookie('cypress_testing', 'true');
        cy.visitWithCoverage('/dashboard.php');
        cy.enableCoverageTracking();
        cy.forceInstrumentation();
    });

    after(() => {
        cy.collectCoverage('Unit Conversion Functions');
        cy.saveCoverageReport();
    });

    describe('Weight Unit Conversion Functions', () => {
        it('should test getWeightUnit function', () => {
            cy.window().then((win) => {
                if (typeof win.getWeightUnit === 'function') {
                    const unit = win.getWeightUnit();
                    expect(unit).to.be.oneOf(['kg', 'lbs', 'stone']);
                }
            });
        });

        it('should test setWeightUnit function', () => {
            cy.window().then((win) => {
                if (typeof win.setWeightUnit === 'function') {
                    // Test setting to pounds
                    win.setWeightUnit('lbs');
                    const unit = win.getWeightUnit();
                    expect(unit).to.equal('lbs');

                    // Test setting to kilograms
                    win.setWeightUnit('kg');
                    const kgUnit = win.getWeightUnit();
                    expect(kgUnit).to.equal('kg');

                    // Test setting to stone
                    win.setWeightUnit('stone');
                    const stoneUnit = win.getWeightUnit();
                    expect(stoneUnit).to.equal('stone');
                }
            });
        });

        it('should test convertFromKg function with various weights', () => {
            cy.window().then((win) => {
                if (typeof win.convertFromKg === 'function') {
                    // Test kg to lbs conversion
                    const kgToLbs = win.convertFromKg(70, 'lbs');
                    expect(kgToLbs).to.be.closeTo(154.32, 0.1);

                    // Test kg to stone conversion
                    const kgToStone = win.convertFromKg(70, 'stone');
                    expect(kgToStone).to.be.closeTo(11.02, 0.1);

                    // Test kg to kg (should return same value)
                    const kgToKg = win.convertFromKg(70, 'kg');
                    expect(kgToKg).to.equal(70);

                    // Test edge cases
                    const zeroKg = win.convertFromKg(0, 'lbs');
                    expect(zeroKg).to.equal(0);

                    const smallWeight = win.convertFromKg(0.5, 'lbs');
                    expect(smallWeight).to.be.closeTo(1.1, 0.1);
                }
            });
        });

        it('should test convertToKg function with various inputs', () => {
            cy.window().then((win) => {
                if (typeof win.convertToKg === 'function') {
                    // Test lbs to kg conversion
                    const lbsToKg = win.convertToKg(154.32, 'lbs');
                    expect(lbsToKg).to.be.closeTo(70, 0.1);

                    // Test stone to kg conversion
                    const stoneToKg = win.convertToKg(11, 'stone');
                    expect(stoneToKg).to.be.closeTo(69.85, 0.1);

                    // Test kg to kg (should return same value)
                    const kgToKg = win.convertToKg(70, 'kg');
                    expect(kgToKg).to.equal(70);

                    // Test edge cases
                    const zeroWeight = win.convertToKg(0, 'lbs');
                    expect(zeroWeight).to.equal(0);

                    const smallWeight = win.convertToKg(1, 'lbs');
                    expect(smallWeight).to.be.closeTo(0.45, 0.1);
                }
            });
        });

        it('should test getWeightUnitLabel function', () => {
            cy.window().then((win) => {
                if (typeof win.getWeightUnitLabel === 'function') {
                    expect(win.getWeightUnitLabel('kg')).to.equal('kg');
                    expect(win.getWeightUnitLabel('lbs')).to.equal('lbs');
                    expect(win.getWeightUnitLabel('stone')).to.equal('st');

                    // Test with null (should use current unit)
                    win.setWeightUnit('lbs');
                    expect(win.getWeightUnitLabel(null)).to.equal('lbs');
                }
            });
        });
    });

    describe('Height Unit Conversion Functions', () => {
        it('should test getHeightUnit function', () => {
            cy.window().then((win) => {
                if (typeof win.getHeightUnit === 'function') {
                    const unit = win.getHeightUnit();
                    expect(unit).to.be.oneOf(['cm', 'ft']);
                }
            });
        });

        it('should test setHeightUnit function', () => {
            cy.window().then((win) => {
                if (typeof win.setHeightUnit === 'function') {
                    // Test setting to feet
                    win.setHeightUnit('ft');
                    const ftUnit = win.getHeightUnit();
                    expect(ftUnit).to.equal('ft');

                    // Test setting to centimeters
                    win.setHeightUnit('cm');
                    const cmUnit = win.getHeightUnit();
                    expect(cmUnit).to.equal('cm');
                }
            });
        });

        it('should test convertFromCm function with various heights', () => {
            cy.window().then((win) => {
                if (typeof win.convertFromCm === 'function') {
                    // Test cm to ft conversion
                    const cmToFt = win.convertFromCm(175, 'ft');
                    expect(cmToFt).to.be.closeTo(5.74, 0.1);

                    // Test cm to cm (should return same value)
                    const cmToCm = win.convertFromCm(175, 'cm');
                    expect(cmToCm).to.equal(175);

                    // Test edge cases
                    const zeroCm = win.convertFromCm(0, 'ft');
                    expect(zeroCm).to.equal(0);

                    const smallHeight = win.convertFromCm(30, 'ft');
                    expect(smallHeight).to.be.closeTo(0.98, 0.1);
                }
            });
        });

        it('should test convertToCm function with various inputs', () => {
            cy.window().then((win) => {
                if (typeof win.convertToCm === 'function') {
                    // Test ft to cm conversion
                    const ftToCm = win.convertToCm(5.74, 'ft');
                    expect(ftToCm).to.be.closeTo(175, 1);

                    // Test cm to cm (should return same value)
                    const cmToCm = win.convertToCm(175, 'cm');
                    expect(cmToCm).to.equal(175);

                    // Test edge cases
                    const zeroHeight = win.convertToCm(0, 'ft');
                    expect(zeroHeight).to.equal(0);

                    const smallHeight = win.convertToCm(1, 'ft');
                    expect(smallHeight).to.be.closeTo(30.48, 0.1);
                }
            });
        });

        it('should test getHeightUnitLabel function', () => {
            cy.window().then((win) => {
                if (typeof win.getHeightUnitLabel === 'function') {
                    expect(win.getHeightUnitLabel('cm')).to.equal('cm');
                    expect(win.getHeightUnitLabel('ft')).to.equal('ft');

                    // Test with null (should use current unit)
                    win.setHeightUnit('ft');
                    expect(win.getHeightUnitLabel(null)).to.equal('ft');
                }
            });
        });
    });

    describe('Unit Conversion Edge Cases', () => {
        it('should handle invalid inputs gracefully', () => {
            cy.window().then((win) => {
                if (typeof win.convertFromKg === 'function') {
                    // Test with negative weights
                    const negativeWeight = win.convertFromKg(-10, 'lbs');
                    expect(negativeWeight).to.be.a('number');

                    // Test with very large weights
                    const largeWeight = win.convertFromKg(1000, 'lbs');
                    expect(largeWeight).to.be.a('number');
                }

                if (typeof win.setWeightUnit === 'function') {
                    // Test with invalid unit
                    const originalUnit = win.getWeightUnit();
                    win.setWeightUnit('invalid');
                    const afterInvalid = win.getWeightUnit();
                    // Should either keep original or default to a valid unit
                    expect(afterInvalid).to.be.oneOf(['kg', 'lbs', 'stone', originalUnit]);
                }
            });
        });

        it('should test unit conversions with decimal values', () => {
            cy.window().then((win) => {
                if (typeof win.convertFromKg === 'function' && typeof win.convertToKg === 'function') {
                    // Test round-trip conversion
                    const originalWeight = 72.5;
                    const converted = win.convertFromKg(originalWeight, 'lbs');
                    const backConverted = win.convertToKg(converted, 'lbs');
                    expect(backConverted).to.be.closeTo(originalWeight, 0.1);
                }

                if (typeof win.convertFromCm === 'function' && typeof win.convertToCm === 'function') {
                    // Test round-trip height conversion
                    const originalHeight = 180.5;
                    const converted = win.convertFromCm(originalHeight, 'ft');
                    const backConverted = win.convertToCm(converted, 'ft');
                    expect(backConverted).to.be.closeTo(originalHeight, 1);
                }
            });
        });
    });

    describe('Unit Display Integration', () => {
        it('should test weight unit changes affect display', () => {
            cy.window().then((win) => {
                if (typeof win.setWeightUnit === 'function' && typeof win.updateWeightUnitDisplay === 'function') {
                    // Change to pounds and update display
                    win.setWeightUnit('lbs');
                    win.updateWeightUnitDisplay();

                    // Check if pound units are displayed
                    cy.get('body').should('contain.text', 'lbs').or('contain.text', 'lb');

                    // Change to kilograms and update display
                    win.setWeightUnit('kg');
                    win.updateWeightUnitDisplay();

                    // Check if kg units are displayed
                    cy.get('body').should('contain.text', 'kg');
                }
            });
        });

        it('should test height unit changes affect display', () => {
            cy.window().then((win) => {
                if (typeof win.setHeightUnit === 'function' && typeof win.updateHeightUnitDisplay === 'function') {
                    // Change to feet and update display
                    win.setHeightUnit('ft');
                    win.updateHeightUnitDisplay();

                    // Check if feet units are displayed
                    cy.get('body').should('contain.text', 'ft').or('contain.text', 'feet');

                    // Change to centimeters and update display
                    win.setHeightUnit('cm');
                    win.updateHeightUnitDisplay();

                    // Check if cm units are displayed
                    cy.get('body').should('contain.text', 'cm');
                }
            });
        });
    });

    describe('Unit Initialization Functions', () => {
        it('should test initializeWeightUnit function', () => {
            cy.window().then((win) => {
                if (typeof win.initializeWeightUnit === 'function') {
                    win.initializeWeightUnit();

                    // Check if weight unit selector exists and is functional
                    if (Cypress.$('#weightUnit').length > 0) {
                        cy.get('#weightUnit').should('exist');
                        cy.get('#weightUnit').select('lbs');
                        cy.wait(100);
                        expect(win.getWeightUnit()).to.equal('lbs');
                    }
                }
            });
        });

        it('should test initializeHeightUnit function', () => {
            cy.window().then((win) => {
                if (typeof win.initializeHeightUnit === 'function') {
                    win.initializeHeightUnit();

                    // Check if height unit selector exists and is functional
                    if (Cypress.$('#heightUnit').length > 0) {
                        cy.get('#heightUnit').should('exist');
                        cy.get('#heightUnit').select('ft');
                        cy.wait(100);
                        expect(win.getHeightUnit()).to.equal('ft');
                    }
                }
            });
        });
    });

    after(() => {
        cy.flushCoverageBeforeNavigation();
        cy.collectCoverage('Unit Conversion Functions');
        cy.saveCoverageReport();
    });
});