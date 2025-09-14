/**
 * Debug Coverage System Test
 * Simple test to verify coverage collection is working
 */

describe('Debug Coverage System', () => {
    it('should verify coverage logging is working', () => {
        // Visit the index page
        cy.visit('/');
        
        // Check if coverage logger exists
        cy.window().then((win) => {
            // Log what we find
            console.log('Window coverage object:', win.coverage);
            console.log('Coverage enabled:', win.coverage?.enabled);
            console.log('Hostname:', win.location.hostname);
            
            // Verify coverage object exists
            expect(win.coverage).to.exist;
            expect(win.coverage.enabled).to.be.true;
        });
        
        // Manually trigger a function call
        cy.window().its('coverage').then((coverage) => {
            // Log a test function call
            coverage.logFunction('testFunction', 'debug-test.js');
            
            // Check if it was logged
            const report = coverage.getReport();
            console.log('Coverage report:', report);
            
            // Should have at least one function logged
            expect(report.functions.length).to.be.greaterThan(0);
        });
        
        // Try triggering showAlert to see if it logs
        cy.window().then((win) => {
            win.showAlert('Test message', 'info');
        });
        
        // Wait a bit and check coverage again
        cy.wait(1000);
        
        cy.window().its('coverage').then((coverage) => {
            const report = coverage.getReport();
            console.log('Final coverage report:', report);
            
            // Should have multiple functions logged now
            expect(report.functions.length).to.be.greaterThan(0);
            
            // Check if showAlert was logged
            const showAlertCalls = report.functions.filter(f => f.functionName === 'showAlert');
            console.log('ShowAlert calls:', showAlertCalls);
        });
    });
    
    it('should test cypress coverage commands', () => {
        cy.visit('/');
        
        // Test initCoverage command
        cy.initCoverage();
        
        // Test verifyCoverage command  
        cy.window().then((win) => {
            win.showAlert('Test alert', 'success');
        });
        
        // Try to verify coverage (this might fail, but we want to see the error)
        cy.verifyCoverage(['showAlert'], 'Debug Coverage Test').then(() => {
            console.log('Coverage verification passed');
        }).catch((error) => {
            console.log('Coverage verification error:', error.message);
            // Don't fail the test, just log the error
        });
        
        // Test getCoverageStats
        cy.getCoverageStats().then((stats) => {
            console.log('Coverage stats:', stats);
        });
    });
});