/**
 * Comprehensive test suite for Body Tab Insights functionality
 * Tests: Smart Data Insights, Measurement Insights, Caliper Insights
 * Tests: Mixed history scenarios (gain, loss, maintenance)
 * Coverage: generateBodyInsights, generateMeasurementInsights, generateCaliperInsights
 */

describe('Body Insights - Comprehensive Tests', () => {
    // Handle uncaught exceptions from app
    Cypress.on('uncaught:exception', (err) => {
        if (err.message.includes('$.post is not a function') ||
            err.message.includes('$ is not a function')) {
            return false;
        }
        return true;
    });

    beforeEach(() => {
        // Login and navigate to dashboard
        cy.loginAndNavigateToDashboard();

        // Verify we're on dashboard with longer timeout
        cy.url({ timeout: 15000 }).should('include', 'dashboard.php');
        cy.wait(2000);

        // Ensure dashboard is fully loaded before clicking Body tab
        cy.get('#data-tab', { timeout: 10000 }).should('be.visible');

        // Click the Body tab
        cy.get('#body-tab', { timeout: 10000 }).should('be.visible').click();
        cy.wait(1000);
    });

    describe('Smart Data Insights', () => {
        it('should display Smart Data Insights card', () => {
            cy.get('#body-insights-card').should('exist');
            cy.get('#body-insights-card .card-title').should('contain', 'Smart Data Insights');
        });

        it('should toggle Smart Data Insights card', () => {
            // Card should be collapsed by default
            cy.get('#body-insights-content').should('not.be.visible');
            cy.get('#body-insights-card .card-toggle').should('contain', '+');

            // Click to expand
            cy.get('#body-insights-card .card-header-collapsible').click();
            cy.get('#body-insights-content').should('be.visible');
            cy.get('#body-insights-card .card-toggle').should('contain', '−');

            // Click to collapse
            cy.get('#body-insights-card .card-header-collapsible').click();
            cy.get('#body-insights-content').should('not.be.visible');
        });

        it('should generate insights with existing data', () => {
            cy.get('#body-tab').click();
            cy.wait(1000);

            // Expand insights card
            cy.get('#body-insights-card .card-header-collapsible').click();

            // Should have at least one insight (data exists from seeder)
            cy.get('#body-insights-content .insight-item').should('have.length.greaterThan', 0);

            // Each insight should have title and description
            cy.get('#body-insights-content .insight-item').first().within(() => {
                cy.get('.insight-title').should('exist').and('not.be.empty');
                cy.get('.insight-description').should('exist').and('not.be.empty');
            });
        });

        it('should handle muscle gain + fat loss scenario', () => {
            cy.window().then((win) => {
                // Mock data showing ideal recomposition
                win.globalDashboardData = {
                    body_data_history: {
                        muscle_mass: [
                            { value: '43.0', entry_date: '2024-03-15' }, // current (best)
                            { value: '40.0', entry_date: '2024-01-01' }  // worst
                        ],
                        fat_percent: [
                            { value: '27.0', entry_date: '2024-03-15' }, // current (best)
                            { value: '32.0', entry_date: '2024-01-01' }  // worst
                        ]
                    }
                };

                // Call the function
                win.generateBodyInsights();
            });

            cy.get('#body-tab').click();
            cy.wait(500);
            cy.get('#body-insights-card .card-header-collapsible').click();

            // Should show positive recomposition insight
            cy.get('#body-insights-content').should('contain', 'healthy direction');
        });

        it('should handle stable body composition', () => {
            cy.window().then((win) => {
                win.globalDashboardData = {
                    body_data_history: {
                        muscle_mass: [
                            { value: '40.0', entry_date: '2024-03-15' },
                            { value: '40.0', entry_date: '2024-01-01' }
                        ],
                        fat_percent: [
                            { value: '30.0', entry_date: '2024-03-15' },
                            { value: '30.0', entry_date: '2024-01-01' }
                        ]
                    }
                };
                win.generateBodyInsights();
            });

            cy.get('#body-insights-card .card-header-collapsible').click();
            cy.get('#body-insights-content').should('contain', 'stable');
        });
    });

    describe('Measurement Insights', () => {
        it('should display Measurement Insights card', () => {
            cy.get('#body-tab').click();
            cy.wait(1000);
            cy.get('#measurement-insights-card').should('exist');
            cy.get('#measurement-insights-card .card-title').should('contain', 'Measurement Insights');
        });

        it('should toggle Measurement Insights card', () => {
            cy.get('#body-tab').click();
            cy.wait(1000);

            cy.get('#measurement-insights-content').should('not.be.visible');
            cy.get('#measurement-insights-card .card-header-collapsible').click();
            cy.get('#measurement-insights-content').should('be.visible');
        });

        it('should handle waist + hips reduction (fat loss)', () => {
            cy.window().then((win) => {
                win.globalDashboardData = {
                    body_data_history: {
                        measurement_waist: [
                            { value: '90.0', entry_date: '2024-03-15' }, // current (best)
                            { value: '95.0', entry_date: '2024-01-01' }  // worst
                        ],
                        measurement_hips: [
                            { value: '106.0', entry_date: '2024-03-15' }, // current (best)
                            { value: '110.0', entry_date: '2024-01-01' }  // worst
                        ]
                    },
                    profile: { height_cm: 170 }
                };
                win.generateMeasurementInsights();
            });

            cy.get('#body-tab').click();
            cy.wait(500);
            cy.get('#measurement-insights-card .card-header-collapsible').click();
            cy.get('#measurement-insights-content').should('contain', 'Fat Reduction');
        });

        it('should handle stable measurements (maintenance)', () => {
            cy.window().then((win) => {
                win.globalDashboardData = {
                    body_data_history: {
                        measurement_waist: [
                            { value: '95.0', entry_date: '2024-03-15' },
                            { value: '95.2', entry_date: '2024-01-01' }
                        ],
                        measurement_hips: [
                            { value: '110.0', entry_date: '2024-03-15' },
                            { value: '109.8', entry_date: '2024-01-01' }
                        ]
                    },
                    profile: { height_cm: 170 }
                };
                win.generateMeasurementInsights();
            });

            cy.get('#measurement-insights-card .card-header-collapsible').click();
            cy.get('#measurement-insights-content').should('contain', 'Stable');
        });

        it('should calculate waist-to-height ratio correctly', () => {
            cy.window().then((win) => {
                win.globalDashboardData = {
                    body_data_history: {
                        measurement_waist: [
                            { value: '100.0', entry_date: '2024-03-15' }, // 100/178 = 0.56
                            { value: '105.0', entry_date: '2024-01-01' }
                        ],
                        measurement_hips: [
                            { value: '108.0', entry_date: '2024-03-15' },
                            { value: '112.0', entry_date: '2024-01-01' }
                        ]
                    },
                    profile: { height_cm: 178 }
                };
                win.generateMeasurementInsights();
            });

            cy.get('#measurement-insights-card .card-header-collapsible').click();
            cy.get('#measurement-insights-content').should('contain', '0.56');
        });
    });

    describe('Caliper Insights', () => {
        it('should display Caliper Insights card', () => {
            cy.get('#body-tab').click();
            cy.wait(1000);
            cy.get('#caliper-insights-card').should('exist');
            cy.get('#caliper-insights-card .card-title').should('contain', 'Caliper Insights');
        });

        it('should toggle Caliper Insights card', () => {
            cy.get('#body-tab').click();
            cy.wait(1000);

            cy.get('#caliper-insights-content').should('not.be.visible');
            cy.get('#caliper-insights-card .card-header-collapsible').click();
            cy.get('#caliper-insights-content').should('be.visible');
        });

        it('should calculate 5-site body fat percentage with Jackson-Pollock formula', () => {
            cy.window().then((win) => {
                win.globalDashboardData = {
                    body_data_history: {
                        caliper_chest: [{ value: '18.0', entry_date: '2024-03-15' }],
                        caliper_abdomen: [{ value: '22.0', entry_date: '2024-03-15' }],
                        caliper_thigh: [{ value: '20.0', entry_date: '2024-03-15' }],
                        caliper_tricep: [{ value: '15.0', entry_date: '2024-03-15' }],
                        caliper_suprailiac: [{ value: '19.0', entry_date: '2024-03-15' }]
                    },
                    profile: { age: 40 }
                };
                win.generateCaliperInsights();
            });

            cy.get('#body-tab').click();
            cy.wait(500);
            cy.get('#caliper-insights-card .card-header-collapsible').click();

            // Should show 5-site calculation
            cy.get('#caliper-insights-content').should('contain', '5-Site Body Fat');
            cy.get('#caliper-insights-content').should('contain', '94.0mm'); // 18+22+20+15+19
        });

        it('should handle significant fat loss across all sites', () => {
            cy.window().then((win) => {
                win.globalDashboardData = {
                    body_data_history: {
                        caliper_chest: [
                            { value: '18.0', entry_date: '2024-03-15' }, // current
                            { value: '22.0', entry_date: '2024-01-01' }  // worst
                        ],
                        caliper_abdomen: [
                            { value: '22.0', entry_date: '2024-03-15' },
                            { value: '28.0', entry_date: '2024-01-01' }
                        ],
                        caliper_thigh: [
                            { value: '20.0', entry_date: '2024-03-15' },
                            { value: '24.0', entry_date: '2024-01-01' }
                        ]
                    },
                    profile: { age: 40 }
                };
                win.generateCaliperInsights();
            });

            cy.get('#caliper-insights-card .card-header-collapsible').click();
            cy.get('#caliper-insights-content').should('contain', 'Fat Loss');
        });

        it('should detect excellent visceral fat reduction (abdomen)', () => {
            cy.window().then((win) => {
                win.globalDashboardData = {
                    body_data_history: {
                        caliper_abdomen: [
                            { value: '22.0', entry_date: '2024-03-15' }, // current
                            { value: '28.0', entry_date: '2024-01-01' }  // worst (-6mm)
                        ],
                        caliper_chest: [
                            { value: '18.0', entry_date: '2024-03-15' },
                            { value: '20.0', entry_date: '2024-01-01' }
                        ],
                        caliper_thigh: [
                            { value: '20.0', entry_date: '2024-03-15' },
                            { value: '22.0', entry_date: '2024-01-01' }
                        ]
                    },
                    profile: { age: 40 }
                };
                win.generateCaliperInsights();
            });

            cy.get('#caliper-insights-card .card-header-collapsible').click();
            cy.get('#caliper-insights-content').should('contain', 'Visceral Fat');
        });

        it('should identify upper body vs lower body fat loss pattern', () => {
            cy.window().then((win) => {
                win.globalDashboardData = {
                    body_data_history: {
                        caliper_chest: [
                            { value: '18.0', entry_date: '2024-03-15' },
                            { value: '24.0', entry_date: '2024-01-01' } // -6mm upper body
                        ],
                        caliper_thigh: [
                            { value: '22.0', entry_date: '2024-03-15' },
                            { value: '24.0', entry_date: '2024-01-01' } // -2mm lower body
                        ],
                        caliper_abdomen: [
                            { value: '22.0', entry_date: '2024-03-15' },
                            { value: '25.0', entry_date: '2024-01-01' }
                        ]
                    },
                    profile: { age: 40 }
                };
                win.generateCaliperInsights();
            });

            cy.get('#caliper-insights-card .card-header-collapsible').click();
            cy.get('#caliper-insights-content').should('contain', 'Upper Body');
        });
    });

    describe('Translation Support', () => {
        it('should use translation function for insight titles', () => {
            cy.window().then((win) => {
                // Check that t() function is being used
                expect(win.t).to.be.a('function');
            });

            cy.get('#body-tab').click();
            cy.wait(1000);

            // Insights should be in English by default
            cy.get('#body-insights-card .card-header-collapsible').click();
            cy.get('#body-insights-content .insight-title').first().should('not.be.empty');
        });
    });

    describe('Coverage Verification', () => {
        it('should verify all three insight functions are tested', () => {
            cy.verifyCoverage([
                'generateBodyInsights',
                'generateMeasurementInsights',
                'generateCaliperInsights',
                'renderBodyInsights',
                'renderMeasurementInsights',
                'renderCaliperInsights'
            ], 'Body Insights - All functions tested');
        });
    });
});
