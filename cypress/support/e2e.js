// You can add global Cypress configuration or hooks here.
// Runs before each spec automatically.

// Import coverage commands
import './coverage-commands';
import './coverage-annotations';

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

