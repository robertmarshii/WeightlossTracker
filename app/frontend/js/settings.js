// Settings tab functionality - User preferences and configuration
console.log('📋 Settings.js loaded');

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
                console.log('✅ Updated globalDashboardData.settings cache');
            }

            // Update weight unit in localStorage and refresh displays
            console.log('Settings saved, updating weight unit to:', settings.weight_unit);
            setWeightUnit(settings.weight_unit);

            console.log('Current weight unit after save:', getWeightUnit());

            if (typeof window.updateWeightUnitDisplay === 'function') {
                if (window.coverage) window.coverage.logFunction('if', 'settings.js');
                console.log('Calling updateWeightUnitDisplay');
                window.updateWeightUnitDisplay();
            }
            if (typeof window.refreshAllWeightDisplays === 'function') {
                console.log('Calling refreshAllWeightDisplays');
                window.refreshAllWeightDisplays();
            }

            // Update height unit in localStorage and refresh displays
            setHeightUnit(settings.height_unit);
            if (typeof window.updateHeightUnitDisplay === 'function') {
                if (window.coverage) window.coverage.logFunction('if', 'settings.js');
                console.log('Calling updateHeightUnitDisplay');
                window.updateHeightUnitDisplay();
            }

            // Update theme display to show new current theme
            updateThemeOptions(settings.theme);

            // Switch language after saving
            switchLanguage(settings.language);

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

// Language switching function
function switchLanguage(languageCode) {
    if (window.coverage) window.coverage.logFunction('switchLanguage', 'settings.js');

    console.log('Switching language to:', languageCode);

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

    // Find all elements with the chosen language attribute and replace their content
    $(`[data-${dataAttr}]`).each(function() {
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

    // Store language preference in localStorage
    localStorage.setItem('language', languageCode);

    console.log('Language switched to:', languageCode);

    // Reload dynamic content that's generated by JavaScript
    reloadDynamicContent();
}

// Reload functions that generate dynamic HTML with translations
function reloadDynamicContent() {
    if (window.coverage) window.coverage.logFunction('reloadDynamicContent', 'settings.js');

    console.log('Reloading dynamic content after language change...');

    // Reload Health tab content
    if (typeof window.testPersonalBenefitsCalculator === 'function') {
        console.log('Reloading Health Score...');
        window.testPersonalBenefitsCalculator();
    }
    if (typeof window.healthRefreshBMI === 'function') {
        console.log('Reloading BMI...');
        window.healthRefreshBMI();
    }
    if (typeof window.healthRefreshHealth === 'function') {
        console.log('Reloading health stats...');
        window.healthRefreshHealth();
    }
    if (typeof window.healthRefreshIdealWeight === 'function') {
        console.log('Reloading ideal weight...');
        window.healthRefreshIdealWeight();
    }
    if (typeof window.healthRefreshGallbladderHealth === 'function') {
        console.log('Reloading gallbladder health...');
        window.healthRefreshGallbladderHealth();
    }

    // Reload Achievements tab content
    if (typeof window.updateAllAchievements === 'function') {
        console.log('Reloading achievements...');
        window.updateAllAchievements();
    }

    // Reload weight displays (Overview tab)
    if (typeof window.refreshLatestWeight === 'function') {
        console.log('Reloading weight displays...');
        window.refreshLatestWeight();
    }
    if (typeof window.refreshWeightProgress === 'function') {
        console.log('Reloading weight progress...');
        window.refreshWeightProgress();
    }
    if (typeof window.refreshGoal === 'function') {
        console.log('Reloading goal display...');
        window.refreshGoal();
    }

    // Reload Data tab content
    if (typeof window.dataRefreshWeightHistory === 'function') {
        console.log('Reloading weight history table...');
        window.dataRefreshWeightHistory();
    }

    // Note: Other dynamic content (status messages, loading indicators, etc.)
    // will be translated when they're next generated by their respective functions
    // since they'll use the t() function
}

// Make functions globally available
window.settingsSaveSettings = saveSettings;
window.settingsResetSettings = resetSettings;
window.settingsUpdateDateExample = updateDateExample;
window.settingsToggleEmailSchedule = toggleEmailSchedule;
window.settingsUpdateThemeOptions = updateThemeOptions;
window.settingsLoadThemeCSS = loadThemeCSS;
window.settingsSwitchLanguage = switchLanguage;