
// Global variable to store consolidated dashboard data
window.globalDashboardData = null;

$(function() {
    // Initialize unit systems first
    initializeWeightUnit();
    initializeHeightUnit();

    // Log active schema to console for debugging
    $.post('router.php?controller=schema', { action: 'get' }, function(resp) {
        try {
            const data = typeof resp === 'string' ? JSON.parse(resp) : resp;
            if (data && data.schema) {
                console.log('Active schema:', data.schema);
            }
        } catch (e) {}
    });

    $('#btn-logout').on('click', function() {
        // Show immediate feedback
        $(this).prop('disabled', true).text('↪ Logging out...');

        // Set a timeout to ensure redirect happens even if server is slow
        setTimeout(function() {
            window.location.href = 'index.php';
        }, 1000);

        $.post('login_router.php?controller=auth', { action: 'logout' }, function() {
            window.location.href = 'index.php';
        }).fail(function() {
            // Even if network fails, try redirect
            window.location.href = 'index.php';
        });
    });

    // FIRST: Load consolidated data, THEN load individual data
    testConsolidatedDashboardData(function() {
        // This callback runs after consolidated data is loaded
        console.log('🎯 Consolidated data loaded, now calling individual functions...');

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
        loadSettings();
    });
    
    // Set today's date as default for new entries
    $('#newDate').val(new Date().toISOString().split('T')[0]);

    // Handlers
    $('#btn-add-weight').on('click', function() {
        const weightInput = $('#weightKg').val().trim();
        if (!weightInput) { return; }

        // Convert user input to kg for storage
        const weightKg = convertToKg(weightInput);
        if (isNaN(weightKg) || weightKg <= 0) {
            showAlert('Please enter a valid weight', 'warning');
            return;
        }

        $.post('router.php?controller=profile', { action: 'add_weight', weight_kg: weightKg.toFixed(2) }, function(resp) {
            const data = parseJson(resp);
            if (data.success) {
                showToast('Weight saved');
                $('#weightKg').val('');

                // Reload global data first, then refresh all functions
                reloadGlobalDashboardData(function() {
                    // Functions using global data
                    refreshLatestWeight();
                    refreshBMI();
                    refreshHealth(); // body fat uses global, cardiovascular risk uses individual API
                    refreshWeightProgress();
                    refreshGallbladderHealth();
                    loadWeightHistory();

                    // Functions using individual API calls
                    refreshIdealWeight(); // always uses individual API call
                    refreshPersonalHealthBenefits();

                    // Update the weight chart with current period
                    const activePeriod = $('.btn-group .active').attr('id')?.replace('chart-', '') || '90days';
                    updateWeightChart(activePeriod);
                });
            }
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
            showToast('Please enter both weight and date');
            return;
        }

        // Convert user input to kg for storage
        const weightKg = convertToKg(weightInput);
        if (isNaN(weightKg) || weightKg <= 0) {
            showToast('Please enter a valid weight');
            return;
        }

        $.post('router.php?controller=profile', {
            action: 'add_weight',
            weight_kg: weightKg.toFixed(2),
            entry_date: date
        }, function(resp) {
            const data = parseJson(resp);
            if (data.success) {
                showToast('Weight entry saved');
                $('#add-entry-form').slideUp();
                $('#newWeight').val('');
                $('#newDate').val(new Date().toISOString().split('T')[0]);

                // Reload global data first, then refresh all functions
                reloadGlobalDashboardData(function() {
                    // Functions using global data
                    refreshLatestWeight();
                    refreshBMI();
                    refreshHealth(); // body fat uses global, cardiovascular risk uses individual API
                    refreshWeightProgress();
                    refreshGallbladderHealth();
                    loadWeightHistory();

                    // Functions using individual API calls
                    refreshIdealWeight(); // always uses individual API call

                    // Update the weight chart with current period
                    const activePeriod = $('.btn-group .active').attr('id')?.replace('chart-', '') || '90days';
                    updateWeightChart(activePeriod);
                });
            } else {
                showToast('Failed to save weight entry');
            }
        }).fail(function() {
            showToast('Network error');
        });
    });

    $('#btn-save-goal').on('click', function() {
        const goalInput = $('#goalWeight').val().trim();
        const d = $('#goalDate').val();
        if (!goalInput) { return; }

        // Convert user input to kg for storage
        const weightKg = convertToKg(goalInput);
        if (isNaN(weightKg) || weightKg <= 0) {
            showAlert('Please enter a valid goal weight', 'warning');
            return;
        }

        $.post('router.php?controller=profile', { action: 'save_goal', target_weight_kg: weightKg.toFixed(2), target_date: d }, function(resp) {
            const data = parseJson(resp);
            if (data.success) {
                showToast('Goal saved');
                refreshGoal();
                refreshPersonalHealthBenefits();
            }
        });
    });

    $('#btn-save-profile').on('click', function() {
        const heightInput = $('#heightCm').val().trim();
        let heightCm = 0;

        if (heightInput) {
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
        }).fail(function() {
            $('#profile-status').text('Network error').removeClass('text-success').addClass('text-danger');
        });
    });

    // Settings handlers
    $('#dateFormat').on('change', function() {
        updateDateExample();
    });
    
    $('#btn-save-settings').on('click', function() {
        saveSettings();
    });
    
    $('#btn-reset-settings').on('click', function() {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            resetSettings();
        }
    });
    
    // Update date example when format changes
    updateDateExample();
    
    // Tab URL hash navigation
    initTabNavigation();
    
    // Initialize weight chart
    initWeightChart();
    
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
    console.log('🔄 Reloading global dashboard data...');
    $.post('router.php?controller=profile', { action: 'get_all_dashboard_data' }, function(resp) {
        const result = parseJson(resp);
        console.log('Reloaded dashboard data result:', result);

        if (result.success) {
            // Store the data globally so other functions can use it
            window.globalDashboardData = result.data;
            console.log('✅ Global dashboard data updated');

            if (callback) {
                callback();
            }
        } else {
            console.log('❌ Failed to reload global dashboard data:', result.message);
            // Clear global data on failure
            window.globalDashboardData = null;

            if (callback) {
                callback();
            }
        }
    }).fail(function() {
        console.log('❌ Network error reloading global dashboard data');
        window.globalDashboardData = null;

        if (callback) {
            callback();
        }
    });
}

function testConsolidatedDashboardData(callback) {
    console.log('Testing consolidated dashboard data endpoint...');
    $.post('router.php?controller=profile', { action: 'get_all_dashboard_data' }, function(resp) {
        const result = parseJson(resp);
        console.log('Consolidated dashboard data result:', result);

        if (result.success) {
            // Store the data globally so other functions can use it
            window.globalDashboardData = result.data;

            console.log('✅ Consolidated endpoint working!');
            console.log('📊 Data received:', Object.keys(result.data || {}));
            console.log('🌍 Global dashboard data stored:', window.globalDashboardData);
        } else {
            console.log('❌ Consolidated endpoint failed:', result.message);
        }

        // Call the callback regardless of success/failure
        if (callback && typeof callback === 'function') {
            callback();
        }
    }).fail(function() {
        console.log('❌ Network error calling consolidated endpoint');

        // Call the callback even on failure so individual functions still run
        if (callback && typeof callback === 'function') {
            callback();
        }
    });
}

function refreshLatestWeight() {
    if (window.coverage) window.coverage.logFunction('refreshLatestWeight', 'dashboard.js');

    // Check if we have global data first
    console.log('🔍 refreshLatestWeight - checking global data:', window.globalDashboardData);
    console.log('🔍 latest_weight in global data:', window.globalDashboardData?.latest_weight);

    if (window.globalDashboardData && window.globalDashboardData.latest_weight) {
        console.log('📊 Using global data for latest weight');
        const latestWeight = window.globalDashboardData.latest_weight;
        const formattedDate = formatDate(latestWeight.entry_date);
        const displayWeight = convertFromKg(latestWeight.weight_kg);
        const unit = getWeightUnitLabel();
        $('#latest-weight').text(`Latest: ${displayWeight} ${unit} on ${formattedDate}`);
        return;
    }

    // Fallback to API call if global data not available
    console.log('🌐 Making API call for latest weight (global data not available)');
    $.post('router.php?controller=profile', { action: 'get_latest_weight' }, function(resp) {
        const data = parseJson(resp);
        if (data.latest) {
            const formattedDate = formatDate(data.latest.entry_date);
            const displayWeight = convertFromKg(data.latest.weight_kg);
            const unit = getWeightUnitLabel();
            $('#latest-weight').text(`Latest: ${displayWeight} ${unit} on ${formattedDate}`);
        } else {
            $('#latest-weight').text('No weight entries yet');
        }
    });
}

function refreshGoal() {
    if (window.coverage) window.coverage.logFunction('refreshGoal', 'dashboard.js');

    // Check if we have global data first
    console.log('🔍 refreshGoal - checking global data:', window.globalDashboardData);
    console.log('🔍 goal in global data:', window.globalDashboardData?.goal);

    if (window.globalDashboardData && window.globalDashboardData.goal) {
        console.log('📊 Using global data for goal');
        const goal = window.globalDashboardData.goal;
        const date = goal.target_date || 'n/a';
        const displayWeight = convertFromKg(goal.target_weight_kg);
        const unit = getWeightUnitLabel();
        $('#current-goal').text(`Current goal: ${displayWeight} ${unit} by ${date}`);
        return;
    }

    // Check if global data loaded but no goal exists
    if (window.globalDashboardData && !window.globalDashboardData.goal) {
        console.log('📊 Using global data for goal (no goal set)');
        $('#current-goal').text('No active goal set');
        return;
    }

    // Fallback to API call if global data not available
    console.log('🌐 Making API call for goal (global data not available)');
    $.post('router.php?controller=profile', { action: 'get_goal' }, function(resp) {
        const data = parseJson(resp);
        if (data.goal) {
            const date = data.goal.target_date || 'n/a';
            const displayWeight = convertFromKg(data.goal.target_weight_kg);
            const unit = getWeightUnitLabel();
            $('#current-goal').text(`Current goal: ${displayWeight} ${unit} by ${date}`);
        } else {
            $('#current-goal').text('No active goal set');
        }
    });
}

function loadProfile() {
    if (window.coverage) window.coverage.logFunction('loadProfile', 'dashboard.js');

    // Check if we have global data first
    if (window.globalDashboardData && window.globalDashboardData.profile) {
        console.log('📊 Using global data for profile');
        const profile = window.globalDashboardData.profile;
        const displayHeight = profile.height_cm ? convertFromCm(profile.height_cm) : '';
        $('#heightCm').val(displayHeight).data('current-unit', getHeightUnit());
        $('#bodyFrame').val(profile.body_frame || '');
        $('#age').val(profile.age || '');
        $('#activityLevel').val(profile.activity_level || '');
        return;
    }

    // Fallback to API call if global data not available
    console.log('🌐 Making API call for profile (global data not available)');
    $.post('router.php?controller=profile', { action: 'get_profile' }, function(resp) {
        const data = parseJson(resp);
        if (data.profile) {
            const displayHeight = data.profile.height_cm ? convertFromCm(data.profile.height_cm) : '';
            $('#heightCm').val(displayHeight);
            $('#bodyFrame').val(data.profile.body_frame || '');
            $('#age').val(data.profile.age || '');
            $('#activityLevel').val(data.profile.activity_level || '');
        }
    });
}

function refreshBMI() {
    // Call the health.js function
    if (typeof window.healthRefreshBMI === 'function') {
        window.healthRefreshBMI();
    }
}

function refreshHealth() {
    // Call the health.js function
    if (typeof window.healthRefreshHealth === 'function') {
        window.healthRefreshHealth();
    }
}

function refreshIdealWeight() {
    // Call the health.js function
    if (typeof window.healthRefreshIdealWeight === 'function') {
        window.healthRefreshIdealWeight();
    }
}

function refreshWeightProgress() {
    if (window.coverage) window.coverage.logFunction('refreshWeightProgress', 'dashboard.js');

    // Check if we have global data first
    console.log('🔍 refreshWeightProgress - checking global data:', window.globalDashboardData);
    console.log('🔍 weight_progress in global data:', window.globalDashboardData?.weight_progress);

    if (window.globalDashboardData && window.globalDashboardData.weight_progress) {
        console.log('📊 Using global data for weight progress');
        const data = window.globalDashboardData.weight_progress;
        const el = $('#progress-block');

        const lines = [];
        const unit = getWeightUnitLabel();
        const displayTotalLost = convertFromKg(data.total_weight_lost_kg);
        lines.push(`Total Weight Lost: <strong>${displayTotalLost} ${unit}</strong>`);
        if (data.estimated_fat_loss_kg) {
            const fatLoss = convertFromKg(data.estimated_fat_loss_kg);
            lines.push(`Estimated Fat Loss: <strong class="text-success">${fatLoss} ${unit}</strong> (${data.fat_loss_percentage}%)`);
        }
        const avgWeeklyRate = convertFromKg(data.avg_weekly_rate_kg || data.average_weekly_loss_kg);
        lines.push(`<small class="text-muted">Over ${data.weeks_elapsed || data.weeks_tracked} weeks (${avgWeeklyRate} ${unit}/week average)</small>`);
        if (data.research_note) {
            lines.push(`<small class="text-muted">${data.research_note}</small>`);
        }

        el.html(lines.join('<br>')).removeClass('text-muted');
        return;
    }

    // Fallback to API call if global data not available
    console.log('🌐 Making API call for weight progress (global data not available)');
    $.post('router.php?controller=profile', { action: 'get_weight_progress' }, function(resp) {
        const data = parseJson(resp);
        const el = $('#progress-block');

        if (!data.success) {
            el.text(data.message || 'Need at least 2 weight entries to show progress').addClass('text-muted');
            return;
        }

        const lines = [];
        const unit = getWeightUnitLabel();
        const displayTotalLost = convertFromKg(data.total_weight_lost_kg);
        lines.push(`Total Weight Lost: <strong>${displayTotalLost} ${unit}</strong>`);
        const fatLoss = convertFromKg(data.estimated_fat_loss_kg);
        lines.push(`Estimated Fat Loss: <strong class="text-success">${fatLoss} ${unit}</strong> (${data.fat_loss_percentage}%)`);
        const avgWeeklyRate = convertFromKg(data.avg_weekly_rate_kg);
        lines.push(`<small class="text-muted">Over ${data.weeks_elapsed} weeks (${avgWeeklyRate} ${unit}/week average)</small>`);
        lines.push(`<small class="text-muted">${data.research_note}</small>`);

        el.html(lines.join('<br>')).removeClass('text-muted');
    }).fail(function() {
        $('#progress-block').text('Failed to calculate weight progress').addClass('text-muted');
    });
}

function refreshGallbladderHealth() {
    // Call the health.js function
    if (typeof window.healthRefreshGallbladderHealth === 'function') {
        window.healthRefreshGallbladderHealth();
    }
}

function loadWeightHistory() {
    // Call the data.js function
    if (typeof window.dataLoadWeightHistory === 'function') {
        window.dataLoadWeightHistory();
    }
}

function formatDate(dateString) {
    // Call the data.js function
    if (typeof window.dataFormatDate === 'function') {
        return window.dataFormatDate(dateString);
    }
    return dateString;
}

function editWeight(id, weight, date) {
    // Call the data.js function
    if (typeof window.dataEditWeight === 'function') {
        window.dataEditWeight(id, weight, date);
    }
}

function deleteWeight(id) {
    // Call the data.js function
    if (typeof window.dataDeleteWeight === 'function') {
        window.dataDeleteWeight(id);
    }
}


function loadSettings() {
    // Call the settings.js function
    if (typeof window.settingsLoadSettings === 'function') {
        window.settingsLoadSettings();
    }
}

function saveSettings() {
    // Call the settings.js function
    if (typeof window.settingsSaveSettings === 'function') {
        window.settingsSaveSettings();
    }
}

function resetSettings() {
    // Call the settings.js function
    if (typeof window.settingsResetSettings === 'function') {
        window.settingsResetSettings();
    }
}

function updateDateExample() {
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
    });

    // Check URL hash on page load and activate correct tab
    const urlHash = window.location.hash;
    if (urlHash && urlHash.startsWith('#tab=')) {
        const tabName = urlHash.substring(5); // Remove #tab=
        const tabSelector = '#' + tabName + '-tab';
        const tabExists = $(tabSelector).length > 0;
        
        if (tabExists) {
            // Deactivate current active tab
            $('.nav-link.active').removeClass('active');
            $('.tab-pane.active').removeClass('active show');
            
            // Activate the target tab
            $(tabSelector).addClass('active');
            $('#' + tabName).addClass('active show');
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
        weightChart.data.datasets = [{
            label: 'Weight (kg)',
            data: [],
            borderColor: '#64a6d8',
            backgroundColor: 'rgba(100, 166, 216, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#64a6d8',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8
        }];
    } else {
        // Ensure existing dataset has consistent colors
        const dataset = weightChart.data.datasets[0];
        dataset.borderColor = '#64a6d8';
        dataset.backgroundColor = 'rgba(100, 166, 216, 0.1)';
        dataset.pointBackgroundColor = '#64a6d8';
        dataset.pointBorderColor = '#ffffff';
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
                const monthData = yearlyData[context.dataIndex];
                const lines = [];
                if (monthData.averageWeight > 0) {
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
                borderColor: '#64a6d8',
                backgroundColor: 'rgba(100, 166, 216, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#64a6d8',
                pointBorderColor: '#ffffff',
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
                        color: '#ffffff',
                        font: {
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff',
                        font: {
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#ffffff',
                        font: {
                            family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
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
    
    $.post('router.php?controller=profile', { action: 'get_weight_history' }, function(resp) {
        const data = parseJson(resp);
        
        if (!data.success || !data.history || data.history.length === 0) {
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
            weightChart.options.scales.y.title.text = `Weight (${unit})`;
        } else {
            weightChart.options.scales.y.title = {
                display: true,
                text: `Weight (${unit})`,
                color: '#ffffff',
                font: {
                    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                }
            };
        }

        weightChart.update();
        
        $('#chart-status').hide();
        
        // Update achievement cards with current period data
        updateAchievementCards(filteredData);
        
    }).fail(function() {
        $('#chart-status').text('Failed to load chart data').show();
    });
}

function updateMonthlyChart(sortedData) {
    if (window.coverage) window.coverage.logFunction('updateMonthlyChart', 'dashboard.js');
    $('#chart-status').text('Processing monthly data...').show();
    
    // Define colors for each month (6 distinct colors)
    const monthColors = [
        '#64a6d8', // Blue (current theme color)
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
        $('#chart-status').text('No weight data available for monthly view').show();
        weightChart.data.labels = [];
        weightChart.data.datasets = [];
        weightChart.update();
        return;
    }
    
    // Create labels (days of month 1-31)
    const labels = [];
    for (let day = 1; day <= 31; day++) {
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
        pointBorderColor: '#ffffff',
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
        weightChart.options.scales.y.title.text = `Weight (${unit})`;
    } else {
        weightChart.options.scales.y.title = {
            display: true,
            text: `Weight (${unit})`,
            color: '#ffffff',
            font: {
                family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }
        };
    }

    weightChart.update();
    
    $('#chart-status').hide();
    
    // Update achievement cards for monthly view
    updateMonthlyAchievementCards(monthsWithData);
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
            highestEntryCount = month.data.length;
            mostConsistentMonth = month;
        }
    });
    
    if (mostConsistentMonth) {
        const streakHtml = `<strong class="text-success" style="color: ${mostConsistentMonth.color} !important;">🔥 ${mostConsistentMonth.name}</strong><br><small>Most consistent: ${highestEntryCount} entries</small>`;
        $('#streak-counter').html(streakHtml);
    } else {
        $('#streak-counter').html('<span class="text-muted">No data available</span>');
    }
}

function updateWeeklyChart(sortedData) {
    if (window.coverage) window.coverage.logFunction('updateWeeklyChart', 'dashboard.js');
    $('#chart-status').text('Processing weekly data...').show();
    
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Calculate week numbers for the current year (1-52/53)
    function getWeekNumber(date) {
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
        if (!week.hasData) return 'rgba(255, 255, 255, 0.1)';
        
        // Color coding for weeks with data
        if (loss > 1) return '#7bc96f'; // Green for excellent loss (>1kg/week)
        else if (loss > 0.5) return '#64a6d8'; // Blue for good loss (0.5-1kg)
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
                bestLoss = week.weightLoss;
                bestWeek = week;
            }
            
            totalLoss += week.weightLoss;
        }
    });
    
    // Update Total Progress card
    const progressHtml = totalLoss > 0 
        ? `<strong class="text-success">${totalLoss.toFixed(1)} kg lost</strong><br><small>Over ${weeksWithData} weeks in ${currentYear} (${totalEntries} entries)</small>`
        : `<strong class="text-info">${Math.abs(totalLoss).toFixed(1)} kg gained</strong><br><small>Over ${weeksWithData} weeks in ${currentYear} (${totalEntries} entries)</small>`;
    $('#total-progress').html(progressHtml);
    
    // Update Goals Achieved with best week
    if (bestWeek && bestLoss > 0) {
        const weekStartStr = bestWeek.weekStart.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
        const goalHtml = `<strong class="text-success">🏆 ${bestWeek.weekLabel}</strong><br><small>Best week: ${bestLoss.toFixed(1)} kg (${weekStartStr})</small>`;
        $('#goals-achieved').html(goalHtml);
    } else {
        $('#goals-achieved').html('<span class="text-muted">🎯 No standout week</span><br><small>Need more weekly data</small>');
    }
    
    // Update Streak Counter with most active week
    let mostActiveWeek = null;
    let highestEntryCount = 0;
    
    weeklyData.forEach(week => {
        if (week.entryCount > highestEntryCount) {
            highestEntryCount = week.entryCount;
            mostActiveWeek = week;
        }
    });
    
    if (mostActiveWeek && highestEntryCount > 0) {
        const streakHtml = `<strong class="text-success">🔥 ${mostActiveWeek.weekLabel}</strong><br><small>Most active: ${highestEntryCount} entries</small>`;
        $('#streak-counter').html(streakHtml);
    } else {
        $('#streak-counter').html('<span class="text-muted">No weekly data</span>');
    }
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
        $('#chart-status').text(`No weight data available for ${currentYear}`).show();
        weightChart.data.labels = [];
        weightChart.data.datasets = [];
        weightChart.update();
        return;
    }
    
    // Create bar chart showing weight loss per month
    const barColors = monthlyLosses.map(loss => {
        if (loss > 2) return '#7bc96f'; // Green for good loss (>2kg)
        else if (loss > 0) return '#64a6d8'; // Blue for moderate loss
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
                bestLoss = month.weightLoss;
                bestMonth = month;
            }
            
            totalLoss += month.weightLoss;
        }
    });
    
    // Update Total Progress card
    const progressHtml = totalLoss > 0 
        ? `<strong class="text-success">${totalLoss.toFixed(1)} kg lost</strong><br><small>In ${currentYear} (${monthsWithData} months, ${totalEntries} entries)</small>`
        : `<strong class="text-info">${Math.abs(totalLoss).toFixed(1)} kg gained</strong><br><small>In ${currentYear} (${monthsWithData} months, ${totalEntries} entries)</small>`;
    $('#total-progress').html(progressHtml);
    
    // Update Goals Achieved with best month
    if (bestMonth && bestLoss > 0) {
        const goalHtml = `<strong class="text-success">🏆 ${bestMonth.month}</strong><br><small>Best month: ${bestLoss.toFixed(1)} kg lost</small>`;
        $('#goals-achieved').html(goalHtml);
    } else {
        $('#goals-achieved').html('<span class="text-muted">🎯 No standout month</span><br><small>Need more data for comparison</small>');
    }
    
    // Update Streak Counter with most active month
    let mostActiveMonth = null;
    let highestEntryCount = 0;
    
    yearlyData.forEach(month => {
        if (month.entryCount > highestEntryCount) {
            highestEntryCount = month.entryCount;
            mostActiveMonth = month;
        }
    });
    
    if (mostActiveMonth && highestEntryCount > 0) {
        const streakHtml = `<strong class="text-success">🔥 ${mostActiveMonth.month}</strong><br><small>Most active: ${highestEntryCount} entries</small>`;
        $('#streak-counter').html(streakHtml);
    } else {
        $('#streak-counter').html('<span class="text-muted">No data available</span>');
    }
}

function updateAchievementCards(weightData) {
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

        // Refresh displays to show in correct unit
        refreshAllWeightDisplays();
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
    refreshIdealWeight();
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

// Make functions globally available for settings
window.updateWeightUnitDisplay = updateWeightUnitDisplay;
window.refreshAllWeightDisplays = refreshAllWeightDisplays;
window.updateHeightUnitDisplay = updateHeightUnitDisplay;