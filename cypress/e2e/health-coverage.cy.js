describe('Health Module Coverage Tests', () => {
    beforeEach(() => {
        // Initialize coverage tracking
        cy.initCoverage();
        cy.enableCoverageTracking();

        // Visit dashboard to load all scripts
        cy.visit('/dashboard.php', { failOnStatusCode: false });
        cy.wait(1500); // Ensure scripts are loaded
    });

    afterEach(() => {
        // Collect coverage after each test
        cy.collectCoverage();
        cy.collectBackendCoverage();
    });

    describe('BMI Risk Calculation Functions', () => {
        it('should test getBMIRisk() function across all BMI ranges', () => {
            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.getBMIRisk).to.be.a('function');

                // Test normal weight range
                expect(win.getBMIRisk(22)).to.equal(8);
                expect(win.getBMIRisk(24.9)).to.equal(8);

                // Test overweight range
                expect(win.getBMIRisk(25)).to.equal(15);
                expect(win.getBMIRisk(29.9)).to.equal(15);

                // Test obese class I
                expect(win.getBMIRisk(30)).to.equal(25);
                expect(win.getBMIRisk(34.9)).to.equal(25);

                // Test obese class II
                expect(win.getBMIRisk(35)).to.equal(35);
                expect(win.getBMIRisk(39.9)).to.equal(35);

                // Test obese class III
                expect(win.getBMIRisk(40)).to.equal(45);
                expect(win.getBMIRisk(50)).to.equal(45);
            });

            cy.verifyCoverage(['getBMIRisk'], 'BMI diabetes risk calculation across all weight categories');
        });

        it('should test getSleepApneaRisk() function across all BMI ranges', () => {
            cy.window().then((win) => {
                // Test sleep apnea risk calculation
                expect(win.getSleepApneaRisk(22)).to.equal(10);
                expect(win.getSleepApneaRisk(27)).to.equal(20);
                expect(win.getSleepApneaRisk(32)).to.equal(35);
                expect(win.getSleepApneaRisk(37)).to.equal(50);
                expect(win.getSleepApneaRisk(42)).to.equal(65);
            });

            cy.verifyCoverage(['getSleepApneaRisk'], 'Sleep apnea risk calculation based on BMI');
        });

        it('should test getHypertensionRisk() function across all BMI ranges', () => {
            cy.window().then((win) => {
                // Test hypertension risk calculation
                expect(win.getHypertensionRisk(22)).to.equal(15);
                expect(win.getHypertensionRisk(27)).to.equal(25);
                expect(win.getHypertensionRisk(32)).to.equal(40);
                expect(win.getHypertensionRisk(37)).to.equal(55);
                expect(win.getHypertensionRisk(42)).to.equal(70);
            });

            cy.verifyCoverage(['getHypertensionRisk'], 'Hypertension risk calculation based on BMI');
        });

        it('should test getFattyLiverRisk() function across all BMI ranges', () => {
            cy.window().then((win) => {
                // Test fatty liver risk calculation
                expect(win.getFattyLiverRisk(22)).to.equal(12);
                expect(win.getFattyLiverRisk(27)).to.equal(22);
                expect(win.getFattyLiverRisk(32)).to.equal(35);
                expect(win.getFattyLiverRisk(37)).to.equal(50);
                expect(win.getFattyLiverRisk(42)).to.equal(65);
            });

            cy.verifyCoverage(['getFattyLiverRisk'], 'Fatty liver risk calculation based on BMI');
        });

        it('should test getHeartDiseaseRisk() function across all BMI ranges', () => {
            cy.window().then((win) => {
                // Test heart disease risk calculation
                expect(win.getHeartDiseaseRisk(22)).to.equal(8);
                expect(win.getHeartDiseaseRisk(27)).to.equal(14);
                expect(win.getHeartDiseaseRisk(32)).to.equal(22);
                expect(win.getHeartDiseaseRisk(37)).to.equal(32);
                expect(win.getHeartDiseaseRisk(42)).to.equal(42);
            });

            cy.verifyCoverage(['getHeartDiseaseRisk'], 'Heart disease risk calculation based on BMI');
        });

        it('should test getMentalHealthRisk() function across all BMI ranges', () => {
            cy.window().then((win) => {
                // Test mental health risk calculation
                expect(win.getMentalHealthRisk(22)).to.equal(12);
                expect(win.getMentalHealthRisk(27)).to.equal(18);
                expect(win.getMentalHealthRisk(32)).to.equal(25);
                expect(win.getMentalHealthRisk(37)).to.equal(32);
                expect(win.getMentalHealthRisk(42)).to.equal(40);
            });

            cy.verifyCoverage(['getMentalHealthRisk'], 'Mental health risk calculation based on BMI');
        });

        it('should test getJointHealthRisk() function across all BMI ranges', () => {
            cy.window().then((win) => {
                // Test joint health risk calculation
                expect(win.getJointHealthRisk(22)).to.equal(15);
                expect(win.getJointHealthRisk(27)).to.equal(25);
                expect(win.getJointHealthRisk(32)).to.equal(35);
                expect(win.getJointHealthRisk(37)).to.equal(45);
                expect(win.getJointHealthRisk(42)).to.equal(55);
            });

            cy.verifyCoverage(['getJointHealthRisk'], 'Joint health risk calculation based on BMI');
        });
    });

    describe('Comprehensive Health Score Calculation', () => {
        it('should test calculateHealthScore() function with various BMI values', () => {
            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.calculateHealthScore).to.be.a('function');

                // Test healthy BMI (should give high health score)
                const healthyScore = win.calculateHealthScore(22);
                expect(healthyScore).to.be.at.least(85);
                expect(healthyScore).to.be.at.most(100);

                // Test overweight BMI (should give moderate health score)
                const overweightScore = win.calculateHealthScore(27);
                expect(overweightScore).to.be.at.least(70);
                expect(overweightScore).to.be.at.most(90);

                // Test obese BMI (should give lower health score)
                const obeseScore = win.calculateHealthScore(35);
                expect(obeseScore).to.be.at.least(50);
                expect(obeseScore).to.be.at.most(80);

                // Verify scores decrease as BMI increases
                expect(healthyScore).to.be.greaterThan(overweightScore);
                expect(overweightScore).to.be.greaterThan(obeseScore);
            });

            cy.verifyCoverage(['calculateHealthScore'], 'Comprehensive health score calculation across 14 health categories');
        });

        it('should test calculateHealthScore() edge cases', () => {
            cy.window().then((win) => {
                // Test underweight
                const underweightScore = win.calculateHealthScore(17);
                expect(underweightScore).to.be.a('number');
                expect(underweightScore).to.be.at.least(0);
                expect(underweightScore).to.be.at.most(100);

                // Test extremely high BMI
                const extremeObeseScore = win.calculateHealthScore(50);
                expect(extremeObeseScore).to.be.a('number');
                expect(extremeObeseScore).to.be.at.least(0);
                expect(extremeObeseScore).to.be.at.most(100);

                // Test borderline values
                const borderlineScore = win.calculateHealthScore(25);
                expect(borderlineScore).to.be.a('number');
            });

            cy.verifyCoverage(['calculateHealthScore'], 'Health score calculation with edge case BMI values');
        });
    });

    describe('Health Improvement Message Generation', () => {
        it('should test getHealthImprovementMessage() with positive improvements', () => {
            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.getHealthImprovementMessage).to.be.a('function');

                // Test extreme positive improvement
                const extremeMessage = win.getHealthImprovementMessage(70);
                expect(extremeMessage).to.contain('Incredible transformation');
                expect(extremeMessage).to.contain('strong');

                // Test moderate positive improvement
                const moderateMessage = win.getHealthImprovementMessage(25);
                expect(moderateMessage).to.contain('Wonderful achievement');
                expect(moderateMessage).to.contain('strong');

                // Test small positive improvement
                const smallMessage = win.getHealthImprovementMessage(5);
                expect(smallMessage).to.contain('Good progress');
                expect(smallMessage).to.contain('strong');
            });

            cy.verifyCoverage(['getHealthImprovementMessage'], 'Health improvement message generation for positive changes');
        });

        it('should test getHealthImprovementMessage() with negative changes', () => {
            cy.window().then((win) => {
                // Test small decline
                const smallDeclineMessage = win.getHealthImprovementMessage(-2);
                expect(smallDeclineMessage).to.contain('Time to refocus');
                expect(smallDeclineMessage).to.contain('strong');

                // Test moderate decline
                const moderateDeclineMessage = win.getHealthImprovementMessage(-10);
                expect(moderateDeclineMessage).to.contain('reverse this trend');
                expect(moderateDeclineMessage).to.contain('strong');

                // Test significant decline
                const significantDeclineMessage = win.getHealthImprovementMessage(-20);
                expect(significantDeclineMessage).to.contain('Significant concern');
                expect(significantDeclineMessage).to.contain('strong');
            });

            cy.verifyCoverage(['getHealthImprovementMessage'], 'Health improvement message generation for negative changes');
        });
    });

    describe('Health Data Refresh Functions', () => {
        it('should test refreshBMI() function with successful data', () => {
            // Mock successful BMI response
            cy.intercept('POST', '**/router.php?controller=profile', (req) => {
                if (req.body.action === 'get_bmi') {
                    req.reply({
                        statusCode: 200,
                        body: {
                            success: true,
                            bmi: 25.2,
                            category: 'overweight',
                            adjusted_bmi: 24.8,
                            adjusted_category: 'normal',
                            height_cm: 175
                        }
                    });
                } else if (req.body.action === 'get_weight_progress') {
                    req.reply({
                        statusCode: 200,
                        body: {
                            success: true,
                            start_weight_kg: 85.0,
                            current_weight_kg: 77.0
                        }
                    });
                }
            }).as('getBMIData');

            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.healthRefreshBMI).to.be.a('function');

                // Add mock BMI element to the page
                win.$('body').append('<div id="bmi-block"></div>');

                // Call the function
                win.healthRefreshBMI();

                cy.wait('@getBMIData');

                // Verify BMI data was displayed
                cy.get('#bmi-block').should('contain', '25.2');
                cy.get('#bmi-block').should('contain', 'overweight');
            });

            cy.verifyCoverage(['refreshBMI'], 'BMI data refresh with successful server response');
        });

        it('should test refreshHealth() function with successful data', () => {
            // Mock health stats and cardiovascular risk responses
            cy.intercept('POST', '**/router.php?controller=profile', (req) => {
                if (req.body.action === 'get_health_stats') {
                    req.reply({
                        statusCode: 200,
                        body: {
                            success: true,
                            estimated_body_fat_range: [18.5, 22.3],
                            height_cm: 175,
                            age: 30
                        }
                    });
                } else if (req.body.action === 'get_cardiovascular_risk') {
                    req.reply({
                        statusCode: 200,
                        body: {
                            success: true,
                            current_risk_percentage: 15,
                            current_risk_category: 'moderate',
                            risk_improvement_percentage: 5,
                            original_risk_percentage: 20,
                            original_risk_category: 'high',
                            research_note: 'Weight loss reduces cardiovascular risk'
                        }
                    });
                } else if (req.body.action === 'get_weight_progress') {
                    req.reply({
                        statusCode: 200,
                        body: {
                            success: true,
                            start_weight_kg: 85.0,
                            current_weight_kg: 77.0
                        }
                    });
                }
            }).as('getHealthData');

            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.healthRefreshHealth).to.be.a('function');

                // Add mock health elements to the page
                win.$('body').append(`
                    <div id="body-fat-block"></div>
                    <div id="cardio-risk-block"></div>
                `);

                // Call the function
                win.healthRefreshHealth();

                cy.wait('@getHealthData');

                // Verify health data was displayed
                cy.get('#body-fat-block').should('contain', '18.5–22.3%');
                cy.get('#cardio-risk-block').should('contain', '15%');
            });

            cy.verifyCoverage(['refreshHealth'], 'Health statistics refresh with body fat and cardiovascular data');
        });

        it('should test refreshIdealWeight() function with successful data', () => {
            // Mock ideal weight response
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: {
                    success: true,
                    min_weight_kg: 65,
                    max_weight_kg: 75,
                    timeline: {
                        target_date: '2024-06',
                        current_rate_kg_per_week: 0.5
                    },
                    note: 'Based on healthy BMI range 18.5-25'
                }
            }).as('getIdealWeight');

            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.healthRefreshIdealWeight).to.be.a('function');

                // Add mock ideal weight element to the page
                win.$('body').append('<div id="ideal-weight-block"></div>');

                // Call the function
                win.healthRefreshIdealWeight();

                cy.wait('@getIdealWeight');

                // Verify ideal weight data was displayed
                cy.get('#ideal-weight-block').should('contain', '65 - 75 kg');
                cy.get('#ideal-weight-block').should('contain', 'June 2024');
            });

            cy.verifyCoverage(['refreshIdealWeight'], 'Ideal weight calculation with timeline prediction');
        });

        it('should test refreshGallbladderHealth() function with successful data', () => {
            // Mock gallbladder health response
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: {
                    success: true,
                    gallbladder_status: 'Improved',
                    risk_reduction_percentage: 25,
                    weight_lost_kg: 8.0,
                    current_bmi: 24.5,
                    research_note: 'Weight loss reduces gallstone risk significantly'
                }
            }).as('getGallbladderHealth');

            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.healthRefreshGallbladderHealth).to.be.a('function');

                // Add mock gallbladder element to the page
                win.$('body').append('<div id="gallbladder-block"></div>');

                // Call the function
                win.healthRefreshGallbladderHealth();

                cy.wait('@getGallbladderHealth');

                // Verify gallbladder health data was displayed
                cy.get('#gallbladder-block').should('contain', 'Improved');
                cy.get('#gallbladder-block').should('contain', '25%');
            });

            cy.verifyCoverage(['refreshGallbladderHealth'], 'Gallbladder health assessment with risk reduction data');
        });
    });

    describe('Health Benefit Cards Update Function', () => {
        it('should test updateHealthBenefitCards() function with weight progress', () => {
            // Mock weight progress response with comprehensive data
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: {
                    success: true,
                    start_weight_kg: 85.0,
                    current_weight_kg: 77.0,
                    height_cm: 175
                }
            }).as('getWeightProgress');

            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.updateHealthBenefitCards).to.be.a('function');

                // Add mock health benefit elements to the page
                win.$('body').append(`
                    <div id="diabetes-block"></div>
                    <div id="sleep-apnea-block"></div>
                    <div id="hypertension-block"></div>
                    <div id="fatty-liver-block"></div>
                    <div id="heart-disease-block"></div>
                    <div id="mental-health-block"></div>
                    <div id="joint-health-block"></div>
                    <div id="life-expectancy-block"></div>
                    <div id="personal-benefits-calculator"></div>
                `);

                // Call the function
                win.updateHealthBenefitCards();

                cy.wait('@getWeightProgress');

                // Verify health benefit cards were updated
                cy.get('#diabetes-block').should('contain', 'Current Risk');
                cy.get('#sleep-apnea-block').should('contain', 'Risk reduced');
                cy.get('#personal-benefits-calculator').should('contain', '/100');
            });

            cy.verifyCoverage(['updateHealthBenefitCards'], 'Health benefit cards update with comprehensive progress data');
        });

        it('should test refreshPersonalHealthBenefits() function', () => {
            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.refreshPersonalHealthBenefits).to.be.a('function');

                // Mock updateHealthBenefitCards function
                win.updateHealthBenefitCards = cy.stub();

                // Call the function
                win.refreshPersonalHealthBenefits();

                // Verify it calls updateHealthBenefitCards
                expect(win.updateHealthBenefitCards).to.have.been.called;
            });

            cy.verifyCoverage(['refreshPersonalHealthBenefits'], 'Personal health benefits refresh delegation');
        });
    });

    describe('Error Handling Tests', () => {
        it('should test health functions with server errors', () => {
            // Mock server error responses
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 500,
                body: { success: false, message: 'Server error' }
            }).as('getServerError');

            cy.window().then((win) => {
                // Add mock elements
                win.$('body').append(`
                    <div id="bmi-block"></div>
                    <div id="body-fat-block"></div>
                    <div id="ideal-weight-block"></div>
                    <div id="gallbladder-block"></div>
                `);

                // Test each refresh function with errors
                win.healthRefreshBMI();
                win.healthRefreshHealth();
                win.healthRefreshIdealWeight();
                win.healthRefreshGallbladderHealth();

                cy.wait('@getServerError');

                // Verify error handling
                cy.get('#bmi-block').should('contain.text', 'Server error');
            });

            cy.verifyCoverage(['refreshBMI', 'refreshHealth', 'refreshIdealWeight', 'refreshGallbladderHealth'], 'Health function error handling for server failures');
        });
    });
});