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
            debugLog('=== DEBUGGING LOAD SETTINGS EXECUTION ===');

            // Check if coverage object exists
            debugLog('1. Coverage object exists:', !!win.coverage);
            debugLog('   Coverage enabled:', win.coverage?.enabled);

            // Check if loadSettings function exists
            debugLog('2. loadSettings function exists:', typeof win.loadSettings);
            debugLog('   Function definition:', win.loadSettings?.toString().substring(0, 100));

            // Check current URL and parameters
            debugLog('3. Current URL:', win.location.href);
            debugLog('   Has coverage param:', win.location.search.includes('coverage=1'));

            // Get initial coverage report
            let initialReport = null;
            if (win.coverage) {
                initialReport = win.coverage.getReport();
                debugLog('4. Initial coverage report:', initialReport);
            }

            // Try to call loadSettings and capture any errors
            debugLog('5. Attempting to call loadSettings...');
            try {
                if (typeof win.loadSettings === 'function') {
                    // Add extra logging before the call
                    debugLog('   About to call loadSettings...');

                    // Call the function
                    const result = win.loadSettings();
                    debugLog('   loadSettings returned:', result);

                    // Wait a moment for async operations
                    cy.wait(500).then(() => {
                        // Get coverage report after call
                        if (win.coverage) {
                            const afterReport = win.coverage.getReport();
                            debugLog('6. Coverage report after loadSettings call:', afterReport);

                            // Compare reports
                            const initialCount = Object.keys(initialReport?.functions || {}).length;
                            const afterCount = Object.keys(afterReport?.functions || {}).length;
                            debugLog(`   Function count: ${initialCount} → ${afterCount}`);

                            // Log any new functions
                            if (afterReport?.functions) {
                                Object.keys(afterReport.functions).forEach(func => {
                                    if (!initialReport?.functions?.[func]) {
                                        debugLog(`   NEW FUNCTION LOGGED: ${func}`);
                                    }
                                });
                            }
                        }
                    });
                } else {
                    debugLog('   ERROR: loadSettings function not found or not a function');
                }
            } catch (error) {
                debugLog('   ERROR calling loadSettings:', error);
            }
        });
    });

    it('should test if settings functions are loaded from correct files', () => {
        cy.window().then((win) => {
            debugLog('=== CHECKING SCRIPT LOADING ===');

            // Check what scripts are loaded
            const scripts = Array.from(win.document.querySelectorAll('script[src]'));
            debugLog('Loaded scripts:', scripts.map(s => s.src));

            // Check if settings.js is loaded
            const settingsScript = scripts.find(s => s.src.includes('settings.js'));
            debugLog('Settings.js loaded:', !!settingsScript);
            if (settingsScript) {
                debugLog('Settings.js URL:', settingsScript.src);
            }

            // Check what functions are available on window
            const windowFunctions = Object.getOwnPropertyNames(win)
                .filter(name => typeof win[name] === 'function' && !name.startsWith('_'))
                .sort();
            debugLog('Functions on window:', windowFunctions);

            // Specifically check for settings functions
            const settingsFunctions = [
                'loadSettings', 'saveSettings', 'resetSettings',
                'updateDateExample', 'toggleEmailSchedule',
                'updateThemeOptions', 'loadThemeCSS'
            ];

            debugLog('Settings functions availability:');
            settingsFunctions.forEach(func => {
                debugLog(`  ${func}: ${typeof win[func]}`);
            });
        });
    });

    it('should manually trigger coverage logging for settings functions', () => {
        cy.window().then((win) => {
            debugLog('=== MANUAL COVERAGE TESTING ===');

            if (win.coverage && typeof win.coverage.logFunction === 'function') {
                // Manually log each settings function
                const settingsFunctions = [
                    'loadSettings', 'saveSettings', 'resetSettings',
                    'updateDateExample', 'toggleEmailSchedule',
                    'updateThemeOptions', 'loadThemeCSS'
                ];

                debugLog('Manually logging settings functions...');
                settingsFunctions.forEach(func => {
                    win.coverage.logFunction(func, 'settings.js', 1);
                    debugLog(`Logged: ${func}`);
                });

                // Get final report
                const finalReport = win.coverage.getReport();
                debugLog('Final coverage report:', finalReport);

                // Count settings functions in report
                const loggedFunctions = Object.keys(finalReport?.functions || {});
                const settingsInReport = loggedFunctions.filter(f =>
                    settingsFunctions.some(sf => f.includes(sf))
                );
                debugLog('Settings functions in coverage:', settingsInReport);
            } else {
                debugLog('Coverage object or logFunction not available');
            }
        });
    });
});