/**
 * Example test showing coverage integration
 * This test demonstrates how coverage is automatically collected
 */

describe('Coverage Integration Example', () => {
    it('should collect coverage data automatically', () => {
        // Visit the app - coverage tracking is automatically enabled
        cy.visit('/');
        
        // Interact with the app to trigger function calls
        cy.get('#loginEmail').should('be.visible').type('test@example.com');
        
        // The primary button should be enabled after typing email
        cy.get('.primary-btn').should('not.be.disabled');
        
        // Try to trigger showAlert by clicking login (will fail but trigger function)
        cy.get('.primary-btn').click();
        
        // Wait for alert to appear (the network will fail but showAlert should be called)
        cy.get('#alert-container').should('be.visible');
        
        // Coverage data is automatically collected in afterEach hook
        // No manual collection needed!
    });
    
    it('should test modal functionality', () => {
        cy.visit('/');
        
        // Click on Terms and Conditions link to test openModal function
        cy.get('a[onclick*="termsModal"]').click();
        
        // Modal should be visible
        cy.get('#termsModal').should('be.visible');
        
        // Close modal
        cy.get('#termsModal .close').click();
        
        // Modal should be hidden
        cy.get('#termsModal').should('not.be.visible');
        
        // Coverage for openModal function is automatically collected
    });
    
    it('should verify coverage collection works', () => {
        cy.visit('/');
        
        // Trigger multiple functions
        cy.get('#loginEmail').type('coverage@test.com');
        cy.get('.primary-btn').click();
        
        // Get current coverage stats for verification
        cy.getCoverageStats().then((stats) => {
            if (stats) {
                cy.log(`Total functions tested: ${stats.totalFunctions}`);
                cy.log(`Total tests run: ${stats.totalTests}`);
                
                // Assert that we've collected some coverage data
                expect(stats.totalFunctions).to.be.greaterThan(0);
            }
        });
        
        // Verify specific functions were tested
        cy.assertFunctionTested('showAlert');
        cy.assertFunctionTested('parseJson');
    });
});

// This test file will contribute to the final coverage report automatically!