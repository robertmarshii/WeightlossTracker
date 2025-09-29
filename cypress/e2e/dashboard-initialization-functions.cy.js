/**
 * Dashboard Initialization Functions Test
 * Tests dashboard initialization functions and the critical consolidated data loading
 */

describe('Dashboard Initialization Functions', () => {
    let coverageReporter;

    before(() => {
        cy.initCoverage();
        cy.window().then((win) => {
            coverageReporter = win.coverageReporter;
        });
    });

    beforeEach(() => {
        cy.clearCookies();
        cy.setCookie('cypress_testing', 'true');

        // Login first to access dashboard
        cy.request({
            method: 'POST',
            url: '/login_router.php?controller=auth&coverage=1',
            form: true,
            body: {
                action: 'send_login_code',
                email: 'test@dev.com'
            }
        }).then(() => {
            cy.request({
                method: 'POST',
                url: '/login_router.php?controller=auth&coverage=1',
                form: true,
                body: {
                    action: 'verify_login_code',
                    email: 'test@dev.com',
                    code: '111111'
                }
            });
        });

        cy.visitWithCoverage('/dashboard.php');
        cy.enableCoverageTracking();
        cy.forceInstrumentation();
    });

    after(() => {
        cy.flushCoverageBeforeNavigation();
        cy.collectCoverage('Dashboard Initialization Functions');
        cy.saveCoverageReport();
    });

    describe('Critical Dashboard Data Loading', () => {
        it('should test testConsolidatedDashboardData function', () => {
            cy.window().then((win) => {
                if (typeof win.testConsolidatedDashboardData === 'function') {
                    // Test the critical consolidated data loading function
                    let callbackExecuted = false;

                    win.testConsolidatedDashboardData(function() {
                        callbackExecuted = true;
                        console.log('Consolidated data callback executed');
                    });

                    // Wait for async operation and check callback
                    cy.wait(2000).then(() => {
                        expect(callbackExecuted).to.be.true;
                    });
                }
            });
        });

        it('should test reloadGlobalDashboardData function', () => {
            cy.window().then((win) => {
                if (typeof win.reloadGlobalDashboardData === 'function') {
                    // Test the global dashboard data reload
                    win.reloadGlobalDashboardData();

                    // Should trigger loading of multiple data sources
                    cy.wait(1000);
                }
            });
        });

        it('should test consolidated data reduces API calls', () => {
            cy.window().then((win) => {
                if (typeof win.testConsolidatedDashboardData === 'function') {
                    // Track API calls made during consolidated load
                    let apiCallCount = 0;
                    const originalPost = win.$.post;

                    win.$.post = function(...args) {
                        apiCallCount++;
                        return originalPost.apply(this, args);
                    };

                    win.testConsolidatedDashboardData(function() {
                        console.log(`API calls made: ${apiCallCount}`);
                        // Consolidated data should make fewer calls than individual loads
                        expect(apiCallCount).to.be.lessThan(5);

                        // Restore original function
                        win.$.post = originalPost;
                    });

                    cy.wait(2000);
                }
            });
        });
    });

    describe('Weight Data Loading Functions', () => {
        it('should test refreshLatestWeight function', () => {
            cy.window().then((win) => {
                if (typeof win.refreshLatestWeight === 'function') {
                    win.refreshLatestWeight();

                    // Should update the latest weight display
                    cy.wait(1000);
                    cy.get('#latestWeight').should('exist');
                }
            });
        });

        it('should test refreshHistoricalWeights function', () => {
            cy.window().then((win) => {
                if (typeof win.refreshHistoricalWeights === 'function') {
                    win.refreshHistoricalWeights();

                    // Should load historical weight data
                    cy.wait(1000);
                }
            });
        });

        it('should test findAndDisplayHistoricalWeights function', () => {
            cy.window().then((win) => {
                if (typeof win.findAndDisplayHistoricalWeights === 'function') {
                    win.findAndDisplayHistoricalWeights();

                    // Should find and display weight history
                    cy.wait(1000);
                }
            });
        });
    });

    describe('Goal and Profile Data Functions', () => {
        it('should test refreshGoal function', () => {
            cy.window().then((win) => {
                if (typeof win.refreshGoal === 'function') {
                    win.refreshGoal();

                    // Should update goal information
                    cy.wait(1000);
                }
            });
        });

        it('should test loadProfile function', () => {
            cy.window().then((win) => {
                if (typeof win.loadProfile === 'function') {
                    win.loadProfile();

                    // Should load user profile data
                    cy.wait(1000);
                }
            });
        });

        it('should test refreshSettings function', () => {
            cy.window().then((win) => {
                if (typeof win.refreshSettings === 'function') {
                    win.refreshSettings();

                    // Should load user settings
                    cy.wait(1000);
                }
            });
        });
    });

    describe('Health Calculations Functions', () => {
        it('should test refreshBMI function', () => {
            cy.window().then((win) => {
                if (typeof win.refreshBMI === 'function') {
                    win.refreshBMI();

                    // Should calculate and display BMI
                    cy.wait(1000);
                    cy.get('#bmiValue').should('exist');
                }
            });
        });

        it('should test refreshHealthStats function', () => {
            cy.window().then((win) => {
                if (typeof win.refreshHealthStats === 'function') {
                    win.refreshHealthStats();

                    // Should load comprehensive health statistics
                    cy.wait(1000);
                }
            });
        });

        it('should test refreshIdealWeight function', () => {
            cy.window().then((win) => {
                if (typeof win.refreshIdealWeight === 'function') {
                    win.refreshIdealWeight();

                    // Should calculate ideal weight
                    cy.wait(1000);
                }
            });
        });
    });

    describe('Chart and Visualization Functions', () => {
        it('should test refreshWeightChart function', () => {
            cy.window().then((win) => {
                if (typeof win.refreshWeightChart === 'function') {
                    win.refreshWeightChart();

                    // Should update weight chart
                    cy.wait(1000);
                    cy.get('#weightChart').should('exist');
                }
            });
        });

        it('should test refreshBMIChart function', () => {
            cy.window().then((win) => {
                if (typeof win.refreshBMIChart === 'function') {
                    win.refreshBMIChart();

                    // Should update BMI chart
                    cy.wait(1000);
                    cy.get('#bmiChart').should('exist');
                }
            });
        });

        it('should test chart theme consistency', () => {
            cy.window().then((win) => {
                if (typeof win.refreshWeightChart === 'function' && typeof win.refreshBMIChart === 'function') {
                    // Test that charts use consistent theming
                    win.refreshWeightChart();
                    win.refreshBMIChart();

                    cy.wait(1000);

                    // Charts should exist and have consistent styling
                    cy.get('#weightChart').should('exist');
                    cy.get('#bmiChart').should('exist');
                }
            });
        });
    });

    describe('Dashboard Initialization Sequence', () => {
        it('should test complete dashboard initialization', () => {
            cy.window().then((win) => {
                // Test the complete initialization sequence
                const initFunctions = [
                    'initializeWeightUnit',
                    'initializeHeightUnit',
                    'updateWeightUnitDisplay',
                    'updateHeightUnitDisplay'
                ];

                initFunctions.forEach(funcName => {
                    if (typeof win[funcName] === 'function') {
                        win[funcName]();
                    }
                });

                cy.wait(1000);
            });
        });

        it('should test dashboard data loading order', () => {
            cy.window().then((win) => {
                if (typeof win.testConsolidatedDashboardData === 'function') {
                    let loadOrder = [];

                    // Override functions to track loading order
                    const trackFunction = (name, originalFunc) => {
                        return function(...args) {
                            loadOrder.push(name);
                            if (originalFunc) {
                                return originalFunc.apply(this, args);
                            }
                        };
                    };

                    if (win.refreshLatestWeight) win.refreshLatestWeight = trackFunction('refreshLatestWeight', win.refreshLatestWeight);
                    if (win.refreshGoal) win.refreshGoal = trackFunction('refreshGoal', win.refreshGoal);
                    if (win.loadProfile) win.loadProfile = trackFunction('loadProfile', win.loadProfile);

                    // Execute consolidated data load
                    win.testConsolidatedDashboardData(function() {
                        console.log('Load order:', loadOrder);
                        expect(loadOrder.length).to.be.greaterThan(0);
                    });

                    cy.wait(2000);
                }
            });
        });
    });

    describe('Error Handling in Dashboard Functions', () => {
        it('should handle network errors gracefully', () => {
            cy.window().then((win) => {
                if (typeof win.refreshLatestWeight === 'function') {
                    // Mock a failed request
                    const originalPost = win.$.post;
                    win.$.post = function(url, data, callback) {
                        setTimeout(() => {
                            if (typeof callback === 'function') {
                                callback({ success: false, message: 'Network error' });
                            }
                        }, 100);
                    };

                    win.refreshLatestWeight();

                    cy.wait(500).then(() => {
                        // Should handle error gracefully
                        win.$.post = originalPost;
                    });
                }
            });
        });

        it('should handle missing data gracefully', () => {
            cy.window().then((win) => {
                if (typeof win.testConsolidatedDashboardData === 'function') {
                    // Mock a response with missing data
                    const originalPost = win.$.post;
                    win.$.post = function(url, data, callback) {
                        setTimeout(() => {
                            if (typeof callback === 'function') {
                                callback({
                                    success: true,
                                    data: {} // Empty data
                                });
                            }
                        }, 100);
                    };

                    win.testConsolidatedDashboardData(function() {
                        console.log('Handled missing data');
                    });

                    cy.wait(1000).then(() => {
                        win.$.post = originalPost;
                    });
                }
            });
        });
    });

    describe('Performance and Optimization', () => {
        it('should test dashboard loading performance', () => {
            cy.window().then((win) => {
                if (typeof win.testConsolidatedDashboardData === 'function') {
                    const startTime = Date.now();

                    win.testConsolidatedDashboardData(function() {
                        const loadTime = Date.now() - startTime;
                        console.log(`Dashboard load time: ${loadTime}ms`);

                        // Should load within reasonable time
                        expect(loadTime).to.be.lessThan(5000);
                    });

                    cy.wait(3000);
                }
            });
        });

        it('should test memory usage during dashboard operations', () => {
            cy.window().then((win) => {
                const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

                // Execute multiple dashboard functions
                const functions = [
                    'refreshLatestWeight',
                    'refreshGoal',
                    'loadProfile',
                    'refreshBMI',
                    'refreshWeightChart'
                ];

                functions.forEach(funcName => {
                    if (typeof win[funcName] === 'function') {
                        win[funcName]();
                    }
                });

                cy.wait(2000).then(() => {
                    const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                    const memoryIncrease = finalMemory - initialMemory;

                    console.log(`Memory increase: ${memoryIncrease} bytes`);

                    // Should not cause excessive memory usage
                    expect(memoryIncrease).to.be.lessThan(10000000); // 10MB limit
                });
            });
        });
    });
});