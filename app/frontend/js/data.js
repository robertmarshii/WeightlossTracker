// Data tab functionality - Weight history management

function loadWeightHistory() {
    if (window.coverage) window.coverage.logFunction('loadWeightHistory', 'data.js');
    $.post('router.php?controller=profile', { action: 'get_weight_history' }, function(resp) {
        const data = parseJson(resp);
        const tbody = $('#weight-history-body');

        if (!data.success || !data.history || data.history.length === 0) {
            tbody.html('<tr><td colspan="4" class="no-data">No weight entries found. Add your first entry above!</td></tr>');
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
        $('#weight-history-body').html('<tr><td colspan="4" class="no-data text-danger">Failed to load weight history</td></tr>');
    });
}

function formatDate(dateString) {
    if (window.coverage) window.coverage.logFunction('formatDate', 'data.js');
    const date = new Date(dateString);

    // Use shorter date format on mobile devices (screen width <= 768px)
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        // Short format: 12/09/25
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
    } else {
        // Full format: 12/09/2025
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
}

function editWeight(id, weight, date) {
    if (window.coverage) window.coverage.logFunction('editWeight', 'data.js');
    // For now, just show the add form with the values pre-filled
    $('#newWeight').val(weight);
    $('#newDate').val(date);
    $('#add-entry-form').slideDown();
    $('#newWeight').focus();

    // TODO: Implement proper edit functionality with update instead of add
    showToast('Edit mode: Modify values and save (creates new entry for now)');
}

function deleteWeight(id) {
    if (window.coverage) window.coverage.logFunction('deleteWeight', 'data.js');
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
            if (typeof window.healthRefreshBMI === 'function') {
                window.healthRefreshBMI();
            }
            if (typeof window.healthRefreshHealth === 'function') {
                window.healthRefreshHealth();
            }
            if (typeof window.healthRefreshIdealWeight === 'function') {
                window.healthRefreshIdealWeight();
            }
        } else {
            showToast('Failed to delete weight entry');
        }
    }).fail(function() {
        showToast('Network error');
    });
}

// Make functions globally available
window.dataLoadWeightHistory = loadWeightHistory;
window.dataFormatDate = formatDate;
window.dataEditWeight = editWeight;
window.dataDeleteWeight = deleteWeight;