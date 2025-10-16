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
            console.log('Coverage object:', win.coverage);
            console.log('CoverageLogger class:', win.CoverageLogger);

            // Check if settings functions exist
            console.log('loadSettings function:', win.loadSettings);
            console.log('saveSettings function:', win.saveSettings);

            // Check URL parameters
            console.log('Current URL:', win.location.href);
            console.log('URL params:', new URLSearchParams(win.location.search));

            // Try to call a settings function and see if it logs
            if (typeof win.loadSettings === 'function') {
                console.log('Calling loadSettings...');
                win.loadSettings();

                // Check if coverage was logged
                if (win.coverage) {
                    const report = win.coverage.getReport();
                    console.log('Coverage report after loadSettings:', report);
                }
            } else {
                console.log('loadSettings function not found!');
            }

            // Check if other functions exist
            console.log('Available functions on window:', Object.getOwnPropertyNames(win).filter(name => typeof win[name] === 'function'));
        });
    });

    it('should manually test coverage logging', () => {
        cy.window().then((win) => {
            // Manually create coverage logger if needed
            if (!win.coverage && win.CoverageLogger) {
                console.log('Creating coverage logger manually...');
                win.coverage = new win.CoverageLogger();
                console.log('Created coverage logger:', win.coverage);
            }

            // Test manual logging
            if (win.coverage && typeof win.coverage.logFunction === 'function') {
                console.log('Testing manual coverage logging...');
                win.coverage.logFunction('test_function', 'debug.js', 1);

                const report = win.coverage.getReport();
                console.log('Coverage report after manual log:', report);
            }
        });
    });
});