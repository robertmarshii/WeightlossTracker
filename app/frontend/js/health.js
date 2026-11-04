// Health Tab
// Every figure on this tab is either the user's own data (weights, BMI) or a general estimate from a published
// source listed at the end of pages/health.php. Numbers like [3] link to that list. Nothing here is a measurement
// of the user's own health. Fixed research statements live in pages/health.php; this file fills in the user's figures.

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

// ---------- small helpers ----------

// Translate a text with {placeholders}
function tf(key, values) {
    let s = t(key);
    Object.keys(values || {}).forEach(k => { s = s.split('{' + k + '}').join(values[k]); });
    return s;
}

// A number with one decimal, written the way the page's language writes it (20.1 / 20,1)
function num(x, digits = 1) {
    const n = parseFloat(x);
    if (isNaN(n)) return '';
    return n.toLocaleString(getLanguageLocale(), { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

// A weight stored in kg, in the user's unit
function healthWeight(kg) {
    return `${num(convertFromKg(kg))} ${getWeightUnitLabel()}`;
}

// "[n]" link to an entry of the Sources list on this page
function srcRef(key) {
    const n = $('#src-' + key).attr('data-n');
    return n ? `<a href="#src-${key}" class="src-ref" aria-label="Source ${n}">[${n}]</a>` : '';
}

// WHO adult BMI categories (WHO fact sheet: 25 or more overweight, 30 or more obesity)
function bmiCategoryLabel(bmi) {
    if (bmi < 18.5) return t('Underweight');
    if (bmi < 25) return t('Healthy weight');
    if (bmi < 30) return t('Overweight');
    return t('Obese');
}

// The [n] links scroll to the source without touching the #page=... hash the dashboard uses for navigation
$(document).on('click', '.src-ref', function (e) {
    e.preventDefault();
    const target = document.getElementById(($(this).attr('href') || '').slice(1));
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        target.classList.add('src-highlight');
        setTimeout(() => target.classList.remove('src-highlight'), 2000);
    }
});

// ---------- Your Progress (top card) ----------

function renderProgressCard(startKg, currentKg, heightCm) {
    const el = $('#personal-benefits-calculator');
    const lines = [];
    const changeKg = startKg - currentKg;
    if (changeKg > 0) {
        const pct = (changeKg / startKg) * 100;
        lines.push(tf('Started at {start}, now {now}: {diff} lost, {pct}% of your starting weight.', {
            start: `<strong>${healthWeight(startKg)}</strong>`, now: `<strong>${healthWeight(currentKg)}</strong>`,
            diff: `<strong class="text-success">${healthWeight(changeKg)}</strong>`, pct: `<strong>${num(pct)}</strong>`
        }));
        if (pct >= 5) {
            lines.push(`<span class="text-success">${t('You have lost more than 5% of your starting weight.')}</span>`);
        } else {
            lines.push(tf('{diff} more to reach 5% of your starting weight.', { diff: healthWeight(startKg * 0.05 - changeKg) }));
        }
    } else {
        lines.push(tf('Started at {start}, now {now}: {diff} gained.', {
            start: `<strong>${healthWeight(startKg)}</strong>`, now: `<strong>${healthWeight(currentKg)}</strong>`,
            diff: `<strong>${healthWeight(-changeKg)}</strong>`
        }));
    }
    if (heightCm > 0) {
        const h = heightCm / 100;
        lines.push(tf('BMI: {start} at the start, {now} now.', {
            start: num(startKg / (h * h)), now: `<strong>${num(currentKg / (h * h))}</strong>`
        }));
    }
    el.html(lines.join('<br>')).removeClass('text-muted').removeAttr('data-eng data-spa data-fre data-ger');
}

function updateHealthBenefitCards() {
    if (window.coverage) window.coverage.logFunction('updateHealthBenefitCards', 'health.js');
    const g = window.globalDashboardData;
    if (g && g.weight_progress) {
        const p = g.weight_progress;
        const heightCm = parseFloat(g.profile?.height_cm || g.health_stats?.height_cm || 0);
        renderProgressCard(parseFloat(p.start_weight_kg), parseFloat(p.current_weight_kg), heightCm);
        return;
    }
    if (g) return; // global data loaded but fewer than 2 weights: keep the default text
    postRequest('router.php?controller=profile', { action: 'get_weight_progress' })
    .then(resp => {
        const p = parseJson(resp);
        if (p.success) renderProgressCard(parseFloat(p.start_weight_kg), parseFloat(p.current_weight_kg), parseFloat(p.height_cm || 0));
    }).catch(() => {});
}

function refreshPersonalHealthBenefits() {
    if (window.coverage) window.coverage.logFunction('refreshPersonalHealthBenefits', 'health.js');
    updateHealthBenefitCards();
}

// ---------- BMI ----------

function renderBMI(data, startKg) {
    const el = $('#bmi-block');
    const bmi = parseFloat(data.bmi);
    const lines = [tf('Current BMI: {bmi} ({cat})', { bmi: `<strong>${num(bmi)}</strong>`, cat: bmiCategoryLabel(bmi) })];
    if (startKg && data.height_cm) {
        const h = data.height_cm / 100.0;
        const startBmi = startKg / (h * h);
        if (Math.abs(startBmi - bmi) >= 0.1) lines.push(tf('At the start: {bmi}', { bmi: num(startBmi) }));
    }
    if (data.adjusted_bmi && parseFloat(data.adjusted_bmi) !== bmi) {
        const adj = parseFloat(data.adjusted_bmi);
        lines.push(`<small class="text-muted">${tf('Adjusted for your body frame: {bmi} ({cat}). This is a rough adjustment made by this app, not a standard measure.', { bmi: num(adj), cat: bmiCategoryLabel(adj) })}</small>`);
    }
    lines.push(`<small class="text-muted">${t('WHO categories for adults: 25 or more is overweight, 30 or more is obesity.')} ${srcRef('who')}</small>`);
    el.html(lines.join('<br>')).removeClass('text-muted').removeAttr('data-eng data-spa data-fre data-ger');
}

function refreshBMI() {
    if (window.coverage) window.coverage.logFunction('refreshBMI', 'health.js');
    const g = window.globalDashboardData;
    if (g && g.health_stats) {
        renderBMI(g.health_stats, g.weight_progress?.start_weight_kg);
        return;
    }
    if (g) return; // no height or weight yet: keep the default text
    postRequest('router.php?controller=profile', { action: 'get_bmi' })
    .then(resp => {
        const data = parseJson(resp);
        if (data.success) renderBMI(data, null);
    }).catch(() => {});
}

// ---------- Body fat (Deurenberg 1991) ----------

// Deurenberg et al. 1991, adults: BF% = 1.2 × BMI + 0.23 × age − 10.8 × sex − 5.4 (men = 1, women = 0).
// The app does not ask for sex, so it shows the range between the two results.
function deurenbergRange(bmi, age) {
    const men = 1.2 * bmi + 0.23 * age - 16.2;
    const women = 1.2 * bmi + 0.23 * age - 5.4;
    return [Math.min(men, women), Math.max(men, women)];
}

function renderBodyFat(data, startKg) {
    const el = $('#body-fat-block');
    if (!Array.isArray(data.estimated_body_fat_range)) {
        el.text(t('Add your age on the Data tab to estimate body fat.')).addClass('text-muted').removeAttr('data-eng data-spa data-fre data-ger');
        return;
    }
    const [curMin, curMax] = data.estimated_body_fat_range.map(parseFloat);
    const lines = [`${t('Current:')} <strong>${num(curMin)}–${num(curMax)}%</strong>`];
    if (startKg && data.height_cm > 0 && data.age > 0) {
        const h = data.height_cm / 100.0;
        const [stMin, stMax] = deurenbergRange(startKg / (h * h), data.age);
        const change = (stMin + stMax) / 2 - (curMin + curMax) / 2;
        if (change > 0.1) {
            lines.push(`${t('Change:')} <strong class="text-success">-${num(change)}%</strong>`);
            lines.push(`${t('Started:')} <strong>${num(stMin)}–${num(stMax)}%</strong>`);
        }
    }
    lines.push(`<small class="text-muted">${t('Deurenberg formula (BMI and age). The range runs from the result for men to the result for women. For adults it is usually within about 4 percentage points of a lab measurement, and it slightly overestimates body fat in people with obesity.')} ${srcRef('deur')}</small>`);
    el.html(lines.join('<br>')).removeClass('text-muted').removeAttr('data-eng data-spa data-fre data-ger');
}

// Body fat card (the cardiovascular card is fixed, sourced text in pages/health.php)
function refreshHealth() {
    if (window.coverage) window.coverage.logFunction('refreshHealth', 'health.js');
    const g = window.globalDashboardData;
    if (g && g.health_stats) {
        renderBodyFat(g.health_stats, g.weight_progress?.start_weight_kg);
        return;
    }
    if (g) return;
    postRequest('router.php?controller=profile', { action: 'get_health_stats' })
    .then(resp => {
        const data = parseJson(resp);
        if (data.success) renderBodyFat(data, null);
    }).catch(() => {});
}

// ---------- Ideal weight (Hamwi 1964, women's to men's value) ----------

function renderIdealWeight(data) {
    const el = $('#ideal-weight-block');
    if (!data.success) return;
    const lines = [`<strong>${num(convertFromKg(data.min_weight_kg))}–${num(convertFromKg(data.max_weight_kg))} ${getWeightUnitLabel()}</strong>`];
    if (data.timeline && data.timeline.target_date) {
        const targetMonth = new Date(data.timeline.target_date + '-01').toLocaleDateString(getLanguageLocale(), { year: 'numeric', month: 'long' });
        lines.push(`<small class="text-success">${t('Projected to reach upper limit by')} ${targetMonth}</small>`);
        lines.push(`<small class="text-muted">${t('Based on current rate of')} ${num(convertFromKg(data.timeline.current_rate_kg_per_week))} ${getWeightUnitLabel()}/${t('week')}</small>`);
    }
    lines.push(`<small class="text-muted">${t("Hamwi's 1964 rule of thumb, from the value for women to the value for men of your height. A rough guide, not a health target.")} ${srcRef('hamwi')}</small>`);
    el.html(lines.join('<br>')).removeClass('text-muted').removeAttr('data-eng data-spa data-fre data-ger');
}

function refreshIdealWeight() {
    if (window.coverage) window.coverage.logFunction('refreshIdealWeight', 'health.js');
    const g = window.globalDashboardData;
    if (g && g.ideal_weight) {
        renderIdealWeight(g.ideal_weight);
        return;
    }
    if (g) return;
    postRequest('router.php?controller=profile', { action: 'get_ideal_weight' })
    .then(resp => renderIdealWeight(parseJson(resp)))
    .catch(() => {});
}

// ---------- Gallstones: the fixed text is in pages/health.php; add the user's average rate ----------

function renderGallbladderRate(ratePerWeekKg) {
    const el = $('#gallbladder-rate');
    // Only for loss (a positive rate); nothing to say about speed when weight is steady or going up
    if (ratePerWeekKg === null || ratePerWeekKg === undefined || isNaN(ratePerWeekKg) || ratePerWeekKg <= 0) {
        el.empty();
        return;
    }
    el.html(`<small class="text-muted">${tf('Your average since you started: {rate} per week.', { rate: healthWeight(ratePerWeekKg) })}</small>`);
}

function refreshGallbladderHealth() {
    if (window.coverage) window.coverage.logFunction('refreshGallbladderHealth', 'health.js');
    const g = window.globalDashboardData;
    if (g) {
        const p = g.weight_progress;
        renderGallbladderRate(p ? parseFloat(p.avg_weekly_rate_kg ?? p.average_weekly_loss_kg) : null);
        return;
    }
    postRequest('router.php?controller=profile', { action: 'get_weight_progress' })
    .then(resp => {
        const p = parseJson(resp);
        renderGallbladderRate(p.success ? parseFloat(p.avg_weekly_rate_kg) : null);
    }).catch(() => {});
}

// Make functions globally available
window.healthRefreshBMI = refreshBMI;
window.healthRefreshHealth = refreshHealth;
window.healthRefreshIdealWeight = refreshIdealWeight;
window.healthRefreshGallbladderHealth = refreshGallbladderHealth;
window.healthDeurenbergRange = deurenbergRange;
