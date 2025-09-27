/**
 * Simple Code Coverage Logger
 * Tracks function calls to identify untested code paths
 */

class CoverageLogger {
    constructor() {
        // Only enable when explicitly requested via URL parameter ?coverage=1
        const urlParams = new URLSearchParams(window.location.search);
        const isCoverageMode = urlParams.get('coverage') === '1';
        const isTestEnvironment = window.location.hostname === '127.0.0.1';
        this.enabled = isCoverageMode && isTestEnvironment;
        this.functionCalls = new Map();
        this.sessionId = Date.now();
        this.testMode = this.detectTestMode();

        // Auto-enable test mode if Cypress is detected
        if (window.Cypress || window.__coverage__ || document.querySelector('[data-cy]')) {
            this.testMode = true;
            console.log('🧪 Coverage logging: TEST MODE auto-detected');
        }
    }

    /**
     * Detect if we're running in test mode
     */
    detectTestMode() {
        return !!(
            window.Cypress ||
            window.__coverage__ ||
            window.cy ||
            navigator.userAgent.includes('Cypress') ||
            document.querySelector('[data-cy]') ||
            window.location.search.includes('cypress') ||
            window.parent !== window // Running in iframe (typical for tests)
        );
    }

    /**
     * Log a function call
     * @param {string} functionName - Name of the function
     * @param {string} fileName - File name (optional)
     * @param {number} lineNumber - Line number (optional)
     * @param {Object} context - Additional context information
     */
    logFunction(functionName, fileName = 'unknown', lineNumber = null, context = {}) {
        if (!this.enabled) return;

        // CRITICAL: Prevent recursion by blocking coverage system functions
        if (this._isLogging || this._isInCoverageSystem(functionName)) {
            return;
        }

        this._isLogging = true;

        const key = `${fileName}:${functionName}`;
        const now = Date.now();
        const existing = this.functionCalls.get(key);

        const callInfo = {
            functionName,
            fileName,
            lineNumber,
            callCount: (existing?.callCount || 0) + 1,
            firstCalled: existing?.firstCalled || now,
            lastCalled: now,
            testMode: this.testMode,
            context: context,
            stackTrace: this.getStackTrace(),
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };

        this.functionCalls.set(key, callInfo);

        // Real-time logging for debugging
        if (this.testMode && console.groupCollapsed) {
            console.groupCollapsed(`🔧 ${functionName} called (${callInfo.callCount}x)`);
            console.log('File:', fileName);
            console.log('Context:', context);
            console.log('Stack:', callInfo.stackTrace);
            console.groupEnd();
        }

        // Optional: Send to server for persistence
        if (this.shouldLogToServer()) {
            this.sendToServer(key, callInfo);
        }

        this._isLogging = false;
    }

    /**
     * Check if function is part of the coverage system to prevent recursion
     */
    _isInCoverageSystem(functionName) {
        const coverageSystemFunctions = [
            'set', 'get', 'has', 'clear', 'delete', 'keys', 'values', 'entries', 'forEach',
            'sendToServer', 'flushBatchToServer', 'logFunction', 'getReport', 'showReport',
            'exportReport', 'shouldLogToServer', 'autoInstrumentGlobalFunctions',
            'instrumentEventHandlers', 'instrumentFunction', 'loggedFunction',
            'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
            'JSON', 'fetch', 'console', 'Date', 'Error', 'Map', 'Set', 'Array', 'Object'
        ];

        return coverageSystemFunctions.includes(functionName) ||
               functionName.includes('coverage') ||
               functionName.includes('instrument') ||
               functionName.includes('batch') ||
               functionName.startsWith('_');
    }

    /**
     * Get a cleaned stack trace
     */
    getStackTrace() {
        try {
            const stack = new Error().stack;
            if (!stack) return null;

            return stack.split('\n')
                .slice(2, 6) // Skip first 2 lines (Error + this function)
                .map(line => line.trim())
                .filter(line => line && !line.includes('coverage.js'))
                .join(' → ');
        } catch (e) {
            return null;
        }
    }

    /**
     * Mark when tests are running
     * @param {boolean} isTestMode 
     */
    setTestMode(isTestMode) {
        this.testMode = isTestMode;
        if (isTestMode) {
            console.log('🧪 Coverage logging: TEST MODE enabled');
        }
    }

    /**
     * Get coverage report
     * @returns {Object} Coverage data
     */
    getReport() {
        const report = {
            sessionId: this.sessionId,
            totalFunctions: this.functionCalls.size,
            functions: Object.fromEntries(this.functionCalls),
            generatedAt: new Date().toISOString()
        };

        return report;
    }

    /**
     * Display coverage report in console
     */
    showReport() {
        console.group('📊 Code Coverage Report');
        console.log(`Session ID: ${this.sessionId}`);
        console.log(`Total functions called: ${this.functionCalls.size}`);
        console.log(`Test mode: ${this.testMode ? 'ON' : 'OFF'}`);

        const byFile = {};
        const stats = {
            testModeCalls: 0,
            userModeCalls: 0,
            totalCalls: 0,
            uniqueFunctions: this.functionCalls.size
        };

        this.functionCalls.forEach((info, key) => {
            const [file] = key.split(':');
            if (!byFile[file]) byFile[file] = [];
            byFile[file].push(info);

            stats.totalCalls += info.callCount;
            if (info.testMode) {
                stats.testModeCalls += info.callCount;
            } else {
                stats.userModeCalls += info.callCount;
            }
        });

        console.log(`📈 Stats:`, stats);

        Object.entries(byFile).forEach(([file, functions]) => {
            const testFunctions = functions.filter(f => f.testMode);
            const userFunctions = functions.filter(f => !f.testMode);

            console.group(`📄 ${file} (${functions.length} functions, ${testFunctions.length} tested)`);

            if (testFunctions.length > 0) {
                console.group('🧪 Test Mode Functions');
                testFunctions.forEach(func => {
                    console.log(`${func.functionName} (${func.callCount} calls) - ${func.timestamp}`);
                    if (func.context && Object.keys(func.context).length > 0) {
                        console.log('  Context:', func.context);
                    }
                });
                console.groupEnd();
            }

            if (userFunctions.length > 0) {
                console.group('👤 User Mode Functions');
                userFunctions.forEach(func => {
                    console.log(`${func.functionName} (${func.callCount} calls) - ${func.timestamp}`);
                });
                console.groupEnd();
            }

            console.groupEnd();
        });

        // Show potentially untested patterns
        this.analyzeUntested();

        console.groupEnd();
    }

    /**
     * Analyze potentially untested functions
     */
    analyzeUntested() {
        const testedFunctions = new Set();
        this.functionCalls.forEach((info, key) => {
            if (info.testMode) {
                testedFunctions.add(info.functionName.toLowerCase());
            }
        });

        const commonFunctions = [
            'showAlert', 'parseJson', 'isValidEmail', 'sendLoginCode', 'verifyLoginCode',
            'addWeightEntry', 'updateProfile', 'calculateBMI', 'validateForm', 'showModal',
            'hideModal', 'toggleTheme', 'saveSettings', 'loadSettings', 'refreshData',
            'updateChart', 'formatDate', 'validateWeight', 'checkAuthentication'
        ];

        const untested = commonFunctions.filter(func =>
            !testedFunctions.has(func.toLowerCase())
        );

        if (untested.length > 0) {
            console.group('⚠️ Potentially Untested Functions');
            untested.forEach(func => console.log(`❌ ${func}`));
            console.groupEnd();
        }
    }

    /**
     * Export report as JSON
     */
    exportReport() {
        const report = this.getReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `coverage-report-${this.sessionId}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Send coverage data to server in batches
     */
    sendToServer(key, callInfo) {
        // Use native objects to prevent recursion instead of Map
        if (!this._pendingBatch) {
            this._pendingBatch = {};
        }

        this._pendingBatch[key] = callInfo;

        // Start batch timer if not already running
        if (!this._batchTimer) {
            this._batchTimer = setTimeout(() => {
                this.flushBatchToServer();
            }, 10000); // Send batch every 10 seconds
        }
    }

    /**
     * Send accumulated batch data to server
     */
    flushBatchToServer() {
        if (!this._pendingBatch || Object.keys(this._pendingBatch).length === 0) {
            this._batchTimer = null;
            return;
        }

        const batchData = {
            session: this.sessionId,
            timestamp: new Date().toISOString(),
            functions: this._pendingBatch,
            totalFunctions: Object.keys(this._pendingBatch).length
        };

        fetch('/coverage-logger.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(batchData)
        }).catch(() => {}); // Silently fail

        // Clear batch and reset timer
        this._pendingBatch = {};
        this._batchTimer = null;

        console.log(`📤 Sent coverage batch: ${batchData.totalFunctions} functions`);
    }

    shouldLogToServer() {
        return this.enabled && window.location.protocol === 'http:';
    }
}

// Global coverage instance
window.coverage = new CoverageLogger();

/**
 * Function wrapper to automatically log calls
 * Usage: const myFunc = loggedFunction('myFunc', originalFunc, 'myfile.js');
 */
function loggedFunction(name, func, fileName = 'unknown') {
    return function(...args) {
        coverage.logFunction(name, fileName);
        return func.apply(this, args);
    };
}

/**
 * Auto-instrument an object's methods
 * Usage: instrumentObject(myObject, 'myfile.js');
 */
function instrumentObject(obj, fileName = 'unknown') {
    const instrumented = {};
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'function') {
            instrumented[key] = loggedFunction(key, value, fileName);
        } else {
            instrumented[key] = value;
        }
    }
    return instrumented;
}

/**
 * Auto-instrument global functions that exist on window
 */
function autoInstrumentGlobalFunctions() {
    if (!window.coverage || !window.coverage.enabled) return;

    const instrumentedFunctions = new Set();

    // Aggressive patterns to catch common function names
    const patterns = [
        /^(load|refresh|update|save|delete|add|edit|create|send|verify|check|validate|calculate|get|set|show|hide|toggle|open|close|clear|reset|init)/i,
        /^(settings|auth|health|weight|dashboard|profile|chart|modal|alert|toast|login|signup|logout)/i,
        /^(parse|format|transform|convert|process|handle|manage|track|log|record)/i,
        /^(display|render|draw|paint|animate|fade|slide|zoom|scroll)/i,
        /^(enable|disable|activate|deactivate|start|stop|pause|resume|cancel|submit)/i,
        /^(isValid|hasValid|canAccess|shouldUpdate|needsRefresh|checkStatus)/i,
        /^(on[A-Z]|handle[A-Z]|when[A-Z]|before[A-Z]|after[A-Z])/i, // Event handlers
        /^(continueWith|backTo|updateSignup|sendLogin|createAccount|verifyLogin|verifySignup)/i, // Auth functions
        /^(refreshLatest|refreshGoal|refreshBMI|refreshHealth|refreshIdeal|refreshWeight|refreshGallbladder)/i, // Dashboard functions
        /^(formatDate|editWeight|deleteWeight|loadSettings|saveSettings|resetSettings)/i, // Utility functions
        /^(initTab|initWeight|initHeight|updateTheme|loadTheme|updateAchievement)/i, // Init functions
        /^(updateMonthly|updateWeekly|updateYearly|updateChart|resetToLine|resetToBar)/i // Chart functions
    ];

    // Also instrument ANY function on window object (aggressive mode)
    const aggressiveMode = true;

    function instrumentFunction(obj, key, parentPath = '') {
        const fullPath = parentPath ? `${parentPath}.${key}` : key;

        // CRITICAL: Skip coverage system functions to prevent recursion
        if (window.coverage._isInCoverageSystem(key)) {
            return;
        }

        // Skip ALL instrumentation during early page load to prevent triggering fallback API calls
        if (typeof $ === 'undefined' || typeof $.post !== 'function') {
            console.log(`⏳ Skipping all instrumentation - jQuery not ready yet`);
            return;
        }

        if (typeof obj[key] === 'function' && !instrumentedFunctions.has(fullPath)) {
            const originalFunction = obj[key];
            obj[key] = function(...args) {
                // Check if jQuery is available before proceeding
                const jQueryReady = (typeof $ !== 'undefined' && typeof $.post === 'function');

                // Only log if all systems are ready
                if (window.coverage && !window.coverage._isLogging && jQueryReady) {
                    try {
                        window.coverage.logFunction(key, fullPath.includes('.') ? parentPath : 'global');
                    } catch (e) {
                        // Silently fail coverage logging to prevent breaking the app
                    }
                }

                // Always execute the original function
                return originalFunction.apply(this, args);
            };
            instrumentedFunctions.add(fullPath);
            console.log(`🔧 Instrumented: ${fullPath}`);
        }
    }

    // Instrument window-level functions
    Object.keys(window).forEach(key => {
        if (typeof window[key] === 'function') {
            // Check if it matches our patterns OR use aggressive mode
            if (aggressiveMode || patterns.some(pattern => pattern.test(key))) {
                instrumentFunction(window, key, 'window');
            }
        }
    });

    // Manually instrument specific known functions if they exist
    const knownFunctions = [
        'updateSignupButton', 'sendLoginCode', 'createAccount', 'verifyLoginCode', 'verifySignupCode',
        'isValidEmail', 'continueWithGoogle', 'continueWithMicrosoft', 'backToEmailLogin', 'backToEmailSignup',
        'refreshLatestWeight', 'refreshGoal', 'loadProfile', 'refreshBMI', 'refreshHealth', 'refreshIdealWeight',
        'refreshWeightProgress', 'refreshGallbladderHealth', 'loadWeightHistory', 'formatDate', 'editWeight',
        'deleteWeight', 'loadSettings', 'saveSettings', 'resetSettings', 'updateDateExample', 'initTabNavigation',
        'showAlert', 'showToast', 'parseJson', 'openModal'
    ];

    knownFunctions.forEach(funcName => {
        if (typeof window[funcName] === 'function') {
            instrumentFunction(window, funcName, 'global');
        }
    });

    // Instrument common jQuery event handlers that might be missed
    if (typeof $ !== 'undefined') {
        const $document = $(document);
        const originalOn = $document.on;
        $document.on = function(events, selector, data, handler) {
            if (typeof handler === 'function') {
                const instrumentedHandler = function(...args) {
                    window.coverage.logFunction(`${events}_handler`, selector || 'document');
                    return handler.apply(this, args);
                };
                return originalOn.call(this, events, selector, data, instrumentedHandler);
            }
            return originalOn.apply(this, arguments);
        };
    }

    console.log(`🎯 Auto-instrumented ${instrumentedFunctions.size} functions`);
}

/**
 * Instrument common event handlers and form submissions
 */
function instrumentEventHandlers() {
    if (!window.coverage || !window.coverage.enabled) return;

    // Instrument form submissions
    $('form').each(function() {
        const form = this;
        const originalSubmit = form.onsubmit;
        form.onsubmit = function(e) {
            window.coverage.logFunction('form_submit', form.id || 'anonymous_form');
            if (originalSubmit) return originalSubmit.call(this, e);
            return true;
        };
    });

    // Instrument button clicks
    $('button, .btn').each(function() {
        const button = this;
        const originalClick = button.onclick;
        button.onclick = function(e) {
            window.coverage.logFunction('button_click', button.id || button.className || 'anonymous_button');
            if (originalClick) return originalClick.call(this, e);
            return true;
        };
    });

    // Instrument AJAX calls
    if (typeof $ !== 'undefined' && $.ajaxSetup) {
        const originalAjax = $.ajax;
        $.ajax = function(options) {
            window.coverage.logFunction('ajax_call', options.url || 'unknown_endpoint');
            return originalAjax.apply(this, arguments);
        };
    }
}

/**
 * Enhanced function detection and instrumentation
 */
function enhancedInstrumentation() {
    if (!window.coverage || !window.coverage.enabled) return;

    // Note: MutationObserver disabled to prevent excessive re-instrumentation
    // Functions are caught by the initial run + delayed run

    // Wait for both jQuery and DOM to be ready
    const waitForDependencies = () => {
        if (typeof $ !== 'undefined' && typeof $.post === 'function' && document.readyState === 'complete') {
            // All dependencies ready, safe to instrument
            console.log('🎯 All dependencies ready, starting instrumentation...');
            autoInstrumentGlobalFunctions();
            instrumentEventHandlers();
        } else {
            // Dependencies not ready, wait longer
            setTimeout(waitForDependencies, 200);
        }
    };

    // Start checking after a short delay to let everything load
    setTimeout(waitForDependencies, 1000);

    // Additional late instrumentation only if needed
    setTimeout(() => {
        if (typeof $ !== 'undefined' && typeof $.post === 'function') {
            autoInstrumentGlobalFunctions();
        }
    }, 3000);
}

// Console helpers for development
if (window.coverage.enabled) {
    window.showCoverage = () => coverage.showReport();
    window.exportCoverage = () => coverage.exportReport();
    window.instrumentGlobals = autoInstrumentGlobalFunctions;

    // Force immediate instrumentation
    console.log('🎯 Coverage logging enabled. Starting deferred instrumentation...');

    // Wait for page to be fully loaded before instrumenting
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhancedInstrumentation);
    } else {
        // Already loaded, run immediately
        enhancedInstrumentation();
    }

    // Log that we're ready
    console.log('🎯 Coverage logging ready. Use showCoverage(), exportCoverage(), or instrumentGlobals() in console.');

    // Persist coverage data less frequently to reduce overhead
    if (window.coverage.testMode) {
        setInterval(() => {
            try {
                localStorage.setItem('cypressCoverage', JSON.stringify(window.coverage.getReport()));
            } catch (e) {
                console.warn('Could not save coverage to localStorage:', e);
            }
        }, 10000); // Save every 10 seconds during tests (reduced from 2 seconds)
    }

    // Add cleanup on page unload to flush any pending batch
    window.addEventListener('beforeunload', () => {
        if (window.coverage && window.coverage.flushBatchToServer) {
            window.coverage.flushBatchToServer();
        }
    });
}