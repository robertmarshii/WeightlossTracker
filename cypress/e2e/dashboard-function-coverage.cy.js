describe('Dashboard Function Coverage Tests', () => {
    beforeEach(() => {
        // Login first to access dashboard
        cy.visit('http://127.0.0.1:8111');
        cy.enableCoverageTracking();
        cy.forceInstrumentation();

        // Quick login to get to dashboard
        cy.get('#loginEmail').type('test@example.com');
        cy.get('#sendLoginCodeBtn').click();
        cy.wait(2000);

        // Navigate to dashboard if not already there
        cy.url().then((url) => {
            if (!url.includes('dashboard.php')) {
                cy.visit('http://127.0.0.1:8111/app/frontend/dashboard.php');
                cy.wait(2000);
            }
        });
    });

    it('should test core dashboard data functions', () => {
        cy.window().then((win) => {
            // Test data loading functions
            if (win.refreshLatestWeight) {
                cy.wrap(null).then(() => win.refreshLatestWeight());
            }
            if (win.refreshGoal) {
                cy.wrap(null).then(() => win.refreshGoal());
            }
            if (win.loadProfile) {
                cy.wrap(null).then(() => win.loadProfile());
            }
            if (win.loadWeightHistory) {
                cy.wrap(null).then(() => win.loadWeightHistory());
            }
        });

        cy.wait(1000);
    });

    it('should test health calculation functions', () => {
        cy.window().then((win) => {
            // Test health refresh functions
            if (win.refreshBMI) {
                cy.wrap(null).then(() => win.refreshBMI());
            }
            if (win.refreshHealth) {
                cy.wrap(null).then(() => win.refreshHealth());
            }
            if (win.refreshIdealWeight) {
                cy.wrap(null).then(() => win.refreshIdealWeight());
            }
            if (win.refreshWeightProgress) {
                cy.wrap(null).then(() => win.refreshWeightProgress());
            }
            if (win.refreshGallbladderHealth) {
                cy.wrap(null).then(() => win.refreshGallbladderHealth());
            }
        });

        cy.wait(1000);
    });

    it('should test chart functions', () => {
        cy.window().then((win) => {
            // Test chart functions
            if (win.initWeightChart) {
                cy.wrap(null).then(() => win.initWeightChart());
            }
            if (win.updateWeightChart) {
                cy.wrap(null).then(() => win.updateWeightChart());
            }
            if (win.updateMonthlyChart) {
                cy.wrap(null).then(() => win.updateMonthlyChart());
            }
            if (win.updateWeeklyChart) {
                cy.wrap(null).then(() => win.updateWeeklyChart());
            }
            if (win.updateYearlyChart) {
                cy.wrap(null).then(() => win.updateYearlyChart());
            }
        });

        cy.wait(1000);
    });

    it('should test settings functions', () => {
        cy.window().then((win) => {
            // Test settings functions
            if (win.loadSettings) {
                cy.wrap(null).then(() => win.loadSettings());
            }
            if (win.updateDateExample) {
                cy.wrap(null).then(() => win.updateDateExample());
            }
            if (win.initializeWeightUnit) {
                cy.wrap(null).then(() => win.initializeWeightUnit());
            }
            if (win.initializeHeightUnit) {
                cy.wrap(null).then(() => win.initializeHeightUnit());
            }
        });

        cy.wait(1000);
    });

    it('should test weight management functions', () => {
        // Test adding weight entry
        cy.get('#newWeight').clear().type('75.5');
        cy.get('#newDate').clear().type('2025-01-15');
        cy.get('#btn-add-weight').click();
        cy.wait(2000);

        cy.window().then((win) => {
            // Test utility functions
            if (win.formatDate) {
                const testDate = win.formatDate('2025-01-15');
                expect(testDate).to.be.a('string');
            }
        });
    });

    afterEach(() => {
        cy.collectCoverage('Dashboard Function Tests');
    });
});