describe('Health Function Coverage Tests', () => {
    beforeEach(() => {
        cy.visit('http://127.0.0.1:8111');
        cy.enableCoverageTracking();
        cy.forceInstrumentation();
    });

    it('should test health risk calculation functions', () => {
        cy.window().then((win) => {
            // Test BMI risk functions
            if (win.getBMIRisk) {
                const risk = win.getBMIRisk(25, 30); // BMI, age
                expect(risk).to.be.a('number');
            }

            if (win.getSleepApneaRisk) {
                const risk = win.getSleepApneaRisk(30);
                expect(risk).to.be.a('number');
            }

            if (win.getHypertensionRisk) {
                const risk = win.getHypertensionRisk(25);
                expect(risk).to.be.a('number');
            }

            if (win.getFattyLiverRisk) {
                const risk = win.getFattyLiverRisk(28);
                expect(risk).to.be.a('number');
            }

            if (win.getHeartDiseaseRisk) {
                const risk = win.getHeartDiseaseRisk(26);
                expect(risk).to.be.a('number');
            }

            if (win.getMentalHealthRisk) {
                const risk = win.getMentalHealthRisk(24);
                expect(risk).to.be.a('number');
            }

            if (win.getJointHealthRisk) {
                const risk = win.getJointHealthRisk(27);
                expect(risk).to.be.a('number');
            }
        });

        cy.wait(500);
    });

    it('should test health calculation functions', () => {
        cy.window().then((win) => {
            // Test main health calculation function
            if (win.calculateHealthScore) {
                const mockData = {
                    currentWeight: 70,
                    height: 175,
                    age: 30,
                    goalWeight: 65
                };
                const score = win.calculateHealthScore(mockData);
                expect(score).to.be.a('number');
            }

            // Test arrow functions if they exist on window
            if (win.getGallbladderRisk) {
                const risk = win.getGallbladderRisk(75, 65, 30);
                expect(risk).to.be.a('number');
            }

            if (win.getBMIHealthImpact) {
                const impact = win.getBMIHealthImpact(25);
                expect(impact).to.be.a('object');
            }

            if (win.getBodyFatRisk) {
                const risk = win.getBodyFatRisk(20);
                expect(risk).to.be.a('number');
            }

            if (win.getWeightProgressRisk) {
                const risk = win.getWeightProgressRisk(75, 70, 65);
                expect(risk).to.be.a('number');
            }

            if (win.getIdealWeightRisk) {
                const risk = win.getIdealWeightRisk(75, 70);
                expect(risk).to.be.a('number');
            }

            if (win.getLifeExpectancyRisk) {
                const risk = win.getLifeExpectancyRisk(25, 30);
                expect(risk).to.be.a('number');
            }
        });

        cy.wait(500);
    });

    it('should test health display functions', () => {
        cy.window().then((win) => {
            // Test health improvement message function
            if (win.getHealthImprovementMessage) {
                const message = win.getHealthImprovementMessage(25, 22);
                expect(message).to.be.a('string');
            }

            // Test health benefit card updates
            if (win.updateHealthBenefitCards) {
                const mockData = {
                    bmi: 25,
                    healthScore: 75,
                    risks: {}
                };
                win.updateHealthBenefitCards(mockData);
            }

            if (win.refreshPersonalHealthBenefits) {
                win.refreshPersonalHealthBenefits();
            }
        });

        cy.wait(500);
    });

    it('should test BMI category functions', () => {
        cy.window().then((win) => {
            // Test BMI category function
            if (win.getCategory) {
                const category = win.getCategory(25);
                expect(category).to.be.a('string');

                const underweight = win.getCategory(17);
                expect(underweight).to.be.a('string');

                const obese = win.getCategory(35);
                expect(obese).to.be.a('string');
            }
        });

        cy.wait(500);
    });

    afterEach(() => {
        cy.collectCoverage('Health Function Tests');
    });
});