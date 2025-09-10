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
</head>
<body>
<div class="container mt-5">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-body">
                    <h3 class="card-title mb-3">Welcome<?php echo $firstName ? ", $firstName" : '';?>!</h3>
                    <p class="mb-1">Thanks for logging in.</p>
                    <ul class="list-unstyled mb-4">
                        <li><strong>Email:</strong> <?php echo $email; ?></li>
                        <?php if ($firstName || $lastName): ?>
                            <li><strong>Name:</strong> <?php echo trim($firstName . ' ' . $lastName); ?></li>
                        <?php endif; ?>
                        <?php if ($loginTime): ?>
                            <li><strong>Login time:</strong> <?php echo $loginTime; ?></li>
                        <?php endif; ?>
                    </ul>

                    <div id="alert-container"></div>

                    <h5 class="mt-4">Quick Actions</h5>
                    <div class="d-flex gap-2 mb-4">
                        <a class="btn btn-outline-secondary" href="dashboard.php">Home</a>
                        <a class="btn btn-outline-info" href="test/test-interface.html">Test Interface</a>
                        <button id="btn-logout" class="btn btn-danger ml-auto">Logout</button>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h5 class="card-title">Log Current Weight</h5>
                                    <div class="form-inline">
                                        <input type="number" step="0.1" min="0" id="weightKg" class="form-control mr-2" placeholder="Weight (kg)">
                                        <button id="btn-add-weight" class="btn btn-primary">Save</button>
                                    </div>
                                    <small class="text-muted d-block mt-2" id="latest-weight"></small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h5 class="card-title">Set Weight Goal</h5>
                                    <div class="form-inline">
                                        <input type="number" step="0.1" min="0" id="goalWeight" class="form-control mr-2" placeholder="Target weight (kg)">
                                        <input type="date" id="goalDate" class="form-control mr-2">
                                        <button id="btn-save-goal" class="btn btn-success">Save</button>
                                    </div>
                                    <small class="text-muted d-block mt-2" id="current-goal"></small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h5 class="card-title">Your BMI</h5>
                                    <div id="bmi-block" class="text-muted">Enter your height and log a recent weight to see your BMI.</div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h5 class="card-title">Health Insights</h5>
                                    <div id="health-block" class="text-muted">Provide age and log weight to view estimated body fat range and risk insights.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Profile</h5>
                            <div class="form-row">
                                <div class="form-group col-md-3">
                                    <label for="heightCm">Height (cm)</label>
                                    <input type="number" min="50" max="300" id="heightCm" class="form-control" placeholder="e.g. 175">
                                </div>
                                <div class="form-group col-md-3">
                                    <label for="bodyFrame">Body Frame</label>
                                    <select id="bodyFrame" class="form-control">
                                        <option value="">Select</option>
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                    </select>
                                </div>
                                <div class="form-group col-md-3">
                                    <label for="age">Age</label>
                                    <input type="number" min="5" max="120" id="age" class="form-control" placeholder="e.g. 35">
                                </div>
                                <div class="form-group col-md-3">
                                    <label for="activityLevel">Activity Level</label>
                                    <select id="activityLevel" class="form-control">
                                        <option value="">Select</option>
                                        <option value="sedentary">Sedentary</option>
                                        <option value="light">Light</option>
                                        <option value="moderate">Moderate</option>
                                        <option value="very">Very</option>
                                        <option value="athlete">Athlete</option>
                                    </select>
                                </div>
                            </div>
                            <button id="btn-save-profile" class="btn btn-primary">Save Profile</button>
                            <span id="profile-status" class="ml-2 text-muted"></span>
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
                }
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
                } else {
                    $('#profile-status').text('Save failed').removeClass('text-success').addClass('text-danger');
                }
            }).fail(function() {
                $('#profile-status').text('Network error').removeClass('text-success').addClass('text-danger');
            });
        });
    });

    function parseJson(resp) {
        try { return typeof resp === 'string' ? JSON.parse(resp) : resp; } catch(e){ return {}; }
    }

    function refreshLatestWeight() {
        $.post('router.php?controller=profile', { action: 'get_latest_weight' }, function(resp) {
            const data = parseJson(resp);
            if (data.latest) {
                $('#latest-weight').text('Latest: ' + data.latest.weight_kg + ' kg on ' + data.latest.entry_date);
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
            lines.push(`BMI: <strong>${data.bmi}</strong> (${data.category})`);
            if (data.adjusted_bmi) {
                const infoId = 'bmi-info-' + Math.random().toString(36).substr(2, 9);
                lines.push(`Frame-adjusted BMI: <strong>${data.adjusted_bmi}</strong> (${data.adjusted_category}) 
                    <button class="btn btn-link p-0 ml-1 text-info" type="button" data-toggle="collapse" data-target="#${infoId}" style="text-decoration: none; border: none; background: none;">
                        ⓘ
                    </button>`);
                lines.push(`<div class="collapse mt-2" id="${infoId}">
                    <small class="text-muted">Frame-adjusted BMI is a heuristic interpretation only.</small>
                </div>`);
            }
            el.html(lines.join('<br>')).removeClass('text-muted');
        });
    }

    function refreshHealth() {
        $.post('router.php?controller=profile', { action: 'get_health_stats' }, function(resp) {
            const data = parseJson(resp);
            const el = $('#health-block');
            if (!data.success) {
                el.text(data.message || 'Health insights not available').addClass('text-muted');
                return;
            }
            const lines = [];
            if (Array.isArray(data.estimated_body_fat_range)) {
                const bodyFatInfoId = 'bodyfat-info-' + Math.random().toString(36).substr(2, 9);
                lines.push(`Estimated body fat: <strong>${data.estimated_body_fat_range[0]}–${data.estimated_body_fat_range[1]}%</strong> 
                    <button class="btn btn-link p-0 ml-1 text-info" type="button" data-toggle="collapse" data-target="#${bodyFatInfoId}" style="text-decoration: none; border: none; background: none;">
                        ⓘ
                    </button>`);
                
                // Add body fat notes from the original data
                if (Array.isArray(data.body_fat_notes) && data.body_fat_notes.length) {
                    lines.push(`<div class="collapse mt-2" id="${bodyFatInfoId}">
                        <small class="text-muted">${data.body_fat_notes.join(' ')}</small>
                    </div>`);
                }
            }
            if (data.cvd_risk_label) {
                const cvdInfoId = 'cvd-info-' + Math.random().toString(36).substr(2, 9);
                lines.push(`Cardiovascular risk (non-diagnostic): <strong>${data.cvd_risk_label}</strong> 
                    <button class="btn btn-link p-0 ml-1 text-info" type="button" data-toggle="collapse" data-target="#${cvdInfoId}" style="text-decoration: none; border: none; background: none;">
                        ⓘ
                    </button>`);
                lines.push(`<div class="collapse mt-2" id="${cvdInfoId}">
                    <small class="text-muted">This is a general, non-diagnostic impression based on BMI, age and activity. For cardiovascular risk, clinical calculators (e.g., Framingham, ASCVD) require blood pressure and lab values.</small>
                </div>`);
            }
            el.html(lines.join('<br>')).removeClass('text-muted');
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
</script>
</body>
</html>
