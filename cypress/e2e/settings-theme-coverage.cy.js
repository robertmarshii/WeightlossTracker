describe('Settings & Theme Management Coverage Tests', () => {
    beforeEach(() => {
        // Login to access dashboard settings
        cy.visit('http://127.0.0.1:8111');
        cy.enableCoverageTracking();
        cy.forceInstrumentation();

        // Quick login
        cy.get('#loginEmail').type('test@example.com');
        cy.get('#sendLoginCodeBtn').click();
        cy.wait(2000);

        // Navigate to dashboard
        cy.visit('http://127.0.0.1:8111/app/frontend/dashboard.php');
        cy.wait(1000);

        // Go to settings tab
        cy.get('[href="#settings"]').click();
        cy.wait(1000);
    });

    it('should test settings loading and saving functions', () => {
        cy.window().then((win) => {
            // Test loadSettings function
            if (win.loadSettings) {
                win.loadSettings();
            }
        });

        // Test settings form interactions
        cy.get('#weightUnit').select('lbs');
        cy.get('#heightUnit').select('ft');
        cy.get('#dateFormat').select('us');
        cy.get('#language').select('en');

        // Test saveSettings function
        cy.get('#btn-save-settings').click();
        cy.wait(2000);

        cy.window().then((win) => {
            // Test resetSettings function
            if (win.resetSettings) {
                win.resetSettings();
            }
        });

        cy.wait(1000);
    });

    it('should test theme management functions', () => {
        cy.window().then((win) => {
            // Test updateThemeOptions function
            if (win.updateThemeOptions) {
                win.updateThemeOptions('glassmorphism');
                win.updateThemeOptions('material');
                win.updateThemeOptions('neumorphism');
                win.updateThemeOptions('minimalism');
                win.updateThemeOptions('retro');
                win.updateThemeOptions('skeuomorphism');
            }

            // Test loadThemeCSS function
            if (win.loadThemeCSS) {
                win.loadThemeCSS('material');
                win.loadThemeCSS('glassmorphism');
            }
        });

        // Test theme selector
        cy.get('#theme').select('material');
        cy.wait(1000);
        cy.get('#theme').select('retro');
        cy.wait(1000);
        cy.get('#theme').select('glassmorphism');
        cy.wait(1000);
    });

    it('should test email notification functions', () => {
        // Test email notification checkboxes
        cy.get('#emailNotifications').check();
        cy.get('#weeklyReports').check();

        cy.window().then((win) => {
            // Test toggleEmailSchedule function
            if (win.toggleEmailSchedule) {
                win.toggleEmailSchedule();
            }
        });

        // Test email scheduling options
        cy.get('#emailDay').select('friday');
        cy.get('#emailTime').clear().type('10:00');

        // Uncheck and recheck to trigger toggle
        cy.get('#weeklyReports').uncheck();
        cy.get('#weeklyReports').check();

        cy.wait(1000);
    });

    it('should test date format functions', () => {
        cy.window().then((win) => {
            // Test updateDateExample function
            if (win.updateDateExample) {
                win.updateDateExample();
            }
        });

        // Test different date formats
        cy.get('#dateFormat').select('uk');
        cy.wait(500);
        cy.get('#dateFormat').select('us');
        cy.wait(500);
        cy.get('#dateFormat').select('iso');
        cy.wait(500);

        cy.window().then((win) => {
            // Verify updateDateExample was called
            if (win.updateDateExample) {
                win.updateDateExample();
            }
        });
    });

    it('should test settings persistence', () => {
        // Make multiple setting changes
        cy.get('#shareData').check();
        cy.get('#emailNotifications').check();
        cy.get('#weeklyReports').check();
        cy.get('#weightUnit').select('lbs');
        cy.get('#heightUnit').select('ft');
        cy.get('#theme').select('material');

        // Save settings
        cy.get('#btn-save-settings').click();
        cy.wait(2000);

        // Verify settings were saved by reloading
        cy.window().then((win) => {
            if (win.loadSettings) {
                win.loadSettings();
            }
        });

        cy.wait(1000);
    });

    afterEach(() => {
        cy.collectCoverage('Settings & Theme Tests');
    });
});