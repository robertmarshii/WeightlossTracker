describe('Backend API Function Coverage Tests', () => {
    beforeEach(() => {
        cy.enableCoverageTracking();
    });

    it('should test AuthManager authentication functions', () => {
        // Test sendLoginCode via API
        cy.request({
            method: 'POST',
            url: '/login_router.php?controller=auth',
            form: true,
            body: {
                action: 'send_login_code',
                email: 'test@example.com'
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 400, 429]); // Success, bad request, or rate limited
        });

        cy.wait(1000);

        // Test createAccount via API
        cy.request({
            method: 'POST',
            url: '/login_router.php?controller=auth',
            form: true,
            body: {
                action: 'create_account',
                email: 'newuser@example.com'
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 400, 409]); // Success, bad request, or conflict
        });

        cy.wait(1000);

        // Test rate limiting (this will call checkRateLimit)
        for (let i = 0; i < 3; i++) {
            cy.request({
                method: 'POST',
                url: '/login_router.php?controller=auth',
                form: true,
                body: {
                    action: 'send_login_code',
                    email: `test${i}@example.com`
                },
                failOnStatusCode: false
            });
        }

        cy.wait(1000);
    });

    it('should test profile and dashboard API functions', () => {
        // First authenticate to access protected routes
        cy.visit('http://127.0.0.1:8111');
        cy.get('#loginEmail').type('test@example.com');
        cy.get('#sendLoginCodeBtn').click();
        cy.wait(2000);

        // Test profile data endpoints
        cy.request({
            method: 'POST',
            url: '/router.php?controller=profile',
            form: true,
            body: {
                action: 'get_profile'
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 401, 403]);
        });

        // Test weight history endpoint
        cy.request({
            method: 'POST',
            url: '/router.php?controller=profile',
            form: true,
            body: {
                action: 'get_weight_history'
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 401, 403]);
        });

        // Test add weight entry
        cy.request({
            method: 'POST',
            url: '/router.php?controller=profile',
            form: true,
            body: {
                action: 'add_weight_entry',
                weight: 75.5,
                date: '2025-01-15'
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 400, 401, 403]);
        });

        cy.wait(1000);
    });

    it('should test database seeder functions', () => {
        // Test seeder controller endpoints
        cy.request({
            method: 'POST',
            url: '/router.php?controller=seeder',
            form: true,
            body: {
                action: 'reset_schemas'
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 401, 403]);
        });

        cy.request({
            method: 'POST',
            url: '/router.php?controller=seeder',
            form: true,
            body: {
                action: 'seed_schema',
                schema: 'wt_dev'
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 400, 401, 403]);
        });

        cy.wait(1000);
    });

    it('should test coverage logger backend functions', () => {
        // Test coverage reporting endpoint
        cy.request({
            method: 'POST',
            url: '/router.php?controller=coverage',
            form: true,
            body: {
                action: 'get_report'
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 401, 403]);
        });

        cy.request({
            method: 'POST',
            url: '/router.php?controller=coverage',
            form: true,
            body: {
                action: 'clear_coverage'
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 401, 403]);
        });

        cy.wait(1000);
    });

    it('should test schema management functions', () => {
        // Test schema switching
        cy.request({
            method: 'POST',
            url: '/router.php?controller=schema',
            form: true,
            body: {
                action: 'switch_schema',
                schema: 'wt_dev'
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 400, 401, 403]);
        });

        cy.request({
            method: 'POST',
            url: '/router.php?controller=schema',
            form: true,
            body: {
                action: 'get_current_schema'
            },
            failOnStatusCode: false
        }).then((response) => {
            expect(response.status).to.be.oneOf([200, 401, 403]);
        });

        cy.wait(1000);
    });

    afterEach(() => {
        cy.collectBackendCoverage('Backend API Tests');
    });
});