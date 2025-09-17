<?php
session_start();
require_once('/var/app/backend/AuthManager.php');

// Simple dashboard shown after successful login
if (!AuthManager::isLoggedIn()) {
    header('Location: index.php');
    exit;
}

$email = htmlspecialchars($_SESSION['email'] ?? '');
$firstName = htmlspecialchars($_SESSION['first_name'] ?? '');
$lastName = htmlspecialchars($_SESSION['last_name'] ?? '');
$loginTime = '';
if (isset($_SESSION['login_time'])) {
    try {
        $tz = new DateTimeZone('Europe/London');
        $dt = new DateTime('@' . (int) $_SESSION['login_time']); // epoch base (UTC)
        $dt->setTimezone($tz); // convert to UK local time (handles DST)
        // Short UK format (24-hour, no seconds), e.g., 09/09/2025 07:21
        $loginTime = $dt->format('d/m/Y H:i');
    } catch (Exception $e) {
        // Fallback if something goes wrong
        $loginTime = date('d/m/Y H:i', (int) $_SESSION['login_time']);
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Weightloss Tracker</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Global Styles -->
    <link rel="stylesheet" href="css/global.css?v=<?php echo time(); ?>">
    <!-- Page-specific Styles -->
    <link rel="stylesheet" href="css/dashboard.css?v=<?php echo time(); ?>">
</head>
<body>
<!-- Fixed Alert Container -->
<div id="alert-container"></div>

<div class="container">
    <div class="row justify-content-center align-items-start min-vh-100 py-4">
        <div class="col-lg-10">
            <!-- Header Card -->
            <div class="glass-card">
                <!-- First Row: Logo and Welcome Text -->
                <div class="d-flex align-items-center header-top-row mb-2">
                    <div class="logo-section-compact">
                        <div class="logo-icon">
                            <svg viewBox="0 0 44 44" class="progress-ring">
                                <circle cx="22" cy="22" r="15" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="12"/>
                                <circle cx="22" cy="22" r="15" fill="none" stroke="#64a6d8" stroke-width="12"
                                        stroke-linecap="round" class="progress-ring-circle"/>
                            </svg>
                        </div>
                        <div class="logo-text">Weightloss<br>Tracker</div>
                    </div>

                    <div class="welcome-content flex-grow-1 mx-4">
                        <h1 class="welcome-title mb-1">Welcome!</h1>
                        <p class="welcome-subtitle mb-0">Track your weightloss journey and achieve your goals</p>
                    </div>
                </div>

                <!-- Second Row: User Info and Buttons -->
                <div class="d-flex align-items-center justify-content-between header-bottom-row">
                    <div class="header-left d-flex align-items-center">
                        <div class="user-info text-left">
                            <div class="mb-1"><?php echo $email; ?></div>
                            <?php if ($loginTime): ?>
                                <div class="text-muted small">Login: <?php echo $loginTime; ?></div>
                            <?php endif; ?>
                        </div>
                    </div>

                    <div class="d-flex align-items-center header-buttons">
                        <?php if ($_SERVER['HTTP_HOST'] === '127.0.0.1:8111'): ?>
                        <a class="btn secondary-btn btn-sm me-2" href="test/test-interface.php">⚗ Test Interface</a>
                        <?php endif; ?>
                        <button id="btn-logout" class="btn danger-btn btn-sm">↪ Logout</button>
                    </div>
                </div>
            </div>
            
            <!-- Dashboard Tabs -->
            <div class="glass-card">
                <ul class="nav nav-tabs d-flex justwrap" id="dashboardTabs" role="tablist">
                    <li class="nav-item flex-fill" role="presentation">
                        <a class="nav-link active text-center menu-text" id="data-tab" data-toggle="tab" href="#data" role="tab">
                            <span class="tab-icon">📊</span>Data
                        </a>
                    </li>
                    <li class="nav-item flex-fill" role="presentation">
                        <a class="nav-link text-center menu-text" id="health-tab" data-toggle="tab" href="#health" role="tab">
                            <span class="tab-icon">💚</span>Health
                        </a>
                    </li>
                    <li class="nav-item flex-fill" role="presentation">
                        <a class="nav-link text-center menu-text" id="achievements-tab" data-toggle="tab" href="#achievements" role="tab">
                            <span class="tab-icon">🏆</span>Achievements
                        </a>
                    </li>
                    <li class="nav-item flex-fill" role="presentation">
                        <a class="nav-link text-center menu-text" id="settings-tab" data-toggle="tab" href="#settings" role="tab">
                            <span class="tab-icon">⚙️</span>Settings
                        </a>
                    </li>
                </ul>
                
                <div class="tab-content" id="dashboardTabsContent">
                    <!-- Data Management Tab -->
                    <div class="tab-pane fade show active" id="data" role="tabpanel">
                        <!-- Weight Tracking Cards -->
                        <div class="row">
                <div class="col-md-6">
                    <div class="glass-card-small">
                        <h5 class="card-title">📊 Log Current Weight</h5>
                        <div class="row">
                            <div class="col-8">
                                <input type="number" step="0.1" min="0" id="weightKg" class="form-control glass-input" placeholder="Weight">
                            </div>
                            <div class="col-4">
                                <button id="btn-add-weight" class="btn primary-btn w-100">✓ Save</button>
                            </div>
                        </div>
                        <small class="text-muted d-block mt-2" id="latest-weight"></small>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="glass-card-small">
                        <h5 class="card-title">🎯 Set Weight Goal</h5>
                        <div class="row mb-2">
                            <div class="col-12">
                                <input type="number" step="0.1" min="0" id="goalWeight" class="form-control glass-input mb-2" placeholder="Target weight">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-8">
                                <input type="date" id="goalDate" class="form-control glass-input">
                            </div>
                            <div class="col-4">
                                <button id="btn-save-goal" class="btn primary-btn w-100">✓ Save</button>
                            </div>
                        </div>
                        <small class="text-muted d-block mt-2" id="current-goal"></small>
                    </div>
                </div>
            </div>


            <!-- Weight History Card -->
            <div class="glass-card">
                <div class="d-flex justify-content-between align-items-center mb-3 weight-history-header">
                    <h5 class="card-title mb-0">📈 Weight History</h5>
                    <button id="btn-add-entry" class="btn primary-btn">+ Add Entry</button>
                </div>
                
                <!-- Add New Entry Form (hidden by default) -->
                <div id="add-entry-form" class="mb-4 hidden">
                    <div class="row">
                        <div class="col-md-4">
                            <label for="newWeight" class="form-label" id="new-weight-label">Weight</label>
                            <input type="number" step="0.1" min="0" id="newWeight" class="form-control glass-input weight-input" placeholder="e.g. 75.5">
                        </div>
                        <div class="col-md-4">
                            <label for="newDate" class="form-label">Date</label>
                            <input type="date" id="newDate" class="form-control glass-input date-input">
                        </div>
                        <div class="col-md-4 d-flex align-items-end form-gap">
                            <button id="btn-save-entry" class="btn primary-btn">💾 Save</button>
                            <button id="btn-cancel-entry" class="btn secondary-btn">❌ Cancel</button>
                        </div>
                    </div>
                </div>

                <!-- Weight History Table -->
                <div class="table-responsive weight-history-container">
                    <table class="table glass-table mb-0">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th id="weight-column-header">Weight</th>
                                <th>Change</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="weight-history-body">
                            <tr>
                                <td colspan="4" class="no-data">Loading weight history...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Profile Card -->
            <div id="profile-card" class="glass-card">
                <h5 class="card-title">🔧 Profile Settings</h5>
                <div class="row">
                    <div class="form-group col-md-3">
                        <label for="heightCm" class="form-label" id="height-label">Height</label>
                        <input type="number" min="50" max="300" id="heightCm" class="form-control glass-input" placeholder="e.g. 175">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="bodyFrame" class="form-label">Body Frame</label>
                        <select id="bodyFrame" class="form-control glass-input">
                            <option value="">Select</option>
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                        </select>
                    </div>
                    <div class="form-group col-md-3">
                        <label for="age" class="form-label">Age</label>
                        <input type="number" min="5" max="120" id="age" class="form-control glass-input" placeholder="e.g. 35">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="activityLevel" class="form-label">Activity Level</label>
                        <select id="activityLevel" class="form-control glass-input">
                            <option value="">Select</option>
                            <option value="sedentary">Sedentary</option>
                            <option value="light">Light</option>
                            <option value="moderate">Moderate</option>
                            <option value="very">Very Active</option>
                            <option value="athlete">Athlete</option>
                        </select>
                    </div>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <span id="profile-status" class="text-muted"></span>
                    <button id="btn-save-profile" class="btn primary-btn">✓ Save Profile</button>
                </div>
            </div>
                    </div>
                    
                    <!-- Health Insights Tab -->
                    <div class="tab-pane fade" id="health" role="tabpanel">
                        <!-- Personal Benefits Info -->
                        <div class="row">
                            <div class="col-md-12">
                                <div class="glass-card-small">
                                    <div id="personal-benefits-calculator" class="text-muted">
                                        Complete your profile and set a weight goal to see personalized health benefit projections.
                                        <div id="personal-benefits-display" class="personal-benefits-display">
                                            <!-- Calculated benefits will appear here -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Health Stats Cards -->
                        <div class="row">
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title">📏 BMI Analysis</h5>
                                    <div id="bmi-block" class="text-muted">Enter your height and log a recent weight to see your BMI.</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title">💪 Body Fat Estimate</h5>
                                    <div id="body-fat-block" class="text-muted">Provide age and complete profile for body fat estimation.</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title">❤️ Cardiovascular Risk</h5>
                                    <div id="cardio-risk-block" class="text-muted">Complete profile for cardiovascular risk assessment.</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title">🎯 Ideal Weight Range</h5>
                                    <div id="ideal-weight-block" class="text-muted">Set your height to calculate your ideal weight range.</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title">📈 Weight Progress</h5>
                                    <div id="progress-block" class="text-muted">Log multiple weights to see your progress trends.</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title">🫀 Gallbladder Health</h5>
                                    <div id="gallbladder-block" class="text-muted">Weight loss data needed to assess gallbladder health benefits.</div>
                                </div>
                            </div>
                        </div>

                        <!-- Health Benefits Row -->
                        <div class="row">
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title">🩺 Type 2 Diabetes Risk</h5>
                                    <div id="diabetes-block" class="text-muted">Log weights to see your current risk % vs starting risk %. Risk based on BMI level.</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title">😴 Sleep Apnea Improvement</h5>
                                    <div id="sleep-apnea-block" class="text-muted">Log weights to see your current risk % vs starting risk %. Risk based on BMI level.</div>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title">❤️ Hypertension Risk</h5>
                                    <div id="hypertension-block" class="text-muted">Log weights to see your current risk % vs starting risk %. Risk based on BMI level.</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title">🫀 Fatty Liver Disease</h5>
                                    <div id="fatty-liver-block" class="text-muted">Log weights to see your current risk % vs starting risk %. Risk based on BMI level.</div>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title">💓 Heart Disease Risk</h5>
                                    <div id="heart-disease-block" class="text-muted">Log weights to see your current risk % vs starting risk %. Risk based on BMI level.</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title">🧠 Mental Health Benefits</h5>
                                    <div id="mental-health-block" class="text-muted">5-15% improvement in mood and self-esteem. Reduced inflammation and better metabolic function.</div>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title">🦴 Joint Health (Arthritis)</h5>
                                    <div id="joint-health-block" class="text-muted">20-30% less joint stress with weight loss. Slower progression of knee and hip osteoarthritis.</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title">🌟 Life Expectancy</h5>
                                    <div id="life-expectancy-block" class="text-muted">2-5 years increase in life expectancy. Stronger benefits if weight loss occurs earlier in life.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Achievements Tab -->
                    <div class="tab-pane fade" id="achievements" role="tabpanel">
                        <!-- Weight Loss Chart -->
                        <div class="glass-card">
                            <div class="mb-3">
                                <h5 class="card-title mb-2">📈 Weightloss Chart</h5>
                                <div class="btn-group btn-group-sm chart-period-buttons" role="group">
                                    <button type="button" class="btn secondary-btn" id="chart-weekly">Weekly</button>
                                    <button type="button" class="btn secondary-btn" id="chart-30days">30 Days</button>
                                    <button type="button" class="btn secondary-btn" id="chart-90days">90 Days</button>
                                    <button type="button" class="btn secondary-btn" id="chart-monthly">Monthly</button>
                                    <button type="button" class="btn secondary-btn" id="chart-yearly">Yearly</button>
                                    <button type="button" class="btn secondary-btn active" id="chart-all">All Time</button>
                                </div>
                            </div>
                            <div class="chart-container">
                                <canvas id="weightChart"></canvas>
                            </div>
                            <div id="chart-navigation" class="d-flex justify-content-between align-items-center mb-3 chart-navigation">
                                <button type="button" class="btn secondary-btn btn-sm" id="chart-prev" title="Previous period">
                                    ← Previous
                                </button>
                                <div id="chart-period-info" class="text-center text-muted small">
                                    <!-- Period info will be displayed here -->
                                </div>
                                <button type="button" class="btn secondary-btn btn-sm" id="chart-next" title="Next period">
                                    Next →
                                </button>
                            </div>
                            <div id="chart-status" class="text-center text-muted">
                                Loading weight history for chart...
                            </div>
                        </div>
                        
                        <!-- Achievement Cards -->
                        <div class="row mt-3">
                            <div class="col-md-4">
                                <div class="glass-card-small text-center">
                                    <h6 class="card-title">🎯 Goals Achieved</h6>
                                    <div id="goals-achieved" class="text-muted small">Connect your goals to track achievements</div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="glass-card-small text-center">
                                    <h6 class="card-title">🔥 Streak Counter</h6>
                                    <div id="streak-counter" class="text-muted small">Track daily logging streaks</div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="glass-card-small text-center">
                                    <h6 class="card-title">📊 Total Progress</h6>
                                    <div id="total-progress" class="text-muted small">Loading progress stats...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Settings Tab -->
                    <div class="tab-pane fade" id="settings" role="tabpanel">
                        <div class="row">
                            <!-- Units & Measurements -->
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title">📏 Units & Measurements</h5>
                                    
                                    <div class="form-group mb-3">
                                        <label for="weightUnit" class="form-label">Weight Unit</label>
                                        <select id="weightUnit" class="form-control glass-input">
                                            <option value="kg">Kilograms (kg)</option>
                                            <option value="lbs">Pounds (lbs)</option>
                                            <option value="st">Stones (st)</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group mb-3">
                                        <label for="heightUnit" class="form-label">Height Unit</label>
                                        <select id="heightUnit" class="form-control glass-input">
                                            <option value="cm">Centimeters (cm)</option>
                                            <option value="ft">Feet & Inches (ft/in)</option>
                                            <option value="m">Meters (m)</option>
                                        </select>
                                    </div>
                                    
                                </div>
                            </div>
                            
                            <!-- Date & Time -->
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title">📅 Date & Time</h5>
                                    
                                    <div class="form-group mb-3">
                                        <label for="dateFormat" class="form-label">Date Format</label>
                                        <select id="dateFormat" class="form-control glass-input">
                                            <option value="uk">UK Format (DD/MM/YYYY)</option>
                                            <option value="us">US Format (MM/DD/YYYY)</option>
                                            <option value="iso">ISO Format (YYYY-MM-DD)</option>
                                            <option value="euro">European (DD.MM.YYYY)</option>
                                        </select>
                                        <small class="text-muted">Example: <span id="dateExample">11/09/2025</span></small>
                                    </div>
                                    
                                    
                                    <div class="form-group mb-3">
                                        <label for="timezone" class="form-label">Timezone</label>
                                        <select id="timezone" class="form-control glass-input">
                                            <option value="Europe/London">London (GMT/BST)</option>
                                            <option value="America/New_York">New York (EST/EDT)</option>
                                            <option value="America/Los_Angeles">Los Angeles (PST/PDT)</option>
                                            <option value="Europe/Paris">Paris (CET/CEST)</option>
                                            <option value="Asia/Tokyo">Tokyo (JST)</option>
                                            <option value="Australia/Sydney">Sydney (AEDT/AEST)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Privacy & Data -->
                        <div class="row">
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title">🔒 Privacy & Data</h5>
                                    
                                    <div class="form-check mb-3">
                                        <input class="form-check-input" type="checkbox" id="shareData">
                                        <label class="form-check-label" for="shareData">
                                            Share anonymous data for research
                                        </label>
                                        <small class="form-text text-muted">Help improve the app by sharing anonymized usage statistics</small>
                                    </div>
                                    
                                    <div class="form-check mb-3">
                                        <input class="form-check-input" type="checkbox" id="emailNotifications">
                                        <label class="form-check-label" for="emailNotifications">
                                            Email notifications for reminders
                                        </label>
                                    </div>
                                    
                                    <div class="form-check mb-3">
                                        <input class="form-check-input" type="checkbox" id="weeklyReports">
                                        <label class="form-check-label" for="weeklyReports">
                                            Monthly progress reports
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- App Preferences -->
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title">🎨 App Preferences</h5>
                                    
                                    <div class="form-group mb-3">
                                        <label for="theme" class="form-label">Theme</label>
                                        <select id="theme" class="form-control glass-input">
                                            <option value="glassmorphism">Glassmorphism (Current)</option>
                                            <option value="dark">Dark Mode</option>
                                            <option value="light">Light Mode</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group mb-3">
                                        <label for="language" class="form-label">Language</label>
                                        <select id="language" class="form-control glass-input">
                                            <option value="en">English</option>
                                            <option value="es">Español</option>
                                            <option value="fr">Français</option>
                                            <option value="de">Deutsch</option>
                                        </select>
                                    </div>
                                    
                                    <div class="form-group mb-3">
                                        <label for="startOfWeek" class="form-label">Start of Week</label>
                                        <select id="startOfWeek" class="form-control glass-input">
                                            <option value="monday">Monday</option>
                                            <option value="sunday">Sunday</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Save Settings -->
                        <div class="text-center mt-4">
                            <button id="btn-save-settings" class="btn primary-btn mr-2">✓ Save Settings</button>
                            <button id="btn-reset-settings" class="btn secondary-btn">↻ Reset to Defaults</button>
                            <div class="mt-2">
                                <span id="settings-status" class="text-muted"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Coverage Logging (Development only) -->
<script src="js/coverage.js?v=<?php echo time(); ?>"></script>
<!-- Global Scripts -->
<script src="js/global.js?v=<?php echo time(); ?>"></script>
<!-- Modular JS files -->
<script src="js/health.js?v=<?php echo time(); ?>"></script>
<script src="js/data.js?v=<?php echo time(); ?>"></script>
<script src="js/achievements.js?v=<?php echo time(); ?>"></script>
<script src="js/settings.js?v=<?php echo time(); ?>"></script>
<script src="js/dashboard.js?v=<?php echo time(); ?>"></script>
</body>
</html>
