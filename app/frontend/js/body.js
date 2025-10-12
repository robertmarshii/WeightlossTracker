// Body tab navigation and sub-tab handling

// Function to populate body data cards with values from API
window.populateBodyDataCards = function() {
    // Check if we have global dashboard data
    if (!window.globalDashboardData || !window.globalDashboardData.body_data) {
        debugLog('📊 Body: No body data available yet');
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
                    $(`#${ids.changeTextId}`).text(`${Math.abs(change).toFixed(1)}${metric.unit} ${t('from last entry')}`);
                } else {
                    $(`#${ids.changeIconId}`).text('');
                    $(`#${ids.changeTextId}`).text(t('No change'));
                }
            } else {
                // No previous data
                $(`#${ids.changeIconId}`).text('');
                $(`#${ids.changeTextId}`).text(t('First entry'));
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
        debugLog('📊 Body: No body data history available yet');
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
        // Only generate insights if data is available
        if (window.globalDashboardData && window.globalDashboardData.body_data_history) {
            window.generateBodyInsights();
            window.generateMeasurementInsights();
            window.generateCaliperInsights();
        }
    });

    // Also populate on initial page load if on Body tab
    // Wait for data to load first by checking for it
    if (window.location.hash.includes('page=body')) {
        const waitForData = setInterval(() => {
            if (window.globalDashboardData && window.globalDashboardData.body_data_history) {
                clearInterval(waitForData);
                populateBodyDateFields();
                populateBodyDataCards();
                window.populateBodyDataHistoryTables();
                window.generateBodyInsights();
                window.generateMeasurementInsights();
                window.generateCaliperInsights();
            }
        }, 100);

        // Timeout after 5 seconds to prevent infinite loop
        setTimeout(() => {
            clearInterval(waitForData);
        }, 5000);
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

    // Collapsible card toggle for insights
    $(document).on('click', '.card-header-collapsible', function() {
        const $header = $(this);
        const $card = $header.closest('.collapsible-card');
        const targetId = $header.data('toggle-target');
        const $content = $('#' + targetId);
        const $toggle = $header.find('.card-toggle');

        if ($content.is(':visible')) {
            $content.slideUp(300);
            $toggle.text('+');
            $card.addClass('collapsed');
        } else {
            $content.slideDown(300);
            $toggle.text('−');
            $card.removeClass('collapsed');
        }
    });
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
                        window.generateBodyInsights();
                        window.generateMeasurementInsights();
                        window.generateCaliperInsights();
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
                        window.generateBodyInsights();
                        window.generateMeasurementInsights();
                        window.generateCaliperInsights();
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

// Function to generate insights from body composition data
window.generateBodyInsights = function() {
    // Check if we have global dashboard data
    if (!window.globalDashboardData || !window.globalDashboardData.body_data_history) {
        debugLog('💡 Body Insights: No body data history available yet');
        return;
    }

    const history = window.globalDashboardData.body_data_history;
    const insights = [];

    debugLog('💡 Body Insights: Analyzing data...', history);

    // Get the latest and previous values for each metric
    const muscleMass = history.muscle_mass || [];
    const fatPercent = history.fat_percent || [];
    const waterPercent = history.water_percent || [];
    const boneMass = history.bone_mass || [];

    debugLog('💡 Body Insights: Data points found', {
        muscleMass: muscleMass.length,
        fatPercent: fatPercent.length,
        waterPercent: waterPercent.length,
        boneMass: boneMass.length
    });

    // Check if we have at least 2 data points for trend analysis
    const hasMuscleTrend = muscleMass.length >= 2;
    const hasFatTrend = fatPercent.length >= 2;
    const hasWaterTrend = waterPercent.length >= 2;
    const hasBoneTrend = boneMass.length >= 2;

    // Calculate trends (comparing current to worst/best ever recorded)
    let muscleTrend = null, fatTrend = null, waterTrend = null, boneTrend = null;

    if (hasMuscleTrend) {
        const current = parseFloat(muscleMass[0].value);
        // For muscle: worst = lowest ever, we want to show improvement from lowest
        const worst = Math.min(...muscleMass.map(m => parseFloat(m.value)));
        muscleTrend = current - worst;
        debugLog('💡 Body Insights: Muscle trend', { current, worst, trend: muscleTrend });
    }

    if (hasFatTrend) {
        const current = parseFloat(fatPercent[0].value);
        // For fat: worst = highest ever, we want to show reduction from highest
        const worst = Math.max(...fatPercent.map(f => parseFloat(f.value)));
        fatTrend = current - worst;
        debugLog('💡 Body Insights: Fat trend', { current, worst, trend: fatTrend });
    }

    if (hasWaterTrend) {
        const current = parseFloat(waterPercent[0].value);
        // For water: worst = lowest ever, we want to show improvement from lowest
        const worst = Math.min(...waterPercent.map(w => parseFloat(w.value)));
        waterTrend = current - worst;
        debugLog('💡 Body Insights: Water trend', { current, worst, trend: waterTrend });
    }

    if (hasBoneTrend) {
        const current = parseFloat(boneMass[0].value);
        // For bone: worst = lowest ever, we want to show improvement from lowest
        const worst = Math.min(...boneMass.map(b => parseFloat(b.value)));
        boneTrend = current - worst;
        debugLog('💡 Body Insights: Bone trend', { current, worst, trend: boneTrend });
    }

    // Generate insights based on trends

    // Overall trend analysis - all possible combinations
    if (muscleTrend !== null && fatTrend !== null) {
        if (muscleTrend > 0 && fatTrend < 0) {
            // Best case: gaining muscle, losing fat
            insights.push({
                title: t("You're trending in a healthy direction."),
                description: t("Muscle ↑ and Fat ↓ indicates your training and/or diet are effective.")
            });
            insights.push({
                title: t("Body recomposition in progress."),
                description: t("Even if total body weight isn't changing much, increasing muscle and reducing fat improves metabolism, posture, and energy use efficiency.")
            });
        } else if (muscleTrend > 0 && fatTrend > 0) {
            // Bulking phase
            insights.push({
                title: t("Both muscle and fat are increasing."),
                description: t("You're gaining mass overall. Consider adjusting calorie intake if fat gain is not desired.")
            });
        } else if (muscleTrend < 0 && fatTrend < 0) {
            // Cutting phase
            insights.push({
                title: t("Both muscle and fat are decreasing."),
                description: t("You're in a caloric deficit. Ensure adequate protein intake to preserve muscle mass.")
            });
        } else if (muscleTrend < 0 && fatTrend > 0) {
            // Worst case: losing muscle, gaining fat
            insights.push({
                title: t("Muscle loss with fat gain detected."),
                description: t("Consider increasing protein intake and resistance training to preserve muscle mass.")
            });
        } else if (muscleTrend === 0 && fatTrend < 0) {
            // Maintaining muscle, losing fat
            insights.push({
                title: t("Fat loss while maintaining muscle."),
                description: t("You're preserving muscle mass while reducing fat. This is excellent progress for body recomposition.")
            });
        } else if (muscleTrend === 0 && fatTrend > 0) {
            // Maintaining muscle, gaining fat
            insights.push({
                title: t("Fat gain with stable muscle."),
                description: t("Your muscle mass is stable but fat is increasing. Review your calorie intake and activity level.")
            });
        } else if (muscleTrend > 0 && fatTrend === 0) {
            // Gaining muscle, maintaining fat
            insights.push({
                title: t("Muscle gain with stable fat."),
                description: t("You're building muscle without adding fat. This is ideal for lean gains.")
            });
        } else if (muscleTrend < 0 && fatTrend === 0) {
            // Losing muscle, maintaining fat
            insights.push({
                title: t("Muscle loss with stable fat."),
                description: t("You're losing muscle without losing fat. Increase protein intake and add resistance training.")
            });
        } else if (muscleTrend === 0 && fatTrend === 0) {
            // No changes
            insights.push({
                title: t("Body composition is stable."),
                description: t("Your muscle and fat percentages are maintaining. If you have goals, consider adjusting your diet or training program.")
            });
        }
    } else if (muscleTrend !== null && fatTrend === null) {
        // Only muscle data available
        if (muscleTrend > 0) {
            insights.push({
                title: t("Muscle mass is increasing."),
                description: t("Your muscle percentage is trending upward. Track fat percentage to see the complete picture of your body composition.")
            });
        } else if (muscleTrend < 0) {
            insights.push({
                title: t("Muscle mass is decreasing."),
                description: t("Your muscle percentage is declining. Consider increasing protein intake and resistance training.")
            });
        } else {
            insights.push({
                title: t("Muscle mass is stable."),
                description: t("Your muscle percentage is maintaining at current levels.")
            });
        }
    } else if (muscleTrend === null && fatTrend !== null) {
        // Only fat data available
        if (fatTrend > 0) {
            insights.push({
                title: t("Body fat is increasing."),
                description: t("Your body fat percentage is trending upward. Track muscle mass to understand if this is affecting lean mass.")
            });
        } else if (fatTrend < 0) {
            insights.push({
                title: t("Body fat is decreasing."),
                description: t("Your body fat percentage is trending downward. Track muscle mass to ensure you're preserving lean tissue.")
            });
        } else {
            insights.push({
                title: t("Body fat is stable."),
                description: t("Your body fat percentage is maintaining at current levels.")
            });
        }
    }

    // Water percentage insight - comprehensive coverage
    if (waterPercent.length > 0) {
        const currentWater = parseFloat(waterPercent[0].value);

        if (waterTrend !== null) {
            // Water trend available
            if (waterTrend > 0 && muscleTrend !== null && muscleTrend > 0) {
                insights.push({
                    title: t("Hydration looks solid."),
                    description: t("The combination of muscle ↑ and water ↑ is normal — muscle retains more intracellular water than fat. A") + ` ${currentWater.toFixed(1)}` + t("% water level is healthy.")
                });
            } else if (waterTrend > 0) {
                insights.push({
                    title: t("Hydration is improving."),
                    description: `Your water percentage increased to ${currentWater.toFixed(1)}%. This may indicate better hydration or increased muscle mass.`
                });
            } else if (waterTrend < 0 && currentWater < 50) {
                insights.push({
                    title: t("Hydration declining."),
                    description: `Your water percentage dropped to ${currentWater.toFixed(1)}%. Ensure adequate water intake, especially around training.`
                });
            } else if (waterTrend < 0 && fatTrend !== null && fatTrend > 0) {
                insights.push({
                    title: t("Water percentage decreasing."),
                    description: `Water ↓ combined with fat ↑ is expected — fat tissue contains less water than muscle. Current: ${currentWater.toFixed(1)}%.`
                });
            } else if (waterTrend === 0) {
                insights.push({
                    title: t("Hydration is stable."),
                    description: `Your water percentage is maintaining at ${currentWater.toFixed(1)}%.`
                });
            }
        } else {
            // No trend, just current value assessment
            if (currentWater >= 50 && currentWater <= 65) {
                insights.push({
                    title: t("Hydration is within healthy range."),
                    description: `Your ${currentWater.toFixed(1)}% water level indicates good hydration status.`
                });
            } else if (currentWater < 50) {
                insights.push({
                    title: t("Hydration may be low."),
                    description: `At ${currentWater.toFixed(1)}%, consider increasing water intake for optimal performance and recovery.`
                });
            } else if (currentWater > 65) {
                insights.push({
                    title: t("Hydration is high."),
                    description: `Your ${currentWater.toFixed(1)}% water level is above typical range. This could indicate high muscle mass or recent hydration.`
                });
            }
        }
    }

    // Bone mass insight - all trend variations
    if (boneMass.length > 0) {
        const currentBone = parseFloat(boneMass[0].value);

        if (boneTrend !== null) {
            if (boneTrend > 0) {
                insights.push({
                    title: t("Bone Mass Increasing."),
                    description: t("Your bone mass increased to") + ` ${currentBone.toFixed(1)}` + t("kg. This can come from strength training, calcium/vitamin D intake, or reduced inflammation.")
                });
            } else if (boneTrend < 0) {
                insights.push({
                    title: t("Bone Mass Decreasing."),
                    description: `Your bone mass decreased to ${currentBone.toFixed(1)}kg. Ensure adequate calcium, vitamin D, and weight-bearing exercise.`
                });
            } else if (boneTrend === 0) {
                insights.push({
                    title: t("Bone Mass Stable."),
                    description: `Maintaining bone mass at ${currentBone.toFixed(1)}kg is important for long-term health. Keep up with resistance training and adequate calcium intake.`
                });
            }
        } else {
            // No trend data, just current value
            insights.push({
                title: t("Bone Mass Recorded."),
                description: `Your current bone mass is ${currentBone.toFixed(1)}kg. Track this over time to monitor skeletal health.`
            });
        }
    }

    // Advanced insights using profile data (height, weight, age)
    const profile = window.globalDashboardData.profile;
    const latestWeight = window.globalDashboardData.latest_weight;

    if (profile && latestWeight && muscleMass.length > 0 && fatPercent.length > 0) {
        const currentWeight = parseFloat(latestWeight.weight_kg);
        const currentMuscle = parseFloat(muscleMass[0].value);
        const currentFat = parseFloat(fatPercent[0].value);
        const currentWater = waterPercent.length > 0 ? parseFloat(waterPercent[0].value) : 0;
        const currentBone = boneMass.length > 0 ? parseFloat(boneMass[0].value) : 0;

        // Calculate body composition masses
        const muscleMassKg = (currentWeight * currentMuscle / 100).toFixed(1);
        const fatMassKg = (currentWeight * currentFat / 100).toFixed(1);
        const waterMassKg = (currentWeight * currentWater / 100).toFixed(1);
        const leanBodyMass = (currentWeight - parseFloat(fatMassKg)).toFixed(1);

        // Body composition breakdown
        insights.push({
            title: t("Body Composition Breakdown"),
            description: t("You have") + ` ${muscleMassKg}` + t("kg of muscle") + `, ${fatMassKg}` + t("kg of fat") + `, ` + t("and") + ` ${leanBodyMass}` + t("kg of lean mass") + `. ` + t("This gives you a strong foundation for recomposition.")
        });

        // Body fat category insight (for men age 40)
        if (profile.age >= 30 && profile.age <= 50) {
            if (currentFat >= 18 && currentFat <= 24) {
                insights.push({
                    title: t("Body Fat in Healthy Range"),
                    description: `Your ${currentFat.toFixed(1)}% body fat is within the healthy range (18-24%) for men aged ${profile.age}.`
                });
            } else if (currentFat > 24 && currentFat <= 30) {
                const toHealthy = (currentFat - 24).toFixed(1);
                insights.push({
                    title: t("Mild Excess Body Fat"),
                    description: `At ${currentFat.toFixed(1)}%, you're ${toHealthy}% above the healthy range. Your high muscle % shows a strong frame with room for recomposition rather than strict weight loss.`
                });
            } else if (currentFat > 30) {
                const toHealthy = (currentFat - 24).toFixed(1);
                insights.push({
                    title: t("Body Fat Above Healthy Range"),
                    description: `Reducing body fat by ${toHealthy}% would bring you into the healthy range (18-24%) while preserving your muscle mass.`
                });
            }
        }

        // Muscle-to-Fat Ratio
        const muscleToFatRatio = (currentMuscle / currentFat).toFixed(2);
        if (muscleToFatRatio > 1.5) {
            insights.push({
                title: t("Strong Muscle-to-Fat Ratio"),
                description: t("Your muscle-to-fat ratio of") + ` ${muscleToFatRatio}` + t(":1 indicates excellent body composition. Continue with your training program.")
            });
        } else if (muscleToFatRatio >= 1.0) {
            insights.push({
                title: t("Good Muscle-to-Fat Ratio"),
                description: `At ${muscleToFatRatio}:1, your muscle-to-fat ratio is balanced. Focus on maintaining muscle while reducing fat for optimal health.`
            });
        }

        // Trend forecasting - fat loss rate
        if (hasFatTrend && fatPercent.length >= 3) {
            const fatChanges = [];
            for (let i = 0; i < Math.min(3, fatPercent.length - 1); i++) {
                const current = parseFloat(fatPercent[i].value);
                const previous = parseFloat(fatPercent[i + 1].value);
                fatChanges.push(current - previous);
            }
            const avgFatChange = fatChanges.reduce((a, b) => a + b, 0) / fatChanges.length;

            if (avgFatChange < 0) {
                const targetFat = 22; // Healthy target
                const weeksToTarget = Math.ceil((currentFat - targetFat) / Math.abs(avgFatChange));
                if (weeksToTarget > 0 && weeksToTarget < 52) {
                    insights.push({
                        title: t("Fat Loss Forecast"),
                        description: t("At your current rate of") + ` ${Math.abs(avgFatChange).toFixed(1)}` + t("% fat loss per entry, you could reach") + ` ${targetFat}` + t("% body fat in approximately") + ` ${weeksToTarget}` + ` ` + t("weeks") + `.`
                    });
                }
            }
        }
    }

    // If no trends available, show encouragement
    if (insights.length === 0) {
        insights.push({
            title: t("Keep tracking your progress!"),
            description: t("Log multiple entries over time to see personalized insights about your body composition trends.")
        });
    }

    debugLog('💡 Body Insights: Generated ' + insights.length + ' insights', insights);

    // Render insights
    renderBodyInsights(insights);
};

// Function to render insights into the insights card
function renderBodyInsights(insights) {
    const $insightsContent = $('#body-insights-content');

    debugLog('💡 Body Insights: Rendering insights...', {
        insightsCount: insights ? insights.length : 0,
        elementFound: $insightsContent.length > 0
    });

    if (!insights || insights.length === 0) {
        $insightsContent.html('<p class="text-muted">Log your body composition data to see personalized insights.</p>');
        return;
    }

    let html = '';
    insights.forEach(insight => {
        html += `
            <div class="insight-item mb-3">
                <h6 class="insight-title mb-1">${insight.title}</h6>
                <p class="insight-description mb-0">${insight.description}</p>
            </div>
        `;
    });

    $insightsContent.html(html);
    debugLog('💡 Body Insights: Rendered successfully');
}

// Function to generate insights from body measurements
window.generateMeasurementInsights = function() {
    debugLog('📏 Measurement Insights: Function called');

    // Check if we have global dashboard data with body data history
    if (!window.globalDashboardData || !window.globalDashboardData.body_data_history) {
        debugLog('📏 Measurement Insights: No body data history available yet', {
            hasGlobalData: !!window.globalDashboardData,
            hasBodyDataHistory: !!(window.globalDashboardData && window.globalDashboardData.body_data_history)
        });
        return;
    }

    const history = window.globalDashboardData.body_data_history;
    const profile = window.globalDashboardData.profile;
    const insights = [];

    debugLog('📏 Measurement Insights: Analyzing data...', {
        historyKeys: Object.keys(history),
        profileExists: !!profile,
        waistLength: history.measurement_waist ? history.measurement_waist.length : 0,
        hipsLength: history.measurement_hips ? history.measurement_hips.length : 0,
        neckLength: history.measurement_neck ? history.measurement_neck.length : 0
    });

    // Get measurement data
    const waist = history.measurement_waist || [];
    const hips = history.measurement_hips || [];
    const neck = history.measurement_neck || [];
    const chest = history.measurement_chest || [];
    const thighs = history.measurement_thigh || [];
    const arms = history.measurement_arm || [];

    // Check for trends (need at least 2 data points)
    const hasWaistTrend = waist.length >= 2;
    const hasHipsTrend = hips.length >= 2;
    const hasNeckTrend = neck.length >= 2;

    debugLog('📏 Measurement Insights: Trend checks', {
        hasWaistTrend,
        hasHipsTrend,
        hasNeckTrend,
        waistData: waist.slice(0, 2),
        hipsData: hips.slice(0, 2),
        neckData: neck.slice(0, 2)
    });

    // Calculate trends (comparing current to worst/highest ever recorded)
    let waistChange = null, hipsChange = null, neckChange = null;

    if (hasWaistTrend) {
        const current = parseFloat(waist[0].value);
        // For waist: worst = highest ever, we want to show reduction from highest
        const worst = Math.max(...waist.map(w => parseFloat(w.value)));
        waistChange = current - worst;
        debugLog('📏 Measurement Insights: Waist change calculated', { current, worst, waistChange });
    }

    if (hasHipsTrend) {
        const current = parseFloat(hips[0].value);
        // For hips: worst = highest ever, we want to show reduction from highest
        const worst = Math.max(...hips.map(h => parseFloat(h.value)));
        hipsChange = current - worst;
        debugLog('📏 Measurement Insights: Hips change calculated', { current, worst, hipsChange });
    }

    if (hasNeckTrend) {
        const current = parseFloat(neck[0].value);
        // For neck: worst = highest ever, we want to show reduction from highest
        const worst = Math.max(...neck.map(n => parseFloat(n.value)));
        neckChange = current - worst;
        debugLog('📏 Measurement Insights: Neck change calculated', { current, worst, neckChange });
    }

    // Insight 1: Overall measurement changes (both gain and loss)
    if (waistChange !== null && hipsChange !== null) {
        const avgChange = (waistChange + hipsChange) / 2;

        if (waistChange < 0 && hipsChange < 0) {
            // Both reducing - fat loss
            debugLog('📏 Measurement Insights: Adding Insight 1a - Fat Reduction');
            insights.push({
                title: t("Fat Reduction Is Ongoing and Controlled"),
                description: t("Your waist dropped") + ` ${Math.abs(waistChange).toFixed(1)} ` + t("cm and hips dropped") + ` ${Math.abs(hipsChange).toFixed(1)} ` + t("cm overall — a strong indicator of steady fat loss, not just water fluctuation.")
            });
        } else if (waistChange > 0 && hipsChange > 0) {
            // Both increasing - fat gain
            debugLog('📏 Measurement Insights: Adding Insight 1b - Measurements Increasing');
            insights.push({
                title: t("Waist and Hip Measurements Increasing"),
                description: `Your waist increased ${waistChange.toFixed(1)} cm and hips increased ${hipsChange.toFixed(1)} cm. This indicates fat gain. Review your nutrition and activity levels.`
            });
        } else if (Math.abs(avgChange) < 0.5) {
            // Minimal change - maintenance
            debugLog('📏 Measurement Insights: Adding Insight 1c - Stable Measurements');
            insights.push({
                title: t("Stable Body Measurements"),
                description: `Your waist and hip measurements are relatively stable. You're maintaining your current body composition.`
            });
        } else {
            // Mixed changes
            debugLog('📏 Measurement Insights: Adding Insight 1d - Mixed Changes');
            const waistDirection = waistChange < 0 ? "decreased" : "increased";
            const hipsDirection = hipsChange < 0 ? "decreased" : "increased";
            insights.push({
                title: t("Mixed Measurement Changes"),
                description: `Waist ${waistDirection} ${Math.abs(waistChange).toFixed(1)} cm while hips ${hipsDirection} ${Math.abs(hipsChange).toFixed(1)} cm. This mixed pattern may indicate changes in fat distribution.`
            });
        }
    } else {
        debugLog('📏 Measurement Insights: Insight 1 condition not met - insufficient data', {
            waistChangeNotNull: waistChange !== null,
            hipsChangeNotNull: hipsChange !== null
        });
    }

    // Insight 2: Waist-to-height ratio (with trend context)
    if (waist.length > 0 && profile && profile.height_cm) {
        debugLog('📏 Measurement Insights: Processing Insight 2 - Waist-to-Height Ratio');
        const currentWaist = parseFloat(waist[0].value);
        const height = parseFloat(profile.height_cm);
        const waistToHeightRatio = (currentWaist / height).toFixed(2);

        if (waistToHeightRatio > 0.5) {
            debugLog('📏 Measurement Insights: Adding Insight 2a - Above ideal ratio');
            const targetWaist = (height * 0.5).toFixed(0);

            if (waistChange && waistChange < 0) {
                // Reducing - good progress
                const weeksToTarget = Math.ceil((currentWaist - targetWaist) / Math.abs(waistChange));
                insights.push({
                    title: t("Central Fat Loss = Better Metabolic Health"),
                    description: t("Waist-to-height ratio =") + ` ${(currentWaist).toFixed(0)} / ${height} = ${waistToHeightRatio}` + t(", which is above the ideal (<0.5). Dropping below") + ` ${targetWaist} ` + t("cm waist will move you into the \"low-risk\" zone. At your current pace, this could take") + ` ${weeksToTarget} ` + t("weeks.")
                });
            } else if (waistChange && waistChange > 0) {
                // Increasing - warning
                insights.push({
                    title: t("Waist-to-Height Ratio Above Ideal"),
                    description: `Waist-to-height ratio = ${waistToHeightRatio}, which is above the ideal (<0.5) and increasing. Target: below ${targetWaist} cm. Focus on reducing waist measurement for better metabolic health.`
                });
            } else {
                // No trend data
                insights.push({
                    title: t("Central Fat Loss = Better Metabolic Health"),
                    description: t("Waist-to-height ratio =") + ` ${(currentWaist).toFixed(0)} / ${height} = ${waistToHeightRatio}` + t(", which is above the ideal (<0.5). Dropping below") + ` ${targetWaist} ` + t("cm waist will move you into the \"low-risk\" zone.")
                });
            }
        } else {
            debugLog('📏 Measurement Insights: Adding Insight 2b - Excellent ratio');
            if (waistChange && waistChange < 0) {
                insights.push({
                    title: t("Excellent Waist-to-Height Ratio"),
                    description: `Your waist-to-height ratio of ${waistToHeightRatio} is in the healthy range (<0.5) and improving, indicating low metabolic and cardiovascular risk.`
                });
            } else {
                insights.push({
                    title: t("Excellent Waist-to-Height Ratio"),
                    description: `Your waist-to-height ratio of ${waistToHeightRatio} is in the healthy range (<0.5), indicating low metabolic and cardiovascular risk.`
                });
            }
        }
    } else {
        debugLog('📏 Measurement Insights: Insight 2 condition not met', {
            hasWaistData: waist.length > 0,
            hasProfile: !!profile,
            hasHeight: !!(profile && profile.height_cm)
        });
    }

    // Insight 3: Visual & structural change
    if (waistChange !== null && hipsChange !== null && neckChange !== null) {
        if (Math.abs(waistChange) >= 0.5 || Math.abs(hipsChange) >= 0.5 || Math.abs(neckChange) >= 0.3) {
            insights.push({
                title: t("Visual & Structural Change"),
                description: t("These consistent drops across multiple body sites are often the most noticeable in appearance. Expect visible toning through your torso and face soon — fat loss tends to show first in these areas.")
            });
        }
    }

    // Insight 4: Estimations and forecasts (if fat % is available from body_data)
    if (window.globalDashboardData.body_data_history && window.globalDashboardData.body_data_history.fat_percent) {
        const fatPercent = window.globalDashboardData.body_data_history.fat_percent;
        if (fatPercent.length >= 2 && waistChange && waistChange < 0) {
            const currentFat = parseFloat(fatPercent[0].value);
            const previousFat = parseFloat(fatPercent[1].value);
            const fatChange = currentFat - previousFat;

            if (fatChange < 0) {
                const weeksToTarget = Math.ceil((currentFat - 24) / Math.abs(fatChange));
                insights.push({
                    title: t("Body Recomposition Timeline"),
                    description: t("Fat % trending from") + ` ${previousFat.toFixed(1)}` + t("% to") + ` ${currentFat.toFixed(1)}` + t("%. At this rate, reaching 24% body fat could take approximately") + ` ${weeksToTarget} ` + t("weeks with consistent training.")
                });
            }
        }
    }

    // If no insights, show encouragement
    if (insights.length === 0) {
        insights.push({
            title: t("Keep tracking your measurements!"),
            description: t("Log multiple measurements over time to see personalized insights about your body composition changes and fat loss progress.")
        });
    }

    debugLog('📏 Measurement Insights: Generated ' + insights.length + ' insights', insights);

    // Render insights
    renderMeasurementInsights(insights);
};

// Function to render measurement insights into the insights card
function renderMeasurementInsights(insights) {
    const $insightsContent = $('#measurement-insights-content');

    debugLog('📏 Measurement Insights: Rendering insights...', {
        insightsCount: insights ? insights.length : 0,
        elementFound: $insightsContent.length > 0
    });

    if (!insights || insights.length === 0) {
        $insightsContent.html('<p class="text-muted">Log your body measurements to see personalized insights.</p>');
        return;
    }

    let html = '';
    insights.forEach(insight => {
        html += `
            <div class="insight-item mb-3">
                <h6 class="insight-title mb-1">${insight.title}</h6>
                <p class="insight-description mb-0">${insight.description}</p>
            </div>
        `;
    });

    $insightsContent.html(html);
    debugLog('📏 Measurement Insights: Rendered successfully');
}

// Function to generate insights from caliper measurements
window.generateCaliperInsights = function() {
    debugLog('📐 Caliper Insights: Function called');

    // Check if we have global dashboard data with body data history
    if (!window.globalDashboardData || !window.globalDashboardData.body_data_history) {
        debugLog('📐 Caliper Insights: No body data history available yet', {
            hasGlobalData: !!window.globalDashboardData,
            hasBodyDataHistory: !!(window.globalDashboardData && window.globalDashboardData.body_data_history)
        });
        return;
    }

    const history = window.globalDashboardData.body_data_history;
    const profile = window.globalDashboardData.profile;
    const insights = [];

    debugLog('📐 Caliper Insights: Analyzing data...', {
        historyKeys: Object.keys(history),
        profileExists: !!profile
    });

    // Get caliper data
    const chest = history.caliper_chest || [];
    const abdomen = history.caliper_abdomen || [];
    const thigh = history.caliper_thigh || [];
    const tricep = history.caliper_tricep || [];
    const suprailiac = history.caliper_suprailiac || [];

    // Check for trends (need at least 2 data points)
    const hasChestTrend = chest.length >= 2;
    const hasAbdomenTrend = abdomen.length >= 2;
    const hasThighTrend = thigh.length >= 2;
    const hasTricepTrend = tricep.length >= 2;
    const hasSuprailiacTrend = suprailiac.length >= 2;

    debugLog('📐 Caliper Insights: Trend checks', {
        hasChestTrend,
        hasAbdomenTrend,
        hasThighTrend,
        hasTricepTrend,
        hasSuprailiacTrend
    });

    // Calculate trends (comparing current to worst/highest ever recorded)
    let chestChange = null, abdomenChange = null, thighChange = null, tricepChange = null, suprailiacChange = null;

    if (hasChestTrend) {
        const current = parseFloat(chest[0].value);
        const worst = Math.max(...chest.map(c => parseFloat(c.value)));
        chestChange = current - worst;
        debugLog('📐 Caliper Insights: Chest change', { current, worst, chestChange });
    }

    if (hasAbdomenTrend) {
        const current = parseFloat(abdomen[0].value);
        const worst = Math.max(...abdomen.map(a => parseFloat(a.value)));
        abdomenChange = current - worst;
        debugLog('📐 Caliper Insights: Abdomen change', { current, worst, abdomenChange });
    }

    if (hasThighTrend) {
        const current = parseFloat(thigh[0].value);
        const worst = Math.max(...thigh.map(t => parseFloat(t.value)));
        thighChange = current - worst;
        debugLog('📐 Caliper Insights: Thigh change', { current, worst, thighChange });
    }

    if (hasTricepTrend) {
        const current = parseFloat(tricep[0].value);
        const worst = Math.max(...tricep.map(t => parseFloat(t.value)));
        tricepChange = current - worst;
        debugLog('📐 Caliper Insights: Tricep change', { current, worst, tricepChange });
    }

    if (hasSuprailiacTrend) {
        const current = parseFloat(suprailiac[0].value);
        const worst = Math.max(...suprailiac.map(s => parseFloat(s.value)));
        suprailiacChange = current - worst;
        debugLog('📐 Caliper Insights: Suprailiac change', { current, worst, suprailiacChange });
    }

    // Calculate total 5-site sum if we have all measurements
    if (chest.length > 0 && abdomen.length > 0 && thigh.length > 0 && tricep.length > 0 && suprailiac.length > 0) {
        const currentSum = parseFloat(chest[0].value) + parseFloat(abdomen[0].value) + parseFloat(thigh[0].value) + parseFloat(tricep[0].value) + parseFloat(suprailiac[0].value);

        // Calculate body density and fat % using Jackson-Pollock 5-site formula
        if (profile && profile.age) {
            const age = parseFloat(profile.age);
            const sumSquared = currentSum * currentSum;
            const density = 1.0982 - (0.000815 * currentSum) + (0.00000084 * sumSquared) - (0.0000320 * age);
            const bodyFatPercent = (495 / density) - 450;

            insights.push({
                title: t("5-Site Body Fat Calculation"),
                description: t("Total skinfold:") + ` ${currentSum.toFixed(1)}` + t("mm → Estimated body fat:") + ` ${bodyFatPercent.toFixed(1)}` + t("% using Jackson-Pollock formula. This provides an independent validation of your smart scale readings.")
            });
        }
    }

    // Insight 1: Overall skinfold changes (both gain and loss)
    const allChanges = [chestChange, abdomenChange, thighChange, tricepChange, suprailiacChange].filter(c => c !== null);
    if (allChanges.length >= 3) {
        const avgChange = allChanges.reduce((sum, change) => sum + change, 0) / allChanges.length;
        const avgAbsChange = allChanges.reduce((sum, change) => sum + Math.abs(change), 0) / allChanges.length;

        // Check if mostly reducing (negative = good for calipers)
        if (avgChange < -1.0) {
            insights.push({
                title: t("Significant Fat Loss Across All Sites"),
                description: t("Average reduction of") + ` ${Math.abs(avgChange).toFixed(1)}` + t("mm across measurement sites. This indicates consistent fat loss throughout your body.")
            });
        } else if (avgChange < -0.3) {
            insights.push({
                title: t("Steady Fat Loss Progress"),
                description: `Average reduction of ${Math.abs(avgChange).toFixed(1)}mm across sites shows steady progress. Continue your current approach.`
            });
        } else if (avgChange > 1.0) {
            // Fat gain scenario
            insights.push({
                title: t("Skinfold Measurements Increasing"),
                description: `Average increase of ${avgChange.toFixed(1)}mm across sites. This indicates fat gain. Review your nutrition and activity levels.`
            });
        } else if (avgChange > 0.3) {
            insights.push({
                title: t("Slight Increase in Body Fat"),
                description: `Average increase of ${avgChange.toFixed(1)}mm. Consider adjusting calorie intake or increasing activity.`
            });
        } else {
            // Minimal change
            insights.push({
                title: t("Stable Body Fat Levels"),
                description: `Skinfold measurements are stable (±${avgAbsChange.toFixed(1)}mm average). You're maintaining your current body composition.`
            });
        }
    }

    // Insight 2: Visceral fat indicator (abdomen) - both good and bad
    if (abdomenChange !== null) {
        if (abdomenChange < -2.0) {
            insights.push({
                title: t("Excellent Visceral Fat Reduction"),
                description: t("Abdomen skinfold dropped") + ` ${Math.abs(abdomenChange).toFixed(1)}` + t("mm — a strong indicator of reduced visceral fat, which significantly improves metabolic health.")
            });
        } else if (abdomenChange > 2.0) {
            insights.push({
                title: t("Increased Abdominal Fat"),
                description: `Abdomen skinfold increased ${abdomenChange.toFixed(1)}mm — this may indicate increased visceral fat. Focus on nutrition and core exercises.`
            });
        }
    }

    // Insight 3: Upper body vs lower body pattern (both gain and loss)
    if (chestChange !== null && thighChange !== null) {
        const upperBodyChange = chestChange; // negative = loss, positive = gain
        const lowerBodyChange = thighChange;
        const upperBodyAbs = Math.abs(chestChange);
        const lowerBodyAbs = Math.abs(thighChange);

        // Determine overall trend
        const avgTrend = (upperBodyChange + lowerBodyChange) / 2;

        if (avgTrend < -0.5) {
            // Overall fat loss
            if (upperBodyAbs > lowerBodyAbs * 1.5) {
                insights.push({
                    title: t("Upper Body Fat Loss Pattern"),
                    description: t("You're losing more fat from your upper body (chest area) compared to lower body. This is a common pattern for men and indicates good progress.")
                });
            } else if (lowerBodyAbs > upperBodyAbs * 1.5) {
                insights.push({
                    title: t("Lower Body Fat Loss Pattern"),
                    description: t("More fat loss from lower body (thighs). This can indicate improved leg muscle activation from training.")
                });
            } else {
                insights.push({
                    title: t("Balanced Fat Loss Distribution"),
                    description: t("Fat loss is distributed evenly between upper and lower body, showing a well-balanced approach to training and nutrition.")
                });
            }
        } else if (avgTrend > 0.5) {
            // Overall fat gain
            if (upperBodyAbs > lowerBodyAbs * 1.5) {
                insights.push({
                    title: t("Upper Body Fat Gain Pattern"),
                    description: t("More fat accumulation in upper body (chest area). This may indicate excess calorie intake or reduced upper body activity.")
                });
            } else if (lowerBodyAbs > upperBodyAbs * 1.5) {
                insights.push({
                    title: t("Lower Body Fat Gain Pattern"),
                    description: t("More fat accumulation in lower body (thighs). Consider increasing lower body exercises and reviewing diet.")
                });
            } else {
                insights.push({
                    title: t("Balanced Fat Gain Distribution"),
                    description: t("Fat gain is distributed across upper and lower body. Review overall calorie intake and activity levels.")
                });
            }
        }
    }

    // Insight 4: Consistency index (measures how evenly fat is being lost)
    if (allChanges.length >= 4) {
        const maxChange = Math.max(...allChanges.map(Math.abs));
        const minChange = Math.min(...allChanges.map(Math.abs));
        const meanChange = allChanges.reduce((sum, c) => sum + Math.abs(c), 0) / allChanges.length;
        const consistencyIndex = (maxChange - minChange) / meanChange;

        if (consistencyIndex < 0.5) {
            insights.push({
                title: t("Highly Consistent Fat Loss"),
                description: t("Your fat loss is remarkably even across all measurement sites. This indicates a well-structured training and nutrition program.")
            });
        } else if (consistencyIndex > 1.5) {
            insights.push({
                title: t("Variable Fat Loss Pattern"),
                description: t("Fat loss varies significantly between sites. This is normal but consider adding exercises targeting areas with less progress.")
            });
        }
    }

    // If no insights, show encouragement
    if (insights.length === 0) {
        insights.push({
            title: t("Keep tracking your calipers!"),
            description: t("Log multiple caliper measurements over time to see personalized insights about body fat distribution and composition changes.")
        });
    }

    debugLog('📐 Caliper Insights: Generated ' + insights.length + ' insights', insights);

    // Render insights
    renderCaliperInsights(insights);
};

// Function to render caliper insights into the insights card
function renderCaliperInsights(insights) {
    const $insightsContent = $('#caliper-insights-content');

    debugLog('📐 Caliper Insights: Rendering insights...', {
        insightsCount: insights ? insights.length : 0,
        elementFound: $insightsContent.length > 0
    });

    if (!insights || insights.length === 0) {
        $insightsContent.html('<p class="text-muted">Log your caliper measurements to see personalized insights.</p>');
        return;
    }

    let html = '';
    insights.forEach(insight => {
        html += `
            <div class="insight-item mb-3">
                <h6 class="insight-title mb-1">${insight.title}</h6>
                <p class="insight-description mb-0">${insight.description}</p>
            </div>
        `;
    });

    $insightsContent.html(html);
    debugLog('📐 Caliper Insights: Rendered successfully');
}
