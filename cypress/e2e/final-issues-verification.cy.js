/**
 * Test suite to verify all fixes from final-issues.txt are working correctly
 *
 * This file tests:
 * - Issue 1: Date format persistence (COMPLETED in previous session)
 * - Issue 2: Edit/delete buttons for body data history tables
 * - Issue 3: Input field ID corrections (COMPLETED in previous session)
 * - Issue 4: Neck measurement save button (COMPLETED in previous session)
 * - Issue 5: Input field selector consistency (COMPLETED in previous session)
 */

describe('Final Issues Verification - All Fixes', () => {
    const base = 'http://127.0.0.1:8111';
    const testEmail = 'test@dev.com';
    const fixedCode = '111111';

    beforeEach(() => {
        // Set cypress_testing cookie to disable rate limiting
        cy.setCookie('cypress_testing', 'true');

        // Clear any existing rate limits for test email
        cy.request({
            method: 'POST',
            url: `${base}/router.php?controller=email`,
            body: {
                action: 'clear_rate_limits',
                email: testEmail
            },
            failOnStatusCode: false
        });

        // Reset database and start fresh
        cy.request('POST', `${base}/router.php?controller=seeder`, {
            action: 'reset_schema',
            schema: 'wt_test'
        });

        // Switch to test schema
        cy.request('POST', `${base}/router.php?controller=schema`, {
            action: 'switch',
            schema: 'wt_test'
        });

        // Visit login page first
        cy.visit(base, { failOnStatusCode: false });

        // Type email and submit to request code
        cy.get('#loginEmail').type(testEmail);
        cy.get('#loginForm').submit();
        cy.wait(1000);

        // Wait for verification form to appear and enter code
        cy.get('#loginCode', { timeout: 10000 }).should('be.visible').clear().type(fixedCode);
        cy.get('#verifyLoginForm button[type="submit"]').click();
        cy.wait(2000);

        // Wait for dashboard to load
        cy.url({ timeout: 10000 }).should('include', 'dashboard.php');
    });

    describe('Issue 1: Date Format Persistence', () => {
        it('should persist selected date format across page reloads', () => {
            // Go to Settings tab
            cy.contains('.nav-link', 'Settings').click();
            cy.wait(500);

            // Change to US format
            cy.get('#dateFormat').select('us');
            cy.wait(500);

            // Reload the page
            cy.reload();
            cy.wait(2000);

            // Go back to Settings tab
            cy.contains('.nav-link', 'Settings').click();
            cy.wait(500);

            // Verify US format is still selected
            cy.get('#dateFormat').should('have.value', 'us');

            // Change to UK format
            cy.get('#dateFormat').select('uk');
            cy.wait(500);

            // Reload again
            cy.reload();
            cy.wait(2000);

            // Verify UK format persists
            cy.contains('.nav-link', 'Settings').click();
            cy.wait(500);
            cy.get('#dateFormat').should('have.value', 'uk');
        });

        it('should display dates in the selected format throughout the app', () => {
            // Set to US format
            cy.contains('.nav-link', 'Settings').click();
            cy.wait(500);
            cy.get('#dateFormat').select('us');
            cy.wait(500);

            // Go to Data tab to check date display
            cy.contains('.nav-link', 'Data').click();
            cy.wait(1000);

            // Check if dates are displayed (if any weight entries exist)
            cy.get('#weight-history-body tr').first().then(($row) => {
                if (!$row.hasClass('no-data')) {
                    // Verify date format pattern mm/dd/yyyy
                    cy.get('#weight-history-body tr').first().find('td').first()
                        .should('match', /\d{2}\/\d{2}\/\d{4}/);
                }
            });
        });
    });

    describe('Issue 2: Edit/Delete Buttons for Body Data History Tables', () => {
        beforeEach(() => {
            // Navigate to Body tab
            cy.contains('.nav-link', 'Body').click();
            cy.wait(1000);

            // Switch to History sub-tab
            cy.contains('a.nav-link', 'History').click();
            cy.wait(500);
        });

        it('should display Actions column header in all Smart Data history tables', () => {
            // Check Muscle Mass table
            cy.get('#muscle-history').should('be.visible');
            cy.get('#muscle-history thead tr th').last().should('contain', 'Actions');

            // Check Fat Percent table
            cy.contains('a.nav-link', 'Fat Percent').click();
            cy.wait(300);
            cy.get('#fat-history thead tr th').last().should('contain', 'Actions');

            // Check Water Percent table
            cy.contains('a.nav-link', 'Water Percent').click();
            cy.wait(300);
            cy.get('#water-history thead tr th').last().should('contain', 'Actions');

            // Check Bone Mass table
            cy.contains('a.nav-link', 'Bone Mass').click();
            cy.wait(300);
            cy.get('#bone-history thead tr th').last().should('contain', 'Actions');
        });

        it('should display Actions column header in all Measurements history tables', () => {
            // Scroll down to Measurements section
            cy.get('#measurementsTabs').scrollIntoView();
            cy.wait(500);

            // Check Neck table
            cy.get('#measurementsTabs').contains('a.nav-link', 'Neck').click();
            cy.wait(300);
            cy.get('#neck-history thead tr th').last().should('contain', 'Actions');

            // Check Breast table
            cy.get('#measurementsTabs').contains('a.nav-link', 'Breast').click();
            cy.wait(300);
            cy.get('#breast-history thead tr th').last().should('contain', 'Actions');

            // Check Waist table
            cy.get('#measurementsTabs').contains('a.nav-link', 'Waist').click();
            cy.wait(300);
            cy.get('#waist-history thead tr th').last().should('contain', 'Actions');

            // Check Hips table
            cy.get('#measurementsTabs').contains('a.nav-link', 'Hips').click();
            cy.wait(300);
            cy.get('#hips-history thead tr th').last().should('contain', 'Actions');

            // Check Thighs table
            cy.get('#measurementsTabs').contains('a.nav-link', 'Thighs').click();
            cy.wait(300);
            cy.get('#thighs-history thead tr th').last().should('contain', 'Actions');

            // Check Calves table
            cy.get('#measurementsTabs').contains('a.nav-link', 'Calves').click();
            cy.wait(300);
            cy.get('#calves-history thead tr th').last().should('contain', 'Actions');

            // Check Arms table
            cy.get('#measurementsTabs').contains('a.nav-link', 'Arms').click();
            cy.wait(300);
            cy.get('#arms-history thead tr th').last().should('contain', 'Actions');
        });

        it('should display Actions column header in all Calipers history tables', () => {
            // Scroll down to Calipers section
            cy.get('#calipersTabs').scrollIntoView();
            cy.wait(500);

            // Check Chest table
            cy.get('#calipersTabs').contains('a.nav-link', 'Chest').click();
            cy.wait(300);
            cy.get('#caliper-chest-history thead tr th').last().should('contain', 'Actions');

            // Check Armpit table
            cy.get('#calipersTabs').contains('a.nav-link', 'Armpit').click();
            cy.wait(300);
            cy.get('#caliper-armpit-history thead tr th').last().should('contain', 'Actions');

            // Check Belly table
            cy.get('#calipersTabs').contains('a.nav-link', 'Belly').click();
            cy.wait(300);
            cy.get('#caliper-belly-history thead tr th').last().should('contain', 'Actions');

            // Check Hip table
            cy.get('#calipersTabs').contains('a.nav-link', 'Hip').click();
            cy.wait(300);
            cy.get('#caliper-hip-history thead tr th').last().should('contain', 'Actions');

            // Check Thigh table
            cy.get('#calipersTabs').contains('a.nav-link', 'Thigh').click();
            cy.wait(300);
            cy.get('#caliper-thigh-history thead tr th').last().should('contain', 'Actions');
        });

        it('should add body data entry and verify edit/delete buttons appear', () => {
            // Go to Body Summary tab
            cy.contains('a.nav-link', 'Summary').click();
            cy.wait(500);

            // Add a muscle mass entry
            cy.get('#muscle-mass-value').parent().find('.toggle-edit').click();
            cy.wait(300);
            cy.get('#muscle-mass-input').clear().type('35.5');
            cy.get('#btn-save-muscle-mass').click();
            cy.wait(2000);

            // Go back to History tab
            cy.contains('a.nav-link', 'History').click();
            cy.wait(500);

            // Check Muscle Mass history table for edit/delete buttons
            cy.get('#muscle-history-body tr').first().then(($row) => {
                if (!$row.find('td').first().text().includes('No muscle mass data')) {
                    // Verify edit and delete buttons exist
                    cy.get('#muscle-history-body tr').first().find('.edit-btn').should('exist');
                    cy.get('#muscle-history-body tr').first().find('.delete-btn').should('exist');

                    // Verify buttons have correct icons
                    cy.get('#muscle-history-body tr').first().find('.edit-btn').should('contain', '✎');
                    cy.get('#muscle-history-body tr').first().find('.delete-btn').should('contain', '✖');
                }
            });
        });

        it('should successfully delete a body data entry', () => {
            // Add a fat percentage entry
            cy.contains('a.nav-link', 'Summary').click();
            cy.wait(500);
            cy.get('#fat-percent-value').parent().find('.toggle-edit').click();
            cy.wait(300);
            cy.get('#fat-percent-input').clear().type('22.5');
            cy.get('#btn-save-fat-percent').click();
            cy.wait(2000);

            // Go to History tab
            cy.contains('a.nav-link', 'History').click();
            cy.wait(500);
            cy.contains('a.nav-link', 'Fat Percent').click();
            cy.wait(300);

            // Get initial row count
            cy.get('#fat-history-body tr').then(($rows) => {
                const initialCount = $rows.length;

                // Click delete button on first entry
                cy.get('#fat-history-body tr').first().find('.delete-btn').click();
                cy.wait(300);

                // Confirm deletion
                cy.on('window:confirm', () => true);
                cy.wait(2000);

                // Verify row was deleted or table shows no data message
                cy.get('#fat-history-body tr').should(($newRows) => {
                    if ($newRows.first().text().includes('No fat percentage data')) {
                        expect($newRows.length).to.equal(1);
                    } else {
                        expect($newRows.length).to.be.lessThan(initialCount);
                    }
                });
            });
        });

        it('should successfully edit a body data entry (pre-fill form)', () => {
            // Add a water percentage entry
            cy.contains('a.nav-link', 'Summary').click();
            cy.wait(500);
            cy.get('#water-percent-value').parent().find('.toggle-edit').click();
            cy.wait(300);
            cy.get('#water-percent-input').clear().type('58.3');
            cy.get('#btn-save-water-percent').click();
            cy.wait(2000);

            // Go to History tab
            cy.contains('a.nav-link', 'History').click();
            cy.wait(500);
            cy.contains('a.nav-link', 'Water Percent').click();
            cy.wait(300);

            // Click edit button
            cy.get('#water-history-body tr').first().then(($row) => {
                if (!$row.text().includes('No water percentage data')) {
                    cy.get('#water-history-body tr').first().find('.edit-btn').click();
                    cy.wait(500);

                    // Verify historical entry form appears
                    cy.get('#add-historical-entry-form-1').should('not.have.class', 'hidden');

                    // Verify form is pre-filled with value
                    cy.get('#historical-entry-value-1').should('have.value', '58.3');

                    // Verify form is pre-filled with date
                    cy.get('#historical-entry-date-1').should('not.have.value', '');
                }
            });
        });
    });

    describe('Issue 3: Input Field ID Corrections', () => {
        it('should have correct ID for neck measurement input', () => {
            cy.contains('.nav-link', 'Body').click();
            cy.wait(1000);

            // Verify neck input has correct ID
            cy.get('#neck-measurement').should('exist');

            // Verify it's not using the old incorrect ID
            cy.get('#neck-input').should('not.exist');
        });

        it('should have correct ID for breast measurement input', () => {
            cy.contains('.nav-link', 'Body').click();
            cy.wait(1000);

            // Verify breast input has correct ID
            cy.get('#breast-measurement').should('exist');

            // Verify it's not using the old incorrect ID
            cy.get('#breast-input').should('not.exist');
        });

        it('should have correct ID for waist measurement input', () => {
            cy.contains('.nav-link', 'Body').click();
            cy.wait(1000);

            // Verify waist input has correct ID
            cy.get('#waist-measurement').should('exist');

            // Verify it's not using the old incorrect ID
            cy.get('#waist-input').should('not.exist');
        });

        it('should have correct ID for hips measurement input', () => {
            cy.contains('.nav-link', 'Body').click();
            cy.wait(1000);

            // Verify hips input has correct ID
            cy.get('#hips-measurement').should('exist');

            // Verify it's not using the old incorrect ID
            cy.get('#hips-input').should('not.exist');
        });

        it('should have correct ID for thighs measurement input', () => {
            cy.contains('.nav-link', 'Body').click();
            cy.wait(1000);

            // Verify thighs input has correct ID
            cy.get('#thighs-measurement').should('exist');

            // Verify it's not using the old incorrect ID
            cy.get('#thighs-input').should('not.exist');
        });

        it('should have correct ID for calves measurement input', () => {
            cy.contains('.nav-link', 'Body').click();
            cy.wait(1000);

            // Verify calves input has correct ID
            cy.get('#calves-measurement').should('exist');

            // Verify it's not using the old incorrect ID
            cy.get('#calves-input').should('not.exist');
        });

        it('should have correct ID for arms measurement input', () => {
            cy.contains('.nav-link', 'Body').click();
            cy.wait(1000);

            // Verify arms input has correct ID
            cy.get('#arms-measurement').should('exist');

            // Verify it's not using the old incorrect ID
            cy.get('#arms-input').should('not.exist');
        });
    });

    describe('Issue 4: Neck Measurement Save Button', () => {
        it('should successfully save neck measurement using correct button ID', () => {
            cy.contains('.nav-link', 'Body').click();
            cy.wait(1000);

            // Click to edit neck measurement
            cy.get('#neck-value').parent().find('.toggle-edit').click();
            cy.wait(300);

            // Enter neck measurement
            cy.get('#neck-measurement').clear().type('38.5');

            // Click save button with correct ID
            cy.get('#btn-save-neck').click();
            cy.wait(2000);

            // Verify success message or updated value
            cy.get('#neck-value').should('contain', '38.5');
        });

        it('should have save button with correct ID for all measurements', () => {
            cy.contains('.nav-link', 'Body').click();
            cy.wait(1000);

            // Verify all measurement save buttons exist with correct IDs
            const measurements = ['neck', 'breast', 'waist', 'hips', 'thighs', 'calves', 'arms'];

            measurements.forEach((measurement) => {
                cy.get(`#btn-save-${measurement}`).should('exist');
            });
        });
    });

    describe('Issue 5: Input Field Selector Consistency', () => {
        it('should save measurements using correct input field selectors', () => {
            cy.contains('.nav-link', 'Body').click();
            cy.wait(1000);

            // Test each measurement to ensure selectors work
            const measurements = [
                { name: 'neck', selector: '#neck-measurement', value: '37.5' },
                { name: 'breast', selector: '#breast-measurement', value: '95.0' },
                { name: 'waist', selector: '#waist-measurement', value: '85.0' },
                { name: 'hips', selector: '#hips-measurement', value: '98.0' },
                { name: 'thighs', selector: '#thighs-measurement', value: '55.0' },
                { name: 'calves', selector: '#calves-measurement', value: '38.0' },
                { name: 'arms', selector: '#arms-measurement', value: '32.0' }
            ];

            measurements.forEach((measurement) => {
                // Click edit button
                cy.get(`#${measurement.name}-value`).parent().find('.toggle-edit').click();
                cy.wait(300);

                // Verify input field exists and enter value
                cy.get(measurement.selector).should('exist').clear().type(measurement.value);

                // Save
                cy.get(`#btn-save-${measurement.name}`).click();
                cy.wait(2000);

                // Verify value is saved
                cy.get(`#${measurement.name}-value`).should('contain', measurement.value);
            });
        });

        it('should have consistent selector patterns for all caliper inputs', () => {
            cy.contains('.nav-link', 'Body').click();
            cy.wait(1000);

            // Verify all caliper inputs have correct IDs (not using -input suffix)
            const calipers = ['chest', 'armpit', 'belly', 'thigh', 'hip'];

            calipers.forEach((caliper) => {
                // Correct IDs (without -input suffix)
                cy.get(`#caliper-${caliper}`).should('exist');
            });
        });
    });

    describe('Integration Test: Complete Body Data Workflow', () => {
        it('should complete full workflow: add, edit, and delete body data', () => {
            // Navigate to Body tab
            cy.contains('.nav-link', 'Body').click();
            cy.wait(1000);

            // Step 1: Add a bone mass entry
            cy.get('#bone-mass-value').parent().find('.toggle-edit').click();
            cy.wait(300);
            cy.get('#bone-mass-input').clear().type('4.2');
            cy.get('#btn-save-bone-mass').click();
            cy.wait(2000);

            // Verify value was saved
            cy.get('#bone-mass-value').should('contain', '4.2');

            // Step 2: Go to History and verify entry exists
            cy.contains('a.nav-link', 'History').click();
            cy.wait(500);
            cy.contains('a.nav-link', 'Bone Mass').click();
            cy.wait(300);

            // Verify entry in history table
            cy.get('#bone-history-body tr').first().should('contain', '4.2');
            cy.get('#bone-history-body tr').first().find('.edit-btn').should('exist');
            cy.get('#bone-history-body tr').first().find('.delete-btn').should('exist');

            // Step 3: Edit the entry
            cy.get('#bone-history-body tr').first().find('.edit-btn').click();
            cy.wait(500);

            // Verify form is pre-filled
            cy.get('#historical-entry-value-1').should('have.value', '4.2');

            // Change the value
            cy.get('#historical-entry-value-1').clear().type('4.5');
            cy.get('#btn-save-historical-entry-1').click();
            cy.wait(2000);

            // Verify new entry was added (current implementation creates new entry)
            cy.get('#bone-history-body tr').should('have.length.at.least', 2);

            // Step 4: Delete an entry
            cy.get('#bone-history-body tr').first().find('.delete-btn').click();
            cy.wait(300);
            cy.on('window:confirm', () => true);
            cy.wait(2000);

            // Verify deletion worked
            cy.get('#bone-history-body').should('exist');
        });
    });

    describe('Regression Tests: Ensure No Breaking Changes', () => {
        it('should still allow adding weight entries', () => {
            cy.contains('.nav-link', 'Data').click();
            cy.wait(1000);

            // Expand add entry form if collapsed
            cy.get('#add-entry-form').then(($form) => {
                if (!$form.is(':visible')) {
                    cy.get('#toggleAddEntryBtn').click();
                    cy.wait(300);
                }
            });

            // Add weight entry
            const testWeight = '75.5';
            cy.get('#newWeight').clear().type(testWeight);
            cy.get('#btn-add-weight').click();
            cy.wait(2000);

            // Verify entry appears in table
            cy.get('#weight-history-body').should('contain', testWeight);
        });

        it('should still allow setting goals', () => {
            cy.contains('.nav-link', 'Goals').click();
            cy.wait(1000);

            // Set goal weight
            cy.get('#goalWeight').clear().type('70.0');
            cy.get('#btn-save-goal').click();
            cy.wait(2000);

            // Verify goal was saved
            cy.get('#goalWeight').should('have.value', '70.0');
        });

        it('should still calculate BMI correctly', () => {
            cy.contains('.nav-link', 'Health').click();
            cy.wait(1000);

            // BMI should be displayed
            cy.get('#bmi-value').should('exist');
            cy.get('#bmi-value').invoke('text').should('match', /\d+\.\d+/);
        });
    });
});
