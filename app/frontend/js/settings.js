// Settings tab functionality - User preferences and configuration

function loadSettings() {
    if (window.coverage) window.coverage.logFunction('loadSettings', 'settings.js');

    // Check if we have global data first
    console.log('🔍 loadSettings - checking global data:', window.globalDashboardData);
    console.log('🔍 settings in global data:', window.globalDashboardData?.settings);

    if (window.globalDashboardData && window.globalDashboardData.settings) {
        console.log('📊 Using global data for settings');
        const s = window.globalDashboardData.settings;
        $('#weightUnit').val(s.weight_unit || 'kg');
        $('#heightUnit').val(s.height_unit || 'cm');

        // Update localStorage with loaded settings
        setWeightUnit(s.weight_unit || 'kg');
        setHeightUnit(s.height_unit || 'cm');
        $('#dateFormat').val(s.date_format || 'uk');
        $('#theme').val(s.theme || 'glassmorphism');
        $('#language').val(s.language || 'en');
        $('#shareData').prop('checked', s.share_data === true);
        $('#emailNotifications').prop('checked', s.email_notifications === true);
        $('#weeklyReports').prop('checked', s.weekly_reports === true);
        $('#emailDay').val(s.email_day || 'monday');
        $('#emailTime').val(s.email_time || '09:00');
        updateDateExample();
        updateThemeOptions(s.theme || 'glassmorphism');
        toggleEmailSchedule();
        return;
    }

    // Fallback to API call if global data not available
    console.log('🌐 Making API call for settings (global data not available)');
    $.post('router.php?controller=profile', { action: 'get_settings' }, function(resp) {
        const data = parseJson(resp);
        if (data.success && data.settings) {
            const s = data.settings;
            $('#weightUnit').val(s.weight_unit || 'kg');
            $('#heightUnit').val(s.height_unit || 'cm');
            $('#dateFormat').val(s.date_format || 'uk');
            $('#theme').val(s.theme || 'glassmorphism');
            $('#language').val(s.language || 'en');
                $('#shareData').prop('checked', s.share_data === true);
            $('#emailNotifications').prop('checked', s.email_notifications === true);
            $('#weeklyReports').prop('checked', s.weekly_reports === true);
            $('#emailDay').val(s.email_day || 'monday');
            $('#emailTime').val(s.email_time || '09:00');
            updateDateExample();
            updateThemeOptions(s.theme || 'glassmorphism');
            toggleEmailSchedule();
        }
    });
}

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

    $.post('router.php?controller=profile', settings, function(resp) {
        const data = parseJson(resp);
        if (data.success) {
            // Update weight unit in localStorage and refresh displays
            console.log('Settings saved, updating weight unit to:', settings.weight_unit);
            setWeightUnit(settings.weight_unit);

            console.log('Current weight unit after save:', getWeightUnit());

            if (typeof window.updateWeightUnitDisplay === 'function') {
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
                console.log('Calling updateHeightUnitDisplay');
                window.updateHeightUnitDisplay();
            }

            // Update theme display to show new current theme
            updateThemeOptions(settings.theme);

            $('#settings-status').text('Settings saved successfully').removeClass('text-danger').addClass('text-success');
            setTimeout(() => $('#settings-status').text(''), 3000);
        } else {
            $('#settings-status').text('Failed to save settings').removeClass('text-success').addClass('text-danger');
        }
    }).fail(function() {
        $('#settings-status').text('Network error').removeClass('text-success').addClass('text-danger');
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
                window.updateChartThemeColors();
            }
        }, 100); // Small delay to ensure CSS is loaded
    }
}

// Make functions globally available
window.settingsLoadSettings = loadSettings;
window.settingsSaveSettings = saveSettings;
window.settingsResetSettings = resetSettings;
window.settingsUpdateDateExample = updateDateExample;
window.settingsToggleEmailSchedule = toggleEmailSchedule;
window.settingsUpdateThemeOptions = updateThemeOptions;
window.settingsLoadThemeCSS = loadThemeCSS;