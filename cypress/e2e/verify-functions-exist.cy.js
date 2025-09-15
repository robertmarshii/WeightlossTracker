describe('Verify All New Functions Exist', () => {
    it('should verify all module functions are loaded', () => {
        // Initialize coverage tracking
        cy.initCoverage();
        cy.enableCoverageTracking();

        // Visit dashboard to load all scripts
        cy.visit('/dashboard.php', { failOnStatusCode: false });
        cy.wait(2000); // Ensure scripts are loaded

        cy.window().then((win) => {
            const expectedFunctions = [
                // Achievements functions
                'achievementsUpdateAchievementCards',

                // Data functions
                'dataLoadWeightHistory',
                'dataFormatDate',
                'dataEditWeight',
                'dataDeleteWeight',

                // Health functions
                'healthRefreshBMI',
                'healthRefreshHealth',
                'healthRefreshIdealWeight',
                'healthRefreshGallbladderHealth',

                // Settings functions
                'settingsLoadSettings',
                'settingsSaveSettings',
                'settingsResetSettings',
                'settingsUpdateDateExample'
            ];

            const missingFunctions = [];
            const existingFunctions = [];

            expectedFunctions.forEach(funcName => {
                if (typeof win[funcName] === 'function') {
                    existingFunctions.push(funcName);
                } else {
                    missingFunctions.push(funcName);
                }
            });

            console.log('Functions that exist:', existingFunctions);
            console.log('Functions that are missing:', missingFunctions);
            console.log('Total expected:', expectedFunctions.length);
            console.log('Total existing:', existingFunctions.length);

            // This should pass if all functions are loaded
            expect(missingFunctions.length, `Missing functions: ${missingFunctions.join(', ')}`).to.equal(0);
            expect(existingFunctions.length).to.equal(expectedFunctions.length);
        });
    });
});