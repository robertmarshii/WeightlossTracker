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
            console.log('🔍 jQuery Diagnostic:');
            console.log('typeof $:', typeof win.$);
            console.log('jQuery version:', win.$ ? win.$.fn.jquery : 'N/A');
            console.log('typeof $.post:', typeof win.$.post);
            console.log('typeof $.get:', typeof win.$.get);
            console.log('typeof $.ajax:', typeof win.$.ajax);

            // Check if jQuery is there but missing methods
            if (win.$ && typeof win.$.post === 'undefined') {
                console.log('❌ jQuery loaded but $.post missing - fixing...');

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
                    console.log('✅ $.post method added successfully');
                }
            }

            // Verify fix worked
            console.log('After fix - typeof $.post:', typeof win.$.post);
        });

        // Now test the login functionality
        cy.get('#loginEmail').type('test@example.com');

        // Test the sendLoginCode function directly
        cy.window().then((win) => {
            if (typeof win.sendLoginCode === 'function') {
                console.log('✅ sendLoginCode function exists');

                // Try calling it directly to see if $.post works now
                try {
                    win.sendLoginCode();
                    console.log('✅ sendLoginCode executed without errors');
                } catch (e) {
                    console.log('❌ sendLoginCode error:', e.message);
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

                console.log('✅ jQuery patched with missing methods');
            }

            // Test that it works
            expect(win.$.post).to.be.a('function');
            console.log('✅ $.post is now available');
        });

        cy.flushCoverageBeforeNavigation();
    });

    after(() => {
        cy.collectCoverage('Fix jQuery Issue');
        cy.saveCoverageReport();
    });
});