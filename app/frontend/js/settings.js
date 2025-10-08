// Settings tab functionality - User preferences and configuration

// Note: loadSettings() function is in dashboard.js (called during dashboard initialization)
// Note: saveSettings() function is in this file but called via dashboard.js wrapper

function saveSettings() {
    if (window.coverage) window.coverage.logFunction('saveSettings', 'settings.js');
    const settings = {
        action: 'save_settings',
        weight_unit: $('#weightUnit').val(),
        height_unit: $('#heightUnit').val(),
        date_format: $('#dateFormat').val(),
        theme: $('#theme').val(),
        language: $('#language').val(),
        share_data: $('#shareData').is(':checked'),
        email_notifications: $('#emailNotifications').is(':checked'),
        weekly_reports: $('#weeklyReports').is(':checked'),
        email_day: $('#emailDay').val(),
        email_time: $('#emailTime').val(),
        timezone: $('#timezone').val()
    };

    const params = new URLSearchParams();
    Object.keys(settings).forEach(key => {
        if (typeof settings[key] === 'boolean') {
            params.append(key, settings[key] ? 'true' : 'false');
        } else {
            params.append(key, settings[key]);
        }
    });

    fetch('router.php?controller=profile', {
        method: 'POST',
        body: params,
        credentials: 'same-origin',
        redirect: 'follow',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest'
        }
    }).then(response => {
        // Handle auth redirects
        if (response.redirected && response.url.includes('login')) {
            window.location.href = response.url;
            return Promise.reject('Redirected to login');
        }
        return response.text();
    })
    .then(responseText => {
        const data = parseJson(responseText);
        if (data.success) {
            // Update global dashboard data cache with new settings
            if (window.globalDashboardData && window.globalDashboardData.settings) {
                window.globalDashboardData.settings = {
                    weight_unit: settings.weight_unit,
                    height_unit: settings.height_unit,
                    date_format: settings.date_format,
                    theme: settings.theme,
                    language: settings.language,
                    share_data: settings.share_data,
                    email_notifications: settings.email_notifications,
                    weekly_reports: settings.weekly_reports,
                    email_day: settings.email_day,
                    email_time: settings.email_time,
                    timezone: settings.timezone
                };
                debugLog('✅ Updated globalDashboardData.settings cache');
            }

            // Update units and date format in localStorage FIRST
            debugLog('Settings saved, updating units and date format');
            setWeightUnit(settings.weight_unit);
            setHeightUnit(settings.height_unit);
            setDateFormat(settings.date_format);

            // Switch language BEFORE reloading data
            switchLanguage(settings.language);

            // Update theme display
            updateThemeOptions(settings.theme);

            // Update unit displays
            if (typeof window.updateWeightUnitDisplay === 'function') {
                if (window.coverage) window.coverage.logFunction('if', 'settings.js');
                window.updateWeightUnitDisplay();
            }
            if (typeof window.updateHeightUnitDisplay === 'function') {
                if (window.coverage) window.coverage.logFunction('if', 'settings.js');
                window.updateHeightUnitDisplay();
            }
            if (typeof window.refreshAllWeightDisplays === 'function') {
                window.refreshAllWeightDisplays();
            }

            // Reload all dashboard data AFTER language/units are set
            if (typeof window.testConsolidatedDashboardData === 'function') {
                debugLog('Reloading consolidated dashboard data after settings change');
                window.testConsolidatedDashboardData(function() {
                    // After data is reloaded, refresh all sections
                    if (typeof window.refreshGoalsAchieved === 'function') {
                        window.refreshGoalsAchieved();
                    }
                    if (typeof window.refreshTotalProgress === 'function') {
                        window.refreshTotalProgress();
                    }
                    if (typeof window.loadQuickLookMetrics === 'function') {
                        window.loadQuickLookMetrics();
                    }
                    if (typeof window.refreshStreakCounter === 'function') {
                        window.refreshStreakCounter();
                    }

                    // Reload weight history table (to update date formats)
                    if (typeof window.dataLoadWeightHistory === 'function') {
                        debugLog('Reloading weight history with new date format');
                        window.dataLoadWeightHistory();
                    }

                    // Update weight chart (to update date labels)
                    if (typeof window.updateWeightChart === 'function') {
                        debugLog('Updating weight chart with new date format');
                        window.updateWeightChart();
                    }

                    // Format all timestamps with new date format
                    if (typeof window.formatAllTimestamps === 'function') {
                        debugLog('Formatting all timestamps with new date format');
                        window.formatAllTimestamps();
                    }

                    // Update date input placeholders
                    if (typeof window.updateDatePlaceholders === 'function') {
                        debugLog('Updating date input placeholders with new date format');
                        window.updateDatePlaceholders();
                    }

                    // Refresh health cards (to update translations and units)
                    if (typeof window.healthRefreshBMI === 'function') {
                        debugLog('Refreshing BMI card');
                        window.healthRefreshBMI();
                    }
                    if (typeof window.healthRefreshHealth === 'function') {
                        debugLog('Refreshing body fat and cardio risk cards');
                        window.healthRefreshHealth();
                    }
                    if (typeof window.healthRefreshIdealWeight === 'function') {
                        debugLog('Refreshing ideal weight card');
                        window.healthRefreshIdealWeight();
                    }
                    if (typeof window.healthRefreshGallbladderHealth === 'function') {
                        debugLog('Refreshing gallbladder health card');
                        window.healthRefreshGallbladderHealth();
                    }

                    // Apply translations to all newly rendered content
                    if (typeof window.settingsApplyCurrentLanguageTranslations === 'function') {
                        debugLog('Applying translations after settings change content reload');
                        window.settingsApplyCurrentLanguageTranslations();
                    }
                });
            }

            document.getElementById('settings-status').textContent = 'Settings saved successfully';
            document.getElementById('settings-status').classList.remove('text-danger');
            document.getElementById('settings-status').classList.add('text-success');
            setTimeout(() => document.getElementById('settings-status').textContent = '', 3000);
        } else {
            document.getElementById('settings-status').textContent = 'Failed to save settings';
            document.getElementById('settings-status').classList.remove('text-success');
            document.getElementById('settings-status').classList.add('text-danger');
        }
    })
    .catch(error => {
        console.error('Settings save error:', error);
        document.getElementById('settings-status').textContent = 'Network error';
        document.getElementById('settings-status').classList.remove('text-success');
        document.getElementById('settings-status').classList.add('text-danger');
    });
}

function resetSettings() {
    if (window.coverage) window.coverage.logFunction('resetSettings', 'settings.js');
    $('#weightUnit').val('kg');
    $('#heightUnit').val('cm');
    $('#dateFormat').val('uk');
    $('#theme').val('glassmorphism');
    $('#language').val('en');
    $('#shareData').prop('checked', false);
    $('#emailNotifications').prop('checked', false);
    $('#weeklyReports').prop('checked', false);
    updateDateExample();
    saveSettings();
}

function updateDateExample() {
    if (window.coverage) window.coverage.logFunction('updateDateExample', 'settings.js');
    const format = $('#dateFormat').val();
    const today = new Date();
    let example = '';

    if (window.coverage) window.coverage.logFunction('switch', 'settings.js');
    switch(format) {
        case 'uk':
            example = today.toLocaleDateString('en-GB');
            break;
        case 'us':
            example = today.toLocaleDateString('en-US');
            break;
        case 'iso':
            example = today.toISOString().split('T')[0];
            break;
        case 'euro':
            example = today.toLocaleDateString('de-DE');
            break;
        default:
            example = today.toLocaleDateString('en-GB');
    }

    $('#dateExample').text(example);
}

function toggleEmailSchedule() {
    if (window.coverage) window.coverage.logFunction('toggleEmailSchedule', 'settings.js');
    const emailNotificationsChecked = $('#emailNotifications').is(':checked');
    if (emailNotificationsChecked) {
        $('#emailSchedule').show();
    } else {
        $('#emailSchedule').hide();
    }
}

function updateThemeOptions(currentTheme) {
    if (window.coverage) window.coverage.logFunction('updateThemeOptions', 'settings.js');

    // Remove (Current) from all options first
    $('#theme option').each(function() {
        const text = $(this).text().replace(' (Current)', '');
        $(this).text(text);
    });

    // Add (Current) to the current theme
    const currentOption = $('#theme option[value="' + currentTheme + '"]');
    if (currentOption.length) {
        const currentText = currentOption.text();
        currentOption.text(currentText + ' (Current)');
    }

    // Load the theme CSS
    loadThemeCSS(currentTheme);
}

function loadThemeCSS(themeName) {
    if (window.coverage) window.coverage.logFunction('loadThemeCSS', 'settings.js');

    const themeLink = document.getElementById('theme-css');
    if (themeLink) {
        const timestamp = new Date().getTime();
        themeLink.href = `css/themes/${themeName}.css?v=${timestamp}`;

        // Update chart colors when theme changes
        setTimeout(() => {
            if (typeof window.updateChartThemeColors === 'function') {
                if (window.coverage) window.coverage.logFunction('if', 'settings.js');
                window.updateChartThemeColors();
            }
        }, 100); // Small delay to ensure CSS is loaded
    }
}

// Global function to apply translations based on current language
function applyCurrentLanguageTranslations() {
    const languageCode = localStorage.getItem('language') || 'en';

    // Map language codes to data attribute names
    const langMap = {
        'en': 'eng',
        'es': 'spa',
        'fr': 'fre',
        'de': 'ger'
    };

    const dataAttr = langMap[languageCode];
    if (!dataAttr) {
        return;
    }

    const elementsToTranslate = $(`[data-${dataAttr}]`);

    elementsToTranslate.each(function() {
        const $element = $(this);
        const translatedText = $element.attr(`data-${dataAttr}`);

        if (translatedText) {
            // Handle input placeholders
            if ($element.is('input[placeholder]') || $element.is('textarea[placeholder]')) {
                $element.attr('placeholder', translatedText);
            }
            // Handle input/textarea values - skip them
            else if ($element.is('input, textarea')) {
                return;
            }
            // Handle all other elements - replace text/HTML
            else {
                // Skip if content is already correct (avoid re-applying and duplicating)
                if ($element.html() === translatedText) {
                    return;
                }

                // Check if element has children that don't have translation attributes
                const childrenWithoutTranslation = $element.children().filter(function() {
                    return !$(this).attr(`data-${dataAttr}`);
                });

                // If there are children without translations, preserve them
                if (childrenWithoutTranslation.length > 0) {
                    // Clone the children first
                    const clonedChildren = childrenWithoutTranslation.clone();
                    // Replace the text
                    $element.html(translatedText);
                    // Append the preserved children back
                    $element.append(clonedChildren);
                } else {
                    // No children to preserve, simple replacement
                    $element.html(translatedText);
                }
            }
        }
    });
}

// Language switching function
function switchLanguage(languageCode, skipReload = false) {
    if (window.coverage) window.coverage.logFunction('switchLanguage', 'settings.js');

    debugLog('Switching language to:', languageCode);

    // Map language codes to data attribute names
    const langMap = {
        'en': 'eng',
        'es': 'spa',
        'fr': 'fre',
        'de': 'ger'
    };

    const dataAttr = langMap[languageCode];
    if (!dataAttr) {
        console.error('Invalid language code:', languageCode);
        return;
    }

    // Store language preference in localStorage FIRST
    localStorage.setItem('language', languageCode);

    // Apply translations
    applyCurrentLanguageTranslations();

    debugLog('Language switched to:', languageCode);

    // Reload dynamic content that's generated by JavaScript
    // Skip reload during initial page load (it will be rendered after this)
    if (!skipReload) {
        reloadDynamicContent();
    }
}

// Reload functions that generate dynamic HTML with translations
// NOTE: These functions MUST use window.globalDashboardData and NEVER make API calls
// This preserves the global data system and prevents infinite loops
function reloadDynamicContent() {
    if (window.coverage) window.coverage.logFunction('reloadDynamicContent', 'settings.js');

    debugLog('Reloading dynamic content after language change...');

    // Only reload if global dashboard data is available
    // These functions check globalDashboardData first before falling back to API calls
    if (window.globalDashboardData) {
        // Quick Look Metrics (Consistency Score, Next Weigh-In, Encouragement)
        if (typeof window.loadQuickLookMetrics === 'function') {
            debugLog('Re-rendering quick look metrics from cache...');
            window.loadQuickLookMetrics();
        }

        // Goals Achieved (Progress bars, streaks, ETAs)
        if (typeof window.refreshGoalsAchieved === 'function') {
            debugLog('Re-rendering goals achieved from cache...');
            window.refreshGoalsAchieved();
        }

        // NOTE: Other sections like Health, Achievements, etc. should be added here
        // once they properly check window.globalDashboardData before making API calls

        // Apply translations to the newly rendered content
        debugLog('Applying translations to reloaded content...');
        applyCurrentLanguageTranslations();
    } else {
        debugLog('⚠️ Global dashboard data not available, skipping reload');
    }
}

// Make functions globally available
window.settingsSaveSettings = saveSettings;
window.settingsResetSettings = resetSettings;
window.settingsUpdateDateExample = updateDateExample;
window.settingsToggleEmailSchedule = toggleEmailSchedule;
window.settingsUpdateThemeOptions = updateThemeOptions;
window.settingsLoadThemeCSS = loadThemeCSS;
window.settingsSwitchLanguage = switchLanguage;
window.settingsApplyCurrentLanguageTranslations = applyCurrentLanguageTranslations;