/**
 * Date Formatting Comprehensive Test
 * Tests the new universal date formatting system including:
 * - formatAllTimestamps() function
 * - formatDateBySettings() function
 * - Euro format (dots) support
 * - Dynamic date format updates
 * - Timestamp-based date display system
 */

describe('Date Formatting Comprehensive', () => {
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

        // Login first to access dashboard
        cy.request({
            method: 'POST',
            url: '/login_router.php?controller=auth&coverage=1',
            form: true,
            body: {
                action: 'send_login_code',
                email: 'test@dev.com'
            }
        }).then(() => {
            cy.request({
                method: 'POST',
                url: '/login_router.php?controller=auth&coverage=1',
                form: true,
                body: {
                    action: 'verify_login_code',
                    email: 'test@dev.com',
                    code: '111111'
                }
            });
        });

        cy.visitWithCoverage('/dashboard.php');
        cy.enableCoverageTracking();
        cy.forceInstrumentation();
    });

    after(() => {
        cy.flushCoverageBeforeNavigation();
        cy.collectCoverage('Date Formatting Comprehensive');
        cy.saveCoverageReport();
    });

    describe('formatDateBySettings() Function', () => {
        it('should format dates in UK format (dd/mm/yyyy)', () => {
            cy.window().then((win) => {
                // Ensure globalDashboardData exists
                if (!win.globalDashboardData) {
                    win.globalDashboardData = { settings: {} };
                }
                // Set UK format
                win.globalDashboardData.settings.date_format = 'uk';

                const result = win.formatDateBySettings('2025-09-19');
                expect(result).to.equal('19/09/2025');
            });
        });

        it('should format dates in US format (mm/dd/yyyy)', () => {
            cy.window().then((win) => {
                if (!win.globalDashboardData) {
                    win.globalDashboardData = { settings: {} };
                }
                win.globalDashboardData.settings.date_format = 'us';

                const result = win.formatDateBySettings('2025-09-19');
                expect(result).to.equal('09/19/2025');
            });
        });

        it('should format dates in Euro format (dd.mm.yyyy)', () => {
            cy.window().then((win) => {
                if (!win.globalDashboardData) {
                    win.globalDashboardData = { settings: {} };
                }
                win.globalDashboardData.settings.date_format = 'euro';

                const result = win.formatDateBySettings('2025-09-19');
                expect(result).to.equal('19.09.2025');
            });
        });

        it('should format dates in ISO format (yyyy-mm-dd)', () => {
            cy.window().then((win) => {
                if (!win.globalDashboardData) {
                    win.globalDashboardData = { settings: {} };
                }
                win.globalDashboardData.settings.date_format = 'iso';

                const result = win.formatDateBySettings('2025-09-19');
                expect(result).to.equal('2025-09-19');
            });
        });

        it('should handle invalid dates gracefully', () => {
            cy.window().then((win) => {
                const result = win.formatDateBySettings('invalid-date');
                // Should return original input if invalid
                expect(result).to.equal('invalid-date');
            });
        });
    });

    describe('formatAllTimestamps() Function', () => {
        it('should exist and be callable', () => {
            cy.wait(3000); // Wait for dashboard.js to load
            cy.window().then((win) => {
                expect(win.formatAllTimestamps).to.be.a('function');
            });
        });
    });



    describe('Chart Date Labels', () => {
        it('should format dates in weight chart', () => {
            cy.wait(3000);
            cy.window().then((win) => {
                if (!win.globalDashboardData) {
                    win.globalDashboardData = { settings: {} };
                }
                win.globalDashboardData.settings.date_format = 'euro';

                // Update weight chart
                if (typeof win.updateWeightChart === 'function') {
                    win.updateWeightChart('all');
                }
            });

            cy.wait(2000);

            // Check if chart exists and has labels
            cy.window().then((win) => {
                if (win.weightChart && win.weightChart.data.labels) {
                    const labels = win.weightChart.data.labels;
                    if (labels.length > 0) {
                        // At least one label should have dots (Euro format)
                        const hasEuroFormat = labels.some(label => /\d{2}\.\d{2}\.\d{4}/.test(label));
                        expect(hasEuroFormat).to.be.true;
                    }
                }
            });
        });
    });


    describe('Edge Cases', () => {
        it('should handle missing timestamps gracefully', () => {
            cy.wait(3000);
            cy.window().then((win) => {
                // Create element with no timestamp
                const $el = Cypress.$('<span class="format-date"></span>').appendTo('body');

                // Should not throw error
                expect(() => win.formatAllTimestamps()).to.not.throw();

                // Clean up
                $el.remove();
            });
        });

        it('should handle invalid timestamp values', () => {
            cy.wait(3000);
            cy.window().then((win) => {
                // Create element with invalid timestamp
                const $el = Cypress.$('<span class="format-date" data-timestamp="invalid"></span>').appendTo('body');

                // Should not throw error
                expect(() => win.formatAllTimestamps()).to.not.throw();

                // Clean up
                $el.remove();
            });
        });

        it('should handle zero timestamp', () => {
            cy.wait(3000);
            cy.window().then((win) => {
                // Create element with zero timestamp
                const $el = Cypress.$('<span class="format-date" data-timestamp="0"></span>').appendTo('body');

                // Should not throw error
                expect(() => win.formatAllTimestamps()).to.not.throw();

                // Clean up
                $el.remove();
            });
        });
    });

    describe('Coverage Verification', () => {
        it('should call formatDateBySettings from multiple places', () => {
            cy.wait(3000);
            cy.window().then((win) => {
                if (!win.globalDashboardData) {
                    win.globalDashboardData = { settings: {} };
                }
                win.globalDashboardData.settings.date_format = 'euro';

                // Test from formatAllTimestamps
                win.formatAllTimestamps();

                // Test from refreshLatestWeight
                if (typeof win.refreshLatestWeight === 'function') {
                    win.refreshLatestWeight();
                }

                // Test from refreshGoal
                if (typeof win.refreshGoal === 'function') {
                    win.refreshGoal();
                }

                cy.wait(1000);

                // Verify coverage was logged
                cy.assertFunctionTested('formatDateBySettings');
                cy.assertFunctionTested('formatAllTimestamps');
            });
        });
    });
});
