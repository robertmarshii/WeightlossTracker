/**
 * Test suite to verify all fixes from final-issues.txt
 *
 * Issues tested:
 * 1. Bone mass add entry says (kg) instead of %
 * 2. History tables missing edit/delete buttons
 * 3. Bone mass display shows "kg" should be % or % to kg conversions
 * 4. Input validation error when entering values into measurements
 * 5. History page missing measurement instruction text
 */

describe('Final Issues - All Fixes Verified', () => {
    const base = 'http://127.0.0.1:8111';
    const testEmail = 'test@dev.com';
    const fixedCode = '111111';

    beforeEach(() => {
        // Set cypress_testing cookie to disable rate limiting
        cy.setCookie('cypress_testing', 'true');

        // Clear rate limits
        cy.request({
            method: 'POST',
            url: `${base}/router.php?controller=email`,
            body: { action: 'clear_rate_limits', email: testEmail },
            failOnStatusCode: false
        });

        // Reset and switch schema
        cy.request('POST', `${base}/router.php?controller=seeder`, {
            action: 'reset_schema', schema: 'wt_test'
        });
        cy.request('POST', `${base}/router.php?controller=schema`, {
            action: 'switch', schema: 'wt_test'
        });

        // Send login code
        cy.request({
            method: 'POST',
            url: `${base}/login_router.php?controller=auth`,
            body: { action: 'send_login_code', email: testEmail }
        });

        // Get the code via peek_code
        cy.request({
            method: 'POST',
            url: `${base}/login_router.php?controller=auth`,
            body: { action: 'peek_code', email: testEmail }
        }).then((resp) => {
            const body = typeof resp.body === 'string' ? JSON.parse(resp.body) : resp.body;
            const code = body.code || fixedCode;

            // Visit and login with UI
            cy.visit(base);
            cy.get('#loginEmail').type(testEmail);
            cy.get('#loginForm').submit();
            cy.wait(1000);

            cy.get('#loginCode').type(code);
            cy.get('#verifyLoginForm').submit();
            cy.wait(2000);
        });
    });

    describe('Issue 1: Bone Mass Shows % Not kg', () => {
        it('should show % placeholder in bone mass summary card input', () => {
            // Navigate to Body page
            cy.get('.nav-tabs .nav-link').contains('Body').click();
            cy.wait(1000);

            // Click "Add Data" button to show input
            cy.contains('.glass-card-small', 'Bone Mass')
                .find('.toggle-edit')
                .click();

            // Verify placeholder is "%"
            cy.get('#bone-mass-input')
                .should('have.attr', 'placeholder', '%');
        });

        it('should show % unit in bone mass history "Add Entry" button', () => {
            // Navigate to Body page
            cy.get('.nav-tabs .nav-link').contains('Body').click();
            cy.wait(1000);
            cy.get('#history-tab').click();
            cy.wait(500);

            // Navigate to bone mass history tab
            cy.get('#smartDataTabs a[href="#bone-history"]').click();
            cy.wait(500);

            // Verify "Add Entry" button has data-unit="%"
            cy.get('#bone-history .btn-add-historical-entry')
                .should('have.attr', 'data-unit', '%');
        });

        it('should display % when adding historical bone mass entry', () => {
            // Navigate to Body page
            cy.get('.nav-tabs .nav-link').contains('Body').click();
            cy.wait(1000);
            cy.get('#history-tab').click();
            cy.wait(500);

            // Navigate to bone mass history tab
            cy.get('#smartDataTabs a[href="#bone-history"]').click();
            cy.wait(500);

            // Click "Add Entry" button
            cy.get('#bone-history .btn-add-historical-entry').click();
            cy.wait(500);

            // Verify form label shows "Bone Mass (%)"
            cy.get('#historical-entry-label-1')
                .should('contain.text', 'Bone Mass')
                .and('contain.text', '%');
        });
    });

    describe('Issue 2: Edit/Delete Buttons in History Tables', () => {
        it('should have Actions column in bone mass history table', () => {
            // Navigate to Body page
            cy.get('.nav-tabs .nav-link').contains('Body').click();
            cy.wait(1000);
            cy.get('#history-tab').click();
            cy.wait(500);

            cy.get('#smartDataTabs a[href="#bone-history"]').click();
            cy.wait(500);

            // Verify Actions column header exists
            cy.get('#bone-history table thead th')
                .should('contain.text', 'Actions');
        });

        it('should show edit and delete buttons after adding bone mass entry', () => {
            // Navigate to Body page
            cy.get('.nav-tabs .nav-link').contains('Body').click();
            cy.wait(1000);
            cy.get('#history-tab').click();
            cy.wait(500);

            // Navigate to bone mass history
            cy.get('#smartDataTabs a[href="#bone-history"]').click();
            cy.wait(500);

            // Click "Add Entry"
            cy.get('#bone-history .btn-add-historical-entry').click();
            cy.wait(500);

            // Fill form with bone mass data (%)
            cy.get('#historical-entry-value-1').type('3.5');
            cy.get('#historical-entry-date-1').type('15/01/2025');
            cy.get('#btn-save-historical-entry-1').click();
            cy.wait(2000);

            // Verify edit and delete buttons appear
            cy.get('#bone-history-body tr').first().within(() => {
                cy.get('.edit-btn').should('exist').and('contain.text', '✎');
                cy.get('.delete-btn').should('exist').and('contain.text', '✖');
            });
        });
    });

    describe('Issue 3: Bone Mass Insights Show % Not kg', () => {
        it('should show % in bone mass insight descriptions', () => {
            // Navigate to Body page
            cy.get('.nav-tabs .nav-link').contains('Body').click();
            cy.wait(1000);

            // Add bone mass data
            cy.contains('.glass-card-small', 'Bone Mass')
                .find('.toggle-edit')
                .click();
            cy.get('#bone-mass-input').type('3.5');
            cy.get('#btn-save-bone-mass').click();
            cy.wait(2000);

            // Expand insights card
            cy.get('#body-insights-card .card-header-collapsible').click();
            cy.wait(500);

            // Verify insight text contains % not kg
            cy.get('#body-insights-content')
                .should('be.visible')
                .and('contain.text', '%')
                .and('not.contain.text', '3.5kg');
        });

        it('should display value with % unit in bone mass current value card', () => {
            // Navigate to Body page
            cy.get('.nav-tabs .nav-link').contains('Body').click();
            cy.wait(1000);

            // Add bone mass data
            cy.contains('.glass-card-small', 'Bone Mass')
                .find('.toggle-edit')
                .click();
            cy.get('#bone-mass-input').type('3.3');
            cy.get('#btn-save-bone-mass').click();
            cy.wait(2000);

            // Verify display shows "3.3%" with small % symbol
            cy.contains('.glass-card-small', 'Bone Mass')
                .find('#bone-mass-value')
                .should('contain.text', '3.3')
                .and('contain.text', '%');
        });
    });

    describe('Issue 4: Measurement Input Validation Works', () => {
        it('should successfully save neck measurement with value 41', () => {
            // Navigate to Body page
            cy.get('.nav-tabs .nav-link').contains('Body').click();
            cy.wait(1000);

            // Click "Add Data" for neck (measurements visible in Summary tab)
            cy.contains('.glass-card-small', 'Neck')
                .find('.toggle-edit')
                .click();

            // Enter value 41
            cy.get('#neck-measurement').type('41');
            cy.get('#btn-save-neck').click();
            cy.wait(2000);

            // Should not show error, should show success
            cy.get('.alert-success').should('be.visible').and('contain.text', 'saved successfully');
        });

        it('should successfully save neck measurement with value 38.5', () => {
            // Navigate to Body page
            cy.get('.nav-tabs .nav-link').contains('Body').click();
            cy.wait(1000);

            // Click "Add Data" for neck (measurements visible in Summary tab)
            cy.contains('.glass-card-small', 'Neck')
                .find('.toggle-edit')
                .click();

            // Enter value 38.5
            cy.get('#neck-measurement').type('38.5');
            cy.get('#btn-save-neck').click();
            cy.wait(2000);

            // Should show success
            cy.get('.alert-success').should('be.visible');
        });
    });

    describe('Issue 5: Measurement Instructions Show in History Forms', () => {
        it('should show "Below Adam\'s apple" for neck measurement', () => {
            // Navigate to Body page
            cy.get('.nav-tabs .nav-link').contains('Body').click();
            cy.wait(1000);
            cy.get('#history-tab').click();
            cy.wait(500);

            // Navigate to neck measurement history
            cy.get('#measurementsTabs a[href="#neck-history"]').click();
            cy.wait(500);

            // Click "Add Entry"
            cy.get('#neck-history .btn-add-historical-entry').click();
            cy.wait(500);

            // Verify instruction text appears
            cy.get('#historical-entry-instruction-2')
                .should('be.visible')
                .and('contain.text', 'Below Adam\'s apple');
        });

        it('should show "At nipple line" for chest measurement', () => {
            // Navigate to Body page
            cy.get('.nav-tabs .nav-link').contains('Body').click();
            cy.wait(1000);
            cy.get('#history-tab').click();
            cy.wait(500);

            // Navigate to chest measurement history
            cy.get('#measurementsTabs a[href="#breast-history"]').click();
            cy.wait(500);

            // Click "Add Entry"
            cy.get('#breast-history .btn-add-historical-entry').click();
            cy.wait(500);

            // Verify instruction text appears
            cy.get('#historical-entry-instruction-2')
                .should('be.visible')
                .and('contain.text', 'At nipple line');
        });

        it('should show "Narrowest point" for waist measurement', () => {
            // Navigate to Body page
            cy.get('.nav-tabs .nav-link').contains('Body').click();
            cy.wait(1000);
            cy.get('#history-tab').click();
            cy.wait(500);

            // Navigate to waist measurement history
            cy.get('#measurementsTabs a[href="#waist-history"]').click();
            cy.wait(500);

            // Click "Add Entry"
            cy.get('#waist-history .btn-add-historical-entry').click();
            cy.wait(500);

            // Verify instruction text appears
            cy.get('#historical-entry-instruction-2')
                .should('be.visible')
                .and('contain.text', 'Narrowest point');
        });

        it('should show instruction for caliper abdomen measurement', () => {
            // Navigate to Body page
            cy.get('.nav-tabs .nav-link').contains('Body').click();
            cy.wait(1000);
            cy.get('#history-tab').click();
            cy.wait(500);

            // Navigate to caliper abdomen history
            cy.get('#calipersTabs a[href="#caliper-armpit-history"]').click();
            cy.wait(500);

            // Click "Add Entry"
            cy.get('#caliper-armpit-history .btn-add-historical-entry').click();
            cy.wait(500);

            // Verify instruction text appears
            cy.get('#historical-entry-instruction-3')
                .should('be.visible')
                .and('contain.text', 'Vertical fold below armpit');
        });
    });

    describe('Complete Integration Test - All Issues Fixed', () => {
        it('should complete full workflow with all fixes working', () => {
            // Navigate to Body page
            cy.get('.nav-tabs .nav-link').contains('Body').click();
            cy.wait(1000);

            // Test Issue 1 & 3: Add bone mass with % unit
            cy.contains('.glass-card-small', 'Bone Mass')
                .find('.toggle-edit')
                .click();
            cy.get('#bone-mass-input')
                .should('have.attr', 'placeholder', '%')
                .type('3.5');
            cy.get('#btn-save-bone-mass').click();
            cy.wait(2000);

            // Verify bone mass displays with %
            cy.contains('.glass-card-small', 'Bone Mass')
                .find('#bone-mass-value')
                .should('contain.text', '3.5')
                .and('contain.text', '%');

            // Test Issue 4: Add neck measurement (already on Summary tab showing measurements)
            cy.contains('.glass-card-small', 'Neck')
                .find('.toggle-edit')
                .click();
            cy.get('#neck-measurement').type('41');
            cy.get('#btn-save-neck').click();
            cy.wait(2000);
            cy.get('.alert-success').should('be.visible');

            // Test Issue 2 & 5: Go to history page
            cy.get('#history-tab').click();
            cy.wait(500);

            // Verify edit/delete buttons exist
            cy.get('#smartDataTabs a[href="#bone-history"]').click();
            cy.wait(500);
            cy.get('#bone-history-body tr').first().within(() => {
                cy.get('.edit-btn').should('exist');
                cy.get('.delete-btn').should('exist');
            });

            // Test Issue 5: Verify measurement instructions
            cy.get('#measurementsTabs a[href="#neck-history"]').click();
            cy.wait(500);
            cy.get('#neck-history .btn-add-historical-entry').click();
            cy.wait(500);
            cy.get('#historical-entry-instruction-2')
                .should('be.visible')
                .and('contain.text', 'Below Adam\'s apple');
        });
    });
});
