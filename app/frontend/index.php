<?php
// Auto-redirect logged-in users to dashboard.
// Only check when the visitor already has a session or remember-me cookie, so first-time visitors
// (and crawlers) get no session cookie and a cacheable page.
require_once('/var/app/backend/AuthManager.php');
if ((isset($_COOKIE[session_name()]) || isset($_COOKIE['remember_token'])) && AuthManager::isLoggedIn()) {
    header('Location: dashboard.php');
    exit;
}
$assetVersion = function ($path) { $t = @filemtime(__DIR__ . '/' . $path); return $t ? $t : '1'; };
?>
<!DOCTYPE html>
<html lang="en-GB">
<head>
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=AW-17636245354"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'AW-17636245354');
    </script>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Icons and manifest -->
    <link rel="icon" href="/favicon.ico" sizes="48x48">
    <link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">

    <!-- SEO Meta Tags -->
    <title>Free Weight Loss Tracker: Log Weight, BMI and Goals | Weightloss Tracker</title>
    <meta name="description" content="Free online weight loss tracker. Log your weight in kg, lb or stone, see your trend, BMI and a body fat estimate, set a goal and choose email reminders. Sign in with an email code, Google or Microsoft.">
    <meta name="author" content="Weightloss Tracker">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://weightloss-tracker.com/">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://weightloss-tracker.com/">
    <meta property="og:title" content="Free Weight Loss Tracker: Log Weight, BMI and Goals | Weightloss Tracker">
    <meta property="og:description" content="Free online weight loss tracker. Log your weight in kg, lb or stone, see your trend, BMI and a body fat estimate, set a goal and choose email reminders. Sign in with an email code, Google or Microsoft.">
    <meta property="og:image" content="https://weightloss-tracker.com/images/og-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Weightloss Tracker">

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="https://weightloss-tracker.com/">
    <meta name="twitter:title" content="Free Weight Loss Tracker: Log Weight, BMI and Goals | Weightloss Tracker">
    <meta name="twitter:description" content="Free online weight loss tracker. Log your weight in kg, lb or stone, see your trend, BMI and a body fat estimate, set a goal and choose email reminders. Sign in with an email code, Google or Microsoft.">
    <meta name="twitter:image" content="https://weightloss-tracker.com/images/og-image.png">

    <!-- Additional SEO -->
    <meta name="theme-color" content="#4A90E2">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="Weightloss Tracker">
    <script type="application/ld+json">
    {
     "@context": "https://schema.org",
     "@graph": [
      {
       "@type": "WebApplication",
       "name": "Weightloss Tracker",
       "url": "https://weightloss-tracker.com/",
       "description": "Free online weight loss tracker: log your weight, see your trend, BMI and a body fat estimate, set a goal, earn achievements and choose email reminders.",
       "applicationCategory": "HealthApplication",
       "operatingSystem": "Any (web browser)",
       "inLanguage": [
        "en-GB",
        "es",
        "fr",
        "de"
       ],
       "isAccessibleForFree": true,
       "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "GBP"
       },
       "featureList": [
        "Weight log with history and charts",
        "BMI and body fat estimate",
        "Weight goal with progress and streaks",
        "Body measurements and smart-scale data",
        "Optional weekly reminder and monthly report emails",
        "Sign in with an email code, Google or Microsoft"
       ]
      },
      {
       "@type": "FAQPage",
       "mainEntity": [
        {
         "@type": "Question",
         "name": "Is Weightloss Tracker free?",
         "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes. There is no paid plan and nothing to install: it runs in your web browser on a phone, tablet or computer."
         }
        },
        {
         "@type": "Question",
         "name": "How do I sign in?",
         "acceptedAnswer": {
          "@type": "Answer",
          "text": "There is no password. Enter your email address and we send you a 6-digit code that works for 15 minutes, or continue with your Google or Microsoft account. You stay signed in on that device until you sign out, or until 30 days pass without a visit."
         }
        },
        {
         "@type": "Question",
         "name": "Which units can I use?",
         "acceptedAnswer": {
          "@type": "Answer",
          "text": "Weight in kilograms, pounds or stone, and height in centimetres, metres or feet and inches. You can change them at any time in Settings."
         }
        },
        {
         "@type": "Question",
         "name": "Will you email me?",
         "acceptedAnswer": {
          "@type": "Answer",
          "text": "Only to send your sign-in codes, unless you choose more. In Settings you can turn on a weekly reminder to log your weight, on the day and time you pick, and a monthly progress report. Both are off until you turn them on."
         }
        },
        {
         "@type": "Question",
         "name": "Is this medical advice?",
         "acceptedAnswer": {
          "@type": "Answer",
          "text": "No. The app works out figures such as BMI, a body fat estimate and an ideal weight range from the numbers you enter. They are general information only. Talk to a GP or other health professional about your health or before making big changes."
         }
        }
       ]
      }
     ]
    }
    </script>
    <!-- jQuery (upgraded for better compatibility) -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <!-- Bootstrap -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
    <!-- Global Styles -->
    <link rel="stylesheet" href="css/global.css?v=<?php echo $assetVersion('css/global.css'); ?>">
    <!-- Page-specific Styles -->
    <link rel="stylesheet" href="css/index.css?v=<?php echo $assetVersion('css/index.css'); ?>">
</head>
<body>
    <!-- Fixed Alert Container -->
    <div id="alert-container"></div>

    <main class="container">
        <div class="row justify-content-center align-items-center min-vh-90">
            <!-- What the app does: first on phones, beside the sign-in card on wide screens -->
            <section class="col-md-6 col-lg-5 intro" aria-labelledby="page-title">
                <h1 id="page-title">Free weight loss tracker</h1>
                <p class="lead-text">Log your weight in a few seconds and see how you are doing: your trend over time, BMI, a body fat estimate and progress towards your goal. It is free, works in any web browser and needs no password.</p>
                <ul class="intro-points">
                    <li>Weight log with history and charts, from the last week to all time</li>
                    <li>BMI, a body fat estimate and an ideal weight range, worked out from your entries</li>
                    <li>A weight goal with progress, streaks and achievements</li>
                    <li>Optional body measurements and smart-scale readings</li>
                    <li>Optional weekly reminder and monthly report by email</li>
                </ul>
                <a href="#signin" class="btn primary-btn intro-cta">Sign in / Create account</a>
            </section>
            <div class="col-md-6">
                <!-- Login/Signup Form -->
                <section class="glass-card" id="signin" aria-labelledby="signin-title">
                    <div class="logo-section">
                        <div class="logo-icon">
                            <svg viewBox="0 0 44 44" class="progress-ring">
                                <circle cx="22" cy="22" r="15" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="12"/>
                                <circle cx="22" cy="22" r="15" fill="none" stroke="#64a6d8" stroke-width="12" 
                                        stroke-linecap="round" class="progress-ring-circle"/>
                            </svg>
                        </div>
                        <div class="logo-text" data-eng="Weightloss Tracker" data-spa="Rastreador de Pérdida de Peso" data-fre="Suivi de Perte de Poids" data-ger="Gewichtsverlust-Tracker">Weightloss Tracker</div>
                        <h2 id="signin-title" class="signin-title">Sign in / Create account</h2>
                    </div>
                    
                    <ul class="nav nav-tabs" id="authTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <a class="nav-link active" id="login-tab" data-toggle="tab" href="#login" role="tab" data-eng="Login" data-spa="Iniciar Sesión" data-fre="Connexion" data-ger="Anmelden">Login</a>
                        </li>
                        <li class="nav-item" role="presentation">
                            <a class="nav-link" id="signup-tab" data-toggle="tab" href="#signup" role="tab" data-eng="Sign Up" data-spa="Registrarse" data-fre="S'inscrire" data-ger="Registrieren">Sign Up</a>
                        </li>
                    </ul>
                        
                        <div class="tab-content" id="authTabsContent">
                            <!-- Login Tab -->
                            <div class="tab-pane fade show active" id="login" role="tabpanel">
                                <div id="loginWelcomeSection">
                                    <div class="welcome-title" data-eng="Welcome back" data-spa="Bienvenido de vuelta" data-fre="Content de vous revoir" data-ger="Willkommen zurück">Welcome back</div>
                                    <div class="welcome-subtitle" data-eng="Please enter your details to sign in." data-spa="Por favor ingresa tus datos para iniciar sesión." data-fre="Veuillez saisir vos informations pour vous connecter." data-ger="Bitte geben Sie Ihre Daten ein, um sich anzumelden.">Please enter your details to sign in.</div>
                                </div>
                                
                                <form id="loginForm">
                                    <div class="form-group">
                                        <label for="loginEmail" class="sr-only">Email address</label>
                                        <input type="email" class="form-control glass-input" id="loginEmail" placeholder="Enter your email" data-eng="Enter your email" data-spa="Ingresa tu correo electrónico" data-fre="Saisissez votre e-mail" data-ger="E-Mail eingeben" required>
                                    </div>
                                    <button type="submit" class="btn primary-btn" id="sendLoginCodeBtn" data-eng="Send Login Code →" data-spa="Enviar Código de Acceso →" data-fre="Envoyer le Code de Connexion →" data-ger="Anmeldecode senden →">Send Login Code →</button>
                                </form>
                                
                                <div id="loginSocialSection">
                                    <div class="divider">
                                        <span data-eng="OR" data-spa="O" data-fre="OU" data-ger="ODER">OR</span>
                                    </div>
                                
                                <a href="#" class="social-btn" onclick="continueWithGoogle(); return false;">
                                    <svg width="18" height="18" viewBox="0 0 18 18" class="icon-margin">
                                        <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                                        <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                                        <path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.28l2.67-2.14z"/>
                                        <path fill="#EA4335" d="M8.98 3.54c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.35L4.5 7.42a4.77 4.77 0 0 1 4.48-3.88z"/>
                                    </svg>
                                    <span data-eng="Continue with Google" data-spa="Continuar con Google" data-fre="Continuer avec Google" data-ger="Mit Google fortfahren">Continue with Google</span>
                                </a>
                                
                                <a href="#" class="social-btn" onclick="continueWithMicrosoft(); return false;">
                                    <svg width="18" height="18" viewBox="0 0 18 18" class="icon-margin">
                                        <path fill="#F25022" d="M1 1h7v7H1z"/>
                                        <path fill="#7FBA00" d="M10 1h7v7h-7z"/>
                                        <path fill="#00A4EF" d="M1 10h7v7H1z"/>
                                        <path fill="#FFB900" d="M10 10h7v7h-7z"/>
                                    </svg>
                                    <span data-eng="Continue with Microsoft" data-spa="Continuar con Microsoft" data-fre="Continuer avec Microsoft" data-ger="Mit Microsoft fortfahren">Continue with Microsoft</span>
                                </a>
                                </div>
                                
                                <!-- Code verification form (hidden initially) -->
                                <form id="verifyLoginForm" class="verify-form">
                                    <div class="welcome-title" data-eng="Check your email" data-spa="Revisa tu correo electrónico" data-fre="Vérifiez votre e-mail" data-ger="Überprüfen Sie Ihre E-Mail">Check your email</div>
                                    <div class="welcome-subtitle" data-eng="Enter the 6-digit code sent to your email." data-spa="Ingresa el código de 6 dígitos enviado a tu correo." data-fre="Saisissez le code à 6 chiffres envoyé à votre e-mail." data-ger="Geben Sie den 6-stelligen Code ein, der an Ihre E-Mail gesendet wurde.">Enter the 6-digit code sent to your email.</div>
                                    
                                    <div class="form-group">
                                        <label for="loginCode" class="sr-only">6-digit code</label>
                                        <input type="text" class="form-control glass-input" id="loginCode" placeholder="Enter 6-digit code" data-eng="Enter 6-digit code" data-spa="Ingresa código de 6 dígitos" data-fre="Saisissez le code à 6 chiffres" data-ger="6-stelligen Code eingeben" maxlength="6" pattern="[0-9]{6}" required>
                                    </div>
                                    <button type="submit" class="btn primary-btn" data-eng="Verify & Login" data-spa="Verificar e Iniciar Sesión" data-fre="Vérifier et Se Connecter" data-ger="Verifizieren & Anmelden">Verify & Login</button>
                                    <div class="bottom-link">
                                        <a href="#" id="backToEmailLink" onclick="backToEmailLogin(); return false;" data-eng="← Back to email" data-spa="← Volver al correo" data-fre="← Retour à l'e-mail" data-ger="← Zurück zur E-Mail">← Back to email</a>
                                    </div>
                                </form>
                            </div>
                            
                            <!-- Signup Tab -->
                            <div class="tab-pane fade" id="signup" role="tabpanel">
                                <div id="signupWelcomeSection">
                                    <div class="welcome-title" data-eng="Create Account" data-spa="Crear Cuenta" data-fre="Créer un Compte" data-ger="Konto erstellen">Create Account</div>
                                    <div class="welcome-subtitle" data-eng="Please enter your details to get started." data-spa="Por favor ingresa tus datos para comenzar." data-fre="Veuillez saisir vos informations pour commencer." data-ger="Bitte geben Sie Ihre Daten ein, um zu beginnen.">Please enter your details to get started.</div>
                                </div>
                                
                                <form id="signupForm">
                                    <div class="form-group">
                                        <label for="signupEmail" class="sr-only">Email address</label>
                                        <input type="email" class="form-control glass-input" id="signupEmail" placeholder="Enter your email" data-eng="Enter your email" data-spa="Ingresa tu correo electrónico" data-fre="Saisissez votre e-mail" data-ger="E-Mail eingeben" required>
                                    </div>
                                    <div class="form-check mb-3" id="termsCheck">
                                        <input type="checkbox" class="form-check-input" id="agreeTerms" required>
                                        <label class="form-check-label small" id="agreeTermsLabel" for="agreeTerms">
                                            <span data-eng="I agree to the " data-spa="Acepto los " data-fre="J'accepte les " data-ger="Ich stimme den ">I agree to the </span><a href="#" onclick="openModal('termsModal'); return false;" data-eng="Terms and Conditions" data-spa="Términos y Condiciones" data-fre="Conditions Générales" data-ger="Allgemeinen Geschäftsbedingungen">Terms and Conditions</a><span data-eng=", " data-spa=", " data-fre=", " data-ger=", ">, </span>
                                            <a href="/privacy" target="_blank" data-eng="Privacy Policy" data-spa="Política de Privacidad" data-fre="Politique de Confidentialité" data-ger="Datenschutzrichtlinie">Privacy Policy</a><span data-eng=", and " data-spa=", y " data-fre=", et " data-ger=", und ">, and </span>
                                            <a href="/privacy#cookies" target="_blank" data-eng="Cookie Policy" data-spa="Política de Cookies" data-fre="Politique des Cookies" data-ger="Cookie-Richtlinie">Cookie Policy</a>
                                        </label>
                                    </div>
                                    <button type="submit" class="btn primary-btn" data-eng="Create Account →" data-spa="Crear Cuenta →" data-fre="Créer un Compte →" data-ger="Konto erstellen →">Create Account →</button>
                                </form>
                                
                                <div id="signupSocialSection">
                                    <div class="divider">
                                        <span data-eng="OR" data-spa="O" data-fre="OU" data-ger="ODER">OR</span>
                                    </div>
                                
                                <a href="#" class="social-btn" onclick="continueWithGoogle(); return false;">
                                    <svg width="18" height="18" viewBox="0 0 18 18" class="icon-margin">
                                        <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                                        <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.53H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                                        <path fill="#FBBC05" d="M4.5 10.49a4.8 4.8 0 0 1 0-3.07V5.35H1.83a8 8 0 0 0 0 7.28l2.67-2.14z"/>
                                        <path fill="#EA4335" d="M8.98 3.54c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.35L4.5 7.42a4.77 4.77 0 0 1 4.48-3.88z"/>
                                    </svg>
                                    <span data-eng="Continue with Google" data-spa="Continuar con Google" data-fre="Continuer avec Google" data-ger="Mit Google fortfahren">Continue with Google</span>
                                </a>
                                
                                <a href="#" class="social-btn" onclick="continueWithMicrosoft(); return false;">
                                    <svg width="18" height="18" viewBox="0 0 18 18" class="icon-margin">
                                        <path fill="#F25022" d="M1 1h7v7H1z"/>
                                        <path fill="#7FBA00" d="M10 1h7v7h-7z"/>
                                        <path fill="#00A4EF" d="M1 10h7v7H1z"/>
                                        <path fill="#FFB900" d="M10 10h7v7h-7z"/>
                                    </svg>
                                    <span data-eng="Continue with Microsoft" data-spa="Continuar con Microsoft" data-fre="Continuer avec Microsoft" data-ger="Mit Microsoft fortfahren">Continue with Microsoft</span>
                                </a>
                                </div>
                                
                                <!-- Code verification form (hidden initially) -->
                                <form id="verifySignupForm" class="verify-form">
                                    <div class="welcome-title" data-eng="Verify your email" data-spa="Verifica tu correo electrónico" data-fre="Vérifiez votre e-mail" data-ger="E-Mail verifizieren">Verify your email</div>
                                    <div class="welcome-subtitle" data-eng="Enter the 6-digit verification code sent to your email." data-spa="Ingresa el código de verificación de 6 dígitos enviado a tu correo." data-fre="Saisissez le code de vérification à 6 chiffres envoyé à votre e-mail." data-ger="Geben Sie den 6-stelligen Verifizierungscode ein, der an Ihre E-Mail gesendet wurde.">Enter the 6-digit verification code sent to your email.</div>
                                    
                                    <div class="form-group">
                                        <label for="signupCode" class="sr-only">6-digit code</label>
                                        <input type="text" class="form-control glass-input" id="signupCode" placeholder="Enter 6-digit code" data-eng="Enter 6-digit code" data-spa="Ingresa código de 6 dígitos" data-fre="Saisissez le code à 6 chiffres" data-ger="6-stelligen Code eingeben" maxlength="6" pattern="[0-9]{6}" required>
                                    </div>
                                    <button type="submit" class="btn primary-btn" data-eng="Verify & Complete Signup" data-spa="Verificar y Completar Registro" data-fre="Vérifier et Terminer l'Inscription" data-ger="Verifizieren & Registrierung abschließen">Verify & Complete Signup</button>
                                    <div class="bottom-link">
                                        <a href="#" onclick="backToEmailSignup(); return false;" data-eng="← Back to email" data-spa="← Volver al correo" data-fre="← Retour à l'e-mail" data-ger="← Zurück zur E-Mail">← Back to email</a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </section>
                </div>

                <div class="mt-4" style="display:none">
                    <div class="glass-card">
                        <h6 class="text-center mb-3" data-eng="Support Development" data-spa="Apoyar el Desarrollo" data-fre="Soutenir le Développement" data-ger="Entwicklung unterstützen">Support Development</h6>
                        <div class="text-center">
                            <a href="https://buymeacoffee.com/robertmarshii" target="_blank" rel="noopener noreferrer" class="coffee-btn">
                                <span data-eng="☕ Buy me a coffee" data-spa="☕ Cómprame un café" data-fre="☕ Offrez-moi un café" data-ger="☕ Einen Kaffee ausgeben">☕ Buy me a coffee</span>
                            </a>
                        </div>
                    </div>
                </div>
        </div>

        <section class="info-section" aria-labelledby="how-title">
            <h2 id="how-title">How it works</h2>
            <ol class="steps">
                <li><strong>Sign in</strong> with an email code, Google or Microsoft.</li>
                <li><strong>Add your height, age and a first weight.</strong> The app works out your BMI, a body fat estimate and an ideal weight range.</li>
                <li><strong>Set a target weight</strong> and log your weight as often as you like. Charts, streaks and achievements show your progress.</li>
            </ol>
            <p>You can use it in English, Spanish, French or German, choose from six colour themes, and delete any weight entry from your history.</p>
        </section>

        <section class="info-section" aria-labelledby="faq-title">
            <h2 id="faq-title">Questions</h2>
                <div class="faq-item">
                    <h3>Is Weightloss Tracker free?</h3>
                    <p>Yes. There is no paid plan and nothing to install: it runs in your web browser on a phone, tablet or computer.</p>
                </div>
                <div class="faq-item">
                    <h3>How do I sign in?</h3>
                    <p>There is no password. Enter your email address and we send you a 6-digit code that works for 15 minutes, or continue with your Google or Microsoft account. You stay signed in on that device until you sign out, or until 30 days pass without a visit.</p>
                </div>
                <div class="faq-item">
                    <h3>Which units can I use?</h3>
                    <p>Weight in kilograms, pounds or stone, and height in centimetres, metres or feet and inches. You can change them at any time in Settings.</p>
                </div>
                <div class="faq-item">
                    <h3>Will you email me?</h3>
                    <p>Only to send your sign-in codes, unless you choose more. In Settings you can turn on a weekly reminder to log your weight, on the day and time you pick, and a monthly progress report. Both are off until you turn them on.</p>
                </div>
                <div class="faq-item">
                    <h3>Is this medical advice?</h3>
                    <p>No. The app works out figures such as BMI, a body fat estimate and an ideal weight range from the numbers you enter. They are general information only. Talk to a GP or other health professional about your health or before making big changes.</p>
                </div>
        </section>
    </main>

    <footer class="site-footer">
        <nav aria-label="Footer">
            <a href="/privacy">Privacy &amp; cookies</a>
            <button type="button" class="footer-btn" onclick="openModal('termsModal')">Terms</button>
            <a href="#signin">Sign in</a>
        </nav>
        <p>&copy; <?php echo date('Y'); ?> Weightloss Tracker</p>
    </footer>

    <!-- Terms and Conditions Modal -->
    <div class="modal fade" id="termsModal" tabindex="-1" role="dialog" aria-labelledby="termsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="termsModalLabel" data-eng="Terms and Conditions" data-spa="Términos y Condiciones" data-fre="Conditions Générales" data-ger="Allgemeinen Geschäftsbedingungen">Terms and Conditions</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <h6 data-eng="1. Acceptance of Terms" data-spa="1. Aceptación de Términos" data-fre="1. Acceptation des Conditions" data-ger="1. Akzeptanz der Bedingungen">1. Acceptance of Terms</h6>
                    <p data-eng="By using the Weightloss Tracker application, you agree to be bound by these Terms and Conditions." data-spa="Al usar la aplicación Rastreador de Pérdida de Peso, aceptas estar sujeto a estos Términos y Condiciones." data-fre="En utilisant l'application Suivi de Perte de Poids, vous acceptez d'être lié par ces Conditions Générales." data-ger="Durch die Nutzung der Gewichtsverlust-Tracker-Anwendung stimmen Sie zu, an diese Allgemeinen Geschäftsbedingungen gebunden zu sein.">By using the Weightloss Tracker application, you agree to be bound by these Terms and Conditions.</p>
                    
                    <h6 data-eng="2. Description of Service" data-spa="2. Descripción del Servicio" data-fre="2. Description du Service" data-ger="2. Beschreibung des Dienstes">2. Description of Service</h6>
                    <p data-eng="Weightloss Tracker is a personal fitness tracking application that helps users monitor their weight loss journey and fitness goals." data-spa="Rastreador de Pérdida de Peso es una aplicación personal de seguimiento de fitness que ayuda a los usuarios a monitorear su viaje de pérdida de peso y objetivos de fitness." data-fre="Suivi de Perte de Poids est une application personnelle de suivi de fitness qui aide les utilisateurs à surveiller leur parcours de perte de poids et leurs objectifs de fitness." data-ger="Gewichtsverlust-Tracker ist eine persönliche Fitness-Tracking-Anwendung, die Benutzern hilft, ihren Gewichtsverlust-Weg und ihre Fitnessziele zu überwachen.">Weightloss Tracker is a personal fitness tracking application that helps users monitor their weight loss journey and fitness goals.</p>
                    
                    <h6 data-eng="3. User Responsibilities" data-spa="3. Responsabilidades del Usuario" data-fre="3. Responsabilités de l'Utilisateur" data-ger="3. Benutzerpflichten">3. User Responsibilities</h6>
                    <p data-eng="You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account." data-spa="Eres responsable de mantener la confidencialidad de tu cuenta y de todas las actividades que ocurran bajo tu cuenta." data-fre="Vous êtes responsable de maintenir la confidentialité de votre compte et de toutes les activités qui se produisent sous votre compte." data-ger="Sie sind verantwortlich für die Wahrung der Vertraulichkeit Ihres Kontos und für alle Aktivitäten, die unter Ihrem Konto stattfinden.">You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</p>

                    <h6 data-eng="4. Privacy" data-spa="4. Privacidad" data-fre="4. Confidentialité" data-ger="4. Datenschutz">4. Privacy</h6>
                    <p data-eng="Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information." data-spa="Tu privacidad es importante para nosotros. Por favor revisa nuestra Política de Privacidad para entender cómo recolectamos y usamos tu información." data-fre="Votre confidentialité est importante pour nous. Veuillez consulter notre Politique de Confidentialité pour comprendre comment nous collectons et utilisons vos informations." data-ger="Ihre Privatsphäre ist uns wichtig. Bitte lesen Sie unsere Datenschutzrichtlinie, um zu verstehen, wie wir Ihre Informationen sammeln und verwenden.">Your privacy is important to us. Please review our Privacy Policy to understand how we collect and use your information.</p>

                    <h6 data-eng="5. Disclaimer" data-spa="5. Descargo de Responsabilidad" data-fre="5. Avertissement" data-ger="5. Haftungsausschluss">5. Disclaimer</h6>
                    <p data-eng="This application is for informational purposes only and should not replace professional medical advice. Always consult with healthcare professionals for medical guidance." data-spa="Esta aplicación es solo para propósitos informativos y no debe reemplazar el consejo médico profesional. Siempre consulta con profesionales de la salud para orientación médica." data-fre="Cette application est à des fins d'information uniquement et ne doit pas remplacer les conseils médicaux professionnels. Consultez toujours des professionnels de la santé pour des conseils médicaux." data-ger="Diese Anwendung dient nur zu Informationszwecken und sollte professionelle medizinische Beratung nicht ersetzen. Konsultieren Sie immer Gesundheitsfachkräfte für medizinische Beratung.">This application is for informational purposes only and should not replace professional medical advice. Always consult with healthcare professionals for medical guidance.</p>

                    <h6 data-eng="6. Modifications" data-spa="6. Modificaciones" data-fre="6. Modifications" data-ger="6. Änderungen">6. Modifications</h6>
                    <p data-eng="We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of any changes." data-spa="Nos reservamos el derecho de modificar estos términos en cualquier momento. El uso continuado del servicio constituye la aceptación de cualquier cambio." data-fre="Nous nous réservons le droit de modifier ces conditions à tout moment. L'utilisation continue du service constitue l'acceptation de tout changement." data-ger="Wir behalten uns das Recht vor, diese Bedingungen jederzeit zu ändern. Die fortgesetzte Nutzung des Dienstes stellt die Annahme aller Änderungen dar.">We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of any changes.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal" data-eng="Close" data-spa="Cerrar" data-fre="Fermer" data-ger="Schließen">Close</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Coverage Logging (Development only) -->
    <script src="js/coverage.js?v=<?php echo $assetVersion('js/coverage.js'); ?>"></script>
    <!-- Global Scripts -->
    <script src="js/global.js?v=<?php echo $assetVersion('js/global.js'); ?>"></script>
    <!-- Page-specific Scripts -->
    <script src="js/index.js?v=<?php echo $assetVersion('js/index.js'); ?>"></script>
</body>
</html>
