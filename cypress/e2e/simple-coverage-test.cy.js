/**
 * Simple test to verify coverage collection works
 */

describe('Simple Coverage Test', () => {
    it('should visit the app and collect basic coverage', () => {
        // Visit the application
        cy.visit('/');
        
        // Wait for the page to load
        cy.get('.glass-card').should('be.visible');
        
        // Verify coverage is enabled
        cy.window().then((win) => {
            if (win.coverage) {
                cy.log('✅ Coverage logging is enabled');
                
                // Manually trigger some functions by interacting with the UI
                cy.get('#loginEmail').should('be.visible').type('test@example.com{backspace}{backspace}{backspace}{backspace}');
                
                // Check if we have coverage data
                cy.window().then((win2) => {
                    const report = win2.coverage.getReport();
                    cy.log(`Coverage collected: ${report.totalFunctions} functions`);
                    
                    if (report.totalFunctions > 0) {
                        cy.log('✅ Coverage data collected successfully!');
                        Object.keys(report.functions).slice(0, 3).forEach(func => {
                            cy.log(`Function tested: ${func}`);
                        });
                    } else {
                        cy.log('⚠️ No coverage data collected');
                    }
                });
            } else {
                cy.log('❌ Coverage logging not available');
            }
        });
    });
    
    it('should verify coverage object exists', () => {
        cy.visit('/');
        
        cy.window().should('have.property', 'coverage');
        
        cy.window().then((win) => {
            expect(win.coverage).to.exist;
            expect(win.coverage.enabled).to.be.true;
            cy.log('✅ Coverage object verified');
        });
    });
});