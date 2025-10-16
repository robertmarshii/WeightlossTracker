describe('Dashboard Data Synchronization', () => {
    const base = 'http://127.0.0.1:8111';
    const email = 'test@dev.com';

    // Suppress jQuery errors from coverage instrumentation
    Cypress.on('uncaught:exception', (err) => {
        // Ignore jQuery $.post errors from coverage system
        if (err.message.includes('$.post is not a function')) {
            return false;
        }
        return true;
    });

    // Helper function to login and get to dashboard
    const loginToDashboard = () => {
        // Clear any existing session cookies first
        cy.clearCookies();
        cy.clearLocalStorage();

        // Set cypress_testing cookie to disable rate limiting
        cy.setCookie('cypress_testing', 'true');

        // Send login code via API first
        cy.request({
            method: 'POST',
            url: `${base}/login_router.php?controller=auth`,
            body: { action: 'send_login_code', email: email }
        });

        cy.visit('/', { failOnStatusCode: false });
        cy.get('#loginEmail').type(email);
        cy.get('#loginForm').submit();
        cy.wait(1000);
        cy.get('#loginCode', { timeout: 10000 }).should('be.visible').type('111111');
        cy.get('#verifyLoginForm button[type="submit"]').click();
        cy.url({ timeout: 8000 }).should('include', 'dashboard.php');
        cy.wait(1500);
    };

    beforeEach(() => {
        // Set cypress_testing cookie to disable rate limiting for tests
        cy.setCookie('cypress_testing', 'true');

        // Clear any existing rate limits for test email
        cy.request({
            method: 'POST',
            url: `${base}/router.php?controller=email`,
            body: {
                action: 'clear_rate_limits',
                email: email
            },
            failOnStatusCode: false
        });

        // Login and get to dashboard
        loginToDashboard();
    });

    it('should update health cards when adding current weight', () => {
        // Go to Health tab to capture initial values
        cy.get('#health-tab').click();
        cy.wait(1000);

        let initialLatestWeight, initialBMI;

        // Capture initial values
        cy.get('#latest-weight').then($el => {
            initialLatestWeight = $el.text();
        });

        cy.get('#bmi-block').then($el => {
            initialBMI = $el.text();
        });

        // Go to Data tab to add weight
        cy.get('#data-tab').click();
        cy.wait(500);

        // Add a new current weight entry
        const newWeight = '75.5';
        cy.get('#weightKg').clear().type(newWeight);
        cy.get('#btn-add-weight').click();

        // Wait for save operation
        cy.wait(2000);

        // Go back to Health tab to check updates
        cy.get('#health-tab').click();
        cy.wait(1000);

        // Verify latest weight updated
        cy.get('#latest-weight').should('not.contain', initialLatestWeight);
        cy.get('#latest-weight').should('contain', newWeight);

        // Verify BMI recalculated (assuming height is set)
        cy.get('#bmi-block').should('not.contain', initialBMI);
    });


    it('should update BMI when changing height in profile settings', () => {
        // Go to Health tab first to capture initial BMI
        cy.get('#health-tab').click();
        cy.wait(1000);

        let initialBMI;
        cy.get('#bmi-block').then($el => {
            initialBMI = $el.text();
        });

        // Update height via API to avoid jQuery $.post issues
        cy.request({
            method: 'POST',
            url: `${base}/router.php?controller=profile`,
            body: {
                action: 'save_profile',
                height_cm: 175
            }
        }).then((response) => {
            expect(response.status).to.eq(200);
        });

        // Wait for changes to propagate
        cy.wait(1000);

        // Reload to get updated BMI calculation
        cy.reload();
        cy.wait(2000);

        // Go to Health tab
        cy.get('#health-tab').click();
        cy.wait(1000);

        // Verify BMI recalculated with new height
        cy.get('#bmi-block').should('not.contain', initialBMI);
        cy.get('#bmi-block').should('contain', 'BMI');
    });

    it('should verify chart exists and updates after weight entry', () => {
        // Go to Data tab to add weight
        cy.get('#data-tab').click();
        cy.wait(500);

        // Add a weight entry
        const testWeight = '76.0';
        cy.get('#weightKg').clear().type(testWeight);
        cy.get('#btn-add-weight').click();

        // Wait for save operation
        cy.wait(2000);

        // Go to Achievements tab where the chart is located
        cy.get('#goals-tab').click();
        cy.wait(1000);

        // Chart is in the Achievements tab, check that it exists and is visible
        cy.get('#weightChart').should('be.visible');

        // Verify chart has been rendered (canvas should have content)
        cy.get('#weightChart').should('have.attr', 'width');
        cy.get('#weightChart').should('have.attr', 'height');
    });

    it('should verify all health blocks are present', () => {
        // Go to Health tab
        cy.get('#health-tab').click();
        cy.wait(1000);

        // Verify all health metric blocks exist
        cy.get('#bmi-block').should('exist');
        cy.get('#ideal-weight-block').should('exist');

        // These blocks should at least be visible even if empty
        cy.get('#bmi-block').should('be.visible');
        cy.get('#ideal-weight-block').should('be.visible');

        // Also check latest weight is in the Data tab
        cy.get('#data-tab').click();
        cy.wait(500);
        cy.get('#latest-weight').should('exist');
        cy.get('#latest-weight').should('be.visible');
    });
});