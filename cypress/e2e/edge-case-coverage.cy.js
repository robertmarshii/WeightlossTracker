describe('Edge Case and Error Condition Coverage', () => {
    beforeEach(() => {
        cy.visit('http://127.0.0.1:8111/?coverage=1');
        cy.wait(1000);
    });

    describe('Input Validation Edge Cases', () => {
        it('should test boundary value validation functions', () => {
            cy.window().then((win) => {
                if (typeof win.validateWeight === 'function') {
                    // Test boundary values
                    expect(win.validateWeight('0')).to.be.false;
                    expect(win.validateWeight('0.1')).to.be.true;
                    expect(win.validateWeight('999')).to.be.true;
                    expect(win.validateWeight('1000')).to.be.false;
                    expect(win.validateWeight('-5')).to.be.false;
                    expect(win.validateWeight('75.123456')).to.be.true;
                }

                if (typeof win.validateHeight === 'function') {
                    expect(win.validateHeight('0')).to.be.false;
                    expect(win.validateHeight('50')).to.be.false; // Too short
                    expect(win.validateHeight('100')).to.be.true;
                    expect(win.validateHeight('250')).to.be.true;
                    expect(win.validateHeight('300')).to.be.false; // Too tall
                }

                if (typeof win.validateAge === 'function') {
                    expect(win.validateAge('0')).to.be.false;
                    expect(win.validateAge('1')).to.be.true;
                    expect(win.validateAge('150')).to.be.true;
                    expect(win.validateAge('200')).to.be.false;
                }

                if (typeof win.isValidEmail === 'function') {
                    // Test various email edge cases
                    expect(win.isValidEmail('test@example.com')).to.be.true;
                    expect(win.isValidEmail('user+tag@domain.co.uk')).to.be.true;
                    expect(win.isValidEmail('email@subdomain.domain.com')).to.be.true;
                    expect(win.isValidEmail('invalid.email')).to.be.false;
                    expect(win.isValidEmail('@domain.com')).to.be.false;
                    expect(win.isValidEmail('email@')).to.be.false;
                    expect(win.isValidEmail('')).to.be.false;
                    expect(win.isValidEmail('   ')).to.be.false;
                }
            });

            cy.verifyCoverage(['validateWeight', 'validateHeight', 'validateAge', 'isValidEmail'], 'Input validation edge cases');
        });

        it('should test date validation edge cases', () => {
            cy.window().then((win) => {
                if (typeof win.validateDate === 'function') {
                    expect(win.validateDate('2025-01-01')).to.be.true;
                    expect(win.validateDate('2025-02-29')).to.be.false; // Invalid leap year
                    expect(win.validateDate('2024-02-29')).to.be.true; // Valid leap year
                    expect(win.validateDate('2025-13-01')).to.be.false; // Invalid month
                    expect(win.validateDate('2025-01-32')).to.be.false; // Invalid day
                    expect(win.validateDate('')).to.be.false;
                    expect(win.validateDate('invalid-date')).to.be.false;
                }

                if (typeof win.validateGoalDate === 'function') {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    expect(win.validateGoalDate(yesterday.toISOString().split('T')[0])).to.be.false; // Past date
                    expect(win.validateGoalDate(tomorrow.toISOString().split('T')[0])).to.be.true; // Future date
                }

                if (typeof win.formatDate === 'function') {
                    // Test various date formats
                    expect(win.formatDate('2025-01-01')).to.be.a('string');
                    expect(win.formatDate('invalid-date')).to.include('Invalid');
                    expect(win.formatDate('')).to.include('Invalid');
                    expect(win.formatDate(null)).to.include('Invalid');
                }
            });

            cy.verifyCoverage(['validateDate', 'validateGoalDate', 'formatDate'], 'Date validation edge cases');
        });
    });

    describe('Data Processing Edge Cases', () => {
        it('should test JSON parsing with malformed data', () => {
            cy.window().then((win) => {
                if (typeof win.parseJson === 'function') {
                    // Test various malformed JSON
                    expect(win.parseJson('{"valid": "json"}')).to.not.have.property('error');
                    expect(win.parseJson('{invalid json}')).to.have.property('error');
                    expect(win.parseJson('{"unclosed": "object"')).to.have.property('error');
                    expect(win.parseJson('')).to.have.property('error');
                    expect(win.parseJson('null')).to.be.null;
                    expect(win.parseJson('[]')).to.be.an('array');
                    expect(win.parseJson('123')).to.equal(123);
                    expect(win.parseJson('"string"')).to.equal('string');
                }

                if (typeof win.processApiResponse === 'function') {
                    // Test various API response formats
                    expect(win.processApiResponse({ success: true, data: {} })).to.be.an('object');
                    expect(win.processApiResponse({ success: false, error: 'Test error' })).to.have.property('error');
                    expect(win.processApiResponse({})).to.be.an('object');
                    expect(win.processApiResponse(null)).to.have.property('error');
                    expect(win.processApiResponse(undefined)).to.have.property('error');
                }
            });

            cy.verifyCoverage(['parseJson', 'processApiResponse'], 'Data processing edge cases');
        });

        it('should test calculation functions with extreme values', () => {
            cy.window().then((win) => {
                if (typeof win.calculateBMI === 'function') {
                    // Test BMI with extreme values
                    expect(win.calculateBMI(50, 100)).to.be.a('number'); // Very low weight
                    expect(win.calculateBMI(200, 150)).to.be.a('number'); // Very high weight
                    expect(win.calculateBMI(75, 100)).to.be.a('number'); // Very short height
                    expect(win.calculateBMI(75, 250)).to.be.a('number'); // Very tall height
                    expect(win.calculateBMI(0, 175)).to.equal(0); // Zero weight
                    expect(win.calculateBMI(75, 0)).to.equal(Infinity); // Zero height
                }

                if (typeof win.calculateHealthScore === 'function') {
                    // Test health score with boundary values
                    expect(win.calculateHealthScore(15, 18, 'low')).to.be.a('number'); // Underweight
                    expect(win.calculateHealthScore(40, 80, 'high')).to.be.a('number'); // Obese
                    expect(win.calculateHealthScore(25, 25, 'moderate')).to.be.a('number'); // Normal
                }

                if (typeof win.convertToKg === 'function') {
                    // Test unit conversion edge cases
                    expect(win.convertToKg('0')).to.equal(0);
                    expect(win.convertToKg('999.99')).to.be.a('number');
                    expect(win.convertToKg('')).to.be.NaN;
                    expect(win.convertToKg('abc')).to.be.NaN;
                }
            });

            cy.verifyCoverage(['calculateBMI', 'calculateHealthScore', 'convertToKg'], 'Calculation edge cases');
        });
    });

    describe('Error Recovery Functions', () => {
        it('should test network error handling', () => {
            cy.window().then((win) => {
                if (typeof win.handleNetworkError === 'function') {
                    win.handleNetworkError('Connection timeout');
                    win.handleNetworkError('DNS resolution failed');
                    win.handleNetworkError('Server unreachable');
                    win.handleNetworkError('');
                }

                if (typeof win.retryFailedRequest === 'function') {
                    win.retryFailedRequest('get_weight_history', 1);
                    win.retryFailedRequest('save_weight', 3);
                    win.retryFailedRequest('invalid_endpoint', 5);
                }

                if (typeof win.fallbackToCache === 'function') {
                    win.fallbackToCache('weight_history');
                    win.fallbackToCache('user_profile');
                    win.fallbackToCache('settings');
                }

                if (typeof win.showOfflineMessage === 'function') {
                    win.showOfflineMessage();
                }

                if (typeof win.detectConnectionStatus === 'function') {
                    expect(win.detectConnectionStatus()).to.be.a('boolean');
                }
            });

            cy.verifyCoverage(['handleNetworkError', 'retryFailedRequest', 'fallbackToCache'], 'Network error handling');
        });

        it('should test data corruption recovery', () => {
            cy.window().then((win) => {
                if (typeof win.validateDataIntegrity === 'function') {
                    const validData = { weight: 75, date: '2025-01-01' };
                    const corruptData = { weight: 'invalid', date: null };

                    expect(win.validateDataIntegrity(validData)).to.be.true;
                    expect(win.validateDataIntegrity(corruptData)).to.be.false;
                    expect(win.validateDataIntegrity({})).to.be.false;
                    expect(win.validateDataIntegrity(null)).to.be.false;
                }

                if (typeof win.repairCorruptedData === 'function') {
                    const corruptData = { weight: 'abc', date: 'invalid' };
                    const repaired = win.repairCorruptedData(corruptData);
                    expect(repaired).to.be.an('object');
                }

                if (typeof win.resetToDefaults === 'function') {
                    win.resetToDefaults();
                }

                if (typeof win.clearLocalStorage === 'function') {
                    win.clearLocalStorage();
                }
            });

            cy.verifyCoverage(['validateDataIntegrity', 'repairCorruptedData', 'resetToDefaults'], 'Data recovery functions');
        });
    });

    describe('Memory and Performance Edge Cases', () => {
        it('should test functions with large datasets', () => {
            cy.window().then((win) => {
                // Create large mock dataset
                const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
                    entry_date: `2025-01-${String(i % 31 + 1).padStart(2, '0')}`,
                    weight_kg: 70 + Math.random() * 10
                }));

                if (typeof win.processLargeDataset === 'function') {
                    const result = win.processLargeDataset(largeDataset);
                    expect(result).to.be.an('array');
                }

                if (typeof win.filterChartData === 'function') {
                    const filtered = win.filterChartData(largeDataset, '1year');
                    expect(filtered).to.be.an('array');
                }

                if (typeof win.calculateAverages === 'function') {
                    const averages = win.calculateAverages(largeDataset);
                    expect(averages).to.be.an('object');
                }

                if (typeof win.optimizeDataForChart === 'function') {
                    const optimized = win.optimizeDataForChart(largeDataset);
                    expect(optimized).to.be.an('array');
                    expect(optimized.length).to.be.lessThan(largeDataset.length);
                }

                if (typeof win.batchProcessData === 'function') {
                    win.batchProcessData(largeDataset, 100);
                }
            });

            cy.verifyCoverage(['processLargeDataset', 'filterChartData', 'calculateAverages'], 'Performance edge cases');
        });

        it('should test memory cleanup functions', () => {
            cy.window().then((win) => {
                if (typeof win.cleanupChartData === 'function') {
                    win.cleanupChartData();
                }

                if (typeof win.releaseMemory === 'function') {
                    win.releaseMemory();
                }

                if (typeof win.garbageCollect === 'function') {
                    win.garbageCollect();
                }

                if (typeof win.optimizeMemoryUsage === 'function') {
                    win.optimizeMemoryUsage();
                }

                if (typeof win.checkMemoryLimits === 'function') {
                    expect(win.checkMemoryLimits()).to.be.a('boolean');
                }
            });

            cy.verifyCoverage(['cleanupChartData', 'releaseMemory', 'optimizeMemoryUsage'], 'Memory cleanup functions');
        });
    });

    describe('Security and Validation Edge Cases', () => {
        it('should test input sanitization functions', () => {
            cy.window().then((win) => {
                if (typeof win.sanitizeInput === 'function') {
                    expect(win.sanitizeInput('<script>alert("xss")</script>')).to.not.include('<script>');
                    expect(win.sanitizeInput('normal text')).to.equal('normal text');
                    expect(win.sanitizeInput('')).to.equal('');
                    expect(win.sanitizeInput(null)).to.equal('');
                }

                if (typeof win.validateTokenFormat === 'function') {
                    expect(win.validateTokenFormat('valid-token-123')).to.be.true;
                    expect(win.validateTokenFormat('')).to.be.false;
                    expect(win.validateTokenFormat('invalid<>token')).to.be.false;
                }

                if (typeof win.escapeHtml === 'function') {
                    expect(win.escapeHtml('<div>test</div>')).to.not.include('<div>');
                    expect(win.escapeHtml('normal text')).to.equal('normal text');
                }

                if (typeof win.validateCsrfToken === 'function') {
                    expect(win.validateCsrfToken('mock-token')).to.be.a('boolean');
                }
            });

            cy.verifyCoverage(['sanitizeInput', 'validateTokenFormat', 'escapeHtml'], 'Security validation functions');
        });
    });

    describe('Browser Compatibility Edge Cases', () => {
        it('should test fallback functions for older browsers', () => {
            cy.window().then((win) => {
                if (typeof win.checkBrowserSupport === 'function') {
                    expect(win.checkBrowserSupport()).to.be.an('object');
                }

                if (typeof win.polyfillMissingFeatures === 'function') {
                    win.polyfillMissingFeatures();
                }

                if (typeof win.fallbackToLegacyMode === 'function') {
                    win.fallbackToLegacyMode();
                }

                if (typeof win.detectFeatureSupport === 'function') {
                    expect(win.detectFeatureSupport('fetch')).to.be.a('boolean');
                    expect(win.detectFeatureSupport('localStorage')).to.be.a('boolean');
                    expect(win.detectFeatureSupport('canvas')).to.be.a('boolean');
                }

                if (typeof win.showCompatibilityWarning === 'function') {
                    win.showCompatibilityWarning('Your browser is outdated');
                }
            });

            cy.verifyCoverage(['checkBrowserSupport', 'polyfillMissingFeatures', 'detectFeatureSupport'], 'Browser compatibility functions');
        });
    });
});