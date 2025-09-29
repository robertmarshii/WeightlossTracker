// Helper function for standardized fetch requests
function postRequest(url, data) {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
    });
    return fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
    }).then(response => response.text());
}

$(document).ready(function() {
    // Check for OAuth error in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const oauthError = urlParams.get('error');
    if (oauthError) {
        if (window.coverage) window.coverage.logFunction('if', 'index.js');
        showAlert('❌ OAuth Error: ' + decodeURIComponent(oauthError), 'danger');
        // Clean up URL without reloading
        const newUrl = window.location.pathname;
        window.history.replaceState(null, '', newUrl);
    }

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

    postRequest('login_router.php?controller=auth', {
        action: 'oauth_start',
        provider: 'google'
    })
    .then(response => {
        const data = typeof response === 'string' ? JSON.parse(response) : response;
        if (data.success && data.authorization_url) {
            if (window.coverage) window.coverage.logFunction('if', 'index.js');
            // Redirect to Google OAuth
            window.location.href = data.authorization_url;
        } else {
            showAlert('❌ ' + (data.message || 'Failed to start Google authentication'), 'danger');
        }
    }).catch(function() {
        showAlert('🔌 Network error. Please check your connection and try again.', 'danger');
    });
}

function continueWithMicrosoft() {
    if (window.coverage) window.coverage.logFunction('continueWithMicrosoft', 'index.js');
    showAlert('🔄 Redirecting to Microsoft...', 'info');

    postRequest('login_router.php?controller=auth', {
        action: 'oauth_start',
        provider: 'microsoft'
    })
    .then(response => {
        const data = typeof response === 'string' ? JSON.parse(response) : response;
        if (data.success && data.authorization_url) {
            if (window.coverage) window.coverage.logFunction('if', 'index.js');
            // Redirect to Microsoft OAuth
            window.location.href = data.authorization_url;
        } else {
            showAlert('❌ ' + (data.message || 'Failed to start Microsoft authentication'), 'danger');
        }
    }).catch(function() {
        showAlert('🔌 Network error. Please check your connection and try again.', 'danger');
    });
}

function sendLoginCode() {
    if (window.coverage) window.coverage.logFunction('sendLoginCode', 'index.js');
    const email = document.getElementById('loginEmail').value;

    // Validate email format
    if (!isValidEmail(email)) {
        showAlert('❌ Please enter a valid email address', 'danger');
        return;
    }

    // Show loading message
    showAlert('📧 Sending your login code via email...', 'info');

    // Use native fetch instead of jQuery
    const formData = new FormData();
    formData.append('action', 'send_login_code');
    formData.append('email', email);

    fetch('login_router.php?controller=auth', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(responseText => {
        const data = typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
        if (data.success) {
            if (window.coverage) window.coverage.logFunction('if', 'index.js');
            showAlert('✅ Login code sent successfully! Check your email inbox (and spam folder). The code is also in the subject line.', 'success');
            document.getElementById('loginForm').style.display = 'none';
            document.getElementById('loginSocialSection').style.display = 'none';
            document.getElementById('loginWelcomeSection').style.display = 'none';
            document.getElementById('verifyLoginForm').style.display = 'block';

            // Show tip after success message finishes (10s + 1s buffer)
            setTimeout(() => {
                showAlert('💡 Tip: Your 6-digit code is included in the email subject line for easy access!', 'info');
            }, 11000);
        } else {
            showAlert('❌ ' + data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        showAlert('🔌 Network error. Please check your connection and try again.', 'danger');
    });
}

function createAccount() {
    if (window.coverage) window.coverage.logFunction('createAccount', 'index.js');
    const email = document.getElementById('signupEmail').value;

    // Validate email format
    if (!isValidEmail(email)) {
        showAlert('❌ Please enter a valid email address', 'danger');
        return;
    }

    showAlert('🔄 Creating your account and sending verification code...', 'info');

    const formData = new FormData();
    formData.append('action', 'create_account');
    formData.append('email', email);

    fetch('login_router.php?controller=auth', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(responseText => {
        const data = typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
        if (data.success) {
            if (window.coverage) window.coverage.logFunction('if', 'index.js');
            showAlert('✅ Account created! Verification code sent to your email. Check your inbox (and spam folder).', 'success');
            document.getElementById('signupForm').style.display = 'none';
            document.getElementById('signupSocialSection').style.display = 'none';
            document.getElementById('signupWelcomeSection').style.display = 'none';
            document.getElementById('verifySignupForm').style.display = 'block';

            // Show tip after success message finishes (10s + 1s buffer)
            setTimeout(() => {
                showAlert('💡 Your verification code is in the email subject line!', 'info');
            }, 11000);
        } else {
            showAlert('❌ ' + data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        showAlert('🔌 Network error. Please check your connection and try again.', 'danger');
    });
}

function verifyLoginCode() {
    if (window.coverage) window.coverage.logFunction('verifyLoginCode', 'index.js');
    const email = document.getElementById('loginEmail').value;
    const code = document.getElementById('loginCode').value;

    showAlert('Verifying code...', 'info');

    const formData = new FormData();
    formData.append('action', 'verify_login');
    formData.append('email', email);
    formData.append('code', code);

    fetch('login_router.php?controller=auth', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(responseText => {
        const data = typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
        if (data.success) {
            if (window.coverage) window.coverage.logFunction('if', 'index.js');
            showAlert('Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.php';
            }, 1500);
        } else {
            showAlert(data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        showAlert('Network error. Please try again.', 'danger');
    });
}

function verifySignupCode() {
    if (window.coverage) window.coverage.logFunction('verifySignupCode', 'index.js');
    const email = document.getElementById('signupEmail').value;
    const code = document.getElementById('signupCode').value;

    showAlert('Verifying account...', 'info');

    const formData = new FormData();
    formData.append('action', 'verify_signup');
    formData.append('email', email);
    formData.append('code', code);

    fetch('login_router.php?controller=auth', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(responseText => {
        const data = typeof responseText === 'string' ? JSON.parse(responseText) : responseText;
        if (data.success) {
            if (window.coverage) window.coverage.logFunction('if', 'index.js');
            showAlert('Account created successfully! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.php';
            }, 1500);
        } else {
            showAlert(data.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
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

