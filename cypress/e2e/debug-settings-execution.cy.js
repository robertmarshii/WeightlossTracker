/**
 * Debug Settings Function Execution
 * Test if settings functions are actually getting called and logged
 */

describe('Debug Settings Function Execution', () => {
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
        cy.forceInstrumentation();
    });

    it('should debug loadSettings function execution step by step', () => {
        cy.window().then((win) => {
            console.log('=== DEBUGGING LOAD SETTINGS EXECUTION ===');

            // Check if coverage object exists
            console.log('1. Coverage object exists:', !!win.coverage);
            console.log('   Coverage enabled:', win.coverage?.enabled);

            // Check if loadSettings function exists
            console.log('2. loadSettings function exists:', typeof win.loadSettings);
            console.log('   Function definition:', win.loadSettings?.toString().substring(0, 100));

            // Check current URL and parameters
            console.log('3. Current URL:', win.location.href);
            console.log('   Has coverage param:', win.location.search.includes('coverage=1'));

            // Get initial coverage report
            let initialReport = null;
            if (win.coverage) {
                initialReport = win.coverage.getReport();
                console.log('4. Initial coverage report:', initialReport);
            }

            // Try to call loadSettings and capture any errors
            console.log('5. Attempting to call loadSettings...');
            try {
                if (typeof win.loadSettings === 'function') {
                    // Add extra logging before the call
                    console.log('   About to call loadSettings...');

                    // Call the function
                    const result = win.loadSettings();
                    console.log('   loadSettings returned:', result);

                    // Wait a moment for async operations
                    cy.wait(500).then(() => {
                        // Get coverage report after call
                        if (win.coverage) {
                            const afterReport = win.coverage.getReport();
                            console.log('6. Coverage report after loadSettings call:', afterReport);

                            // Compare reports
                            const initialCount = Object.keys(initialReport?.functions || {}).length;
                            const afterCount = Object.keys(afterReport?.functions || {}).length;
                            console.log(`   Function count: ${initialCount} → ${afterCount}`);

                            // Log any new functions
                            if (afterReport?.functions) {
                                Object.keys(afterReport.functions).forEach(func => {
                                    if (!initialReport?.functions?.[func]) {
                                        console.log(`   NEW FUNCTION LOGGED: ${func}`);
                                    }
                                });
                            }
                        }
                    });
                } else {
                    console.log('   ERROR: loadSettings function not found or not a function');
                }
            } catch (error) {
                console.log('   ERROR calling loadSettings:', error);
            }
        });
    });

    it('should test if settings functions are loaded from correct files', () => {
        cy.window().then((win) => {
            console.log('=== CHECKING SCRIPT LOADING ===');

            // Check what scripts are loaded
            const scripts = Array.from(win.document.querySelectorAll('script[src]'));
            console.log('Loaded scripts:', scripts.map(s => s.src));

            // Check if settings.js is loaded
            const settingsScript = scripts.find(s => s.src.includes('settings.js'));
            console.log('Settings.js loaded:', !!settingsScript);
            if (settingsScript) {
                console.log('Settings.js URL:', settingsScript.src);
            }

            // Check what functions are available on window
            const windowFunctions = Object.getOwnPropertyNames(win)
                .filter(name => typeof win[name] === 'function' && !name.startsWith('_'))
                .sort();
            console.log('Functions on window:', windowFunctions);

            // Specifically check for settings functions
            const settingsFunctions = [
                'loadSettings', 'saveSettings', 'resetSettings',
                'updateDateExample', 'toggleEmailSchedule',
                'updateThemeOptions', 'loadThemeCSS'
            ];

            console.log('Settings functions availability:');
            settingsFunctions.forEach(func => {
                console.log(`  ${func}: ${typeof win[func]}`);
            });
        });
    });

    it('should manually trigger coverage logging for settings functions', () => {
        cy.window().then((win) => {
            console.log('=== MANUAL COVERAGE TESTING ===');

            if (win.coverage && typeof win.coverage.logFunction === 'function') {
                // Manually log each settings function
                const settingsFunctions = [
                    'loadSettings', 'saveSettings', 'resetSettings',
                    'updateDateExample', 'toggleEmailSchedule',
                    'updateThemeOptions', 'loadThemeCSS'
                ];

                console.log('Manually logging settings functions...');
                settingsFunctions.forEach(func => {
                    win.coverage.logFunction(func, 'settings.js', 1);
                    console.log(`Logged: ${func}`);
                });

                // Get final report
                const finalReport = win.coverage.getReport();
                console.log('Final coverage report:', finalReport);

                // Count settings functions in report
                const loggedFunctions = Object.keys(finalReport?.functions || {});
                const settingsInReport = loggedFunctions.filter(f =>
                    settingsFunctions.some(sf => f.includes(sf))
                );
                console.log('Settings functions in coverage:', settingsInReport);
            } else {
                console.log('Coverage object or logFunction not available');
            }
        });
    });
});