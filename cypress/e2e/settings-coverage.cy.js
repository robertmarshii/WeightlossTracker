describe('Settings Module Coverage Tests', () => {
    beforeEach(() => {
        // Initialize coverage tracking
        cy.initCoverage();
        cy.enableCoverageTracking();

        // Visit dashboard to load all scripts
        cy.visit('/dashboard.php', { failOnStatusCode: false });
        cy.wait(1500); // Ensure scripts are loaded
    });

    afterEach(() => {
        // Collect coverage after each test
        cy.collectCoverage();
        cy.collectBackendCoverage();
    });

    describe('Settings Management Functions', () => {
        it('should test loadSettings() function with successful data', () => {
            // Mock successful settings response
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: {
                    success: true,
                    settings: {
                        weight_unit: 'kg',
                        height_unit: 'cm',
                        date_format: 'uk',
                        timezone: 'Europe/London',
                        theme: 'glassmorphism',
                        language: 'en',
                        start_of_week: 'monday',
                        share_data: true,
                        email_notifications: false,
                        weekly_reports: true
                    }
                }
            }).as('getSettings');

            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.settingsLoadSettings).to.be.a('function');

                // Add mock form elements to the page
                win.$('body').append(`
                    <select id="weightUnit"><option value="kg">kg</option><option value="lbs">lbs</option></select>
                    <select id="heightUnit"><option value="cm">cm</option><option value="ft">ft</option></select>
                    <select id="dateFormat"><option value="uk">UK</option><option value="us">US</option></select>
                    <select id="timezone"><option value="Europe/London">London</option></select>
                    <select id="theme"><option value="glassmorphism">Glassmorphism</option></select>
                    <select id="language"><option value="en">English</option></select>
                    <select id="startOfWeek"><option value="monday">Monday</option></select>
                    <input type="checkbox" id="shareData" />
                    <input type="checkbox" id="emailNotifications" />
                    <input type="checkbox" id="weeklyReports" />
                    <div id="dateExample"></div>
                `);

                // Mock updateDateExample function
                win.settingsUpdateDateExample = cy.stub();

                // Call the function
                win.settingsLoadSettings();

                cy.wait('@getSettings');

                // Verify form fields were populated
                cy.get('#weightUnit').should('have.value', 'kg');
                cy.get('#heightUnit').should('have.value', 'cm');
                cy.get('#dateFormat').should('have.value', 'uk');
                cy.get('#theme').should('have.value', 'glassmorphism');
                cy.get('#shareData').should('be.checked');
                cy.get('#emailNotifications').should('not.be.checked');
                cy.get('#weeklyReports').should('be.checked');

                // Verify updateDateExample was called
                expect(win.settingsUpdateDateExample).to.have.been.called;
            });

            cy.verifyCoverage(['loadSettings'], 'Settings loading with successful server response');
        });

        it('should test loadSettings() function with failed response', () => {
            // Mock failed settings response
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: { success: false, message: 'Settings not found' }
            }).as('getSettingsFail');

            cy.window().then((win) => {
                // Add mock form elements with default values
                win.$('body').append(`
                    <select id="weightUnit"><option value="kg">kg</option></select>
                    <select id="heightUnit"><option value="cm">cm</option></select>
                    <select id="dateFormat"><option value="uk">UK</option></select>
                    <select id="timezone"><option value="Europe/London">London</option></select>
                    <select id="theme"><option value="glassmorphism">Glassmorphism</option></select>
                    <select id="language"><option value="en">English</option></select>
                    <select id="startOfWeek"><option value="monday">Monday</option></select>
                    <input type="checkbox" id="shareData" />
                    <input type="checkbox" id="emailNotifications" />
                    <input type="checkbox" id="weeklyReports" />
                `);

                // Call the function
                win.settingsLoadSettings();

                cy.wait('@getSettingsFail');

                // Function should handle failure gracefully without updating fields
                cy.get('#weightUnit').should('have.value', 'kg'); // Default values remain
            });

            cy.verifyCoverage(['loadSettings'], 'Settings loading error handling for failed server response');
        });

        it('should test saveSettings() function with successful save', () => {
            // Mock successful save response
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: { success: true }
            }).as('saveSettings');

            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.settingsSaveSettings).to.be.a('function');

                // Add mock form elements with test values
                win.$('body').append(`
                    <select id="weightUnit"><option value="lbs" selected>lbs</option></select>
                    <select id="heightUnit"><option value="ft" selected>ft</option></select>
                    <select id="dateFormat"><option value="us" selected>US</option></select>
                    <select id="timezone"><option value="America/New_York" selected>New York</option></select>
                    <select id="theme"><option value="dark" selected>Dark</option></select>
                    <select id="language"><option value="es" selected>Spanish</option></select>
                    <select id="startOfWeek"><option value="sunday" selected>Sunday</option></select>
                    <input type="checkbox" id="shareData" checked />
                    <input type="checkbox" id="emailNotifications" />
                    <input type="checkbox" id="weeklyReports" checked />
                    <div id="settings-status"></div>
                `);

                // Call the function
                win.settingsSaveSettings();

                cy.wait('@saveSettings');

                // Verify success message was displayed
                cy.get('#settings-status')
                    .should('contain', 'Settings saved successfully')
                    .should('have.class', 'text-success');

                // Verify the settings data was collected correctly from form
                cy.wait('@saveSettings').then((interception) => {
                    expect(interception.request.body).to.include('weight_unit=lbs');
                    expect(interception.request.body).to.include('theme=dark');
                    expect(interception.request.body).to.include('share_data=true');
                });
            });

            cy.verifyCoverage(['saveSettings'], 'Settings save with successful server response');
        });

        it('should test saveSettings() function with server failure', () => {
            // Mock failed save response
            cy.intercept('POST', '**/router.php?controller=profile', {
                statusCode: 200,
                body: { success: false, message: 'Save failed' }
            }).as('saveSettingsFail');

            cy.window().then((win) => {
                // Add mock form elements
                win.$('body').append(`
                    <select id="weightUnit"><option value="kg" selected>kg</option></select>
                    <select id="heightUnit"><option value="cm" selected>cm</option></select>
                    <select id="dateFormat"><option value="uk" selected>UK</option></select>
                    <select id="timezone"><option value="Europe/London" selected>London</option></select>
                    <select id="theme"><option value="glassmorphism" selected>Glassmorphism</option></select>
                    <select id="language"><option value="en" selected>English</option></select>
                    <select id="startOfWeek"><option value="monday" selected>Monday</option></select>
                    <input type="checkbox" id="shareData" />
                    <input type="checkbox" id="emailNotifications" />
                    <input type="checkbox" id="weeklyReports" />
                    <div id="settings-status"></div>
                `);

                // Call the function
                win.settingsSaveSettings();

                cy.wait('@saveSettingsFail');

                // Verify error message was displayed
                cy.get('#settings-status')
                    .should('contain', 'Failed to save settings')
                    .should('have.class', 'text-danger');
            });

            cy.verifyCoverage(['saveSettings'], 'Settings save error handling for server failures');
        });

        it('should test saveSettings() function with network error', () => {
            // Mock network error
            cy.intercept('POST', '**/router.php?controller=profile', {
                forceNetworkError: true
            }).as('saveSettingsNetworkError');

            cy.window().then((win) => {
                // Add mock form elements
                win.$('body').append(`
                    <select id="weightUnit"><option value="kg" selected>kg</option></select>
                    <select id="heightUnit"><option value="cm" selected>cm</option></select>
                    <select id="dateFormat"><option value="uk" selected>UK</option></select>
                    <select id="timezone"><option value="Europe/London" selected>London</option></select>
                    <select id="theme"><option value="glassmorphism" selected>Glassmorphism</option></select>
                    <select id="language"><option value="en" selected>English</option></select>
                    <select id="startOfWeek"><option value="monday" selected>Monday</option></select>
                    <input type="checkbox" id="shareData" />
                    <input type="checkbox" id="emailNotifications" />
                    <input type="checkbox" id="weeklyReports" />
                    <div id="settings-status"></div>
                `);

                // Call the function
                win.settingsSaveSettings();

                cy.wait('@saveSettingsNetworkError');

                // Verify network error message was displayed
                cy.get('#settings-status')
                    .should('contain', 'Network error')
                    .should('have.class', 'text-danger');
            });

            cy.verifyCoverage(['saveSettings'], 'Settings save network error handling');
        });

        it('should test resetSettings() function', () => {
            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.settingsResetSettings).to.be.a('function');

                // Add mock form elements with non-default values
                win.$('body').append(`
                    <select id="weightUnit">
                        <option value="kg">kg</option>
                        <option value="lbs" selected>lbs</option>
                    </select>
                    <select id="heightUnit">
                        <option value="cm">cm</option>
                        <option value="ft" selected>ft</option>
                    </select>
                    <select id="dateFormat">
                        <option value="uk">UK</option>
                        <option value="us" selected>US</option>
                    </select>
                    <select id="timezone">
                        <option value="Europe/London">London</option>
                        <option value="America/New_York" selected>New York</option>
                    </select>
                    <select id="theme">
                        <option value="glassmorphism">Glassmorphism</option>
                        <option value="dark" selected>Dark</option>
                    </select>
                    <select id="language">
                        <option value="en">English</option>
                        <option value="es" selected>Spanish</option>
                    </select>
                    <select id="startOfWeek">
                        <option value="monday">Monday</option>
                        <option value="sunday" selected>Sunday</option>
                    </select>
                    <input type="checkbox" id="shareData" checked />
                    <input type="checkbox" id="emailNotifications" checked />
                    <input type="checkbox" id="weeklyReports" checked />
                `);

                // Mock dependent functions
                win.settingsUpdateDateExample = cy.stub();
                win.settingsSaveSettings = cy.stub();

                // Call the function
                win.settingsResetSettings();

                // Verify all fields were reset to defaults
                cy.get('#weightUnit').should('have.value', 'kg');
                cy.get('#heightUnit').should('have.value', 'cm');
                cy.get('#dateFormat').should('have.value', 'uk');
                cy.get('#timezone').should('have.value', 'Europe/London');
                cy.get('#theme').should('have.value', 'glassmorphism');
                cy.get('#language').should('have.value', 'en');
                cy.get('#startOfWeek').should('have.value', 'monday');
                cy.get('#shareData').should('not.be.checked');
                cy.get('#emailNotifications').should('not.be.checked');
                cy.get('#weeklyReports').should('not.be.checked');

                // Verify dependent functions were called
                expect(win.settingsUpdateDateExample).to.have.been.called;
                expect(win.settingsSaveSettings).to.have.been.called;
            });

            cy.verifyCoverage(['resetSettings'], 'Settings reset to default values with automatic save');
        });

        it('should test updateDateExample() function with all date formats', () => {
            cy.window().then((win) => {
                // Ensure the function is available
                expect(win.settingsUpdateDateExample).to.be.a('function');

                // Add mock form elements
                win.$('body').append(`
                    <select id="dateFormat">
                        <option value="uk">UK</option>
                        <option value="us">US</option>
                        <option value="iso">ISO</option>
                        <option value="euro">Euro</option>
                    </select>
                    <span id="dateExample"></span>
                `);

                // Test UK format
                win.$('#dateFormat').val('uk');
                win.settingsUpdateDateExample();
                cy.get('#dateExample').should('contain.text', '/');
                cy.get('#dateExample').invoke('text').should('match', /\d{2}\/\d{2}\/\d{4}/);

                // Test US format
                win.$('#dateFormat').val('us');
                win.settingsUpdateDateExample();
                cy.get('#dateExample').should('contain.text', '/');
                cy.get('#dateExample').invoke('text').should('match', /\d{1,2}\/\d{1,2}\/\d{4}/);

                // Test ISO format
                win.$('#dateFormat').val('iso');
                win.settingsUpdateDateExample();
                cy.get('#dateExample').should('contain.text', '-');
                cy.get('#dateExample').invoke('text').should('match', /\d{4}-\d{2}-\d{2}/);

                // Test Euro format
                win.$('#dateFormat').val('euro');
                win.settingsUpdateDateExample();
                cy.get('#dateExample').should('contain.text', '.');
                cy.get('#dateExample').invoke('text').should('match', /\d{1,2}\.\d{1,2}\.\d{4}/);

                // Test default case (should fallback to UK)
                win.$('#dateFormat').val('unknown');
                win.settingsUpdateDateExample();
                cy.get('#dateExample').should('contain.text', '/');
                cy.get('#dateExample').invoke('text').should('match', /\d{2}\/\d{2}\/\d{4}/);
            });

            cy.verifyCoverage(['updateDateExample'], 'Date format example generation for all supported formats');
        });
    });

    describe('Settings Integration Tests', () => {
        it('should test complete settings workflow', () => {
            // Mock both load and save responses
            cy.intercept('POST', '**/router.php?controller=profile', (req) => {
                if (req.body.action === 'get_settings') {
                    req.reply({
                        statusCode: 200,
                        body: {
                            success: true,
                            settings: {
                                weight_unit: 'lbs',
                                height_unit: 'ft',
                                date_format: 'us',
                                timezone: 'America/New_York',
                                theme: 'dark',
                                language: 'en',
                                start_of_week: 'sunday',
                                share_data: false,
                                email_notifications: true,
                                weekly_reports: false
                            }
                        }
                    });
                } else if (req.body.action === 'save_settings') {
                    req.reply({
                        statusCode: 200,
                        body: { success: true }
                    });
                }
            }).as('settingsWorkflow');

            cy.window().then((win) => {
                // Add complete settings form
                win.$('body').append(`
                    <select id="weightUnit"><option value="kg">kg</option><option value="lbs">lbs</option></select>
                    <select id="heightUnit"><option value="cm">cm</option><option value="ft">ft</option></select>
                    <select id="dateFormat"><option value="uk">UK</option><option value="us">US</option></select>
                    <select id="timezone"><option value="Europe/London">London</option><option value="America/New_York">New York</option></select>
                    <select id="theme"><option value="glassmorphism">Glassmorphism</option><option value="dark">Dark</option></select>
                    <select id="language"><option value="en">English</option></select>
                    <select id="startOfWeek"><option value="monday">Monday</option><option value="sunday">Sunday</option></select>
                    <input type="checkbox" id="shareData" />
                    <input type="checkbox" id="emailNotifications" />
                    <input type="checkbox" id="weeklyReports" />
                    <div id="settings-status"></div>
                    <span id="dateExample"></span>
                `);

                // Mock updateDateExample function
                win.settingsUpdateDateExample = win.updateDateExample;

                // Test complete workflow: load -> modify -> save
                win.settingsLoadSettings();
                cy.wait('@settingsWorkflow');

                // Verify settings were loaded
                cy.get('#weightUnit').should('have.value', 'lbs');
                cy.get('#emailNotifications').should('be.checked');

                // Modify a setting
                win.$('#theme').val('glassmorphism');
                win.$('#shareData').prop('checked', true);

                // Save settings
                win.settingsSaveSettings();
                cy.wait('@settingsWorkflow');

                // Verify save success
                cy.get('#settings-status').should('contain', 'Settings saved successfully');
            });

            cy.verifyCoverage(['loadSettings', 'saveSettings', 'updateDateExample'], 'Complete settings management workflow');
        });
    });
});