/**
 * Coverage Annotations System
 * Adds coverage information to tests and generates coverage comments
 */

/**
 * Add coverage annotation to test
 * @param {string} testName - Name of the test
 * @param {Array<string>} expectedFunctions - Functions this test should cover
 * @param {Array<string>} actualFunctions - Functions actually covered (optional)
 */
function addCoverageAnnotation(testName, expectedFunctions = [], actualFunctions = []) {
    const annotation = {
        testName,
        expectedFunctions,
        actualFunctions,
        timestamp: new Date().toISOString()
    };
    
    // Store in global coverage tracker
    if (!window.coverageAnnotations) {
        window.coverageAnnotations = [];
    }
    window.coverageAnnotations.push(annotation);
    
    // Log to console
    console.group(`📝 Coverage Annotation: ${testName}`);
    console.log('📋 Expected functions:', expectedFunctions);
    if (actualFunctions.length > 0) {
        console.log('✅ Actually covered:', actualFunctions);
        const missing = expectedFunctions.filter(f => !actualFunctions.includes(f));
        const unexpected = actualFunctions.filter(f => !expectedFunctions.includes(f));
        if (missing.length > 0) console.log('❌ Missing coverage:', missing);
        if (unexpected.length > 0) console.log('➕ Unexpected coverage:', unexpected);
    }
    console.groupEnd();
}

/**
 * Generate coverage comment for a test
 * @param {Array<string>} functions - Functions covered by this test
 * @param {string} testPurpose - Purpose of the test
 * @returns {string} Formatted coverage comment
 */
function generateCoverageComment(functions, testPurpose = '') {
    const comment = `
/**
 * COVERAGE: This test covers the following functions:
${functions.map(func => ` * - ${func}`).join('\n')}
 * 
 * Test Purpose: ${testPurpose}
 * Functions Expected: ${functions.length}
 * Last Updated: ${new Date().toISOString().split('T')[0]}
 */`;
    return comment;
}

/**
 * Cypress command to verify expected coverage
 */
Cypress.Commands.add('verifyCoverage', (expectedFunctions, testDescription = '') => {
    cy.window().then((win) => {
        if (win.coverage) {
            const report = win.coverage.getReport();
            const actualFunctions = Object.keys(report.functions || {});
            
            // Add annotation
            addCoverageAnnotation(
                testDescription || Cypress.currentTest.title,
                expectedFunctions,
                actualFunctions
            );
            
            // Verify expected functions were called
            const missing = expectedFunctions.filter(expected => 
                !actualFunctions.some(actual => actual.includes(expected))
            );
            
            if (missing.length > 0) {
                cy.log(`⚠️ Missing expected coverage: ${missing.join(', ')}`);
            } else {
                cy.log(`✅ All expected functions covered: ${expectedFunctions.join(', ')}`);
            }
            
            // Log unexpected functions (might be useful)
            const unexpected = actualFunctions.filter(actual => 
                !expectedFunctions.some(expected => actual.includes(expected))
            );
            
            if (unexpected.length > 0) {
                cy.log(`➕ Additional functions covered: ${unexpected.slice(0, 3).join(', ')}${unexpected.length > 3 ? '...' : ''}`);
            }
            
            return cy.wrap({
                expected: expectedFunctions,
                actual: actualFunctions,
                missing,
                unexpected: unexpected.slice(0, 5) // Limit to first 5
            });
        }
    });
});

/**
 * Generate coverage documentation for test file
 */
Cypress.Commands.add('generateCoverageDoc', () => {
    cy.window().then((win) => {
        if (win.coverageAnnotations && win.coverageAnnotations.length > 0) {
            const doc = generateTestFileCoverageDoc(win.coverageAnnotations);
            cy.log('📄 Coverage Documentation Generated');
            console.log(doc);
            return cy.wrap(doc);
        }
    });
});

/**
 * Generate coverage documentation for entire test file
 */
function generateTestFileCoverageDoc(annotations) {
    const doc = `
/*
================================================================================
TEST FILE COVERAGE DOCUMENTATION
================================================================================
Generated: ${new Date().toLocaleString()}
Total Tests: ${annotations.length}

${annotations.map((annotation, index) => `
TEST ${index + 1}: ${annotation.testName}
Functions Expected: ${annotation.expectedFunctions.join(', ') || 'None specified'}
Functions Covered: ${annotation.actualFunctions.join(', ') || 'None detected'}
Coverage Status: ${annotation.actualFunctions.length > 0 ? '✅ Active' : '⚠️ No coverage detected'}
`).join('')}

================================================================================
COVERAGE SUMMARY BY FUNCTION:
================================================================================
${generateFunctionCoverageSummary(annotations)}

RECOMMENDATIONS:
- Add coverage verification to tests without expected functions
- Investigate tests with no detected coverage
- Consider combining tests that cover similar functions
================================================================================
*/`;

    return doc;
}

/**
 * Generate function coverage summary
 */
function generateFunctionCoverageSummary(annotations) {
    const functionCounts = {};
    
    annotations.forEach(annotation => {
        annotation.actualFunctions.forEach(func => {
            if (!functionCounts[func]) {
                functionCounts[func] = { count: 0, tests: [] };
            }
            functionCounts[func].count++;
            functionCounts[func].tests.push(annotation.testName);
        });
    });
    
    const sortedFunctions = Object.entries(functionCounts)
        .sort(([,a], [,b]) => b.count - a.count);
    
    return sortedFunctions.map(([func, data]) => 
        `${func}: ${data.count} test${data.count > 1 ? 's' : ''} (${data.tests.slice(0, 2).join(', ')}${data.tests.length > 2 ? '...' : ''})`
    ).join('\n');
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addCoverageAnnotation,
        generateCoverageComment,
        generateTestFileCoverageDoc
    };
}