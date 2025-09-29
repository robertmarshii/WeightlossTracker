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
        email_time: $('#emailTime').val()
    };

    const formData = new FormData();
    Object.keys(settings).forEach(key => {
        if (typeof settings[key] === 'boolean') {
            formData.append(key, settings[key] ? 'true' : 'false');
        } else {
            formData.append(key, settings[key]);
        }
    });

    fetch('router.php?controller=profile', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(responseText => {
        const data = parseJson(responseText);
        if (data.success) {
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

// Make functions globally available
window.settingsSaveSettings = saveSettings;
window.settingsResetSettings = resetSettings;
window.settingsUpdateDateExample = updateDateExample;
window.settingsToggleEmailSchedule = toggleEmailSchedule;
window.settingsUpdateThemeOptions = updateThemeOptions;
window.settingsLoadThemeCSS = loadThemeCSS;