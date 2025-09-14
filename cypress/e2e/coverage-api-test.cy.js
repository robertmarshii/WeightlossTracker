/**
 * Coverage API Test
 * Direct test of backend coverage collection and reporting
 */

describe('Coverage API Test', () => {
    it('should call backend function and retrieve coverage data', () => {
        // First make an API call that should trigger instrumented functions
        cy.request({
            method: 'POST',
            url: '/login_router.php?controller=auth',
            body: {
                action: 'send_login_code',
                email: 'coverage-test@example.com'
            },
            failOnStatusCode: false
        }).then((response) => {
            console.log('API Call Response:', {
                status: response.status,
                body: response.body
            });
            
            // The API call should have triggered our instrumented functions
            // Now check coverage data
            cy.request({
                method: 'POST',
                url: '/router.php?controller=coverage',
                form: true,
                body: { action: 'get_report' },
                failOnStatusCode: false
            }).then((coverageResponse) => {
                console.log('Coverage Response:', {
                    status: coverageResponse.status,
                    body: coverageResponse.body
                });
                
                expect(coverageResponse.status).to.eq(200);
                expect(coverageResponse.body).to.have.property('success', true);
                expect(coverageResponse.body).to.have.property('coverage');
                
                const coverage = coverageResponse.body.coverage;
                console.log('Coverage Details:', coverage);
                
                // Check if we have function data
                if (coverage.functions && Object.keys(coverage.functions).length > 0) {
                    console.log('Functions covered:', Object.keys(coverage.functions));
                    
                    // Look for our instrumented functions
                    const functionKeys = Object.keys(coverage.functions);
                    const authFunctions = functionKeys.filter(key => 
                        key.includes('sendLoginCode') || 
                        key.includes('checkRateLimit') || 
                        key.includes('generateCode')
                    );
                    
                    console.log('Auth functions found:', authFunctions);
                    
                    if (authFunctions.length > 0) {
                        console.log('✅ Backend coverage is working!');
                        authFunctions.forEach(func => {
                            const data = coverage.functions[func];
                            console.log(`Function: ${func}`, data);
                        });
                    } else {
                        console.log('❌ No auth functions found in coverage');
                    }
                } else {
                    console.log('❌ No functions found in coverage data');
                    console.log('Coverage object structure:', Object.keys(coverage));
                }
            });
        });
    });
    
    it('should test multiple API calls and accumulate coverage', () => {
        // Make multiple different API calls
        const testCalls = [
            {
                url: '/login_router.php?controller=auth',
                body: { action: 'send_login_code', email: 'test1@example.com' }
            },
            {
                url: '/login_router.php?controller=auth', 
                body: { action: 'create_account', email: 'test2@example.com' }
            },
            {
                url: '/router.php?controller=schema',
                body: { action: 'get' }
            }
        ];
        
        // Make all the API calls
        testCalls.forEach((call, index) => {
            cy.request({
                method: 'POST',
                url: call.url,
                body: call.body,
                failOnStatusCode: false
            }).then((response) => {
                console.log(`API Call ${index + 1} (${call.body.action}):`, response.status);
            });
        });
        
        // Wait a moment for all calls to complete
        cy.wait(500);
        
        // Check final coverage
        cy.request({
            method: 'POST',
            url: '/router.php?controller=coverage',
            form: true,
            body: { action: 'get_report' }
        }).then((response) => {
            const coverage = response.body.coverage;
            const functionCount = coverage.functions ? Object.keys(coverage.functions).length : 0;
            
            console.log(`Final coverage check: ${functionCount} functions tracked`);
            
            if (functionCount > 0) {
                console.log('✅ Backend coverage collection is working!');
                Object.entries(coverage.functions).forEach(([key, data]) => {
                    console.log(`${key}: ${data.callCount} calls`);
                });
            }
            
            // Write results to file for review
            cy.writeFile('.claude/reports/backend-coverage-debug.json', {
                functionCount,
                functions: coverage.functions || {},
                timestamp: new Date().toISOString()
            });
        });
    });
});