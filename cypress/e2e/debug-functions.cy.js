describe('Debug Function Loading', () => {
    it('should check what page we actually land on', () => {
        // Initialize coverage tracking
        cy.initCoverage();
        cy.enableCoverageTracking();

        // Visit dashboard to load all scripts
        cy.visit('/dashboard.php');
        cy.wait(2000); // Ensure scripts are loaded

        // Check what page we're actually on
        cy.url().then((url) => {
            console.log('Current URL:', url);
        });

        cy.get('title').should('exist').then(($title) => {
            console.log('Page title:', $title.text());
        });

        cy.window().then((win) => {
            // List all window properties that contain our module names
            const achievementFunctions = [];
            const dataFunctions = [];
            const healthFunctions = [];
            const settingsFunctions = [];
            const allFunctions = [];

            for (const prop in win) {
                if (typeof win[prop] === 'function') {
                    allFunctions.push(prop);
                    if (prop.includes('achievement')) achievementFunctions.push(prop);
                    if (prop.includes('data') || prop.includes('Data')) dataFunctions.push(prop);
                    if (prop.includes('health') || prop.includes('Health')) healthFunctions.push(prop);
                    if (prop.includes('settings') || prop.includes('Settings')) settingsFunctions.push(prop);
                }
            }

            // Use expect to show the values in test output
            expect(achievementFunctions.length).to.be.at.least(0);
            console.log('Achievement functions:', achievementFunctions);

            expect(dataFunctions.length).to.be.at.least(0);
            console.log('Data functions:', dataFunctions);

            expect(healthFunctions.length).to.be.at.least(0);
            console.log('Health functions:', healthFunctions);

            expect(settingsFunctions.length).to.be.at.least(0);
            console.log('Settings functions:', settingsFunctions);

            console.log('Total functions:', allFunctions.length);

            // Check specific functions we're looking for
            console.log('achievementsUpdateAchievementCards exists:', typeof win.achievementsUpdateAchievementCards);
            console.log('dataLoadWeightHistory exists:', typeof win.dataLoadWeightHistory);
            console.log('healthRefreshBMI exists:', typeof win.healthRefreshBMI);
            console.log('settingsLoadSettings exists:', typeof win.settingsLoadSettings);

            // Don't fail the test, just check if they exist
            console.log('Functions exist check:');
            console.log('- achievementsUpdateAchievementCards:', typeof win.achievementsUpdateAchievementCards === 'function');
            console.log('- dataLoadWeightHistory:', typeof win.dataLoadWeightHistory === 'function');
            console.log('- healthRefreshBMI:', typeof win.healthRefreshBMI === 'function');
            console.log('- settingsLoadSettings:', typeof win.settingsLoadSettings === 'function');

            // Check if script tags are present
            const scripts = win.document.querySelectorAll('script[src]');
            const scriptSrcs = Array.from(scripts).map(s => s.src);
            cy.log('Script sources:', scriptSrcs);
        });
    });
});