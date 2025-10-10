// Body tab navigation and sub-tab handling

// Function to populate body data cards with values from API
window.populateBodyDataCards = function() {
    // Check if we have global dashboard data
    if (!window.globalDashboardData || !window.globalDashboardData.body_data) {
        console.log('No body data available yet');
        return;
    }

    const bodyData = window.globalDashboardData.body_data;
    const bodyDataHistory = window.globalDashboardData.body_data_history || {};

    // Map of metric types to their display elements
    const metricMap = {
        // Smart Data
        'muscle_mass': { valueId: 'muscle-mass-value', changeIconId: 'muscle-mass-change-icon', changeTextId: 'muscle-mass-change-text' },
        'fat_percent': { valueId: 'fat-percent-value', changeIconId: 'fat-percent-change-icon', changeTextId: 'fat-percent-change-text' },
        'water_percent': { valueId: 'water-percent-value', changeIconId: 'water-percent-change-icon', changeTextId: 'water-percent-change-text' },
        'bone_mass': { valueId: 'bone-mass-value', changeIconId: 'bone-mass-change-icon', changeTextId: 'bone-mass-change-text' },
        // Measurements (Note: HTML uses plural forms: breast, thighs, calves, arms)
        'measurement_neck': { valueId: 'neck-value', changeIconId: 'neck-change-icon', changeTextId: 'neck-change-text' },
        'measurement_chest': { valueId: 'breast-value', changeIconId: 'breast-change-icon', changeTextId: 'breast-change-text' },
        'measurement_waist': { valueId: 'waist-value', changeIconId: 'waist-change-icon', changeTextId: 'waist-change-text' },
        'measurement_hips': { valueId: 'hips-value', changeIconId: 'hips-change-icon', changeTextId: 'hips-change-text' },
        'measurement_thigh': { valueId: 'thighs-value', changeIconId: 'thighs-change-icon', changeTextId: 'thighs-change-text' },
        'measurement_calf': { valueId: 'calves-value', changeIconId: 'calves-change-icon', changeTextId: 'calves-change-text' },
        'measurement_arm': { valueId: 'arms-value', changeIconId: 'arms-change-icon', changeTextId: 'arms-change-text' },
        // Calipers (Note: HTML uses armpit, belly, hip instead of abdomen, thigh, suprailiac)
        'caliper_chest': { valueId: 'caliper-chest-value', changeIconId: 'caliper-chest-change-icon', changeTextId: 'caliper-chest-change-text' },
        'caliper_abdomen': { valueId: 'caliper-armpit-value', changeIconId: 'caliper-armpit-change-icon', changeTextId: 'caliper-armpit-change-text' },
        'caliper_thigh': { valueId: 'caliper-belly-value', changeIconId: 'caliper-belly-change-icon', changeTextId: 'caliper-belly-change-text' },
        'caliper_tricep': { valueId: 'caliper-thigh-value', changeIconId: 'caliper-thigh-change-icon', changeTextId: 'caliper-thigh-change-text' },
        'caliper_suprailiac': { valueId: 'caliper-hip-value', changeIconId: 'caliper-hip-change-icon', changeTextId: 'caliper-hip-change-text' }
    };

    // Populate each metric
    Object.keys(metricMap).forEach(metricType => {
        const metric = bodyData[metricType];
        const ids = metricMap[metricType];

        if (metric) {
            // Display current value with unit in smaller span
            const displayValue = `${metric.value}<span style="font-size: 1rem;">${metric.unit}</span>`;
            $(`#${ids.valueId}`).html(displayValue);

            // Calculate change if we have history
            const history = bodyDataHistory[metricType];
            if (history && history.length >= 2) {
                const latest = parseFloat(history[0].value);
                const previous = parseFloat(history[1].value);
                const change = latest - previous;

                if (change !== 0) {
                    // Determine if change is good or bad based on metric type
                    const isGoodChange = determineGoodChange(metricType, change);

                    // Set icon and color
                    const icon = change > 0 ? '▲' : '▼';
                    const colorClass = isGoodChange ? 'up' : 'down';

                    $(`#${ids.changeIconId}`).text(icon).removeClass('up down').addClass(colorClass);
                    $(`#${ids.changeTextId}`).text(`${Math.abs(change).toFixed(1)}${metric.unit} from last entry`);
                } else {
                    $(`#${ids.changeIconId}`).text('');
                    $(`#${ids.changeTextId}`).text('No change');
                }
            } else {
                // No previous data
                $(`#${ids.changeIconId}`).text('');
                $(`#${ids.changeTextId}`).text('First entry');
            }
        }
    });
}

// Determine if a change is good or bad for a given metric
function determineGoodChange(metricType, change) {
    // Metrics where increase is good
    const increaseIsGood = ['muscle_mass', 'water_percent', 'bone_mass'];
    // Metrics where decrease is good
    const decreaseIsGood = ['fat_percent'];
    // Calipers: decrease is generally good (less body fat)
    const calipersDecreaseGood = metricType.startsWith('caliper_');

    if (increaseIsGood.includes(metricType)) {
        return change > 0;
    } else if (decreaseIsGood.includes(metricType) || calipersDecreaseGood) {
        return change < 0;
    } else {
        // For measurements, neither is inherently good/bad, so base on direction
        // Could be expanded with user goals in future
        return change < 0; // Assume weight loss journey, so smaller measurements = good
    }
}

// Function to populate body data history tables
window.populateBodyDataHistoryTables = function() {
    if (!window.globalDashboardData || !window.globalDashboardData.body_data_history) {
        console.log('No body data history available yet');
        return;
    }

    const bodyDataHistory = window.globalDashboardData.body_data_history;

    // Map of metric types to their tbody IDs
    const historyTableMap = {
        // Smart Data
        'muscle_mass': 'muscle-history-body',
        'fat_percent': 'fat-history-body',
        'water_percent': 'water-history-body',
        'bone_mass': 'bone-history-body',
        // Measurements (Note: HTML uses plural forms: breast, thighs, calves, arms)
        'measurement_neck': 'neck-history-body',
        'measurement_chest': 'breast-history-body',
        'measurement_waist': 'waist-history-body',
        'measurement_hips': 'hips-history-body',
        'measurement_thigh': 'thighs-history-body',
        'measurement_calf': 'calves-history-body',
        'measurement_arm': 'arms-history-body',
        // Calipers (Note: HTML uses armpit, belly, hip, thigh instead of abdomen, thigh, tricep, suprailiac)
        'caliper_chest': 'caliper-chest-history-body',
        'caliper_abdomen': 'caliper-armpit-history-body',
        'caliper_thigh': 'caliper-belly-history-body',
        'caliper_tricep': 'caliper-thigh-history-body',
        'caliper_suprailiac': 'caliper-hip-history-body'
    };

    // Populate each history table
    Object.keys(historyTableMap).forEach(metricType => {
        const tbodyId = historyTableMap[metricType];
        const history = bodyDataHistory[metricType];
        const $tbody = $(`#${tbodyId}`);

        if (!$tbody.length) return; // Skip if tbody doesn't exist

        if (!history || history.length === 0) {
            // No data - show empty message
            return; // Keep default "No data" message
        }

        // Clear existing rows
        $tbody.empty();

        // Add rows for each entry
        history.forEach((entry, index) => {
            const value = parseFloat(entry.value);
            const unit = entry.unit;
            const date = entry.entry_date;

            // Calculate change from previous entry
            let changeHtml = '<span class="text-muted">-</span>';
            if (index < history.length - 1) {
                const previousValue = parseFloat(history[index + 1].value);
                const change = value - previousValue;

                if (change !== 0) {
                    const isGood = determineGoodChange(metricType, change);
                    const icon = change > 0 ? '▲' : '▼';
                    const colorClass = isGood ? 'text-success' : 'text-danger';
                    changeHtml = `<span class="${colorClass}">${icon} ${Math.abs(change).toFixed(1)}${unit}</span>`;
                } else {
                    changeHtml = '<span class="text-muted">No change</span>';
                }
            }

            // Format date (will be formatted by formatAllTimestamps later)
            const timestamp = Math.floor(new Date(date).getTime() / 1000);

            const row = `
                <tr>
                    <td><span class="format-date" data-timestamp="${timestamp}">${date}</span></td>
                    <td><strong>${value}${unit}</strong></td>
                    <td>${changeHtml}</td>
                </tr>
            `;
            $tbody.append(row);
        });
    });

    // Format timestamps after populating
    if (typeof window.formatAllTimestamps === 'function') {
        window.formatAllTimestamps();
    }
};

// Function to populate input date text fields with today's date
function populateBodyDateFields() {
    // Get today's date in ISO format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const isoDate = `${year}-${month}-${day}`;

    // Format using the user's preferred date format
    const formattedDate = window.formatDate ? window.formatDate(isoDate) : isoDate;

    // Get the current language for "Input for" translation
    const lang = $('#language').val() || 'en';
    let inputForText = 'Input for ';
    switch(lang) {
        case 'en': inputForText = 'Input for '; break;
        case 'es': inputForText = 'Entrada para '; break;
        case 'fr': inputForText = 'Saisie pour '; break;
        case 'de': inputForText = 'Eingabe für '; break;
        default: inputForText = 'Input for '; break;
    }

    const dateText = inputForText + formattedDate;

    // Populate all input-date-text fields
    $('.input-date-text').text(dateText);
}

$(function() {
    // Handle Body sub-tabs (Summary/History) clicks
    $('#bodySubTabs a[data-toggle="tab"]').on('click', function (e) {
        const areaId = $(this).attr('href').substring(1); // Remove # from href (summary or history)
        window.location.hash = 'page=body&area=' + areaId;
    });

    // Handle Smart Data sub-tab clicks
    $('#smartDataTabs a[data-toggle="tab"]').on('click', function (e) {
        const subtabId = $(this).attr('href').substring(1); // Remove # from href
        // Determine current area (summary or history)
        const currentArea = $('#bodySubTabs a.active').attr('href').substring(1);
        window.location.hash = 'page=body&area=' + currentArea + '&tab=' + subtabId;
    });

    // Handle Measurements sub-tab clicks
    $('#measurementsTabs a[data-toggle="tab"]').on('click', function (e) {
        const subtabId = $(this).attr('href').substring(1); // Remove # from href
        // Measurements are now in the History area
        window.location.hash = 'page=body&area=history&tab=' + subtabId;
    });

    // Handle Calipers sub-tab clicks
    $('#calipersTabs a[data-toggle="tab"]').on('click', function (e) {
        const subtabId = $(this).attr('href').substring(1); // Remove # from href
        // Calipers are now in the History area
        window.location.hash = 'page=body&area=history&tab=' + subtabId;
    });

    // Handle URL hash on page load for sub-tabs
    function handleSubTabFromURL() {
        const urlHash = window.location.hash;

        // Check if URL has page=body
        if (urlHash.includes('page=body')) {
            const params = new URLSearchParams(urlHash.substring(1)); // Remove # from hash
            const area = params.get('area'); // summary or history
            const tab = params.get('tab'); // specific tab within the area

            // First ensure Body tab is active
            $('#body-tab').tab('show');

            setTimeout(() => {
                // Handle area (Summary/History) - default to summary if not specified
                const targetArea = area || 'summary';
                const areaLink = $('#bodySubTabs a[href="#' + targetArea + '"]');
                if (areaLink.length) {
                    areaLink.tab('show');
                }

                // Handle specific tab within the area if specified
                if (tab) {
                    setTimeout(() => {
                        // Determine which tab group this tab belongs to
                        let tabLink = $('#smartDataTabs a[href="#' + tab + '"]');
                        let isSmartDataTab = tabLink.length > 0;

                        if (!tabLink.length) {
                            tabLink = $('#measurementsTabs a[href="#' + tab + '"]');
                        }
                        if (!tabLink.length) {
                            tabLink = $('#calipersTabs a[href="#' + tab + '"]');
                        }

                        if (tabLink.length) {
                            tabLink.tab('show');
                        }

                        // If we're in History area, ensure all tab groups have defaults active
                        if (targetArea === 'history') {
                            setTimeout(() => {
                                // Ensure Smart Data History has default active
                                const smartDataDefault = $('#smartDataTabs a.nav-link.active');
                                if (!smartDataDefault.length) {
                                    $('#smartDataTabs a[href="#muscle-history"]').addClass('active');
                                    $('#muscle-history').addClass('show active');
                                }

                                // Ensure Measurements History has default active
                                const measurementsDefault = $('#measurementsTabs a.nav-link.active');
                                if (!measurementsDefault.length) {
                                    $('#measurementsTabs a[href="#neck-history"]').addClass('active');
                                    $('#neck-history').addClass('show active');
                                }

                                // Ensure Calipers History has default active
                                const calipersDefault = $('#calipersTabs a.nav-link.active');
                                if (!calipersDefault.length) {
                                    $('#calipersTabs a[href="#caliper-chest-history"]').addClass('active');
                                    $('#caliper-chest-history').addClass('show active');
                                }
                            }, 50);
                        }
                    }, 100);
                } else {
                    // No specific tab specified, ensure defaults are active for the area
                    setTimeout(() => {
                        if (targetArea === 'history') {
                            // Ensure Smart Data History has default active
                            if (!$('#smartDataTabs a.nav-link.active').length) {
                                $('#smartDataTabs a[href="#muscle-history"]').addClass('active');
                                $('#muscle-history').addClass('show active');
                            }
                            // Ensure Measurements History has default active
                            if (!$('#measurementsTabs a.nav-link.active').length) {
                                $('#measurementsTabs a[href="#neck-history"]').addClass('active');
                                $('#neck-history').addClass('show active');
                            }
                            // Ensure Calipers History has default active
                            if (!$('#calipersTabs a.nav-link.active').length) {
                                $('#calipersTabs a[href="#caliper-chest-history"]').addClass('active');
                                $('#caliper-chest-history').addClass('show active');
                            }
                        }
                    }, 150);
                }
            }, 100);
        }
    }

    // Handle sub-tab navigation on page load
    handleSubTabFromURL();

    // Handle browser back/forward buttons
    $(window).on('hashchange', function() {
        handleSubTabFromURL();
    });

    // Populate date fields and body data when Body tab is shown
    $('#body-tab').on('shown.bs.tab', function() {
        populateBodyDateFields();
        populateBodyDataCards();
        window.populateBodyDataHistoryTables();
    });

    // Also populate on initial page load if on Body tab
    if (window.location.hash.includes('page=body')) {
        setTimeout(() => {
            populateBodyDateFields();
            populateBodyDataCards();
            window.populateBodyDataHistoryTables();
        }, 200);
    }

    // Toggle between card-data-body and card-edit-body
    $(document).on('click', '.toggle-edit', function() {
        const card = $(this).closest('.glass-card-small');
        card.find('.card-data-body').hide();
        card.find('.card-edit-body').show();
    });

    $(document).on('click', '.toggle-back', function() {
        const card = $(this).closest('.glass-card-small');
        card.find('.card-edit-body').hide();
        card.find('.card-data-body').show();
    });

    // Handle historical entry forms - separate tracking for each form
    let currentHistoricalMetric1 = null;  // Form 1 - Smart Data
    let currentHistoricalUnit1 = null;
    let currentHistoricalMetric2 = null;  // Form 2 - Measurements
    let currentHistoricalUnit2 = null;
    let currentHistoricalMetric3 = null;  // Form 3 - Calipers
    let currentHistoricalUnit3 = null;

    $(document).on('click', '.btn-add-historical-entry', function() {
        const metricType = $(this).data('metric-type');
        const unit = $(this).data('unit');

        // Determine which form to use based on metric type
        let formId;
        if (metricType.startsWith('muscle_') || metricType.startsWith('fat_') ||
            metricType.startsWith('water_') || metricType.startsWith('bone_')) {
            formId = 'add-historical-entry-form-1'; // Smart Data
            currentHistoricalMetric1 = metricType;
            currentHistoricalUnit1 = unit;
        } else if (metricType.startsWith('measurement_')) {
            formId = 'add-historical-entry-form-2'; // Measurements
            currentHistoricalMetric2 = metricType;
            currentHistoricalUnit2 = unit;
        } else if (metricType.startsWith('caliper_')) {
            formId = 'add-historical-entry-form-3'; // Calipers
            currentHistoricalMetric3 = metricType;
            currentHistoricalUnit3 = unit;
        } else {
            formId = 'add-historical-entry-form-1'; // Default
            currentHistoricalMetric1 = metricType;
            currentHistoricalUnit1 = unit;
        }

        // Get the form number (1, 2, or 3)
        const formNum = formId.slice(-1);

        // Set label based on metric type
        const metricName = metricType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        $(`#historical-entry-label-${formNum}`).text(`${metricName} (${unit})`);

        // Clear previous values
        $(`#historical-entry-date-${formNum}`).val('');
        $(`#historical-entry-value-${formNum}`).val('');

        // Hide all forms first
        $('#add-historical-entry-form-1, #add-historical-entry-form-2, #add-historical-entry-form-3').addClass('hidden');

        // Show the appropriate form
        $(`#${formId}`).removeClass('hidden');

        // Scroll to form
        $(`#${formId}`)[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    // Handle tab changes - update form if it's open
    $(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function (e) {
        const targetTab = $(e.target).attr('href'); // e.g., #caliper-chest-history

        // Determine which form group this tab belongs to and if form is visible
        if (targetTab && targetTab.includes('-history')) {
            let formNum;
            let metricType;
            let unit;

            // Smart Data tabs
            if (targetTab === '#muscle-history') {
                formNum = 1;
                metricType = 'muscle_mass';
                unit = '%';
            } else if (targetTab === '#fat-history') {
                formNum = 1;
                metricType = 'fat_percent';
                unit = '%';
            } else if (targetTab === '#water-history') {
                formNum = 1;
                metricType = 'water_percent';
                unit = '%';
            } else if (targetTab === '#bone-history') {
                formNum = 1;
                metricType = 'bone_mass';
                unit = 'kg';
            }
            // Measurements tabs
            else if (targetTab === '#neck-history') {
                formNum = 2;
                metricType = 'measurement_neck';
                unit = 'cm';
            } else if (targetTab === '#breast-history') {
                formNum = 2;
                metricType = 'measurement_chest';
                unit = 'cm';
            } else if (targetTab === '#waist-history') {
                formNum = 2;
                metricType = 'measurement_waist';
                unit = 'cm';
            } else if (targetTab === '#hips-history') {
                formNum = 2;
                metricType = 'measurement_hips';
                unit = 'cm';
            } else if (targetTab === '#thighs-history') {
                formNum = 2;
                metricType = 'measurement_thigh';
                unit = 'cm';
            } else if (targetTab === '#calves-history') {
                formNum = 2;
                metricType = 'measurement_calf';
                unit = 'cm';
            } else if (targetTab === '#arms-history') {
                formNum = 2;
                metricType = 'measurement_arm';
                unit = 'cm';
            }
            // Caliper tabs
            else if (targetTab === '#caliper-chest-history') {
                formNum = 3;
                metricType = 'caliper_chest';
                unit = 'mm';
            } else if (targetTab === '#caliper-armpit-history') {
                formNum = 3;
                metricType = 'caliper_abdomen';
                unit = 'mm';
            } else if (targetTab === '#caliper-belly-history') {
                formNum = 3;
                metricType = 'caliper_thigh';
                unit = 'mm';
            } else if (targetTab === '#caliper-hip-history') {
                formNum = 3;
                metricType = 'caliper_suprailiac';
                unit = 'mm';
            } else if (targetTab === '#caliper-thigh-history') {
                formNum = 3;
                metricType = 'caliper_tricep';
                unit = 'mm';
            }

            // If we found a matching tab and its form is visible, update it
            if (formNum && metricType && !$(`#add-historical-entry-form-${formNum}`).hasClass('hidden')) {
                // Update the appropriate form's variables
                if (formNum === 1) {
                    currentHistoricalMetric1 = metricType;
                    currentHistoricalUnit1 = unit;
                } else if (formNum === 2) {
                    currentHistoricalMetric2 = metricType;
                    currentHistoricalUnit2 = unit;
                } else if (formNum === 3) {
                    currentHistoricalMetric3 = metricType;
                    currentHistoricalUnit3 = unit;
                }

                const metricName = metricType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                $(`#historical-entry-label-${formNum}`).text(`${metricName} (${unit})`);
            }
        }
    });

    // Cancel buttons for all three forms
    $('#btn-cancel-historical-entry-1').on('click', function() {
        $('#add-historical-entry-form-1').addClass('hidden');
    });
    $('#btn-cancel-historical-entry-2').on('click', function() {
        $('#add-historical-entry-form-2').addClass('hidden');
    });
    $('#btn-cancel-historical-entry-3').on('click', function() {
        $('#add-historical-entry-form-3').addClass('hidden');
    });

    // Save buttons for all three forms
    $('#btn-save-historical-entry-1').on('click', function() {
        const dateInput = $('#historical-entry-date-1').val();
        const value = $('#historical-entry-value-1').val();

        if (!dateInput || !value || parseFloat(value) <= 0) {
            if (window.showAlert) {
                window.showAlert('Please enter a valid date and value', 'danger');
            } else {
                alert('Please enter a valid date and value');
            }
            return;
        }

        const date = window.convertDateToISO ? window.convertDateToISO(dateInput) : dateInput;
        saveBodyMetricHistorical(currentHistoricalMetric1, value, currentHistoricalUnit1, date, 1);
    });

    $('#btn-save-historical-entry-2').on('click', function() {
        const dateInput = $('#historical-entry-date-2').val();
        const value = $('#historical-entry-value-2').val();

        if (!dateInput || !value || parseFloat(value) <= 0) {
            if (window.showAlert) {
                window.showAlert('Please enter a valid date and value', 'danger');
            } else {
                alert('Please enter a valid date and value');
            }
            return;
        }

        const date = window.convertDateToISO ? window.convertDateToISO(dateInput) : dateInput;
        saveBodyMetricHistorical(currentHistoricalMetric2, value, currentHistoricalUnit2, date, 2);
    });

    $('#btn-save-historical-entry-3').on('click', function() {
        const dateInput = $('#historical-entry-date-3').val();
        const value = $('#historical-entry-value-3').val();

        if (!dateInput || !value || parseFloat(value) <= 0) {
            if (window.showAlert) {
                window.showAlert('Please enter a valid date and value', 'danger');
            } else {
                alert('Please enter a valid date and value');
            }
            return;
        }

        const date = window.convertDateToISO ? window.convertDateToISO(dateInput) : dateInput;
        saveBodyMetricHistorical(currentHistoricalMetric3, value, currentHistoricalUnit3, date, 3);
    });

    // Handle save button clicks for all body metrics
    // Smart Data
    $('#btn-save-muscle-mass').on('click', function() { saveBodyMetric('muscle_mass', '#muscle-mass-input', '%'); });
    $('#btn-save-fat-percent').on('click', function() { saveBodyMetric('fat_percent', '#fat-percent-input', '%'); });
    $('#btn-save-water-percent').on('click', function() { saveBodyMetric('water_percent', '#water-percent-input', '%'); });
    $('#btn-save-bone-mass').on('click', function() { saveBodyMetric('bone_mass', '#bone-mass-input', 'kg'); });

    // Measurements
    $('#btn-save-neck').on('click', function() { saveBodyMetric('measurement_neck', '#neck-input', 'cm'); });
    $('#btn-save-breast').on('click', function() { saveBodyMetric('measurement_chest', '#breast-input', 'cm'); });
    $('#btn-save-waist').on('click', function() { saveBodyMetric('measurement_waist', '#waist-input', 'cm'); });
    $('#btn-save-hips').on('click', function() { saveBodyMetric('measurement_hips', '#hips-input', 'cm'); });
    $('#btn-save-thighs').on('click', function() { saveBodyMetric('measurement_thigh', '#thighs-input', 'cm'); });
    $('#btn-save-calves').on('click', function() { saveBodyMetric('measurement_calf', '#calves-input', 'cm'); });
    $('#btn-save-arms').on('click', function() { saveBodyMetric('measurement_arm', '#arms-input', 'cm'); });

    // Calipers
    $('#btn-save-caliper-chest').on('click', function() { saveBodyMetric('caliper_chest', '#caliper-chest', 'mm'); });
    $('#btn-save-caliper-armpit').on('click', function() { saveBodyMetric('caliper_abdomen', '#caliper-armpit', 'mm'); });
    $('#btn-save-caliper-belly').on('click', function() { saveBodyMetric('caliper_thigh', '#caliper-belly', 'mm'); });
    $('#btn-save-caliper-thigh').on('click', function() { saveBodyMetric('caliper_tricep', '#caliper-thigh', 'mm'); });
    $('#btn-save-caliper-hip').on('click', function() { saveBodyMetric('caliper_suprailiac', '#caliper-hip', 'mm'); });
});

// Function to save body metric data
function saveBodyMetric(metricType, inputSelector, unit) {
    const value = $(inputSelector).val();

    // Validate input
    if (!value || value === '' || parseFloat(value) <= 0) {
        if (window.showAlert) {
            window.showAlert('Please enter a valid value', 'danger');
        } else {
            alert('Please enter a valid value');
        }
        return;
    }

    // Get today's date
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const entryDate = `${year}-${month}-${day}`;

    // Send to API
    if (window.postRequest) {
        window.postRequest('router.php?controller=profile', {
            action: 'save_body_data',
            metric_type: metricType,
            value: parseFloat(value),
            unit: unit,
            entry_date: entryDate
        })
        .then(resp => {
            const result = window.parseJson ? window.parseJson(resp) : JSON.parse(resp);

            if (result.success) {
                // Show success message
                if (window.showAlert) {
                    window.showAlert('Body data saved successfully!', 'success');
                }

                // Clear input
                $(inputSelector).val('');

                // Reload dashboard data to refresh cards and tables
                if (window.testConsolidatedDashboardData) {
                    window.testConsolidatedDashboardData(function() {
                        window.populateBodyDataCards();
                        window.populateBodyDataHistoryTables();
                    });
                }

                // Hide edit mode, show data mode
                const card = $(inputSelector).closest('.glass-card-small');
                card.find('.card-edit-body').hide();
                card.find('.card-data-body').show();
            } else {
                if (window.showAlert) {
                    window.showAlert(result.message || 'Failed to save body data', 'danger');
                } else {
                    alert(result.message || 'Failed to save body data');
                }
            }
        })
        .catch(err => {
            console.error('Error saving body data:', err);
            if (window.showAlert) {
                window.showAlert('Error saving body data', 'danger');
            } else {
                alert('Error saving body data');
            }
        });
    } else {
        console.error('postRequest function not available');
        alert('Unable to save - postRequest function not available');
    }
}

// Function to save historical body metric data (from inline form)
function saveBodyMetricHistorical(metricType, value, unit, entryDate, formNum) {
    // Send to API
    if (window.postRequest) {
        window.postRequest('router.php?controller=profile', {
            action: 'save_body_data',
            metric_type: metricType,
            value: parseFloat(value),
            unit: unit,
            entry_date: entryDate
        })
        .then(resp => {
            const result = window.parseJson ? window.parseJson(resp) : JSON.parse(resp);

            if (result.success) {
                // Show success message
                if (window.showAlert) {
                    window.showAlert('Historical entry saved successfully!', 'success');
                }

                // Hide the appropriate form
                $(`#add-historical-entry-form-${formNum}`).addClass('hidden');

                // Reload dashboard data to refresh tables
                if (window.testConsolidatedDashboardData) {
                    window.testConsolidatedDashboardData(function() {
                        window.populateBodyDataCards();
                        window.populateBodyDataHistoryTables();
                    });
                }
            } else {
                if (window.showAlert) {
                    window.showAlert(result.message || 'Failed to save historical entry', 'danger');
                } else {
                    alert(result.message || 'Failed to save historical entry');
                }
            }
        })
        .catch(err => {
            console.error('Error saving historical entry:', err);
            if (window.showAlert) {
                window.showAlert('Error saving historical entry', 'danger');
            } else {
                alert('Error saving historical entry');
            }
        });
    } else {
        console.error('postRequest function not available');
        alert('Unable to save - postRequest function not available');
    }
}
