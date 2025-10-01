// Achievements tab functionality - Progress tracking and milestones

function updateAchievementCards(weightData) {
    if (window.coverage) window.coverage.logFunction('updateAchievementCards', 'achievements.js');
    if (weightData.length === 0) return;

    // Sort by date for calculations
    const sortedData = [...weightData].sort((a, b) => new Date(a.entry_date) - new Date(b.entry_date));
    const firstWeight = parseFloat(sortedData[0].weight_kg);
    const lastWeight = parseFloat(sortedData[sortedData.length - 1].weight_kg);
    const totalLoss = firstWeight - lastWeight;

    // Update Total Progress card
    const unit = getWeightUnitLabel();
    const displayTotalLoss = convertFromKg(Math.abs(totalLoss));
    const progressHtml = totalLoss > 0
        ? `<strong class="text-success">${displayTotalLoss} ${unit} ${t('lost')}</strong><br><small>${t('Over')} ${sortedData.length} ${t('entries')}</small>`
        : `<strong class="text-info">${displayTotalLoss} ${unit} ${t('gained')}</strong><br><small>${t('Over')} ${sortedData.length} ${t('entries')}</small>`;
    $('#total-progress').html(progressHtml);

    // Calculate streak (consecutive days with entries)
    const today = new Date();
    let streak = 0;
    const sortedDates = sortedData.map(entry => new Date(entry.entry_date)).sort((a, b) => b - a);

    for (let i = 0; i < sortedDates.length; i++) {
        if (window.coverage) window.coverage.logFunction('for', 'achievements.js');
        const entryDate = sortedDates[i];
        const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));

        if (i === 0 && daysDiff <= 1) {
            streak = 1;
        } else if (i > 0) {
            const prevDate = sortedDates[i-1];
            const daysBetween = Math.floor((prevDate - entryDate) / (1000 * 60 * 60 * 24));
            if (daysBetween <= 2) { // Allow 1 day gap
                if (window.coverage) window.coverage.logFunction('if', 'achievements.js');
                streak++;
            } else {
                break;
            }
        }
    }

    const streakHtml = streak > 0
        ? `<strong class="text-success">${streak} ${streak > 1 ? t('days') : t('day')}</strong><br><small>${t('Current logging streak')}</small>`
        : `<span class="text-muted">${t('No current streak')}</span><br><small>${t('Log weight to start')}</small>`;
    $('#streak-counter').html(streakHtml);

    // Simple goal achievement (placeholder)
    $('#goals-achieved').html(`<span class="text-info">🎯 ${t('Goal tracking')}</span><br><small>${t('Set goals in Data tab')}</small>`);
}

// Additional achievement-related functions can be added here

// Make functions globally available
window.achievementsUpdateAchievementCards = updateAchievementCards;