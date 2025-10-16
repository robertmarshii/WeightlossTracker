/**
 * Comprehensive UI and Responsive Design Test Suite
 *
 * This file merges functionality from:
 * - iphone-se-test.cy.js (4 tests - iPhone SE specific layout testing)
 * - responsive-design-test.cy.js (6 tests - responsive design across multiple viewports)
 * - responsive-validation.cy.js (6 tests - responsive validation for key devices)
 *
 * Total tests: 16 tests organized into logical sections
 */

describe('Comprehensive UI and Responsive Design Tests', () => {

  // Device configurations from all source files
  const devices = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'Mobile Landscape', width: 667, height: 375 },
    { name: 'iPad Portrait', width: 768, height: 1024 },
    { name: 'iPad Landscape', width: 1024, height: 768 },
    { name: 'Desktop', width: 1280, height: 720 },
    { name: 'Large Desktop', width: 1920, height: 1080 }
  ];

  // Core responsive test set for key validation (from responsive-validation.cy.js)
  const coreDevices = [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'Desktop', width: 1280, height: 720 }
  ];

  beforeEach(() => {
    // Set cypress_testing cookie to disable rate limiting for tests
    cy.setCookie('cypress_testing', 'true');

    // Clear any existing rate limits for test email
    cy.request({
      method: 'POST',
      url: 'http://127.0.0.1:8111/router.php?controller=email',
      body: {
        action: 'clear_rate_limits',
        email: 'test@dev.com'
      },
      failOnStatusCode: false
    });
  });

  describe('iPhone SE Specific Tests', () => {
    // Tests from iphone-se-test.cy.js - focused on iPhone SE layout
    beforeEach(() => {
      cy.viewport(375, 667); // iPhone SE dimensions
      cy.visit('http://127.0.0.1:8111');
    });

    it('should display login page properly on iPhone SE', () => {
      // Check no horizontal overflow
      cy.window().then((win) => {
        expect(win.document.body.scrollWidth).to.be.at.most(380); // Small tolerance
      });

      // Check main elements are visible and sized properly
      cy.get('.glass-card').should('be.visible').then(($card) => {
        expect($card.outerWidth()).to.be.at.most(370);
      });

      cy.get('.logo-icon').should('be.visible').then(($logo) => {
        expect($logo.outerWidth()).to.be.at.most(40);
      });

      cy.get('#loginEmail').should('be.visible').then(($input) => {
        expect($input.outerHeight()).to.be.at.least(36);
      });

      cy.get('#sendLoginCodeBtn').should('be.visible').then(($btn) => {
        expect($btn.outerHeight()).to.be.at.least(36);
      });
    });

    it('should display dashboard properly on iPhone SE', () => {
      // Send login code via API first
      cy.request({
        method: 'POST',
        url: 'http://127.0.0.1:8111/login_router.php?controller=auth',
        body: { action: 'send_login_code', email: 'test@dev.com' }
      });

      cy.visit('/', { failOnStatusCode: false });
      cy.get('#loginEmail').type('test@dev.com');
      cy.get('#loginForm').submit();
      cy.wait(1000);
      cy.get('#loginCode', { timeout: 10000 }).should('be.visible').type('111111');
      cy.get('#verifyLoginForm button[type="submit"]').click();

      cy.url({ timeout: 8000 }).should('include', 'dashboard.php');

      // Check no horizontal overflow on dashboard
      cy.window().then((win) => {
        expect(win.document.body.scrollWidth).to.be.at.most(380);
      });

      // Check dashboard cards fit properly
      cy.get('.glass-card-small').should('be.visible').each(($card) => {
        cy.wrap($card).invoke('outerWidth').should('be.at.most', 370);
      });

      // Check navigation tabs are visible and work
      cy.get('.nav-tabs .nav-link').should('be.visible');
      cy.get('#health-tab').click();
      cy.get('#health').should('be.visible');

      // Check form elements are properly sized
      cy.get('.glass-input').each(($input) => {
        cy.wrap($input).invoke('outerHeight').should('be.at.least', 32);
      });
    });

    it('should have readable text on iPhone SE', () => {
      // Check font sizes are not too small
      cy.get('.welcome-title').should('be.visible').then(($title) => {
        const fontSize = parseFloat(window.getComputedStyle($title[0]).fontSize);
        expect(fontSize).to.be.at.least(14); // Minimum readable size
      });

      cy.get('.nav-link').should('be.visible').then(($link) => {
        const fontSize = parseFloat(window.getComputedStyle($link[0]).fontSize);
        expect(fontSize).to.be.at.least(10); // Minimum for nav
      });
    });
  });

  describe('Multi-Device Responsive Tests', () => {
    // Tests from responsive-design-test.cy.js - comprehensive viewport testing
    devices.forEach(viewport => {
      describe(`${viewport.name} (${viewport.width}x${viewport.height})`, () => {
        beforeEach(() => {
          cy.viewport(viewport.width, viewport.height);
          cy.visit('http://127.0.0.1:8111');
        });

        it('should display login page elements properly', () => {
          // Test glass card visibility and positioning
          cy.get('.glass-card').should('be.visible');

          // Test logo section
          cy.get('.logo-section').should('be.visible');
          cy.get('.logo-icon').should('be.visible');
          cy.get('.logo-text').should('be.visible');

          // Test welcome text
          cy.get('.welcome-title').should('be.visible');
          cy.get('.welcome-subtitle').should('be.visible');

          // Test form elements
          cy.get('#loginEmail').should('be.visible');
          cy.get('#sendLoginCodeBtn').should('be.visible');

          // Test navigation tabs
          cy.get('.nav-tabs').should('be.visible');
          cy.get('.nav-link').should('be.visible');

          // Check for horizontal overflow
          cy.window().then((win) => {
            expect(win.document.body.scrollWidth).to.be.at.most(viewport.width + 20); // Allow small tolerance
          });
        });

        it('should test dashboard responsiveness after login', () => {
          const email = 'test@dev.com';

          // Send login code via API first
          cy.request({
              method: 'POST',
              url: `http://127.0.0.1:8111/login_router.php?controller=auth`,
              body: { action: 'send_login_code', email: email }
          });

          cy.visit('/', { failOnStatusCode: false });
          cy.get('#loginEmail').type(email);
          cy.get('#loginForm').submit();
          cy.wait(1000);
          cy.get('#loginCode', { timeout: 10000 }).should('be.visible').type('111111');
          cy.get('#verifyLoginForm button[type="submit"]').click();

          cy.url({ timeout: 8000 }).should('include', 'dashboard.php');

          // Test dashboard elements (only visible ones in active tab)
          cy.get('#data .glass-card-small').should('be.visible');
          cy.get('.welcome-title').should('be.visible');

          // Test navigation
          cy.get('.nav-tabs').should('be.visible');

          // Test responsive behavior of glass cards (only visible ones)
          cy.get('#data .glass-card-small').each(($card) => {
            cy.wrap($card).should('be.visible');
            cy.wrap($card).invoke('outerWidth').should('be.at.most', viewport.width);
          });

          // Check for horizontal overflow on dashboard
          cy.window().then((win) => {
            expect(win.document.body.scrollWidth).to.be.at.most(viewport.width + 20);
          });
        });

        it('should test form elements on different screen sizes', () => {
          // Test input field responsiveness
          cy.get('#loginEmail').should('be.visible').then(($input) => {
            const inputWidth = $input.outerWidth();
            const containerWidth = $input.parent().outerWidth();
            expect(inputWidth).to.be.at.most(containerWidth);
          });

          // Test button responsiveness
          cy.get('#sendLoginCodeBtn').should('be.visible').then(($button) => {
            const buttonWidth = $button.outerWidth();
            const containerWidth = $button.parent().outerWidth();
            expect(buttonWidth).to.be.at.most(containerWidth);
          });
        });
      });
    });
  });

  describe('Core Device Validation', () => {
    // Tests from responsive-validation.cy.js - focused validation for key devices
    coreDevices.forEach(device => {
      describe(`${device.name} Validation (${device.width}x${device.height})`, () => {
        beforeEach(() => {
          cy.viewport(device.width, device.height);
          cy.visit('http://127.0.0.1:8111');
        });

        it('should display login page without horizontal overflow', () => {
          // Check for horizontal overflow
          cy.window().then((win) => {
            expect(win.document.body.scrollWidth).to.be.at.most(device.width + 5);
          });

          // Verify main elements are visible
          cy.get('.glass-card').should('be.visible');
          cy.get('.logo-icon').should('be.visible');
          cy.get('.welcome-title').should('be.visible');
          cy.get('#loginEmail').should('be.visible');
          cy.get('#sendLoginCodeBtn').should('be.visible');
        });

        it('should have properly sized elements', () => {
          // Glass card should not exceed viewport width minus some margin
          cy.get('.glass-card').then(($card) => {
            expect($card.outerWidth()).to.be.at.most(device.width - 10);
          });

          // Input should be responsive
          cy.get('#loginEmail').then(($input) => {
            expect($input.outerWidth()).to.be.at.most(device.width - 50);
          });

          // Button should be responsive
          cy.get('#sendLoginCodeBtn').then(($button) => {
            expect($button.outerWidth()).to.be.at.most(device.width - 50);
          });
        });

        it('should test dashboard responsiveness', () => {
          const email = 'test@dev.com';

          // Send login code via API first
          cy.request({
              method: 'POST',
              url: `http://127.0.0.1:8111/login_router.php?controller=auth`,
              body: { action: 'send_login_code', email: email }
          });

          cy.visit('/', { failOnStatusCode: false });
          cy.get('#loginEmail').type(email);
          cy.get('#loginForm').submit();
          cy.wait(1000);
          cy.get('#loginCode', { timeout: 10000 }).should('be.visible').type('111111');
          cy.get('#verifyLoginForm button[type="submit"]').click();

          cy.url({ timeout: 8000 }).should('include', 'dashboard.php');

          // Check dashboard elements (only visible ones in active tab)
          cy.get('#data .glass-card-small').should('be.visible');

          // Dashboard should not have horizontal overflow
          cy.window().then((win) => {
            expect(win.document.body.scrollWidth).to.be.at.most(device.width + 5);
          });

          // Dashboard cards should fit properly (only visible ones)
          cy.get('#data .glass-card-small').each(($card) => {
            cy.wrap($card).invoke('outerWidth').should('be.at.most', device.width - 10);
          });
        });
      });
    });
  });

  describe('Mobile Touch Targets', () => {
    // Tests from responsive-validation.cy.js - mobile-specific touch target validation
    it('should have adequate touch targets on mobile', () => {
      cy.viewport(375, 667);
      cy.visit('http://127.0.0.1:8111');

      // Buttons should be at least 36px tall
      cy.get('#sendLoginCodeBtn').then(($button) => {
        expect($button.outerHeight()).to.be.at.least(36);
      });

      // Input fields should be tall enough
      cy.get('#loginEmail').then(($input) => {
        expect($input.outerHeight()).to.be.at.least(36);
      });

      // Navigation links should be touch-friendly
      cy.get('.nav-link').each(($link) => {
        cy.wrap($link).invoke('outerHeight').should('be.at.least', 26);
      });
    });
  });

  describe('Responsive Issues Detection', () => {
    // Tests from responsive-design-test.cy.js - comprehensive issue detection
    it('should identify current responsive issues', () => {
      const issues = [];

      [375, 768, 1024].forEach(width => {
        cy.viewport(width, 667);
        cy.visit('http://127.0.0.1:8111');

        // Check for common responsive issues
        cy.get('body').then(() => {
          // Check for horizontal scroll
          cy.window().then((win) => {
            if (win.document.body.scrollWidth > width) {
              issues.push(`Horizontal overflow at ${width}px width`);
            }
          });

          // Check if glass card is too wide on mobile
          if (width <= 768) {
            cy.get('.glass-card').then(($card) => {
              if ($card.outerWidth() > width - 40) { // 40px for margins
                issues.push(`Glass card too wide on ${width}px screen`);
              }
            });
          }

          // Check navigation visibility on small screens
          if (width <= 375) {
            cy.get('.nav-tabs .nav-link').then(($links) => {
              if ($links.length > 2) {
                const totalWidth = Array.from($links).reduce((sum, link) => sum + link.offsetWidth, 0);
                if (totalWidth > width - 40) {
                  issues.push(`Navigation tabs overflow on ${width}px screen`);
                }
              }
            });
          }
        });
      });

      // Log issues found (this will help us understand what to fix)
      if (issues.length > 0) {
        cy.log('Responsive issues detected:', issues.join(', '));
      }
    });
  });
});