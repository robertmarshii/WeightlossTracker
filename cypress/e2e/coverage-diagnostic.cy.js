/**
 * Coverage System Diagnostic Test
 * Writes detailed diagnostic information to a file
 */

describe('Coverage System Diagnostic', () => {
    it('should diagnose coverage system and write results to file', () => {
        let diagnostics = [];
        
        cy.visit('/').then(() => {
            diagnostics.push('=== COVERAGE SYSTEM DIAGNOSTIC ===');
            diagnostics.push(`Timestamp: ${new Date().toISOString()}`);
        });
        
        // Check window properties and coverage object
        cy.window().then((win) => {
            diagnostics.push('');
            diagnostics.push('=== WINDOW PROPERTIES ===');
            diagnostics.push(`Hostname: ${win.location.hostname}`);
            diagnostics.push(`Port: ${win.location.port}`);
            diagnostics.push(`Protocol: ${win.location.protocol}`);
            diagnostics.push(`Full URL: ${win.location.href}`);
            
            diagnostics.push('');
            diagnostics.push('=== COVERAGE OBJECT CHECK ===');
            diagnostics.push(`Coverage object exists: ${!!win.coverage}`);
            
            if (win.coverage) {
                diagnostics.push(`Coverage enabled: ${win.coverage.enabled}`);
                diagnostics.push(`Session ID: ${win.coverage.sessionId}`);
                diagnostics.push(`Test mode: ${win.coverage.testMode}`);
                diagnostics.push(`Function calls map size: ${win.coverage.functionCalls.size}`);
                diagnostics.push(`Function calls type: ${typeof win.coverage.functionCalls}`);
                diagnostics.push(`Function calls is Map: ${win.coverage.functionCalls instanceof Map}`);
            } else {
                diagnostics.push('❌ Coverage object does not exist!');
            }
            
            diagnostics.push('');
            diagnostics.push('=== GLOBAL FUNCTIONS CHECK ===');
            diagnostics.push(`showAlert function exists: ${typeof win.showAlert}`);
            diagnostics.push(`parseJson function exists: ${typeof win.parseJson}`);
            diagnostics.push(`openModal function exists: ${typeof win.openModal}`);
            diagnostics.push(`showToast function exists: ${typeof win.showToast}`);
            
            // Check coverage instrumentation in showAlert
            if (win.showAlert) {
                const source = win.showAlert.toString();
                const hasCoverage = source.includes('coverage.logFunction');
                const hasWindowCoverage = source.includes('window.coverage');
                diagnostics.push(`showAlert has coverage instrumentation: ${hasCoverage}`);
                diagnostics.push(`showAlert checks window.coverage: ${hasWindowCoverage}`);
            }
        });
        
        // Test manual function call and coverage logging
        cy.window().then((win) => {
            diagnostics.push('');
            diagnostics.push('=== MANUAL FUNCTION CALL TEST ===');
            
            if (win.coverage) {
                const beforeSize = win.coverage.functionCalls.size;
                diagnostics.push(`Function calls before showAlert: ${beforeSize}`);
                
                // Manually call showAlert
                try {
                    win.showAlert('Diagnostic test message', 'info');
                    diagnostics.push('showAlert called successfully');
                    
                    const afterSize = win.coverage.functionCalls.size;
                    diagnostics.push(`Function calls after showAlert: ${afterSize}`);
                    diagnostics.push(`Function calls increased: ${afterSize > beforeSize}`);
                    
                    // Get the coverage report
                    const report = win.coverage.getReport();
                    diagnostics.push(`Report generated: ${!!report}`);
                    diagnostics.push(`Report total functions: ${report.totalFunctions}`);
                    diagnostics.push(`Report functions type: ${typeof report.functions}`);
                    diagnostics.push(`Report functions keys: ${Object.keys(report.functions || {}).length}`);
                    
                    if (report.functions) {
                        const functionKeys = Object.keys(report.functions);
                        diagnostics.push(`Function keys: ${functionKeys.join(', ')}`);
                        
                        // Show first few function details
                        functionKeys.slice(0, 3).forEach(key => {
                            const func = report.functions[key];
                            diagnostics.push(`  ${key}: calls=${func.callCount}, first=${func.firstCalled}`);
                        });
                    }
                    
                } catch (error) {
                    diagnostics.push(`Error calling showAlert: ${error.message}`);
                }
            } else {
                diagnostics.push('Coverage object not available for testing');
            }
        });
        
        // Test cy.verifyCoverage command
        cy.window().then((win) => {
            diagnostics.push('');
            diagnostics.push('=== CYPRESS COMMAND TEST ===');
            
            // Try to call the command and catch any errors
            try {
                cy.verifyCoverage(['showAlert'], 'Diagnostic Test').then((result) => {
                    diagnostics.push(`verifyCoverage command executed successfully`);
                    diagnostics.push(`Result: ${JSON.stringify(result)}`);
                }).catch((error) => {
                    diagnostics.push(`verifyCoverage error: ${error.message}`);
                });
            } catch (error) {
                diagnostics.push(`verifyCoverage command error: ${error.message}`);
            }
        });
        
        // Write diagnostics to file
        cy.then(() => {
            const diagnosticText = diagnostics.join('\n');
            cy.writeFile('.claude/reports/coverage-diagnostic.txt', diagnosticText);
        });
    });
});