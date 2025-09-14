/**
 * Test to specifically trigger instrumented functions
 */

describe('Function Trigger Test', () => {
    it('should trigger showAlert function', () => {
        cy.visit('/');
        
        // Wait for page to load and coverage to be enabled
        cy.get('.glass-card').should('be.visible');
        
        // Type an email to enable the button
        cy.get('#loginEmail').type('test@example.com');
        cy.get('.primary-btn').should('not.be.disabled');
        
        // Click the login button to trigger network request and showAlert
        cy.get('.primary-btn').click();
        
        // Wait for alert to appear (should show network error or validation error)
        cy.get('#alert-container .alert', { timeout: 10000 }).should('be.visible');
        
        // Now check coverage
        cy.window().then((win) => {
            if (win.coverage) {
                const report = win.coverage.getReport();
                cy.log(`Total functions tracked: ${report.totalFunctions}`);
                
                if (report.functions) {
                    Object.entries(report.functions).forEach(([key, info]) => {
                        cy.log(`Function: ${key}, Calls: ${info.callCount}`);
                    });
                }
            } else {
                cy.log('❌ Coverage not available');
            }
        });
    });
    
    it('should trigger parseJson function by making API call', () => {
        cy.visit('/');
        
        // Intercept the API call to see if parseJson gets called
        cy.intercept('POST', '**/login_router.php*', {
            statusCode: 200,
            body: '{"success": false, "message": "Test response"}'
        }).as('loginRequest');
        
        // Trigger login
        cy.get('#loginEmail').type('test@coverage.com');
        cy.get('.primary-btn').click();
        
        // Wait for request
        cy.wait('@loginRequest');
        
        // Check coverage again
        cy.window().then((win) => {
            if (win.coverage) {
                const report = win.coverage.getReport();
                cy.log(`Functions after API call: ${report.totalFunctions}`);
                
                // Look specifically for parseJson
                const parseJsonKey = Object.keys(report.functions || {})
                    .find(key => key.includes('parseJson'));
                
                if (parseJsonKey) {
                    cy.log(`✅ parseJson was called: ${parseJsonKey}`);
                } else {
                    cy.log('⚠️ parseJson not found in coverage');
                }
            }
        });
    });
});