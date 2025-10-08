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
    });

    describe('Settings Integration', () => {
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
