$(document).ready(function() {
    // Disable login and create account buttons initially
    $('#loginForm button[type="submit"]').prop('disabled', true);
    $('#signupForm button[type="submit"]').prop('disabled', true);
    
    // Enable/disable login button based on email input
    $('#loginEmail').on('input', function() {
        const hasEmail = $(this).val().trim().length > 0;
        $('#loginForm button[type="submit"]').prop('disabled', !hasEmail);
    });
    
    // Enable/disable create account button based on checkbox and email
    function updateSignupButton() {
        if (window.coverage) window.coverage.logFunction('updateSignupButton', 'index.js');
        const hasEmail = $('#signupEmail').val().trim().length > 0;
        const hasAgreed = $('#agreeTerms').is(':checked');
        $('#signupForm button[type="submit"]').prop('disabled', !(hasEmail && hasAgreed));
    }
    
    $('#signupEmail').on('input', updateSignupButton);
    $('#agreeTerms').change(updateSignupButton);
    
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


function isValidEmail(email) {
    if (window.coverage) window.coverage.logFunction('isValidEmail', 'index.js');
    // Basic email validation regex - catches common typos
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
}

function continueWithGoogle() {
    if (window.coverage) window.coverage.logFunction('continueWithGoogle', 'index.js');
    showAlert('🔄 Redirecting to Google...', 'info');
    // TODO: Implement Google OAuth integration
    setTimeout(() => {
        showAlert('🚧 Google login integration coming soon!', 'info');
    }, 1500);
}

function continueWithMicrosoft() {
    if (window.coverage) window.coverage.logFunction('continueWithMicrosoft', 'index.js');
    showAlert('🔄 Redirecting to Microsoft...', 'info');
    // TODO: Implement Microsoft OAuth integration
    setTimeout(() => {
        showAlert('🚧 Microsoft login integration coming soon!', 'info');
    }, 1500);
}

function sendLoginCode() {
    if (window.coverage) window.coverage.logFunction('sendLoginCode', 'index.js');
    const email = $('#loginEmail').val();
    
    // Validate email format
    if (!isValidEmail(email)) {
        showAlert('❌ Please enter a valid email address', 'danger');
        return;
    }
    
    // Show loading message
    showAlert('📧 Sending your login code via email...', 'info');
    
    $.post('login_router.php?controller=auth', {
        action: 'send_login_code',
        email: email
    }, function(response) {
        const data = typeof response === 'string' ? JSON.parse(response) : response;
        if (data.success) {
            showAlert('✅ Login code sent successfully! Check your email inbox (and spam folder). The code is also in the subject line.', 'success');
            $('#loginForm').hide();
            $('#loginSocialSection').hide();
            $('#loginWelcomeSection').hide();
            $('#verifyLoginForm').show();
            
            // Show tip after success message finishes (10s + 1s buffer)
            setTimeout(() => {
                showAlert('💡 Tip: Your 6-digit code is included in the email subject line for easy access!', 'info');
            }, 11000);
        } else {
            showAlert('❌ ' + data.message, 'danger');
        }
    }).fail(function() {
        showAlert('🔌 Network error. Please check your connection and try again.', 'danger');
    });
}

function createAccount() {
    if (window.coverage) window.coverage.logFunction('createAccount', 'index.js');
    const email = $('#signupEmail').val();
    
    // Validate email format
    if (!isValidEmail(email)) {
        showAlert('❌ Please enter a valid email address', 'danger');
        return;
    }
    
    showAlert('🔄 Creating your account and sending verification code...', 'info');
    
    $.post('login_router.php?controller=auth', {
        action: 'create_account',
        email: email
    }, function(response) {
        const data = typeof response === 'string' ? JSON.parse(response) : response;
        if (data.success) {
            showAlert('✅ Account created! Verification code sent to your email. Check your inbox (and spam folder).', 'success');
            $('#signupForm').hide();
            $('#signupSocialSection').hide();
            $('#signupWelcomeSection').hide();
            $('#verifySignupForm').show();
            
            // Show tip after success message finishes (10s + 1s buffer)
            setTimeout(() => {
                showAlert('💡 Your verification code is in the email subject line!', 'info');
            }, 11000);
        } else {
            showAlert('❌ ' + data.message, 'danger');
        }
    }).fail(function() {
        showAlert('🔌 Network error. Please check your connection and try again.', 'danger');
    });
}

function verifyLoginCode() {
    if (window.coverage) window.coverage.logFunction('verifyLoginCode', 'index.js');
    const email = $('#loginEmail').val();
    const code = $('#loginCode').val();
    
    showAlert('Verifying code...', 'info');
    
    $.post('login_router.php?controller=auth', {
        action: 'verify_login',
        email: email,
        code: code
    }, function(response) {
        const data = typeof response === 'string' ? JSON.parse(response) : response;
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
    if (window.coverage) window.coverage.logFunction('verifySignupCode', 'index.js');
    const email = $('#signupEmail').val();
    const code = $('#signupCode').val();
    
    showAlert('Verifying account...', 'info');
    
    $.post('login_router.php?controller=auth', {
        action: 'verify_signup',
        email: email,
        code: code
    }, function(response) {
        const data = typeof response === 'string' ? JSON.parse(response) : response;
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
    if (window.coverage) window.coverage.logFunction('backToEmailLogin', 'index.js');
    $('#verifyLoginForm').hide();
    $('#loginForm').show();
    $('#loginSocialSection').show();
    $('#loginWelcomeSection').show();
    $('#loginCode').val('');
}

function backToEmailSignup() {
    if (window.coverage) window.coverage.logFunction('backToEmailSignup', 'index.js');
    $('#verifySignupForm').hide();
    $('#signupForm').show();
    $('#signupSocialSection').show();
    $('#signupWelcomeSection').show();
    $('#signupCode').val('');
}

