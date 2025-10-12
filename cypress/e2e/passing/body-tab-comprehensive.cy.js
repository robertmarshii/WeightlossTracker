/**
 * Comprehensive test suite for Body Tab functionality
 * Tests: Smart Data, Measurements, Calipers (Summary & History)
 * Tests: Historical entry forms with tab switching
 * Tests: Data saving and updating
 */

describe('Body Tab - Comprehensive Tests', () => {
    const base = 'http://127.0.0.1:8111';
    const email = 'test@dev.com';

    // Handle uncaught exceptions from app (jQuery loading timing issues)
    Cypress.on('uncaught:exception', (err) => {
        // Ignore jQuery errors from dashboard initialization
        if (err.message.includes('$.post is not a function') ||
            err.message.includes('$ is not a function')) {
            return false;
        }
        return true;
    });

    beforeEach(() => {
        // Set cypress_testing cookie to disable rate limiting
        cy.setCookie('cypress_testing', 'true');

        // Clear any existing rate limits
        cy.request({
            method: 'POST',
            url: `${base}/router.php?controller=email`,
            body: {
                action: 'clear_rate_limits',
                email: email
            },
            failOnStatusCode: false
        });

        // Send login code
        cy.request({
            method: 'POST',
            url: `${base}/login_router.php?controller=auth`,
            body: { action: 'send_login_code', email: email }
        });

        // Get the code via peek_code
        cy.request({
            method: 'POST',
            url: `${base}/login_router.php?controller=auth`,
            body: { action: 'peek_code', email: email }
        }).then((resp) => {
            const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
            const code = body.code || '111111';

            // Now visit and login with UI
            cy.visit(base);
            cy.get('#loginEmail').type(email);
            cy.get('#loginForm').submit();
            cy.wait(1000);

            cy.get('#loginCode').type(code);
            cy.get('#verifyLoginForm').submit();
            cy.wait(2000);

            // Navigate to Body tab
            cy.get('#body-tab').click();
            cy.wait(1000);
        });
    });

    describe('Body Tab - Navigation', () => {
        it('should navigate to Body tab with #page=body&area=summary', () => {
            cy.hash().should('include', 'page=body');
            cy.hash().should('include', 'area=summary');
        });

        it('should show Summary sub-tab as active by default', () => {
            cy.get('#summary-tab').should('have.class', 'active');
            cy.get('#summary').should('have.class', 'active');
        });

        it('should switch to History sub-tab', () => {
            cy.get('#history-tab').click();
            cy.wait(500);
            cy.get('#history-tab').should('have.class', 'active');
            cy.get('#history').should('have.class', 'active');
        });
    });

    describe('Summary Area - Smart Data Cards', () => {
        it('should display all Smart Data cards with Add Data buttons', () => {
            // Check all 4 Smart Data cards exist
            cy.contains('h5', 'Smart Data').should('be.visible');
            cy.contains('h6', 'Muscle Mass').should('be.visible');
            cy.contains('h6', 'Fat Percent').should('be.visible');
            cy.contains('h6', 'Water Percent').should('be.visible');
            cy.contains('h6', 'Bone Mass').should('be.visible');

            // Check Add Data buttons
            cy.get('#muscle-mass-value').siblings('button').contains('Add Data').should('exist');
            cy.get('#fat-percent-value').siblings('button').contains('Add Data').should('exist');
        });

        it('should toggle edit mode on Muscle Mass card', () => {
            cy.get('#muscle-mass-value').siblings('button').contains('Add Data').click();
            cy.wait(500);

            // Edit form should be visible
            cy.get('#muscle-mass-input').should('be.visible');

            // Back button should hide edit mode
            cy.get('#muscle-mass-input').closest('.glass-card-small').find('.toggle-back').click();
            cy.wait(500);
            cy.get('#muscle-mass-input').should('not.be.visible');
        });

        it('should save Muscle Mass data', () => {
            cy.get('#muscle-mass-value').siblings('button').contains('Add Data').click();
            cy.wait(500);

            cy.get('#muscle-mass-input').clear().type('45.5');
            cy.get('#btn-save-muscle-mass').click();
            cy.wait(2000);

            // Should show success message
            cy.get('.alert-success').should('be.visible');

            // Card should return to data view
            cy.get('#muscle-mass-input').should('not.be.visible');
            cy.get('#muscle-mass-value').should('contain', '45.5');
        });
    });

    describe('Summary Area - Measurements Cards', () => {
        it('should display all Measurements cards', () => {
            cy.contains('h5', 'Measurements').should('be.visible');
            cy.contains('h6', 'Neck').should('be.visible');
            cy.contains('h6', 'Breast').should('be.visible');
            cy.contains('h6', 'Waist').should('be.visible');
            cy.contains('h6', 'Hips').should('be.visible');
            cy.contains('h6', 'Thighs').should('be.visible');
            cy.contains('h6', 'Calves').should('be.visible');
            cy.contains('h6', 'Arms').should('be.visible');
        });

    });

    describe('Summary Area - Calipers Cards', () => {
        it('should display all Calipers cards', () => {
            cy.contains('h5', 'Calipers').should('be.visible');
            cy.contains('h6', 'Chest').should('be.visible');
            cy.contains('h6', 'Armpit').should('be.visible');
            cy.contains('h6', 'Belly').should('be.visible');
            cy.contains('h6', 'Hip').should('be.visible');
            cy.contains('h6', 'Thigh').should('be.visible');
        });

        it('should save Chest caliper data', () => {
            cy.contains('h6', 'Chest').siblings('.card-data-body').find('button').contains('Add Data').click();
            cy.wait(500);

            cy.get('#caliper-chest').clear().type('16.5');
            cy.get('#btn-save-caliper-chest').click();
            cy.wait(2000);

            cy.get('.alert-success').should('be.visible');
        });
    });

    describe('History Area - Smart Data History', () => {
        beforeEach(() => {
            cy.get('#history-tab').click();
            cy.wait(500);
        });

        it('should display Smart Data History with 4 tabs', () => {
            cy.contains('h5', 'Smart Data History').should('be.visible');
            cy.get('#muscle-history-tab').should('be.visible');
            cy.get('#fat-history-tab').should('be.visible');
            cy.get('#water-history-tab').should('be.visible');
            cy.get('#bone-history-tab').should('be.visible');
        });

        it('should switch between Smart Data history tabs', () => {
            cy.get('#fat-history-tab').click();
            cy.wait(500);
            cy.get('#fat-history').should('have.class', 'active');

            cy.get('#water-history-tab').click();
            cy.wait(500);
            cy.get('#water-history').should('have.class', 'active');
        });

        it('should show Add Entry button on each tab', () => {
            cy.get('#muscle-history').find('.btn-add-historical-entry').should('be.visible');

            cy.get('#fat-history-tab').click();
            cy.wait(500);
            cy.get('#fat-history').find('.btn-add-historical-entry').should('be.visible');
        });
    });

    describe('History Area - Measurements History', () => {
        beforeEach(() => {
            cy.get('#history-tab').click();
            cy.wait(500);
        });

        it('should display Measurements History with 7 tabs', () => {
            cy.contains('h5', 'Measurements History').should('be.visible');
            cy.get('#neck-history-tab').should('be.visible');
            cy.get('#breast-history-tab').should('be.visible');
            cy.get('#waist-history-tab').should('be.visible');
            cy.get('#hips-history-tab').should('be.visible');
            cy.get('#thighs-history-tab').should('be.visible');
            cy.get('#calves-history-tab').should('be.visible');
            cy.get('#arms-history-tab').should('be.visible');
        });

        it('should switch between Measurements history tabs', () => {
            cy.get('#breast-history-tab').click();
            cy.wait(500);
            cy.get('#breast-history').should('have.class', 'active');
        });
    });

    describe('History Area - Calipers History', () => {
        beforeEach(() => {
            cy.get('#history-tab').click();
            cy.wait(500);
        });

        it('should display Calipers History with 5 tabs', () => {
            cy.contains('h5', 'Calipers History').should('be.visible');
            cy.get('#caliper-chest-history-tab').should('be.visible');
            cy.get('#caliper-armpit-history-tab').should('be.visible');
            cy.get('#caliper-belly-history-tab').should('be.visible');
            cy.get('#caliper-hip-history-tab').should('be.visible');
            cy.get('#caliper-thigh-history-tab').should('be.visible');
        });

        it('should switch between Calipers history tabs', () => {
            cy.get('#caliper-armpit-history-tab').click();
            cy.wait(500);
            cy.get('#caliper-armpit-history').should('have.class', 'active');
        });
    });

    describe('Historical Entry Form - Form 1 (Smart Data)', () => {
        beforeEach(() => {
            cy.get('#history-tab').click();
            cy.wait(500);
        });

        it('should open Form 1 when clicking Add Entry on Muscle Mass', () => {
            cy.get('#muscle-history').find('.btn-add-historical-entry').click();
            cy.wait(500);

            cy.get('#add-historical-entry-form-1').should('not.have.class', 'hidden');
            cy.get('#historical-entry-label-1').should('contain', 'Muscle Mass');
            cy.get('#historical-entry-label-1').should('contain', '%');
        });

        it('should update Form 1 label when switching to Fat Percent tab', () => {
            cy.get('#muscle-history').find('.btn-add-historical-entry').click();
            cy.wait(500);

            cy.get('#historical-entry-label-1').should('contain', 'Muscle Mass');

            // Switch tab
            cy.get('#fat-history-tab').click();
            cy.wait(500);

            // Label should update
            cy.get('#historical-entry-label-1').should('contain', 'Fat Percent');
        });

        it('should save historical Muscle Mass entry', () => {
            cy.get('#muscle-history').find('.btn-add-historical-entry').click();
            cy.wait(500);

            cy.get('#historical-entry-value-1').type('42.5');
            cy.get('#historical-entry-date-1').type('01/01/2025');
            cy.get('#btn-save-historical-entry-1').click();
            cy.wait(2000);

            cy.get('.alert-success').should('be.visible');
            cy.get('#add-historical-entry-form-1').should('have.class', 'hidden');
        });

        it('should cancel Form 1', () => {
            cy.get('#muscle-history').find('.btn-add-historical-entry').click();
            cy.wait(500);

            cy.get('#btn-cancel-historical-entry-1').click();
            cy.wait(500);

            cy.get('#add-historical-entry-form-1').should('have.class', 'hidden');
        });
    });

    describe('Historical Entry Form - Form 2 (Measurements)', () => {
        beforeEach(() => {
            cy.get('#history-tab').click();
            cy.wait(500);
        });

        it('should open Form 2 when clicking Add Entry on Neck', () => {
            cy.get('#neck-history').find('.btn-add-historical-entry').click();
            cy.wait(500);

            cy.get('#add-historical-entry-form-2').should('not.have.class', 'hidden');
            cy.get('#historical-entry-label-2').should('contain', 'Measurement Neck');
            cy.get('#historical-entry-label-2').should('contain', 'cm');
        });

        it('should update Form 2 label when switching to Breast tab', () => {
            cy.get('#neck-history').find('.btn-add-historical-entry').click();
            cy.wait(500);

            cy.get('#historical-entry-label-2').should('contain', 'Neck');

            cy.get('#breast-history-tab').click();
            cy.wait(500);

            cy.get('#historical-entry-label-2').should('contain', 'Chest');
        });

        it('should save historical Neck measurement', () => {
            cy.get('#neck-history').find('.btn-add-historical-entry').click();
            cy.wait(500);

            cy.get('#historical-entry-value-2').type('39.5');
            cy.get('#historical-entry-date-2').type('01/01/2025');
            cy.get('#btn-save-historical-entry-2').click();
            cy.wait(2000);

            cy.get('.alert-success').should('be.visible');
            cy.get('#add-historical-entry-form-2').should('have.class', 'hidden');
        });
    });

    describe('Historical Entry Form - Form 3 (Calipers)', () => {
        beforeEach(() => {
            cy.get('#history-tab').click();
            cy.wait(500);
        });

        it('should open Form 3 when clicking Add Entry on Chest caliper', () => {
            cy.get('#caliper-chest-history').find('.btn-add-historical-entry').click();
            cy.wait(500);

            cy.get('#add-historical-entry-form-3').should('not.have.class', 'hidden');
            cy.get('#historical-entry-label-3').should('contain', 'Caliper Chest');
            cy.get('#historical-entry-label-3').should('contain', 'mm');
        });

        it('should update Form 3 label when switching to Armpit tab', () => {
            cy.get('#caliper-chest-history').find('.btn-add-historical-entry').click();
            cy.wait(500);

            cy.get('#historical-entry-label-3').should('contain', 'Chest');

            cy.get('#caliper-armpit-history-tab').click();
            cy.wait(500);

            cy.get('#historical-entry-label-3').should('contain', 'Abdomen');
        });

        it('should save historical Chest caliper measurement', () => {
            cy.get('#caliper-chest-history').find('.btn-add-historical-entry').click();
            cy.wait(500);

            cy.get('#historical-entry-value-3').type('17.5');
            cy.get('#historical-entry-date-3').type('01/01/2025');
            cy.get('#btn-save-historical-entry-3').click();
            cy.wait(2000);

            cy.get('.alert-success').should('be.visible');
            cy.get('#add-historical-entry-form-3').should('have.class', 'hidden');
        });
    });

    describe('Form Behavior Tests', () => {
        beforeEach(() => {
            cy.get('#history-tab').click();
            cy.wait(500);
        });

        it('should maintain separate form state for each section', () => {
            // Open Form 1 (Smart Data - Muscle Mass)
            cy.get('#muscle-history').find('.btn-add-historical-entry').click();
            cy.wait(500);
            cy.get('#add-historical-entry-form-1').should('not.have.class', 'hidden');
            cy.get('#historical-entry-label-1').should('contain', 'Muscle Mass');

            // Enter data in Form 1
            cy.get('#historical-entry-value-1').type('43.0');
            cy.get('#historical-entry-date-1').type('02/01/2025');

            // Switch to Fat Percent tab - form should update label
            cy.get('#fat-history-tab').click();
            cy.wait(500);
            cy.get('#historical-entry-label-1').should('contain', 'Fat Percent');

            // Data should still be there
            cy.get('#historical-entry-value-1').should('have.value', '43.0');
            cy.get('#historical-entry-date-1').should('have.value', '02/01/2025');
        });

        it('should save data from different form sections sequentially', () => {
            // Save to Form 1 (Smart Data)
            cy.get('#muscle-history').find('.btn-add-historical-entry').click();
            cy.wait(500);
            cy.get('#historical-entry-value-1').type('43.0');
            cy.get('#historical-entry-date-1').type('03/01/2025');
            cy.get('#btn-save-historical-entry-1').click();
            cy.wait(2000);
            cy.get('.alert-success').should('be.visible');
            cy.get('#add-historical-entry-form-1').should('have.class', 'hidden');

            // Save to Form 3 (Calipers)
            cy.get('#caliper-chest-history').find('.btn-add-historical-entry').click();
            cy.wait(500);
            cy.get('#historical-entry-value-3').type('18.0');
            cy.get('#historical-entry-date-3').type('03/01/2025');
            cy.get('#btn-save-historical-entry-3').click();
            cy.wait(2000);
            cy.get('.alert-success').should('be.visible');
            cy.get('#add-historical-entry-form-3').should('have.class', 'hidden');
        });
    });

    describe('Data Validation', () => {
        it('should validate empty value in Summary cards', () => {
            cy.get('#muscle-mass-value').siblings('button').contains('Add Data').click();
            cy.wait(500);

            cy.get('#muscle-mass-input').clear();
            cy.get('#btn-save-muscle-mass').click();
            cy.wait(500);

            cy.get('.alert-danger').should('be.visible');
        });

        it('should validate empty value in historical form', () => {
            cy.get('#history-tab').click();
            cy.wait(500);

            cy.get('#muscle-history').find('.btn-add-historical-entry').click();
            cy.wait(500);

            cy.get('#historical-entry-date-1').type('01/01/2025');
            cy.get('#btn-save-historical-entry-1').click();
            cy.wait(500);

            cy.get('.alert-danger').should('be.visible');
        });

        it('should validate empty date in historical form', () => {
            cy.get('#history-tab').click();
            cy.wait(500);

            cy.get('#muscle-history').find('.btn-add-historical-entry').click();
            cy.wait(500);

            cy.get('#historical-entry-value-1').type('45.0');
            cy.get('#btn-save-historical-entry-1').click();
            cy.wait(500);

            cy.get('.alert-danger').should('be.visible');
        });
    });
});
