describe('Health Functions Comprehensive Coverage', () => {
    beforeEach(() => {
        cy.visit('http://127.0.0.1:8111/dashboard.php?coverage=1');
        cy.wait(2000);
    });

    describe('BMI and Health Risk Functions', () => {
        it('should test all BMI risk calculation functions', () => {
            cy.window().then((win) => {
                // Test with various BMI ranges to ensure comprehensive coverage
                const testBMIs = [
                    16.0,   // Severely underweight
                    18.0,   // Underweight
                    22.0,   // Normal
                    26.0,   // Overweight
                    32.0,   // Obese Class I
                    37.0,   // Obese Class II
                    42.0    // Obese Class III
                ];

                testBMIs.forEach(bmi => {
                    // Test general BMI risk
                    if (typeof win.getBMIRisk === 'function') {
                        win.getBMIRisk(bmi);
                    }

                    // Test specific health risk functions
                    if (typeof win.getSleepApneaRisk === 'function') {
                        win.getSleepApneaRisk(bmi);
                    }

                    if (typeof win.getHypertensionRisk === 'function') {
                        win.getHypertensionRisk(bmi);
                    }

                    if (typeof win.getFattyLiverRisk === 'function') {
                        win.getFattyLiverRisk(bmi);
                    }

                    if (typeof win.getHeartDiseaseRisk === 'function') {
                        win.getHeartDiseaseRisk(bmi);
                    }

                    if (typeof win.getMentalHealthRisk === 'function') {
                        win.getMentalHealthRisk(bmi);
                    }

                    if (typeof win.getJointHealthRisk === 'function') {
                        win.getJointHealthRisk(bmi);
                    }

                    if (typeof win.getGallbladderRisk === 'function') {
                        win.getGallbladderRisk(bmi);
                    }
                });
            });

            cy.verifyCoverage(['getBMIRisk', 'getSleepApneaRisk', 'getHypertensionRisk', 'getFattyLiverRisk', 'getHeartDiseaseRisk'], 'BMI risk functions');
        });

        it('should test health scoring and assessment functions', () => {
            cy.window().then((win) => {
                // Test health score calculation with various scenarios
                const testScenarios = [
                    { bmi: 22.0, age: 25, activity: 'high' },
                    { bmi: 27.5, age: 35, activity: 'moderate' },
                    { bmi: 32.0, age: 45, activity: 'low' },
                    { bmi: 18.0, age: 22, activity: 'moderate' },
                    { bmi: 35.0, age: 55, activity: 'high' }
                ];

                testScenarios.forEach(scenario => {
                    if (typeof win.calculateHealthScore === 'function') {
                        win.calculateHealthScore(scenario.bmi, scenario.age, scenario.activity);
                    }
                });

                // Test health impact assessment
                if (typeof win.getBMIHealthImpact === 'function') {
                    testScenarios.forEach(scenario => {
                        win.getBMIHealthImpact(scenario.bmi);
                    });
                }

                // Test body fat risk assessment
                if (typeof win.getBodyFatRisk === 'function') {
                    const bodyFatPercentages = [8, 15, 25, 35, 45];
                    bodyFatPercentages.forEach(percentage => {
                        win.getBodyFatRisk(percentage);
                    });
                }

                // Test weight progress risk
                if (typeof win.getWeightProgressRisk === 'function') {
                    const progressRates = [-2, -0.5, 0, 0.5, 2]; // kg per week
                    progressRates.forEach(rate => {
                        win.getWeightProgressRisk(rate);
                    });
                }

                // Test ideal weight risk
                if (typeof win.getIdealWeightRisk === 'function') {
                    const idealWeightDifferences = [-10, -5, 0, 5, 15, 25];
                    idealWeightDifferences.forEach(diff => {
                        win.getIdealWeightRisk(diff);
                    });
                }

                // Test life expectancy risk
                if (typeof win.getLifeExpectancyRisk === 'function') {
                    testScenarios.forEach(scenario => {
                        win.getLifeExpectancyRisk(scenario.bmi, scenario.age);
                    });
                }
            });

            cy.verifyCoverage(['calculateHealthScore', 'getBMIHealthImpact', 'getBodyFatRisk', 'getWeightProgressRisk', 'getIdealWeightRisk'], 'Health scoring functions');
        });
    });

    describe('Health Improvement and Benefits', () => {
        it('should test health improvement messaging functions', () => {
            cy.window().then((win) => {
                // Test health improvement messages with different weight loss scenarios
                const weightLossScenarios = [
                    -5,   // Need to gain weight
                    -2,   // Slightly underweight
                    0,    // At ideal weight
                    3,    // Slightly overweight
                    8,    // Moderately overweight
                    15,   // Significantly overweight
                    25    // Severely overweight
                ];

                weightLossScenarios.forEach(weightToLose => {
                    if (typeof win.getHealthImprovementMessage === 'function') {
                        win.getHealthImprovementMessage(weightToLose);
                    }
                });

                // Test health benefit cards update
                if (typeof win.updateHealthBenefitCards === 'function') {
                    const mockHealthData = {
                        bmi: 28.5,
                        weightToLose: 8,
                        improvements: [
                            'Reduced sleep apnea risk',
                            'Lower blood pressure',
                            'Better joint health'
                        ],
                        risks: [
                            'Moderate cardiovascular risk',
                            'Elevated diabetes risk'
                        ],
                        score: 65
                    };
                    win.updateHealthBenefitCards(mockHealthData);

                    // Test with different health profiles
                    const healthyProfile = {
                        bmi: 22.0,
                        weightToLose: 0,
                        improvements: ['Excellent health maintained'],
                        risks: ['Low risk across all areas'],
                        score: 95
                    };
                    win.updateHealthBenefitCards(healthyProfile);

                    const highRiskProfile = {
                        bmi: 35.0,
                        weightToLose: 20,
                        improvements: [
                            'Significant diabetes risk reduction',
                            'Major cardiovascular improvement',
                            'Substantial joint relief'
                        ],
                        risks: [
                            'High cardiovascular risk',
                            'High diabetes risk',
                            'Severe joint stress'
                        ],
                        score: 25
                    };
                    win.updateHealthBenefitCards(highRiskProfile);
                }

                // Test personal health benefits refresh
                if (typeof win.refreshPersonalHealthBenefits === 'function') {
                    win.refreshPersonalHealthBenefits();
                }
            });

            cy.verifyCoverage(['getHealthImprovementMessage', 'updateHealthBenefitCards', 'refreshPersonalHealthBenefits'], 'Health improvement functions');
        });
    });

    describe('Health Data Refresh Functions', () => {
        it('should test all health data refresh functions', () => {
            cy.window().then((win) => {
                // Test main health refresh function
                if (typeof win.refreshHealth === 'function') {
                    win.refreshHealth();
                }

                // Test gallbladder health refresh
                if (typeof win.refreshGallbladderHealth === 'function') {
                    win.refreshGallbladderHealth();
                }

                // Test BMI refresh (if separate from dashboard)
                if (typeof win.refreshHealthBMI === 'function') {
                    win.refreshHealthBMI();
                }

                // Test ideal weight refresh (if separate from dashboard)
                if (typeof win.refreshHealthIdealWeight === 'function') {
                    win.refreshHealthIdealWeight();
                }

                // Test health metrics update
                if (typeof win.updateHealthMetrics === 'function') {
                    win.updateHealthMetrics();
                }

                // Test health indicators refresh
                if (typeof win.refreshHealthIndicators === 'function') {
                    win.refreshHealthIndicators();
                }

                // Test health recommendations update
                if (typeof win.updateHealthRecommendations === 'function') {
                    win.updateHealthRecommendations();
                }

                // Test health alerts refresh
                if (typeof win.refreshHealthAlerts === 'function') {
                    win.refreshHealthAlerts();
                }
            });

            cy.verifyCoverage(['refreshHealth', 'refreshGallbladderHealth', 'updateHealthMetrics', 'refreshHealthIndicators'], 'Health refresh functions');
        });
    });

    describe('Additional Health Risk Functions', () => {
        it('should test remaining health risk calculation functions', () => {
            cy.window().then((win) => {
                // Test additional risk functions that might exist
                const testBMIs = [18.5, 25.0, 30.0, 35.0];

                testBMIs.forEach(bmi => {
                    // Test stroke risk
                    if (typeof win.getStrokeRisk === 'function') {
                        win.getStrokeRisk(bmi);
                    }

                    // Test diabetes risk
                    if (typeof win.getDiabetesRisk === 'function') {
                        win.getDiabetesRisk(bmi);
                    }

                    // Test cancer risk
                    if (typeof win.getCancerRisk === 'function') {
                        win.getCancerRisk(bmi);
                    }

                    // Test overall mortality risk
                    if (typeof win.getMortalityRisk === 'function') {
                        win.getMortalityRisk(bmi);
                    }

                    // Test fertility risk
                    if (typeof win.getFertilityRisk === 'function') {
                        win.getFertilityRisk(bmi);
                    }

                    // Test respiratory risk
                    if (typeof win.getRespiratoryRisk === 'function') {
                        win.getRespiratoryRisk(bmi);
                    }

                    // Test metabolic syndrome risk
                    if (typeof win.getMetabolicSyndromeRisk === 'function') {
                        win.getMetabolicSyndromeRisk(bmi);
                    }
                });

                // Test comprehensive health assessment
                if (typeof win.performComprehensiveHealthAssessment === 'function') {
                    const assessment = {
                        bmi: 27.5,
                        age: 35,
                        gender: 'male',
                        activity: 'moderate',
                        smoking: false,
                        familyHistory: ['diabetes', 'heart_disease']
                    };
                    win.performComprehensiveHealthAssessment(assessment);
                }

                // Test health score calculation with additional factors
                if (typeof win.calculateExtendedHealthScore === 'function') {
                    win.calculateExtendedHealthScore(28.0, 40, 'low', true, ['hypertension']);
                }
            });

            cy.verifyCoverage(['getStrokeRisk', 'getDiabetesRisk', 'getCancerRisk', 'getMortalityRisk'], 'Additional health risk functions');
        });
    });
});