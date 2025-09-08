<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weight Loss Tracker</title>
    <!-- jQuery -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
    <!-- Schema Logger -->
    <script src="schema-logger.js"></script>
</head>
<body>
    <div class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="text-center mb-4">
                    <h1>Weight Loss Tracker</h1>
                    <p class="lead">Track your fitness journey</p>
                </div>

                <div id="alert-container"></div>

                <!-- Login/Signup Form -->
                <div class="card">
                    <div class="card-body">
                        <ul class="nav nav-tabs" id="authTabs" role="tablist">
                            <li class="nav-item" role="presentation">
                                <a class="nav-link active" id="login-tab" data-toggle="tab" href="#login" role="tab">Login</a>
                            </li>
                            <li class="nav-item" role="presentation">
                                <a class="nav-link" id="signup-tab" data-toggle="tab" href="#signup" role="tab">Sign Up</a>
                            </li>
                        </ul>
                        
                        <div class="tab-content mt-3" id="authTabsContent">
                            <!-- Login Tab -->
                            <div class="tab-pane fade show active" id="login" role="tabpanel">
                                <form id="loginForm">
                                    <div class="form-group">
                                        <label for="loginEmail">Email address</label>
                                        <input type="email" class="form-control" id="loginEmail" required>
                                    </div>
                                    <button type="submit" class="btn btn-primary btn-block">Send Login Code</button>
                                </form>
                                
                                <!-- Code verification form (hidden initially) -->
                                <form id="verifyLoginForm" style="display: none;">
                                    <div class="form-group mt-3">
                                        <label for="loginCode">Enter 6-digit code sent to your email</label>
                                        <input type="text" class="form-control" id="loginCode" maxlength="6" pattern="[0-9]{6}" required>
                                    </div>
                                    <button type="submit" class="btn btn-success btn-block">Verify & Login</button>
                                    <button type="button" class="btn btn-outline-secondary btn-sm mt-2" onclick="backToEmailLogin()">Back</button>
                                </form>
                            </div>
                            
                            <!-- Signup Tab -->
                            <div class="tab-pane fade" id="signup" role="tabpanel">
                                <form id="signupForm">
                                    <div class="form-group">
                                        <label for="signupFirstName">First Name</label>
                                        <input type="text" class="form-control" id="signupFirstName" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="signupLastName">Last Name</label>
                                        <input type="text" class="form-control" id="signupLastName" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="signupEmail">Email address</label>
                                        <input type="email" class="form-control" id="signupEmail" required>
                                    </div>
                                    <button type="submit" class="btn btn-success btn-block">Create Account</button>
                                </form>
                                
                                <!-- Code verification form (hidden initially) -->
                                <form id="verifySignupForm" style="display: none;">
                                    <div class="form-group mt-3">
                                        <label for="signupCode">Enter 6-digit verification code sent to your email</label>
                                        <input type="text" class="form-control" id="signupCode" maxlength="6" pattern="[0-9]{6}" required>
                                    </div>
                                    <button type="submit" class="btn btn-success btn-block">Verify & Complete Signup</button>
                                    <button type="button" class="btn btn-outline-secondary btn-sm mt-2" onclick="backToEmailSignup()">Back</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <?php if ($_SERVER['HTTP_HOST'] === '127.0.0.1:8111'): ?>
                <div class="mt-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">Development Tools</h5>
                            <a href="test/test-interface.html" class="btn btn-primary btn-sm">Test Interface</a>
                            <a href="test/schema-switcher.html" class="btn btn-secondary btn-sm">Schema Switcher</a>
                        </div>
                    </div>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <script>
        $(document).ready(function() {
            $('#loginForm').submit(function(e) {
                e.preventDefault();
                sendLoginCode();
            });
            
            $('#signupForm').submit(function(e) {
                e.preventDefault();
                createAccount();
            });
            
            $('#verifyLoginForm').submit(function(e) {
                e.preventDefault();
                verifyLoginCode();
            });
            
            $('#verifySignupForm').submit(function(e) {
                e.preventDefault();
                verifySignupCode();
            });
        });

        function sendLoginCode() {
            const email = $('#loginEmail').val();
            showAlert('Sending login code...', 'info');
            
            $.post('login_router.php?controller=auth', {
                action: 'send_login_code',
                email: email
            }, function(response) {
                const data = JSON.parse(response);
                if (data.success) {
                    showAlert('Login code sent to your email!', 'success');
                    $('#loginForm').hide();
                    $('#verifyLoginForm').show();
                } else {
                    showAlert(data.message, 'danger');
                }
            }).fail(function() {
                showAlert('Network error. Please try again.', 'danger');
            });
        }

        function createAccount() {
            const firstName = $('#signupFirstName').val();
            const lastName = $('#signupLastName').val();
            const email = $('#signupEmail').val();
            
            showAlert('Creating account...', 'info');
            
            $.post('login_router.php?controller=auth', {
                action: 'create_account',
                first_name: firstName,
                last_name: lastName,
                email: email
            }, function(response) {
                const data = JSON.parse(response);
                if (data.success) {
                    showAlert('Verification code sent to your email!', 'success');
                    $('#signupForm').hide();
                    $('#verifySignupForm').show();
                } else {
                    showAlert(data.message, 'danger');
                }
            }).fail(function() {
                showAlert('Network error. Please try again.', 'danger');
            });
        }

        function verifyLoginCode() {
            const email = $('#loginEmail').val();
            const code = $('#loginCode').val();
            
            showAlert('Verifying code...', 'info');
            
            $.post('login_router.php?controller=auth', {
                action: 'verify_login',
                email: email,
                code: code
            }, function(response) {
                const data = JSON.parse(response);
                if (data.success) {
                    showAlert('Login successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.php';
                    }, 1500);
                } else {
                    showAlert(data.message, 'danger');
                }
            }).fail(function() {
                showAlert('Network error. Please try again.', 'danger');
            });
        }

        function verifySignupCode() {
            const email = $('#signupEmail').val();
            const code = $('#signupCode').val();
            
            showAlert('Verifying account...', 'info');
            
            $.post('login_router.php?controller=auth', {
                action: 'verify_signup',
                email: email,
                code: code
            }, function(response) {
                const data = JSON.parse(response);
                if (data.success) {
                    showAlert('Account created successfully! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.php';
                    }, 1500);
                } else {
                    showAlert(data.message, 'danger');
                }
            }).fail(function() {
                showAlert('Network error. Please try again.', 'danger');
            });
        }

        function backToEmailLogin() {
            $('#verifyLoginForm').hide();
            $('#loginForm').show();
            $('#loginCode').val('');
        }

        function backToEmailSignup() {
            $('#verifySignupForm').hide();
            $('#signupForm').show();
            $('#signupCode').val('');
        }

        function showAlert(message, type) {
            const alertClass = `alert-${type}`;
            const alertHtml = `
                <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            `;
            
            $('#alert-container').html(alertHtml);
            
            if (type === 'success' || type === 'info') {
                setTimeout(() => {
                    $('#alert-container .alert').alert('close');
                }, 5000);
            }
        }
    </script>
</body>
</html>