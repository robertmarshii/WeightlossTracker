/**
 * Simple Code Coverage Logger
 * Tracks function calls to identify untested code paths
 */

class CoverageLogger {
    constructor() {
        this.enabled = window.location.hostname === '127.0.0.1'; // Only enable in development
        this.functionCalls = new Map();
        this.sessionId = Date.now();
        this.testMode = false;
    }

    /**
     * Log a function call
     * @param {string} functionName - Name of the function
     * @param {string} fileName - File name (optional)
     * @param {number} lineNumber - Line number (optional)
     */
    logFunction(functionName, fileName = 'unknown', lineNumber = null) {
        if (!this.enabled) return;

        const key = `${fileName}:${functionName}`;
        const callInfo = {
            functionName,
            fileName,
            lineNumber,
            callCount: (this.functionCalls.get(key)?.callCount || 0) + 1,
            firstCalled: this.functionCalls.get(key)?.firstCalled || Date.now(),
            lastCalled: Date.now(),
            testMode: this.testMode
        };

        this.functionCalls.set(key, callInfo);
        
        // Optional: Send to server for persistence
        if (this.shouldLogToServer()) {
            this.sendToServer(key, callInfo);
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
        console.log(`Total functions called: ${this.functionCalls.size}`);
        
        const byFile = {};
        this.functionCalls.forEach((info, key) => {
            const [file] = key.split(':');
            if (!byFile[file]) byFile[file] = [];
            byFile[file].push(info);
        });

        Object.entries(byFile).forEach(([file, functions]) => {
            console.group(`📄 ${file} (${functions.length} functions)`);
            functions.forEach(func => {
                const testFlag = func.testMode ? '🧪' : '👤';
                console.log(`${testFlag} ${func.functionName} (${func.callCount} calls)`);
            });
            console.groupEnd();
        });
        console.groupEnd();
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
     * Send coverage data to server
     */
    sendToServer(key, callInfo) {
        // Only send occasionally to avoid spam
        if (Math.random() < 0.1) { // 10% sampling
            fetch('/coverage-logger.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session: this.sessionId,
                    function: key,
                    info: callInfo
                })
            }).catch(() => {}); // Silently fail
        }
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

// Console helpers for development
if (window.coverage.enabled) {
    window.showCoverage = () => coverage.showReport();
    window.exportCoverage = () => coverage.exportReport();
    console.log('🎯 Coverage logging enabled. Use showCoverage() or exportCoverage() in console.');
}