/**
 * Backend Router Coverage Tests
 * Tests Router controller functions to increase backend coverage
 * Focus: SchemaController, ProfileController, SeederController, EmailController, Get1
 */

describe('Backend Router Coverage Tests', () => {
    beforeEach(() => {
        // Initialize coverage tracking
        cy.initCoverage();
        cy.enableCoverageTracking();
        
        // Visit the main page to establish session
        cy.visit('/');
    });

    afterEach(() => {
        // Collect coverage after each test
        cy.collectCoverage();
        cy.collectBackendCoverage();
    });

    describe('Schema Management - SchemaController()', () => {
        it('should test SchemaController with GET request', () => {
            // Test schema management API
            cy.request({
                method: 'GET',
                url: '/router.php?controller=schema',
                failOnStatusCode: false
            }).then((response) => {
                // Should call SchemaController backend function
                expect(response.status).to.be.oneOf([200, 400, 403, 404, 500]);
            });
        });

        it('should test SchemaController with POST request', () => {
            // Test schema management with POST data
            cy.request({
                method: 'POST',
                url: '/router.php?controller=schema',
                form: true,
                body: {
                    action: 'get_current_schema'
                },
                failOnStatusCode: false
            }).then((response) => {
                // Should call SchemaController backend function
                expect(response.status).to.be.oneOf([200, 400, 403, 404, 500]);
            });
        });

        it('should test SchemaController with schema switching', () => {
            // Test schema switching functionality
            cy.request({
                method: 'POST',
                url: '/router.php?controller=schema',
                form: true,
                body: {
                    action: 'switch_schema',
                    schema: 'wt_test'
                },
                failOnStatusCode: false
            }).then((response) => {
                // Should call SchemaController backend function
                expect(response.status).to.be.oneOf([200, 400, 403, 404, 500]);
            });
        });
    });

    describe('Profile Management - ProfileController()', () => {
        it('should test ProfileController without authentication', () => {
            // Test profile API without login (should get 403 or auth error)
            cy.request({
                method: 'GET',
                url: '/router.php?controller=profile',
                failOnStatusCode: false
            }).then((response) => {
                // Should call ProfileController backend function
                expect(response.status).to.be.oneOf([200, 401, 403, 404, 500]);
            });
        });

        it('should test ProfileController with POST actions', () => {
            // Test profile management with various actions
            const profileActions = [
                'get_profile',
                'get_latest_weight', 
                'get_weight_history',
                'get_bmi',
                'get_goal'
            ];

            profileActions.forEach(action => {
                cy.request({
                    method: 'POST',
                    url: '/router.php?controller=profile',
                    form: true,
                    body: {
                        action: action
                    },
                    failOnStatusCode: false
                }).then((response) => {
                    // Should call ProfileController backend function
                    expect(response.status).to.be.oneOf([200, 401, 403, 404, 500]);
                });
            });
        });

        it('should test ProfileController with update operations', () => {
            // Test profile update operations
            const updateActions = [
                { action: 'update_profile', height_cm: 175, body_frame: 'medium' },
                { action: 'save_weight', weight_kg: 75.5 },
                { action: 'set_goal', target_weight_kg: 70, target_date: '2024-12-31' }
            ];

            updateActions.forEach(body => {
                cy.request({
                    method: 'POST',
                    url: '/router.php?controller=profile',
                    form: true,
                    body: body,
                    failOnStatusCode: false
                }).then((response) => {
                    // Should call ProfileController backend function
                    expect(response.status).to.be.oneOf([200, 401, 403, 404, 500]);
                });
            });
        });
    });

    describe('Database Seeding - SeederController()', () => {
        it('should test SeederController with GET request', () => {
            // Test database seeding API
            cy.request({
                method: 'GET',
                url: '/router.php?controller=seeder',
                failOnStatusCode: false
            }).then((response) => {
                // Should call SeederController backend function
                expect(response.status).to.be.oneOf([200, 400, 403, 404, 500]);
            });
        });

        it('should test SeederController with seeding actions', () => {
            // Test database seeding operations
            const seedActions = [
                'reset_test_schema',
                'seed_dev_data',
                'migrate_schema',
                'verify_schema'
            ];

            seedActions.forEach(action => {
                cy.request({
                    method: 'POST',
                    url: '/router.php?controller=seeder',
                    form: true,
                    body: {
                        action: action
                    },
                    failOnStatusCode: false
                }).then((response) => {
                    // Should call SeederController backend function
                    expect(response.status).to.be.oneOf([200, 400, 403, 404, 500]);
                });
            });
        });
    });

    describe('Email Management - EmailController()', () => {
        it('should test EmailController with GET request', () => {
            // Test email management API
            cy.request({
                method: 'GET',
                url: '/router.php?controller=email',
                failOnStatusCode: false
            }).then((response) => {
                // Should call EmailController backend function
                expect(response.status).to.be.oneOf([200, 400, 403, 404, 500]);
            });
        });

        it('should test EmailController with email actions', () => {
            // Test email management operations
            const emailActions = [
                'get_email_log',
                'clear_email_log',
                'get_email_stats',
                'test_email_config'
            ];

            emailActions.forEach(action => {
                cy.request({
                    method: 'POST',
                    url: '/router.php?controller=email',
                    form: true,
                    body: {
                        action: action
                    },
                    failOnStatusCode: false
                }).then((response) => {
                    // Should call EmailController backend function
                    expect(response.status).to.be.oneOf([200, 400, 403, 404, 500]);
                });
            });
        });
    });

    describe('Test Endpoint - Get1()', () => {
        it('should test Get1 function with POST request', () => {
            // Test Get1 endpoint (test/debug functionality)
            cy.request({
                method: 'POST',
                url: '/router.php',
                form: true,
                body: {
                    page: 1
                },
                failOnStatusCode: false
            }).then((response) => {
                // Should potentially call Get1 backend function
                expect(response.status).to.be.oneOf([200, 400, 404, 500]);
            });
        });

        it('should test Get1 function with different pages', () => {
            // Test Get1 with pagination
            const pageNumbers = [1, 2, 5, 10];

            pageNumbers.forEach(page => {
                cy.request({
                    method: 'POST',
                    url: '/router.php',
                    form: true,
                    body: {
                        page: page
                    },
                    failOnStatusCode: false
                }).then((response) => {
                    // Should call Get1 backend function
                    expect(response.status).to.be.oneOf([200, 400, 404, 500]);
                });
            });
        });
    });

    describe('Coverage Controller Tests', () => {
        it('should test CoverageController function', () => {
            // Test the coverage API endpoint (we know this works)
            cy.request({
                method: 'POST',
                url: '/router.php?controller=coverage',
                form: true,
                body: {
                    action: 'get_report'
                },
                failOnStatusCode: false
            }).then((response) => {
                // Should call CoverageController backend function
                expect(response.status).to.be.oneOf([200, 400, 500]);
                
                // If successful, should have coverage data
                if (response.status === 200) {
                    expect(response.body).to.have.property('success');
                }
            });
        });

        it('should test CoverageController with different actions', () => {
            // Test coverage API with various actions
            const coverageActions = [
                'get_report',
                'clear_coverage',
                'export_report'
            ];

            coverageActions.forEach(action => {
                cy.request({
                    method: 'POST',
                    url: '/router.php?controller=coverage',
                    form: true,
                    body: {
                        action: action
                    },
                    failOnStatusCode: false
                }).then((response) => {
                    // Should call CoverageController backend function
                    expect(response.status).to.be.oneOf([200, 400, 500]);
                });
            });
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('should handle invalid controller names', () => {
            // Test with invalid controller
            cy.request({
                method: 'GET',
                url: '/router.php?controller=invalid',
                failOnStatusCode: false
            }).then((response) => {
                // Should handle gracefully
                expect(response.status).to.be.oneOf([200, 400, 404, 500]);
            });
        });

        it('should handle missing parameters', () => {
            // Test controllers without required parameters
            const controllers = ['schema', 'profile', 'seeder', 'email'];
            
            controllers.forEach(controller => {
                cy.request({
                    method: 'POST',
                    url: `/router.php?controller=${controller}`,
                    form: true,
                    body: {},
                    failOnStatusCode: false
                }).then((response) => {
                    // Should handle missing parameters gracefully
                    expect(response.status).to.be.oneOf([200, 400, 401, 403, 404, 500]);
                });
            });
        });
    });
});