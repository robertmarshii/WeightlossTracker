// You can add global Cypress configuration or hooks here.
// Runs before each spec automatically.

// Import coverage commands
import './coverage-commands';
import './coverage-annotations';

// Custom command: Login and navigate to dashboard
Cypress.Commands.add('loginAndNavigateToDashboard', () => {
    cy.visit('http://127.0.0.1:8111');
    cy.get('#loginEmail').type('test@example.com');
    cy.get('#sendLoginCodeBtn').click();
    cy.wait(1000);
    cy.request('POST', 'http://127.0.0.1:8111/login_router.php?controller=auth', {
        action: 'get_latest_code',
        email: 'test@example.com'
    }).then((response) => {
        const code = response.body.code;
        cy.get('#loginCode').type(code);
        cy.get('#verifyLoginBtn').click();
        cy.url().should('include', 'dashboard.php');
    });
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

