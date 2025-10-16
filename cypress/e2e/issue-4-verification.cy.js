/**
 * Quick test to verify Issue 4 fix - measurement inputs accept integer values like 41
 */

describe('Issue 4: Measurement Input Validation - Quick Verification', () => {
    const base = 'http://127.0.0.1:8111';
    const testEmail = 'test@dev.com';
    const fixedCode = '111111';

    beforeEach(() => {
        // Set testing cookie
        cy.setCookie('cypress_testing', 'true');

        // Reset and switch schema
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

    it('should successfully enter value 41 into neck measurement', () => {
        // Navigate to Body page (Summary is default, which shows measurements)
        cy.get('.nav-tabs .nav-link').contains('Body').click();
        cy.wait(1000);

        // Click "Add Data" for neck
        cy.contains('.glass-card-small', 'Neck')
            .find('.toggle-edit')
            .click();
        cy.wait(300);

        // Try to enter value 41
        cy.get('#neck-measurement')
            .should('be.visible')
            .clear()
            .type('41')
            .should('have.value', '41');  // Verify the value was actually entered

        // Click save
        cy.get('#btn-save-neck').click();
        cy.wait(2000);

        // Should show success, not error
        cy.get('.alert-success')
            .should('be.visible')
            .and('contain.text', 'saved successfully');
    });

    it('should accept decimal values like 38.5', () => {
        // Navigate to Body page
        cy.get('.nav-tabs .nav-link').contains('Body').click();
        cy.wait(1000);

        // Click "Add Data" for breast
        cy.contains('.glass-card-small', 'Breast')
            .find('.toggle-edit')
            .click();
        cy.wait(300);

        // Try to enter decimal value
        cy.get('#breast-measurement')
            .should('be.visible')
            .clear()
            .type('38.5')
            .should('have.value', '38.5');

        // Click save
        cy.get('#btn-save-breast').click();
        cy.wait(2000);

        // Should show success
        cy.get('.alert-success').should('be.visible');
    });

    it('should accept integer values in caliper measurements', () => {
        // Navigate to Body page
        cy.get('.nav-tabs .nav-link').contains('Body').click();
        cy.wait(1000);

        // Click "Add Data" for chest caliper
        cy.contains('.glass-card-small', 'Chest')
            .find('.toggle-edit')
            .click();
        cy.wait(300);

        // Try to enter integer value
        cy.get('#caliper-chest')
            .should('be.visible')
            .clear()
            .type('12')
            .should('have.value', '12');

        // Click save
        cy.get('#btn-save-caliper-chest').click();
        cy.wait(2000);

        // Should show success
        cy.get('.alert-success').should('be.visible');
    });
});
