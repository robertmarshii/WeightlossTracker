// E2E test: Login email functionality with sandbox mode testing

describe('Login Email Functionality', () => {
  const base = 'http://127.0.0.1:8111';
  const testEmail = 'robertmarshgb@gmail.com';

  beforeEach(() => {
    // Visit to establish session
    cy.visit(`${base}/index.php`);
    
    // Set cypress_testing cookie to enable SparkPost sandbox mode and disable rate limiting for tests
    cy.setCookie('cypress_testing', 'true');
    
    // Ensure we're in dev schema for testing
    cy.getCookie('PHPSESSID').then((c) => {
      const jar = c ? `PHPSESSID=${c.value}` : undefined;
      cy.request({
        method: 'POST',
        url: `${base}/router.php?controller=schema`,
        body: { action: 'switch', schema: 'wt_dev' },
        headers: jar ? { Cookie: jar } : undefined,
      });
    });
  });

  describe('Cypress Testing Mode Toggle', () => {
    it('should toggle cypress testing mode on and off via cookie', () => {
      // Cookie should already be set by beforeEach
      cy.getCookie('cypress_testing').should('have.property', 'value', 'true');
      
      // Clear the cookie
      cy.clearCookie('cypress_testing');
      cy.getCookie('cypress_testing').should('be.null');
      
      // Set it back to true
      cy.setCookie('cypress_testing', 'true');
      cy.getCookie('cypress_testing').should('have.property', 'value', 'true');
      
      // Test setting to false
      cy.setCookie('cypress_testing', 'false');
      cy.getCookie('cypress_testing').should('have.property', 'value', 'false');
      
      // Set it back to true to restore test state
      cy.setCookie('cypress_testing', 'true');
    });
  });

  describe('Email Sending with Sandbox Mode', () => {
    it('should send login code in sandbox mode without actual email delivery', () => {
      // Cypress testing mode is already enabled via beforeEach (cypress_testing cookie)

      // Intercept login code request
      cy.intercept('POST', '**/login_router.php*').as('loginCode');

      // Fill email and request code
      cy.get('#loginEmail').clear().type(testEmail);
      cy.get('#loginForm').submit();

      // Wait for request and verify response
      cy.wait('@loginCode').then((xhr) => {
        expect(xhr.response.statusCode).to.eq(200);
        const body = typeof xhr.response.body === 'string' ? 
          JSON.parse(xhr.response.body) : xhr.response.body;
        expect(body.success).to.be.true;
        expect(body.message).to.contain('Login code sent successfully');
      });

      // Verify form switched to code entry
      cy.get('#verifyLoginForm').should('be.visible');
      cy.get('#loginForm').should('not.be.visible');

      // Verify success message appears
      cy.get('.alert-success').should('be.visible');
      cy.get('.alert-success').should('contain', 'Login code sent successfully');
      
      // Verify tip message eventually appears
      cy.get('.alert-info', { timeout: 12000 }).should('be.visible');
      cy.get('.alert-info').should('contain', 'subject line');
    });

    it('should send login code in production mode (real email)', () => {
      // Clear cypress_testing cookie to simulate production mode
      cy.clearCookie('cypress_testing');

      // Use a different test email to avoid sending to real email
      const prodTestEmail = 'test@dev.com';

      // Intercept login code request
      cy.intercept('POST', '**/login_router.php*').as('loginCode');

      // Fill email and request code
      cy.get('#loginEmail').clear().type(prodTestEmail);
      cy.get('#loginForm').submit();

      // Wait for request and verify response
      cy.wait('@loginCode').then((xhr) => {
        expect(xhr.response.statusCode).to.eq(200);
        const body = typeof xhr.response.body === 'string' ? 
          JSON.parse(xhr.response.body) : xhr.response.body;
        expect(body.success).to.be.true;
        expect(body.message).to.contain('Login code sent successfully');
      });

      // Verify UI feedback
      cy.get('#verifyLoginForm').should('be.visible');
      cy.get('.alert-success').should('be.visible');
      cy.get('.alert-success').should('contain', 'Login code sent successfully');
      
      // Restore cypress_testing cookie for other tests
      cy.setCookie('cypress_testing', 'true');
    });

    it('should show proper loading states during email sending', () => {
      // Cypress testing mode is already enabled via beforeEach (cypress_testing cookie)

      // Intercept and delay the request to test loading state
      cy.intercept('POST', '**/login_router.php*', (req) => {
        req.reply((res) => {
          // Add delay to see loading state
          return new Promise((resolve) => {
            setTimeout(() => resolve(res), 1000);
          });
        });
      }).as('loginCode');

      // Fill email and request code
      cy.get('#loginEmail').clear().type(testEmail);
      
      // Verify loading message appears immediately
      cy.get('#loginForm').submit();
      cy.get('.alert-info').should('be.visible');
      cy.get('.alert-info').should('contain', 'Sending your login code via email');

      // Wait for completion
      cy.wait('@loginCode');
      
      // Verify success message replaces loading message
      cy.get('.alert-success').should('be.visible');
      cy.get('.alert-success').should('contain', 'Login code sent successfully');
    });
  });

  describe('Email Content Validation', () => {
    it.skip('should generate and log email with code in subject line', () => {
      // Use test@dev.com which we know works
      const logTestEmail = 'test@dev.com';
      
      // Send login code request
      cy.request('POST', `${base}/login_router.php?controller=auth`, {
        action: 'send_login_code',
        email: logTestEmail
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;

        // Read email log to verify content (using absolute path)
        cy.readFile('C:/GitKraken/WeightlossTracker/app/backend/email_log.txt').then((logContent) => {
          expect(logContent).to.contain(logTestEmail);
          expect(logContent).to.contain('Your Weightloss Tracker Login Code:');
          expect(logContent).to.contain('This code will expire in 15 minutes');
          
          // Extract code from subject line (should be 6 digits)
          const subjectMatch = logContent.match(/SUBJECT: Your Weightloss Tracker Login Code: (\d{6})/);
          expect(subjectMatch).to.not.be.null;
          expect(subjectMatch[1]).to.match(/^\d{6}$/);
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', () => {
      // Intercept and fail the request
      cy.intercept('POST', '**/login_router.php*', { forceNetworkError: true }).as('networkError');

      // Fill email and request code
      cy.get('#loginEmail').clear().type(testEmail);
      cy.get('#loginForm').submit();

      // Verify error handling
      cy.get('.alert-danger').should('be.visible');
      cy.get('.alert-danger').should('contain', 'Network error');
    });

    it('should handle server errors gracefully', () => {
      // Intercept and return server error
      cy.intercept('POST', '**/login_router.php*', {
        statusCode: 500,
        body: { success: false, message: 'Server error' }
      }).as('serverError');

      // Fill email and request code
      cy.get('#loginEmail').clear().type(testEmail);
      cy.get('#loginForm').submit();

      // Wait for the request (even though it fails)
      cy.wait('@serverError');

      // Verify error message appears
      cy.get('.alert-danger').should('be.visible');
    });
  });

  after(() => {
    // Cleanup: clear cypress_testing cookie
    cy.clearCookie('cypress_testing');
  });
});