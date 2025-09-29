describe('Health Calculations Function Coverage', () => {
    beforeEach(() => {
        cy.visit('http://127.0.0.1:8111/dashboard.php?coverage=1');
        cy.wait(2000);
    });

    describe('Health Risk Assessment Functions', () => {
        it('should test BMI and weight-related health risk functions', () => {
            cy.window().then((win) => {
                // Test BMI risk function
                if (typeof win.getBMIRisk === 'function') {
                    const lowBMI = win.getBMIRisk(18.0);  // Underweight
                    expect(lowBMI).to.be.a('string');

                    const normalBMI = win.getBMIRisk(22.0);  // Normal
                    expect(normalBMI).to.be.a('string');

                    const overweightBMI = win.getBMIRisk(27.0);  // Overweight
                    expect(overweightBMI).to.be.a('string');

                    const obeseBMI = win.getBMIRisk(32.0);  // Obese
                    expect(obeseBMI).to.be.a('string');
                }

                // Test sleep apnea risk
                if (typeof win.getSleepApneaRisk === 'function') {
                    const sleepRisk1 = win.getSleepApneaRisk(22.0);
                    expect(sleepRisk1).to.be.a('string');

                    const sleepRisk2 = win.getSleepApneaRisk(32.0);
                    expect(sleepRisk2).to.be.a('string');
                }

                // Test hypertension risk
                if (typeof win.getHypertensionRisk === 'function') {
                    const hyperRisk1 = win.getHypertensionRisk(22.0);
                    expect(hyperRisk1).to.be.a('string');

                    const hyperRisk2 = win.getHypertensionRisk(30.0);
                    expect(hyperRisk2).to.be.a('string');
                }

                // Test fatty liver risk
                if (typeof win.getFattyLiverRisk === 'function') {
                    const liverRisk1 = win.getFattyLiverRisk(22.0);
                    expect(liverRisk1).to.be.a('string');

                    const liverRisk2 = win.getFattyLiverRisk(28.0);
                    expect(liverRisk2).to.be.a('string');
                }

                // Test heart disease risk
                if (typeof win.getHeartDiseaseRisk === 'function') {
                    const heartRisk1 = win.getHeartDiseaseRisk(22.0);
                    expect(heartRisk1).to.be.a('string');

                    const heartRisk2 = win.getHeartDiseaseRisk(35.0);
                    expect(heartRisk2).to.be.a('string');
                }

                // Test mental health risk
                if (typeof win.getMentalHealthRisk === 'function') {
                    const mentalRisk1 = win.getMentalHealthRisk(22.0);
                    expect(mentalRisk1).to.be.a('string');

                    const mentalRisk2 = win.getMentalHealthRisk(18.0);
                    expect(mentalRisk2).to.be.a('string');
                }

                // Test joint health risk
                if (typeof win.getJointHealthRisk === 'function') {
                    const jointRisk1 = win.getJointHealthRisk(22.0);
                    expect(jointRisk1).to.be.a('string');

                    const jointRisk2 = win.getJointHealthRisk(30.0);
                    expect(jointRisk2).to.be.a('string');
                }
            });

            cy.verifyCoverage(['getBMIRisk', 'getSleepApneaRisk', 'getHypertensionRisk', 'getFattyLiverRisk', 'getHeartDiseaseRisk'], 'Health risk assessment functions');
        });

        it('should test advanced health calculation functions', () => {
            cy.window().then((win) => {
                // Test health score calculation
                if (typeof win.calculateHealthScore === 'function') {
                    const healthScore1 = win.calculateHealthScore(22.0, 30, 'moderate');
                    expect(healthScore1).to.be.a('number');

                    const healthScore2 = win.calculateHealthScore(32.0, 45, 'low');
                    expect(healthScore2).to.be.a('number');

                    const healthScore3 = win.calculateHealthScore(18.0, 25, 'high');
                    expect(healthScore3).to.be.a('number');
                }

                // Test gallbladder risk (arrow function)
                if (typeof win.getGallbladderRisk === 'function') {
                    const gallRisk1 = win.getGallbladderRisk(22.0, 'female');
                    expect(gallRisk1).to.be.a('string');

                    const gallRisk2 = win.getGallbladderRisk(30.0, 'male');
                    expect(gallRisk2).to.be.a('string');
                }

                // Test BMI health impact (arrow function)
                if (typeof win.getBMIHealthImpact === 'function') {
                    const bmiImpact1 = win.getBMIHealthImpact(22.0);
                    expect(bmiImpact1).to.be.a('string');

                    const bmiImpact2 = win.getBMIHealthImpact(35.0);
                    expect(bmiImpact2).to.be.a('string');
                }

                // Test body fat risk (arrow function)
                if (typeof win.getBodyFatRisk === 'function') {
                    const bodyFatRisk1 = win.getBodyFatRisk(15, 'male');
                    expect(bodyFatRisk1).to.be.a('string');

                    const bodyFatRisk2 = win.getBodyFatRisk(25, 'female');
                    expect(bodyFatRisk2).to.be.a('string');
                }

                // Test weight progress risk (arrow function)
                if (typeof win.getWeightProgressRisk === 'function') {
                    const progressRisk1 = win.getWeightProgressRisk(5);  // gaining
                    expect(progressRisk1).to.be.a('string');

                    const progressRisk2 = win.getWeightProgressRisk(-10); // losing fast
                    expect(progressRisk2).to.be.a('string');
                }

                // Test ideal weight risk (arrow function)
                if (typeof win.getIdealWeightRisk === 'function') {
                    const idealRisk1 = win.getIdealWeightRisk(5);   // 5kg over ideal
                    expect(idealRisk1).to.be.a('string');

                    const idealRisk2 = win.getIdealWeightRisk(-3);  // 3kg under ideal
                    expect(idealRisk2).to.be.a('string');
                }

                // Test life expectancy risk (arrow function)
                if (typeof win.getLifeExpectancyRisk === 'function') {
                    const lifeRisk1 = win.getLifeExpectancyRisk(22.0, 30);
                    expect(lifeRisk1).to.be.a('string');

                    const lifeRisk2 = win.getLifeExpectancyRisk(35.0, 50);
                    expect(lifeRisk2).to.be.a('string');
                }
            });

            cy.verifyCoverage(['calculateHealthScore', 'getGallbladderRisk', 'getBMIHealthImpact', 'getBodyFatRisk'], 'Advanced health calculation functions');
        });

        it('should test health improvement and benefit functions', () => {
            cy.window().then((win) => {
                // Test health improvement message
                if (typeof win.getHealthImprovementMessage === 'function') {
                    const improvementMsg1 = win.getHealthImprovementMessage(5);   // 5kg to lose
                    expect(improvementMsg1).to.be.a('string');

                    const improvementMsg2 = win.getHealthImprovementMessage(-2);  // 2kg underweight
                    expect(improvementMsg2).to.be.a('string');

                    const improvementMsg3 = win.getHealthImprovementMessage(0);   // at ideal weight
                    expect(improvementMsg3).to.be.a('string');
                }

                // Test update health benefit cards
                if (typeof win.updateHealthBenefitCards === 'function') {
                    const mockBenefits = {
                        bmi: 22.5,
                        improvements: ['Better sleep', 'Reduced joint pain'],
                        risks: ['Low cardiovascular risk']
                    };
                    win.updateHealthBenefitCards(mockBenefits);
                }

                // Test refresh health functions
                if (typeof win.refreshHealth === 'function') {
                    win.refreshHealth();
                }

                if (typeof win.refreshPersonalHealthBenefits === 'function') {
                    win.refreshPersonalHealthBenefits();
                }

                if (typeof win.refreshGallbladderHealth === 'function') {
                    win.refreshGallbladderHealth();
                }
            });

            cy.verifyCoverage(['getHealthImprovementMessage', 'updateHealthBenefitCards', 'refreshHealth', 'refreshGallbladderHealth'], 'Health improvement functions');
        });
    });

    describe('Health Data Refresh and UI Functions', () => {
        it('should test all health refresh functions through UI interactions', () => {
            // Add some test data first
            cy.get('#weightKg').clear().type('75');
            cy.get('#btn-add-weight').click();
            cy.wait(1000);

            cy.get('#heightCm').clear().type('175');
            cy.get('#age').clear().type('30');
            cy.get('#btn-save-profile').click();
            cy.wait(1000);

            // Navigate to health tab to trigger functions
            cy.get('#health-tab').click();
            cy.wait(1000);

            cy.window().then((win) => {
                // Test category function (arrow function in refreshBMI)
                if (typeof win.getCategory === 'function') {
                    const category1 = win.getCategory(22.0);
                    expect(category1).to.be.a('string');

                    const category2 = win.getCategory(30.0);
                    expect(category2).to.be.a('string');
                }
            });

            cy.verifyCoverage(['refreshBMI', 'refreshIdealWeight', 'getCategory'], 'Health UI refresh functions');
        });

        it('should test health functions with various BMI ranges', () => {
            cy.window().then((win) => {
                // Test with multiple BMI values to trigger different code paths
                const bmiValues = [16.0, 18.5, 22.0, 25.0, 27.5, 30.0, 35.0, 40.0];

                bmiValues.forEach(bmi => {
                    // Test each risk function with different BMI values
                    if (typeof win.getBMIRisk === 'function') {
                        win.getBMIRisk(bmi);
                    }
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
                });
            });

            cy.verifyCoverage(['getBMIRisk', 'getSleepApneaRisk', 'getHypertensionRisk'], 'Health functions with multiple BMI ranges');
        });
    });
});