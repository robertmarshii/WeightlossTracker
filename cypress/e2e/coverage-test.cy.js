describe('Enhanced Coverage Test', () => {
    beforeEach(() => {
        cy.visit('http://127.0.0.1:8111');
        cy.enableCoverageTracking();
        cy.forceInstrumentation();
    });

    it('should capture function calls during authentication flow', () => {
        // Type in email field to trigger updateSignupButton
        cy.get('#signupEmail').type('test@example.com');

        // Check terms to trigger updateSignupButton again
        cy.get('#agreeTerms').check();

        // Try to submit signup form to trigger createAccount
        cy.get('#signupForm').submit();

        // Wait for any async operations
        cy.wait(1000);

        // Check what functions were captured
        cy.window().then((win) => {
            if (win.coverage) {
                const report = win.coverage.getReport();
                console.log('📊 Coverage Report:', report);
                console.log(`✅ Functions tracked: ${report.totalFunctions}`);

                // Show detailed report
                win.coverage.showReport();

                // Save to localStorage for analysis
                localStorage.setItem('testCoverage', JSON.stringify(report));
            } else {
                console.error('❌ Coverage logger not found');
            }
        });
    });

    it('should capture dashboard functions', () => {
        // First login to get to dashboard
        cy.get('#loginEmail').type('test@example.com');
        cy.get('#sendLoginCodeBtn').click();

        // Wait and check for any function calls
        cy.wait(2000);

        cy.window().then((win) => {
            if (win.coverage) {
                const report = win.coverage.getReport();
                console.log('📊 Dashboard Coverage:', report);

                // Try to manually call some dashboard functions if they exist
                const testFunctions = ['loadProfile', 'refreshLatestWeight', 'showAlert'];
                testFunctions.forEach(funcName => {
                    if (typeof win[funcName] === 'function') {
                        console.log(`✅ Found function: ${funcName}`);
                        try {
                            // Don't actually call them, just log that they exist
                        } catch (e) {
                            console.log(`❌ Error with ${funcName}:`, e);
                        }
                    } else {
                        console.log(`❌ Missing function: ${funcName}`);
                    }
                });
            }
        });
    });

    afterEach(() => {
        cy.collectCoverage();
    });
});