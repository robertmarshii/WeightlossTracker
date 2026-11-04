/* Global JavaScript - Shared across all pages */

// CSRF protection: add this session's token (from <meta name="csrf-token">) to every same-origin
// fetch/jQuery request. If the server says the token is stale (e.g. the session was restored from
// the remember-me cookie), get a fresh token once and retry the request.
(function () {
    function csrfMeta() { return document.querySelector('meta[name="csrf-token"]'); }
    function csrfToken() { const m = csrfMeta(); return m ? m.getAttribute('content') : ''; }
    function setCsrfToken(t) { const m = csrfMeta(); if (m) m.setAttribute('content', t); }
    function sameOrigin(url) {
        try { return new URL(url, window.location.href).origin === window.location.origin; } catch (e) { return false; }
    }
    // Version of this page's code (dashboard.php). Sent with every request; the server answers with the
    // live version. If the live one is newer (a deploy happened while this tab was open), ask for a reload.
    function appVersion() {
        const m = document.querySelector('meta[name="app-version"]');
        return m ? m.getAttribute('content') : '';
    }
    function checkAppVersion(serverVersion) {
        const mine = parseInt(appVersion(), 10);
        const live = parseInt(serverVersion, 10);
        if (!isNaN(mine) && !isNaN(live) && live > mine) showReloadNotice();
    }
    function showReloadNotice() {
        if (document.getElementById('app-reload-notice') || !document.body) return;
        const tr = (s) => (typeof window.t === 'function' ? window.t(s) : s);
        const box = document.createElement('div');
        box.id = 'app-reload-notice';
        box.setAttribute('role', 'alert');
        box.style.cssText = 'position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom, 0px));transform:translateX(-50%);z-index:10000;max-width:calc(100% - 32px);background:#1f2937;color:#fff;padding:12px 16px;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.3);display:flex;gap:12px;align-items:center;flex-wrap:wrap;';
        const text = document.createElement('span');
        text.textContent = tr('A newer version of this page is available. Please reload it before you save anything else.');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-sm btn-light';
        btn.textContent = tr('Reload');
        btn.addEventListener('click', () => window.location.reload());
        box.appendChild(text);
        box.appendChild(btn);
        document.body.appendChild(box);
    }
    function withToken(init) {
        const opts = Object.assign({}, init || {});
        const headers = new Headers(opts.headers || {});
        headers.set('X-CSRF-Token', csrfToken());
        if (appVersion()) headers.set('X-App-Version', appVersion());
        opts.headers = headers;
        return opts;
    }
    window.getCsrfToken = csrfToken;
    window.checkAppVersion = checkAppVersion;

    if (window.fetch) {
        const originalFetch = window.fetch.bind(window);
        window.fetch = function (input, init) {
            const url = typeof input === 'string' ? input : (input && input.url) || '';
            if (!sameOrigin(url) || !csrfToken()) return originalFetch(input, init);
            return originalFetch(input, withToken(init)).then(function (resp) {
                if (resp.headers && resp.headers.get('X-App-Version')) checkAppVersion(resp.headers.get('X-App-Version'));
                if (resp.status !== 403 || url.indexOf('controller=profile') === -1) return resp;
                return resp.clone().json().then(function (data) {
                    if (!data || data.csrf !== false) return resp;
                    const body = new URLSearchParams();
                    body.append('action', 'csrf_token');
                    return originalFetch('router.php?controller=profile', {
                        method: 'POST', body: body, credentials: 'same-origin'
                    }).then(function (r) { return r.json(); }).then(function (t) {
                        if (!t || !t.csrf_token) return resp;
                        setCsrfToken(t.csrf_token);
                        return originalFetch(input, withToken(init));
                    });
                }).catch(function () { return resp; });
            });
        };
    }

    if (window.jQuery) {
        window.jQuery.ajaxSetup({
            beforeSend: function (xhr, settings) {
                if (sameOrigin(settings.url) && csrfToken()) xhr.setRequestHeader('X-CSRF-Token', csrfToken());
                if (sameOrigin(settings.url) && appVersion()) xhr.setRequestHeader('X-App-Version', appVersion());
            }
        });
        window.jQuery(document).ajaxComplete(function (event, xhr) {
            const v = xhr && xhr.getResponseHeader ? xhr.getResponseHeader('X-App-Version') : null;
            if (v) checkAppVersion(v);
        });
    }
})();

// Debug logging system - collects logs and outputs at end
// Only enabled in development (not on production domain)
window.debugLogs = [];
window.isProduction = window.location.hostname === 'www.weightloss-tracker.com' || window.location.hostname === 'weightloss-tracker.com';

window.debugLog = function(message, data) {
    if (!window.isProduction) {
        window.debugLogs.push({ message, data, time: Date.now() });
    }
};

window.flushDebugLogs = function() {
    if (!window.isProduction && window.debugLogs.length > 0) {
        console.log('📋 Debug Log Summary:', window.debugLogs);
        window.debugLogs = []; // Clear after output
    }
};

// Auto-flush every 10 seconds if new logs exist (only in development)
if (!window.isProduction) {
    setInterval(() => {
        window.flushDebugLogs();
    }, 10000);
}

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

// A weight in kg as a plain, unrounded number in the user's unit (decimal stones for stone). For charts: the
// tooltip and axis format it, so it must not be pre-rounded (0.1 st is 1.4 lb, which made tooltips disagree
// with the table).
function kgToUnitValue(weightKg, targetUnit = null) {
    const unit = targetUnit || getWeightUnit();
    const kg = parseFloat(weightKg);
    if (isNaN(kg)) return NaN;
    if (unit === 'lbs') return kg * 2.20462;
    if (unit === 'st') return kg * 0.157473;
    return kg;
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
        // "13 st 5.4 lb", "13 5.4" or decimal stones ("13.4")
        return parseStoneInput(weightInput);
    }

    return parseFloat(weightInput);
}

// A weight in kg as whole stones and pounds, rounded to 0.1 lb first (same as the emails, WeightUnits.php)
function kgToStonesPounds(weightKg) {
    const kg = parseFloat(weightKg);
    const tenthsOfLb = Math.round(Math.abs(kg) * 2.20462 * 10);
    const stones = Math.floor(tenthsOfLb / 140);
    return { negative: kg < 0 && tenthsOfLb > 0, stones: stones, pounds: (tenthsOfLb - stones * 140) / 10 };
}

// A weight stored in kg, shown in the user's unit with its label: "83.6 kg", "184.3 lbs", "13 st 2.3 lb".
// fmt formats the number part (default one decimal, e.g. pass a locale formatter for 83,6).
function formatWeight(weightKg, unit = null, fmt = null) {
    const u = unit || getWeightUnit();
    const kg = parseFloat(weightKg);
    if (isNaN(kg)) return '';
    const f = fmt || (x => x.toFixed(1));
    if (u === 'st') {
        const p = kgToStonesPounds(kg);
        const sign = p.negative ? '-' : '';
        return p.stones ? `${sign}${p.stones} st ${f(p.pounds)} lb` : `${sign}${f(p.pounds)} lb`;
    }
    return `${f(parseFloat(convertFromKg(kg, u)))} ${getWeightUnitLabel(u)}`;
}

// A change between two weights (kg), rounded in the user's unit first: "+1.2 kg", "-2.6 lb", "-1 st 0.4 lb".
// Returns '' when it rounds to zero in that unit, so callers can show "no change" instead of "0.0".
function formatWeightChange(diffKg, unit = null, fmt = null) {
    const u = unit || getWeightUnit();
    const d = parseFloat(diffKg);
    if (isNaN(d) || weightChangeIsZero(d, u)) return '';
    return (d > 0 ? '+' : '-') + formatWeight(Math.abs(d), u, fmt);
}

// True when a change in kg shows as 0.0 in the user's unit (0.1 kg, 0.1 lb)
function weightChangeIsZero(diffKg, unit = null) {
    const u = unit || getWeightUnit();
    const d = Math.abs(parseFloat(diffKg) || 0);
    return Math.round(d * (u === 'kg' ? 1 : 2.20462) * 10) === 0;
}

// A value in decimal stones (chart axis) as stones and pounds, e.g. 13.25 -> "13 st 3.5 lb"
function formatStoneValue(stones, fmt = null) {
    return formatWeight(parseFloat(stones) / 0.157473, 'st', fmt);
}

// Text the user typed for a stone weight, in kg. NaN if not understood. Commas work as decimal points.
//   "187.4 lb", "187.4 lbs", "187.4 pounds"  pounds only (checked first, so "200 lb" is never read as 20 st 0 lb)
//   "13 st 5.4 lb", "13st5.4lb", "13 st 5.4", "13 5.4"  whole stones and pounds; "st" or a space must separate
//                                                       them and the pounds must be under 14
//   "13 st", "13.5 st", "13.5"  stones; a bare number is decimal stones (13.5 = 13 st 7 lb). The weight fields
//                               show how the text was read (stoneInputHint) before it is saved.
function parseStoneInput(text) {
    const s = String(text).trim().toLowerCase().replace(/,/g, '.');
    const NUM = '(\\d+(?:\\.\\d+)?)';
    const LB = '(?:lb|lbs|pounds?)';
    const ST = '(?:st|stones?)';
    let m = s.match(new RegExp('^' + NUM + '\\s*' + LB + '$'));
    if (m) return parseFloat(m[1]) / 2.20462;
    m = s.match(new RegExp('^' + NUM + '(?:\\s*' + ST + ')?$'));
    if (m) return parseFloat(m[1]) / 0.157473;
    m = s.match(new RegExp('^(\\d+)(?:\\s*' + ST + '\\s*|\\s+)' + NUM + '(?:\\s*' + LB + ')?$'));
    if (m && parseFloat(m[2]) < 14) return (parseInt(m[1], 10) * 14 + parseFloat(m[2])) / 2.20462;
    return NaN;
}

// How a stone weight field's text will be saved, e.g. "= 13 st 7.0 lb" for "13.5". '' when empty, a short
// "not understood" note when it can't be read.
function stoneInputHint(text) {
    if (!String(text).trim()) return '';
    const kg = parseStoneInput(text);
    const tr = (x) => (typeof t === 'function' ? t(x) : x);
    return isNaN(kg) ? tr('Type e.g. 13 st 5 lb') : '= ' + formatWeight(kg, 'st');
}

// Oldest first by date; entries on the same date by id (the later-saved one counts as the latest, as on the server)
function compareEntriesByDate(a, b) {
    const d = String(a.entry_date).localeCompare(String(b.entry_date));
    return d || ((parseInt(a.id, 10) || 0) - (parseInt(b.id, 10) || 0));
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
    
    // Build the alert with the message as plain text (never HTML), so text from the URL or the
    // server can never run as script.
    const safeType = ['success', 'info', 'warning', 'danger', 'primary', 'secondary', 'light', 'dark'].indexOf(type) !== -1 ? type : 'info';
    const $alert = $('<div class="alert alert-dismissible fade show" role="alert"></div>').addClass('alert-' + safeType);
    $alert.append(document.createTextNode(String(message)));
    $alert.append('<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>');

    $('#alert-container').empty().append($alert);
    
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

function setDateFormat(format) {
    if (window.coverage) window.coverage.logFunction('setDateFormat', 'global.js');
    // Update global dashboard data if available
    if (window.globalDashboardData && window.globalDashboardData.settings) {
        window.globalDashboardData.settings.date_format = format;
    }
}

function getDateFormatLocale() {
    if (window.coverage) window.coverage.logFunction('getDateFormatLocale', 'global.js');
    const format = getDateFormat();
    switch(format) {
        case 'uk':
            return 'en-GB';
        case 'us':
            return 'en-US';
        case 'euro':
            return 'de-DE';
        case 'iso':
            return 'en-GB'; // ISO doesn't have locale, use UK as base
        default:
            return 'en-GB';
    }
}

/**
 * Get locale based on user's language setting (for month names, etc.)
 * @returns {string} Locale string like 'en-US', 'es-ES', 'fr-FR', 'de-DE'
 */
function getLanguageLocale() {
    if (window.coverage) window.coverage.logFunction('getLanguageLocale', 'global.js');
    const language = localStorage.getItem('language') || 'en';
    switch(language) {
        case 'en':
            return 'en-US';
        case 'es':
            return 'es-ES';
        case 'fr':
            return 'fr-FR';
        case 'de':
            return 'de-DE';
        default:
            return 'en-US';
    }
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
    debugLog('📅 formatDateBySettings - input:', dateInput, 'format:', format);

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    switch(format) {
        case 'uk':
            return `${day}/${month}/${year}`;
        case 'us':
            return `${month}/${day}/${year}`;
        case 'iso':
            return `${year}-${month}-${day}`;
        case 'euro':
            return `${day}.${month}.${year}`;
        default:
            return `${day}/${month}/${year}`;
    }
}

/**
 * Convert a user-formatted date string to ISO format (YYYY-MM-DD)
 * @param {string} dateInput - Date string in user's preferred format
 * @returns {string} ISO formatted date (YYYY-MM-DD) or original if invalid
 */
function convertDateToISO(dateInput) {
    if (window.coverage) window.coverage.logFunction('convertDateToISO', 'global.js');

    // If already in ISO format (YYYY-MM-DD), return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        return dateInput;
    }

    const format = getDateFormat();
    debugLog('📅 convertDateToISO - input:', dateInput, 'format:', format);

    let day, month, year;

    try {
        switch(format) {
            case 'uk': // dd/mm/yyyy
                const ukParts = dateInput.split('/');
                if (ukParts.length !== 3) return dateInput;
                day = parseInt(ukParts[0]);
                month = parseInt(ukParts[1]);
                year = parseInt(ukParts[2]);
                break;

            case 'us': // mm/dd/yyyy
                const usParts = dateInput.split('/');
                if (usParts.length !== 3) return dateInput;
                month = parseInt(usParts[0]);
                day = parseInt(usParts[1]);
                year = parseInt(usParts[2]);
                break;

            case 'euro': // dd.mm.yyyy
                const euroParts = dateInput.split('.');
                if (euroParts.length !== 3) return dateInput;
                day = parseInt(euroParts[0]);
                month = parseInt(euroParts[1]);
                year = parseInt(euroParts[2]);
                break;

            case 'iso': // yyyy-mm-dd (already checked above, but fallback)
                return dateInput;

            default:
                // Default to UK format
                const defaultParts = dateInput.split('/');
                if (defaultParts.length !== 3) return dateInput;
                day = parseInt(defaultParts[0]);
                month = parseInt(defaultParts[1]);
                year = parseInt(defaultParts[2]);
        }

        // Validate parsed values
        if (isNaN(day) || isNaN(month) || isNaN(year)) {
            debugLog('❌ convertDateToISO - invalid date parts:', { day, month, year });
            return dateInput;
        }

        // Validate ranges
        if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) {
            debugLog('❌ convertDateToISO - out of range:', { day, month, year });
            return dateInput;
        }

        // Format as ISO
        const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        debugLog('✅ convertDateToISO - result:', isoDate);
        return isoDate;

    } catch (error) {
        debugLog('❌ convertDateToISO - error:', error);
        return dateInput; // Return original on error
    }
}

/**
 * Format all timestamps on the page with class 'format-date'
 * Finds all elements with data-timestamp or data-date attributes and formats them
 */
function formatAllTimestamps() {
    if (window.coverage) window.coverage.logFunction('formatAllTimestamps', 'global.js');
    if (window.coverage) coverage.logFunction('formatAllTimestamps', 'global.js');

    debugLog('📅 formatAllTimestamps - formatting all date elements');

    // Find all elements with format-date class
    const dateElements = document.querySelectorAll('.format-date');

    dateElements.forEach(element => {
        // Check for data-timestamp or data-date attribute
        const timestamp = element.getAttribute('data-timestamp') || element.getAttribute('data-date');

        if (timestamp) {
            // Format the date and update the element text
            const formattedDate = formatDateBySettings(timestamp);
            element.textContent = formattedDate;
            debugLog('📅 Formatted timestamp:', timestamp, '→', formattedDate);
        }
    });

    debugLog('📅 formatAllTimestamps - completed, formatted', dateElements.length, 'elements');
}

// Make functions globally accessible
window.formatDateBySettings = formatDateBySettings;
window.convertDateToISO = convertDateToISO;
window.formatAllTimestamps = formatAllTimestamps;
window.getLanguageLocale = getLanguageLocale;