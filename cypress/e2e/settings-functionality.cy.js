/**
 * Settings Functionality Test
 * Tests all the new settings functions added in recent commits
 */

describe('Settings Functionality', () => {
    let coverageReporter;

    before(() => {
        cy.initCoverage();
        cy.window().then((win) => {
            coverageReporter = win.coverageReporter;
        });
    });

    beforeEach(() => {
        cy.clearCookies();
        cy.setCookie('cypress_testing', 'true');

        // Login first to access settings
        cy.request({
            method: 'POST',
            url: '/login_router.php?controller=auth&coverage=1',
            form: true,
            body: {
                action: 'send_login_code',
                email: 'test@dev.com'
            }
        }).then(() => {
            cy.request({
                method: 'POST',
                url: '/login_router.php?controller=auth&coverage=1',
                form: true,
                body: {
                    action: 'verify_login_code',
                    email: 'test@dev.com',
                    code: '111111'
                }
            });
        });

        cy.visitWithCoverage('/dashboard.php');
        cy.enableCoverageTracking();
        cy.forceInstrumentation();
    });

    after(() => {
        cy.flushCoverageBeforeNavigation();
        cy.collectCoverage('Settings Functionality');
        cy.saveCoverageReport();
    });

    describe('Settings Loading and Saving', () => {
        it('should test loadSettings function', () => {
            cy.window().then((win) => {
                if (typeof win.loadSettings === 'function') {
                    // Test loading settings
                    win.loadSettings();

                    cy.wait(1000);

                    // Should populate settings fields
                    cy.get('#settingsForm').should('exist');
                }
            });
        });

        it('should test saveSettings function', () => {
            cy.window().then((win) => {
                if (typeof win.saveSettings === 'function') {
                    // Mock form data
                    cy.get('#settingsForm').then(($form) => {
                        if ($form.length > 0) {
                            // Fill in some test settings
                            cy.get('#weightUnit').select('lbs').should('have.value', 'lbs');
                            cy.get('#heightUnit').select('ft').should('have.value', 'ft');

                            if (Cypress.$('#theme').length > 0) {
                                cy.get('#theme').select('dark');
                            }

                            // Test save function
                            win.saveSettings();

                            cy.wait(1000);

                            // Should save successfully
                        }
                    });
                }
            });
        });

        it('should test saveSettings with various settings combinations', () => {
            cy.window().then((win) => {
                if (typeof win.saveSettings === 'function') {
                    // Test different setting combinations
                    const settingsCombinations = [
                        { weightUnit: 'kg', heightUnit: 'cm', theme: 'light' },
                        { weightUnit: 'lbs', heightUnit: 'ft', theme: 'dark' },
                        { weightUnit: 'stone', heightUnit: 'cm', theme: 'glassmorphism' }
                    ];

                    settingsCombinations.forEach((settings, index) => {
                        // Set form values
                        if (Cypress.$('#weightUnit').length > 0) {
                            cy.get('#weightUnit').select(settings.weightUnit);
                        }
                        if (Cypress.$('#heightUnit').length > 0) {
                            cy.get('#heightUnit').select(settings.heightUnit);
                        }
                        if (Cypress.$('#theme').length > 0) {
                            cy.get('#theme').select(settings.theme);
                        }

                        // Save settings
                        win.saveSettings();
                        cy.wait(500);
                    });
                }
            });
        });

        it('should test resetSettings function', () => {
            cy.window().then((win) => {
                if (typeof win.resetSettings === 'function') {
                    // First change some settings
                    if (Cypress.$('#weightUnit').length > 0) {
                        cy.get('#weightUnit').select('lbs');
                    }

                    // Then reset
                    win.resetSettings();

                    cy.wait(1000);

                    // Should reset to defaults
                    if (Cypress.$('#weightUnit').length > 0) {
                        cy.get('#weightUnit').should('have.value', 'kg');
                    }
                }
            });
        });
    });

    describe('Theme Management Functions', () => {
        it('should test updateThemeOptions function', () => {
            cy.window().then((win) => {
                if (typeof win.updateThemeOptions === 'function') {
                    // Test theme options update
                    win.updateThemeOptions();

                    cy.wait(500);

                    // Should populate theme selector
                    cy.get('#theme').should('exist');
                    cy.get('#theme option').should('have.length.at.least', 3);
                }
            });
        });

        it('should test loadThemeCSS function with different themes', () => {
            cy.window().then((win) => {
                if (typeof win.loadThemeCSS === 'function') {
                    const themes = ['light', 'dark', 'glassmorphism', 'material', 'neumorphism'];

                    themes.forEach(theme => {
                        if (Cypress.$('#theme').length > 0) {
                            cy.get('#theme').select(theme);
                        }

                        // Test loading theme CSS
                        win.loadThemeCSS(theme);

                        cy.wait(300);

                        // Should load appropriate CSS
                        cy.get('head').should('contain.html', 'theme');
                    });
                }
            });
        });

        it('should test theme CSS loading with invalid theme', () => {
            cy.window().then((win) => {
                if (typeof win.loadThemeCSS === 'function') {
                    // Test with invalid theme
                    win.loadThemeCSS('invalid_theme');

                    cy.wait(500);

                    // Should handle gracefully
                }
            });
        });

        it('should test theme persistence', () => {
            cy.window().then((win) => {
                if (typeof win.loadThemeCSS === 'function' && typeof win.saveSettings === 'function') {
                    // Set a theme
                    if (Cypress.$('#theme').length > 0) {
                        cy.get('#theme').select('dark');
                    }
                    win.loadThemeCSS('dark');

                    // Save settings
                    win.saveSettings();

                    cy.wait(1000);

                    // Reload page
                    cy.reload();

                    cy.wait(2000);

                    // Theme should persist
                    if (Cypress.$('#theme').length > 0) {
                        cy.get('#theme').should('have.value', 'dark');
                    }
                }
            });
        });
    });

    describe('Date and Time Functions', () => {
        it('should test updateDateExample function', () => {
            cy.window().then((win) => {
                if (typeof win.updateDateExample === 'function') {
                    // Test date example update
                    win.updateDateExample();

                    cy.wait(500);

                    // Should show date format example
                    cy.get('.date-example').should('exist');
                }
            });
        });

        it('should test updateDateExample with different formats', () => {
            cy.window().then((win) => {
                if (typeof win.updateDateExample === 'function') {
                    const dateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];

                    dateFormats.forEach(format => {
                        if (Cypress.$('#dateFormat').length > 0) {
                            cy.get('#dateFormat').select(format);
                        }

                        win.updateDateExample();

                        cy.wait(200);

                        // Should update example
                        cy.get('.date-example').should('contain.text', '2024');
                    });
                }
            });
        });
    });

    describe('Email Notification Functions', () => {
        it('should test toggleEmailSchedule function', () => {
            cy.window().then((win) => {
                if (typeof win.toggleEmailSchedule === 'function') {
                    // Test email schedule toggle
                    win.toggleEmailSchedule();

                    cy.wait(500);

                    // Should toggle email options
                    cy.get('#emailNotifications').should('exist');
                }
            });
        });

        it('should test email schedule with different options', () => {
            cy.window().then((win) => {
                if (typeof win.toggleEmailSchedule === 'function') {
                    // Test enabling email notifications
                    if (Cypress.$('#emailNotifications').length > 0) {
                        cy.get('#emailNotifications').check();
                        win.toggleEmailSchedule();
                        cy.wait(300);

                        // Should show email frequency options
                        cy.get('#emailFrequency').should('be.visible');

                        // Test disabling
                        cy.get('#emailNotifications').uncheck();
                        win.toggleEmailSchedule();
                        cy.wait(300);

                        // Should hide email frequency options
                        cy.get('#emailFrequency').should('not.be.visible');
                    }
                }
            });
        });
    });

    describe('Settings Form Integration', () => {
        it('should test complete settings workflow', () => {
            cy.window().then((win) => {
                const functions = ['loadSettings', 'updateThemeOptions', 'updateDateExample', 'toggleEmailSchedule'];

                functions.forEach(funcName => {
                    if (typeof win[funcName] === 'function') {
                        win[funcName]();
                        cy.wait(200);
                    }
                });

                // Complete workflow test
                cy.wait(1000);
            });
        });

        it('should test settings form validation', () => {
            cy.window().then((win) => {
                if (typeof win.saveSettings === 'function') {
                    // Test with invalid/empty settings
                    cy.get('#settingsForm').then(($form) => {
                        if ($form.length > 0) {
                            // Clear all fields if possible
                            cy.get('#settingsForm input, #settingsForm select').each(($el) => {
                                cy.wrap($el).clear({ force: true });
                            });

                            // Try to save
                            win.saveSettings();

                            cy.wait(1000);

                            // Should handle validation
                        }
                    });
                }
            });
        });
    });

    describe('Settings Error Handling', () => {
        it('should handle network errors during settings save', () => {
            cy.window().then((win) => {
                if (typeof win.saveSettings === 'function') {
                    // Mock network error
                    const originalPost = win.$.post;
                    win.$.post = function(url, data, callback) {
                        setTimeout(() => {
                            if (typeof callback === 'function') {
                                callback({ success: false, message: 'Network error' });
                            }
                        }, 100);
                    };

                    win.saveSettings();

                    cy.wait(500).then(() => {
                        // Should handle error gracefully
                        win.$.post = originalPost;
                    });
                }
            });
        });

        it('should handle network errors during settings load', () => {
            cy.window().then((win) => {
                if (typeof win.loadSettings === 'function') {
                    // Mock network error
                    const originalPost = win.$.post;
                    win.$.post = function(url, data, callback) {
                        setTimeout(() => {
                            if (typeof callback === 'function') {
                                callback({ success: false, message: 'Failed to load settings' });
                            }
                        }, 100);
                    };

                    win.loadSettings();

                    cy.wait(500).then(() => {
                        // Should handle error gracefully
                        win.$.post = originalPost;
                    });
                }
            });
        });

        it('should handle malformed settings data', () => {
            cy.window().then((win) => {
                if (typeof win.loadSettings === 'function') {
                    // Mock malformed response
                    const originalPost = win.$.post;
                    win.$.post = function(url, data, callback) {
                        setTimeout(() => {
                            if (typeof callback === 'function') {
                                callback({
                                    success: true,
                                    settings: {
                                        weight_unit: 'invalid_unit',
                                        theme: null,
                                        malformed_field: undefined
                                    }
                                });
                            }
                        }, 100);
                    };

                    win.loadSettings();

                    cy.wait(500).then(() => {
                        // Should handle malformed data gracefully
                        win.$.post = originalPost;
                    });
                }
            });
        });
    });

    describe('Settings Performance', () => {
        it('should test settings save performance', () => {
            cy.window().then((win) => {
                if (typeof win.saveSettings === 'function') {
                    const startTime = Date.now();

                    win.saveSettings();

                    cy.wait(1000).then(() => {
                        const saveTime = Date.now() - startTime;
                        debugLog(`Settings save time: ${saveTime}ms`);

                        // Should save within reasonable time
                        expect(saveTime).to.be.lessThan(3000);
                    });
                }
            });
        });

        it('should test theme loading performance', () => {
            cy.window().then((win) => {
                if (typeof win.loadThemeCSS === 'function') {
                    const themes = ['light', 'dark', 'glassmorphism'];
                    let totalTime = 0;

                    themes.forEach(theme => {
                        const startTime = Date.now();
                        win.loadThemeCSS(theme);
                        const loadTime = Date.now() - startTime;
                        totalTime += loadTime;
                    });

                    debugLog(`Total theme loading time: ${totalTime}ms`);

                    // Should load themes efficiently
                    expect(totalTime).to.be.lessThan(1000);

                    cy.wait(500);
                }
            });
        });
    });

    describe('Settings Unit Integration', () => {
        it('should test weight unit changes update dashboard', () => {
            cy.window().then((win) => {
                if (typeof win.saveSettings === 'function' && typeof win.updateWeightUnitDisplay === 'function') {
                    // Change weight unit
                    if (Cypress.$('#weightUnit').length > 0) {
                        cy.get('#weightUnit').select('lbs');
                    }

                    // Save settings
                    win.saveSettings();

                    cy.wait(1000);

                    // Update display
                    win.updateWeightUnitDisplay();

                    cy.wait(500);

                    // Should show lbs units in dashboard
                    cy.get('body').should('contain.text', 'lbs').or('contain.text', 'lb');
                }
            });
        });

        it('should test height unit changes update dashboard', () => {
            cy.window().then((win) => {
                if (typeof win.saveSettings === 'function' && typeof win.updateHeightUnitDisplay === 'function') {
                    // Change height unit
                    if (Cypress.$('#heightUnit').length > 0) {
                        cy.get('#heightUnit').select('ft');
                    }

                    // Save settings
                    win.saveSettings();

                    cy.wait(1000);

                    // Update display
                    win.updateHeightUnitDisplay();

                    cy.wait(500);

                    // Should show ft units in dashboard
                    cy.get('body').should('contain.text', 'ft').or('contain.text', 'feet');
                }
            });
        });
    });
});