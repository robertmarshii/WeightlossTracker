
// Global variable to store consolidated dashboard data
window.globalDashboardData = null;

// Helper function for standardized fetch requests
function postRequest(url, data) {
    const params = new URLSearchParams();
    Object.keys(data).forEach(key => {
        params.append(key, data[key]);
    });
    return fetch(url, {
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
    });
}

$(function() {
    // Initialize unit systems first
    initializeWeightUnit();
    initializeHeightUnit();

    // Load settings data
    setTimeout(() => {
        if (typeof window.settingsLoadSettings === 'function') {
            debugLog('📋 Loading settings on dashboard init');
            window.settingsLoadSettings();
        } else {
            // debugLog('❌ Settings load function not available yet');
        }
    }, 500);

    // Log active schema to console for debugging
    const formData = new FormData();
    formData.append('action', 'get');
    fetch('router.php?controller=schema', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
    })
    .then(response => response.text())
    .then(resp => {
        try {
            const data = typeof resp === 'string' ? JSON.parse(resp) : resp;
            if (data && data.schema) {
                if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
                debugLog('Active schema:', data.schema);
            }
        } catch (e) {}
    })
    .catch(error => console.error('Schema fetch error:', error));

    $('#btn-logout').on('click', function() {
        // Show immediate feedback
        $(this).prop('disabled', true).text('↪ Logging out...');

        // Set a timeout to ensure redirect happens even if server is slow
        setTimeout(function() {
            if (window.coverage) window.coverage.logFunction('setTimeout', 'dashboard.js');
            window.location.href = 'index.php';
        }, 1000);

        const logoutFormData = new FormData();
        logoutFormData.append('action', 'logout');
        fetch('login_router.php?controller=auth', {
            method: 'POST',
            body: logoutFormData,
            credentials: 'same-origin'
        })
        .then(() => {
            window.location.href = 'index.php';
        })
        .catch(() => {
            // Even if network fails, try redirect
            window.location.href = 'index.php';
        });
    });

    // FIRST: Load consolidated data, THEN load settings, THEN render content
    testConsolidatedDashboardData(function() {
        if (window.coverage) window.coverage.logFunction('testConsolidatedDashboardData', 'dashboard.js');
        // This callback runs after consolidated data is loaded

        // STEP 1: Load settings FIRST to establish language preference
        loadSettings(function() {
            // STEP 2: Now render all content in the correct language
            refreshLatestWeight();
            refreshGoal();
            loadProfile();
            refreshBMI();
            refreshHealth();
            refreshIdealWeight();
            refreshWeightProgress();
            refreshGallbladderHealth();
            refreshPersonalHealthBenefits();
            loadWeightHistory();
            loadQuickLookMetrics(); // Phase 1: Quick Look section
            refreshGoalsAchieved(); // Phase 2: Goals Achieved enhancements
            refreshTotalProgress(); // Phase 4: Total Progress enhancements
            refreshStreakCounter(); // Phase 3: Streak Counter

            // Initialize weight chart now that global data is available
            initWeightChart();

            // Flush debug logs after ALL page initialization completes
            setTimeout(() => {
                window.flushDebugLogs();
            }, 5000);
        });
    });
    
    // Set today's date as default for new entries
    $('#newDate').val(new Date().toISOString().split('T')[0]);

    // Handlers
    $('#btn-add-weight').on('click', function() {
        const weightInput = $('#weightKg').val().trim();
        if (!weightInput) { return; }
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');

        // Convert user input to kg for storage
        const weightKg = convertToKg(weightInput);
        if (isNaN(weightKg) || weightKg <= 0) {
            showAlert('Please enter a valid weight', 'warning');
            return;
        }

        postRequest('router.php?controller=profile', { action: 'add_weight', weight_kg: weightKg.toFixed(2) })
        .then(resp => {
            const data = parseJson(resp);
            if (data.success) {
                showToast('Weight saved');
                $('#weightKg').val('');

                // Reload global data first, then refresh all functions
                reloadGlobalDashboardData(function() {
                    if (window.coverage) window.coverage.logFunction('reloadGlobalDashboardData', 'dashboard.js');
                    // Functions using global data
                    refreshLatestWeight();
                    refreshBMI();
                    refreshHealth(); // body fat uses global, cardiovascular risk uses individual API
                    refreshWeightProgress();
                    refreshGallbladderHealth();
                    loadWeightHistory();
                    loadQuickLookMetrics(); // Phase 1: Quick Look section
                    refreshGoalsAchieved(); // Phase 2: Goals Achieved enhancements
                    refreshStreakCounter(); // Phase 3: Streak Counter enhancements
                    refreshTotalProgress(); // Phase 4: Total Progress enhancements

                    // Functions using individual API calls
                    refreshIdealWeight(); // always uses individual API call
                    refreshPersonalHealthBenefits();

                    // Update the weight chart with current period
                    const activePeriod = $('.btn-group .active').attr('id')?.replace('chart-', '') || '90days';
                    updateWeightChart(activePeriod);
                });
            } else {
                showAlert('Failed to save weight', 'danger');
            }
        })
        .catch(() => {
            showAlert('Network error', 'danger');
        });
    });
    
    // Weight History Handlers
    $('#btn-add-entry').on('click', function() {
        $('#add-entry-form').slideDown();
        $('#newWeight').focus();
    });
    
    $('#btn-cancel-entry').on('click', function() {
        $('#add-entry-form').slideUp();
        $('#newWeight').val('');
        $('#newDate').val(new Date().toISOString().split('T')[0]);
    });
    
    $('#btn-save-entry').on('click', function() {
        const weightInput = $('#newWeight').val().trim();
        const date = $('#newDate').val();

        if (!weightInput || !date) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            showToast('Please enter both weight and date');
            return;
        }

        // Convert user input to kg for storage
        const weightKg = convertToKg(weightInput);
        if (isNaN(weightKg) || weightKg <= 0) {
            showToast('Please enter a valid weight');
            return;
        }

        postRequest('router.php?controller=profile', {
            action: 'add_weight',
            weight_kg: weightKg.toFixed(2),
            entry_date: date
        })
        .then(resp => {
            const data = parseJson(resp);
            if (data.success) {
                showToast('Weight entry saved');
                $('#add-entry-form').slideUp();
                $('#newWeight').val('');
                $('#newDate').val(new Date().toISOString().split('T')[0]);

                // Reload global data first, then refresh all functions
                reloadGlobalDashboardData(function() {
                    if (window.coverage) window.coverage.logFunction('reloadGlobalDashboardData', 'dashboard.js');
                    // Functions using global data
                    refreshLatestWeight();
                    refreshBMI();
                    refreshHealth(); // body fat uses global, cardiovascular risk uses individual API
                    refreshWeightProgress();
                    refreshGallbladderHealth();
                    loadWeightHistory();
                    loadQuickLookMetrics(); // Phase 1: Quick Look section
                    refreshGoalsAchieved(); // Phase 2: Goals Achieved enhancements
                    refreshStreakCounter(); // Phase 3: Streak Counter enhancements
                    refreshTotalProgress(); // Phase 4: Total Progress enhancements

                    // Functions using individual API calls
                    refreshIdealWeight(); // always uses individual API call

                    // Update the weight chart with current period
                    const activePeriod = $('.btn-group .active').attr('id')?.replace('chart-', '') || '90days';
                    updateWeightChart(activePeriod);
                });
            } else {
                showToast('Failed to save weight entry');
            }
        })
        .catch(() => {
            showToast('Network error');
        });
    });

    $('#btn-save-goal').on('click', function() {
        const goalInput = $('#goalWeight').val().trim();
        const d = $('#goalDate').val();
        if (!goalInput) { return; }
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');

        // Convert user input to kg for storage
        const weightKg = convertToKg(goalInput);
        if (isNaN(weightKg) || weightKg <= 0) {
            showAlert('Please enter a valid goal weight', 'warning');
            return;
        }

        postRequest('router.php?controller=profile', { action: 'save_goal', target_weight_kg: weightKg.toFixed(2), target_date: d })
        .then(resp => {
            const data = parseJson(resp);
            if (data.success) {
                if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
                showToast('Goal saved');
                refreshGoal();
                refreshPersonalHealthBenefits();
            } else {
                showAlert('Failed to save goal', 'warning');
            }
        })
        .catch(() => {
            showAlert('Network error', 'danger');
        });
    });

    $('#btn-save-profile').on('click', function() {
        const heightInput = $('#heightCm').val().trim();
        let heightCm = 0;

        if (heightInput) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            heightCm = convertToCm(heightInput);
            if (isNaN(heightCm) || heightCm <= 0) {
                showAlert('Please enter a valid height', 'warning');
                return;
            }
        }

        const payload = {
            action: 'save_profile',
            height_cm: Math.round(heightCm),
            body_frame: $('#bodyFrame').val(),
            age: parseInt($('#age').val() || ''),
            activity_level: $('#activityLevel').val()
        };
        $.post('router.php?controller=profile', payload, function(resp) {
            const data = parseJson(resp);
            if (data.success) {
                $('#profile-status').text('Profile saved').removeClass('text-danger').addClass('text-success');
                setTimeout(() => $('#profile-status').text(''), 3000);

                // Reload global data first, then refresh all functions
                reloadGlobalDashboardData(function() {
                    if (window.coverage) window.coverage.logFunction('reloadGlobalDashboardData', 'dashboard.js');
                    // Functions using global data
                    refreshBMI();
                    refreshHealth(); // body fat uses global, cardiovascular risk uses individual API
                    refreshWeightProgress();
                    refreshGallbladderHealth();

                    // Functions using individual API calls
                    refreshIdealWeight(); // always uses individual API call
                    refreshPersonalHealthBenefits();

                    // Update the weight chart with current period (profile changes might affect BMI data in chart)
                    const activePeriod = $('.btn-group .active').attr('id')?.replace('chart-', '') || '90days';
                    updateWeightChart(activePeriod);
                });
            } else {
                $('#profile-status').text('Save failed').removeClass('text-success').addClass('text-danger');
            }
        })
    .catch(() => {
            $('#profile-status').text('Network error').removeClass('text-success').addClass('text-danger');
        });
    });

    // Settings handlers
    $('#dateFormat').on('change', function() {
        updateDateExample();
    });

    $('#emailNotifications').on('change', function() {
        toggleEmailSchedule();
    });

    // Language dropdown - no immediate action, only save on button click

    $(document).on('click', '#btn-save-settings', function() {
        saveSettings();
    });

    $(document).on('click', '#btn-reset-settings', function() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            resetSettings();
        }
    });
    
    // Update date example when format changes
    updateDateExample();

    // Tab URL hash navigation
    initTabNavigation();

    // Note: Chart initialization moved to testConsolidatedDashboardData callback
    // to ensure global data is available before loading chart

    // Chart period handlers
    $('#chart-weekly, #chart-30days, #chart-90days, #chart-monthly, #chart-yearly, #chart-all').on('click', function() {
        $('#chart-weekly, #chart-30days, #chart-90days, #chart-monthly, #chart-yearly, #chart-all').removeClass('active');
        $(this).addClass('active');
        const period = $(this).attr('id').replace('chart-', '');
        currentPeriodOffset = 0; // Reset to current period
        updateWeightChart(period);
    });
    
    // Chart navigation handlers
    $('#chart-prev').on('click', function() {
        currentPeriodOffset++;
        const activePeriod = $('.btn-group .active').attr('id').replace('chart-', '');
        updateWeightChart(activePeriod);
    });
    
    $('#chart-next').on('click', function() {
        if (currentPeriodOffset > 0) {
            currentPeriodOffset--;
            const activePeriod = $('.btn-group .active').attr('id').replace('chart-', '');
            updateWeightChart(activePeriod);
        }
    });
});

function reloadGlobalDashboardData(callback) {
    if (window.coverage) window.coverage.logFunction('reloadGlobalDashboardData', 'dashboard.js');
    debugLog('🔄 Reloading global dashboard data...');
    postRequest('router.php?controller=profile', { action: 'get_all_dashboard_data' })
    .then(resp => {
        const result = parseJson(resp);
        debugLog('Reloaded dashboard data result:', result);

        if (result.success) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            // Store the data globally so other functions can use it
            window.globalDashboardData = result.data;
            // debugLog('✅ Global dashboard data updated');

            if (callback) {
                callback();
            }
        } else {
            // debugLog('❌ Failed to reload global dashboard data:', result.message);
            // Clear global data on failure
            window.globalDashboardData = null;

            if (callback) {
                if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
                callback();
            }
        }
    })
    .catch(() => {
        // debugLog('❌ Network error reloading global dashboard data');
        window.globalDashboardData = null;

        if (callback) {
            callback();
        }
    });
}

function testConsolidatedDashboardData(callback) {
    if (window.coverage) window.coverage.logFunction('testConsolidatedDashboardData', 'dashboard.js');
    postRequest('router.php?controller=profile', { action: 'get_all_dashboard_data' })
    .then(resp => {
        const result = parseJson(resp);

        if (result.success) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            // Store the data globally so other functions can use it
            window.globalDashboardData = result.data;
            debugLog('✅ Global dashboard data loaded. Keys:', Object.keys(window.globalDashboardData));
            debugLog('🔍 health_stats available:', !!window.globalDashboardData.health_stats);
            debugLog('🔍 weight_progress available:', !!window.globalDashboardData.weight_progress);
            debugLog('🔍 ideal_weight available:', !!window.globalDashboardData.ideal_weight);
        } else {
            console.error('❌ get_all_dashboard_data failed:', result.message);
        }

        // Call the callback regardless of success/failure
        if (callback && typeof callback === 'function') {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            debugLog('📞 Calling callback. globalDashboardData exists:', !!window.globalDashboardData);
            callback();
        }
    })
    .catch(() => {

        // Call the callback even on failure so individual functions still run
        if (callback && typeof callback === 'function') {
            callback();
        }
    });
}

function refreshLatestWeight() {
    if (window.coverage) window.coverage.logFunction('refreshLatestWeight', 'dashboard.js');

    // Check if we have global data first
    debugLog('refreshLatestWeight', { hasGlobalData: !!window.globalDashboardData });
    if (window.globalDashboardData && window.globalDashboardData.latest_weight) {
        if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
        debugLog('Using global data for latest weight');
        const latestWeight = window.globalDashboardData.latest_weight;
        const formattedDate = formatDate(latestWeight.entry_date);
        const displayWeight = convertFromKg(latestWeight.weight_kg);
        const unit = getWeightUnitLabel();
        $('#latest-weight').text(`${t('Latest:')} ${displayWeight} ${unit} ${t('on')} ${formattedDate}`);
        refreshHistoricalWeights();
        return;
    }

    // Fallback to API call if global data not available
    postRequest('router.php?controller=profile', { action: 'get_latest_weight' })
    .then(resp => {
        const data = parseJson(resp);
        if (data.latest) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            const formattedDate = formatDate(data.latest.entry_date);
            const displayWeight = convertFromKg(data.latest.weight_kg);
            const unit = getWeightUnitLabel();
            $('#latest-weight').text(`${t('Latest:')} ${displayWeight} ${unit} ${t('on')} ${formattedDate}`);
            refreshHistoricalWeights();
        } else {
            $('#latest-weight').text('No weight entries yet');
            $('#last-week-weight').text('');
            $('#last-month-weight').text('');
        }
    });
}

function refreshHistoricalWeights() {
    if (window.coverage) window.coverage.logFunction('refreshHistoricalWeights', 'dashboard.js');

    // Calculate dates for one week ago and one month ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    let weightHistory = [];

    // Check if we have global data first
    if (window.globalDashboardData && window.globalDashboardData.weight_history) {
        if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
        weightHistory = window.globalDashboardData.weight_history;
        findAndDisplayHistoricalWeights(weightHistory, oneWeekAgo, oneMonthAgo);
        return;
    }

    // Fallback to API call if global data not available
    if (typeof $ === 'undefined' || typeof $.post !== 'function') {
        // debugLog('⚠️ jQuery not available for refreshHistoricalWeights, skipping API call');
        return;
    }
    postRequest('router.php?controller=profile', { action: 'get_weight_history' })
    .then(resp => {
        const data = parseJson(resp);
        if (data.success && data.history) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            weightHistory = data.history;
            findAndDisplayHistoricalWeights(weightHistory, oneWeekAgo, oneMonthAgo);
        } else {
            $('#last-week-weight').text('');
            $('#last-month-weight').text('');
        }
    })
    .catch(() => {
        $('#last-week-weight').text('');
        $('#last-month-weight').text('');
    });
}

function findAndDisplayHistoricalWeights(weightHistory, oneWeekAgo, oneMonthAgo) {
    if (window.coverage) window.coverage.logFunction('findAndDisplayHistoricalWeights', 'dashboard.js');

    const unit = getWeightUnitLabel();

    // Find closest weight to one week ago
    let lastWeekWeight = null;
    let minWeekDiff = Infinity;

    // Find closest weight to one month ago
    let lastMonthWeight = null;
    let minMonthDiff = Infinity;

    weightHistory.forEach(entry => {
        const entryDate = new Date(entry.entry_date);

        // Check for week
        const weekDiff = Math.abs(entryDate - oneWeekAgo);
        if (weekDiff < minWeekDiff) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            minWeekDiff = weekDiff;
            lastWeekWeight = entry;
        }

        // Check for month
        const monthDiff = Math.abs(entryDate - oneMonthAgo);
        if (monthDiff < minMonthDiff) {
            minMonthDiff = monthDiff;
            lastMonthWeight = entry;
        }
    });

    // Display last week weight
    if (lastWeekWeight && minWeekDiff <= 10 * 24 * 60 * 60 * 1000) { // Within 10 days
        if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
        const displayWeight = convertFromKg(lastWeekWeight.weight_kg);
        const formattedDate = formatDate(lastWeekWeight.entry_date);
        $('#last-week-weight').text(`${t('Last Week:')} ${displayWeight} ${unit} ${t('on')} ${formattedDate}`);
    } else {
        $('#last-week-weight').text(`${t('Last Week:')} -`);
    }

    // Display last month weight
    if (lastMonthWeight && minMonthDiff <= 45 * 24 * 60 * 60 * 1000) { // Within 45 days
        const displayWeight = convertFromKg(lastMonthWeight.weight_kg);
        const formattedDate = formatDate(lastMonthWeight.entry_date);
        $('#last-month-weight').text(`${t('Last Month:')} ${displayWeight} ${unit} ${t('on')} ${formattedDate}`);
    } else {
        $('#last-month-weight').text(`${t('Last Month:')} -`);
    }
}

function refreshGoal() {
    if (window.coverage) window.coverage.logFunction('refreshGoal', 'dashboard.js');

    // Check if we have global data first
    debugLog('🔍 refreshGoal - has global data:', !!window.globalDashboardData, 'has goal:', !!window.globalDashboardData?.goal);

    if (window.globalDashboardData && window.globalDashboardData.goal) {
        if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
        debugLog('📊 Using global data for goal');
        const goal = window.globalDashboardData.goal;
        const formattedDate = goal.target_date ? formatDateBySettings(goal.target_date) : 'n/a';
        const displayWeight = convertFromKg(goal.target_weight_kg);
        const unit = getWeightUnitLabel();
        $('#current-goal').text(`${t('Current goal:')} ${displayWeight} ${unit} ${t('by')} ${formattedDate}`);
        return;
    }

    // Check if global data loaded but no goal exists
    if (window.globalDashboardData && !window.globalDashboardData.goal) {
        if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
        debugLog('📊 Using global data for goal (no goal set)');
        $('#current-goal').text('No active goal set');
        return;
    }

    // Fallback to API call if global data not available
    debugLog('🌐 Making API call for goal (global data not available)');
    if (typeof $ === 'undefined' || typeof $.post !== 'function') {
        // debugLog('⚠️ jQuery not available for refreshGoal, skipping API call');
        return;
    }
    postRequest('router.php?controller=profile', { action: 'get_goal' })
    .then(resp => {
        const data = parseJson(resp);
        if (data.goal) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            const formattedDate = data.goal.target_date ? formatDateBySettings(data.goal.target_date) : 'n/a';
            const displayWeight = convertFromKg(data.goal.target_weight_kg);
            const unit = getWeightUnitLabel();
            $('#current-goal').text(`${t('Current goal:')} ${displayWeight} ${unit} ${t('by')} ${formattedDate}`);
        } else {
            $('#current-goal').text('No active goal set');
        }
    });
}

function loadProfile() {
    if (window.coverage) window.coverage.logFunction('loadProfile', 'dashboard.js');

    // Check if we have global data first
    if (window.globalDashboardData && window.globalDashboardData.profile) {
        if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
        debugLog('📊 Using global data for profile');
        const profile = window.globalDashboardData.profile;
        const displayHeight = profile.height_cm ? convertFromCm(profile.height_cm) : '';
        $('#heightCm').val(displayHeight).data('current-unit', getHeightUnit());
        $('#bodyFrame').val(profile.body_frame || '');
        $('#age').val(profile.age || '');
        $('#activityLevel').val(profile.activity_level || '');
        return;
    }

    // Fallback to API call if global data not available
    debugLog('🌐 Making API call for profile (global data not available)');
    if (typeof $ === 'undefined' || typeof $.post !== 'function') {
        // debugLog('⚠️ jQuery not available for loadProfile, skipping API call');
        return;
    }
    postRequest('router.php?controller=profile', { action: 'get_profile' })
    .then(resp => {
        const data = parseJson(resp);
        if (data.profile) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            const displayHeight = data.profile.height_cm ? convertFromCm(data.profile.height_cm) : '';
            $('#heightCm').val(displayHeight);
            $('#bodyFrame').val(data.profile.body_frame || '');
            $('#age').val(data.profile.age || '');
            $('#activityLevel').val(data.profile.activity_level || '');
        }
    });
}

function refreshBMI() {
    if (window.coverage) window.coverage.logFunction('refreshBMI', 'dashboard.js');
    // Call the health.js function
    if (typeof window.healthRefreshBMI === 'function') {
        window.healthRefreshBMI();
    }
}

function refreshHealth() {
    if (window.coverage) window.coverage.logFunction('refreshHealth', 'dashboard.js');
    // Call the health.js function
    if (typeof window.healthRefreshHealth === 'function') {
        window.healthRefreshHealth();
    }
}

function refreshIdealWeight() {
    if (window.coverage) window.coverage.logFunction('refreshIdealWeight', 'dashboard.js');
    // Call the health.js function
    if (typeof window.healthRefreshIdealWeight === 'function') {
        window.healthRefreshIdealWeight();
    }
}

function refreshWeightProgress() {
    if (window.coverage) window.coverage.logFunction('refreshWeightProgress', 'dashboard.js');

    // Check if we have global data first
    debugLog('🔍 refreshWeightProgress - has global data:', !!window.globalDashboardData, 'has weight_progress:', !!window.globalDashboardData?.weight_progress);

    if (window.globalDashboardData && window.globalDashboardData.weight_progress) {
        if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
        debugLog('📊 Using global data for weight progress');
        const data = window.globalDashboardData.weight_progress;
        const el = $('#progress-block');

        const lines = [];
        const unit = getWeightUnitLabel();
        const displayTotalLost = convertFromKg(data.total_weight_lost_kg);
        lines.push(`${t('Total Weight Lost:')} <strong>${displayTotalLost} ${unit}</strong>`);
        if (data.estimated_fat_loss_kg) {
            const fatLoss = convertFromKg(data.estimated_fat_loss_kg);
            lines.push(`${t('Estimated Fat Loss:')} <strong class="text-success">${fatLoss} ${unit} (${data.fat_loss_percentage}%)</strong>`);
        }
        const avgWeeklyRate = convertFromKg(data.avg_weekly_rate_kg || data.average_weekly_loss_kg);
        lines.push(`<small class="text-muted">${t('Over')} ${data.weeks_elapsed || data.weeks_tracked} ${t('weeks')} (${avgWeeklyRate} ${t('kg/week average')})</small>`);
        if (data.research_note) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            lines.push(`<small class="text-muted">${t('Research suggests ~78% of weight loss is fat when combined with exercise')}</small>`);
        }

        el.html(lines.join('<br>')).removeClass('text-muted');
        return;
    }

    // Fallback to API call if global data not available
    debugLog('🌐 Making API call for weight progress (global data not available)');
    if (typeof $ === 'undefined' || typeof $.post !== 'function') {
        // debugLog('⚠️ jQuery not available for refreshWeightProgress, skipping API call');
        return;
    }
    postRequest('router.php?controller=profile', { action: 'get_weight_progress' })
    .then(resp => {
        const data = parseJson(resp);
        const el = $('#progress-block');

        if (!data.success) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            el.text(data.message || 'Need at least 2 weight entries to show progress').addClass('text-muted');
            return;
        }

        const lines = [];
        const unit = getWeightUnitLabel();
        const displayTotalLost = convertFromKg(data.total_weight_lost_kg);
        lines.push(`${t('Total Weight Lost:')} <strong>${displayTotalLost} ${unit}</strong>`);
        const fatLoss = convertFromKg(data.estimated_fat_loss_kg);
        lines.push(`${t('Estimated Fat Loss:')} <strong class="text-success">${fatLoss} ${unit}</strong> (${data.fat_loss_percentage}%)`);
        const avgWeeklyRate = convertFromKg(data.avg_weekly_rate_kg);
        lines.push(`<small class="text-muted">${t('Over')} ${data.weeks_elapsed} ${t('weeks')} (${avgWeeklyRate} ${t('kg/week average')})</small>`);
        lines.push(`<small class="text-muted">${t('Research suggests ~78% of weight loss is fat when combined with exercise')}</small>`);

        el.html(lines.join('<br>')).removeClass('text-muted');
    })
    .catch(() => {
        $('#progress-block').text('Failed to calculate weight progress').addClass('text-muted');
    });
}

function refreshGallbladderHealth() {
    if (window.coverage) window.coverage.logFunction('refreshGallbladderHealth', 'dashboard.js');
    // Call the health.js function
    if (typeof window.healthRefreshGallbladderHealth === 'function') {
        window.healthRefreshGallbladderHealth();
    }
}

function loadWeightHistory() {
    if (window.coverage) window.coverage.logFunction('loadWeightHistory', 'dashboard.js');
    // Call the data.js function
    if (typeof window.dataLoadWeightHistory === 'function') {
        window.dataLoadWeightHistory();
    }
}

function formatDate(dateString) {
    if (window.coverage) window.coverage.logFunction('formatDate', 'dashboard.js');
    // Call the data.js function
    if (typeof window.dataFormatDate === 'function') {
        return window.dataFormatDate(dateString);
    }
    return dateString;
}

function editWeight(id, weight, date) {
    if (window.coverage) window.coverage.logFunction('editWeight', 'dashboard.js');
    // Call the data.js function
    if (typeof window.dataEditWeight === 'function') {
        window.dataEditWeight(id, weight, date);
    }
}

function deleteWeight(id) {
    if (window.coverage) window.coverage.logFunction('deleteWeight', 'dashboard.js');
    // Call the data.js function
    if (typeof window.dataDeleteWeight === 'function') {
        window.dataDeleteWeight(id);
    }
}


function loadSettings(callback) {
    if (window.coverage) window.coverage.logFunction('loadSettings', 'dashboard.js');
    debugLog('🔧 loadSettings() called in dashboard.js');
    debugLog('🔍 globalDashboardData:', window.globalDashboardData);

    // Check if we have global data first
    if (window.globalDashboardData && window.globalDashboardData.settings) {
        debugLog('📊 Using global data for settings');
        const s = window.globalDashboardData.settings;
        debugLog('🔧 Settings data:', s);

        $('#weightUnit').val(s.weight_unit || 'kg');
        $('#heightUnit').val(s.height_unit || 'cm');
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
        $('#timezone').val(s.timezone || 'Europe/London');
        updateDateExample();
        updateThemeOptions(s.theme || 'glassmorphism');
        toggleEmailSchedule();

        // Apply language without triggering save
        const lang = s.language || 'en';
        if (lang !== 'en' && typeof window.settingsSwitchLanguage === 'function') {
            window.settingsSwitchLanguage(lang);
        }

        // Call callback after settings are loaded and language is applied
        if (typeof callback === 'function') {
            callback();
        }
        return;
    }

    // Fallback to API call if global data not available
    debugLog('🌐 Making API call for settings (global data not available)');
    const params = new URLSearchParams();
    params.append('action', 'get_settings');

    fetch('router.php?controller=profile', {
        method: 'POST',
        body: params,
        credentials: 'same-origin'
    })
    .then(response => response.text())
    .then(responseText => {
        const data = parseJson(responseText);
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
            $('#timezone').val(s.timezone || 'Europe/London');
            updateDateExample();
            updateThemeOptions(s.theme || 'glassmorphism');
            toggleEmailSchedule();

            // Apply language without triggering save
            const lang = s.language || 'en';
            if (lang !== 'en' && typeof window.settingsSwitchLanguage === 'function') {
                window.settingsSwitchLanguage(lang);
            }

            // Call callback after settings are loaded and language is applied
            if (typeof callback === 'function') {
                callback();
            }
        }
    })
    .catch(error => {
        console.error('Settings load error:', error);
        // Still call callback even on error
        if (typeof callback === 'function') {
            callback();
        }
    });
}

function saveSettings() {
    if (window.coverage) window.coverage.logFunction('saveSettings', 'dashboard.js');
    // Call the settings.js function
    if (typeof window.settingsSaveSettings === 'function') {
        window.settingsSaveSettings();
    }
}

function toggleEmailSchedule() {
    if (window.coverage) window.coverage.logFunction('toggleEmailSchedule', 'dashboard.js');
    const emailNotificationsChecked = $('#emailNotifications').is(':checked');
    if (emailNotificationsChecked) {
        $('#emailSchedule').show();
    } else {
        $('#emailSchedule').hide();
    }
}

function resetSettings() {
    if (window.coverage) window.coverage.logFunction('resetSettings', 'dashboard.js');
    // Call the settings.js function
    if (typeof window.settingsResetSettings === 'function') {
        window.settingsResetSettings();
    }
}

function updateDateExample() {
    if (window.coverage) window.coverage.logFunction('updateDateExample', 'dashboard.js');
    // Call the settings.js function
    if (typeof window.settingsUpdateDateExample === 'function') {
        window.settingsUpdateDateExample();
    }
}

function initTabNavigation() {
    if (window.coverage) window.coverage.logFunction('initTabNavigation', 'dashboard.js');
    // Handle tab changes - update URL hash
    $('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
        const target = $(e.target).attr('href');
        const tabName = target.substring(1); // Remove the # symbol
        window.location.hash = 'tab=' + tabName;

        // Load settings when settings tab is shown
        if (tabName === 'settings') {
            debugLog('🔧 Settings tab shown, loading settings...');
            debugLog('🔍 loadSettings function type:', typeof loadSettings);
            debugLog('🔍 window.settingsLoadSettings type:', typeof window.settingsLoadSettings);
            if (typeof loadSettings === 'function') {
                loadSettings();
            } else if (typeof window.settingsLoadSettings === 'function') {
                window.settingsLoadSettings();
            } else {
                console.error('❌ No loadSettings function available');
            }
        }
    });

    // Check URL hash on page load and activate correct tab
    const urlHash = window.location.hash;
    if (urlHash && urlHash.startsWith('#tab=')) {
        const tabName = urlHash.substring(5); // Remove #tab=
        const tabSelector = '#' + tabName + '-tab';
        const tabExists = $(tabSelector).length > 0;
        
        if (tabExists) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            // Deactivate current active tab
            $('.nav-link.active').removeClass('active');
            $('.tab-pane.active').removeClass('active show');
            
            // Activate the target tab
            $(tabSelector).addClass('active');
            $('#' + tabName).addClass('active show');

            // Load settings if settings tab is activated on page load
            if (tabName === 'settings') {
                loadSettings();
            }
        }
    }

    // Handle browser back/forward buttons
    $(window).on('hashchange', function() {
        const urlHash = window.location.hash;
        if (urlHash && urlHash.startsWith('#tab=')) {
            const tabName = urlHash.substring(5);
            const tabSelector = '#' + tabName + '-tab';
            
            if ($(tabSelector).length > 0) {
                $(tabSelector).tab('show');
            }
        }
    });
}

// Weight Chart Variables
let weightChart = null;
let chartData = [];
let currentPeriodOffset = 0; // 0 = current period, 1 = previous period, etc.

// Function to get theme-appropriate chart colors
function getChartTextColor() {
    if (window.coverage) window.coverage.logFunction('getChartTextColor', 'dashboard.js');
    // Check current theme by looking at the theme CSS link
    const themeLink = document.getElementById('theme-css');
    if (themeLink && themeLink.href) {
        if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
        if (themeLink.href.includes('minimalism') || themeLink.href.includes('material')) {
            return '#212529'; // Dark text for light themes
        }
        if (themeLink.href.includes('skeuomorphism')) {
            return '#8b4513'; // Brown text for skeuomorphism theme
        }
    }
    return '#ffffff'; // White text for dark themes
}

// Function to update chart colors when theme changes
function updateChartThemeColors() {
    if (window.coverage) window.coverage.logFunction('updateChartThemeColors', 'dashboard.js');
    if (typeof weightChart !== 'undefined' && weightChart) {
        // Update axis colors
        if (weightChart.options.scales) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            if (weightChart.options.scales.x && weightChart.options.scales.x.ticks) {
                weightChart.options.scales.x.ticks.color = getChartTextColor();
            }
            if (weightChart.options.scales.y && weightChart.options.scales.y.ticks) {
                weightChart.options.scales.y.ticks.color = getChartTextColor();
            }
            if (weightChart.options.scales.x && weightChart.options.scales.x.grid) {
                weightChart.options.scales.x.grid.color = getChartGridColor();
            }
            if (weightChart.options.scales.y && weightChart.options.scales.y.grid) {
                if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
                weightChart.options.scales.y.grid.color = getChartGridColor();
            }
        }

        // Update axis title colors
        if (weightChart.options.scales && weightChart.options.scales.y && weightChart.options.scales.y.title) {
            weightChart.options.scales.y.title.color = getChartTextColor();
        }

        // Update dataset colors
        if (weightChart.data && weightChart.data.datasets) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            weightChart.data.datasets.forEach(dataset => {
                if (dataset.borderColor) dataset.borderColor = getChartLineColor();
                if (dataset.pointBackgroundColor) dataset.pointBackgroundColor = getChartLineColor();
                if (dataset.pointBorderColor) dataset.pointBorderColor = getChartTextColor();
            });
        }

        // Update the chart
        weightChart.update();
    }
}

// Make function globally available
window.updateChartThemeColors = updateChartThemeColors;

function getChartGridColor() {
    if (window.coverage) window.coverage.logFunction('getChartGridColor', 'dashboard.js');
    // Check current theme by looking at the theme CSS link
    const themeLink = document.getElementById('theme-css');
    if (themeLink && themeLink.href) {
        if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
        if (themeLink.href.includes('minimalism') || themeLink.href.includes('material')) {
            return 'rgba(33, 37, 41, 0.1)'; // Dark grid for light themes
        }
        if (themeLink.href.includes('skeuomorphism')) {
            return 'rgba(139, 69, 19, 0.1)'; // Brown grid for skeuomorphism theme
        }
    }
    return 'rgba(255, 255, 255, 0.1)'; // White grid for dark themes
}

function getChartLineColor() {
    if (window.coverage) window.coverage.logFunction('getChartLineColor', 'dashboard.js');
    // Check current theme by looking at the theme CSS link
    const themeLink = document.getElementById('theme-css');
    if (themeLink && themeLink.href) {
        if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
        if (themeLink.href.includes('skeuomorphism')) {
            return '#8b4513'; // Brown lines for skeuomorphism theme
        }
        if (themeLink.href.includes('neumorphism')) {
            return '#bb86fc'; // Purple lines for neumorphism theme
        }
        if (themeLink.href.includes('material')) {
            return '#4caf50'; // Green lines for material design theme
        }
        if (themeLink.href.includes('minimalism')) {
            return '#495057'; // Dark gray lines for minimalism theme
        }
        if (themeLink.href.includes('retro')) {
            return '#33bb55'; // Muted green lines for retro theme
        }
    }
    return '#64a6d8'; // Default blue for other themes
}

function getChartStyling() {
    if (window.coverage) window.coverage.logFunction('getChartStyling', 'dashboard.js');
    // Check current theme by looking at the theme CSS link
    const themeLink = document.getElementById('theme-css');
    if (themeLink && themeLink.href) {
        if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
        if (themeLink.href.includes('minimalism')) {
            return {
                borderWidth: 1,
                pointRadius: 2,
                pointHoverRadius: 4,
                tension: 0,
                fill: false,
                pointBorderWidth: 1
            };
        }
    }
    // Default styling for other themes
    return {
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: true,
        pointBorderWidth: 2
    };
}

function resetToLineChart() {
    if (window.coverage) window.coverage.logFunction('resetToLineChart', 'dashboard.js');
    // Reset chart type and configuration for line charts
    weightChart.config.type = 'line';

    // Reset scale configuration
    weightChart.options.scales.y.beginAtZero = false;

    // Reset tooltip to default
    if (weightChart.options.plugins.tooltip) {
        delete weightChart.options.plugins.tooltip;
    }

    // Hide legend for single-dataset charts
    weightChart.options.plugins.legend.display = false;
    
    // Ensure single dataset structure for simple line charts
    if (!weightChart.data.datasets[0] || weightChart.data.datasets.length > 1) {
        if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
        const styling = getChartStyling();
        weightChart.data.datasets = [{
            label: 'Weight (kg)',
            data: [],
            borderColor: getChartLineColor(),
            backgroundColor: styling.fill ? 'rgba(100, 166, 216, 0.1)' : 'transparent',
            borderWidth: styling.borderWidth,
            fill: styling.fill,
            tension: styling.tension,
            pointBackgroundColor: getChartLineColor(),
            pointBorderColor: getChartTextColor(),
            pointBorderWidth: styling.pointBorderWidth,
            pointRadius: styling.pointRadius,
            pointHoverRadius: styling.pointHoverRadius
        }];
    } else {
        // Ensure existing dataset has consistent colors
        const dataset = weightChart.data.datasets[0];
        dataset.borderColor = getChartLineColor();
        dataset.backgroundColor = 'rgba(100, 166, 216, 0.1)';
        dataset.pointBackgroundColor = getChartLineColor();
        dataset.pointBorderColor = getChartTextColor();
        dataset.pointBorderWidth = 2;
        dataset.pointRadius = 5;
        dataset.pointHoverRadius = 8;
    }
}

function resetToBarChart(yearlyData) {
    if (window.coverage) window.coverage.logFunction('resetToBarChart', 'dashboard.js');
    // Reset chart type and configuration for bar charts
    weightChart.config.type = 'bar';

    // Set bar chart scale configuration
    weightChart.options.scales.y.beginAtZero = true;

    // Hide legend for single-dataset bar charts
    weightChart.options.plugins.legend.display = false;
    
    // Set custom tooltip for bar charts
    weightChart.options.plugins.tooltip = {
        callbacks: {
            afterLabel: function(context) {
                if (window.coverage) window.coverage.logFunction('afterLabel', 'dashboard.js');
                const monthData = yearlyData[context.dataIndex];
                const lines = [];
                if (monthData.averageWeight > 0) {
                    if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
                    const displayAverage = convertFromKg(monthData.averageWeight);
                    const unit = getWeightUnitLabel();
                    lines.push(`Average weight: ${displayAverage} ${unit}`);
                }
                lines.push(`Entries logged: ${monthData.entryCount}`);
                return lines;
            }
        }
    };
    
    // Ensure single dataset structure for bar charts
    weightChart.data.datasets = [{
        label: 'Weight Loss (kg)',
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
    }];
}

function initWeightChart() {
    if (window.coverage) window.coverage.logFunction('initWeightChart', 'dashboard.js');
    const ctx = document.getElementById('weightChart');
    if (!ctx) return;
    
    // Initialize empty chart
    weightChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Weight (kg)',
                data: [],
                borderColor: getChartLineColor(),
                backgroundColor: 'rgba(100, 166, 216, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: getChartLineColor(),
                pointBorderColor: getChartTextColor(),
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: getChartTextColor(),
                        font: {
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: getChartTextColor(),
                        font: {
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                    },
                    grid: {
                        color: getChartGridColor()
                    }
                },
                y: {
                    ticks: {
                        color: getChartTextColor(),
                        font: {
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                    },
                    grid: {
                        color: getChartGridColor()
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    
    // Load initial data (90 days by default)
    updateWeightChart('90days');
}

function updateWeightChart(period) {
    if (window.coverage) window.coverage.logFunction('updateWeightChart', 'dashboard.js');
    $('#chart-status').text('Loading chart data...').show();

    // Check if we have global data first
    if (window.globalDashboardData && window.globalDashboardData.weight_history) {
        debugLog('📊 Using global data for weight chart');
        const history = window.globalDashboardData.weight_history;

        if (!history || history.length === 0) {
            $('#chart-status').text('No weight data available for chart').show();
            $('#chart-navigation').hide();
            weightChart.data.labels = [];
            weightChart.data.datasets[0].data = [];
            weightChart.update();
            return;
        }

        // Sort all data by date (newest first for period calculation)
        const sortedData = history.sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));

        // Process chart data (same logic as API response)
        let filteredData = [];
        let periodInfo = '';

        if (period === 'weekly') {
            $('#chart-navigation').hide();
            updateWeeklyChart(sortedData);
            return;
        } else if (period === 'yearly') {
            $('#chart-navigation').hide();
            updateYearlyChart(sortedData);
            return;
        } else if (period === 'all') {
            filteredData = sortedData;
            $('#chart-navigation').hide();
            periodInfo = 'All Time';
        } else if (period === 'monthly') {
            $('#chart-navigation').hide();
            updateMonthlyChart(sortedData);
            return;
        } else {
            $('#chart-navigation').show();

            const daysInPeriod = period === '30days' ? 30 : 90;
            const now = new Date();

            const periodStart = new Date(now.getTime() - ((currentPeriodOffset + 1) * daysInPeriod * 24 * 60 * 60 * 1000));
            const periodEnd = new Date(now.getTime() - (currentPeriodOffset * daysInPeriod * 24 * 60 * 60 * 1000));

            filteredData = sortedData.filter(entry => {
                const entryDate = new Date(entry.entry_date);
                return entryDate >= periodStart && entryDate < periodEnd;
            });

            const startStr = periodStart.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
            const endStr = periodEnd.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });

            if (currentPeriodOffset === 0) {
                periodInfo = `Current ${daysInPeriod} days (${startStr} - ${endStr})`;
            } else {
                periodInfo = `${currentPeriodOffset * daysInPeriod}-${(currentPeriodOffset + 1) * daysInPeriod} days ago (${startStr} - ${endStr})`;
            }

            $('#chart-next').prop('disabled', currentPeriodOffset === 0);

            const prevPeriodStart = new Date(now.getTime() - ((currentPeriodOffset + 2) * daysInPeriod * 24 * 60 * 60 * 1000));
            const prevPeriodEnd = new Date(now.getTime() - ((currentPeriodOffset + 1) * daysInPeriod * 24 * 60 * 60 * 1000));
            const hasPreviousData = sortedData.some(entry => {
                const entryDate = new Date(entry.entry_date);
                return entryDate >= prevPeriodStart && entryDate < prevPeriodEnd;
            });
            $('#chart-prev').prop('disabled', !hasPreviousData);
        }

        $('#chart-period-info').text(periodInfo);

        if (filteredData.length === 0) {
            $('#chart-status').text(`No weight data available for ${periodInfo.toLowerCase()}`).show();
            weightChart.data.labels = [];
            weightChart.data.datasets[0].data = [];
            weightChart.update();
            return;
        }

        $('#chart-status').hide();
        const unit = getWeightUnitLabel();
        const reversedData = filteredData.reverse();
        const labels = reversedData.map(entry => formatDate(entry.entry_date));
        const dataPoints = reversedData.map(entry => convertFromKg(parseFloat(entry.weight_kg)));

        weightChart.data.labels = labels;
        weightChart.data.datasets[0].data = dataPoints;
        weightChart.data.datasets[0].label = `Weight (${unit})`;
        weightChart.options.scales.y.title.text = `Weight (${unit})`;
        weightChart.update();
        return;
    }

    // Fallback: Make API call if global data not available
    debugLog('🌐 Making API call for weight chart (global data not available)');
    postRequest('router.php?controller=profile', { action: 'get_weight_history' })
    .then(resp => {
        const data = parseJson(resp);

        if (!data.success || !data.history || data.history.length === 0) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            $('#chart-status').text('No weight data available for chart').show();
            $('#chart-navigation').hide();
            weightChart.data.labels = [];
            weightChart.data.datasets[0].data = [];
            weightChart.update();
            return;
        }
        
        // Sort all data by date (newest first for period calculation)
        const sortedData = data.history.sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
        
        let filteredData = [];
        let periodInfo = '';
        
        if (period === 'weekly') {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            // Weekly view - show bar chart for weeks of current year
            $('#chart-navigation').hide();
            updateWeeklyChart(sortedData);
            return; // Early return since weekly chart has different logic
        } else if (period === 'yearly') {
            // Yearly view - show bar chart for each month of current year
            $('#chart-navigation').hide();
            updateYearlyChart(sortedData);
            return; // Early return since yearly chart has different logic
        } else if (period === 'all') {
            // All time - no navigation needed
            filteredData = sortedData;
            $('#chart-navigation').hide();
            periodInfo = 'All Time';
        } else if (period === 'monthly') {
            // Monthly view - show last 6 months as separate lines
            $('#chart-navigation').hide();
            updateMonthlyChart(sortedData);
            return; // Early return since monthly chart has different logic
        } else {
            // Show navigation for 30days and 90days
            $('#chart-navigation').show();
            
            const daysInPeriod = period === '30days' ? 30 : 90;
            const now = new Date();
            
            // Calculate the start and end dates for the current period offset
            const periodStart = new Date(now.getTime() - ((currentPeriodOffset + 1) * daysInPeriod * 24 * 60 * 60 * 1000));
            const periodEnd = new Date(now.getTime() - (currentPeriodOffset * daysInPeriod * 24 * 60 * 60 * 1000));
            
            // Filter data for this period
            filteredData = sortedData.filter(entry => {
                const entryDate = new Date(entry.entry_date);
                return entryDate >= periodStart && entryDate < periodEnd;
            });
            
            // Generate period info text
            const startStr = periodStart.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
            const endStr = periodEnd.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
            
            if (currentPeriodOffset === 0) {
                if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
                periodInfo = `Current ${daysInPeriod} days (${startStr} - ${endStr})`;
            } else {
                periodInfo = `${currentPeriodOffset * daysInPeriod}-${(currentPeriodOffset + 1) * daysInPeriod} days ago (${startStr} - ${endStr})`;
            }
            
            // Update navigation buttons
            $('#chart-next').prop('disabled', currentPeriodOffset === 0);
            
            // Check if there's data for previous periods
            const prevPeriodStart = new Date(now.getTime() - ((currentPeriodOffset + 2) * daysInPeriod * 24 * 60 * 60 * 1000));
            const prevPeriodEnd = new Date(now.getTime() - ((currentPeriodOffset + 1) * daysInPeriod * 24 * 60 * 60 * 1000));
            const hasPreviousData = sortedData.some(entry => {
                const entryDate = new Date(entry.entry_date);
                return entryDate >= prevPeriodStart && entryDate < prevPeriodEnd;
            });
            $('#chart-prev').prop('disabled', !hasPreviousData);
        }
        
        $('#chart-period-info').text(periodInfo);
        
        if (filteredData.length === 0) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            $('#chart-status').text(`No weight data available for ${periodInfo.toLowerCase()}`).show();
            weightChart.data.labels = [];
            weightChart.data.datasets[0].data = [];
            weightChart.update();
            return;
        }
        
        // Sort filtered data by date (oldest first for chart display)
        filteredData.sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date));
        
        // Prepare chart data
        const labels = filteredData.map(entry => {
            const date = new Date(entry.entry_date);
            return date.toLocaleDateString('en-GB', { 
                day: '2-digit', 
                month: '2-digit',
                year: period === 'all' ? '2-digit' : undefined
            });
        });
        
        const weights = filteredData.map(entry => parseFloat(convertFromKg(entry.weight_kg)));
        
        // Reset to single-line chart configuration
        resetToLineChart();
        
        // Update chart
        weightChart.data.labels = labels;
        weightChart.data.datasets[0].data = weights;

        // Update Y-axis title with current unit
        const unit = getWeightUnitLabel();
        if (weightChart.options.scales.y.title) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            weightChart.options.scales.y.title.text = `Weight (${unit})`;
        } else {
            weightChart.options.scales.y.title = {
                display: true,
                text: `Weight (${unit})`,
                color: getChartTextColor(),
                font: {
                    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }
            };
        }

        weightChart.update();
        
        $('#chart-status').hide();
        
        // Update achievement cards with current period data
        updateAchievementCards(filteredData);
        
    })
    .catch(() => {
        $('#chart-status').text('Failed to load chart data').show();
    });
}

function updateMonthlyChart(sortedData) {
    if (window.coverage) window.coverage.logFunction('updateMonthlyChart', 'dashboard.js');
    $('#chart-status').text('Processing monthly data...').show();
    
    // Define colors for each month (6 distinct colors)
    const monthColors = [
        getChartLineColor(), // Primary theme color
        '#7bc96f', // Green  
        '#f39c12', // Orange
        '#e74c3c', // Red
        '#9b59b6', // Purple
        '#1abc9c'  // Teal
    ];
    
    // Get the last 6 months from current date
    const now = new Date();
    const months = [];
    
    for (let i = 0; i < 6; i++) {
        if (window.coverage) window.coverage.logFunction('for', 'dashboard.js');
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        
        months.push({
            start: monthDate,
            end: monthEnd,
            name: monthDate.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' }),
            fullName: monthDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
            data: [],
            color: monthColors[i]
        });
    }
    
    // Group data by month
    sortedData.forEach(entry => {
        const entryDate = new Date(entry.entry_date);
        
        months.forEach(month => {
            if (entryDate >= month.start && entryDate <= month.end) {
                if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
                month.data.push({
                    date: entryDate,
                    weight: parseFloat(convertFromKg(entry.weight_kg)),
                    dayOfMonth: entryDate.getDate()
                });
            }
        });
    });
    
    // Filter out months with no data and sort data within each month
    const monthsWithData = months.filter(month => month.data.length > 0);
    monthsWithData.forEach(month => {
        month.data.sort((a, b) => a.date - b.date);
    });
    
    if (monthsWithData.length === 0) {
        if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
        $('#chart-status').text('No weight data available for monthly view').show();
        weightChart.data.labels = [];
        weightChart.data.datasets = [];
        weightChart.update();
        return;
    }
    
    // Create labels (days of month 1-31)
    const labels = [];
    for (let day = 1; day <= 31; day++) {
        if (window.coverage) window.coverage.logFunction('for', 'dashboard.js');
        labels.push(day.toString());
    }
    
    // Create datasets for each month
    const datasets = monthsWithData.map(month => ({
        label: month.fullName,
        data: labels.map(day => {
            const dayNum = parseInt(day);
            const entry = month.data.find(d => d.dayOfMonth === dayNum);
            return entry ? entry.weight : null;
        }),
        borderColor: month.color,
        backgroundColor: month.color + '20', // Add transparency
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: month.color,
        pointBorderColor: getChartTextColor(),
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
        spanGaps: true // Connect points even with gaps
    }));
    
    // Reset to multi-line chart configuration
    resetToLineChart();

    // Show legend for monthly chart (multiple datasets)
    weightChart.options.plugins.legend.display = true;

    // Update chart with multiple datasets
    weightChart.data.labels = labels;
    weightChart.data.datasets = datasets;

    // Update Y-axis title with current unit
    const unit = getWeightUnitLabel();
    if (weightChart.options.scales.y.title) {
        if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
        weightChart.options.scales.y.title.text = `Weight (${unit})`;
    } else {
        weightChart.options.scales.y.title = {
            display: true,
            text: `Weight (${unit})`,
            color: getChartTextColor(),
            font: {
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }
        };
    }

    weightChart.update();
    
    $('#chart-status').hide();

    // Update achievement cards for monthly view
    // DISABLED: Replaced by Phase 2 Goals Achieved enhancements
    // updateMonthlyAchievementCards(monthsWithData);
}

function updateMonthlyAchievementCards(monthsWithData) {
    if (window.coverage) window.coverage.logFunction('updateMonthlyAchievementCards', 'dashboard.js');
    // Find the best performing month (most weight lost)
    let bestMonth = null;
    let bestLoss = 0;
    let totalLoss = 0;
    let totalEntries = 0;
    
    monthsWithData.forEach(month => {
        if (month.data.length >= 2) {
            const monthStart = month.data[0].weight;
            const monthEnd = month.data[month.data.length - 1].weight;
            const monthLoss = monthStart - monthEnd;
            
            if (monthLoss > bestLoss) {
                if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
                bestLoss = monthLoss;
                bestMonth = month;
            }
            
            totalLoss += monthLoss;
        }
        totalEntries += month.data.length;
    });
    
    // Update Total Progress card
    const unit = getWeightUnitLabel();
    const displayTotalLoss = convertFromKg(Math.abs(totalLoss));
    const progressHtml = totalLoss > 0
        ? `<strong class="text-success">${displayTotalLoss} ${unit} lost</strong><br><small>Over ${monthsWithData.length} months (${totalEntries} entries)</small>`
        : `<strong class="text-info">${displayTotalLoss} ${unit} gained</strong><br><small>Over ${monthsWithData.length} months (${totalEntries} entries)</small>`;
    $('#total-progress').html(progressHtml);
    
    // Update Goals Achieved with best month
    if (bestMonth && bestLoss > 0) {
        if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
        const unit = getWeightUnitLabel();
        const displayBestLoss = convertFromKg(bestLoss);
        const goalHtml = `<strong class="text-success" style="color: ${bestMonth.color} !important;">🏆 ${bestMonth.name}</strong><br><small>Best month: ${displayBestLoss} ${unit} lost</small>`;
        $('#goals-achieved').html(goalHtml);
    } else {
        $('#goals-achieved').html('<span class="text-muted">🎯 No clear winner</span><br><small>Need more data for comparison</small>');
    }
    
    // Update Streak Counter with most consistent month
    let mostConsistentMonth = null;
    let highestEntryCount = 0;
    
    monthsWithData.forEach(month => {
        if (month.data.length > highestEntryCount) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            highestEntryCount = month.data.length;
            mostConsistentMonth = month;
        }
    });
    
    // DISABLED: Phase 3 Streak Counter now uses dedicated streak data
    // if (mostConsistentMonth) {
    //     const streakHtml = `<strong class="text-success" style="color: ${mostConsistentMonth.color} !important;">🔥 ${mostConsistentMonth.name}</strong><br><small>Most consistent: ${highestEntryCount} entries</small>`;
    //     $('#streak-counter').html(streakHtml);
    // } else {
    //     $('#streak-counter').html('<span class="text-muted">No data available</span>');
    // }
}

function updateWeeklyChart(sortedData) {
    if (window.coverage) window.coverage.logFunction('updateWeeklyChart', 'dashboard.js');
    $('#chart-status').text('Processing weekly data...').show();
    
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Calculate week numbers for the current year (1-52/53)
    function getWeekNumber(date) {
        if (window.coverage) window.coverage.logFunction('getWeekNumber', 'dashboard.js');
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
        return Math.ceil((((d - yearStart) / 86400000) + 1)/7);
    }
    
    // Initialize data for each week of the current year
    const weeklyData = [];
    const maxWeeks = 53; // Maximum possible weeks in a year
    
    for (let weekNumber = 1; weekNumber <= maxWeeks; weekNumber++) {
        if (window.coverage) window.coverage.logFunction('for', 'dashboard.js');
        // Calculate approximate start/end dates for this week
        const yearStart = new Date(currentYear, 0, 1);
        const daysToFirstMonday = (8 - yearStart.getDay()) % 7;
        const firstMondayOfYear = new Date(currentYear, 0, 1 + daysToFirstMonday);
        const weekStart = new Date(firstMondayOfYear.getTime() + (weekNumber - 1) * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
        
        // Only include weeks that are actually in the current year
        if (weekStart.getFullYear() !== currentYear) continue;
        
        // Filter data for this week
        const weekData = sortedData.filter(entry => {
            const entryDate = new Date(entry.entry_date);
            const entryWeek = getWeekNumber(entryDate);
            return entryDate.getFullYear() === currentYear && entryWeek === weekNumber;
        });
        
        let weekLoss = 0;
        let weekAverage = 0;
        
        if (weekData.length > 0) {
            // Calculate average weight for the week
            const totalWeight = weekData.reduce((sum, entry) => sum + parseFloat(entry.weight_kg), 0);
            weekAverage = totalWeight / weekData.length;
            
            // Calculate weight loss for the week (start vs end)
            if (weekData.length >= 2) {
                if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
                const sortedWeekData = weekData.sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date));
                const startWeight = parseFloat(sortedWeekData[0].weight_kg);
                const endWeight = parseFloat(sortedWeekData[sortedWeekData.length - 1].weight_kg);
                weekLoss = startWeight - endWeight;
            } else if (weekData.length === 1) {
                // For single entries, compare with previous week's last entry
                const prevWeekData = sortedData.filter(entry => {
                    const entryDate = new Date(entry.entry_date);
                    const entryWeek = getWeekNumber(entryDate);
                    return entryDate.getFullYear() === currentYear && entryWeek === weekNumber - 1;
                });
                
                if (prevWeekData.length > 0) {
                    if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
                    const prevWeekSorted = prevWeekData.sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date));
                    const prevWeight = parseFloat(prevWeekSorted[prevWeekSorted.length - 1].weight_kg);
                    const currentWeight = parseFloat(weekData[0].weight_kg);
                    weekLoss = prevWeight - currentWeight;
                }
            }
        }
        
        weeklyData.push({
            week: weekNumber,
            weekLabel: `W${weekNumber}`,
            weekStart: weekStart,
            weekEnd: weekEnd,
            averageWeight: weekAverage,
            weightLoss: weekLoss,
            entryCount: weekData.length,
            hasData: weekData.length > 0
        });
    }
    
    // Show all 52 weeks, but only up to current week
    const now = new Date();
    const currentWeekNumber = getWeekNumber(now);
    
    // Filter to show weeks up to current week, keep all 52 for full year view
    const weeksToShow = weeklyData.filter(week => 
        week.week <= Math.min(52, currentWeekNumber + 2) // Show a couple weeks ahead for context
    );
    
    if (weeksToShow.length === 0) {
        if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
        $('#chart-status').text(`No week data available for ${currentYear}`).show();
        weightChart.data.labels = [];
        weightChart.data.datasets = [];
        weightChart.update();
        return;
    }
    
    // Create labels and data for chart - include ALL weeks (with and without data)
    const labels = weeksToShow.map(week => week.weekLabel);
    const weeklyLosses = weeksToShow.map(week => week.weightLoss); // This will be 0 for weeks without data
    
    // Color code bars based on weekly performance
    const barColors = weeksToShow.map((week, index) => {
        const loss = weeklyLosses[index];
        
        // Gray for weeks with no data
        if (!week.hasData) return getChartGridColor();
        
        // Color coding for weeks with data
        if (loss > 1) return '#7bc96f'; // Green for excellent loss (>1kg/week)
        else if (loss > 0.5) return getChartLineColor(); // Primary theme color for good loss (0.5-1kg)
        else if (loss > 0) return '#1abc9c'; // Teal for moderate loss (0-0.5kg)
        else if (loss > -0.5) return '#f39c12'; // Orange for small gain
        else return '#e74c3c'; // Red for significant gain
    });
    
    // Reset to bar chart configuration  
    resetToBarChart(weeksToShow);
    
    // Update chart as a bar chart
    weightChart.data.labels = labels;
    weightChart.data.datasets = [{
        label: 'Weight Loss (kg)',
        data: weeklyLosses,
        backgroundColor: barColors,
        borderColor: barColors.map(color => color + 'CC'),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
    }];
    
    weightChart.update();
    
    $('#chart-status').hide();
    
    // Update achievement cards for weekly view (only use weeks with actual data)
    const weeksWithData = weeksToShow.filter(week => week.hasData);
    updateWeeklyAchievementCards(weeksWithData, currentYear);
}

function updateWeeklyAchievementCards(weeklyData, currentYear) {
    if (window.coverage) window.coverage.logFunction('updateWeeklyAchievementCards', 'dashboard.js');
    // Find the best week (most weight lost)
    let bestWeek = null;
    let bestLoss = 0;
    let totalLoss = 0;
    let totalEntries = 0;
    let weeksWithData = 0;
    
    weeklyData.forEach(week => {
        if (week.hasData) {
            weeksWithData++;
            totalEntries += week.entryCount;
            
            if (week.weightLoss > bestLoss) {
                if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
                bestLoss = week.weightLoss;
                bestWeek = week;
            }
            
            totalLoss += week.weightLoss;
        }
    });
    
    // DISABLED: Total Progress is managed by achievements.js updateAchievementCards()
    // // Update Total Progress card
    // const progressHtml = totalLoss > 0
    //     ? `<strong class="text-success">${totalLoss.toFixed(1)} kg lost</strong><br><small>Over ${weeksWithData} weeks in ${currentYear} (${totalEntries} entries)</small>`
    //     : `<strong class="text-info">${Math.abs(totalLoss).toFixed(1)} kg gained</strong><br><small>Over ${weeksWithData} weeks in ${currentYear} (${totalEntries} entries)</small>`;
    // $('#total-progress').html(progressHtml);
    
    // Update Goals Achieved with best week
    // DISABLED: Replaced by Phase 2 Goals Achieved enhancements
    /*
    if (bestWeek && bestLoss > 0) {
        if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
        const weekStartStr = bestWeek.weekStart.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
        const goalHtml = `<strong class="text-success">🏆 ${bestWeek.weekLabel}</strong><br><small>Best week: ${bestLoss.toFixed(1)} kg (${weekStartStr})</small>`;
        $('#goals-achieved').html(goalHtml);
    } else {
        $('#goals-achieved').html('<span class="text-muted">🎯 No standout week</span><br><small>Need more weekly data</small>');
    }
    */
    
    // Update Streak Counter with most active week
    let mostActiveWeek = null;
    let highestEntryCount = 0;
    
    weeklyData.forEach(week => {
        if (week.entryCount > highestEntryCount) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            highestEntryCount = week.entryCount;
            mostActiveWeek = week;
        }
    });
    
    // DISABLED: Phase 3 Streak Counter now uses dedicated streak data
    // if (mostActiveWeek && highestEntryCount > 0) {
    //     const streakHtml = `<strong class="text-success">🔥 ${mostActiveWeek.weekLabel}</strong><br><small>Most active: ${highestEntryCount} entries</small>`;
    //     $('#streak-counter').html(streakHtml);
    // } else {
    //     $('#streak-counter').html('<span class="text-muted">No weekly data</span>');
    // }
}

function updateYearlyChart(sortedData) {
    if (window.coverage) window.coverage.logFunction('updateYearlyChart', 'dashboard.js');
    $('#chart-status').text('Processing yearly data...').show();
    
    // Get current year
    const currentYear = new Date().getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Initialize data for each month of the current year
    const yearlyData = [];
    const monthlyLosses = [];
    const monthlyAverages = [];
    
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        if (window.coverage) window.coverage.logFunction('for', 'dashboard.js');
        const monthStart = new Date(currentYear, monthIndex, 1);
        const monthEnd = new Date(currentYear, monthIndex + 1, 0);
        
        // Filter data for this month
        const monthData = sortedData.filter(entry => {
            const entryDate = new Date(entry.entry_date);
            return entryDate >= monthStart && entryDate <= monthEnd;
        });
        
        let monthValue = 0;
        let monthLoss = 0;
        
        if (monthData.length > 0) {
            // Calculate average weight for the month
            const totalWeight = monthData.reduce((sum, entry) => sum + parseFloat(entry.weight_kg), 0);
            monthValue = totalWeight / monthData.length;
            
            // Calculate weight loss for the month (start vs end)
            if (monthData.length >= 2) {
                if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
                const sortedMonthData = monthData.sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date));
                const startWeight = parseFloat(sortedMonthData[0].weight_kg);
                const endWeight = parseFloat(sortedMonthData[sortedMonthData.length - 1].weight_kg);
                monthLoss = startWeight - endWeight;
            }
        }
        
        yearlyData.push({
            month: monthNames[monthIndex],
            fullMonth: monthStart.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }),
            averageWeight: monthValue,
            weightLoss: monthLoss,
            entryCount: monthData.length,
            hasData: monthData.length > 0
        });
        
        monthlyLosses.push(monthLoss);
        monthlyAverages.push(monthValue || null);
    }
    
    // Filter out months with no data for some calculations
    const monthsWithData = yearlyData.filter(month => month.hasData);
    
    if (monthsWithData.length === 0) {
        if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
        $('#chart-status').text(`No weight data available for ${currentYear}`).show();
        weightChart.data.labels = [];
        weightChart.data.datasets = [];
        weightChart.update();
        return;
    }
    
    // Create bar chart showing weight loss per month
    const barColors = monthlyLosses.map(loss => {
        if (loss > 2) return '#7bc96f'; // Green for good loss (>2kg)
        else if (loss > 0) return getChartLineColor(); // Primary theme color for moderate loss
        else if (loss < -1) return '#e74c3c'; // Red for significant gain
        else return '#f39c12'; // Orange for minimal change
    });
    
    // Reset to bar chart configuration
    resetToBarChart(yearlyData);
    
    // Update chart as a bar chart
    weightChart.data.labels = monthNames;
    weightChart.data.datasets = [{
        label: 'Weight Loss (kg)',
        data: monthlyLosses,
        backgroundColor: barColors,
        borderColor: barColors.map(color => color + 'CC'), // Add some transparency to border
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
    }];
    
    weightChart.update();
    
    $('#chart-status').hide();
    
    // Update achievement cards for yearly view
    updateYearlyAchievementCards(yearlyData, currentYear);
}

function updateYearlyAchievementCards(yearlyData, currentYear) {
    if (window.coverage) window.coverage.logFunction('updateYearlyAchievementCards', 'dashboard.js');
    // Find the best month (most weight lost)
    let bestMonth = null;
    let bestLoss = 0;
    let totalLoss = 0;
    let totalEntries = 0;
    let monthsWithData = 0;
    
    yearlyData.forEach(month => {
        if (month.hasData) {
            monthsWithData++;
            totalEntries += month.entryCount;
            
            if (month.weightLoss > bestLoss) {
                if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
                bestLoss = month.weightLoss;
                bestMonth = month;
            }
            
            totalLoss += month.weightLoss;
        }
    });
    
    // DISABLED: Total Progress is managed by achievements.js updateAchievementCards()
    // // Update Total Progress card
    // const progressHtml = totalLoss > 0
    //     ? `<strong class="text-success">${totalLoss.toFixed(1)} kg lost</strong><br><small>In ${currentYear} (${monthsWithData} months, ${totalEntries} entries)</small>`
    //     : `<strong class="text-info">${Math.abs(totalLoss).toFixed(1)} kg gained</strong><br><small>In ${currentYear} (${monthsWithData} months, ${totalEntries} entries)</small>`;
    // $('#total-progress').html(progressHtml);
    
    // Update Goals Achieved with best month
    // DISABLED: Replaced by Phase 2 Goals Achieved enhancements
    /*
    if (bestMonth && bestLoss > 0) {
        if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
        const goalHtml = `<strong class="text-success">🏆 ${bestMonth.month}</strong><br><small>Best month: ${bestLoss.toFixed(1)} kg lost</small>`;
        $('#goals-achieved').html(goalHtml);
    } else {
        $('#goals-achieved').html('<span class="text-muted">🎯 No standout month</span><br><small>Need more data for comparison</small>');
    }
    */
    
    // Update Streak Counter with most active month
    let mostActiveMonth = null;
    let highestEntryCount = 0;
    
    yearlyData.forEach(month => {
        if (month.entryCount > highestEntryCount) {
            if (window.coverage) window.coverage.logFunction('if', 'dashboard.js');
            highestEntryCount = month.entryCount;
            mostActiveMonth = month;
        }
    });
    
    // DISABLED: Phase 3 Streak Counter now uses dedicated streak data
    // if (mostActiveMonth && highestEntryCount > 0) {
    //     const streakHtml = `<strong class="text-success">🔥 ${mostActiveMonth.month}</strong><br><small>Most active: ${highestEntryCount} entries</small>`;
    //     $('#streak-counter').html(streakHtml);
    // } else {
    //     $('#streak-counter').html('<span class="text-muted">No data available</span>');
    // }
}

function updateAchievementCards(weightData) {
    if (window.coverage) window.coverage.logFunction('updateAchievementCards', 'dashboard.js');
    // Call the achievements.js function
    if (typeof window.achievementsUpdateAchievementCards === 'function') {
        window.achievementsUpdateAchievementCards(weightData);
    }
}

function refreshPersonalHealthBenefits() {
    if (window.coverage) window.coverage.logFunction('refreshPersonalHealthBenefits', 'dashboard.js');

    // Call the health.js function to update health benefit cards
    updateHealthBenefitCards();
}

// Weight unit functions
function initializeWeightUnit() {
    if (window.coverage) window.coverage.logFunction('initializeWeightUnit', 'dashboard.js');

    // Sync localStorage with settings system when settings are loaded
    setTimeout(() => {
        const settingsUnit = $('#weightUnit').val() || 'kg';
        setWeightUnit(settingsUnit);
        updateWeightUnitDisplay();

        // Note: refreshAllWeightDisplays() is called by testConsolidatedDashboardData callback
        // after global data is loaded, so no need to call it here during initialization
    }, 500); // Increased timeout to ensure settings are loaded

    // Weight unit change handler - just update display, don't save yet
    $('#weightUnit').on('change', function() {
        const newUnit = $(this).val();
        setWeightUnit(newUnit);
        updateWeightUnitDisplay();
        refreshAllWeightDisplays();
    });
}

function updateWeightUnitDisplay() {
    if (window.coverage) window.coverage.logFunction('updateWeightUnitDisplay', 'dashboard.js');

    const unit = getWeightUnitLabel();

    // Update weight history table header and form labels
    $('#weight-column-header').text(`Weight (${unit})`);
    $('#new-weight-label').text(`Weight (${unit})`);

    // Update placeholders based on unit
    if (getWeightUnit() === 'st') {
        $('#weightKg').attr('placeholder', 'e.g. 18.7');
        $('#goalWeight').attr('placeholder', 'e.g. 16.5');
        $('#newWeight').attr('placeholder', 'e.g. 18.7');
    } else if (getWeightUnit() === 'lbs') {
        $('#weightKg').attr('placeholder', 'e.g. 155.4');
        $('#goalWeight').attr('placeholder', 'e.g. 140.0');
        $('#newWeight').attr('placeholder', 'e.g. 155.4');
    } else { // kg
        $('#weightKg').attr('placeholder', 'e.g. 70.5');
        $('#goalWeight').attr('placeholder', 'e.g. 65.0');
        $('#newWeight').attr('placeholder', 'e.g. 70.5');
    }
}

function refreshAllWeightDisplays() {
    if (window.coverage) window.coverage.logFunction('refreshAllWeightDisplays', 'dashboard.js');

    // Refresh all weight-related displays
    refreshLatestWeight();
    refreshGoal();
    loadWeightHistory();

    // Refresh health calculations
    refreshBMI();
    refreshWeightProgress();
    refreshPersonalHealthBenefits();

    // Update chart if visible
    const activePeriod = $('.btn-group .active').attr('id')?.replace('chart-', '') || '90days';
    if (typeof updateWeightChart === 'function') {
        updateWeightChart(activePeriod);
    }
}

// Height unit functions
function initializeHeightUnit() {
    if (window.coverage) window.coverage.logFunction('initializeHeightUnit', 'dashboard.js');

    // Sync localStorage with settings system when settings are loaded
    setTimeout(() => {
        const settingsUnit = $('#heightUnit').val() || 'cm';
        setHeightUnit(settingsUnit);
        updateHeightUnitDisplay();
    }, 500);

    // Height unit change handler - just update display, don't save yet
    $('#heightUnit').on('change', function() {
        const newUnit = $(this).val();
        setHeightUnit(newUnit);
        updateHeightUnitDisplay();
    });
}

function updateHeightUnitDisplay() {
    if (window.coverage) window.coverage.logFunction('updateHeightUnitDisplay', 'dashboard.js');

    const unit = getHeightUnitLabel();

    // Update height form label
    $('#height-label').text(`Height (${unit})`);

    // Convert current value if there is one and this is a unit change (not initial load)
    const currentValue = $('#heightCm').val();
    const previousUnit = $('#heightCm').data('current-unit');

    if (currentValue && !isNaN(parseFloat(currentValue)) && previousUnit && previousUnit !== getHeightUnit()) {
        // Convert current value to cm first, then to new unit
        const heightInCm = convertToCm(currentValue, previousUnit);
        const convertedValue = convertFromCm(heightInCm);
        $('#heightCm').val(convertedValue);
    }

    // Always store current unit for next conversion
    $('#heightCm').data('current-unit', getHeightUnit());

    // Update placeholders based on unit
    if (getHeightUnit() === 'ft') {
        $('#heightCm').attr('placeholder', 'e.g. 5.83');
    } else if (getHeightUnit() === 'm') {
        $('#heightCm').attr('placeholder', 'e.g. 1.75');
    } else { // cm
        $('#heightCm').attr('placeholder', 'e.g. 175');
    }
}

// ==================== Quick Look Section (Phase 1) ====================

/**
 * Load and display Quick Look metrics
 * Called on dashboard initialization and after weight updates
 */
function loadQuickLookMetrics() {
    if (window.coverage) window.coverage.logFunction('loadQuickLookMetrics', 'dashboard.js');
    debugLog('🔍 loadQuickLookMetrics called');

    // Use global dashboard data if available, otherwise fallback to API call
    if (window.globalDashboardData && window.globalDashboardData.quick_look_metrics) {
        debugLog('📊 Using global data for quick look metrics');
        renderQuickLookMetrics(window.globalDashboardData.quick_look_metrics);
    } else {
        debugLog('🌐 Making API call for quick look metrics (global data not available)');

        // Fallback: individual API call
        postRequest('router.php?controller=profile', { action: 'get_quick_look_metrics' })
            .then(resp => {
                const data = parseJson(resp);
                if (data.success && data.metrics) {
                    renderQuickLookMetrics(data.metrics);
                }
            })
            .catch(err => {
                console.error('Failed to load quick look metrics:', err);
            });
    }

    // Always refresh encouragement quote (client-side randomization)
    displayRandomEncouragement();
}

/**
 * Render Quick Look metrics to DOM
 * @param {Object} metrics - Metrics object from API
 */
function renderQuickLookMetrics(metrics) {
    if (window.coverage) window.coverage.logFunction('renderQuickLookMetrics', 'dashboard.js');

    // Consistency Score
    displayConsistencyScore(metrics.consistency_score, metrics.logging_frequency, metrics.goal_progress);

    // Next Check-In
    displayNextCheckin(metrics.next_checkin_date, metrics.days_until_checkin, metrics.average_logging_interval);
}

/**
 * Display consistency score with visual feedback
 * @param {number} score - Score 0-100
 * @param {number} loggingFreq - Logs per week
 * @param {number} goalProgress - Goal completion percentage
 */
function displayConsistencyScore(score, loggingFreq, goalProgress) {
    if (window.coverage) window.coverage.logFunction('displayConsistencyScore', 'dashboard.js');

    const container = $('#consistency-score');

    if (!score && score !== 0) {
        // No data available
        container.html(
            `<div class="text-muted small" data-eng="Log more weights to see your score" data-spa="Registra más pesos para ver tu puntuación" data-fre="Enregistrez plus de poids pour voir votre score" data-ger="Protokollieren Sie mehr Gewichte, um Ihren Score zu sehen">Log more weights to see your score</div>`
        );
        return;
    }

    // Determine message based on score
    let message = '';
    let messageEng = '';
    let messageSpa = '';
    let messageFre = '';
    let messageGer = '';

    if (score >= 80) {
        messageEng = 'Excellent consistency!';
        messageSpa = '¡Excelente consistencia!';
        messageFre = 'Excellente cohérence!';
        messageGer = 'Ausgezeichnete Konsistenz!';
    } else if (score >= 60) {
        messageEng = 'Keep up the good work!';
        messageSpa = '¡Sigue así!';
        messageFre = 'Continuez comme ça!';
        messageGer = 'Weiter so!';
    } else {
        messageEng = 'Try to log more regularly';
        messageSpa = 'Intenta registrar con más regularidad';
        messageFre = 'Essayez de vous connecter plus régulièrement';
        messageGer = 'Versuchen Sie, regelmäßiger zu protokollieren';
    }

    const html = `
        <div class="consistency-score-label" data-eng="${Math.round(score)}% - ${messageEng}" data-spa="${Math.round(score)}% - ${messageSpa}" data-fre="${Math.round(score)}% - ${messageFre}" data-ger="${Math.round(score)}% - ${messageGer}">${Math.round(score)}% - ${messageEng}</div>
        <div class="text-muted small mt-2" data-eng="Based on logging frequency and goal progress" data-spa="Basado en la frecuencia de registro y progreso hacia la meta" data-fre="Basé sur la fréquence de journalisation et les progrès vers l'objectif" data-ger="Basierend auf Protokollierungshäufigkeit und Zielfortschritt">Based on logging frequency and goal progress</div>
    `;

    container.html(html);
}

/**
 * Display random motivational quote from translation data
 */
function displayRandomEncouragement() {
    if (window.coverage) window.coverage.logFunction('displayRandomEncouragement', 'dashboard.js');

    // Array of quote keys (translate on the fly based on current language)
    const quotes = [
        'Small steps, big results',
        'Progress, not perfection',
        'Every day is a new opportunity',
        "You're stronger than you think",
        'Consistency is key',
        'Believe in yourself',
        'One step at a time',
        'Your health is worth it',
        'Keep pushing forward',
        "You've got this",
        'Stay positive and work hard',
        'Embrace the journey',
        'Celebrate small victories',
        'Focus on progress, not setbacks',
        'Make every day count',
        'You are capable of amazing things',
        'Stay committed to your goals',
        'Transform your habits, transform your life',
        'Your future self will thank you',
        'Health is wealth',
        'Strive for progress, not perfection',
        'Believe you can and you\'re halfway there',
        'The only bad workout is the one that didn\'t happen',
        'Push yourself, because no one else is going to do it for you',
        'Success is the sum of small efforts repeated day in and day out'
    ];

    // Pick random quote index
    const index = Math.floor(Math.random() * quotes.length);
    const quoteEng = quotes[index];

    // Spanish translations
    const quotesSpa = [
        'Pequeños pasos, grandes resultados',
        'Progreso, no perfección',
        'Cada día es una nueva oportunidad',
        'Eres más fuerte de lo que crees',
        'La consistencia es clave',
        'Cree en ti mismo',
        'Un paso a la vez',
        'Tu salud vale la pena',
        'Sigue avanzando',
        'Tú puedes',
        'Mantente positivo y trabaja duro',
        'Abraza el viaje',
        'Celebra pequeñas victorias',
        'Concéntrate en el progreso, no en los contratiempos',
        'Haz que cada día cuente',
        'Eres capaz de cosas increíbles',
        'Mantente comprometido con tus objetivos',
        'Transforma tus hábitos, transforma tu vida',
        'Tu yo futuro te lo agradecerá',
        'La salud es riqueza',
        'Esfuérzate por el progreso, no por la perfección',
        'Cree que puedes y estarás a mitad de camino',
        'El único mal entrenamiento es el que no sucedió',
        'Empújate, porque nadie más lo hará por ti',
        'El éxito es la suma de pequeños esfuerzos repetidos día tras día'
    ];

    // French translations
    const quotesFre = [
        'Petits pas, grands résultats',
        'Progrès, pas perfection',
        'Chaque jour est une nouvelle opportunité',
        'Vous êtes plus fort que vous ne le pensez',
        'La cohérence est la clé',
        'Croyez en vous',
        'Un pas à la fois',
        'Votre santé en vaut la peine',
        'Continuez à avancer',
        'Vous pouvez le faire',
        'Restez positif et travaillez dur',
        'Embrassez le voyage',
        'Célébrez les petites victoires',
        'Concentrez-vous sur les progrès, pas sur les revers',
        'Faites compter chaque jour',
        'Vous êtes capable de choses incroyables',
        'Restez engagé envers vos objectifs',
        'Transformez vos habitudes, transformez votre vie',
        'Votre futur vous remerciera',
        'La santé est la richesse',
        'Visez le progrès, pas la perfection',
        'Croyez que vous pouvez et vous êtes à mi-chemin',
        'Le seul mauvais entraînement est celui qui n\'a pas eu lieu',
        'Poussez-vous, car personne d\'autre ne le fera pour vous',
        'Le succès est la somme de petits efforts répétés jour après jour'
    ];

    // German translations
    const quotesGer = [
        'Kleine Schritte, große Ergebnisse',
        'Fortschritt, nicht Perfektion',
        'Jeder Tag ist eine neue Chance',
        'Du bist stärker als du denkst',
        'Konsistenz ist der Schlüssel',
        'Glaube an dich',
        'Ein Schritt nach dem anderen',
        'Deine Gesundheit ist es wert',
        'Weiter vorwärts',
        'Du schaffst das',
        'Bleib positiv und arbeite hart',
        'Umarme die Reise',
        'Feiere kleine Siege',
        'Konzentriere dich auf Fortschritt, nicht auf Rückschläge',
        'Mach jeden Tag wertvoll',
        'Du bist zu erstaunlichen Dingen fähig',
        'Bleib deinen Zielen verpflichtet',
        'Verändere deine Gewohnheiten, verändere dein Leben',
        'Dein zukünftiges Ich wird dir danken',
        'Gesundheit ist Reichtum',
        'Strebe nach Fortschritt, nicht nach Perfektion',
        'Glaube, dass du es kannst, und du bist schon halb da',
        'Das einzige schlechte Training ist das, das nicht stattfand',
        'Fordere dich selbst heraus, denn niemand sonst wird es für dich tun',
        'Erfolg ist die Summe kleiner Anstrengungen, die Tag für Tag wiederholt werden'
    ];

    $('#encouragement-card').html(`
        <div class="encouragement-quote" data-eng="${quoteEng}" data-spa="${quotesSpa[index]}" data-fre="${quotesFre[index]}" data-ger="${quotesGer[index]}">"${quoteEng}"</div>
    `);
}

/**
 * Display next check-in prediction
 * @param {string} nextDate - ISO date string (YYYY-MM-DD)
 * @param {number} daysUntil - Days until next weigh-in
 * @param {number} avgInterval - Average days between logs
 */
function displayNextCheckin(nextDate, daysUntil, avgInterval) {
    if (window.coverage) window.coverage.logFunction('displayNextCheckin', 'dashboard.js');

    const container = $('#next-checkin');

    if (!nextDate || daysUntil === null) {
        // Not enough data
        container.html(
            `<div class="text-muted small" data-eng="Log more weights to see predictions" data-spa="Registra más pesos para ver predicciones" data-fre="Enregistrez plus de poids pour voir les prédictions" data-ger="Protokollieren Sie mehr Gewichte, um Vorhersagen zu sehen">Log more weights to see predictions</div>`
        );
        return;
    }

    // Format date based on user's date format setting
    const formattedDate = formatDate(nextDate);

    let html = '';

    if (daysUntil <= 0) {
        // Overdue
        html = `
            <div class="checkin-date" data-eng="📍 You're due for a weigh-in today!" data-spa="📍 ¡Es hora de pesarte hoy!" data-fre="📍 Vous devez vous peser aujourd'hui!" data-ger="📍 Sie sollten sich heute wiegen!">📍 You're due for a weigh-in today!</div>
        `;
    } else {
        // Future date
        const dayLabelEng = daysUntil === 1 ? 'day' : 'days';
        const dayLabelSpa = daysUntil === 1 ? 'día' : 'días';
        const dayLabelFre = daysUntil === 1 ? 'jour' : 'jours';
        const dayLabelGer = daysUntil === 1 ? 'Tag' : 'Tage';
        html = `
            <div class="checkin-countdown">${daysUntil}</div>
            <div class="checkin-date" data-eng="${dayLabelEng}" data-spa="${dayLabelSpa}" data-fre="${dayLabelFre}" data-ger="${dayLabelGer}">${dayLabelEng}</div>
            <div class="text-muted small mt-2" data-eng="Next weigh-in on ${formattedDate}" data-spa="Próximo pesaje el ${formattedDate}" data-fre="Prochain pesage le ${formattedDate}" data-ger="Nächste Wiegung am ${formattedDate}">Next weigh-in on ${formattedDate}</div>
        `;
    }

    html += `<div class="text-muted small mt-1" data-eng="Based on your average logging frequency" data-spa="Basado en tu frecuencia promedio de registro" data-fre="Basé sur votre fréquence moyenne de journalisation" data-ger="Basierend auf Ihrer durchschnittlichen Protokollierungshäufigkeit">Based on your average logging frequency</div>`;

    container.html(html);
}

// ========================================
// Phase 2: Goals Achieved Enhancements
// ========================================

/**
 * Refresh Goals Achieved card with enhanced metrics
 * Called on init and after goal/weight updates
 */
function refreshGoalsAchieved() {
    if (window.coverage) window.coverage.logFunction('refreshGoalsAchieved', 'dashboard.js');

    // Use global dashboard data if available
    if (window.globalDashboardData && window.globalDashboardData.goal_progress_enhanced) {
        debugLog('📊 Using global data for goal progress enhanced');
        renderGoalProgress(window.globalDashboardData.goal_progress_enhanced);
    } else {
        debugLog('🌐 Making API call for goal progress enhanced');
        // Fallback: individual API call
        postRequest('router.php?controller=profile', { action: 'get_goal_progress_enhanced' })
            .then(resp => {
                const data = parseJson(resp);
                if (data.success && data.progress) {
                    renderGoalProgress(data.progress);
                }
            })
            .catch(err => {
                console.error('Failed to load goal progress:', err);
            });
    }
}

/**
 * Render goal progress data to DOM
 * @param {Object} goalData - Goal progress object from API
 */
function renderGoalProgress(goalData) {
    if (window.coverage) window.coverage.logFunction('renderGoalProgress', 'dashboard.js');

    debugLog('📊 renderGoalProgress called with', goalData);
    const hasGoal = goalData && goalData.target_weight !== null;
    debugLog('🔍 hasGoal', hasGoal);

    if (!hasGoal) {
        // Show placeholder
        $('#no-goal-placeholder').show();
        $('#goal-progress-content').hide();
        return;
    }

    // Hide placeholder, show content
    debugLog('✅ Hiding placeholder, showing content');
    $('#no-goal-placeholder').hide();
    $('#goal-progress-content').show();

    // Update progress bar
    const progressPercent = Math.min(100, Math.max(0, goalData.progress_percent || 0));
    $('#goal-progress-fill').css('width', `${progressPercent}%`);
    $('#goal-progress-text').text(`${Math.round(progressPercent)}%`);

    // Update weight progress text
    const weightLost = parseFloat(convertFromKg(goalData.weight_lost || 0)).toFixed(1);
    const totalToLose = parseFloat(convertFromKg((goalData.start_weight || 0) - (goalData.target_weight || 0))).toFixed(1);
    const unit = getWeightUnitLabel();
    const ofText = t('of') || 'of';
    $('#goal-weight-progress').text(`${weightLost} ${unit} ${ofText} ${totalToLose} ${unit}`);

    // Goal achieved celebration
    if (progressPercent >= 100) {
        $('#goal-progress-fill').css('background', 'linear-gradient(90deg, #7bc96f 0%, #5ba84d 100%)');
    } else {
        $('#goal-progress-fill').css('background', 'linear-gradient(90deg, #64a6d8 0%, #5294c4 100%)');
    }

    // Update streak, ETA, and badges
    displayGoalStreak(goalData.weekly_progress, goalData.monthly_progress);
    displayGoalETA(goalData);
    renderMilestoneBadges(goalData.weight_lost || 0);

    // Update ideal weight progress (right column)
    renderIdealWeightProgress(goalData);
}

/**
 * Display weekly/monthly progress streak
 * @param {number} weeklyPercent - Weekly progress percentage
 * @param {number} monthlyPercent - Monthly progress percentage
 */
function displayGoalStreak(weeklyPercent, monthlyPercent) {
    if (window.coverage) window.coverage.logFunction('displayGoalStreak', 'dashboard.js');

    const container = $('#goal-streak-text');

    if (!weeklyPercent && !monthlyPercent) {
        weeklyPercent = 0;
        monthlyPercent = 0;
    }

    let html = '';

    if (weeklyPercent > 5) {
        // Significant weekly progress
        html = `<span data-eng="Great progress this week!" data-spa="¡Gran progreso esta semana!" data-fre="Excellent progrès cette semaine!" data-ger="Großartiger Fortschritt diese Woche!">Great progress this week!</span>`;
    } else if (weeklyPercent > 0) {
        const percent = weeklyPercent.toFixed(1);
        html = `<span data-eng="Progressed ${percent}% this week" data-spa="Progresó ${percent}% esta semana" data-fre="Progrès de ${percent}% cette semaine" data-ger="${percent}% Fortschritt diese Woche">Progressed ${percent}% this week</span>`;
    } else if (monthlyPercent > 0) {
        const percent = monthlyPercent.toFixed(1);
        html = `<span data-eng="Progressed ${percent}% last month" data-spa="Progresó ${percent}% el mes pasado" data-fre="Progrès de ${percent}% le mois dernier" data-ger="Fortschritt von ${percent}% im letzten Monat">Progressed ${percent}% last month</span>`;
    } else {
        html = `<span data-eng="No recent progress - keep logging!" data-spa="Sin progreso reciente - ¡sigue registrando!" data-fre="Pas de progrès récent - continuez à enregistrer!" data-ger="Kein aktueller Fortschritt - weiter protokollieren!">No recent progress - keep logging!</span>`;
    }

    container.html(html);
}

/**
 * Display estimated goal achievement date
 * @param {Object} goalData - Contains eta_date, weekly_loss_rate, progress_percent
 */
function displayGoalETA(goalData) {
    if (window.coverage) window.coverage.logFunction('displayGoalETA', 'dashboard.js');

    const container = $('#goal-eta-text');
    const { eta_date, weekly_loss_rate, progress_percent } = goalData;

    if (progress_percent >= 100) {
        const html = `<span data-eng="You've already reached your goal!" data-spa="¡Ya has alcanzado tu meta!" data-fre="Vous avez déjà atteint votre objectif!" data-ger="Sie haben Ihr Ziel bereits erreicht!">You've already reached your goal!</span>`;
        container.html(html);
        return;
    }

    if (!eta_date || !weekly_loss_rate || weekly_loss_rate <= 0) {
        const html = `<span data-eng="Need more data for prediction" data-spa="Se necesitan más datos para predicción" data-fre="Besoin de plus de données pour la prédiction" data-ger="Mehr Daten für Vorhersage benötigt">Need more data for prediction</span>`;
        container.html(html);
        return;
    }

    const formattedDate = formatDate(eta_date);
    const html = `<span data-eng="On track to reach goal by ${formattedDate}" data-spa="En camino de alcanzar la meta para ${formattedDate}" data-fre="En bonne voie pour atteindre l'objectif d'ici ${formattedDate}" data-ger="Auf dem Weg, das Ziel bis ${formattedDate} zu erreichen">On track to reach goal by ${formattedDate}</span>`;

    container.html(html);
}

/**
 * Render milestone badges based on weight lost
 * @param {number} weightLost - Total weight lost in kg
 */
function renderMilestoneBadges(weightLost) {
    if (window.coverage) window.coverage.logFunction('renderMilestoneBadges', 'dashboard.js');

    const unit = getWeightUnit();
    let milestones = [];

    // Define milestones based on weight unit
    if (unit === 'kg') {
        milestones = [
            { value: 1, icon: '🥉' },
            { value: 3, icon: '🥈' },
            { value: 5, icon: '🥇' },
            { value: 10, icon: '🏆' },
            { value: 15, icon: '💎' },
            { value: 20, icon: '👑' },
            { value: 30, icon: '🌟' },
            { value: 40, icon: '✨' },
            { value: 50, icon: '🎖️' }
        ];
    } else if (unit === 'lbs') {
        milestones = [
            { value: 5, icon: '🥉' },   // ~2.3 kg
            { value: 10, icon: '🥈' },  // ~4.5 kg
            { value: 15, icon: '🥇' },  // ~6.8 kg
            { value: 25, icon: '🏆' },  // ~11.3 kg
            { value: 35, icon: '💎' },  // ~15.9 kg
            { value: 50, icon: '👑' },  // ~22.7 kg
            { value: 75, icon: '🌟' },  // ~34 kg
            { value: 100, icon: '✨' }, // ~45.4 kg
            { value: 125, icon: '🎖️' } // ~56.7 kg
        ];
    } else if (unit === 'st') {
        milestones = [
            { value: 0.5, icon: '🥉' }, // ~3.2 kg
            { value: 1, icon: '🥈' },   // ~6.4 kg
            { value: 1.5, icon: '🥇' }, // ~9.5 kg
            { value: 2, icon: '🏆' },   // ~12.7 kg
            { value: 2.5, icon: '💎' }, // ~15.9 kg
            { value: 3, icon: '👑' },   // ~19 kg
            { value: 4, icon: '🌟' },   // ~25.4 kg
            { value: 5, icon: '✨' },   // ~31.8 kg
            { value: 6, icon: '🎖️' }   // ~38.1 kg
        ];
    }

    const weightLostInUserUnit = parseFloat(convertFromKg(weightLost));
    const unitLabel = getWeightUnitLabel();
    let badgesHTML = '';

    milestones.forEach(milestone => {
        const achieved = weightLostInUserUnit >= milestone.value;
        const statusClass = achieved ? 'achieved' : 'locked';

        badgesHTML += `
            <div class="goal-badge ${statusClass}">
                <div class="goal-badge-icon">${milestone.icon}</div>
                <div class="goal-badge-label">${milestone.value} ${unitLabel}</div>
            </div>
        `;
    });

    $('#goal-badges-container').html(badgesHTML);
}

/**
 * Render ideal weight progress (right column)
 * Uses ideal weight upper limit as target instead of custom goal
 * @param {Object} goalData - Goal progress data
 */
function renderIdealWeightProgress(goalData) {
    if (window.coverage) window.coverage.logFunction('renderIdealWeightProgress', 'dashboard.js');

    // Get ideal weight data from global dashboard data
    const idealWeightData = window.globalDashboardData?.ideal_weight;

    if (!idealWeightData || !idealWeightData.max_weight_kg) {
        debugLog('⚠️ No ideal weight data available');
        return;
    }

    const currentWeight = goalData.current_weight;
    const startWeight = goalData.start_weight;
    const idealTargetWeight = parseFloat(idealWeightData.max_weight_kg); // Upper limit of ideal range

    // Calculate progress percentage toward ideal weight
    const totalToLose = startWeight - idealTargetWeight;
    const lostSoFar = startWeight - currentWeight;
    const progressPercent = (totalToLose > 0) ? Math.min(100, Math.max(0, (lostSoFar / totalToLose * 100))) : 0;

    // Update progress bar
    $('#ideal-progress-fill').css('width', `${progressPercent}%`);
    $('#ideal-progress-text').text(`${Math.round(progressPercent)}%`);

    // Update weight progress text
    const weightLost = convertFromKg(lostSoFar);
    const totalToLoseConverted = convertFromKg(totalToLose);
    const unit = getWeightUnitLabel();
    const ofText = t('of') || 'of';
    $('#ideal-weight-progress').text(`${weightLost} ${unit} ${ofText} ${totalToLoseConverted} ${unit}`);

    // Goal achieved celebration
    if (progressPercent >= 100) {
        $('#ideal-progress-fill').css('background', 'linear-gradient(90deg, #7bc96f 0%, #5ba84d 100%)');
    } else {
        $('#ideal-progress-fill').css('background', 'linear-gradient(90deg, #64a6d8 0%, #5294c4 100%)');
    }

    // Calculate streak and ETA using ideal weight as target
    const idealWeeklyProgress = calculateIdealWeightProgress(7, startWeight, idealTargetWeight);
    const idealMonthlyProgress = calculateIdealWeightProgress(30, startWeight, idealTargetWeight);

    displayIdealWeightStreak(idealWeeklyProgress, idealMonthlyProgress);
    displayIdealWeightETA(currentWeight, idealTargetWeight, goalData.weekly_loss_rate);
}

/**
 * Calculate progress toward ideal weight for a given period
 * @param {number} days - Number of days to look back
 * @param {float} startWeight - Starting weight
 * @param {float} idealTargetWeight - Ideal weight target
 * @returns {float} Progress percentage toward ideal weight
 */
function calculateIdealWeightProgress(days, startWeight, idealTargetWeight) {
    if (window.coverage) window.coverage.logFunction('calculateIdealWeightProgress', 'dashboard.js');

    const weightHistory = window.globalDashboardData?.weight_history;
    if (!weightHistory || weightHistory.length < 2) {
        return 0;
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentWeights = weightHistory.filter(entry => {
        const entryDate = new Date(entry.entry_date);
        return entryDate >= cutoffDate;
    });

    if (recentWeights.length < 2) {
        return 0;
    }

    // Sort by date descending (newest first)
    recentWeights.sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));

    const periodStartWeight = parseFloat(recentWeights[recentWeights.length - 1].weight_kg);
    const periodEndWeight = parseFloat(recentWeights[0].weight_kg);
    const lostInPeriod = periodStartWeight - periodEndWeight;

    // Calculate as percentage of total goal to ideal weight
    const totalToLose = startWeight - idealTargetWeight;
    const percentTowardGoal = (totalToLose > 0) ? (lostInPeriod / totalToLose * 100) : 0;

    return Math.round(percentTowardGoal * 100) / 100; // Round to 2 decimals
}

/**
 * Display ideal weight streak (same logic as goal streak)
 */
function displayIdealWeightStreak(weeklyPercent, monthlyPercent) {
    if (window.coverage) window.coverage.logFunction('displayIdealWeightStreak', 'dashboard.js');

    const container = $('#ideal-streak-text');

    if (!weeklyPercent && !monthlyPercent) {
        weeklyPercent = 0;
        monthlyPercent = 0;
    }

    let html = '';

    if (weeklyPercent > 5) {
        html = `<span data-eng="Great progress this week!" data-spa="¡Gran progreso esta semana!" data-fre="Excellent progrès cette semaine!" data-ger="Großartiger Fortschritt diese Woche!">Great progress this week!</span>`;
    } else if (weeklyPercent > 0) {
        const percent = weeklyPercent.toFixed(1);
        html = `<span data-eng="Progressed ${percent}% this week" data-spa="Progresó ${percent}% esta semana" data-fre="Progrès de ${percent}% cette semaine" data-ger="${percent}% Fortschritt diese Woche">Progressed ${percent}% this week</span>`;
    } else if (monthlyPercent > 0) {
        const percent = monthlyPercent.toFixed(1);
        html = `<span data-eng="Progressed ${percent}% last month" data-spa="Progresó ${percent}% el mes pasado" data-fre="Progrès de ${percent}% le mois dernier" data-ger="Fortschritt von ${percent}% im letzten Monat">Progressed ${percent}% last month</span>`;
    } else {
        html = `<span data-eng="No recent progress - keep logging!" data-spa="Sin progreso reciente - ¡sigue registrando!" data-fre="Pas de progrès récent - continuez à enregistrer!" data-ger="Kein aktueller Fortschritt - weiter protokollieren!">No recent progress - keep logging!</span>`;
    }

    container.html(html);
}

/**
 * Display ideal weight ETA
 */
function displayIdealWeightETA(currentWeight, idealTargetWeight, weeklyLossRate) {
    if (window.coverage) window.coverage.logFunction('displayIdealWeightETA', 'dashboard.js');

    const container = $('#ideal-eta-text');

    if (currentWeight <= idealTargetWeight) {
        const html = `<span data-eng="You've reached your ideal weight!" data-spa="¡Has alcanzado tu peso ideal!" data-fre="Vous avez atteint votre poids idéal!" data-ger="Sie haben Ihr Idealgewicht erreicht!">You've reached your ideal weight!</span>`;
        container.html(html);
        return;
    }

    if (!weeklyLossRate || weeklyLossRate <= 0) {
        const html = `<span data-eng="Need more data for prediction" data-spa="Se necesitan más datos para predicción" data-fre="Besoin de plus de données pour la prédiction" data-ger="Mehr Daten für Vorhersage benötigt">Need more data for prediction</span>`;
        container.html(html);
        return;
    }

    const remainingToLose = currentWeight - idealTargetWeight;
    const weeksToGoal = remainingToLose / weeklyLossRate;
    const etaDate = new Date();
    etaDate.setDate(etaDate.getDate() + (weeksToGoal * 7));

    const formattedDate = formatDate(etaDate.toISOString().split('T')[0]);
    const html = `<span data-eng="On track to reach BMI by ${formattedDate}" data-spa="En camino de alcanzar IMC para ${formattedDate}" data-fre="En bonne voie pour atteindre l'IMC d'ici ${formattedDate}" data-ger="Auf dem Weg, den BMI bis ${formattedDate} zu erreichen">On track to reach BMI by ${formattedDate}</span>`;

    container.html(html);
}

/**
 * Format date according to user's date format preference
 * @param {string} isoDate - ISO date string (YYYY-MM-DD)
 * @returns {string} Formatted date
 */
function formatDate(isoDate) {
    if (window.coverage) window.coverage.logFunction('formatDate', 'dashboard.js');

    const date = new Date(isoDate + 'T00:00:00'); // Avoid timezone issues
    const dateFormat = localStorage.getItem('dateFormat') || 'uk';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    switch (dateFormat) {
        case 'uk':
            return `${day}/${month}/${year}`;
        case 'us':
            return `${month}/${day}/${year}`;
        case 'iso':
            return `${year}-${month}-${day}`;
        case 'european':
            return `${day}.${month}.${year}`;
        default:
            return `${day}/${month}/${year}`;
    }
}

// ==================== PHASE 3: STREAK COUNTER ENHANCEMENTS ====================

/**
 * Refresh Streak Counter card with enhanced metrics
 * Called on init and after weight updates
 */
function refreshStreakCounter() {
    if (window.coverage) window.coverage.logFunction('refreshStreakCounter', 'dashboard.js');

    // Check if data already exists in global dashboard data
    if (window.globalDashboardData && window.globalDashboardData.streak_data) {
        debugLog('Using cached streak data from global dashboard data');
        renderStreakCounter(window.globalDashboardData.streak_data);
        return;
    }

    // Fallback: Make individual API call
    debugLog('Global data not available, making individual API call');

    $.post('router.php?controller=profile', { action: 'get_streak_data' })
        .done(function(response) {
            if (response.success && response.data) {
                debugLog('✅ Streak data fetched successfully', response.data);
                renderStreakCounter(response.data);
            } else {
                debugLog('❌ Error fetching streak data:', response.message);
                showNoStreakData();
            }
        })
        .fail(function(xhr, status, error) {
            debugLog('❌ AJAX error fetching streak data:', error);
            showNoStreakData();
        });
}

/**
 * Render streak counter UI with data
 * @param {Object} data - Streak data from backend
 */
function renderStreakCounter(data) {
    if (window.coverage) window.coverage.logFunction('renderStreakCounter', 'dashboard.js');

    const container = $('#streak-counter');

    // Show/hide appropriate containers
    if (!data || data.current_streak === null) {
        showNoStreakData();
        return;
    }

    // Generate complete HTML with translation attributes embedded
    const timelineHtml = generateStreakTimelineHtml(data.timeline || []);
    const motivationHtml = generateStreakMotivationHtml(data);

    const html = `
        <!-- Placeholder shown when insufficient data -->
        <div id="no-streak-data" class="text-muted small" style="display: none;"
            data-eng="Log weights regularly to build streaks"
            data-spa="Registra pesos regularmente para construir rachas"
            data-fre="Enregistrez régulièrement les poids pour créer des séries"
            data-ger="Protokollieren Sie regelmäßig Gewichte, um Serien aufzubauen">
            Log weights regularly to build streaks
        </div>

        <div id="streak-content">
            <div class="row">
                <!-- Left Column: Stats -->
                <div class="col-md-6">
                    <!-- Current Streak Display -->
                    <div class="streak-stat-row mb-2">
                        <div class="streak-stat-icon">🔥</div>
                        <div class="streak-stat-content">
                            <div class="streak-stat-value">${data.current_streak || 0}</div>
                            <div class="streak-stat-label"
                                data-eng="Current Streak"
                                data-spa="Racha Actual"
                                data-fre="Série Actuelle"
                                data-ger="Aktuelle Serie">
                                Current Streak
                            </div>
                        </div>
                    </div>

                    <!-- Longest Streak Display -->
                    <div class="streak-stat-row mb-2">
                        <div class="streak-stat-icon">🏆</div>
                        <div class="streak-stat-content">
                            <div class="streak-stat-value">${data.longest_streak || 0}</div>
                            <div class="streak-stat-label"
                                data-eng="Personal Best"
                                data-spa="Mejor Personal"
                                data-fre="Meilleur Personnel"
                                data-ger="Persönliche Bestleistung">
                                Personal Best
                            </div>
                        </div>
                    </div>

                    <!-- Missed Entries -->
                    <div class="streak-stat-row mb-3">
                        <div class="streak-stat-icon">📊</div>
                        <div class="streak-stat-content">
                            <div class="streak-stat-value">${data.missed_weeks_this_month || 0}</div>
                            <div class="streak-stat-label"
                                data-eng="Missed Entries"
                                data-spa="Entradas Perdidas"
                                data-fre="Entrées Manquées"
                                data-ger="Verpasste Einträge">
                                Missed Entries
                            </div>
                        </div>
                    </div>

                    <!-- Motivational Message -->
                    <div class="streak-motivation">
                        ${motivationHtml}
                    </div>
                </div>

                <!-- Right Column: Timeline -->
                <div class="col-md-6">
                    <div class="streak-timeline">
                        <div class="streak-timeline-title text-muted small mb-2"
                            data-eng="Last 28 Days"
                            data-spa="Últimos 28 Días"
                            data-fre="28 Derniers Jours"
                            data-ger="Letzte 28 Tage">
                            Last 28 Days
                        </div>
                        <div class="streak-timeline-grid">
                            ${timelineHtml}
                        </div>
                        <div class="streak-timeline-legend">
                            <div class="streak-legend-item">
                                <span class="streak-dot logged"></span>
                                <span class="streak-legend-label"
                                    data-eng="Logged"
                                    data-spa="Registrado"
                                    data-fre="Enregistré"
                                    data-ger="Protokolliert">
                                    Logged
                                </span>
                            </div>
                            <div class="streak-legend-item">
                                <span class="streak-dot today"></span>
                                <span class="streak-legend-label"
                                    data-eng="Today"
                                    data-spa="Hoy"
                                    data-fre="Aujourd'hui"
                                    data-ger="Heute">
                                    Today
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.html(html);

    // Apply current language to newly generated content
    const currentLanguage = localStorage.getItem('language') || 'en';

    if (currentLanguage !== 'en') {
        const langMap = { 'en': 'eng', 'es': 'spa', 'fr': 'fre', 'de': 'ger' };
        const dataAttr = langMap[currentLanguage];
        if (dataAttr) {
            container.find(`[data-${dataAttr}]`).each(function() {
                const $element = $(this);
                const translatedText = $element.attr(`data-${dataAttr}`);
                if (translatedText) {
                    $element.html(translatedText);
                }
            });
        }
    }
}

/**
 * Generate 28-day visual timeline HTML (4 weeks)
 * @param {Array} timeline - Array of 28 day objects: { date, logged, is_today }
 * @returns {string} HTML for timeline dots
 */
function generateStreakTimelineHtml(timeline) {
    if (window.coverage) window.coverage.logFunction('generateStreakTimelineHtml', 'dashboard.js');

    if (!timeline || timeline.length === 0) {
        debugLog('⚠️ No timeline data available');
        return '';
    }

    // Generate timeline dots (28 days = 4 weeks)
    const dotsHtml = timeline.map(day => {
        const classes = ['streak-dot'];

        if (day.logged) {
            classes.push('logged');
        } else {
            classes.push('missed');
        }

        if (day.is_today) {
            classes.push('today');
        }

        return `<div class="${classes.join(' ')}" data-date="${day.date}" title="${day.date}"></div>`;
    }).join('');

    debugLog(`✅ Generated HTML for ${timeline.length} timeline dots`);
    return dotsHtml;
}

/**
 * Generate motivational message HTML based on streak performance
 * @param {Object} data - Contains current_streak, longest_streak
 * @returns {string} HTML for motivational message
 */
function generateStreakMotivationHtml(data) {
    if (window.coverage) window.coverage.logFunction('generateStreakMotivationHtml', 'dashboard.js');

    const { current_streak, longest_streak } = data;
    let html = '';

    if (current_streak >= 12) {
        // Exceptional streak (3 months)
        html = `<span data-eng="🎉 Amazing! You're on a ${current_streak}-week streak!" data-spa="¡Increíble! ¡Tienes una racha de ${current_streak} semanas!" data-fre="Incroyable ! Vous avez une série de ${current_streak} semaines !" data-ger="Erstaunlich! Sie haben eine ${current_streak}-Wochen-Serie!">🎉 Amazing! You're on a ${current_streak}-week streak!</span>`;
    } else if (current_streak >= 4) {
        // Good streak (1 month)
        html = `<span data-eng="🔥 ${current_streak} weeks strong! Keep it up!" data-spa="¡${current_streak} semanas fuerte! ¡Sigue así!" data-fre="${current_streak} semaines fortes ! Continuez !" data-ger="${current_streak} Wochen stark! Weiter so!">🔥 ${current_streak} weeks strong! Keep it up!</span>`;
    } else if (current_streak >= 1) {
        // Building streak
        html = `<span data-eng="Good start! ${current_streak} week(s) logged" data-spa="¡Buen comienzo! ${current_streak} semana(s) registrada(s)" data-fre="Bon début ! ${current_streak} semaine(s) enregistrée(s)" data-ger="Guter Start! ${current_streak} Woche(n) protokolliert">Good start! ${current_streak} week(s) logged</span>`;
    } else {
        // No current streak
        if (longest_streak > 0) {
            html = `<span data-eng="Your record is ${longest_streak} weeks. You can beat it!" data-spa="Tu récord es ${longest_streak} semanas. ¡Puedes superarlo!" data-fre="Votre record est de ${longest_streak} semaines. Vous pouvez le battre !" data-ger="Ihr Rekord liegt bei ${longest_streak} Wochen. Sie können ihn schlagen!">Your record is ${longest_streak} weeks. You can beat it!</span>`;
        } else {
            html = `<span data-eng="Start building your streak today!" data-spa="¡Comienza a construir tu racha hoy!" data-fre="Commencez à construire votre série aujourd'hui !" data-ger="Beginnen Sie heute mit Ihrer Serie!">Start building your streak today!</span>`;
        }
    }

    return html;
}

/**
 * Show placeholder when insufficient data exists
 */
function showNoStreakData() {
    if (window.coverage) window.coverage.logFunction('showNoStreakData', 'dashboard.js');

    const container = $('#streak-counter');
    const html = `
        <div id="no-streak-data" class="text-muted small"
            data-eng="Log weights regularly to build streaks"
            data-spa="Registra pesos regularmente para construir rachas"
            data-fre="Enregistrez régulièrement les poids pour créer des séries"
            data-ger="Protokollieren Sie regelmäßig Gewichte, um Serien aufzubauen">
            Log weights regularly to build streaks
        </div>
    `;
    container.html(html);

    // Apply current language to newly generated content
    const currentLanguage = localStorage.getItem('language') || 'en';
    if (currentLanguage !== 'en') {
        const langMap = { 'en': 'eng', 'es': 'spa', 'fr': 'fre', 'de': 'ger' };
        const dataAttr = langMap[currentLanguage];
        if (dataAttr) {
            container.find(`[data-${dataAttr}]`).each(function() {
                const $element = $(this);
                const translatedText = $element.attr(`data-${dataAttr}`);
                if (translatedText) {
                    $element.html(translatedText);
                }
            });
        }
    }

    debugLog('ℹ️ Showing no streak data placeholder');
}

// ==================== End Quick Look Section ====================

// ==================== PHASE 4: TOTAL PROGRESS ENHANCEMENTS ====================

/**
 * Refresh Total Progress card with charts and stats
 * Called on init and after weight/goal updates
 */
function refreshTotalProgress() {
    if (window.coverage) window.coverage.logFunction('refreshTotalProgress', 'dashboard.js');

    // CRITICAL: Use global dashboard data if available (don't break the global data system!)
    if (window.globalDashboardData && window.globalDashboardData.total_progress) {
        debugLog('Using global data for total progress');
        renderTotalProgress(window.globalDashboardData.total_progress);
    } else {
        // Fallback: individual API call (only if global data not available)
        debugLog('Falling back to individual API call');
        postRequest('router.php?controller=profile', { action: 'get_total_progress' })
            .then(resp => {
                const data = parseJson(resp);
                if (data.success && data.total_progress) {
                    renderTotalProgress(data.total_progress);
                } else {
                    console.error('API call succeeded but no total_progress data:', data);
                    $('#total-progress-loading').html('Error loading progress data');
                }
            })
            .catch(err => {
                console.error('Failed to load total progress:', err);
                $('#total-progress-loading').html('Error: ' + err.message);
            });
    }
}

/**
 * Render total progress data and charts
 * @param {Object} progressData - Progress data from API
 */
function renderTotalProgress(progressData) {
    if (window.coverage) window.coverage.logFunction('renderTotalProgress', 'dashboard.js');

    $('#total-progress-loading').hide();
    $('#total-progress-content').show();

    // Initialize tab switching
    initProgressTabs();

    // Render all charts
    renderWeeklyLossChart(progressData.weekly_loss_data);
    renderProjectionChart(progressData.projection_data);
    renderGoalPieChart(progressData.goal_data);
    renderIdealWeightPieChart(progressData.ideal_weight_data);
    renderBodyFatChart(progressData.body_fat_data);

    // Display weight comparison
    displayWeightComparison(progressData.total_lost_kg);
}

/**
 * Initialize tab switching functionality
 */
function initProgressTabs() {
    if (window.coverage) window.coverage.logFunction('initProgressTabs', 'dashboard.js');

    $('.progress-tab-btn').off('click').on('click', function() {
        const tab = $(this).data('tab');

        // Update buttons
        $('.progress-tab-btn').removeClass('active');
        $(this).addClass('active');

        // Update content
        $('.progress-tab-content').removeClass('active');
        $(`.progress-tab-content[data-tab="${tab}"]`).addClass('active');
    });
}

/**
 * Render average weekly loss line chart
 * @param {Array} weeklyData - Array of {week, avg_loss}
 */
function renderWeeklyLossChart(weeklyData) {
    if (window.coverage) window.coverage.logFunction('renderWeeklyLossChart', 'dashboard.js');

    const ctx = document.getElementById('weekly-loss-chart');
    if (!ctx) return;

    // Destroy existing chart if exists (prevent memory leaks)
    if (window.weeklyLossChartInstance) {
        window.weeklyLossChartInstance.destroy();
    }

    if (!weeklyData || weeklyData.length === 0) {
        return;
    }

    const labels = weeklyData.map(d => `Week ${d.week}`);
    const data = weeklyData.map(d => d.avg_loss);

    window.weeklyLossChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Weight Loss (kg)',
                data: data,
                borderColor: '#64a6d8',
                backgroundColor: 'rgba(100, 166, 216, 0.1)',
                tension: 0.3,
                fill: true,
                pointRadius: 0,
                pointHoverRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(100, 150, 200, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
}

/**
 * Render 6-month projection chart
 * @param {Object} projectionData - Contains historical and projected weights
 */
function renderProjectionChart(projectionData) {
    if (window.coverage) window.coverage.logFunction('renderProjectionChart', 'dashboard.js');

    const ctx = document.getElementById('projection-chart');
    if (!ctx) return;

    // Destroy existing chart
    if (window.projectionChartInstance) {
        window.projectionChartInstance.destroy();
    }

    if (!projectionData || !projectionData.historical || !projectionData.projected) {
        return;
    }

    const { historical, projected } = projectionData;

    window.projectionChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [...historical.labels, ...projected.labels],
            datasets: [
                {
                    label: 'Actual',
                    data: [...historical.data, ...Array(projected.data.length).fill(null)],
                    borderColor: '#64a6d8',
                    backgroundColor: 'rgba(100, 166, 216, 0.1)',
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 0
                },
                {
                    label: 'Projected',
                    data: [...Array(historical.data.length).fill(null), ...projected.data],
                    borderColor: '#7bc96f',
                    backgroundColor: 'rgba(123, 201, 111, 0.1)',
                    borderDash: [5, 5],
                    tension: 0.3,
                    pointRadius: 0,
                    pointHoverRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                }
            },
            scales: {
                y: {
                    grid: {
                        color: 'rgba(100, 150, 200, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
}

/**
 * Render goal completion pie chart
 * @param {Object} goalData - Contains completed_kg, remaining_kg
 */
function renderGoalPieChart(goalData) {
    if (window.coverage) window.coverage.logFunction('renderGoalPieChart', 'dashboard.js');

    const ctx = document.getElementById('goal-pie-chart');
    if (!ctx) return;

    // Destroy existing chart
    if (window.goalPieChartInstance) {
        window.goalPieChartInstance.destroy();
    }

    if (!goalData || goalData.completed_kg === undefined || goalData.completed_kg === null) {
        $('#goal-pie-label').text('No goal set');
        return;
    }

    const { completed_kg, remaining_kg, total_kg } = goalData;

    const completedLabel = t('Completed') || 'Completed';
    const remainingLabel = t('Remaining') || 'Remaining';

    window.goalPieChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [completedLabel, remainingLabel],
            datasets: [{
                data: [Math.abs(completed_kg), Math.abs(remaining_kg)],
                backgroundColor: ['#7bc96f', 'rgba(100, 150, 200, 0.3)'],
                borderColor: ['#7bc96f', 'rgba(100, 150, 200, 0.5)'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                }
            }
        }
    });

    // Update label (ensure we have numbers)
    const unit = getWeightUnitLabel();
    const completedDisplay = parseFloat(convertFromKg(completed_kg) || 0).toFixed(1);
    const totalDisplay = parseFloat(convertFromKg(total_kg) || 0).toFixed(1);
    const ofText = t('of') || 'of';
    const labelText = `${completedDisplay} ${unit} ${ofText} ${totalDisplay} ${unit}`;
    $('#goal-pie-label').text(labelText);
}

/**
 * Render ideal weight pie chart
 * @param {Object} idealWeightData - Contains progress toward ideal BMI range
 */
function renderIdealWeightPieChart(idealWeightData) {
    if (window.coverage) window.coverage.logFunction('renderIdealWeightPieChart', 'dashboard.js');

    const ctx = document.getElementById('ideal-weight-pie-chart');
    if (!ctx) return;

    // Destroy existing chart
    if (window.idealWeightPieChartInstance) {
        window.idealWeightPieChartInstance.destroy();
    }

    if (!idealWeightData) {
        return;
    }

    const { achieved_kg, remaining_kg, in_range } = idealWeightData;

    if (in_range) {
        $('#ideal-weight-label').text("You're in your ideal range!");
        return;
    }

    const achievedLabel = t('Achieved') || 'Achieved';
    const remainingLabel = t('Remaining') || 'Remaining';

    window.idealWeightPieChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [achievedLabel, remainingLabel],
            datasets: [{
                data: [achieved_kg, remaining_kg],
                backgroundColor: ['#7bc96f', 'rgba(100, 150, 200, 0.3)'],
                borderColor: ['#7bc96f', 'rgba(100, 150, 200, 0.5)'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'rgba(255, 255, 255, 0.8)'
                    }
                }
            }
        }
    });

    const unit = getWeightUnitLabel();
    const remainingDisplay = parseFloat(convertFromKg(remaining_kg) || 0).toFixed(1);
    const toGoText = t('to go') || 'to go';
    $('#ideal-weight-label').text(`${remainingDisplay} ${unit} ${toGoText}`);
}

/**
 * Render body fat percentage chart
 * @param {Array} bodyFatData - Array of {date, body_fat_percent}
 */
function renderBodyFatChart(bodyFatData) {
    if (window.coverage) window.coverage.logFunction('renderBodyFatChart', 'dashboard.js');

    debugLog('Body fat data received:', bodyFatData);

    const ctx = document.getElementById('body-fat-chart');
    if (!ctx) return;

    if (!bodyFatData || bodyFatData.length === 0) {
        debugLog('No body fat data - showing placeholder');
        $('#body-fat-chart').hide();
        $('#body-fat-chart-placeholder').show();
        return;
    }

    $('#body-fat-chart').show();
    $('#body-fat-chart-placeholder').hide();

    // Destroy existing chart
    if (window.bodyFatChartInstance) {
        window.bodyFatChartInstance.destroy();
    }

    const labels = bodyFatData.map(d => formatDate(d.entry_date));
    const data = bodyFatData.map(d => parseFloat(d.body_fat_percent));

    window.bodyFatChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Body Fat %',
                data: data,
                borderColor: '#f39c12',
                backgroundColor: 'rgba(243, 156, 18, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(100, 150, 200, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
}

/**
 * Display fun weight comparison
 * @param {number} totalLostKg - Total weight lost in kg
 */
function displayWeightComparison(totalLostKg) {
    if (window.coverage) window.coverage.logFunction('displayWeightComparison', 'dashboard.js');

    const comparisons = [
        { kg: 1, text: '10 sticks of butter', icon: '🧈' },
        { kg: 2, text: 'a pineapple', icon: '🍍' },
        { kg: 3, text: 'a newborn baby', icon: '👶' },
        { kg: 4, text: 'a housecat', icon: '🐱' },
        { kg: 5, text: 'a bowling ball', icon: '🎳' },
        { kg: 7, text: 'a gallon of paint', icon: '🪣' },
        { kg: 10, text: 'an air conditioner', icon: '❄️' },
        { kg: 12, text: 'a medium dog', icon: '🐕' },
        { kg: 15, text: 'a microwave oven', icon: '📺' },
        { kg: 20, text: 'a full suitcase', icon: '🧳' },
        { kg: 25, text: 'a small child', icon: '🧒' },
        { kg: 30, text: 'a bicycle', icon: '🚲' },
        { kg: 40, text: 'a large dog', icon: '🐶' },
        { kg: 50, text: 'a full-size refrigerator', icon: '🧊' }
    ];

    // Find closest comparison
    let closestComparison = comparisons[0];
    for (const comp of comparisons) {
        if (Math.abs(totalLostKg) >= comp.kg) {
            closestComparison = comp;
        }
    }

    const unit = getWeightUnitLabel();
    const displayWeight = parseFloat(convertFromKg(Math.abs(totalLostKg)) || 0).toFixed(1);
    const likeLosing = t("that's like losing") || "that's like losing";
    const translatedComparison = t(closestComparison.text) || closestComparison.text;
    $('#weight-comparison').text(`${displayWeight} ${unit}, ${likeLosing} ${translatedComparison.toUpperCase()} ${closestComparison.icon}`);
}

// Body fat is now automatically calculated and stored when weight is logged
// No manual input needed - uses Deurenberg formula (BMI + age)

// ==================== End Phase 4: Total Progress ====================

// Make functions globally available for settings
window.updateWeightUnitDisplay = updateWeightUnitDisplay;
window.refreshAllWeightDisplays = refreshAllWeightDisplays;
window.updateHeightUnitDisplay = updateHeightUnitDisplay;
window.loadQuickLookMetrics = loadQuickLookMetrics;
window.refreshTotalProgress = refreshTotalProgress;
