/**
 * Test suite to verify edit and delete button functionality
 * Issues 7 & 8 from final-issues.txt
 */

describe('Edit/Delete Button Verification', () => {
    const base = 'http://127.0.0.1:8111';
    const testEmail = 'test@dev.com';
    const fixedCode = '111111';

    beforeEach(() => {
        // Set testing cookie
        cy.setCookie('cypress_testing', 'true');

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

    describe('Issue 7: Delete Button Functionality', () => {
        it('should delete entry immediately and persist on reload', () => {
            // Navigate to Body page
            cy.get('.nav-tabs .nav-link').contains('Body').click();
            cy.wait(1000);

            // Click History tab
            cy.get('#history-tab').click();
            cy.wait(500);

            // Navigate to neck measurement history
            cy.get('#measurementsTabs a[href="#neck-history"]').click();
            cy.wait(500);

            // Add a test entry
            cy.get('#neck-history .btn-add-historical-entry').click();
            cy.wait(500);

            cy.get('#historical-entry-value-2').type('45');
            cy.get('#historical-entry-date-2').type('01/01/2025');
            cy.get('#btn-save-historical-entry-2').click();
            cy.wait(2000);

            // Verify entry was added
            cy.get('#neck-history-body tr').should('have.length.at.least', 1);

            // Count initial rows
            cy.get('#neck-history-body tr').then($rows => {
                const initialCount = $rows.length;

                // Click delete button on first row
                cy.get('#neck-history-body tr').first().find('.delete-btn').click();
                cy.wait(500);

                // Confirm deletion in alert dialog
                cy.on('window:confirm', () => true);
                cy.wait(2000);

                // Verify entry was deleted immediately (row count decreased)
                cy.get('#neck-history-body tr').should('have.length', initialCount - 1);

                // Reload page to verify deletion persisted
                cy.reload();
                cy.wait(3000);

                // Navigate back to neck history
                cy.get('#measurementsTabs a[href="#neck-history"]').click();
                cy.wait(500);

                // Verify row count is still decreased
                cy.get('#neck-history-body tr').should('have.length', initialCount - 1);
            });
        });

        it('should delete caliper entry and persist', () => {
            // Navigate to Body page
            cy.get('.nav-tabs .nav-link').contains('Body').click();
            cy.wait(1000);

            // Click History tab
            cy.get('#history-tab').click();
            cy.wait(500);

            // Navigate to caliper chest history
            cy.get('#calipersTabs a[href="#caliper-chest-history"]').click();
            cy.wait(500);

            // Add a test entry
            cy.get('#caliper-chest-history .btn-add-historical-entry').click();
            cy.wait(500);

            cy.get('#historical-entry-value-3').type('15');
            cy.get('#historical-entry-date-3').type('02/01/2025');
            cy.get('#btn-save-historical-entry-3').click();
            cy.wait(2000);

            // Count initial rows
            cy.get('#caliper-chest-history-body tr').then($rows => {
                const initialCount = $rows.length;

                // Delete first entry
                cy.get('#caliper-chest-history-body tr').first().find('.delete-btn').click();
                cy.wait(500);
                cy.on('window:confirm', () => true);
                cy.wait(2000);

                // Verify immediate deletion
                cy.get('#caliper-chest-history-body tr').should('have.length', initialCount - 1);

                // Reload and verify persistence
                cy.reload();
                cy.wait(3000);
                cy.get('#calipersTabs a[href="#caliper-chest-history"]').click();
                cy.wait(500);
                cy.get('#caliper-chest-history-body tr').should('have.length', initialCount - 1);
            });
        });
    });

    describe('Issue 8: Edit Button Functionality', () => {
        it('should edit entry immediately and persist on reload', () => {
            // Navigate to Body page
            cy.get('.nav-tabs .nav-link').contains('Body').click();
            cy.wait(1000);

            // Click History tab
            cy.get('#history-tab').click();
            cy.wait(500);

            // Navigate to waist measurement history
            cy.get('#measurementsTabs a[href="#waist-history"]').click();
            cy.wait(500);

            // Add a test entry
            cy.get('#waist-history .btn-add-historical-entry').click();
            cy.wait(500);

            cy.get('#historical-entry-value-2').type('90');
            cy.get('#historical-entry-date-2').type('03/01/2025');
            cy.get('#btn-save-historical-entry-2').click();
            cy.wait(2000);

            // Verify entry was added with value 90
            cy.get('#waist-history-body tr').first().should('contain.text', '90');

            // Click edit button on first row
            cy.get('#waist-history-body tr').first().find('.edit-btn').click();
            cy.wait(500);

            // Verify form appeared with pre-filled value
            cy.get('#add-historical-entry-form-2').should('not.have.class', 'hidden');
            cy.get('#historical-entry-value-2').should('have.value', '90');

            // Change value to 85
            cy.get('#historical-entry-value-2').clear().type('85');
            cy.get('#btn-save-historical-entry-2').click();
            cy.wait(2000);

            // Verify entry was updated immediately
            cy.get('#waist-history-body tr').first().should('contain.text', '85');
            cy.get('#waist-history-body tr').first().should('not.contain.text', '90');

            // Reload page to verify edit persisted
            cy.reload();
            cy.wait(3000);

            // Navigate back to waist history
            cy.get('#measurementsTabs a[href="#waist-history"]').click();
            cy.wait(500);

            // Verify edited value persisted
            cy.get('#waist-history-body tr').first().should('contain.text', '85');
            cy.get('#waist-history-body tr').first().should('not.contain.text', '90');
        });

        it('should edit smart data entry and persist', () => {
            // Navigate to Body page
            cy.get('.nav-tabs .nav-link').contains('Body').click();
            cy.wait(1000);

            // Click History tab
            cy.get('#history-tab').click();
            cy.wait(500);

            // Navigate to bone mass history
            cy.get('#smartDataTabs a[href="#bone-history"]').click();
            cy.wait(500);

            // Add a test entry with unique value unlikely to be in seed data
            cy.get('#bone-history .btn-add-historical-entry').click();
            cy.wait(500);

            cy.get('#historical-entry-value-1').type('4.7');
            cy.get('#historical-entry-date-1').type('05/01/2025');
            cy.get('#btn-save-historical-entry-1').click();
            cy.wait(2000);

            // Verify success message (entry was saved)
            cy.get('.alert-success').should('be.visible');

            // Find our entry by the unique value 4.7 and click edit
            cy.get('#bone-history-body tr').contains('4.7').parents('tr').first().within(() => {
                cy.get('.edit-btn').click();
            });
            cy.wait(500);

            // Edit value to 4.9
            cy.get('#historical-entry-value-1').should('have.value', '4.7');
            cy.get('#historical-entry-value-1').clear().type('4.9');
            cy.get('#btn-save-historical-entry-1').click();
            cy.wait(2000);

            // Verify immediate update - find row with 4.9
            cy.get('#bone-history-body tr').contains('4.9').should('exist');

            // Reload and verify persistence
            cy.reload();
            cy.wait(3000);
            cy.get('#smartDataTabs a[href="#bone-history"]').click();
            cy.wait(500);
            cy.get('#bone-history-body tr').contains('4.9').should('exist');
        });
    });

    describe('Complete Integration: Edit and Delete Together', () => {
        it('should handle multiple edits and deletes in sequence', () => {
            // Navigate to Body page
            cy.get('.nav-tabs .nav-link').contains('Body').click();
            cy.wait(1000);

            // Click History tab
            cy.get('#history-tab').click();
            cy.wait(500);

            // Navigate to hips measurement
            cy.get('#measurementsTabs a[href="#hips-history"]').click();
            cy.wait(500);

            // Add 3 test entries
            for (let i = 1; i <= 3; i++) {
                cy.get('#hips-history .btn-add-historical-entry').click();
                cy.wait(500);
                cy.get('#historical-entry-value-2').type(`${100 + i}`);
                cy.get('#historical-entry-date-2').type(`0${i}/01/2025`);
                cy.get('#btn-save-historical-entry-2').click();
                cy.wait(2000);
            }

            // Verify 3 entries exist
            cy.get('#hips-history-body tr').should('have.length.at.least', 3);

            // Edit first entry (most recent)
            cy.get('#hips-history-body tr').first().find('.edit-btn').click();
            cy.wait(500);
            cy.get('#historical-entry-value-2').clear().type('105');
            cy.get('#btn-save-historical-entry-2').click();
            cy.wait(2000);

            // Verify edit worked
            cy.get('#hips-history-body tr').first().should('contain.text', '105');

            // Delete second entry
            cy.get('#hips-history-body tr').eq(1).find('.delete-btn').click();
            cy.wait(500);
            cy.on('window:confirm', () => true);
            cy.wait(2000);

            // Count remaining rows
            cy.get('#hips-history-body tr').then($rows => {
                const currentCount = $rows.length;

                // Reload and verify all changes persisted
                cy.reload();
                cy.wait(3000);
                cy.get('#measurementsTabs a[href="#hips-history"]').click();
                cy.wait(500);

                // Verify edited value persisted
                cy.get('#hips-history-body tr').first().should('contain.text', '105');

                // Verify row count matches (one deleted)
                cy.get('#hips-history-body tr').should('have.length', currentCount);
            });
        });
    });
});
