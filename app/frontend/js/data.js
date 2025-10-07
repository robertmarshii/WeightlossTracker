// Data tab functionality - Weight history management

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

function loadWeightHistory() {
    if (window.coverage) window.coverage.logFunction('loadWeightHistory', 'data.js');

    // Check if we have global data first
    debugLog('🔍 loadWeightHistory - has global data:', !!window.globalDashboardData, 'has weight_history:', !!window.globalDashboardData?.weight_history);

    if (window.globalDashboardData && window.globalDashboardData.weight_history) {
        debugLog('📊 Using global data for weight history');
        const tbody = $('#weight-history-body');
        const history = window.globalDashboardData.weight_history;

        if (!history || history.length === 0) {
            if (window.coverage) window.coverage.logFunction('if', 'data.js');
            tbody.html(`<tr><td colspan="4" class="no-data">${t('No weight entries found. Add your first entry above!')}</td></tr>`);
            return;
        }

        let html = '';
        const unit = getWeightUnitLabel();
        const threshold = unit === 'st' ? 0.05 : 0.1;

        history.forEach((entry, index) => {
            const weight = parseFloat(entry.weight_kg);
            const date = entry.entry_date;
            const bmi = entry.bmi || 'N/A';
            const displayWeight = convertFromKg(weight);

            // Calculate change from previous chronological entry (which is next in newest-first array)
            let changeHtml = '<span class="text-muted">-</span>';
            if (index < history.length - 1) {
                if (window.coverage) window.coverage.logFunction('if', 'data.js');
                const previousEntry = history[index + 1];
                const previousWeight = parseFloat(previousEntry.weight_kg);

                // Convert both weights to display unit first, then calculate difference
                const currentDisplayWeight = parseFloat(displayWeight);
                const previousDisplayWeight = parseFloat(convertFromKg(previousWeight));
                const change = currentDisplayWeight - previousDisplayWeight;

                if (Math.abs(change) >= threshold) { // Only show if change is meaningful
                    const changeClass = change > 0 ? 'text-danger' : change < 0 ? 'text-success' : 'text-muted';
                    const changeSymbol = change > 0 ? '+' : '';
                    changeHtml = `<span class="${changeClass}">${changeSymbol}${change.toFixed(1)} ${unit}</span>`;
                } else {
                    changeHtml = '<span class="text-muted">-</span>';
                }
            }

            html += `
                <tr data-id="${entry.id}">
                    <td>${formatDate(date)}</td>
                    <td><strong>${displayWeight} ${unit}</strong></td>
                    <td>${changeHtml}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm edit-btn" onclick="editWeight(${entry.id}, ${displayWeight}, '${date}')">✎</button>
                            <button class="btn btn-sm delete-btn" onclick="deleteWeight(${entry.id})">✖</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.html(html);
        return;
    }

    // Fallback to API call if global data not available
    debugLog('🌐 Making API call for weight history (global data not available)');
    postRequest('router.php?controller=profile', { action: 'get_weight_history' })
    .then(resp => {
        const data = parseJson(resp);
        const tbody = $('#weight-history-body');

        if (!data.success || !data.history || data.history.length === 0) {
            if (window.coverage) window.coverage.logFunction('if', 'data.js');
            tbody.html(`<tr><td colspan="4" class="no-data">${t('No weight entries found. Add your first entry above!')}</td></tr>`);
            return;
        }

        let html = '';

        // Data already comes sorted newest first from backend
        const history = data.history;

        const unit = getWeightUnitLabel();
        const threshold = unit === 'st' ? 0.05 : 0.1;

        history.forEach((entry, index) => {
            const weight = parseFloat(entry.weight_kg);
            const date = entry.entry_date;
            const bmi = entry.bmi || 'N/A';
            const displayWeight = convertFromKg(weight);

            // Calculate change from previous chronological entry (which is next in newest-first array)
            let changeHtml = '<span class="text-muted">-</span>';
            if (index < history.length - 1) {
                if (window.coverage) window.coverage.logFunction('if', 'data.js');
                const previousEntry = history[index + 1];
                const previousWeight = parseFloat(previousEntry.weight_kg);

                // Convert both weights to display unit first, then calculate difference
                const currentDisplayWeight = parseFloat(displayWeight);
                const previousDisplayWeight = parseFloat(convertFromKg(previousWeight));
                const change = currentDisplayWeight - previousDisplayWeight;

                if (Math.abs(change) >= threshold) { // Only show if change is meaningful
                    const changeClass = change > 0 ? 'text-danger' : change < 0 ? 'text-success' : 'text-muted';
                    const changeSymbol = change > 0 ? '+' : '';
                    changeHtml = `<span class="${changeClass}">${changeSymbol}${change.toFixed(1)} ${unit}</span>`;
                } else {
                    changeHtml = '<span class="text-muted">-</span>';
                }
            }

            html += `
                <tr data-id="${entry.id}">
                    <td>${formatDate(date)}</td>
                    <td><strong>${displayWeight} ${unit}</strong></td>
                    <td>${changeHtml}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn btn-sm edit-btn" onclick="editWeight(${entry.id}, ${displayWeight}, '${date}')">✎</button>
                            <button class="btn btn-sm delete-btn" onclick="deleteWeight(${entry.id})">✖</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tbody.html(html);
    }).catch(function() {
        $('#weight-history-body').html(`<tr><td colspan="4" class="no-data text-danger">${t('Failed to load weight history')}</td></tr>`);
    });
}

function formatDate(dateString) {
    if (window.coverage) window.coverage.logFunction('formatDate', 'data.js');
    debugLog('🔧 formatDate called in data.js with:', dateString);

    // Check if formatDateBySettings exists
    if (typeof formatDateBySettings !== 'function') {
        debugLog('❌ ERROR: formatDateBySettings is NOT defined! Type:', typeof formatDateBySettings);
        return dateString;
    }

    debugLog('✅ formatDateBySettings exists, calling it');
    const result = formatDateBySettings(dateString);
    debugLog('📅 formatDate result:', result);
    return result;
}

function editWeight(id, weight, date) {
    if (window.coverage) window.coverage.logFunction('editWeight', 'data.js');
    // For now, just show the add form with the values pre-filled
    $('#newWeight').val(weight);
    $('#newDate').val(date);
    $('#add-entry-form').slideDown();
    $('#newWeight').focus();

    // TODO: Implement proper edit functionality with update instead of add
    showToast(t('Edit mode: Modify values and save (creates new entry for now)'));
}

function deleteWeight(id) {
    if (window.coverage) window.coverage.logFunction('deleteWeight', 'data.js');
    if (!confirm(t('Are you sure you want to delete this weight entry?'))) {
        return;
    }

    postRequest('router.php?controller=profile', {
        action: 'delete_weight',
        id: id
    }, function(resp) {
        const data = parseJson(resp);
        if (data.success) {
            if (window.coverage) window.coverage.logFunction('if', 'data.js');
            showToast(t('Weight entry deleted'));
            loadWeightHistory();
            refreshLatestWeight();
            if (typeof window.healthRefreshBMI === 'function') {
                window.healthRefreshBMI();
            }
            if (typeof window.healthRefreshHealth === 'function') {
                window.healthRefreshHealth();
            }
            if (typeof window.healthRefreshIdealWeight === 'function') {
                if (window.coverage) window.coverage.logFunction('if', 'data.js');
                window.healthRefreshIdealWeight();
            }
        } else {
            showToast(t('Failed to delete weight entry'));
        }
    }).catch(function() {
        showToast(t('Network error'));
    });
}

// Make functions globally available
window.dataLoadWeightHistory = loadWeightHistory;
window.dataFormatDate = formatDate;
window.dataEditWeight = editWeight;
window.dataDeleteWeight = deleteWeight;