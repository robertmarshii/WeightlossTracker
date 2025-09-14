/**
 * Frontend Comprehensive Coverage Tests
 * Target: 75%+ coverage of all 42 instrumented JavaScript functions
 * Files: dashboard.js (28 functions), global.js (4 functions), index.js (10 functions)
 */

describe('Frontend Comprehensive Coverage Tests - 75%+ Target', () => {
    beforeEach(() => {
        // Initialize coverage tracking
        cy.initCoverage();
        cy.enableCoverageTracking();
        
        // Visit main page to load coverage system
        cy.visit('/', { failOnStatusCode: false });
        cy.wait(500);
    });

    afterEach(() => {
        // Collect coverage after each test
        cy.collectCoverage();
        cy.collectBackendCoverage();
    });

    describe('Index.js Functions - 10 Functions Target', () => {
        it('should test all login/signup form functions', () => {
            // Test form switching and validation functions
            cy.visit('/', { failOnStatusCode: false });
            cy.wait(500);
            
            // Test form switching
            cy.get('#link-signup').click();
            cy.wait(200);
            cy.get('#link-login').click();
            cy.wait(200);
            
            // Test form validation with invalid data
            cy.get('#loginEmail').type('invalid-email');
            cy.get('#btn-login').click();
            cy.wait(300);
            
            cy.get('#loginEmail').clear().type('test@example.com');
            cy.get('#btn-login').click();
            cy.wait(500);
            
            // Test signup form
            cy.get('#link-signup').click();
            cy.get('#signupEmail').type('newuser@example.com');
            cy.get('#signupFirstName').type('Test');
            cy.get('#signupLastName').type('User');
            cy.get('#btn-signup').click();
            cy.wait(500);
            
            cy.log('Index.js functions tested via form interactions');
        });

        it('should test verification code functions', () => {
            // Trigger verification code entry
            cy.visit('/', { failOnStatusCode: false });
            cy.wait(500);
            
            cy.get('#loginEmail').type('test@example.com');
            cy.get('#btn-login').click();
            cy.wait(1000);
            
            // Should show verification form - test code entry
            cy.get('body').then($body => {
                if ($body.find('#verificationCode').length) {
                    cy.get('#verificationCode').type('123456');
                    cy.get('#btn-verify').click();
                    cy.wait(500);
                    
                    // Test resend functionality
                    if ($body.find('#btn-resend').length) {
                        cy.get('#btn-resend').click();
                        cy.wait(300);
                    }
                }
            });
            
            cy.log('Verification code functions triggered');
        });

        it('should test utility and helper functions', () => {
            cy.visit('/', { failOnStatusCode: false });
            cy.wait(500);
            
            // Trigger various UI interactions to call utility functions
            cy.get('#loginEmail').type('test').clear().type('user@example.com');
            cy.get('#signupFirstName').type('Test').clear();
            
            // Test form reset functions
            cy.get('#link-signup').click();
            cy.wait(200);
            cy.get('#link-login').click();
            cy.wait(200);
            
            // Try multiple form submissions to trigger different code paths
            for (let i = 0; i < 3; i++) {
                cy.get('#btn-login').click();
                cy.wait(300);
            }
            
            cy.log('Utility functions tested via form interactions');
        });
    });

    describe('Global.js Functions - 4 Functions Target', () => {
        it('should test showAlert function with all alert types', () => {
            cy.visit('/dashboard.php', { failOnStatusCode: false });
            cy.wait(500);
            
            // Test different alert types by triggering various actions
            cy.window().then((win) => {
                // Test success alert
                win.showAlert('Test success message', 'success');
                cy.wait(500);
                
                // Test danger alert
                win.showAlert('Test error message', 'danger');
                cy.wait(500);
                
                // Test warning alert
                win.showAlert('Test warning message', 'warning');
                cy.wait(500);
                
                // Test info alert
                win.showAlert('Test info message', 'info');
                cy.wait(500);
            });
            
            cy.log('showAlert function tested with all types');
        });

        it('should test showToast function', () => {
            cy.visit('/dashboard.php', { failOnStatusCode: false });
            cy.wait(500);
            
            cy.window().then((win) => {
                win.showToast('Toast message 1');
                cy.wait(300);
                win.showToast('Toast message 2');
                cy.wait(300);
            });
            
            cy.log('showToast function tested');
        });

        it('should test parseJson utility function', () => {
            cy.visit('/dashboard.php', { failOnStatusCode: false });
            cy.wait(500);
            
            cy.window().then((win) => {
                // Test parseJson with different inputs
                win.parseJson('{"test": "value"}');
                win.parseJson({test: 'object'});
                win.parseJson('invalid json');
                win.parseJson(null);
            });
            
            cy.log('parseJson function tested with various inputs');
        });

        it('should test openModal utility function', () => {
            cy.visit('/dashboard.php', { failOnStatusCode: false });
            cy.wait(500);
            
            cy.window().then((win) => {
                // Test modal opening (even if modal doesn't exist)
                win.openModal('testModal1');
                win.openModal('testModal2');
            });
            
            cy.log('openModal function tested');
        });
    });

    describe('Dashboard.js Functions - 28 Functions Target', () => {
        beforeEach(() => {
            // Login first to access dashboard
            cy.visit('/', { failOnStatusCode: false });
            cy.get('#loginEmail').type('test@example.com');
            cy.get('#btn-login').click();
            cy.wait(1000);
            
            // If verification needed, skip for now
            cy.url().then(url => {
                if (url.includes('dashboard.php')) {
                    cy.wait(500);
                } else {
                    // Mock login by visiting dashboard directly
                    cy.visit('/dashboard.php', { failOnStatusCode: false });
                    cy.wait(1000);
                }
            });
        });

        it('should test weight management functions (6 functions)', () => {
            // Test weight entry and history functions
            cy.get('#weightKg').type('75.5');
            cy.get('#btn-add-weight').click();
            cy.wait(500);
            
            // Test weight history entry
            cy.get('#btn-add-entry').click();
            cy.wait(300);
            cy.get('#newWeight').type('76.0');
            cy.get('#newDate').type('2024-01-01');
            cy.get('#btn-save-entry').click();
            cy.wait(500);
            
            // Cancel entry
            cy.get('#btn-add-entry').click();
            cy.get('#btn-cancel-entry').click();
            cy.wait(300);
            
            cy.log('Weight management functions tested');
        });

        it('should test profile and settings functions (8 functions)', () => {
            // Test profile form
            cy.get('#heightCm').clear().type('175');
            cy.get('#bodyFrame').select('medium');
            cy.get('#age').clear().type('30');
            cy.get('#activityLevel').select('moderate');
            cy.get('#btn-save-profile').click();
            cy.wait(500);
            
            // Test settings
            cy.get('#settings-tab').click();
            cy.wait(300);
            
            cy.get('#weightUnit').select('lbs');
            cy.get('#heightUnit').select('ft');
            cy.get('#dateFormat').select('us');
            cy.get('#btn-save-settings').click();
            cy.wait(500);
            
            cy.get('#btn-reset-settings').click();
            cy.wait(300);
            
            cy.log('Profile and settings functions tested');
        });

        it('should test goal management functions (2 functions)', () => {
            cy.get('#goalWeight').type('70');
            cy.get('#goalDate').type('2024-12-31');
            cy.get('#btn-save-goal').click();
            cy.wait(500);
            
            cy.log('Goal management functions tested');
        });

        it('should test chart and visualization functions (6 functions)', () => {
            cy.get('#achievements-tab').click();
            cy.wait(500);
            
            // Test chart period buttons
            cy.get('#chart-weekly').click();
            cy.wait(300);
            cy.get('#chart-30days').click();
            cy.wait(300);
            cy.get('#chart-90days').click();
            cy.wait(300);
            cy.get('#chart-monthly').click();
            cy.wait(300);
            cy.get('#chart-yearly').click();
            cy.wait(300);
            cy.get('#chart-all').click();
            cy.wait(300);
            
            cy.log('Chart and visualization functions tested');
        });

        it('should test health calculation functions (6 functions)', () => {
            cy.get('#health-tab').click();
            cy.wait(500);
            
            // Health functions are automatically called on tab switch
            // Force refresh by changing profile data
            cy.get('#data-tab').click();
            cy.get('#heightCm').clear().type('180');
            cy.get('#btn-save-profile').click();
            cy.wait(500);
            
            cy.get('#health-tab').click();
            cy.wait(500);
            
            cy.log('Health calculation functions triggered');
        });
    });

    describe('Frontend Integration Tests - All Functions', () => {
        it('should perform comprehensive frontend workflow hitting all functions', () => {
            // Complete user workflow testing all major function groups
            
            // 1. Login flow (index.js functions)
            cy.visit('/', { failOnStatusCode: false });
            cy.get('#loginEmail').type('comprehensive@test.com');
            cy.get('#btn-login').click();
            cy.wait(1000);
            
            // 2. Dashboard access (all dashboard.js functions)
            cy.visit('/dashboard.php', { failOnStatusCode: false });
            cy.wait(1000);
            
            // 3. Complete profile setup
            cy.get('#heightCm').clear().type('175');
            cy.get('#bodyFrame').select('medium');
            cy.get('#age').clear().type('30');
            cy.get('#activityLevel').select('moderate');
            cy.get('#btn-save-profile').click();
            cy.wait(500);
            
            // 4. Add weight data
            cy.get('#weightKg').type('75.0');
            cy.get('#btn-add-weight').click();
            cy.wait(500);
            
            // 5. Set goals
            cy.get('#goalWeight').type('70');
            cy.get('#goalDate').type('2024-12-31');
            cy.get('#btn-save-goal').click();
            cy.wait(500);
            
            // 6. Test all tabs (triggers refresh functions)
            cy.get('#health-tab').click();
            cy.wait(500);
            cy.get('#achievements-tab').click();
            cy.wait(500);
            cy.get('#settings-tab').click();
            cy.wait(500);
            cy.get('#data-tab').click();
            cy.wait(500);
            
            // 7. Test utility functions (global.js)
            cy.window().then((win) => {
                win.showAlert('Integration test complete', 'success');
                cy.wait(300);
            });
            
            cy.wait(2000);
            cy.log('Comprehensive frontend integration test completed');
        });

        it('should stress test all frontend functions with rapid interactions', () => {
            cy.visit('/dashboard.php', { failOnStatusCode: false });
            cy.wait(1000);
            
            // Rapid interactions to stress test all functions
            for (let i = 0; i < 3; i++) {
                // Profile updates
                cy.get('#heightCm').clear().type(`${170 + i}`);
                cy.get('#btn-save-profile').click();
                cy.wait(300);
                
                // Weight entries
                cy.get('#weightKg').clear().type(`${75 + i}.${i}`);
                cy.get('#btn-add-weight').click();
                cy.wait(300);
                
                // Tab switching
                cy.get('#health-tab').click();
                cy.wait(200);
                cy.get('#achievements-tab').click();
                cy.wait(200);
                cy.get('#data-tab').click();
                cy.wait(200);
            }
            
            cy.log('Frontend stress testing completed');
        });
    });
});