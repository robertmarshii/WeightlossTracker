/**
 * Simple Coverage Debug Test
 * Test basic coverage object existence and function logging
 */

describe('Simple Coverage Debug', () => {
    it('should check if coverage object exists', () => {
        cy.visit('/');
        
        // Check basic window properties
        cy.window().then((win) => {
            console.log('Hostname:', win.location.hostname);
            console.log('Port:', win.location.port);
            console.log('Protocol:', win.location.protocol);
            console.log('Coverage object exists:', !!win.coverage);
            
            if (win.coverage) {
                console.log('Coverage enabled:', win.coverage.enabled);
                console.log('Function calls map size:', win.coverage.functionCalls.size);
                console.log('Session ID:', win.coverage.sessionId);
                console.log('Test mode:', win.coverage.testMode);
            }
            
            // This should not fail the test
            expect(win.location.hostname).to.eq('127.0.0.1');
        });
        
        // Now try to call showAlert manually and check if it logs
        cy.window().then((win) => {
            if (win.coverage) {
                console.log('Before showAlert - function calls:', win.coverage.functionCalls.size);
                
                // Call showAlert manually
                win.showAlert('Test message', 'info');
                
                console.log('After showAlert - function calls:', win.coverage.functionCalls.size);
                
                // Get the report
                const report = win.coverage.getReport();
                console.log('Coverage report:', report);
                console.log('Functions in report:', Object.keys(report.functions || {}));
            } else {
                console.log('❌ Coverage object does not exist!');
            }
        });
    });
    
    it('should check if global functions have coverage instrumentation', () => {
        cy.visit('/');
        
        cy.window().then((win) => {
            // Check if global functions exist
            console.log('showAlert function exists:', typeof win.showAlert);
            console.log('parseJson function exists:', typeof win.parseJson);
            console.log('openModal function exists:', typeof win.openModal);
            
            // Check their source code for coverage instrumentation
            if (win.showAlert) {
                const showAlertSource = win.showAlert.toString();
                const hasCoverage = showAlertSource.includes('coverage.logFunction');
                console.log('showAlert has coverage instrumentation:', hasCoverage);
            }
        });
    });
});