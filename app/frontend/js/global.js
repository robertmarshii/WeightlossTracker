/* Global JavaScript - Shared across all pages */

// Global variables
let currentAlertTimeout = null;

// Weight unit system
const WEIGHT_UNITS = {
    kg: { label: 'kg', decimal: 1 },
    lbs: { label: 'lbs', decimal: 1 },
    st: { label: 'st', decimal: 1 }
};

// Get user's preferred weight unit (default: kg)
function getWeightUnit() {
    if (window.coverage) window.coverage.logFunction('getWeightUnit', 'global.js');
    return localStorage.getItem('weightUnit') || 'kg';
}

// Set user's preferred weight unit
function setWeightUnit(unit) {
    if (window.coverage) window.coverage.logFunction('setWeightUnit', 'global.js');
    if (WEIGHT_UNITS[unit]) {
        localStorage.setItem('weightUnit', unit);
    }
}

// Convert kg to user's preferred unit
function convertFromKg(weightKg, targetUnit = null) {
    if (window.coverage) window.coverage.logFunction('convertFromKg', 'global.js');

    const unit = targetUnit || getWeightUnit();
    const weight = parseFloat(weightKg);

    if (isNaN(weight)) return '';

    switch (unit) {
        case 'lbs':
            return (weight * 2.20462).toFixed(1);
        case 'st':
            return (weight * 0.157473).toFixed(1);
        default: // kg
            return weight.toFixed(1);
    }
}

// Convert user's input to kg for storage
function convertToKg(weightInput, sourceUnit = null) {
    if (window.coverage) window.coverage.logFunction('convertToKg', 'global.js');

    const unit = sourceUnit || getWeightUnit();

    if (unit === 'kg') {
        if (window.coverage) window.coverage.logFunction('if', 'global.js');
        return parseFloat(weightInput);
    } else if (unit === 'lbs') {
        return parseFloat(weightInput) / 2.20462;
    } else if (unit === 'st') {
        // Handle decimal stones (e.g., "18.7" or "18.7st")
        const cleanInput = weightInput.toString().replace(/st$/i, '').trim();
        return parseFloat(cleanInput) / 0.157473;
    }

    return parseFloat(weightInput);
}

// Get weight unit label for display
function getWeightUnitLabel(unit = null) {
    if (window.coverage) window.coverage.logFunction('getWeightUnitLabel', 'global.js');
    const targetUnit = unit || getWeightUnit();
    return WEIGHT_UNITS[targetUnit]?.label || 'kg';
}

// Height unit system
const HEIGHT_UNITS = {
    cm: { label: 'cm' },
    ft: { label: 'ft/in' },
    m: { label: 'm' }
};

// Get user's preferred height unit (default: cm)
function getHeightUnit() {
    if (window.coverage) window.coverage.logFunction('getHeightUnit', 'global.js');
    return localStorage.getItem('heightUnit') || 'cm';
}

// Set user's preferred height unit
function setHeightUnit(unit) {
    if (window.coverage) window.coverage.logFunction('setHeightUnit', 'global.js');
    if (HEIGHT_UNITS[unit]) {
        localStorage.setItem('heightUnit', unit);
    }
}

// Convert cm to user's preferred unit
function convertFromCm(heightCm, targetUnit = null) {
    if (window.coverage) window.coverage.logFunction('convertFromCm', 'global.js');

    const unit = targetUnit || getHeightUnit();
    const height = parseFloat(heightCm);

    if (isNaN(height)) return '';

    switch (unit) {
        case 'ft':
            return (height / 30.48).toFixed(2);
        case 'm':
            return (height / 100).toFixed(2);
        default: // cm
            return height.toFixed(0);
    }
}

// Convert user's input to cm for storage
function convertToCm(heightInput, sourceUnit = null) {
    if (window.coverage) window.coverage.logFunction('convertToCm', 'global.js');

    const unit = sourceUnit || getHeightUnit();

    if (unit === 'cm') {
        if (window.coverage) window.coverage.logFunction('if', 'global.js');
        return parseFloat(heightInput);
    } else if (unit === 'ft') {
        return parseFloat(heightInput) * 30.48; // Treat as decimal feet
    } else if (unit === 'm') {
        return parseFloat(heightInput) * 100;
    }

    return parseFloat(heightInput);
}

// Get height unit label for display
function getHeightUnitLabel(unit = null) {
    if (window.coverage) window.coverage.logFunction('getHeightUnitLabel', 'global.js');
    const targetUnit = unit || getHeightUnit();
    return HEIGHT_UNITS[targetUnit]?.label || 'cm';
}

/**
 * Universal alert/toast system
 * Used by both index and dashboard pages
 * @param {string} message - The message to display
 * @param {string} type - Alert type: 'success', 'danger', 'info', 'warning'
 * @param {number|null} duration - Custom duration in ms, null for default
 */
function showAlert(message, type, duration = null) {
    if (window.coverage) window.coverage.logFunction('showAlert', 'global.js');
    // Coverage logging
    if (window.coverage) coverage.logFunction('showAlert', 'global.js');
    
    // Clear any existing timeout to prevent conflicts
    if (currentAlertTimeout) {
        if (window.coverage) window.coverage.logFunction('if', 'global.js');
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
            if (window.coverage) window.coverage.logFunction('if', 'global.js');
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
        if (window.coverage) window.coverage.logFunction('if', 'global.js');
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
    if (window.coverage) window.coverage.logFunction('showToast', 'global.js');
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
    if (window.coverage) window.coverage.logFunction('parseJson', 'global.js');
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
    if (window.coverage) window.coverage.logFunction('openModal', 'global.js');
    if (window.coverage) coverage.logFunction('openModal', 'global.js');
    $('#' + modalId).modal('show');
}

/**
 * Get user's preferred date format from settings
 * @returns {string} Date format: 'uk', 'us', 'iso', or 'euro'
 */
function getDateFormat() {
    if (window.coverage) window.coverage.logFunction('getDateFormat', 'global.js');
    // Try to get from settings if available
    if (window.globalDashboardData && window.globalDashboardData.settings) {
        if (window.coverage) window.coverage.logFunction('if', 'global.js');
        return window.globalDashboardData.settings.date_format || 'uk';
    }
    // Fallback to uk format
    return 'uk';
}

/**
 * Format a date according to user's preferred format from settings
 * @param {string|Date} dateInput - Date string or Date object to format
 * @returns {string} Formatted date string
 */
function formatDateBySettings(dateInput) {
    if (window.coverage) window.coverage.logFunction('formatDateBySettings', 'global.js');
    if (window.coverage) coverage.logFunction('formatDateBySettings', 'global.js');

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return dateInput; // Return original if invalid date

    const format = getDateFormat();

    switch(format) {
        case 'uk':
            return date.toLocaleDateString('en-GB');
        case 'us':
            return date.toLocaleDateString('en-US');
        case 'iso':
            return date.toISOString().split('T')[0];
        case 'euro':
            return date.toLocaleDateString('de-DE');
        default:
            return date.toLocaleDateString('en-GB');
    }
}