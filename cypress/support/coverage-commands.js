/**
 * Cypress Coverage Commands
 * Integrates coverage collection with test execution
 */

const CypressCoverageReporter = require('./coverage-reporter');

// Global coverage reporter instance
let coverageReporter = null;

// Initialize coverage reporter
Cypress.Commands.add('initCoverage', () => {
    if (!coverageReporter) {
        coverageReporter = new CypressCoverageReporter();
        console.log('🎯 Coverage reporter initialized');
    }
});

// Collect coverage from current test
Cypress.Commands.add('collectCoverage', (testName) => {
    cy.window().then((win) => {
        if (win.coverage && coverageReporter) {
            const report = win.coverage.getReport();
            coverageReporter.addTestCoverage(testName || Cypress.currentTest.title, report);
            console.log(`📊 Collected coverage for: ${testName || Cypress.currentTest.title}`);
        }
    });
});

// Set test mode for coverage logging
Cypress.Commands.add('enableCoverageTracking', () => {
    cy.window().then((win) => {
        if (win.coverage) {
            win.coverage.setTestMode(true);
            console.log('🧪 Coverage tracking enabled for test');

            // Force immediate instrumentation
            if (win.autoInstrumentGlobalFunctions) {
                win.autoInstrumentGlobalFunctions();
            }

            // Force instrumentation of known functions
            if (win.instrumentGlobals) {
                win.instrumentGlobals();
            }

            // Log current function count
            const report = win.coverage.getReport();
            console.log(`📊 Coverage tracking: ${report.totalFunctions} functions tracked`);
        } else {
            console.warn('⚠️ Coverage logger not found on window object');
        }
    });
});

// Save final coverage report  
Cypress.Commands.add('saveCoverageReport', (fileName = null) => {
    if (coverageReporter) {
        const filePath = fileName || `.claude/reports/cypress-coverage-report.txt`;
        const report = coverageReporter.generateReport();
        
        // Use Cypress's writeFile instead of Node's fs
        cy.writeFile(filePath, report).then(() => {
            console.log(`📄 Coverage report saved: ${filePath}`);
            return cy.wrap(filePath);
        });
    } else {
        return cy.wrap(null);
    }
});

// Get coverage statistics for assertions
Cypress.Commands.add('getCoverageStats', () => {
    if (coverageReporter) {
        const stats = {
            totalTests: coverageReporter.testResults.length,
            totalFunctions: coverageReporter.allCoverage.size,
            functionsWithSingleTest: Array.from(coverageReporter.allCoverage.values())
                .filter(info => info.testedBy.length === 1).length
        };
        return cy.wrap(stats);
    }
    return cy.wrap(null);
});

// Helper to check if specific functions were tested
Cypress.Commands.add('assertFunctionTested', (functionName, fileName = null) => {
    if (coverageReporter) {
        const key = fileName ? `${fileName}:${functionName}` : functionName;
        const functionData = Array.from(coverageReporter.allCoverage.entries())
            .find(([k]) => k.includes(functionName));
        
        expect(functionData, `Function ${functionName} should be tested`).to.exist;
        expect(functionData[1].testedBy.length, `Function ${functionName} should be tested`).to.be.greaterThan(0);
    }
});

// Collect backend coverage data via API
Cypress.Commands.add('collectBackendCoverage', (testName) => {
    cy.request({
        method: 'POST',
        url: '/router.php?controller=coverage',
        form: true,
        body: { action: 'get_report' },
        failOnStatusCode: false
    }).then((response) => {
        if (response.status === 200 && response.body.success) {
            const backendCoverage = response.body.coverage;
            
            if (coverageReporter && backendCoverage.functions) {
                // Convert PHP coverage format to our standard format
                const standardFormat = {
                    functions: {}
                };
                
                Object.entries(backendCoverage.functions).forEach(([key, data]) => {
                    standardFormat.functions[key] = {
                        functionName: data.function,
                        fileName: data.file,
                        callCount: data.callCount,
                        firstCalled: data.firstCalled,
                        lastCalled: data.lastCalled
                    };
                });
                
                coverageReporter.addTestCoverage(testName || Cypress.currentTest.title, standardFormat);
                console.log(`📊 Collected backend coverage: ${Object.keys(standardFormat.functions).length} functions`);
            }
        } else {
            console.log('⚠️ Backend coverage not available:', response.body?.message || 'Unknown error');
        }
    });
});

// Force comprehensive function instrumentation
Cypress.Commands.add('forceInstrumentation', () => {
    cy.window().then((win) => {
        console.log('🔧 Forcing comprehensive instrumentation...');

        // Check all window functions
        let instrumentedCount = 0;
        Object.keys(win).forEach(key => {
            if (typeof win[key] === 'function' && !key.startsWith('_') && !key.includes('webkit')) {
                try {
                    // Wrap the function to log calls
                    const originalFunction = win[key];
                    win[key] = function(...args) {
                        if (win.coverage) {
                            win.coverage.logFunction(key, 'window');
                        }
                        return originalFunction.apply(this, args);
                    };
                    instrumentedCount++;
                } catch (e) {
                    // Skip functions that can't be wrapped
                }
            }
        });

        console.log(`🔧 Forced instrumentation: ${instrumentedCount} functions wrapped`);

        // Also check for specific functions we know exist
        const targetFunctions = ['updateSignupButton', 'sendLoginCode', 'createAccount', 'isValidEmail'];
        targetFunctions.forEach(funcName => {
            if (typeof win[funcName] === 'function') {
                console.log(`✅ Found target function: ${funcName}`);
            } else {
                console.log(`❌ Missing target function: ${funcName}`);
            }
        });
    });
});

// Export reporter for use in plugins
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getCoverageReporter: () => coverageReporter,
        CypressCoverageReporter
    };
}