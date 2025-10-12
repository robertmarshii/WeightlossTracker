// You can add global Cypress configuration or hooks here.
// Runs before each spec automatically.

// Import custom commands
import './commands';
// Import coverage commands
import './coverage-commands';
import './coverage-annotations';

// Custom command: Login and navigate to dashboard
Cypress.Commands.add('loginAndNavigateToDashboard', () => {
    const email = 'test@dev.com';
    const base = 'http://127.0.0.1:8111';

    // Clear everything first
    cy.clearCookies();
    cy.clearLocalStorage();

    // Set cypress_testing cookie to disable rate limiting
    cy.setCookie('cypress_testing', 'true');

    // Clear rate limits for the test email
    cy.request({
        method: 'POST',
        url: `${base}/router.php?controller=email`,
        body: {
            action: 'clear_rate_limits',
            email: email
        },
        failOnStatusCode: false
    });

    // Send login code via API
    cy.request({
        method: 'POST',
        url: `${base}/login_router.php?controller=auth`,
        body: { action: 'send_login_code', email: email }
    });

    // Visit the login page and do UI login
    cy.visit('/', { failOnStatusCode: false });
    cy.get('#loginEmail', {timeout: 5000}).should('be.visible').type(email);
    cy.get('#loginForm').submit();
    cy.wait(500);
    cy.get('#loginCode', {timeout: 5000}).should('be.visible').type('111111');
    cy.get('#verifyLoginForm button[type="submit"]').click();
    cy.url({timeout: 10000}).should('include', 'dashboard.php');
    cy.wait(1000);
});

// Global setup - initialize coverage reporter
before(() => {
    cy.initCoverage();
});

// Setup for each test
beforeEach(() => {
    // Enable coverage tracking for each test
    cy.enableCoverageTracking();
});

// Collect coverage after each test
afterEach(() => {
    // Collect frontend coverage data from the current test
    cy.collectCoverage();
    
    // Collect backend coverage data via API
    cy.collectBackendCoverage();
});

// Save final report after all tests complete
after(() => {
    // Save the comprehensive coverage report
    cy.saveCoverageReport('.claude/reports/cypress-coverage-report.txt');
});

