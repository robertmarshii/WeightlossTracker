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
        $('#dateFormat').val(s.date_format || 'uk');
        $('#timezone').val(s.timezone || 'Europe/London');
        $('#theme').val(s.theme || 'glassmorphism');
        $('#language').val(s.language || 'en');
        $('#startOfWeek').val(s.start_of_week || 'monday');
        $('#shareData').prop('checked', s.share_data === true);
        $('#emailNotifications').prop('checked', s.email_notifications === true);
        $('#weeklyReports').prop('checked', s.weekly_reports === true);
        updateDateExample();
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
            $('#timezone').val(s.timezone || 'Europe/London');
            $('#theme').val(s.theme || 'glassmorphism');
            $('#language').val(s.language || 'en');
            $('#startOfWeek').val(s.start_of_week || 'monday');
            $('#shareData').prop('checked', s.share_data === true);
            $('#emailNotifications').prop('checked', s.email_notifications === true);
            $('#weeklyReports').prop('checked', s.weekly_reports === true);
            updateDateExample();
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
        timezone: $('#timezone').val(),
        theme: $('#theme').val(),
        language: $('#language').val(),
        start_of_week: $('#startOfWeek').val(),
        share_data: $('#shareData').is(':checked'),
        email_notifications: $('#emailNotifications').is(':checked'),
        weekly_reports: $('#weeklyReports').is(':checked')
    };

    $.post('router.php?controller=profile', settings, function(resp) {
        const data = parseJson(resp);
        if (data.success) {
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
    $('#timezone').val('Europe/London');
    $('#theme').val('glassmorphism');
    $('#language').val('en');
    $('#startOfWeek').val('monday');
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

// Make functions globally available
window.settingsLoadSettings = loadSettings;
window.settingsSaveSettings = saveSettings;
window.settingsResetSettings = resetSettings;
window.settingsUpdateDateExample = updateDateExample;