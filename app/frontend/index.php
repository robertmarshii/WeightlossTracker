<?php
// Auto-redirect logged-in users to dashboard
require_once('/var/app/backend/AuthManager.php');
if (AuthManager::isLoggedIn()) {
    header('Location: dashboard.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weightloss Tracker</title>
    <!-- jQuery -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
    <!-- Schema Logger -->
    <script src="schema-logger.js"></script>
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
            max-width: 400px;
            margin: 0 auto;
        }
        
        .logo-section {
            text-align: center;
            margin-bottom: 2rem;
        }
        
        .logo-icon {
            width: 60px;
            height: 60px;
            background: rgba(100, 150, 200, 0.3);
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 0.75rem;
            font-size: 24px;
            color: #64a6d8;
        }
        
        .logo-text {
            color: #879cab;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 0;
        }
        
        .welcome-title {
            color: white;
            font-size: 1.75rem;
            font-weight: 600;
            text-align: center;
            margin-bottom: 0.5rem;
        }
        
        .welcome-subtitle {
            color: rgba(255, 255, 255, 0.8);
            text-align: center;
            font-size: 0.9rem;
            margin-bottom: 2rem;
        }
        
        .glass-input {
            background: rgba(20, 40, 60, 0.6);
            border: 1px solid rgba(100, 150, 200, 0.3);
            border-radius: 10px;
            color: white;
            padding: 12px 16px;
            font-size: 0.9rem;
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
        
        .primary-btn {
            background: #64a6d8;
            border: none;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            padding: 12px;
            width: 100%;
            transition: all 0.3s ease;
        }
        
        .primary-btn:hover:not(:disabled) {
            background: #5294c4;
            transform: translateY(-1px);
        }
        
        .primary-btn:disabled {
            background: rgba(100, 150, 200, 0.3);
            color: rgba(255, 255, 255, 0.4);
        }
        
        .divider {
            text-align: center;
            color: rgba(255, 255, 255, 0.6);
            margin: 1.5rem 0;
            position: relative;
        }
        
        .divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: rgba(255, 255, 255, 0.2);
        }
        
        .divider span {
            background: transparent;
            padding: 0 1rem;
        }
        
        .social-btn {
            background: rgba(20, 40, 60, 0.6);
            border: 1px solid rgba(100, 150, 200, 0.3);
            border-radius: 10px;
            color: white;
            padding: 12px 16px;
            width: 100%;
            margin-bottom: 0.75rem;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            text-decoration: none;
        }
        
        .social-btn:hover {
            background: rgba(30, 50, 70, 0.8);
            color: white;
            text-decoration: none;
        }
        
        .bottom-link {
            text-align: center;
            color: rgba(255, 255, 255, 0.8);
            font-size: 0.85rem;
            margin-top: 1.5rem;
        }
        
        .bottom-link a {
            color: #64a6d8;
            text-decoration: none;
        }
        
        .bottom-link a:hover {
            text-decoration: underline;
        }
        
        .form-check-label {
            color: rgba(255, 255, 255, 0.8);
        }
        
        .form-check-label a {
            color: #64a6d8;
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
            padding: 0.5rem 1.5rem;
            margin: 0 0.25rem;
            border-radius: 20px;
        }
        
        .nav-tabs .nav-link.active {
            background: rgba(100, 150, 200, 0.3);
            color: white;
        }
        
        .nav-tabs .nav-link:hover {
            border: none;
            color: white;
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
        
        #alert-container .alert-danger {
            background: rgba(80, 40, 40, 0.95) !important;
            border-color: rgba(200, 100, 100, 0.3);
            color: white !important;
        }
        
        #alert-container .alert-info {
            background: rgba(30, 58, 95, 0.95) !important;
            border-color: rgba(100, 150, 200, 0.3);
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
        
        .logo-icon svg {
            width: 32px;
            height: 32px;
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
    </style>
</head>
<body>
    <!-- Fixed Alert Container -->
    <div id="alert-container"></div>

    <div class="container">
        <div class="row justify-content-center align-items-center min-vh-100">
            <div class="col-md-6">
                <!-- Login/Signup Form -->
                <div class="glass-card">
                    <div class="logo-section">
                        <div class="logo-icon">
                            <svg viewBox="0 0 44 44" class="progress-ring">
                                <circle cx="22" cy="22" r="15" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="12"/>
                                <circle cx="22" cy="22" r="15" fill="none" stroke="#64a6d8" stroke-width="12" 
                                        stroke-linecap="round" class="progress-ring-circle"/>
                            </svg>
                        </div>
                        <div class="logo-text">Weightloss Tracker</div>
                    </div>
                    
                    <ul class="nav nav-tabs" id="authTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <a class="nav-link active" id="login-tab" data-toggle="tab" href="#login" role="tab">Login</a>
                        </li>
                        <li class="nav-item" role="presentation">
                            <a class="nav-link" id="signup-tab" data-toggle="tab" href="#signup" role="tab">Sign Up</a>
                        </li>
                    </ul>
                        
                        <div class="tab-content" id="authTabsContent">
                            <!-- Login Tab -->
                            <div class="tab-pane fade show active" id="login" role="tabpanel">
                                <div id="loginWelcomeSection">
                                    <div class="welcome-title">Welcome back</div>
                                    <div class="welcome-subtitle">Please enter your details to sign in.</div>
                                </div>
                                
                                <form id="loginForm">
                                    <div class="form-group">
                                        <input type="email" class="form-control glass-input" id="loginEmail" placeholder="Enter your email" required>
                                    </div>
                                    <button type="submit" class="btn primary-btn">Send Login Code →</button>
                                </form>
                                
                                <div id="loginSocialSection">
                                    <div class="divider">
                                        <span>OR</span>
                                    </div>
                                
                                <a href="#" class="social-btn" onclick="continueWithGoogle(); return false;">
                                    <svg width="18" height="18" viewBox="0 0 18 18" style="margin-right: 10px;">
                                        <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                                        <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                                        <path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.28l2.67-2.14z"/>
                                        <path fill="#EA4335" d="M8.98 3.54c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.35L4.5 7.42a4.77 4.77 0 0 1 4.48-3.88z"/>
                                    </svg>
                                    Continue with Google
                                </a>
                                
                                <a href="#" class="social-btn" onclick="continueWithMicrosoft(); return false;">
                                    <svg width="18" height="18" viewBox="0 0 18 18" style="margin-right: 10px;">
                                        <path fill="#F25022" d="M1 1h7v7H1z"/>
                                        <path fill="#7FBA00" d="M10 1h7v7h-7z"/>
                                        <path fill="#00A4EF" d="M1 10h7v7H1z"/>
                                        <path fill="#FFB900" d="M10 10h7v7h-7z"/>
                                    </svg>
                                    Continue with Microsoft
                                </a>
                                </div>
                                
                                <!-- Code verification form (hidden initially) -->
                                <form id="verifyLoginForm" style="display: none;">
                                    <div class="welcome-title">Check your email</div>
                                    <div class="welcome-subtitle">Enter the 6-digit code sent to your email.</div>
                                    
                                    <div class="form-group">
                                        <input type="text" class="form-control glass-input" id="loginCode" placeholder="Enter 6-digit code" maxlength="6" pattern="[0-9]{6}" required>
                                    </div>
                                    <button type="submit" class="btn primary-btn">Verify & Login</button>
                                    <div class="bottom-link">
                                        <a href="#" onclick="backToEmailLogin(); return false;">← Back to email</a>
                                    </div>
                                </form>
                            </div>
                            
                            <!-- Signup Tab -->
                            <div class="tab-pane fade" id="signup" role="tabpanel">
                                <div id="signupWelcomeSection">
                                    <div class="welcome-title">Create Account</div>
                                    <div class="welcome-subtitle">Please enter your details to get started.</div>
                                </div>
                                
                                <form id="signupForm">
                                    <div class="form-group">
                                        <input type="email" class="form-control glass-input" id="signupEmail" placeholder="Enter your email" required>
                                    </div>
                                    <div class="form-check mb-3">
                                        <input type="checkbox" class="form-check-input" id="agreeTerms" required>
                                        <label class="form-check-label small" for="agreeTerms">
                                            I agree to the <a href="#" onclick="openModal('termsModal'); return false;">Terms and Conditions</a>, 
                                            <a href="#" onclick="openModal('privacyModal'); return false;">Privacy Policy</a>, and 
                                            <a href="#" onclick="openModal('cookieModal'); return false;">Cookie Policy</a>
                                        </label>
                                    </div>
                                    <button type="submit" class="btn primary-btn">Create Account →</button>
                                </form>
                                
                                <div id="signupSocialSection">
                                    <div class="divider">
                                        <span>OR</span>
                                    </div>
                                
                                <a href="#" class="social-btn" onclick="continueWithGoogle(); return false;">
                                    <svg width="18" height="18" viewBox="0 0 18 18" style="margin-right: 10px;">
                                        <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                                        <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                                        <path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.28l2.67-2.14z"/>
                                        <path fill="#EA4335" d="M8.98 3.54c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.35L4.5 7.42a4.77 4.77 0 0 1 4.48-3.88z"/>
                                    </svg>
                                    Continue with Google
                                </a>
                                
                                <a href="#" class="social-btn" onclick="continueWithMicrosoft(); return false;">
                                    <svg width="18" height="18" viewBox="0 0 18 18" style="margin-right: 10px;">
                                        <path fill="#F25022" d="M1 1h7v7H1z"/>
                                        <path fill="#7FBA00" d="M10 1h7v7h-7z"/>
                                        <path fill="#00A4EF" d="M1 10h7v7H1z"/>
                                        <path fill="#FFB900" d="M10 10h7v7h-7z"/>
                                    </svg>
                                    Continue with Microsoft
                                </a>
                                </div>
                                
                                <!-- Code verification form (hidden initially) -->
                                <form id="verifySignupForm" style="display: none;">
                                    <div class="welcome-title">Verify your email</div>
                                    <div class="welcome-subtitle">Enter the 6-digit verification code sent to your email.</div>
                                    
                                    <div class="form-group">
                                        <input type="text" class="form-control glass-input" id="signupCode" placeholder="Enter 6-digit code" maxlength="6" pattern="[0-9]{6}" required>
                                    </div>
                                    <button type="submit" class="btn primary-btn">Verify & Complete Signup</button>
                                    <div class="bottom-link">
                                        <a href="#" onclick="backToEmailSignup(); return false;">← Back to email</a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <?php if ($_SERVER['HTTP_HOST'] === '127.0.0.1:8111'): ?>
                <div class="mt-4">
                    <div class="glass-card" style="padding: 1rem;">
                        <h6 style="color: white; margin-bottom: 1rem;">Development Tools</h6>
                        <a href="test/test-interface.html" class="social-btn" style="margin-bottom: 0.5rem;">
                            🧪 Test Interface
                        </a>
                        <a href="test/schema-switcher.html" class="social-btn" style="margin-bottom: 0;">
                            🔄 Schema Switcher
                        </a>
                    </div>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>

    <!-- Terms and Conditions Modal -->
    <div class="modal fade" id="termsModal" tabindex="-1" role="dialog" aria-labelledby="termsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="termsModalLabel">Terms and Conditions</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <h6>1. Acceptance of Terms</h6>
                    <p>By using the Weightloss Tracker application, you agree to be bound by these Terms and Conditions.</p>
                    
                    <h6>2. Description of Service</h6>
                    <p>Weightloss Tracker is a personal fitness tracking application that helps users monitor their weight loss journey and fitness goals.</p>
                    
                    <h6>3. User Responsibilities</h6>
                    <p>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>
                    
                    <h6>4. Privacy</h6>
                    <p>Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.</p>
                    
                    <h6>5. Disclaimer</h6>
                    <p>This application is for informational purposes only and should not replace professional medical advice. Always consult with healthcare professionals for medical guidance.</p>
                    
                    <h6>6. Modifications</h6>
                    <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of any changes.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Privacy Policy Modal -->
    <div class="modal fade" id="privacyModal" tabindex="-1" role="dialog" aria-labelledby="privacyModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="privacyModalLabel">Privacy Policy</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <h6>Information We Collect</h6>
                    <p>We collect information you provide directly to us, such as when you create an account, update your profile, or use our services.</p>
                    
                    <h6>How We Use Your Information</h6>
                    <p>We use the information we collect to:</p>
                    <ul>
                        <li>Provide, maintain, and improve our services</li>
                        <li>Send you technical notices and support messages</li>
                        <li>Respond to your comments and questions</li>
                        <li>Monitor and analyze usage patterns</li>
                    </ul>
                    
                    <h6>Information Sharing</h6>
                    <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>
                    
                    <h6>Data Security</h6>
                    <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
                    
                    <h6>Contact Us</h6>
                    <p>If you have any questions about this Privacy Policy, please contact us through our support channels.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Cookie Policy Modal -->
    <div class="modal fade" id="cookieModal" tabindex="-1" role="dialog" aria-labelledby="cookieModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="cookieModalLabel">Cookie Policy</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <h6>What Are Cookies</h6>
                    <p>Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience.</p>
                    
                    <h6>How We Use Cookies</h6>
                    <p>We use cookies to:</p>
                    <ul>
                        <li>Keep you signed in to your account</li>
                        <li>Remember your preferences and settings</li>
                        <li>Analyze how you use our application</li>
                        <li>Improve our services and user experience</li>
                    </ul>
                    
                    <h6>Types of Cookies We Use</h6>
                    <p><strong>Essential Cookies:</strong> These are necessary for the website to function and cannot be switched off.</p>
                    <p><strong>Analytics Cookies:</strong> These help us understand how visitors interact with our website.</p>
                    <p><strong>Preference Cookies:</strong> These allow the website to remember choices you make and provide enhanced features.</p>
                    
                    <h6>Managing Cookies</h6>
                    <p>You can control and/or delete cookies as you wish through your browser settings. However, please note that removing cookies may affect the functionality of our service.</p>
                    
                    <h6>Updates to This Policy</h6>
                    <p>We may update this Cookie Policy from time to time. Any changes will be posted on this page.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>

    <script>
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

        function openModal(modalId) {
            $('#' + modalId).modal('show');
        }

        function isValidEmail(email) {
            // Basic email validation regex - catches common typos
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email.trim());
        }

        function continueWithGoogle() {
            showAlert('🔄 Redirecting to Google...', 'info');
            // TODO: Implement Google OAuth integration
            setTimeout(() => {
                showAlert('🚧 Google login integration coming soon!', 'info');
            }, 1500);
        }

        function continueWithMicrosoft() {
            showAlert('🔄 Redirecting to Microsoft...', 'info');
            // TODO: Implement Microsoft OAuth integration
            setTimeout(() => {
                showAlert('🚧 Microsoft login integration coming soon!', 'info');
            }, 1500);
        }

        function sendLoginCode() {
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
                const data = JSON.parse(response);
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
                const data = JSON.parse(response);
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
            $('#loginSocialSection').show();
            $('#loginWelcomeSection').show();
            $('#loginCode').val('');
        }

        function backToEmailSignup() {
            $('#verifySignupForm').hide();
            $('#signupForm').show();
            $('#signupSocialSection').show();
            $('#signupWelcomeSection').show();
            $('#signupCode').val('');
        }

        let currentAlertTimeout = null;
        
        function showAlert(message, type, duration = null) {
            // Clear any existing timeout to prevent conflicts
            if (currentAlertTimeout) {
                clearTimeout(currentAlertTimeout);
                currentAlertTimeout = null;
            }
            
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
            
            // Set different durations for different message types
            let autoDismissTime = duration;
            if (autoDismissTime === null) {
                if (type === 'success') {
                    autoDismissTime = 10000; // 10 seconds for success messages
                } else if (type === 'info') {
                    autoDismissTime = 8000;  // 8 seconds for info messages
                } else if (type === 'danger') {
                    autoDismissTime = 0;     // Don't auto-hide error messages
                }
            }
            
            if (autoDismissTime > 0) {
                currentAlertTimeout = setTimeout(() => {
                    $('#alert-container .alert').alert('close');
                    currentAlertTimeout = null;
                }, autoDismissTime);
            }
        }
    </script>
</body>
</html>
