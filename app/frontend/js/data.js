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

// Rows of the weight history table (newest first). The change column is worked out in the user's unit
// and shows "-" when it rounds to zero there.
function renderWeightHistoryRows(history) {
    const tbody = $('#weight-history-body');
    if (!history || history.length === 0) {
        tbody.html(`<tr><td colspan="4" class="no-data">${t('No weight entries found. Add your first entry above!')}</td></tr>`);
        return;
    }
    let html = '';
    history.forEach((entry, index) => {
        const weightKg = parseFloat(entry.weight_kg);
        const date = String(entry.entry_date);
        let changeHtml = '<span class="text-muted">-</span>';
        if (index < history.length - 1) {
            // Previous chronological entry is next in the newest-first array
            const diffKg = weightKg - parseFloat(history[index + 1].weight_kg);
            const change = formatWeightChange(diffKg);
            if (change) {
                changeHtml = `<span class="${diffKg > 0 ? 'text-danger' : 'text-success'}">${change}</span>`;
            }
        }
        const id = parseInt(entry.id, 10);
        html += `
            <tr data-id="${id}">
                <td>${formatDate(date)}</td>
                <td><strong>${formatWeight(weightKg)}</strong></td>
                <td>${changeHtml}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-sm edit-btn" data-id="${id}" data-kg="${weightKg}" data-date="${$('<div>').text(date).html()}" aria-label="${t('Edit')}">✎</button>
                        <button class="btn btn-sm delete-btn" data-id="${id}" aria-label="${t('Delete')}">✖</button>
                    </div>
                </td>
            </tr>
        `;
    });
    tbody.html(html);
}

$(document).on('click', '#weight-history-body .edit-btn', function () {
    editWeight($(this).data('id'), $(this).data('kg'), String($(this).data('date')));
});
$(document).on('click', '#weight-history-body .delete-btn', function () {
    deleteWeight($(this).data('id'));
});

function loadWeightHistory() {
    if (window.coverage) window.coverage.logFunction('loadWeightHistory', 'data.js');

    if (window.globalDashboardData && window.globalDashboardData.weight_history) {
        renderWeightHistoryRows(window.globalDashboardData.weight_history);
        return;
    }

    // Fallback to API call if global data not available
    postRequest('router.php?controller=profile', { action: 'get_weight_history' })
    .then(resp => {
        const data = parseJson(resp);
        renderWeightHistoryRows(data.success ? data.history : []);
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

// The weight as the edit field shows it: "13 st 5.4 lb" for stone, else the number with one decimal
function weightInputText(weightKg) {
    return getWeightUnit() === 'st' ? formatWeight(weightKg, 'st') : convertFromKg(weightKg);
}

function editWeight(id, weightKg, date) {
    if (window.coverage) window.coverage.logFunction('editWeight', 'data.js');

    // Remember which entry is being edited and its stored kg: Save sends that kg unchanged unless the
    // weight field was edited (the field shows a rounded value, so converting it back would drift).
    const prefill = weightInputText(weightKg);
    $('#add-entry-form').data('editId', id).data('editKg', String(weightKg)).data('editPrefill', prefill);

    $('#newWeight').val(prefill);

    // Format date to user's preferred format before pre-filling
    const formattedDate = formatDateBySettings(date);
    $('#newDate').val(formattedDate);

    // Show form and focus
    $('#add-entry-form').slideDown();
    $('#newWeight').focus();

    showToast(t('Edit mode: change the values and save to update this entry'));
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
window.dataWeightInputText = weightInputText;
window.dataRenderWeightHistoryRows = renderWeightHistoryRows;
window.dataDeleteWeight = deleteWeight;