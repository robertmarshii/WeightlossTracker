<?php
session_start();

// Simple dashboard shown after successful login
$isLoggedIn = isset($_SESSION['user_id']) && isset($_SESSION['login_time']);
if (!$isLoggedIn) {
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
    <!-- Custom Styles -->
    <style>
        body {
            background: linear-gradient(135deg, #1e3a5f 0%, #2c5f7b 25%, #1a2a3a 75%, #0f1419 100%);
            min-height: 100vh;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .glass-card {
            background: rgba(30, 58, 95, 0.4);
            backdrop-filter: blur(15px);
            border-radius: 20px;
            border: 1px solid rgba(100, 150, 200, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            padding: 2rem;
            margin-bottom: 2rem;
            color: white;
        }
        
        .glass-card-small {
            background: rgba(30, 58, 95, 0.4);
            backdrop-filter: blur(15px);
            border-radius: 15px;
            border: 1px solid rgba(100, 150, 200, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            color: white;
            min-height: 220px;
        }
        
        .header-left {
            flex: 1;
        }
        
        .header-right {
            flex-shrink: 0;
        }
        
        .user-info {
            font-size: 0.9rem;
        }
        
        .logo-section-compact {
            text-align: center;
        }
        
        .logo-icon {
            width: 50px;
            height: 50px;
            background: rgba(100, 150, 200, 0.3);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 0.5rem;
            font-size: 20px;
            color: #64a6d8;
        }
        
        .logo-icon svg {
            width: 28px;
            height: 28px;
        }
        
        .progress-ring {
            animation: rotate 4s linear infinite;
        }
        
        .progress-ring-circle {
            stroke-dasharray: 94;
            stroke-dashoffset: 94;
            animation: progress 4s ease-in-out infinite;
        }
        
        @keyframes rotate {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
        }
        
        @keyframes progress {
            0% {
                stroke-dashoffset: 94;
            }
            50% {
                stroke-dashoffset: 23.5;
            }
            100% {
                stroke-dashoffset: 94;
            }
        }
        
        .logo-text {
            color: #879cab;
            font-size: 0.7rem;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 0;
        }
        
        .welcome-title {
            color: white;
            font-size: 2rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
        }
        
        .welcome-subtitle {
            color: rgba(255, 255, 255, 0.8);
            margin-bottom: 2rem;
            font-size: 0.9rem;
        }
        
        .glass-input {
            background: rgba(20, 40, 60, 0.6);
            border: 1px solid rgba(100, 150, 200, 0.3);
            border-radius: 10px;
            color: white;
            padding: 12px 16px;
            min-height: 48px;
        }
        
        .glass-input select {
            line-height: 1.5;
        }
        
        /* Move dropdown arrow away from right edge */
        select.glass-input {
            background-position: right 12px center;
            padding-right: 40px;
        }
        
        .glass-input::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }
        
        .glass-input:focus {
            background: rgba(30, 50, 70, 0.8);
            border-color: rgba(100, 166, 216, 0.6);
            box-shadow: 0 0 0 0.2rem rgba(100, 166, 216, 0.2);
            color: white;
        }
        
        /* Calendar icon styling */
        .glass-input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
            cursor: pointer;
        }
        
        .glass-input[type="date"]::-moz-calendar-picker-indicator {
            filter: invert(1);
            cursor: pointer;
        }
        
        .primary-btn {
            background: #434b5b;
            border: none;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            padding: 8px 16px;
            transition: all 0.3s ease;
        }
        
        .primary-btn:hover {
            background: #355f7e;
            transform: translateY(-1px);
            color: white;
        }
        
        .secondary-btn {
            background: rgba(100, 150, 200, 0.3);
            border: 1px solid rgba(100, 150, 200, 0.3);
            border-radius: 10px;
            color: white;
            font-weight: 500;
            padding: 8px 14px;
            transition: all 0.3s ease;
        }
        
        .secondary-btn:hover {
            background: rgba(100, 150, 200, 0.4);
            color: white;
        }
        
        .danger-btn {
            background: rgba(60, 60, 60, 0.8);
            border: 1px solid rgba(80, 80, 80, 0.5);
            border-radius: 10px;
            color: white;
            font-weight: 500;
            padding: 8px 14px;
            transition: all 0.3s ease;
        }
        
        .danger-btn:hover {
            background: rgba(40, 40, 40, 0.9);
            color: white;
        }
        
        .card-title {
            color: white;
            font-weight: 600;
            margin-bottom: 1rem;
        }
        
        .text-muted {
            color: rgba(255, 255, 255, 0.6) !important;
            font-size: 0.75rem !important;
        }
        
        .form-label {
            color: rgba(255, 255, 255, 0.8);
            font-weight: 500;
            margin-bottom: 0.5rem;
        }
        
        #alert-container {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 9999;
            min-width: 320px;
            max-width: 500px;
            width: auto;
        }
        
        #alert-container .alert {
            margin-bottom: 0;
            backdrop-filter: blur(10px);
            background: rgba(30, 58, 95, 0.95) !important;
            border: 1px solid rgba(100, 150, 200, 0.3);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            color: white !important;
        }
        
        #alert-container .alert-success {
            background: rgba(40, 80, 40, 0.95) !important;
            border-color: rgba(100, 200, 100, 0.3);
            color: white !important;
        }
        
        #alert-container .alert .close {
            color: rgba(255, 255, 255, 0.8) !important;
            opacity: 0.8;
        }
        
        #alert-container .alert .close:hover {
            color: white !important;
            opacity: 1;
        }
        
        .btn-link {
            color: #64a6d8;
        }
        
        .btn-link:hover {
            color: #5294c4;
        }
        
        .text-info {
            color: #64a6d8 !important;
        }
        
        .text-success {
            color: #7bc96f !important;
        }
        
        .text-danger {
            color: #e85d75 !important;
        }
        
        .glass-table {
            background: rgba(20, 40, 60, 0.4);
            border-radius: 15px;
            border: 1px solid rgba(100, 150, 200, 0.2);
            overflow: hidden;
            backdrop-filter: blur(10px);
        }
        
        .glass-table thead th {
            background: rgba(30, 58, 95, 0.6);
            color: white;
            font-weight: 600;
            border: none;
            padding: 1rem;
        }
        
        .glass-table tbody td {
            background: rgba(20, 40, 60, 0.3);
            color: white;
            border: 1px solid rgba(100, 150, 200, 0.1);
            padding: 0.75rem 1rem;
        }
        
        .glass-table tbody tr:hover {
            background: rgba(30, 50, 70, 0.5);
        }
        
        .table-actions {
            display: flex;
            gap: 0.5rem;
        }
        
        .btn-sm {
            padding: 0.25rem 0.5rem;
            font-size: 0.8rem;
            border-radius: 6px;
        }
        
        .edit-btn {
            background: rgba(100, 150, 200, 0.6);
            border: 1px solid rgba(100, 150, 200, 0.4);
            color: white;
        }
        
        .edit-btn:hover {
            background: rgba(120, 170, 220, 0.8);
            color: white;
        }
        
        .delete-btn {
            background: rgba(200, 80, 80, 0.6);
            border: 1px solid rgba(200, 80, 80, 0.4);
            color: white;
        }
        
        .delete-btn:hover {
            background: rgba(220, 100, 100, 0.8);
            color: white;
        }
        
        .weight-input {
            max-width: 120px;
        }
        
        .date-input {
            max-width: 150px;
        }
        
        .no-data {
            text-align: center;
            color: rgba(255, 255, 255, 0.6);
            font-style: italic;
            padding: 2rem;
        }
        
        .nav-tabs {
            border: none;
            justify-content: center;
            margin-bottom: 2rem;
        }
        
        .nav-tabs .nav-link {
            background: none;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            font-weight: 500;
            padding: 0.75rem 2rem;
            margin: 0 0.5rem;
            border-radius: 15px;
            transition: all 0.3s ease;
        }
        
        .nav-tabs .nav-link.active {
            background: rgba(100, 150, 200, 0.3);
            color: white;
            border: 1px solid rgba(100, 150, 200, 0.2);
        }
        
        .nav-tabs .nav-link:hover {
            border: none;
            color: white;
            background: rgba(100, 150, 200, 0.2);
        }
        
        .tab-content {
            min-height: 400px;
        }
        
        .tab-icon {
            margin-right: 0.5rem;
        }
        
        .form-check-input {
            background: rgba(20, 40, 60, 0.6);
            border: 1px solid rgba(100, 150, 200, 0.3);
        }
        
        .form-check-input:checked {
            background-color: #3e7095;
            border-color: #3e7095;
        }
        
        .form-check-label {
            color: rgba(255, 255, 255, 0.9);
        }
        
        .form-text.text-muted {
            color: rgba(255, 255, 255, 0.6) !important;
            font-size: 0.8rem;
        }
    </style>
</head>
<body>
<!-- Fixed Alert Container -->
<div id="alert-container"></div>

<div class="container">
    <div class="row justify-content-center align-items-start min-vh-100 py-4">
        <div class="col-lg-10">
            <!-- Header Card -->
            <div class="glass-card">
                <div class="d-flex justify-content-between align-items-center">
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
                    
                    <div class="header-center flex-grow-1 text-center mx-4">
                        <h1 class="welcome-title mb-1">Welcome!</h1>
                        <p class="welcome-subtitle mb-2">Track your weightloss journey and achieve your goals</p>
                        <div class="d-flex justify-content-center flex-wrap" style="gap: 0.5rem;">
                            <a class="btn secondary-btn btn-sm" href="test/test-interface.html">🧪 Test Interface</a>
                            <button id="btn-logout" class="btn danger-btn btn-sm">🚪 Logout</button>
                        </div>
                    </div>
                    
                    <div class="header-right d-flex align-items-center">
                        <div class="user-info text-right">
                            <div class="mb-1"><?php echo $email; ?></div>
                            <?php if ($loginTime): ?>
                                <div class="text-muted small">Login: <?php echo $loginTime; ?></div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Dashboard Tabs -->
            <div class="glass-card">
                <ul class="nav nav-tabs d-flex" id="dashboardTabs" role="tablist">
                    <li class="nav-item flex-fill" role="presentation">
                        <a class="nav-link active text-center" id="data-tab" data-toggle="tab" href="#data" role="tab">
                            <span class="tab-icon">📊</span>Data
                        </a>
                    </li>
                    <li class="nav-item flex-fill" role="presentation">
                        <a class="nav-link text-center" id="health-tab" data-toggle="tab" href="#health" role="tab">
                            <span class="tab-icon">💚</span>Health
                        </a>
                    </li>
                    <li class="nav-item flex-fill" role="presentation">
                        <a class="nav-link text-center" id="achievements-tab" data-toggle="tab" href="#achievements" role="tab">
                            <span class="tab-icon">🏆</span>Achievements
                        </a>
                    </li>
                    <li class="nav-item flex-fill" role="presentation">
                        <a class="nav-link text-center" id="settings-tab" data-toggle="tab" href="#settings" role="tab">
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
                                <input type="number" step="0.1" min="0" id="weightKg" class="form-control glass-input" placeholder="Weight (kg)">
                            </div>
                            <div class="col-4">
                                <button id="btn-add-weight" class="btn primary-btn w-100">Save</button>
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
                                <input type="number" step="0.1" min="0" id="goalWeight" class="form-control glass-input mb-2" placeholder="Target weight (kg)">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-8">
                                <input type="date" id="goalDate" class="form-control glass-input">
                            </div>
                            <div class="col-4">
                                <button id="btn-save-goal" class="btn primary-btn w-100">Save</button>
                            </div>
                        </div>
                        <small class="text-muted d-block mt-2" id="current-goal"></small>
                    </div>
                </div>
            </div>


            <!-- Weight History Card -->
            <div class="glass-card">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="card-title mb-0">📈 Weight History</h5>
                    <button id="btn-add-entry" class="btn primary-btn">➕ Add Entry</button>
                </div>
                
                <!-- Add New Entry Form (hidden by default) -->
                <div id="add-entry-form" class="mb-4" style="display: none;">
                    <div class="row">
                        <div class="col-md-4">
                            <label for="newWeight" class="form-label">Weight (kg)</label>
                            <input type="number" step="0.1" min="0" id="newWeight" class="form-control glass-input weight-input" placeholder="e.g. 75.5">
                        </div>
                        <div class="col-md-4">
                            <label for="newDate" class="form-label">Date</label>
                            <input type="date" id="newDate" class="form-control glass-input date-input">
                        </div>
                        <div class="col-md-4 d-flex align-items-end" style="gap: 1rem;">
                            <button id="btn-save-entry" class="btn primary-btn">💾 Save</button>
                            <button id="btn-cancel-entry" class="btn secondary-btn">❌ Cancel</button>
                        </div>
                    </div>
                </div>

                <!-- Weight History Table -->
                <div class="table-responsive" style="max-height: 350px; overflow-y: auto;">
                    <table class="table glass-table mb-0">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Weight (kg)</th>
                                <th>Change</th>
                                <th>BMI</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="weight-history-body">
                            <tr>
                                <td colspan="5" class="no-data">Loading weight history...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Profile Card -->
            <div class="glass-card">
                <h5 class="card-title">👤 Profile Settings</h5>
                <div class="row">
                    <div class="form-group col-md-3">
                        <label for="heightCm" class="form-label">Height (cm)</label>
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
                    <button id="btn-save-profile" class="btn primary-btn">💾 Save Profile</button>
                    <span id="profile-status" class="text-muted"></span>
                </div>
            </div>
                    </div>
                    
                    <!-- Health Insights Tab -->
                    <div class="tab-pane fade" id="health" role="tabpanel">
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
                    </div>
                    
                    <!-- Achievements Tab -->
                    <div class="tab-pane fade" id="achievements" role="tabpanel">
                        <div class="glass-card-small text-center">
                            <h5 class="card-title">🏆 Coming Soon</h5>
                            <p class="text-muted">Charts and achievement tracking will be available here soon!</p>
                            <div class="mt-4">
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="glass-card-small">
                                            <h6 class="card-title">📈 Weight Loss Chart</h6>
                                            <p class="text-muted small">Track your progress over time</p>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="glass-card-small">
                                            <h6 class="card-title">🎯 Goals Achieved</h6>
                                            <p class="text-muted small">Celebrate your milestones</p>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="glass-card-small">
                                            <h6 class="card-title">🔥 Streak Counter</h6>
                                            <p class="text-muted small">Daily logging streaks</p>
                                        </div>
                                    </div>
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
                                            Weekly progress reports
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
                            <button id="btn-save-settings" class="btn primary-btn mr-2">💾 Save Settings</button>
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

<script>
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
    });

    function parseJson(resp) {
        try { return typeof resp === 'string' ? JSON.parse(resp) : resp; } catch(e){ return {}; }
    }

    function refreshLatestWeight() {
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
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    function editWeight(id, weight, date) {
        // For now, just show the add form with the values pre-filled
        $('#newWeight').val(weight);
        $('#newDate').val(date);
        $('#add-entry-form').slideDown();
        $('#newWeight').focus();
        
        // TODO: Implement proper edit functionality with update instead of add
        showToast('Edit mode: Modify values and save (creates new entry for now)');
    }
    
    function deleteWeight(id) {
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

    function showToast(msg) {
        // lightweight feedback using Bootstrap alerts
        const html = '<div class="alert alert-success alert-dismissible fade show" role="alert">' +
                     msg +
                     '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
                     '<span aria-hidden="true">&times;</span></button></div>';
        $('#alert-container').html(html);
        setTimeout(() => { $('#alert-container .alert').alert('close'); }, 2000);
    }

    function loadSettings() {
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
</script>
</body>
</html>
