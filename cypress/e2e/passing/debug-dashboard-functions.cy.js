describe('Debug Dashboard Functions', () => {
    before(() => {
        cy.initCoverage();
    });

    beforeEach(() => {
        cy.setCookie('cypress_testing', 'true');
        cy.enableCoverageTracking();
        cy.visit('/');
    });

    it('should directly call dashboard functions to test coverage', () => {
        // First authenticate properly
        cy.get('#loginEmail').type('test@example.com');
        cy.get('#sendLoginCodeBtn').click();
        cy.wait(1000);

        // Mock successful authentication by setting session cookie
        cy.setCookie('user_id', '123');
        cy.setCookie('remember_token', 'test-token');

        // Navigate to dashboard
        cy.visit('/dashboard.php');
        cy.wait(2000); // Give time for scripts to load

        // Test if dashboard functions are available and working
        cy.window().then((win) => {
            console.log('🔍 Checking dashboard function availability...');

            // Check if coverage object exists
            expect(win.coverage).to.exist;
            expect(win.coverage.logFunction).to.be.a('function');

            // Check if global dashboard functions exist
            const dashboardFunctions = [
                'reloadGlobalDashboardData',
                'testConsolidatedDashboardData',
                'refreshLatestWeight',
                'refreshBMI',
                'refreshHealth',
                'loadProfile'
            ];

            let availableFunctions = 0;
            dashboardFunctions.forEach(funcName => {
                if (typeof win[funcName] === 'function') {
                    console.log(`✅ ${funcName} is available`);
                    availableFunctions++;

                    // Try to call the function to trigger coverage
                    try {
                        if (funcName === 'testConsolidatedDashboardData') {
                            win[funcName]();
                        } else if (funcName === 'refreshLatestWeight') {
                            win[funcName]();
                        }
                    } catch (e) {
                        console.log(`⚠️ ${funcName} threw error: ${e.message}`);
                    }
                } else {
                    console.log(`❌ ${funcName} is NOT available (type: ${typeof win[funcName]})`);
                }
            });

            console.log(`📊 Found ${availableFunctions}/${dashboardFunctions.length} dashboard functions`);

            // Force some basic coverage logging
            if (win.coverage) {
                win.coverage.logFunction('debug-test', 'debug-dashboard-functions.cy.js');
                console.log('✅ Manual coverage logging works');
            }
        });

        cy.flushCoverageBeforeNavigation();
    });

    it('should check what JavaScript files are actually loaded', () => {
        cy.visit('/dashboard.php');
        cy.wait(2000);

        cy.window().then((win) => {
            // Check what scripts are loaded
            const scripts = win.document.querySelectorAll('script[src]');
            console.log('📄 Loaded JavaScript files:');
            scripts.forEach((script, i) => {
                console.log(`${i+1}. ${script.src}`);
            });

            // Check if jQuery is available
            console.log(`jQuery available: ${typeof win.$ !== 'undefined'}`);
            console.log(`jQuery.post available: ${typeof win.$.post !== 'undefined'}`);

            // Check for dashboard.js specific functions
            const win_keys = Object.keys(win).filter(key =>
                key.includes('reload') ||
                key.includes('refresh') ||
                key.includes('load') ||
                key.includes('test')
            );
            console.log('🔍 Window functions with dashboard keywords:', win_keys);
        });

        cy.flushCoverageBeforeNavigation();
    });

    after(() => {
        cy.collectCoverage('Debug Dashboard Functions');
        cy.saveCoverageReport();
    });
});