/**
 * Navigation Coverage Test
 * Demonstrates proper coverage flushing before page navigation
 */

describe('Navigation Coverage Test', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.setCookie('cypress_testing', 'true');

        // Login first
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
    });

    it('should properly flush coverage when navigating between pages', () => {
        // Start on index page (login page)
        cy.visitWithCoverage('/index.php');
        cy.enableCoverageTracking();

        cy.window().then((win) => {
            // Call some index.js functions to generate coverage data
            if (typeof win.isValidEmail === 'function') {
                win.isValidEmail('test@example.com');
                debugLog('Called isValidEmail on index page');
            }
        });

        // CRITICAL: Flush coverage before navigating away
        cy.flushCoverageBeforeNavigation();

        // Navigate to dashboard
        cy.visitWithCoverage('/dashboard.php');
        cy.enableCoverageTracking();

        cy.window().then((win) => {
            // Call some dashboard functions
            if (typeof win.loadSettings === 'function') {
                win.loadSettings();
                debugLog('Called loadSettings on dashboard page');
            }

            if (typeof win.getWeightUnit === 'function') {
                const unit = win.getWeightUnit();
                debugLog('Called getWeightUnit, result:', unit);
            }
        });

        // Flush before final navigation
        cy.flushCoverageBeforeNavigation();

        // Final collection
        cy.collectCoverage('Navigation Coverage Test');
    });

    it('should demonstrate multiple page navigation with coverage', () => {
        // Visit index
        cy.visitWithCoverage('/index.php');
        cy.enableCoverageTracking();

        // Generate some coverage on index
        cy.window().then((win) => {
            if (typeof win.sendLoginCode === 'function') {
                // Don't actually call this as it makes real requests
                debugLog('sendLoginCode function exists on index page');
            }
        });

        // Flush and move to dashboard
        cy.flushCoverageBeforeNavigation();
        cy.visitWithCoverage('/dashboard.php');
        cy.enableCoverageTracking();

        // Generate coverage on dashboard
        cy.window().then((win) => {
            if (typeof win.showAlert === 'function') {
                win.showAlert('Test message', 'info');
                debugLog('Called showAlert on dashboard');
            }

            if (typeof win.parseJson === 'function') {
                const result = win.parseJson('{"test": true}');
                debugLog('Called parseJson, result:', result);
            }
        });

        // Final flush and collection
        cy.flushCoverageBeforeNavigation();
        cy.collectCoverage('Multiple Navigation Test');
    });

    after(() => {
        cy.saveCoverageReport();
    });
});