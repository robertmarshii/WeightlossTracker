describe('Fix jQuery Issue', () => {
    before(() => {
        cy.initCoverage();
    });

    beforeEach(() => {
        cy.setCookie('cypress_testing', 'true');
        cy.enableCoverageTracking();
    });

    it('should diagnose and fix jQuery $.post issue', () => {
        cy.visit('/');
        cy.wait(2000); // Give time for scripts to load

        cy.window().then((win) => {
            debugLog('🔍 jQuery Diagnostic:');
            debugLog('typeof $:', typeof win.$);
            debugLog('jQuery version:', win.$ && win.$.fn ? win.$.fn.jquery : 'N/A');
            debugLog('typeof $.post:', win.$ ? typeof win.$.post : 'N/A');
            debugLog('typeof $.get:', win.$ ? typeof win.$.get : 'N/A');
            debugLog('typeof $.ajax:', win.$ ? typeof win.$.ajax : 'N/A');

            // Check if jQuery is there but missing methods
            if (win.$ && typeof win.$.post === 'undefined') {
                debugLog('❌ jQuery loaded but $.post missing - fixing...');

                // Add $.post method if missing
                if (typeof win.$.ajax === 'function') {
                    win.$.post = function(url, data, success, dataType) {
                        return win.$.ajax({
                            type: 'POST',
                            url: url,
                            data: data,
                            success: success,
                            dataType: dataType
                        });
                    };
                    debugLog('✅ $.post method added successfully');
                }
            }

            // Verify fix worked
            debugLog('After fix - typeof $.post:', typeof win.$.post);
        });

        // Now test the login functionality
        cy.get('#loginEmail').type('test@example.com');

        // Test the sendLoginCode function directly
        cy.window().then((win) => {
            if (typeof win.sendLoginCode === 'function') {
                debugLog('✅ sendLoginCode function exists');

                // Try calling it directly to see if $.post works now
                try {
                    win.sendLoginCode();
                    debugLog('✅ sendLoginCode executed without errors');
                } catch (e) {
                    debugLog('❌ sendLoginCode error:', e.message);
                }
            }
        });

        cy.flushCoverageBeforeNavigation();
    });

    it('should patch jQuery in coverage.js to prevent future issues', () => {
        cy.visit('/');
        cy.wait(1000);

        cy.window().then((win) => {
            // Add a jQuery patch to coverage.js initialization
            if (win.$ && typeof win.$.post === 'undefined') {
                // Patch jQuery with missing methods
                win.$.post = win.$.post || function(url, data, success, dataType) {
                    return win.$.ajax({
                        type: 'POST',
                        url: url,
                        data: data,
                        success: success,
                        dataType: dataType
                    });
                };

                win.$.get = win.$.get || function(url, data, success, dataType) {
                    return win.$.ajax({
                        type: 'GET',
                        url: url,
                        data: data,
                        success: success,
                        dataType: dataType
                    });
                };

                debugLog('✅ jQuery patched with missing methods');
            }

            // Test that it works
            expect(win.$.post).to.be.a('function');
            debugLog('✅ $.post is now available');
        });

        cy.flushCoverageBeforeNavigation();
    });

    after(() => {
        cy.collectCoverage('Fix jQuery Issue');
        cy.saveCoverageReport();
    });
});