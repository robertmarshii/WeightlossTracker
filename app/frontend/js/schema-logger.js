// Schema Logger - Displays current schema in console on page load
(function() {
    'use strict';
    
    function logCurrentSchema() {
        if (window.coverage) window.coverage.logFunction('logCurrentSchema', 'schema-logger.js');
        // Make request to get current schema
        fetch('/router.php?controller=schema', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=get'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.schema) {
                // Remove 'wt_' prefix and log just dev/live/test
                const schemaName = data.schema.replace('wt_', '');
                debugLog(`%c🗄️ Schema: ${schemaName}`, 'color: #007bff; font-weight: bold; font-size: 14px;');
            }
        })
        .catch(error => {
            debugLog('Schema info unavailable');
        });
    }
    
    // Log schema when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', logCurrentSchema);
    } else {
        logCurrentSchema();
    }
})();