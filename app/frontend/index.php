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
    <!-- Global Styles -->
    <link rel="stylesheet" href="css/global.css?v=<?php echo time(); ?>">
    <!-- Page-specific Styles -->
    <link rel="stylesheet" href="css/index.css?v=<?php echo time(); ?>">
</head>
<body>
    <!-- Fixed Alert Container -->
    <div id="alert-container"></div>

    <div class="container">
        <div class="row justify-content-center align-items-center min-vh-90">
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
                                    <button type="submit" class="btn primary-btn" id="sendLoginCodeBtn">Send Login Code →</button>
                                </form>
                                
                                <div id="loginSocialSection">
                                    <div class="divider">
                                        <span>OR</span>
                                    </div>
                                
                                <a href="#" class="social-btn" onclick="continueWithGoogle(); return false;">
                                    <svg width="18" height="18" viewBox="0 0 18 18" class="icon-margin">
                                        <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                                        <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                                        <path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.28l2.67-2.14z"/>
                                        <path fill="#EA4335" d="M8.98 3.54c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.35L4.5 7.42a4.77 4.77 0 0 1 4.48-3.88z"/>
                                    </svg>
                                    Continue with Google
                                </a>
                                
                                <a href="#" class="social-btn" onclick="continueWithMicrosoft(); return false;">
                                    <svg width="18" height="18" viewBox="0 0 18 18" class="icon-margin">
                                        <path fill="#F25022" d="M1 1h7v7H1z"/>
                                        <path fill="#7FBA00" d="M10 1h7v7h-7z"/>
                                        <path fill="#00A4EF" d="M1 10h7v7H1z"/>
                                        <path fill="#FFB900" d="M10 10h7v7h-7z"/>
                                    </svg>
                                    Continue with Microsoft
                                </a>
                                </div>
                                
                                <!-- Code verification form (hidden initially) -->
                                <form id="verifyLoginForm" class="verify-form">
                                    <div class="welcome-title">Check your email</div>
                                    <div class="welcome-subtitle">Enter the 6-digit code sent to your email.</div>
                                    
                                    <div class="form-group">
                                        <input type="text" class="form-control glass-input" id="loginCode" placeholder="Enter 6-digit code" maxlength="6" pattern="[0-9]{6}" required>
                                    </div>
                                    <button type="submit" class="btn primary-btn">Verify & Login</button>
                                    <div class="bottom-link">
                                        <a href="#" id="backToEmailLink" onclick="backToEmailLogin(); return false;">← Back to email</a>
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
                                    <svg width="18" height="18" viewBox="0 0 18 18" class="icon-margin">
                                        <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                                        <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                                        <path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.28l2.67-2.14z"/>
                                        <path fill="#EA4335" d="M8.98 3.54c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.35L4.5 7.42a4.77 4.77 0 0 1 4.48-3.88z"/>
                                    </svg>
                                    Continue with Google
                                </a>
                                
                                <a href="#" class="social-btn" onclick="continueWithMicrosoft(); return false;">
                                    <svg width="18" height="18" viewBox="0 0 18 18" class="icon-margin">
                                        <path fill="#F25022" d="M1 1h7v7H1z"/>
                                        <path fill="#7FBA00" d="M10 1h7v7h-7z"/>
                                        <path fill="#00A4EF" d="M1 10h7v7H1z"/>
                                        <path fill="#FFB900" d="M10 10h7v7h-7z"/>
                                    </svg>
                                    Continue with Microsoft
                                </a>
                                </div>
                                
                                <!-- Code verification form (hidden initially) -->
                                <form id="verifySignupForm" class="verify-form">
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
                    <div class="glass-card" class="dev-tools-card">
                        <h6 class="dev-tools-title">Development Tools</h6>
                        <a href="test/test-interface.html" class="social-btn" class="dev-tools-link">
                            🧪 Test Interface
                        </a>
                        <a href="test/schema-switcher.html" class="social-btn" class="dev-tools-link">
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

    <!-- Coverage Logging (Development only) -->
    <script src="js/coverage.js?v=<?php echo time(); ?>"></script>
    <!-- Global Scripts -->
    <script src="js/global.js?v=<?php echo time(); ?>"></script>
    <!-- Page-specific Scripts -->
    <script src="js/index.js?v=<?php echo time(); ?>"></script>
</body>
</html>
