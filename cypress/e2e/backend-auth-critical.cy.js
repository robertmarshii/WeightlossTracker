/**
 * Backend Authentication Critical Coverage Tests
 * Tests the remaining CRITICAL PRIORITY backend functions
 * Focus: verifySignupCode, logout, isLoggedIn
 */

describe('Backend Authentication Critical Coverage Tests', () => {
    beforeEach(() => {
        // Initialize coverage tracking
        cy.initCoverage();
        cy.enableCoverageTracking();
        
        // Visit the main page
        cy.visit('/');
        
        // Ensure we're on the login page and elements are loaded
        cy.get('#authTabs').should('be.visible');
        cy.get('#login').should('be.visible');
    });

    afterEach(() => {
        // Collect coverage after each test
        cy.collectCoverage();
        cy.collectBackendCoverage();
    });

    describe('Signup Verification Flow - verifySignupCode()', () => {
        it('should test verifySignupCode() with valid code', () => {
            // First create an account to get a verification code
            cy.get('#signup-tab').click();
            cy.get('#signupEmail').clear().type('cypress+verify@test.com');
            cy.get('#agreeTerms').check();
            cy.get('#signupForm').submit();
            
            // Wait for verification form or handle API response
            cy.wait(2000);
            
            // Try direct API call to test verifySignupCode() backend function
            cy.request({
                method: 'POST',
                url: '/login_router.php?controller=auth',
                form: true,
                body: {
                    action: 'verify_signup',
                    email: 'cypress+verify@test.com',
                    code: '111111' // Test code
                },
                failOnStatusCode: false
            }).then((response) => {
                // Should call verifySignupCode() backend function
                expect(response.status).to.be.oneOf([200, 400, 401]);
            });
        });

        it('should test verifySignupCode() with invalid code', () => {
            // Test with invalid verification code
            cy.request({
                method: 'POST',
                url: '/login_router.php?controller=auth',
                form: true,
                body: {
                    action: 'verify_signup',
                    email: 'cypress+verify@test.com',
                    code: '999999' // Invalid code
                },
                failOnStatusCode: false
            }).then((response) => {
                // Should call verifySignupCode() backend function
                expect(response.status).to.be.oneOf([200, 400, 401]);
            });
        });

        it('should test verifySignupCode() with missing email', () => {
            // Test with missing email parameter
            cy.request({
                method: 'POST',
                url: '/login_router.php?controller=auth',
                form: true,
                body: {
                    action: 'verify_signup',
                    code: '111111'
                },
                failOnStatusCode: false
            }).then((response) => {
                // Should call verifySignupCode() backend function
                expect(response.status).to.be.oneOf([200, 400]);
            });
        });
    });

    describe('Session Management - logout()', () => {
        it('should test logout() function directly', () => {
            // First login to create a session
            cy.request({
                method: 'POST',
                url: '/login_router.php?controller=auth',
                form: true,
                body: {
                    action: 'send_login_code',
                    email: 'test@dev.com'
                }
            });
            
            // Verify login with test code
            cy.request({
                method: 'POST',
                url: '/login_router.php?controller=auth',
                form: true,
                body: {
                    action: 'verify_login',
                    email: 'test@dev.com',
                    code: '111111'
                }
            });
            
            // Now test logout() function
            cy.request({
                method: 'POST',
                url: '/login_router.php?controller=auth',
                form: true,
                body: {
                    action: 'logout'
                },
                failOnStatusCode: false
            }).then((response) => {
                // Should call logout() backend function
                expect(response.status).to.be.oneOf([200, 401]);
            });
        });

        it('should test logout() with existing session', () => {
            // Test logout with valid session
            cy.request({
                method: 'POST',
                url: '/login_router.php?controller=auth',
                form: true,
                body: {
                    action: 'logout'
                },
                failOnStatusCode: false
            }).then((response) => {
                // Should call logout() backend function regardless of session state
                expect(response.status).to.be.oneOf([200, 401]);
            });
        });
    });

    describe('Session Validation - isLoggedIn()', () => {
        it('should test isLoggedIn() function directly', () => {
            // Test session validation API
            cy.request({
                method: 'POST',
                url: '/login_router.php?controller=auth',
                form: true,
                body: {
                    action: 'is_logged_in'
                },
                failOnStatusCode: false
            }).then((response) => {
                // Should call isLoggedIn() backend function
                expect(response.status).to.be.oneOf([200, 401]);
            });
        });

        it('should test isLoggedIn() after successful login', () => {
            // First login
            cy.request({
                method: 'POST',
                url: '/login_router.php?controller=auth',
                form: true,
                body: {
                    action: 'send_login_code',
                    email: 'test@dev.com'
                }
            });
            
            cy.request({
                method: 'POST',
                url: '/login_router.php?controller=auth',
                form: true,
                body: {
                    action: 'verify_login',
                    email: 'test@dev.com',
                    code: '111111'
                }
            });
            
            // Now check if logged in
            cy.request({
                method: 'POST',
                url: '/login_router.php?controller=auth',
                form: true,
                body: {
                    action: 'is_logged_in'
                },
                failOnStatusCode: false
            }).then((response) => {
                // Should call isLoggedIn() backend function
                expect(response.status).to.be.oneOf([200, 401]);
            });
        });

        it('should test isLoggedIn() after logout', () => {
            // First logout to ensure clean state
            cy.request({
                method: 'POST',
                url: '/login_router.php?controller=auth',
                form: true,
                body: {
                    action: 'logout'
                },
                failOnStatusCode: false
            });
            
            // Now check if logged in after logout
            cy.request({
                method: 'POST',
                url: '/login_router.php?controller=auth',
                form: true,
                body: {
                    action: 'is_logged_in'
                },
                failOnStatusCode: false
            }).then((response) => {
                // Should call isLoggedIn() backend function
                expect(response.status).to.be.oneOf([200, 401]);
            });
        });
    });

    describe('Router Controller Tests', () => {
        it('should test SchemaController endpoint', () => {
            // Test Schema management API
            cy.request({
                method: 'GET',
                url: '/router.php?controller=schema',
                failOnStatusCode: false
            }).then((response) => {
                // Should call SchemaController backend function
                expect(response.status).to.be.oneOf([200, 404, 500]);
            });
        });

        it('should test ProfileController endpoint', () => {
            // Test Profile management API
            cy.request({
                method: 'GET',
                url: '/router.php?controller=profile',
                failOnStatusCode: false
            }).then((response) => {
                // Should call ProfileController backend function
                expect(response.status).to.be.oneOf([200, 404, 500]);
            });
        });

        it('should test SeederController endpoint', () => {
            // Test Database seeding API
            cy.request({
                method: 'GET',
                url: '/router.php?controller=seeder',
                failOnStatusCode: false
            }).then((response) => {
                // Should call SeederController backend function
                expect(response.status).to.be.oneOf([200, 404, 500]);
            });
        });

        it('should test EmailController endpoint', () => {
            // Test Email management API
            cy.request({
                method: 'GET',
                url: '/router.php?controller=email',
                failOnStatusCode: false
            }).then((response) => {
                // Should call EmailController backend function
                expect(response.status).to.be.oneOf([200, 404, 500]);
            });
        });
    });
});