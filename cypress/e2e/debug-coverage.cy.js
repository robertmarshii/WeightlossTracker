/**
 * Debug Coverage System Test
 * Check if coverage tracking is working properly
 */

describe('Debug Coverage System', () => {
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

        cy.visitWithCoverage('/dashboard.php');
        cy.enableCoverageTracking();
    });

    it('should check if coverage object exists and functions are instrumented', () => {
        cy.window().then((win) => {
            // Check if coverage object exists
            debugLog('Coverage object:', win.coverage);
            debugLog('CoverageLogger class:', win.CoverageLogger);

            // Check if settings functions exist
            debugLog('loadSettings function:', win.loadSettings);
            debugLog('saveSettings function:', win.saveSettings);

            // Check URL parameters
            debugLog('Current URL:', win.location.href);
            debugLog('URL params:', new URLSearchParams(win.location.search));

            // Try to call a settings function and see if it logs
            if (typeof win.loadSettings === 'function') {
                debugLog('Calling loadSettings...');
                win.loadSettings();

                // Check if coverage was logged
                if (win.coverage) {
                    const report = win.coverage.getReport();
                    debugLog('Coverage report after loadSettings:', report);
                }
            } else {
                debugLog('loadSettings function not found!');
            }

            // Check if other functions exist
            debugLog('Available functions on window:', Object.getOwnPropertyNames(win).filter(name => typeof win[name] === 'function'));
        });
    });

    it('should manually test coverage logging', () => {
        cy.window().then((win) => {
            // Manually create coverage logger if needed
            if (!win.coverage && win.CoverageLogger) {
                debugLog('Creating coverage logger manually...');
                win.coverage = new win.CoverageLogger();
                debugLog('Created coverage logger:', win.coverage);
            }

            // Test manual logging
            if (win.coverage && typeof win.coverage.logFunction === 'function') {
                debugLog('Testing manual coverage logging...');
                win.coverage.logFunction('test_function', 'debug.js', 1);

                const report = win.coverage.getReport();
                debugLog('Coverage report after manual log:', report);
            }
        });
    });
});