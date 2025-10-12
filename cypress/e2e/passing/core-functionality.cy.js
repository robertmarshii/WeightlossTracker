/**
 * Core Functionality Tests
 *
 * This file combines the essential weight tracking and profile functionality tests
 * from the original goals_weights.cy.js and profile.cy.js files.
 *
 * Merged components:
 * - goals_weights.cy.js: Weight/goal management functionality
 * - profile.cy.js: Profile, BMI, and health statistics functionality
 */

describe('Core Functionality - Weight Tracking & Profile Management', () => {
  // PARTIALLY RESTORED FROM unstable-tests.cy.js - Some tests now working with proper authentication
  const base = 'http://127.0.0.1:8111';
  const email = 'test@dev.com'; // Use correct test email

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

  beforeEach(() => {
      // Set cypress_testing cookie to disable rate limiting for tests
      cy.setCookie('cypress_testing', 'true');

      // Clear any existing rate limits for test email
      cy.request({
          method: 'POST',
          url: `${base}/router.php?controller=email`,
          body: {
              action: 'clear_rate_limits',
              email: email
          },
          failOnStatusCode: false
      });
  });

  // Setup: Reset schema before all tests
  before(() => {
    cy.request({
      method: 'POST',
      url: `${base}/router.php?controller=seeder`,
      form: true,
      body: { action: 'reset_schema', schema: 'wt_test' }
    });
  });

  /**
   * Helper function to perform authentication and return session headers
   * Extracted common login logic to reduce duplication
   */
  const authenticateUser = () => {
    return cy.request({
      method: 'POST',
      url: `${base}/router.php?controller=schema`,
      form: true,
      body: { action: 'switch', schema: 'wt_test' }
    })
    .then(() => cy.request({
      method: 'POST',
      url: `${base}/login_router.php?controller=auth`,
      form: true,
      body: { action: 'send_login_code', email }
    }))
    .then(() => cy.request({
      method: 'POST',
      url: `${base}/login_router.php?controller=auth`,
      form: true,
      body: { action: 'peek_code', email }
    }))
    .then((resp) => {
      const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
      const code = body.code || '111111';
      return cy.request({
        method: 'POST',
        url: `${base}/login_router.php?controller=auth`,
        form: true,
        body: { action: 'verify_login', email, code }
      });
    })
    .then(() => cy.getCookie('PHPSESSID'))
    .then((c) => {
      return c ? { Cookie: `PHPSESSID=${c.value}` } : undefined;
    });
  };

  describe('Weight and Goal Management', () => {
    /**
     * Test merged from: goals_weights.cy.js
     *
     * Validates core weight tracking functionality:
     * - Adding weight entries
     * - Retrieving latest weight
     * - Setting weight loss goals
     * - Retrieving goal information
     */
    it('adds weight entries and manages weight loss goals', () => {
      authenticateUser().then((headers) => {
        // Test weight addition
        cy.request({
          method: 'POST',
          url: `${base}/router.php?controller=profile`,
          form: true,
          headers,
          body: { action: 'add_weight', weight_kg: 78.5 }
        }).its('status').should('eq', 200);

        // Verify weight was added successfully
        cy.request({
          method: 'POST',
          url: `${base}/router.php?controller=profile`,
          form: true,
          headers,
          body: { action: 'get_latest_weight' }
        }).then((resp) => {
          const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
          expect(body.success).to.eq(true);
          expect(parseFloat(body.latest.weight_kg)).to.be.greaterThan(0);
          expect(parseFloat(body.latest.weight_kg)).to.eq(78.5);
        });

        // Test goal setting
        cy.request({
          method: 'POST',
          url: `${base}/router.php?controller=profile`,
          form: true,
          headers,
          body: { action: 'save_goal', target_weight_kg: 72.0, target_date: '2025-12-31' }
        }).its('status').should('eq', 200);

        // Verify goal was saved successfully
        cy.request({
          method: 'POST',
          url: `${base}/router.php?controller=profile`,
          form: true,
          headers,
          body: { action: 'get_goal' }
        }).then((resp) => {
          const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
          expect(body.success).to.eq(true);
          expect(parseFloat(body.goal.target_weight_kg)).to.eq(72.0);
          expect(body.goal.target_date).to.eq('2025-12-31');
        });
      });
    });
  });

  describe('Profile, BMI and Health Statistics', () => {
    /**
     * Test merged from: profile.cy.js
     *
     * Validates comprehensive profile and health functionality:
     * - Saving user profile information
     * - Logging weight entries
     * - Calculating and returning BMI
     * - Generating health statistics including body fat estimation and CVD risk
     */
    it('saves profile data, calculates BMI, and generates health statistics', () => {
      authenticateUser().then((headers) => {
        // Test profile creation with comprehensive data
        cy.request({
          method: 'POST',
          url: `${base}/router.php?controller=profile`,
          form: true,
          headers,
          body: {
            action: 'save_profile',
            height_cm: 175,
            body_frame: 'medium',
            age: 35,
            activity_level: 'moderate'
          }
        }).its('status').should('eq', 200);

        // Add weight for BMI calculation
        cy.request({
          method: 'POST',
          url: `${base}/router.php?controller=profile`,
          form: true,
          headers,
          body: { action: 'add_weight', weight_kg: 80.0 }
        }).its('status').should('eq', 200);

        // Test BMI calculation
        cy.request({
          method: 'POST',
          url: `${base}/router.php?controller=profile`,
          form: true,
          headers,
          body: { action: 'get_bmi' }
        }).then((resp) => {
          const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
          expect(body.success).to.eq(true);
          expect(body.bmi).to.be.greaterThan(20);
          expect(body.bmi).to.be.lessThan(30);

          // BMI should be approximately 26.1 for 80kg at 175cm
          expect(body.bmi).to.be.closeTo(26.1, 0.5);
        });

        // Test comprehensive health statistics
        cy.request({
          method: 'POST',
          url: `${base}/router.php?controller=profile`,
          form: true,
          headers,
          body: { action: 'get_health_stats' }
        }).then((resp) => {
          const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
          expect(body.success).to.eq(true);

          // Validate body fat estimation range
          if (body.estimated_body_fat_range) {
            expect(body.estimated_body_fat_range[0]).to.be.lessThan(body.estimated_body_fat_range[1]);
            expect(body.estimated_body_fat_range).to.have.length(2);
          }

          // Validate CVD risk assessment
          expect(['below baseline','baseline','moderately increased','highly increased','very high'])
            .to.include(body.cvd_risk_label);
        });
      });
    });
  });

  describe('Integrated Workflow', () => {
    /**
     * New comprehensive test that combines both functionalities
     *
     * Tests the complete user workflow:
     * 1. Create profile
     * 2. Add initial weight
     * 3. Set weight loss goal
     * 4. Verify BMI and health stats are calculated
     */
    it('completes full weight tracking workflow with profile and goal management', () => {
      authenticateUser().then((headers) => {
        // Step 1: Create comprehensive user profile
        cy.request({
          method: 'POST',
          url: `${base}/router.php?controller=profile`,
          form: true,
          headers,
          body: {
            action: 'save_profile',
            height_cm: 170,
            body_frame: 'large',
            age: 28,
            activity_level: 'active'
          }
        }).its('status').should('eq', 200);

        // Step 2: Add initial weight entry
        cy.request({
          method: 'POST',
          url: `${base}/router.php?controller=profile`,
          form: true,
          headers,
          body: { action: 'add_weight', weight_kg: 85.0 }
        }).its('status').should('eq', 200);

        // Step 3: Set realistic weight loss goal
        cy.request({
          method: 'POST',
          url: `${base}/router.php?controller=profile`,
          form: true,
          headers,
          body: { action: 'save_goal', target_weight_kg: 75.0, target_date: '2026-06-30' }
        }).its('status').should('eq', 200);

        // Step 4: Verify all data is properly integrated
        // Check weight tracking
        cy.request({
          method: 'POST',
          url: `${base}/router.php?controller=profile`,
          form: true,
          headers,
          body: { action: 'get_latest_weight' }
        }).then((resp) => {
          const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
          expect(body.success).to.eq(true);
          expect(parseFloat(body.latest.weight_kg)).to.eq(85.0);
        });

        // Check goal setting
        cy.request({
          method: 'POST',
          url: `${base}/router.php?controller=profile`,
          form: true,
          headers,
          body: { action: 'get_goal' }
        }).then((resp) => {
          const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
          expect(body.success).to.eq(true);
          expect(parseFloat(body.goal.target_weight_kg)).to.eq(75.0);
        });

        // Check BMI calculation with new profile data
        cy.request({
          method: 'POST',
          url: `${base}/router.php?controller=profile`,
          form: true,
          headers,
          body: { action: 'get_bmi' }
        }).then((resp) => {
          const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
          expect(body.success).to.eq(true);
          // BMI should be approximately 29.4 for 85kg at 170cm
          expect(body.bmi).to.be.closeTo(29.4, 0.5);
        });

        // Verify health stats incorporate all profile data
        cy.request({
          method: 'POST',
          url: `${base}/router.php?controller=profile`,
          form: true,
          headers,
          body: { action: 'get_health_stats' }
        }).then((resp) => {
          const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
          expect(body.success).to.eq(true);
          expect(['below baseline','baseline','moderately increased','highly increased','very high'])
            .to.include(body.cvd_risk_label);
        });
      });
    });
  });
});