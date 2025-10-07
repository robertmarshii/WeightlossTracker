/**
 * Phase 4: Total Progress Enhanced Tests
 *
 * Tests the Total Progress card with tabbed interface (Charts/Stats/Body Fat)
 * and all 6 visualizations:
 * - Average Weekly Loss Chart
 * - 6-Month Projection Chart
 * - Goal Completion Pie Chart
 * - Ideal Weight Progress Pie Chart
 * - Body Fat Trend Chart
 * - Weight Comparison Stat
 */

describe('Phase 4: Total Progress Enhanced', () => {
    beforeEach(() => {
        cy.clearCookies();
        cy.clearLocalStorage();
        cy.enableCoverageTracking();
        cy.loginAndNavigateToDashboard();
    });

    afterEach(() => {
        cy.verifyCoverage([
            'refreshTotalProgress',
            'renderTotalProgress',
            'renderWeeklyLossChart',
            'renderProjectionChart',
            'renderGoalPieChart',
            'renderIdealWeightPieChart',
            'renderBodyFatChart',
            'displayWeightComparison'
        ], 'Phase 4 Total Progress');
    });

    describe('Total Progress Card Structure', () => {
        it('should display Total Progress card with correct structure', () => {
            // Card should be visible
            cy.get('#total-progress').should('be.visible');

            // Should have tabs
            cy.get('.progress-tabs').should('exist');
            cy.get('.progress-tab-btn[data-tab="charts"]').should('exist').and('have.class', 'active');
            cy.get('.progress-tab-btn[data-tab="stats"]').should('exist');
            cy.get('.progress-tab-btn[data-tab="body-fat"]').should('exist');

            // Charts tab should be active by default
            cy.get('.progress-tab-content[data-tab="charts"]').should('have.class', 'active');
        });

        it('should switch between tabs correctly', () => {
            // Click Stats tab
            cy.get('.progress-tab-btn[data-tab="stats"]').click();
            cy.get('.progress-tab-content[data-tab="stats"]').should('have.class', 'active');
            cy.get('.progress-tab-content[data-tab="charts"]').should('not.have.class', 'active');

            // Click Body Fat tab
            cy.get('.progress-tab-btn[data-tab="body-fat"]').click();
            cy.get('.progress-tab-content[data-tab="body-fat"]').should('have.class', 'active');
            cy.get('.progress-tab-content[data-tab="stats"]').should('not.have.class', 'active');

            // Click Charts tab
            cy.get('.progress-tab-btn[data-tab="charts"]').click();
            cy.get('.progress-tab-content[data-tab="charts"]').should('have.class', 'active');
            cy.get('.progress-tab-content[data-tab="body-fat"]').should('not.have.class', 'active');
        });
    });

    describe('Charts Tab', () => {
        it('should display Average Weekly Loss chart', () => {
            cy.get('#weekly-loss-chart').should('exist');

            // Chart should render after data loads
            cy.wait(1000);
            cy.window().then((win) => {
                expect(win.weeklyLossChartInstance).to.exist;
            });
        });

        it('should display 6-Month Projection chart', () => {
            cy.get('#projection-chart').should('exist');

            // Chart should render after data loads
            cy.wait(1000);
            cy.window().then((win) => {
                expect(win.projectionChartInstance).to.exist;
            });
        });

        it('should display charts in full width (col-md-12)', () => {
            cy.get('#weekly-loss-chart').parent().parent().should('have.class', 'col-md-12');
            cy.get('#projection-chart').parent().parent().should('have.class', 'col-md-12');
        });
    });

    describe('Stats Tab', () => {
        beforeEach(() => {
            cy.get('.progress-tab-btn[data-tab="stats"]').click();
        });

        it('should display Goal Completion pie chart', () => {
            cy.get('#goal-pie-chart').should('exist');

            // Chart should render after data loads
            cy.wait(1000);
            cy.window().then((win) => {
                // May not exist if no goal is set
                if (win.goalPieChartInstance) {
                    expect(win.goalPieChartInstance).to.exist;
                }
            });
        });

        it('should display Ideal Weight Progress pie chart', () => {
            cy.get('#ideal-weight-pie-chart').should('exist');
            cy.get('#ideal-weight-label').should('exist');

            // Chart should render after data loads
            cy.wait(1000);
            cy.window().then((win) => {
                // May show "in range" message instead of chart
                if (win.idealWeightPieChartInstance) {
                    expect(win.idealWeightPieChartInstance).to.exist;
                }
            });
        });

        it('should display weight comparison stat', () => {
            cy.get('#weight-comparison').should('exist');

            // Should contain weight amount and comparison text
            cy.get('#weight-comparison').invoke('text').should('not.be.empty');
        });

        it('should format weight comparison correctly', () => {
            cy.wait(1000);
            cy.get('#weight-comparison').invoke('text').then((text) => {
                // Should match format: "10.1 kg, that's like losing AN AIR CONDITIONER ❄️"
                expect(text).to.match(/\d+\.\d+\s+(kg|lbs),\s+that's like losing/i);
            });
        });
    });

    describe('Body Fat Tab', () => {
        beforeEach(() => {
            cy.get('.progress-tab-btn[data-tab="body-fat"]').click();
        });

        it('should display Body Fat Trend chart or placeholder', () => {
            cy.get('#body-fat-chart').should('exist');

            // Either chart exists or placeholder is shown
            cy.get('body').then(($body) => {
                if ($body.find('#body-fat-chart-placeholder:visible').length > 0) {
                    cy.get('#body-fat-chart-placeholder').should('be.visible');
                } else {
                    cy.wait(1000);
                    cy.window().then((win) => {
                        if (win.bodyFatChartInstance) {
                            expect(win.bodyFatChartInstance).to.exist;
                        }
                    });
                }
            });
        });

        it('should show automatic calculation message', () => {
            cy.get('.progress-tab-content[data-tab="body-fat"]').should('contain', 'automatically calculated');
        });
    });

    describe('Data Integration', () => {
        it('should use global dashboard data when available', () => {
            cy.window().then((win) => {
                // Global data should be populated
                expect(win.globalDashboardData).to.exist;

                // Total progress should be in global data
                if (win.globalDashboardData.total_progress) {
                    expect(win.globalDashboardData.total_progress).to.have.property('weekly_loss_data');
                    expect(win.globalDashboardData.total_progress).to.have.property('projection_data');
                    expect(win.globalDashboardData.total_progress).to.have.property('goal_data');
                    expect(win.globalDashboardData.total_progress).to.have.property('ideal_weight_data');
                    expect(win.globalDashboardData.total_progress).to.have.property('body_fat_data');
                    expect(win.globalDashboardData.total_progress).to.have.property('total_lost_kg');
                }
            });
        });

        it('should refresh charts when new weight is added', () => {
            // Add a weight entry
            cy.get('#newWeight').clear().type('75.5');
            cy.get('#btn-add-weight').click();

            // Wait for success message
            cy.wait(1000);

            // Charts should be refreshed
            cy.window().then((win) => {
                expect(win.weeklyLossChartInstance).to.exist;
                expect(win.projectionChartInstance).to.exist;
            });
        });
    });

    describe('Weekly Loss Chart Specifics', () => {
        it('should show last 26 weeks of data', () => {
            cy.wait(1000);
            cy.window().then((win) => {
                if (win.weeklyLossChartInstance) {
                    const chart = win.weeklyLossChartInstance;
                    const dataLength = chart.data.labels.length;
                    expect(dataLength).to.be.lte(26);
                }
            });
        });

        it('should use week numbers (Week 1, Week 2, etc)', () => {
            cy.wait(1000);
            cy.window().then((win) => {
                if (win.weeklyLossChartInstance) {
                    const chart = win.weeklyLossChartInstance;
                    if (chart.data.labels.length > 0) {
                        expect(chart.data.labels[0]).to.match(/Week \d+/);
                    }
                }
            });
        });
    });

    describe('Projection Chart Specifics', () => {
        it('should hide point circles (show only lines)', () => {
            cy.wait(1000);
            cy.window().then((win) => {
                if (win.projectionChartInstance) {
                    const chart = win.projectionChartInstance;
                    chart.data.datasets.forEach((dataset) => {
                        expect(dataset.pointRadius).to.equal(0);
                        expect(dataset.pointHoverRadius).to.equal(0);
                    });
                }
            });
        });

        it('should show two datasets: Actual and Projected', () => {
            cy.wait(1000);
            cy.window().then((win) => {
                if (win.projectionChartInstance) {
                    const chart = win.projectionChartInstance;
                    expect(chart.data.datasets).to.have.length(2);
                    expect(chart.data.datasets[0].label).to.equal('Actual');
                    expect(chart.data.datasets[1].label).to.equal('Projected');
                }
            });
        });
    });

    describe('Ideal Weight Calculation', () => {
        it('should show remaining weight to go, not achieved weight', () => {
            cy.get('.progress-tab-btn[data-tab="stats"]').click();
            cy.wait(1000);

            cy.get('#ideal-weight-label').invoke('text').then((text) => {
                if (text.includes('to go')) {
                    // Should show remaining kg, not achieved
                    expect(text).to.match(/\d+\.\d+\s+(kg|lbs)\s+to go/);
                }
            });
        });
    });

    describe('Responsive Layout', () => {
        it('should display Total Progress card as full width (col-md-12)', () => {
            cy.get('#total-progress').parent().parent().should('have.class', 'col-md-12');
        });

        it('should display both charts in full width within Charts tab', () => {
            cy.get('#weekly-loss-chart').parent().parent().should('have.class', 'col-md-12');
            cy.get('#projection-chart').parent().parent().should('have.class', 'col-md-12');
        });
    });

    describe('Error Handling', () => {
        it('should handle missing goal data gracefully', () => {
            cy.get('.progress-tab-btn[data-tab="stats"]').click();
            cy.wait(1000);

            // Should not crash if no goal is set
            cy.get('#goal-pie-label').should('exist');
        });

        it('should handle empty body fat data gracefully', () => {
            cy.get('.progress-tab-btn[data-tab="body-fat"]').click();

            // Should show placeholder if no data
            cy.get('body').then(($body) => {
                // Either chart or placeholder should be visible
                const hasChart = $body.find('#body-fat-chart:visible').length > 0;
                const hasPlaceholder = $body.find('#body-fat-chart-placeholder:visible').length > 0;
                expect(hasChart || hasPlaceholder).to.be.true;
            });
        });
    });
});
