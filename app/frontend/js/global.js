/* Global JavaScript - Shared across all pages */

// Global variables
let currentAlertTimeout = null;

/**
 * Universal alert/toast system
 * Used by both index and dashboard pages
 * @param {string} message - The message to display
 * @param {string} type - Alert type: 'success', 'danger', 'info', 'warning'
 * @param {number|null} duration - Custom duration in ms, null for default
 */
function showAlert(message, type, duration = null) {
    // Coverage logging
    if (window.coverage) coverage.logFunction('showAlert', 'global.js');
    
    // Clear any existing timeout to prevent conflicts
    if (currentAlertTimeout) {
        clearTimeout(currentAlertTimeout);
        currentAlertTimeout = null;
    }
    
    const alertClass = `alert-${type}`;
    const alertHtml = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    `;
    
    $('#alert-container').html(alertHtml);
    
    // Set different durations for different message types
    let autoDismissTime = duration;
    if (autoDismissTime === null) {
        if (type === 'success') {
            autoDismissTime = 10000; // 10 seconds for success messages
        } else if (type === 'info') {
            autoDismissTime = 8000;  // 8 seconds for info messages
        } else if (type === 'danger') {
            autoDismissTime = 0;     // Don't auto-hide error messages
        } else if (type === 'warning') {
            autoDismissTime = 6000;  // 6 seconds for warnings
        }
    }
    
    if (autoDismissTime > 0) {
        currentAlertTimeout = setTimeout(() => {
            $('#alert-container .alert').alert('close');
            currentAlertTimeout = null;
        }, autoDismissTime);
    }
}

/**
 * Alias for showAlert - used by dashboard
 * Provides backward compatibility
 * @param {string} msg - The message to display
 */
function showToast(msg) {
    if (window.coverage) coverage.logFunction('showToast', 'global.js');
    showAlert(msg, 'success');
}

/**
 * Utility function to safely parse JSON responses
 * Handles both string and object responses
 * @param {string|object} resp - Response to parse
 * @returns {object} - Parsed object or empty object if parsing fails
 */
function parseJson(resp) {
    if (window.coverage) coverage.logFunction('parseJson', 'global.js');
    try { 
        return typeof resp === 'string' ? JSON.parse(resp) : resp; 
    } catch(e) { 
        return {}; 
    }
}

/**
 * Modal utility function
 * @param {string} modalId - ID of the modal to open
 */
function openModal(modalId) {
    if (window.coverage) coverage.logFunction('openModal', 'global.js');
    $('#' + modalId).modal('show');
}