// Health Tab Functionality
// Contains all health-related calculations, risk assessments, and health score logic

// Health score calculation functions
function getBMIRisk(bmi) {
    if (bmi < 25) return 8;      // Normal weight: ~8% risk
    else if (bmi < 30) return 15; // Overweight: ~15% risk
    else if (bmi < 35) return 25; // Obese Class I: ~25% risk
    else if (bmi < 40) return 35; // Obese Class II: ~35% risk
    else return 45;              // Obese Class III: ~45% risk
}

function getSleepApneaRisk(bmi) {
    if (bmi < 25) return 10;     // Normal weight: ~10% risk
    else if (bmi < 30) return 20; // Overweight: ~20% risk
    else if (bmi < 35) return 35; // Obese Class I: ~35% risk
    else if (bmi < 40) return 50; // Obese Class II: ~50% risk
    else return 65;              // Obese Class III: ~65% risk
}

function getHypertensionRisk(bmi) {
    if (bmi < 25) return 15;     // Normal weight: ~15% risk
    else if (bmi < 30) return 25; // Overweight: ~25% risk
    else if (bmi < 35) return 40; // Obese Class I: ~40% risk
    else if (bmi < 40) return 55; // Obese Class II: ~55% risk
    else return 70;              // Obese Class III: ~70% risk
}

function getFattyLiverRisk(bmi) {
    if (bmi < 25) return 12;     // Normal weight: ~12% risk
    else if (bmi < 30) return 22; // Overweight: ~22% risk
    else if (bmi < 35) return 35; // Obese Class I: ~35% risk
    else if (bmi < 40) return 50; // Obese Class II: ~50% risk
    else return 65;              // Obese Class III: ~65% risk
}

function getHeartDiseaseRisk(bmi) {
    if (bmi < 25) return 8;      // Normal weight: ~8% risk
    else if (bmi < 30) return 14; // Overweight: ~14% risk
    else if (bmi < 35) return 22; // Obese Class I: ~22% risk
    else if (bmi < 40) return 32; // Obese Class II: ~32% risk
    else return 42;              // Obese Class III: ~42% risk
}

function getMentalHealthRisk(bmi) {
    if (bmi < 25) return 12;     // Normal weight: ~12% risk
    else if (bmi < 30) return 18; // Overweight: ~18% risk
    else if (bmi < 35) return 25; // Obese Class I: ~25% risk
    else if (bmi < 40) return 32; // Obese Class II: ~32% risk
    else return 40;              // Obese Class III: ~40% risk
}

function getJointHealthRisk(bmi) {
    if (bmi < 25) return 15;     // Normal weight: ~15% risk
    else if (bmi < 30) return 25; // Overweight: ~25% risk
    else if (bmi < 35) return 35; // Obese Class I: ~35% risk
    else if (bmi < 40) return 45; // Obese Class II: ~45% risk
    else return 55;              // Obese Class III: ~55% risk
}

// Comprehensive health score calculation using ALL 14 health categories
function calculateHealthScore(bmi) {
    // Primary disease risks (from our health boxes)
    const diabetesRisk = getBMIRisk(bmi);
    const sleepRisk = getSleepApneaRisk(bmi);
    const hypertensionRisk = getHypertensionRisk(bmi);
    const fattyLiverRisk = getFattyLiverRisk(bmi);
    const heartRisk = getHeartDiseaseRisk(bmi);
    const mentalRisk = getMentalHealthRisk(bmi);
    const jointRisk = getJointHealthRisk(bmi);

    // Cardiovascular risk (broader category)
    const cardiovascularRisk = getHypertensionRisk(bmi) * 0.9; // Related to but distinct from hypertension

    // Gallbladder risk
    const getGallbladderRisk = (bmi) => {
        if (bmi < 25) return 8;      // Normal weight: ~8% risk
        else if (bmi < 30) return 15; // Overweight: ~15% risk
        else if (bmi < 35) return 25; // Obese Class I: ~25% risk
        else if (bmi < 40) return 35; // Obese Class II: ~35% risk
        else return 45;              // Obese Class III: ~45% risk
    };
    const gallbladderRisk = getGallbladderRisk(bmi);

    // BMI-related health impact (represents BMI Analysis box)
    const getBMIHealthImpact = (bmi) => {
        if (bmi < 18.5) return 20;   // Underweight: health risks
        else if (bmi < 25) return 5; // Normal: minimal risk
        else if (bmi < 30) return 15; // Overweight: moderate risk
        else if (bmi < 35) return 30; // Obese I: high risk
        else if (bmi < 40) return 45; // Obese II: very high risk
        else return 60;              // Obese III: extreme risk
    };
    const bmiHealthImpact = getBMIHealthImpact(bmi);

    // Body fat health impact (represents Body Fat Estimate box)
    const getBodyFatRisk = (bmi) => {
        // Approximated from BMI since we're calculating from BMI
        if (bmi < 25) return 8;      // Normal weight: low body fat risk
        else if (bmi < 30) return 18; // Overweight: moderate body fat risk
        else if (bmi < 35) return 28; // Obese I: high body fat risk
        else if (bmi < 40) return 38; // Obese II: very high body fat risk
        else return 48;              // Obese III: extreme body fat risk
    };
    const bodyFatRisk = getBodyFatRisk(bmi);

    // Weight progress impact (represents Weight Progress box)
    const getWeightProgressRisk = (bmi) => {
        // Risk based on distance from healthy BMI range
        if (bmi < 18.5) return 25;   // Underweight risk
        else if (bmi < 25) return 0; // Healthy range: no risk
        else if (bmi < 30) return 20; // Overweight: moderate risk
        else if (bmi < 35) return 40; // Obese I: high risk
        else if (bmi < 40) return 60; // Obese II: very high risk
        else return 80;              // Obese III: extreme risk
    };
    const weightProgressRisk = getWeightProgressRisk(bmi);

    // Ideal weight deviation (represents Ideal Weight Range box)
    const getIdealWeightRisk = (bmi) => {
        // Risk based on deviation from ideal BMI (22)
        const deviation = Math.abs(bmi - 22);
        if (deviation < 3) return 5;     // Close to ideal: minimal risk
        else if (deviation < 6) return 15; // Moderate deviation: low risk
        else if (deviation < 10) return 30; // High deviation: moderate risk
        else if (deviation < 15) return 50; // Very high deviation: high risk
        else return 70;                    // Extreme deviation: very high risk
    };
    const idealWeightRisk = getIdealWeightRisk(bmi);

    // Life expectancy impact (represents Life Expectancy box)
    const getLifeExpectancyRisk = (bmi) => {
        if (bmi < 18.5) return 30;   // Underweight: reduced life expectancy
        else if (bmi < 25) return 5; // Normal: minimal impact
        else if (bmi < 30) return 15; // Overweight: slight reduction
        else if (bmi < 35) return 25; // Obese I: moderate reduction
        else if (bmi < 40) return 40; // Obese II: significant reduction
        else return 55;              // Obese III: major reduction
    };
    const lifeExpectancyRisk = getLifeExpectancyRisk(bmi);

    // Average all 14 health categories
    const avgRisk = (
        diabetesRisk + sleepRisk + hypertensionRisk + fattyLiverRisk +
        heartRisk + mentalRisk + jointRisk + cardiovascularRisk +
        gallbladderRisk + bmiHealthImpact + bodyFatRisk +
        weightProgressRisk + idealWeightRisk + lifeExpectancyRisk
    ) / 14;

    // Convert to health score (100 - risk = health score)
    return Math.round(100 - avgRisk);
}

// Generate health improvement message based on progress
function getHealthImprovementMessage(healthScoreImprovement) {
    if (healthScoreImprovement >= 70) {
        return `<strong style="color: #27ae60;">Incredible transformation! You've achieved extraordinary health improvements!</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            You've achieved a complete health metamorphosis. Your body functions at an optimal level with dramatically reduced disease risks across all categories.
            You likely feel like a completely different person - boundless energy, perfect sleep, pain-free movement, razor-sharp mental focus,
            and physical capabilities you may not have had in decades. This is transformational health optimization.
        </small>`;
    } else if (healthScoreImprovement >= 65) {
        return `<strong style="color: #27ae60;">Phenomenal progress! Your health transformation is truly inspiring!</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            Your health transformation is nothing short of remarkable. Your cardiovascular system operates like a well-tuned machine,
            metabolic function is optimized, and physical performance has reached new heights. You probably feel more energetic and capable
            than you have in years, with disease risks reduced to minimal levels across the board.
        </small>`;
    } else if (healthScoreImprovement >= 60) {
        return `<strong style="color: #27ae60;">Amazing achievement! You've made life-changing health improvements!</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            You've achieved life-altering health improvements. Your body operates with exceptional efficiency - sleep is consistently restorative,
            energy levels remain high throughout the day, and physical activities feel effortless. Mental clarity is sharp,
            emotional well-being stable, and your risk for chronic diseases has dropped to very low levels.
        </small>`;
    } else if (healthScoreImprovement >= 55) {
        return `<strong style="color: #27ae60;">Outstanding transformation! Your dedication is paying off tremendously!</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            Your dedication has yielded extraordinary results. You've likely regained physical capabilities from your younger years,
            with sustained high energy, excellent sleep quality, and minimal physical discomfort. Your immune system is robust,
            recovery times fast, and you handle physical and mental challenges with remarkable resilience.
        </small>`;
    } else if (healthScoreImprovement >= 50) {
        return `<strong style="color: #27ae60;">Exceptional progress! You've reached a major health milestone!</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            You've reached a major health milestone that represents years of life extension potential. Your cardiovascular system functions optimally,
            joints move freely without pain, and you sleep deeply every night. Physical activities that once seemed impossible
            are now routine, and your overall quality of life has improved dramatically.
        </small>`;
    } else if (healthScoreImprovement >= 45) {
        return `<strong style="color: #27ae60;">Remarkable achievement! Your health journey is truly impressive!</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            Your commitment has produced remarkable results. You likely wake up feeling refreshed and maintain steady energy all day.
            Physical tasks feel easier, your mood is more stable and positive, and you handle stress better than before.
            Your body has become significantly more resilient and efficient in every way.
        </small>`;
    } else if (healthScoreImprovement >= 40) {
        return `<strong style="color: #27ae60;">Fantastic transformation! You've made incredible health strides!</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            You've achieved fantastic health improvements that impact every aspect of your life. Sleep comes easily and leaves you fully restored,
            energy levels stay consistent without afternoon crashes, and physical activities bring joy rather than discomfort.
            Your mind feels sharper and your outlook more positive than it has in years.
        </small>`;
    } else if (healthScoreImprovement >= 35) {
        return `<strong style="color: #27ae60;">Excellent transformation! Your progress is remarkable!</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            You've made excellent health strides that are clearly noticeable in daily life. Your energy feels abundant and natural,
            sleep is consistently good, and you move through your day with comfort and confidence.
            Friends and family probably comment on how much healthier and more vibrant you appear.
        </small>`;
    } else if (healthScoreImprovement >= 30) {
        return `<strong style="color: #27ae60;">Superb progress! Your health transformation is outstanding!</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            You've achieved superb health improvements that represent a major lifestyle upgrade. Energy flows naturally throughout your day,
            sleep is reliably restorative, and physical movement feels smooth and pain-free. Your mood is more stable,
            stress affects you less, and you feel genuinely excited about maintaining this healthier version of yourself.
        </small>`;
    } else if (healthScoreImprovement >= 25) {
        return `<strong style="color: #27ae60;">Wonderful achievement! You're experiencing major health benefits!</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            You've achieved exceptional health improvements. Your body should feel remarkably different - lighter, stronger, more agile.
            Chronic aches and pains may have diminished significantly, breathing is easier, and you likely feel decades younger.
            Your immune system is stronger, recovery from physical exertion faster, and overall vitality dramatically enhanced.
        </small>`;
    } else if (healthScoreImprovement >= 20) {
        return `<strong style="color: #27ae60;">Outstanding progress! Your health transformation is remarkable!</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            You've achieved transformative health improvements. Physical activities that once felt challenging should now feel manageable,
            sleep is likely deep and restorative, and you probably wake feeling refreshed. Mental clarity, mood stability,
            and physical stamina have all improved dramatically. Your risk profile has shifted significantly toward optimal health.
        </small>`;
    } else if (healthScoreImprovement >= 15) {
        return `<strong style="color: #27ae60;">Excellent health improvements! You're making fantastic progress!</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            You're experiencing major health transformations. Movement should feel significantly easier, sleep quality markedly improved,
            and energy levels substantially higher throughout the day. Inflammation is reducing, breathing may be easier,
            and your cardiovascular system is becoming noticeably stronger. These gains compound daily.
        </small>`;
    } else if (healthScoreImprovement >= 10) {
        return `<strong style="color: #27ae60;">Great progress! You should be feeling healthier!</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            You're experiencing substantial health improvements. Blood pressure is likely lowering, joint pain reducing,
            sleep becoming more restful, and energy levels increasing. Your mood may be more stable, and daily tasks
            should feel easier. These improvements create momentum for continued positive health changes.
        </small>`;
    } else if (healthScoreImprovement >= 5) {
        return `<strong style="color: #27ae60;">Good progress! Your health is improving!</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            You're experiencing noticeable health improvements. Your cardiovascular system is getting stronger, joint stress is reducing,
            sleep quality may be improving, and you should feel increased energy during daily activities.
            These positive changes are building a foundation for even greater health gains ahead.
        </small>`;
    } else if (healthScoreImprovement >= 1) {
        return `<strong style="color: #27ae60;">Every step forward matters!</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            You're beginning to see small but meaningful health improvements. Your body is starting to respond positively,
            with early benefits like slightly better sleep, reduced strain on joints, and improved cardiovascular function.
            Continue with your healthy habits - these small changes build momentum for bigger improvements ahead.
        </small>`;
    } else if (healthScoreImprovement >= -4) {
        return `<strong style="color: #f39c12;">Time to refocus! Small changes can get you back on track.</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            Your health score has declined slightly, but this is temporary and fixable. Small adjustments to your habits can quickly
            turn this around. Focus on consistent healthy choices - even modest improvements will start moving your score upward again.
        </small>`;
    } else if (healthScoreImprovement >= -9) {
        return `<strong style="color: #f39c12;">Let's reverse this trend! You have the power to improve.</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            Your health score has decreased by ${Math.abs(healthScoreImprovement)} points, but you can turn this around. Focus on getting back to
            healthy eating habits, regular activity, and good sleep. Even small consistent changes will start improving your health metrics.
        </small>`;
    } else if (healthScoreImprovement >= -14) {
        return `<strong style="color: #e67e22;">Important reminder: Your health needs attention.</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            With a ${Math.abs(healthScoreImprovement)}-point decline, it's time to prioritize your health. Consider returning to previous healthy habits
            that worked for you. Small, consistent steps can help you regain lost ground and start moving in a positive direction again.
        </small>`;
    } else if (healthScoreImprovement >= -19) {
        return `<strong style="color: #e67e22;">Health alert: Time for action to reverse this decline.</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            Your ${Math.abs(healthScoreImprovement)}-point decrease indicates your health risks are increasing. This is a good time to recommit to
            healthy habits. Focus on sustainable changes in diet and activity - your body responds quickly to positive choices.
        </small>`;
    } else if (healthScoreImprovement >= -24) {
        return `<strong style="color: #e74c3c;">Significant concern: Your health metrics need immediate attention.</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            A ${Math.abs(healthScoreImprovement)}-point decline is substantial and indicates increasing health risks across multiple categories.
            Consider consulting with a healthcare provider and developing a structured plan to address weight and health management.
            It's not too late to reverse this trend.
        </small>`;
    } else {
        return `<strong style="color: #e74c3c;">Serious health alert: Immediate action needed.</strong><br>
        <small class="text-muted" style="line-height: 1.4;">
            Your health score has declined by ${Math.abs(healthScoreImprovement)} points, indicating significantly increased health risks.
            Please consider seeking professional medical guidance to develop a comprehensive plan for improving your health.
            Remember, positive changes can start improving your health immediately.
        </small>`;
    }
}

// Update health benefit cards with current data
function updateHealthBenefitCards() {
    console.log('Health benefits - checking for data to update cards...');

    $.post('router.php?controller=profile', { action: 'get_weight_progress' }, function(resp) {
        const data = parseJson(resp);
        console.log('Health benefits - weight progress data:', data);

        if (data.success && (data.start_weight_kg || data.start_weight) && (data.current_weight_kg || data.current_weight) && data.height_cm) {
            const startWeight = parseFloat(data.start_weight_kg || data.start_weight);
            const currentWeight = parseFloat(data.current_weight_kg || data.current_weight);
            const height = parseFloat(data.height_cm) / 100.0;

            const startBMI = startWeight / (height * height);
            const currentBMI = currentWeight / (height * height);
            const bmiReduction = startBMI - currentBMI;
            const weightLoss = startWeight - currentWeight;

            if (bmiReduction > 0) { // Show any progress
                // Calculate actual benefits based on user's BMI reduction
                const benefitMultiplier = bmiReduction / 5.0;

                // Update diabetes card with risk percentages based on BMI
                const originalRisk = getBMIRisk(startBMI);
                const currentRisk = getBMIRisk(currentBMI);
                const riskReduction = originalRisk - currentRisk;
                $('#diabetes-block').html(`Current Risk: <strong>${currentRisk}%</strong><br>Started at: <strong>${originalRisk}%</strong> (${startBMI.toFixed(1)} BMI)<br>Risk reduced by <strong class="text-success">${riskReduction} percentage points</strong><br><small class="text-muted">Weight loss significantly reduces diabetes incidence and HbA1c levels (American Diabetes Association, 2023)</small>`).removeClass('text-muted');

                // Update sleep apnea card with risk percentages
                const originalSleepRisk = getSleepApneaRisk(startBMI);
                const currentSleepRisk = getSleepApneaRisk(currentBMI);
                const sleepRiskReduction = originalSleepRisk - currentSleepRisk;
                $('#sleep-apnea-block').html(`Current Risk: <strong>${currentSleepRisk}%</strong><br>Started at: <strong>${originalSleepRisk}%</strong> (${startBMI.toFixed(1)} BMI)<br>Risk reduced by <strong class="text-success">${sleepRiskReduction} percentage points</strong><br><small class="text-muted">Weight loss significantly reduces sleep apnea severity and improves sleep quality (Peppard et al., 2013, Am J Respir Crit Care Med)</small>`).removeClass('text-muted');

                // Update hypertension card with risk percentages
                const originalHypertensionRisk = getHypertensionRisk(startBMI);
                const currentHypertensionRisk = getHypertensionRisk(currentBMI);
                const hypertensionRiskReduction = originalHypertensionRisk - currentHypertensionRisk;
                $('#hypertension-block').html(`Current Risk: <strong>${currentHypertensionRisk}%</strong><br>Started at: <strong>${originalHypertensionRisk}%</strong> (${startBMI.toFixed(1)} BMI)<br>Risk reduced by <strong class="text-success">${hypertensionRiskReduction} percentage points</strong><br><small class="text-muted">Blood pressure typically drops 5-10 mmHg systolic/diastolic with weight loss (Whelton et al., 2018, JAMA)</small>`).removeClass('text-muted');

                // Update fatty liver card with risk percentages
                const originalFattyLiverRisk = getFattyLiverRisk(startBMI);
                const currentFattyLiverRisk = getFattyLiverRisk(currentBMI);
                const fattyLiverRiskReduction = originalFattyLiverRisk - currentFattyLiverRisk;
                $('#fatty-liver-block').html(`Current Risk: <strong>${currentFattyLiverRisk}%</strong><br>Started at: <strong>${originalFattyLiverRisk}%</strong> (${startBMI.toFixed(1)} BMI)<br>Risk reduced by <strong class="text-success">${fattyLiverRiskReduction} percentage points</strong><br><small class="text-muted">Early-stage NAFLD can often be reversed with weight loss (Chalasani et al., 2018, Hepatology)</small>`).removeClass('text-muted');

                // Update heart disease card with risk percentages
                const originalHeartRisk = getHeartDiseaseRisk(startBMI);
                const currentHeartRisk = getHeartDiseaseRisk(currentBMI);
                const heartRiskReduction = originalHeartRisk - currentHeartRisk;
                $('#heart-disease-block').html(`Current Risk: <strong>${currentHeartRisk}%</strong><br>Started at: <strong>${originalHeartRisk}%</strong> (${startBMI.toFixed(1)} BMI)<br>Risk reduced by <strong class="text-success">${heartRiskReduction} percentage points</strong><br><small class="text-muted">Stronger cardiovascular protection with central obesity reduction (Lavie et al., 2021, Circulation)</small>`).removeClass('text-muted');

                // Update mental health card with risk percentages
                const originalMentalRisk = getMentalHealthRisk(startBMI);
                const currentMentalRisk = getMentalHealthRisk(currentBMI);
                const mentalRiskReduction = originalMentalRisk - currentMentalRisk;
                $('#mental-health-block').html(`Current Risk: <strong>${currentMentalRisk}%</strong><br>Started at: <strong>${originalMentalRisk}%</strong> (${startBMI.toFixed(1)} BMI)<br>Risk reduced by <strong class="text-success">${mentalRiskReduction} percentage points</strong><br><small class="text-muted">Weight loss improves mood, self-esteem and reduces inflammation (Luppino et al., 2010, Arch Gen Psychiatry)</small>`).removeClass('text-muted');

                // Update joint health card with risk percentages
                const originalJointRisk = getJointHealthRisk(startBMI);
                const currentJointRisk = getJointHealthRisk(currentBMI);
                const jointRiskReduction = originalJointRisk - currentJointRisk;
                $('#joint-health-block').html(`Current Risk: <strong>${currentJointRisk}%</strong><br>Started at: <strong>${originalJointRisk}%</strong> (${startBMI.toFixed(1)} BMI)<br>Risk reduced by <strong class="text-success">${jointRiskReduction} percentage points</strong><br><small class="text-muted">Reduced joint load leads to slower progression of knee and hip osteoarthritis (Messier et al., 2013, Arthritis Rheumatol)</small>`).removeClass('text-muted');

                // Update life expectancy card
                const lifeIncrease = Math.min(5, (bmiReduction / 5.0) * 3.5);
                $('#life-expectancy-block').html(`Life Expectancy Increase: <strong>${lifeIncrease.toFixed(1)} years</strong><br>Started at: <strong>${startBMI.toFixed(1)} BMI</strong><br>Improvement from <strong class="text-success">${bmiReduction.toFixed(1)} BMI reduction</strong><br><small class="text-muted">Stronger benefits when weight loss occurs earlier in life (Flegal et al., 2013, JAMA)</small>`).removeClass('text-muted');

                // Calculate comprehensive health score
                const startingHealthScore = calculateHealthScore(startBMI);
                const currentHealthScore = calculateHealthScore(currentBMI);
                const healthScoreImprovement = currentHealthScore - startingHealthScore;

                // Update personal benefits calculator with visual health score bar
                const calculatorDiv = $('#personal-benefits-calculator');
                const startPosition = startingHealthScore;
                const currentPosition = currentHealthScore;

                calculatorDiv.html(`
                    <!-- Health Score Title and Score Display -->
                    <div class="d-flex justify-content-between align-items-start health-score-margin health-score-header">
                        <h5 class="card-title mb-0">📊 Health Score</h5>
                        <div class="health-score-display-stacked">
                            <div class="health-score-number">${currentHealthScore}/100</div>
                            <div class="health-score-improvement-below text-success">+${healthScoreImprovement} points</div>
                        </div>
                    </div>

                    <div class="row">
                        <!-- Left Column: Progress Summary -->
                        <div class="col-md-3">
                            <div class="progress-summary">
                                <strong>Progress Summary</strong><br>
                                Started at: <strong>${startingHealthScore}/100</strong><br>
                                <small class="text-muted">Based on ${weightLoss.toFixed(1)} kg weight loss across all 14 health categories on this page</small>
                            </div>
                        </div>

                        <!-- Right Column: Health Bar & Feeling Healthier -->
                        <div class="col-md-9">
                            <div class="health-bar-container">
                                <!-- Health Score Bar -->
                                <div class="health-score-bar"></div>

                                <!-- Score markers -->
                                <div class="health-marker start" style="left: ${startPosition}%;"></div>
                                <div class="health-marker-label start" style="left: ${startPosition}%;">START</div>

                                <div class="health-marker current" style="left: ${currentPosition}%;"></div>
                                <div class="health-marker-label current" style="left: ${currentPosition}%;">NOW</div>

                                <!-- Score labels -->
                                <div class="health-scale-label poor">Poor<br>0</div>
                                <div class="health-scale-label fair">Fair<br>25</div>
                                <div class="health-scale-label good">Good<br>50</div>
                                <div class="health-scale-label very-good">Very Good<br>75</div>
                                <div class="health-scale-label excellent">Excellent<br>100</div>
                            </div>

                            <div class="health-improvement-message">
                                ${getHealthImprovementMessage(healthScoreImprovement)}
                            </div>
                        </div>
                    </div>
                `).removeClass('text-muted');

            } else {
                // Reset to default messages if no progress yet
                console.log('Health benefits - no meaningful progress yet, BMI reduction:', bmiReduction);
            }
        } else {
            console.log('Health benefits - missing data:', data);
        }
    });
}

// Refresh personal health benefits display
function refreshPersonalHealthBenefits() {
    updateHealthBenefitCards();
}

function refreshBMI() {
    if (window.coverage) window.coverage.logFunction('refreshBMI', 'health.js');
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
            lines.push(`<small class="text-muted">BMI correlates with health risks. BMI reduction significantly lowers disease risk (Prospective Studies Collaboration, 2009)</small>`);
            el.html(lines.join('<br>')).removeClass('text-muted');
        });
    });
}

function refreshHealth() {
    if (window.coverage) window.coverage.logFunction('refreshHealth', 'health.js');
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
            bodyFatLines.push(`<small class="text-muted">Body fat estimated via Deurenberg formula (BMI + age). Each 1% body fat reduction can improve metabolic health (Jackson et al., 2002)</small>`);

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
    if (window.coverage) window.coverage.logFunction('refreshIdealWeight', 'health.js');
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

// Make functions globally available
window.healthRefreshBMI = refreshBMI;
window.healthRefreshHealth = refreshHealth;
window.healthRefreshIdealWeight = refreshIdealWeight;
window.healthRefreshGallbladderHealth = refreshGallbladderHealth;

function refreshGallbladderHealth() {
    if (window.coverage) window.coverage.logFunction('refreshGallbladderHealth', 'health.js');
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