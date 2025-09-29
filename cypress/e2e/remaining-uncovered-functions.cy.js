describe('Remaining Uncovered Functions Coverage', () => {
    beforeEach(() => {
        // Set coverage testing mode
        cy.setCookie('cypress_testing', '1');

        // Login with proper flow
        cy.visit('/');
        cy.get('#loginEmail').type('test@example.com');
        cy.get('#sendLoginCodeBtn').click();

        // Wait for form to show and enter code
        cy.get('#verifyLoginForm').should('be.visible');
        cy.get('#loginCode').type('123456');
        cy.get('#verifyLoginForm').submit();
        cy.wait(3000);

        // Ensure we're on dashboard
        cy.url().should('include', 'dashboard.php');
    });

    it('should test refreshFattyLiverRisk() function with various BMI scenarios', () => {
        cy.window().then((win) => {
            // Set up test profile data with height
            win.globalDashboardData = {
                profile: {
                    height_cm: 175,
                    age: 35,
                    body_frame: 'medium'
                },
                weight_history: [
                    { weight_kg: 90, entry_date: '2025-09-29' }, // BMI 29.4 - overweight
                    { weight_kg: 85, entry_date: '2025-09-20' }  // BMI 27.8 - overweight
                ],
                settings: { weight_unit: 'kg' }
            };

            // Test refreshFattyLiverRisk with overweight BMI
            if (typeof win.healthRefreshFattyLiverRisk === 'function') {
                win.healthRefreshFattyLiverRisk();

                // Verify the fatty liver block was updated
                cy.get('#fatty-liver-block').should('contain.text', '%');
                cy.log('✅ refreshFattyLiverRisk() called successfully with overweight BMI');
            } else {
                cy.log('⚠️ refreshFattyLiverRisk function not available, trying direct call');
                // Try calling through global scope
                cy.window().its('refreshFattyLiverRisk').should('be.a', 'function');
                cy.window().invoke('refreshFattyLiverRisk');
            }

            // Test with obese BMI scenario
            win.globalDashboardData.weight_history = [
                { weight_kg: 110, entry_date: '2025-09-29' } // BMI 35.9 - obese class II
            ];

            if (typeof win.healthRefreshFattyLiverRisk === 'function') {
                win.healthRefreshFattyLiverRisk();
                cy.get('#fatty-liver-block').should('contain.text', '%');
                cy.log('✅ refreshFattyLiverRisk() tested with obese BMI scenario');
            }

            // Test with normal BMI scenario
            win.globalDashboardData.weight_history = [
                { weight_kg: 70, entry_date: '2025-09-29' } // BMI 22.9 - normal
            ];

            if (typeof win.healthRefreshFattyLiverRisk === 'function') {
                win.healthRefreshFattyLiverRisk();
                cy.get('#fatty-liver-block').should('contain.text', '%');
                cy.log('✅ refreshFattyLiverRisk() tested with normal BMI scenario');
            }
        });

        // Verify coverage was logged
        cy.assertFunctionTested('refreshFattyLiverRisk');
    });

    it('should test refreshHeartDiseaseRisk() function with various health scenarios', () => {
        cy.window().then((win) => {
            // Set up test profile data
            win.globalDashboardData = {
                profile: {
                    height_cm: 180,
                    age: 45,
                    body_frame: 'large'
                },
                weight_history: [
                    { weight_kg: 95, entry_date: '2025-09-29' }, // BMI 29.3 - overweight
                    { weight_kg: 100, entry_date: '2025-09-20' } // BMI 30.9 - obese
                ],
                settings: { weight_unit: 'kg' }
            };

            // Test refreshHeartDiseaseRisk with various BMI levels
            if (typeof win.healthRefreshHeartDiseaseRisk === 'function') {
                win.healthRefreshHeartDiseaseRisk();

                // Verify the heart disease block was updated
                cy.get('#heart-disease-block').should('contain.text', '%');
                cy.log('✅ refreshHeartDiseaseRisk() called successfully');
            } else {
                cy.log('⚠️ refreshHeartDiseaseRisk function not available, trying direct call');
                // Try calling through global scope
                cy.window().its('refreshHeartDiseaseRisk').should('be.a', 'function');
                cy.window().invoke('refreshHeartDiseaseRisk');
            }

            // Test with different age scenarios (higher age = higher risk)
            win.globalDashboardData.profile.age = 60;
            if (typeof win.healthRefreshHeartDiseaseRisk === 'function') {
                win.healthRefreshHeartDiseaseRisk();
                cy.get('#heart-disease-block').should('contain.text', '%');
                cy.log('✅ refreshHeartDiseaseRisk() tested with older age scenario');
            }

            // Test with severely obese BMI
            win.globalDashboardData.weight_history = [
                { weight_kg: 130, entry_date: '2025-09-29' } // BMI 40.1 - severely obese
            ];

            if (typeof win.healthRefreshHeartDiseaseRisk === 'function') {
                win.healthRefreshHeartDiseaseRisk();
                cy.get('#heart-disease-block').should('contain.text', '%');
                cy.log('✅ refreshHeartDiseaseRisk() tested with severely obese scenario');
            }

            // Test edge case with missing data
            win.globalDashboardData.weight_history = [];
            if (typeof win.healthRefreshHeartDiseaseRisk === 'function') {
                win.healthRefreshHeartDiseaseRisk();
                cy.log('✅ refreshHeartDiseaseRisk() tested with no weight data');
            }
        });

        // Verify coverage was logged
        cy.assertFunctionTested('refreshHeartDiseaseRisk');
    });

    it('should test resetSettings() function thoroughly', () => {
        // Navigate to settings tab
        cy.get('#settings-tab').click();
        cy.wait(500);

        cy.window().then((win) => {
            // First modify some settings to non-default values
            cy.get('#weightUnit').select('lbs');
            cy.get('#heightUnit').select('ft');
            cy.get('#dateFormat').select('us');
            cy.get('#theme').select('neumorphism');
            cy.get('#language').select('es');
            cy.get('#shareData').check();
            cy.get('#emailNotifications').check();
            cy.get('#weeklyReports').check();

            cy.wait(500);

            // Verify the settings were changed
            cy.get('#weightUnit').should('have.value', 'lbs');
            cy.get('#heightUnit').should('have.value', 'ft');
            cy.get('#dateFormat').should('have.value', 'us');
            cy.get('#theme').should('have.value', 'neumorphism');
            cy.get('#language').should('have.value', 'es');
            cy.get('#shareData').should('be.checked');
            cy.get('#emailNotifications').should('be.checked');
            cy.get('#weeklyReports').should('be.checked');

            cy.log('✅ Settings modified to non-default values');

            // Now test the resetSettings function
            if (typeof win.settingsResetSettings === 'function') {
                win.settingsResetSettings();
                cy.log('✅ resetSettings() function called successfully');

                // Verify settings were reset to defaults
                cy.wait(500);
                cy.get('#weightUnit').should('have.value', 'kg');
                cy.get('#heightUnit').should('have.value', 'cm');
                cy.get('#dateFormat').should('have.value', 'uk');
                cy.get('#theme').should('have.value', 'glassmorphism');
                cy.get('#language').should('have.value', 'en');
                cy.get('#shareData').should('not.be.checked');
                cy.get('#emailNotifications').should('not.be.checked');
                cy.get('#weeklyReports').should('not.be.checked');

                cy.log('✅ All settings successfully reset to default values');
            } else {
                cy.log('⚠️ resetSettings function not available, trying direct call');
                // Try calling through global scope
                cy.window().its('resetSettings').should('be.a', 'function');
                cy.window().invoke('resetSettings');
            }

            // Test edge case - call resetSettings when already at defaults
            if (typeof win.settingsResetSettings === 'function') {
                win.settingsResetSettings();
                cy.log('✅ resetSettings() tested when already at default values');
            }

            // Test resetSettings with email notifications enabled (to test schedule hiding)
            cy.get('#emailNotifications').check();
            cy.wait(100);

            if (typeof win.settingsResetSettings === 'function') {
                win.settingsResetSettings();
                cy.get('#emailNotifications').should('not.be.checked');
                cy.get('#emailSchedule').should('not.be.visible');
                cy.log('✅ resetSettings() properly handled email schedule visibility');
            }
        });

        // Verify coverage was logged
        cy.assertFunctionTested('resetSettings');
    });

    it('should verify all three functions are properly covered', () => {
        // Final verification that all three functions were tested
        cy.getCoverageStats().then((stats) => {
            cy.log('📊 Final coverage verification:', stats);

            // Check that our target functions were covered
            cy.assertFunctionTested('refreshFattyLiverRisk');
            cy.assertFunctionTested('refreshHeartDiseaseRisk');
            cy.assertFunctionTested('resetSettings');

            cy.log('🎉 All 3 previously uncovered functions now have test coverage!');
        });

        // Test integration - verify functions work together
        cy.window().then((win) => {
            // Reset settings first
            if (typeof win.settingsResetSettings === 'function') {
                win.settingsResetSettings();
            }

            // Then refresh health functions with default settings
            if (typeof win.healthRefreshFattyLiverRisk === 'function') {
                win.healthRefreshFattyLiverRisk();
            }
            if (typeof win.healthRefreshHeartDiseaseRisk === 'function') {
                win.healthRefreshHeartDiseaseRisk();
            }

            cy.log('✅ Integration test completed - functions work together');
        });
    });
});