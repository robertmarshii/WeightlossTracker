/**
 * Backend Debug Test  
 * Simple test to debug backend coverage issues
 */

describe('Backend Coverage Debug', () => {
    it('should test basic backend API without coverage', () => {
        // Test simple API call first
        cy.request({
            method: 'POST',
            url: '/router.php?controller=schema',
            body: { action: 'get' },
            failOnStatusCode: false
        }).then((response) => {
            console.log('Schema API response:', response.status, response.body);
            expect(response.status).to.be.oneOf([200, 403]);
        });
    });
    
    it('should test coverage API endpoint', () => {
        // Test our new coverage endpoint
        cy.request({
            method: 'POST',
            url: '/router.php?controller=coverage',
            body: { action: 'get_report' },
            failOnStatusCode: false
        }).then((response) => {
            console.log('Coverage API response:', response.status, response.body);
            
            if (response.status === 200) {
                expect(response.body).to.have.property('success');
                if (response.body.success) {
                    expect(response.body).to.have.property('coverage');
                    console.log('Coverage data:', response.body.coverage);
                }
            }
        });
    });
    
    it('should test login API with simple call', () => {
        // Test login API without complex expectations
        cy.request({
            method: 'POST',
            url: '/login_router.php?controller=auth',
            body: {
                action: 'send_login_code',
                email: 'debug@example.com'
            },
            failOnStatusCode: false
        }).then((response) => {
            console.log('Login API response:', response.status, response.body);
            
            // Just check we got some response
            expect(response.status).to.be.at.least(200);
        });
        
        // After API call, test backend coverage collection
        cy.collectBackendCoverage('Debug Login Test');
    });
});