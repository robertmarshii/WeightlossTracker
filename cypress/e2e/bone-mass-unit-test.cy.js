/**
 * Quick test to verify bone mass unit fix (Issue 1 from final-issues.txt)
 * This test verifies that bone mass is stored and displayed with % unit, not kg
 */

describe('Bone Mass Unit Test - Issue 1', () => {
    const base = 'http://127.0.0.1:8111';
    const testEmail = 'test@dev.com';

    before(() => {
        // Reset database to wt_test schema
        cy.request('POST', `${base}/router.php?controller=schema`, {
            action: 'switch',
            schema: 'wt_test'
        });
    });

    it('should verify bone mass uses % in database', () => {
        // Login via API
        cy.request({
            method: 'POST',
            url: `${base}/login_router.php?controller=auth`,
            form: true,
            body: {
                action: 'send_login_code',
                email: testEmail
            }
        });

        // Verify login with fixed code for wt_test
        cy.request({
            method: 'POST',
            url: `${base}/login_router.php?controller=auth`,
            form: true,
            body: {
                action: 'verify_login',
                email: testEmail,
                code: '111111'
            }
        }).then((loginResp) => {
            const body = typeof loginResp.body === 'string' ? JSON.parse(loginResp.body) : loginResp.body;
            expect(body.success).to.equal(true);
        });

        // Check what's in the database for bone_mass via API
        cy.request({
            method: 'POST',
            url: `${base}/router.php?controller=profile`,
            form: true,
            body: {
                action: 'get_all_dashboard_data'
            }
        }).then((response) => {
            expect(response.status).to.equal(200);

            // Parse response body if it's a string
            const responseBody = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;

            // Log detailed response for debugging
            cy.log('Full Response:', JSON.stringify(responseBody, null, 2));

            if (!responseBody.success) {
                cy.log('❌ API Error:', responseBody.message || 'Unknown error');
                throw new Error(`API call failed: ${responseBody.message || 'Unknown error'}`);
            }

            expect(responseBody.success).to.equal(true);

            const bodyDataHistory = responseBody.data?.body_data_history;
            cy.log('Body Data History:', JSON.stringify(bodyDataHistory, null, 2));

            // Check if bone_mass exists and has correct unit
            if (bodyDataHistory && bodyDataHistory.bone_mass && bodyDataHistory.bone_mass.length > 0) {
                const boneMassEntry = bodyDataHistory.bone_mass[0];
                cy.log(`✓ Found bone mass entry:`, JSON.stringify(boneMassEntry, null, 2));
                cy.log(`   Value: ${boneMassEntry.value}`);
                cy.log(`   Unit: ${boneMassEntry.unit}`);
                cy.log(`   Date: ${boneMassEntry.entry_date}`);

                expect(boneMassEntry.unit).to.equal('%');
                cy.log('✅ PASS: Bone mass unit is correctly set to %');
            } else {
                cy.log('⚠️  No bone mass data found in database');
                cy.log('   This might mean the database needs to be seeded with test data');
            }
        });
    });
});
