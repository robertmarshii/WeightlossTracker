
$(function() {
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
        $.post('login_router.php?controller=auth', { action: 'logout' }, function() {
            window.location.href = 'index.php';
        }).fail(function() {
            // Even if network fails, try redirect
            window.location.href = 'index.php';
        });
    });

    // Load existing data
    refreshLatestWeight();
    refreshGoal();
    loadProfile();
    refreshBMI();
    refreshHealth();
    refreshIdealWeight();
    refreshWeightProgress();
    refreshGallbladderHealth();
    loadWeightHistory();
    loadSettings();
    
    // Set today's date as default for new entries
    $('#newDate').val(new Date().toISOString().split('T')[0]);

    // Handlers
    $('#btn-add-weight').on('click', function() {
        const w = parseFloat($('#weightKg').val());
        if (!w) { return; }
        $.post('router.php?controller=profile', { action: 'add_weight', weight_kg: w }, function(resp) {
            const data = parseJson(resp);
            if (data.success) {
                showToast('Weight saved');
                $('#weightKg').val('');
                refreshLatestWeight();
                refreshBMI();
                refreshHealth();
                refreshIdealWeight();
                refreshWeightProgress();
                refreshGallbladderHealth();
                refreshWeightProgress();
                loadWeightHistory();
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
        const weight = parseFloat($('#newWeight').val());
        const date = $('#newDate').val();
        
        if (!weight || !date) {
            showToast('Please enter both weight and date');
            return;
        }
        
        $.post('router.php?controller=profile', {
            action: 'add_weight',
            weight_kg: weight,
            entry_date: date
        }, function(resp) {
            const data = parseJson(resp);
            if (data.success) {
                showToast('Weight entry saved');
                $('#add-entry-form').slideUp();
                $('#newWeight').val('');
                $('#newDate').val(new Date().toISOString().split('T')[0]);
                loadWeightHistory();
                refreshLatestWeight();
                refreshBMI();
                refreshHealth();
                refreshIdealWeight();
                refreshWeightProgress();
                refreshGallbladderHealth();
            } else {
                showToast('Failed to save weight entry');
            }
        }).fail(function() {
            showToast('Network error');
        });
    });

    $('#btn-save-goal').on('click', function() {
        const w = parseFloat($('#goalWeight').val());
        const d = $('#goalDate').val();
        if (!w) { return; }
        $.post('router.php?controller=profile', { action: 'save_goal', target_weight_kg: w, target_date: d }, function(resp) {
            const data = parseJson(resp);
            if (data.success) {
                showToast('Goal saved');
                refreshGoal();
            }
        });
    });

    $('#btn-save-profile').on('click', function() {
        const payload = {
            action: 'save_profile',
            height_cm: parseInt($('#heightCm').val() || ''),
            body_frame: $('#bodyFrame').val(),
            age: parseInt($('#age').val() || ''),
            activity_level: $('#activityLevel').val()
        };
        $.post('router.php?controller=profile', payload, function(resp) {
            const data = parseJson(resp);
            if (data.success) {
                $('#profile-status').text('Profile saved').removeClass('text-danger').addClass('text-success');
                setTimeout(() => $('#profile-status').text(''), 3000);
                refreshBMI();
                refreshHealth();
                refreshIdealWeight();
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


function refreshLatestWeight() {
    if (window.coverage) window.coverage.logFunction('refreshLatestWeight', 'dashboard.js');
    $.post('router.php?controller=profile', { action: 'get_latest_weight' }, function(resp) {
        const data = parseJson(resp);
        if (data.latest) {
            const formattedDate = formatDate(data.latest.entry_date);
            $('#latest-weight').text('Latest: ' + data.latest.weight_kg + ' kg on ' + formattedDate);
        } else {
            $('#latest-weight').text('No weight entries yet');
        }
    });
}

function refreshGoal() {
    if (window.coverage) window.coverage.logFunction('refreshGoal', 'dashboard.js');
    $.post('router.php?controller=profile', { action: 'get_goal' }, function(resp) {
        const data = parseJson(resp);
        if (data.goal) {
            const date = data.goal.target_date || 'n/a';
            $('#current-goal').text('Current goal: ' + data.goal.target_weight_kg + ' kg by ' + date);
        } else {
            $('#current-goal').text('No active goal set');
        }
    });
}

function loadProfile() {
    if (window.coverage) window.coverage.logFunction('loadProfile', 'dashboard.js');
    $.post('router.php?controller=profile', { action: 'get_profile' }, function(resp) {
        const data = parseJson(resp);
        if (data.profile) {
            $('#heightCm').val(data.profile.height_cm || '');
            $('#bodyFrame').val(data.profile.body_frame || '');
            $('#age').val(data.profile.age || '');
            $('#activityLevel').val(data.profile.activity_level || '');
        }
    });
}

function refreshBMI() {
    if (window.coverage) window.coverage.logFunction('refreshBMI', 'dashboard.js');
    $.post('router.php?controller=profile', { action: 'get_bmi' }, function(resp) {
        const data = parseJson(resp);
        const el = $('#bmi-block');
        if (!data.success) {
            el.text(data.message || 'BMI not available').addClass('text-muted');
            return;
        }
        const lines = [];
        lines.push(`Current BMI: <strong>${data.bmi}</strong> (${data.category})`);
        if (data.adjusted_bmi) {
            lines.push(`Frame-adjusted: <strong>${data.adjusted_bmi}</strong> (${data.adjusted_category})`);
        }
        
        // Get before/after comparison
        $.post('router.php?controller=profile', { action: 'get_weight_progress' }, function(progressResp) {
            const progressData = parseJson(progressResp);
            if (progressData.success && progressData.start_weight_kg && progressData.current_weight_kg !== progressData.start_weight_kg) {
                // Calculate starting BMI for comparison
                const heightCm = data.height_cm;
                if (heightCm) {
                    const h = heightCm / 100.0;
                    const startingBmi = progressData.start_weight_kg / (h * h);
                    const improvement = startingBmi - data.bmi;
                    // Determine starting BMI category
                    const getCategory = (bmi) => {
                        if (bmi < 18.5) return 'underweight';
                        else if (bmi < 25) return 'normal';
                        else if (bmi < 30) return 'overweight';
                        else return 'obese';
                    };
                    const startingCategory = getCategory(startingBmi);
                    lines.push(`<small class="text-success">BMI reduced by ${improvement.toFixed(1)} points</small>`);
                    lines.push(`<small class="text-muted">Started at ${startingBmi.toFixed(1)} BMI (${startingCategory})</small>`);
                }
            }
            lines.push(`<small class="text-muted">BMI correlates with health risks. Each 5 BMI point reduction significantly lowers disease risk (Prospective Studies Collaboration, 2009)</small>`);
            el.html(lines.join('<br>')).removeClass('text-muted');
        });
    });
}

function refreshHealth() {
    if (window.coverage) window.coverage.logFunction('refreshHealth', 'dashboard.js');
    // Load body fat with before/after comparison
    $.post('router.php?controller=profile', { action: 'get_health_stats' }, function(resp) {
        const data = parseJson(resp);
        
        // Body Fat Block with before/after
        const bodyFatEl = $('#body-fat-block');
        if (!data.success) {
            bodyFatEl.text(data.message || 'Body fat estimation not available').addClass('text-muted');
        } else if (Array.isArray(data.estimated_body_fat_range)) {
            const bodyFatLines = [];
            const currentMin = data.estimated_body_fat_range[0];
            const currentMax = data.estimated_body_fat_range[1];
            bodyFatLines.push(`Current: <strong>${currentMin}–${currentMax}%</strong>`);
            
            // Always show research notes
            bodyFatLines.push(`<small class="text-muted">Body fat estimated via Deurenberg formula (BMI + age). Each 1% body fat reduction improves metabolic health (Jackson et al., 2002)</small>`);
            
            // Get before/after body fat comparison
            $.post('router.php?controller=profile', { action: 'get_weight_progress' }, function(progressResp) {
                const progressData = parseJson(progressResp);
                if (progressData.success && progressData.start_weight_kg && progressData.current_weight_kg !== progressData.start_weight_kg) {
                    // Calculate starting body fat estimate
                    const heightCm = data.height_cm;
                    const age = data.age;
                    if (heightCm && age && heightCm > 0 && age > 0) {
                        const h = heightCm / 100.0;
                        const startingBmi = progressData.start_weight_kg / (h * h);
                        const startingBfpMale = 1.2 * startingBmi + 0.23 * age - 16.2;
                        const startingBfpFemale = 1.2 * startingBmi + 0.23 * age - 5.4;
                        const startingMin = Math.min(startingBfpMale, startingBfpFemale);
                        const startingMax = Math.max(startingBfpMale, startingBfpFemale);
                        
                        const avgImprovement = ((startingMin + startingMax) / 2) - ((currentMin + currentMax) / 2);
                        
                        if (avgImprovement > 0.1) {
                            bodyFatLines.splice(1, 0, `Change: <strong class="text-success">-${avgImprovement.toFixed(1)}%</strong>`);
                            bodyFatLines.splice(2, 0, `Started: <strong>${startingMin.toFixed(1)}–${startingMax.toFixed(1)}%</strong>`);
                        }
                    }
                }
                bodyFatEl.html(bodyFatLines.join('<br>')).removeClass('text-muted');
            }).fail(function() {
                // If progress fails, still show the current data
                bodyFatEl.html(bodyFatLines.join('<br>')).removeClass('text-muted');
            });
        } else {
            bodyFatEl.text('Add your age to estimate body fat percentage').addClass('text-muted');
        }
    });
    
    // Load enhanced cardiovascular risk
    $.post('router.php?controller=profile', { action: 'get_cardiovascular_risk' }, function(resp) {
        const data = parseJson(resp);
        const cardioEl = $('#cardio-risk-block');
        
        if (!data.success) {
            cardioEl.text(data.message || 'Cardiovascular risk not available').addClass('text-muted');
        } else {
            const cardioLines = [];
            cardioLines.push(`Current Risk: <strong>${data.current_risk_percentage}%</strong> (${data.current_risk_category})`);
            
            if (data.risk_improvement_percentage > 0) {
                cardioLines.push(`<small class="text-success">Risk reduced by ${data.risk_improvement_percentage}% from weight loss</small>`);
                cardioLines.push(`<small class="text-muted">Started at ${data.original_risk_percentage}% (${data.original_risk_category})</small>`);
            }
            
            cardioLines.push(`<small class="text-muted">${data.research_note}</small>`);
            cardioEl.html(cardioLines.join('<br>')).removeClass('text-muted');
        }
    }).fail(function() {
        $('#cardio-risk-block').text('Failed to calculate cardiovascular risk').addClass('text-muted');
    });
}

function refreshIdealWeight() {
    if (window.coverage) window.coverage.logFunction('refreshIdealWeight', 'dashboard.js');
    $.post('router.php?controller=profile', { action: 'get_ideal_weight' }, function(resp) {
        const data = parseJson(resp);
        const el = $('#ideal-weight-block');
        
        if (!data.success) {
            el.text(data.message || 'Set your height to calculate ideal weight range').addClass('text-muted');
            return;
        }
        
        const lines = [];
        lines.push(`<strong>${data.min_weight_kg} - ${data.max_weight_kg} kg</strong>`);
        
        // Add timeline prediction if available
        if (data.timeline && data.timeline.target_date) {
            const targetMonth = new Date(data.timeline.target_date + '-01').toLocaleDateString('en-GB', { 
                year: 'numeric', 
                month: 'long' 
            });
            lines.push(`<small class="text-success">Projected to reach upper limit by ${targetMonth}</small>`);
            lines.push(`<small class="text-muted">Based on current rate of ${data.timeline.current_rate_kg_per_week} kg/week</small>`);
        }
        
        lines.push(`<small class="text-muted">${data.note}</small>`);
        
        el.html(lines.join('<br>')).removeClass('text-muted');
    }).fail(function() {
        $('#ideal-weight-block').text('Failed to calculate ideal weight range').addClass('text-muted');
    });
}

function refreshWeightProgress() {
    if (window.coverage) window.coverage.logFunction('refreshWeightProgress', 'dashboard.js');
    $.post('router.php?controller=profile', { action: 'get_weight_progress' }, function(resp) {
        const data = parseJson(resp);
        const el = $('#progress-block');
        
        if (!data.success) {
            el.text(data.message || 'Need at least 2 weight entries to show progress').addClass('text-muted');
            return;
        }
        
        const lines = [];
        lines.push(`Total Weight Lost: <strong>${data.total_weight_lost_kg} kg</strong>`);
        lines.push(`Estimated Fat Loss: <strong class="text-success">${data.estimated_fat_loss_kg} kg</strong> (${data.fat_loss_percentage}%)`);
        lines.push(`<small class="text-muted">Over ${data.weeks_elapsed} weeks (${data.avg_weekly_rate_kg} kg/week average)</small>`);
        lines.push(`<small class="text-muted">${data.research_note}</small>`);
        
        el.html(lines.join('<br>')).removeClass('text-muted');
    }).fail(function() {
        $('#progress-block').text('Failed to calculate weight progress').addClass('text-muted');
    });
}

function refreshGallbladderHealth() {
    if (window.coverage) window.coverage.logFunction('refreshGallbladderHealth', 'dashboard.js');
    $.post('router.php?controller=profile', { action: 'get_gallbladder_health' }, function(resp) {
        const data = parseJson(resp);
        const el = $('#gallbladder-block');
        
        if (!data.success) {
            el.text(data.message || 'Complete profile to assess gallbladder health benefits').addClass('text-muted');
            return;
        }
        
        const lines = [];
        lines.push(`Status: <strong>${data.gallbladder_status}</strong>`);
        
        if (data.risk_reduction_percentage > 0) {
            lines.push(`Risk Reduction: <strong class="text-success">${data.risk_reduction_percentage}%</strong>`);
            lines.push(`<small class="text-muted">Based on ${data.weight_lost_kg}kg lost, BMI ${data.current_bmi}</small>`);
        } else {
            lines.push(`<small class="text-muted">Continue weight loss for gallbladder benefits</small>`);
        }
        
        lines.push(`<small class="text-muted">${data.research_note}</small>`);
        
        el.html(lines.join('<br>')).removeClass('text-muted');
    }).fail(function() {
        $('#gallbladder-block').text('Failed to assess gallbladder health').addClass('text-muted');
    });
}

function loadWeightHistory() {
    if (window.coverage) window.coverage.logFunction('loadWeightHistory', 'dashboard.js');
    $.post('router.php?controller=profile', { action: 'get_weight_history' }, function(resp) {
        const data = parseJson(resp);
        const tbody = $('#weight-history-body');
        
        if (!data.success || !data.history || data.history.length === 0) {
            tbody.html('<tr><td colspan="5" class="no-data">No weight entries found. Add your first entry above!</td></tr>');
            return;
        }
        
        let html = '';
        
        // Reverse the data to display newest first (but calculate changes based on chronological order)
        const reversedHistory = [...data.history].reverse();
        
        reversedHistory.forEach((entry, index) => {
            const weight = parseFloat(entry.weight_kg);
            const date = entry.entry_date;
            const bmi = entry.bmi || 'N/A';
            
            // Calculate change from previous chronological entry (which is next in reversed array)
            let changeHtml = '<span class="text-muted">-</span>';
            if (index < reversedHistory.length - 1) {
                const nextEntry = reversedHistory[index + 1];
                const previousWeight = parseFloat(nextEntry.weight_kg);
                const change = weight - previousWeight;
                const changeClass = change > 0 ? 'text-danger' : change < 0 ? 'text-success' : 'text-muted';
                const changeSymbol = change > 0 ? '+' : '';
                changeHtml = `<span class="${changeClass}">${changeSymbol}${change.toFixed(1)} kg</span>`;
            }
            
            html += `
                <tr data-id="${entry.id}">
                    <td>${formatDate(date)}</td>
                    <td><strong>${weight} kg</strong></td>
                    <td>${changeHtml}</td>
                    <td>${bmi !== 'N/A' ? bmi : '<span class="text-muted">N/A</span>'}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm edit-btn" onclick="editWeight(${entry.id}, ${weight}, '${date}')">✏️</button>
                            <button class="btn btn-sm delete-btn" onclick="deleteWeight(${entry.id})">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        tbody.html(html);
    }).fail(function() {
        $('#weight-history-body').html('<tr><td colspan="5" class="no-data text-danger">Failed to load weight history</td></tr>');
    });
}

function formatDate(dateString) {
    if (window.coverage) window.coverage.logFunction('formatDate', 'dashboard.js');
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function editWeight(id, weight, date) {
    if (window.coverage) window.coverage.logFunction('editWeight', 'dashboard.js');
    // For now, just show the add form with the values pre-filled
    $('#newWeight').val(weight);
    $('#newDate').val(date);
    $('#add-entry-form').slideDown();
    $('#newWeight').focus();
    
    // TODO: Implement proper edit functionality with update instead of add
    showToast('Edit mode: Modify values and save (creates new entry for now)');
}

function deleteWeight(id) {
    if (window.coverage) window.coverage.logFunction('deleteWeight', 'dashboard.js');
    if (!confirm('Are you sure you want to delete this weight entry?')) {
        return;
    }
    
    $.post('router.php?controller=profile', {
        action: 'delete_weight',
        id: id
    }, function(resp) {
        const data = parseJson(resp);
        if (data.success) {
            showToast('Weight entry deleted');
            loadWeightHistory();
            refreshLatestWeight();
            refreshBMI();
            refreshHealth();
            refreshIdealWeight();
        } else {
            showToast('Failed to delete weight entry');
        }
    }).fail(function() {
        showToast('Network error');
    });
}


function loadSettings() {
    if (window.coverage) window.coverage.logFunction('loadSettings', 'dashboard.js');
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
    if (window.coverage) window.coverage.logFunction('saveSettings', 'dashboard.js');
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
    if (window.coverage) window.coverage.logFunction('resetSettings', 'dashboard.js');
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
    if (window.coverage) window.coverage.logFunction('updateDateExample', 'dashboard.js');
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
    
    // Set custom tooltip for bar charts
    weightChart.options.plugins.tooltip = {
        callbacks: {
            afterLabel: function(context) {
                const monthData = yearlyData[context.dataIndex];
                const lines = [];
                if (monthData.averageWeight > 0) {
                    lines.push(`Average weight: ${monthData.averageWeight.toFixed(1)} kg`);
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
        
        const weights = filteredData.map(entry => parseFloat(entry.weight_kg));
        
        // Reset to single-line chart configuration
        resetToLineChart();
        
        // Update chart
        weightChart.data.labels = labels;
        weightChart.data.datasets[0].data = weights;
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
                    weight: parseFloat(entry.weight_kg),
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
    
    // Update chart with multiple datasets
    weightChart.data.labels = labels;
    weightChart.data.datasets = datasets;
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
    const progressHtml = totalLoss > 0 
        ? `<strong class="text-success">${totalLoss.toFixed(1)} kg lost</strong><br><small>Over ${monthsWithData.length} months (${totalEntries} entries)</small>`
        : `<strong class="text-info">${Math.abs(totalLoss).toFixed(1)} kg gained</strong><br><small>Over ${monthsWithData.length} months (${totalEntries} entries)</small>`;
    $('#total-progress').html(progressHtml);
    
    // Update Goals Achieved with best month
    if (bestMonth && bestLoss > 0) {
        const goalHtml = `<strong class="text-success" style="color: ${bestMonth.color} !important;">🏆 ${bestMonth.name}</strong><br><small>Best month: ${bestLoss.toFixed(1)} kg lost</small>`;
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
    if (window.coverage) window.coverage.logFunction('updateAchievementCards', 'dashboard.js');
    if (weightData.length === 0) return;
    
    // Sort by date for calculations
    const sortedData = [...weightData].sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date));
    const firstWeight = parseFloat(sortedData[0].weight_kg);
    const lastWeight = parseFloat(sortedData[sortedData.length - 1].weight_kg);
    const totalLoss = firstWeight - lastWeight;
    
    // Update Total Progress card
    const progressHtml = totalLoss > 0 
        ? `<strong class="text-success">${totalLoss.toFixed(1)} kg lost</strong><br><small>Over ${sortedData.length} entries</small>`
        : `<strong class="text-info">${Math.abs(totalLoss).toFixed(1)} kg gained</strong><br><small>Over ${sortedData.length} entries</small>`;
    $('#total-progress').html(progressHtml);
    
    // Calculate streak (consecutive days with entries)
    const today = new Date();
    let streak = 0;
    const sortedDates = sortedData.map(entry => new Date(entry.entry_date)).sort((a, b) => b - a);
    
    for (let i = 0; i < sortedDates.length; i++) {
        const entryDate = sortedDates[i];
        const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));
        
        if (i === 0 && daysDiff <= 1) {
            streak = 1;
        } else if (i > 0) {
            const prevDate = sortedDates[i-1];
            const daysBetween = Math.floor((prevDate - entryDate) / (1000 * 60 * 60 * 24));
            if (daysBetween <= 2) { // Allow 1 day gap
                streak++;
            } else {
                break;
            }
        }
    }
    
    const streakHtml = streak > 0 
        ? `<strong class="text-success">${streak} day${streak > 1 ? 's' : ''}</strong><br><small>Current logging streak</small>`
        : `<span class="text-muted">No current streak</span><br><small>Log weight to start</small>`;
    $('#streak-counter').html(streakHtml);
    
    // Simple goal achievement (placeholder)
    $('#goals-achieved').html('<span class="text-info">🎯 Goal tracking</span><br><small>Set goals in Data tab</small>');
}