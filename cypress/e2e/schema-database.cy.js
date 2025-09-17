describe('Schema and Database Management Tests', () => {
  // Comprehensive test suite combining:
  // - schema.cy.js (1 test - basic schema switching API)
  // - schema-switching.cy.js (8 tests - schema switcher UI and validation)

  const base = 'http://127.0.0.1:8111';
  const schemas = ['wt_test', 'wt_dev', 'wt_live'];
    const email = 'test@dev.com'; // Use correct test email
  let originalSchema;

   // Helper function to login and get to dashboard
    const loginToDashboard = () => {
        // Clear any existing session cookies first
        cy.clearCookies();
        cy.clearLocalStorage();

        // Set cypress_testing cookie to disable rate limiting
        cy.setCookie('cypress_testing', 'true');

        // Send login code via API first
        cy.request({
            method: 'POST',
            url: `${base}/login_router.php?controller=auth`,
            body: { action: 'send_login_code', email: email }
        });

        cy.visit('/', { failOnStatusCode: false });
        cy.get('#loginEmail').type(email);
        cy.get('#loginForm').submit();
        cy.wait(1000);
        cy.get('#loginCode', { timeout: 10000 }).should('be.visible').type('111111');
        cy.get('#verifyLoginForm button[type="submit"]').click();
        cy.url({ timeout: 8000 }).should('include', 'dashboard.php');
        cy.wait(1500);
    };

  before(() => {
    // Store original schema to restore after tests
    cy.request({ method: 'POST', url: '/router.php?controller=schema', form: true, body: { action: 'get' } })
      .then((resp) => {
        const data = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
        originalSchema = data.schema;
      });
  });

  beforeEach(() => {
    // Set cypress_testing cookie to disable rate limiting for tests
    cy.setCookie('cypress_testing', 'true');

    // Clear any existing rate limits for test email
    cy.request({
      method: 'POST',
      url: `${base}/router.php?controller=email`,
      body: {
        action: 'clear_rate_limits',
        email: 'test@dev.com'
      },
      failOnStatusCode: false
    });
  });

  after(() => {
    // Restore original schema
    if (originalSchema) {
      cy.request({ method: 'POST', url: '/router.php?controller=schema', form: true, body: {
        action: 'switch',
        schema: originalSchema
      }});
    }
  });

  describe('Schema API Service Tests', () => {
    // Tests merged from: schema.cy.js
    // Basic API schema switching functionality

    it('switches schemas via API calls', () => {
      // Original test from schema.cy.js - basic schema switching
      const testSchemas = ['wt_test', 'wt_dev']; // Original subset
      testSchemas.forEach((schema) => {
        cy.request({ method: 'POST', url: `${base}/router.php?controller=schema`, form: true, body: { action: 'switch', schema } })
          .its('status').should('eq', 200);
        cy.request({ method: 'POST', url: `${base}/router.php?controller=schema`, form: true, body: { action: 'get' } })
          .its('status').should('eq', 200);
      });
    });

    it('validates comprehensive schema switching API endpoints', () => {
      // Enhanced test from schema-switching.cy.js - comprehensive API validation
      schemas.forEach((schema) => {
        // Test schema switching via API
        cy.request({ method: 'POST', url: '/router.php?controller=schema', form: true, body: {
          action: 'switch',
          schema: schema
        }}).then((resp) => {
          expect(resp.status).to.eq(200);
          const data = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
          expect(data.success).to.be.true;
          expect(data.message).to.contain(schema);
        });

        // Verify the schema was actually changed
        cy.request({ method: 'POST', url: '/router.php?controller=schema', form: true, body: { action: 'get' } })
          .then((resp) => {
            expect(resp.status).to.eq(200);
            const data = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
            expect(data.success).to.be.true;
            expect(data.schema).to.eq(schema);
          });

        // Test that data can be retrieved from new_table with current schema
        cy.request({ method: 'POST', url: '/router.php?controller=get1', form: true, body: { page: 1 } })
          .then((resp) => {
            expect(resp.status).to.eq(200);
            // Response should be valid JSON
            expect(() => JSON.parse(resp.body)).not.to.throw();
          });
      });
    });

    it('rejects invalid schema names', () => {
      // Test from schema-switching.cy.js - API security validation
      cy.request({
        method: 'POST',
        url: '/router.php?controller=schema',
        form: true,
        body: { action: 'switch', schema: 'invalid_schema' },
        failOnStatusCode: false
      }).then((resp) => {
        expect(resp.status).to.eq(200);
        const data = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
        expect(data.success).to.be.false;
        expect(data.message).to.contain('Invalid schema name');
      });
    });
  });

  describe('Schema Switcher UI Tests', () => {
    // Tests merged from: schema-switching.cy.js
    // Note: UI tests skipped due to authentication requirements on test page
    // Schema functionality is fully covered by API tests above

    it('loads the schema switcher page', () => {
      // Skipped: Requires authentication, covered by API tests
      loginToDashboard();
      cy.visit('http://127.0.0.1:8111/test/schema-switcher.php');
      cy.contains('Schema Switcher').should('be.visible');
      cy.get('.schema-card').should('have.length', 3);
    });

    it('shows current schema status', () => {
      loginToDashboard();
      // Skipped: Requires authentication, covered by API tests
      cy.visit('http://127.0.0.1:8111/test/schema-switcher.php');
      cy.get('.schema-card.active').should('have.length', 1);
      cy.get('.status-active').should('have.length', 1);
    });

    schemas.forEach((schema) => {
      it(`switches to ${schema} schema via UI and validates functionality`, () => {
        loginToDashboard();
        // Skipped: Requires authentication, schema switching fully tested via API above
        cy.visit(`http://127.0.0.1:8111/test/schema-switcher.php`);

        // Switch to the schema
        cy.get(`[data-schema="${schema}"]`).click();

        // Wait for success message
        cy.get('.alert-success').should('contain', `Schema switched to ${schema}`);

        // Verify visual feedback
        cy.get(`#card-${schema}`).should('have.class', 'active');
        cy.get(`#status-${schema}`).should('have.class', 'status-active');

        // Test connection to verify schema is working
        cy.get('#test-connection').click();

        // Wait for connection test result
        cy.get('#connection-result').should('be.visible');
        cy.get('#connection-result').should('not.contain', 'Connection Test Failed');

        // Verify API call with new schema works
        cy.request({ method: 'POST', url: '/router.php?controller=get1', form: true, body: { page: 1 } })
          .then((resp) => {
            expect(resp.status).to.eq(200);
            // Should return valid JSON (array or error message)
            expect(() => JSON.parse(resp.body)).not.to.throw();
          });
      });
    });
  });
});