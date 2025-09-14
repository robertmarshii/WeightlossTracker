/**
 * Complete Authentication Flow Tests
 * Tests all authentication-related functions with coverage verification
 */

describe('Authentication Complete Coverage', () => {
    beforeEach(() => {
        // Reset database and start fresh
        cy.request('POST', `${Cypress.env('baseUrl') || 'http://127.0.0.1:8111'}/router.php?controller=seeder`, { 
            action: 'reset_schema', 
            schema: 'wt_test' 
        });
        
        // Enable coverage tracking
        cy.initCoverage();
        
        // Visit the index page
        cy.visit('/');
    });

    /**
     * COVERAGE: This test covers the following functions:
     * - isValidEmail - Email format validation
     * - showAlert - Error message display for invalid email
     * 
     * Test Purpose: Validate email input validation
     * Functions Expected: 2
     * Last Updated: 2025-09-14
     */
    it('should validate email formats and show appropriate alerts', () => {
        const expectedFunctions = ['isValidEmail', 'showAlert'];
        
        // Test invalid email
        cy.get('#email').type('invalid-email');
        cy.get('form').submit();
        
        // Should show error alert
        cy.get('#alert-container').should('be.visible');
        cy.get('#alert-container .alert-danger').should('contain', 'valid email');
        
        // Clear and test valid email
        cy.get('#email').clear().type('test@example.com');
        cy.get('form').submit();
        
        // Verify coverage
        cy.verifyCoverage(expectedFunctions, 'Email Validation Test');
    });

    /**
     * COVERAGE: This test covers the following functions:
     * - isValidEmail - Email format validation  
     * - sendLoginCode - Send login verification code
     * - showAlert - Success message display
     * - parseJson - API response parsing
     * 
     * Test Purpose: Complete login code request flow
     * Functions Expected: 4
     * Last Updated: 2025-09-14
     */
    it('should request login code for valid email', () => {
        const expectedFunctions = ['isValidEmail', 'sendLoginCode', 'showAlert', 'parseJson'];
        
        // Setup API intercept to mock successful response
        cy.intercept('POST', '**/login_router.php*', {
            statusCode: 200,
            body: { 
                success: true, 
                message: 'Login code sent successfully' 
            }
        }).as('sendLoginCode');
        
        // Enter valid email and submit
        cy.get('#email').type('test@example.com');
        cy.get('form').submit();
        
        // Wait for API call
        cy.wait('@sendLoginCode');
        
        // Should show success message
        cy.get('#alert-container .alert-success').should('contain', 'sent');
        
        // Should show code verification form
        cy.get('#code-verification-form').should('be.visible');
        
        // Verify coverage
        cy.verifyCoverage(expectedFunctions, 'Login Code Request Test');
    });

    /**
     * COVERAGE: This test covers the following functions:
     * - verifyLoginCode - Verify login code input
     * - parseJson - API response parsing
     * - showAlert - Success message display or error handling
     * 
     * Test Purpose: Login code verification flow
     * Functions Expected: 3
     * Last Updated: 2025-09-14
     */
    it('should verify login code and redirect to dashboard', () => {
        const expectedFunctions = ['verifyLoginCode', 'parseJson', 'showAlert'];
        
        // First request login code
        cy.intercept('POST', '**/login_router.php*', (req) => {
            if (req.body.action === 'send_login_code') {
                req.reply({
                    statusCode: 200,
                    body: { success: true, message: 'Login code sent' }
                });
            } else if (req.body.action === 'verify_login') {
                req.reply({
                    statusCode: 200,
                    body: { success: true, message: 'Login successful', redirect: '/dashboard.php' }
                });
            }
        }).as('authRequest');
        
        // Request login code first
        cy.get('#email').type('test@example.com');
        cy.get('form').submit();
        cy.wait('@authRequest');
        
        // Enter verification code
        cy.get('#code-input').type('123456');
        cy.get('#verify-code-btn').click();
        cy.wait('@authRequest');
        
        // Should redirect to dashboard (or show success)
        cy.url().should('include', 'dashboard.php');
        
        // Verify coverage
        cy.verifyCoverage(expectedFunctions, 'Login Code Verification Test');
    });

    /**
     * COVERAGE: This test covers the following functions:
     * - createAccount - Account creation process
     * - isValidEmail - Email validation for signup
     * - parseJson - API response parsing
     * - showAlert - Success/error message display
     * 
     * Test Purpose: Account creation flow
     * Functions Expected: 4
     * Last Updated: 2025-09-14
     */
    it('should create new account successfully', () => {
        const expectedFunctions = ['createAccount', 'isValidEmail', 'parseJson', 'showAlert'];
        
        // Setup API intercept for account creation
        cy.intercept('POST', '**/login_router.php*', (req) => {
            if (req.body.action === 'create_account') {
                req.reply({
                    statusCode: 200,
                    body: { success: true, message: 'Account created successfully' }
                });
            }
        }).as('createAccount');
        
        // Switch to signup mode
        cy.get('#signup-toggle').click();
        
        // Enter email and create account
        cy.get('#email').type('newuser@example.com');
        cy.get('form').submit();
        
        // Wait for API call
        cy.wait('@createAccount');
        
        // Should show success message
        cy.get('#alert-container .alert-success').should('contain', 'created');
        
        // Should show verification form
        cy.get('#code-verification-form').should('be.visible');
        
        // Verify coverage
        cy.verifyCoverage(expectedFunctions, 'Account Creation Test');
    });

    /**
     * COVERAGE: This test covers the following functions:
     * - parseJson - Handle API error responses
     * - showAlert - Display error messages
     * - sendLoginCode - Handle rate limiting
     * 
     * Test Purpose: Error handling and rate limiting
     * Functions Expected: 3
     * Last Updated: 2025-09-14
     */
    it('should handle errors and rate limiting gracefully', () => {
        const expectedFunctions = ['parseJson', 'showAlert', 'sendLoginCode'];
        
        // Setup API intercept for rate limiting error
        cy.intercept('POST', '**/login_router.php*', {
            statusCode: 429,
            body: { 
                success: false, 
                message: 'Too many requests. Please wait before trying again.' 
            }
        }).as('rateLimitError');
        
        // Try to send login code
        cy.get('#email').type('test@example.com');
        cy.get('form').submit();
        
        // Wait for API call
        cy.wait('@rateLimitError');
        
        // Should show rate limit error
        cy.get('#alert-container .alert-danger').should('contain', 'Too many requests');
        
        // Verify coverage  
        cy.verifyCoverage(expectedFunctions, 'Error Handling Test');
    });

    /**
     * COVERAGE: This test covers the following functions:
     * - backToEmailLogin - Return to login form
     * - backToEmailSignup - Return to signup form
     * 
     * Test Purpose: Navigation between forms
     * Functions Expected: 2  
     * Last Updated: 2025-09-14
     */
    it('should navigate between login and signup forms', () => {
        const expectedFunctions = ['backToEmailLogin', 'backToEmailSignup'];
        
        // First trigger the code verification view
        cy.intercept('POST', '**/login_router.php*', {
            statusCode: 200,
            body: { success: true, message: 'Code sent' }
        }).as('mockRequest');
        
        cy.get('#email').type('test@example.com');
        cy.get('form').submit();
        cy.wait('@mockRequest');
        
        // Should show code verification form
        cy.get('#code-verification-form').should('be.visible');
        
        // Click back to login
        cy.get('#back-to-login').click();
        
        // Should show login form again
        cy.get('#email-login-form').should('be.visible');
        cy.get('#code-verification-form').should('not.be.visible');
        
        // Switch to signup and repeat
        cy.get('#signup-toggle').click();
        cy.get('#email').type('test2@example.com');
        cy.get('form').submit();
        cy.wait('@mockRequest');
        
        // Click back to signup
        cy.get('#back-to-signup').click();
        
        // Should show signup form
        cy.get('#email-signup-form').should('be.visible');
        
        // Verify coverage
        cy.verifyCoverage(expectedFunctions, 'Form Navigation Test');
    });

    afterEach(() => {
        // Save coverage data after each test
        cy.saveCoverageReport();
    });
});