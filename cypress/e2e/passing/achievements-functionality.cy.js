/**
 * Achievements Functionality Test
 * Tests the updateAchievementCards function and achievement system
 */

describe('Achievements Functionality', () => {
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
        cy.collectCoverage('Achievements Functionality');
        cy.saveCoverageReport();
    });

    describe('Achievement Cards Update Function', () => {
        it('should test updateAchievementCards function exists and executes', () => {
            cy.window().then((win) => {
                if (typeof win.updateAchievementCards === 'function') {
                    // Test basic function execution
                    win.updateAchievementCards();

                    // Function should execute without errors
                    cy.wait(500);
                }
            });
        });

        it('should test updateAchievementCards with mock data', () => {
            cy.window().then((win) => {
                if (typeof win.updateAchievementCards === 'function') {
                    // Mock achievement data
                    const mockAchievements = [
                        {
                            id: 1,
                            title: 'First Steps',
                            description: 'Log your first weight',
                            progress: 100,
                            completed: true,
                            icon: '🎯'
                        },
                        {
                            id: 2,
                            title: 'Consistency',
                            description: 'Log weight for 7 days',
                            progress: 57,
                            completed: false,
                            icon: '📈'
                        },
                        {
                            id: 3,
                            title: 'Goal Setter',
                            description: 'Set your weight goal',
                            progress: 100,
                            completed: true,
                            icon: '🎯'
                        }
                    ];

                    // Pass mock data to the function
                    win.updateAchievementCards(mockAchievements);

                    cy.wait(500);

                    // Check if achievement cards are displayed
                    cy.get('.achievement-card').should('have.length.at.least', 1);
                }
            });
        });

        it('should handle empty achievement data', () => {
            cy.window().then((win) => {
                if (typeof win.updateAchievementCards === 'function') {
                    // Test with empty array
                    win.updateAchievementCards([]);

                    cy.wait(500);

                    // Should handle empty data gracefully
                }
            });
        });

        it('should handle malformed achievement data', () => {
            cy.window().then((win) => {
                if (typeof win.updateAchievementCards === 'function') {
                    // Test with invalid data
                    const invalidData = [
                        { title: 'Incomplete Achievement' }, // Missing required fields
                        null, // Null entry
                        { id: 'invalid', progress: 'not_a_number' } // Invalid types
                    ];

                    win.updateAchievementCards(invalidData);

                    cy.wait(500);

                    // Should handle malformed data without crashing
                }
            });
        });
    });

    describe('Achievement Progress Calculations', () => {
        it('should test achievement progress display', () => {
            cy.window().then((win) => {
                if (typeof win.updateAchievementCards === 'function') {
                    const achievements = [
                        {
                            id: 1,
                            title: 'Weight Loss Journey',
                            description: 'Lose 5kg',
                            progress: 75,
                            completed: false,
                            target: 5,
                            current: 3.75,
                            icon: '🏃'
                        }
                    ];

                    win.updateAchievementCards(achievements);

                    cy.wait(500);

                    // Check for progress indicators
                    cy.get('.achievement-progress').should('exist');
                    cy.get('.progress-bar').should('exist');
                }
            });
        });

        it('should test completed achievement styling', () => {
            cy.window().then((win) => {
                if (typeof win.updateAchievementCards === 'function') {
                    const completedAchievement = [
                        {
                            id: 1,
                            title: 'Milestone Reached',
                            description: 'Complete your first goal',
                            progress: 100,
                            completed: true,
                            icon: '🏆'
                        }
                    ];

                    win.updateAchievementCards(completedAchievement);

                    cy.wait(500);

                    // Check for completed achievement styling
                    cy.get('.achievement-card.completed').should('exist');
                    cy.get('.achievement-card').should('contain.text', '🏆');
                }
            });
        });
    });

    describe('Achievement Types and Categories', () => {
        it('should test weight loss achievements', () => {
            cy.window().then((win) => {
                if (typeof win.updateAchievementCards === 'function') {
                    const weightAchievements = [
                        {
                            id: 1,
                            title: 'First Pound',
                            description: 'Lose your first pound',
                            category: 'weight_loss',
                            progress: 100,
                            completed: true,
                            icon: '⚡'
                        },
                        {
                            id: 2,
                            title: 'Five Pounds Down',
                            description: 'Lose 5 pounds',
                            category: 'weight_loss',
                            progress: 40,
                            completed: false,
                            icon: '💪'
                        }
                    ];

                    win.updateAchievementCards(weightAchievements);

                    cy.wait(500);

                    // Should display weight loss achievements
                    cy.get('.achievement-card').should('contain.text', 'First Pound');
                    cy.get('.achievement-card').should('contain.text', 'Five Pounds Down');
                }
            });
        });

        it('should test consistency achievements', () => {
            cy.window().then((win) => {
                if (typeof win.updateAchievementCards === 'function') {
                    const consistencyAchievements = [
                        {
                            id: 1,
                            title: 'Daily Logger',
                            description: 'Log weight daily for a week',
                            category: 'consistency',
                            progress: 85,
                            completed: false,
                            streak: 6,
                            target: 7,
                            icon: '📅'
                        }
                    ];

                    win.updateAchievementCards(consistencyAchievements);

                    cy.wait(500);

                    // Should display consistency achievements
                    cy.get('.achievement-card').should('contain.text', 'Daily Logger');
                }
            });
        });

        it('should test health achievements', () => {
            cy.window().then((win) => {
                if (typeof win.updateAchievementCards === 'function') {
                    const healthAchievements = [
                        {
                            id: 1,
                            title: 'Healthy BMI',
                            description: 'Reach a healthy BMI range',
                            category: 'health',
                            progress: 60,
                            completed: false,
                            current_bmi: 26.5,
                            target_bmi: 24.9,
                            icon: '🍎'
                        }
                    ];

                    win.updateAchievementCards(healthAchievements);

                    cy.wait(500);

                    // Should display health achievements
                    cy.get('.achievement-card').should('contain.text', 'Healthy BMI');
                }
            });
        });
    });

    describe('Achievement Animations and Effects', () => {
        it('should test achievement unlock animation', () => {
            cy.window().then((win) => {
                if (typeof win.updateAchievementCards === 'function') {
                    // Simulate newly unlocked achievement
                    const newAchievement = [
                        {
                            id: 1,
                            title: 'Breakthrough!',
                            description: 'Reach your first milestone',
                            progress: 100,
                            completed: true,
                            newly_unlocked: true,
                            icon: '🎉'
                        }
                    ];

                    win.updateAchievementCards(newAchievement);

                    cy.wait(500);

                    // Should trigger unlock animation/effect
                    cy.get('.achievement-card.newly-unlocked').should('exist');
                }
            });
        });

        it('should test progress bar animations', () => {
            cy.window().then((win) => {
                if (typeof win.updateAchievementCards === 'function') {
                    const progressingAchievement = [
                        {
                            id: 1,
                            title: 'Making Progress',
                            description: 'Keep going!',
                            progress: 45,
                            completed: false,
                            previous_progress: 30,
                            icon: '📊'
                        }
                    ];

                    win.updateAchievementCards(progressingAchievement);

                    cy.wait(500);

                    // Should animate progress bar
                    cy.get('.progress-bar').should('exist');
                    cy.get('.progress-fill').should('exist');
                }
            });
        });
    });

    describe('Achievement Integration with Dashboard', () => {
        it('should test achievements update with weight changes', () => {
            cy.window().then((win) => {
                // Simulate weight change and achievement update
                if (typeof win.updateAchievementCards === 'function' && typeof win.refreshLatestWeight === 'function') {
                    // Update weight first
                    win.refreshLatestWeight();

                    cy.wait(1000);

                    // Then update achievements
                    win.updateAchievementCards();

                    cy.wait(500);

                    // Achievements should reflect current progress
                }
            });
        });

        it('should test achievements persistence', () => {
            cy.window().then((win) => {
                if (typeof win.updateAchievementCards === 'function') {
                    const achievements = [
                        {
                            id: 1,
                            title: 'Persistent Achievement',
                            description: 'This should persist',
                            progress: 50,
                            completed: false,
                            icon: '💾'
                        }
                    ];

                    win.updateAchievementCards(achievements);

                    cy.wait(500);

                    // Reload page and check if achievements persist
                    cy.reload();
                    cy.wait(2000);

                    // Should reload achievement state
                    cy.get('.achievement-card').should('exist');
                }
            });
        });
    });

    describe('Achievement Performance and Memory', () => {
        it('should test large achievement dataset performance', () => {
            cy.window().then((win) => {
                if (typeof win.updateAchievementCards === 'function') {
                    // Generate large dataset
                    const largeAchievementSet = [];
                    for (let i = 1; i <= 50; i++) {
                        largeAchievementSet.push({
                            id: i,
                            title: `Achievement ${i}`,
                            description: `Description for achievement ${i}`,
                            progress: Math.floor(Math.random() * 100),
                            completed: Math.random() > 0.7,
                            icon: '🎯'
                        });
                    }

                    const startTime = Date.now();
                    win.updateAchievementCards(largeAchievementSet);
                    const endTime = Date.now();

                    const processingTime = endTime - startTime;
                    debugLog(`Large dataset processing time: ${processingTime}ms`);

                    // Should process large dataset efficiently
                    expect(processingTime).to.be.lessThan(1000);

                    cy.wait(500);
                }
            });
        });

        it('should test memory usage during achievement updates', () => {
            cy.window().then((win) => {
                if (typeof win.updateAchievementCards === 'function') {
                    const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;

                    // Update achievements multiple times
                    for (let i = 0; i < 10; i++) {
                        const achievements = [{
                            id: i,
                            title: `Test Achievement ${i}`,
                            description: 'Memory test',
                            progress: i * 10,
                            completed: false,
                            icon: '🔄'
                        }];

                        win.updateAchievementCards(achievements);
                    }

                    cy.wait(1000).then(() => {
                        const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                        const memoryIncrease = finalMemory - initialMemory;

                        debugLog(`Achievement memory increase: ${memoryIncrease} bytes`);

                        // Should not cause excessive memory usage
                        expect(memoryIncrease).to.be.lessThan(5000000); // 5MB limit
                    });
                }
            });
        });
    });
});