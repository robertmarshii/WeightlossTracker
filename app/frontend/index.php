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
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="images/favicon.svg">
    <!-- App Icon Title stays the same across languages -->
    <title data-eng="Weightloss Tracker" data-spa="Weightloss Tracker" data-fre="Weightloss Tracker" data-ger="Weightloss Tracker">Weightloss Tracker</title>
    <!-- jQuery (upgraded for better compatibility) -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
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
                        <div class="logo-text" data-eng="Weightloss Tracker" data-spa="Rastreador de Pérdida de Peso" data-fre="Suivi de Perte de Poids" data-ger="Gewichtsverlust-Tracker">Weightloss Tracker</div>
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
                                        <input type="email" class="form-control glass-input" id="signupEmail" placeholder="Enter your email" data-eng="Enter your email" data-spa="Ingresa tu correo electrónico" data-fre="Saisissez votre e-mail" data-ger="E-Mail eingeben" required>
                                    </div>
                                    <div class="form-check mb-3" id="termsCheck">
                                        <input type="checkbox" class="form-check-input" id="agreeTerms" required>
                                        <label class="form-check-label small" id="agreeTermsLabel" for="agreeTerms">
                                            <span data-eng="I agree to the " data-spa="Acepto los " data-fre="J'accepte les " data-ger="Ich stimme den ">I agree to the </span><a href="#" onclick="openModal('termsModal'); return false;" data-eng="Terms and Conditions" data-spa="Términos y Condiciones" data-fre="Conditions Générales" data-ger="Allgemeinen Geschäftsbedingungen">Terms and Conditions</a><span data-eng=", " data-spa=", " data-fre=", " data-ger=", ">, </span>
                                            <a href="#" onclick="openModal('privacyModal'); return false;" data-eng="Privacy Policy" data-spa="Política de Privacidad" data-fre="Politique de Confidentialité" data-ger="Datenschutzrichtlinie">Privacy Policy</a><span data-eng=", and " data-spa=", y " data-fre=", et " data-ger=", und ">, and </span>
                                            <a href="#" onclick="openModal('cookieModal'); return false;" data-eng="Cookie Policy" data-spa="Política de Cookies" data-fre="Politique des Cookies" data-ger="Cookie-Richtlinie">Cookie Policy</a>
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
                                        <input type="text" class="form-control glass-input" id="signupCode" placeholder="Enter 6-digit code" data-eng="Enter 6-digit code" data-spa="Ingresa código de 6 dígitos" data-fre="Saisissez le code à 6 chiffres" data-ger="6-stelligen Code eingeben" maxlength="6" pattern="[0-9]{6}" required>
                                    </div>
                                    <button type="submit" class="btn primary-btn" data-eng="Verify & Complete Signup" data-spa="Verificar y Completar Registro" data-fre="Vérifier et Terminer l'Inscription" data-ger="Verifizieren & Registrierung abschließen">Verify & Complete Signup</button>
                                    <div class="bottom-link">
                                        <a href="#" onclick="backToEmailSignup(); return false;" data-eng="← Back to email" data-spa="← Volver al correo" data-fre="← Retour à l'e-mail" data-ger="← Zurück zur E-Mail">← Back to email</a>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
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
        </div>
    </div>

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

    <!-- Privacy Policy Modal -->
    <div class="modal fade" id="privacyModal" tabindex="-1" role="dialog" aria-labelledby="privacyModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="privacyModalLabel" data-eng="Privacy Policy" data-spa="Política de Privacidad" data-fre="Politique de Confidentialité" data-ger="Datenschutzrichtlinie">Privacy Policy</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <h6 data-eng="Information We Collect" data-spa="Información que Recolectamos" data-fre="Informations que Nous Collectons" data-ger="Informationen, die wir sammeln">Information We Collect</h6>
                    <p data-eng="We collect information you provide directly to us, such as when you create an account, update your profile, or use our services." data-spa="Recolectamos información que nos proporcionas directamente, como cuando creas una cuenta, actualizas tu perfil o usas nuestros servicios." data-fre="Nous collectons les informations que vous nous fournissez directement, comme lorsque vous créez un compte, mettez à jour votre profil ou utilisez nos services." data-ger="Wir sammeln Informationen, die Sie uns direkt zur Verfügung stellen, z.B. wenn Sie ein Konto erstellen, Ihr Profil aktualisieren oder unsere Dienste nutzen.">We collect information you provide directly to us, such as when you create an account, update your profile, or use our services.</p>

                    <h6 data-eng="How We Use Your Information" data-spa="Cómo Usamos tu Información" data-fre="Comment Nous Utilisons vos Informations" data-ger="Wie wir Ihre Informationen verwenden">How We Use Your Information</h6>
                    <p data-eng="We use the information we collect to:" data-spa="Usamos la información que recolectamos para:" data-fre="Nous utilisons les informations que nous collectons pour :" data-ger="Wir verwenden die Informationen, die wir sammeln, um:">We use the information we collect to:</p>
                    <ul>
                        <li data-eng="Provide, maintain, and improve our services" data-spa="Proporcionar, mantener y mejorar nuestros servicios" data-fre="Fournir, maintenir et améliorer nos services" data-ger="Unsere Dienste bereitstellen, warten und verbessern">Provide, maintain, and improve our services</li>
                        <li data-eng="Send you technical notices and support messages" data-spa="Enviarte avisos técnicos y mensajes de soporte" data-fre="Vous envoyer des avis techniques et des messages de support" data-ger="Ihnen technische Hinweise und Support-Nachrichten senden">Send you technical notices and support messages</li>
                        <li data-eng="Respond to your comments and questions" data-spa="Responder a tus comentarios y preguntas" data-fre="Répondre à vos commentaires et questions" data-ger="Auf Ihre Kommentare und Fragen antworten">Respond to your comments and questions</li>
                        <li data-eng="Monitor and analyze usage patterns" data-spa="Monitorear y analizar patrones de uso" data-fre="Surveiller et analyser les modèles d'utilisation" data-ger="Nutzungsmuster überwachen und analysieren">Monitor and analyze usage patterns</li>
                    </ul>

                    <h6 data-eng="Information Sharing" data-spa="Compartir Información" data-fre="Partage d'Informations" data-ger="Informationsweitergabe">Information Sharing</h6>
                    <p data-eng="We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy." data-spa="No vendemos, intercambiamos o transferimos de otra manera tu información personal a terceros sin tu consentimiento, excepto como se describe en esta política." data-fre="Nous ne vendons, n'échangeons ou ne transférons pas vos informations personnelles à des tiers sans votre consentement, sauf comme décrit dans cette politique." data-ger="Wir verkaufen, tauschen oder übertragen Ihre persönlichen Informationen nicht an Dritte ohne Ihre Zustimmung, außer wie in dieser Richtlinie beschrieben.">We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.</p>

                    <h6 data-eng="Data Security" data-spa="Seguridad de Datos" data-fre="Sécurité des Données" data-ger="Datensicherheit">Data Security</h6>
                    <p data-eng="We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction." data-spa="Implementamos medidas de seguridad apropiadas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción." data-fre="Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations personnelles contre l'accès non autorisé, la modification, la divulgation ou la destruction." data-ger="Wir implementieren angemessene Sicherheitsmaßnahmen, um Ihre persönlichen Informationen vor unbefugtem Zugriff, Änderung, Offenlegung oder Zerstörung zu schützen.">We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

                    <h6 data-eng="Contact Us" data-spa="Contáctanos" data-fre="Contactez-nous" data-ger="Kontaktieren Sie uns">Contact Us</h6>
                    <p data-eng="If you have any questions about this Privacy Policy, please contact us through our support channels." data-spa="Si tienes alguna pregunta sobre esta Política de Privacidad, por favor contáctanos a través de nuestros canales de soporte." data-fre="Si vous avez des questions sur cette Politique de Confidentialité, veuillez nous contacter par nos canaux de support." data-ger="Wenn Sie Fragen zu dieser Datenschutzrichtlinie haben, kontaktieren Sie uns bitte über unsere Support-Kanäle.">If you have any questions about this Privacy Policy, please contact us through our support channels.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal" data-eng="Close" data-spa="Cerrar" data-fre="Fermer" data-ger="Schließen">Close</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Cookie Policy Modal -->
    <div class="modal fade" id="cookieModal" tabindex="-1" role="dialog" aria-labelledby="cookieModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="cookieModalLabel" data-eng="Cookie Policy" data-spa="Política de Cookies" data-fre="Politique des Cookies" data-ger="Cookie-Richtlinie">Cookie Policy</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <h6 data-eng="What Are Cookies" data-spa="Qué son las Cookies" data-fre="Que sont les Cookies" data-ger="Was sind Cookies">What Are Cookies</h6>
                    <p data-eng="Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience." data-spa="Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas nuestro sitio web. Nos ayudan a brindarte una mejor experiencia." data-fre="Les cookies sont de petits fichiers texte qui sont stockés sur votre appareil lorsque vous visitez notre site web. Ils nous aident à vous offrir une meilleure expérience." data-ger="Cookies sind kleine Textdateien, die auf Ihrem Gerät gespeichert werden, wenn Sie unsere Website besuchen. Sie helfen uns, Ihnen eine bessere Erfahrung zu bieten.">Cookies are small text files that are stored on your device when you visit our website. They help us provide you with a better experience.</p>

                    <h6 data-eng="How We Use Cookies" data-spa="Cómo Usamos las Cookies" data-fre="Comment Nous Utilisons les Cookies" data-ger="Wie wir Cookies verwenden">How We Use Cookies</h6>
                    <p data-eng="We use cookies to:" data-spa="Usamos cookies para:" data-fre="Nous utilisons les cookies pour :" data-ger="Wir verwenden Cookies, um:">We use cookies to:</p>
                    <ul>
                        <li data-eng="Keep you signed in to your account" data-spa="Mantenerte conectado a tu cuenta" data-fre="Vous maintenir connecté à votre compte" data-ger="Sie bei Ihrem Konto angemeldet zu halten">Keep you signed in to your account</li>
                        <li data-eng="Remember your preferences and settings" data-spa="Recordar tus preferencias y configuraciones" data-fre="Mémoriser vos préférences et paramètres" data-ger="Ihre Präferenzen und Einstellungen zu merken">Remember your preferences and settings</li>
                        <li data-eng="Analyze how you use our application" data-spa="Analizar cómo usas nuestra aplicación" data-fre="Analyser comment vous utilisez notre application" data-ger="Zu analysieren, wie Sie unsere Anwendung nutzen">Analyze how you use our application</li>
                        <li data-eng="Improve our services and user experience" data-spa="Mejorar nuestros servicios y experiencia del usuario" data-fre="Améliorer nos services et l'expérience utilisateur" data-ger="Unsere Dienste und Benutzererfahrung zu verbessern">Improve our services and user experience</li>
                    </ul>

                    <h6 data-eng="Types of Cookies We Use" data-spa="Tipos de Cookies que Usamos" data-fre="Types de Cookies que Nous Utilisons" data-ger="Arten von Cookies, die wir verwenden">Types of Cookies We Use</h6>
                    <p><strong data-eng="Essential Cookies:" data-spa="Cookies Esenciales:" data-fre="Cookies Essentiels :" data-ger="Wesentliche Cookies:">Essential Cookies:</strong> <span data-eng="These are necessary for the website to function and cannot be switched off." data-spa="Estas son necesarias para que el sitio web funcione y no se pueden desactivar." data-fre="Ceux-ci sont nécessaires pour que le site web fonctionne et ne peuvent pas être désactivés." data-ger="Diese sind notwendig, damit die Website funktioniert und können nicht ausgeschaltet werden.">These are necessary for the website to function and cannot be switched off.</span></p>
                    <p><strong data-eng="Analytics Cookies:" data-spa="Cookies de Análisis:" data-fre="Cookies d'Analyse :" data-ger="Analyse-Cookies:">Analytics Cookies:</strong> <span data-eng="These help us understand how visitors interact with our website." data-spa="Estas nos ayudan a entender cómo los visitantes interactúan con nuestro sitio web." data-fre="Ceux-ci nous aident à comprendre comment les visiteurs interagissent avec notre site web." data-ger="Diese helfen uns zu verstehen, wie Besucher mit unserer Website interagieren.">These help us understand how visitors interact with our website.</span></p>
                    <p><strong data-eng="Preference Cookies:" data-spa="Cookies de Preferencia:" data-fre="Cookies de Préférence :" data-ger="Präferenz-Cookies:">Preference Cookies:</strong> <span data-eng="These allow the website to remember choices you make and provide enhanced features." data-spa="Estas permiten al sitio web recordar las elecciones que haces y proporcionar características mejoradas." data-fre="Ceux-ci permettent au site web de se souvenir des choix que vous faites et de fournir des fonctionnalités améliorées." data-ger="Diese ermöglichen es der Website, sich an Ihre Entscheidungen zu erinnern und erweiterte Funktionen bereitzustellen.">These allow the website to remember choices you make and provide enhanced features.</span></p>

                    <h6 data-eng="Managing Cookies" data-spa="Gestión de Cookies" data-fre="Gestion des Cookies" data-ger="Cookie-Verwaltung">Managing Cookies</h6>
                    <p data-eng="You can control and/or delete cookies as you wish through your browser settings. However, please note that removing cookies may affect the functionality of our service." data-spa="Puedes controlar y/o eliminar cookies como desees a través de la configuración de tu navegador. Sin embargo, ten en cuenta que eliminar cookies puede afectar la funcionalidad de nuestro servicio." data-fre="Vous pouvez contrôler et/ou supprimer les cookies comme vous le souhaitez par les paramètres de votre navigateur. Cependant, veuillez noter que la suppression des cookies peut affecter la fonctionnalité de notre service." data-ger="Sie können Cookies nach Belieben über Ihre Browser-Einstellungen kontrollieren und/oder löschen. Bitte beachten Sie jedoch, dass das Entfernen von Cookies die Funktionalität unseres Dienstes beeinträchtigen kann.">You can control and/or delete cookies as you wish through your browser settings. However, please note that removing cookies may affect the functionality of our service.</p>

                    <h6 data-eng="Updates to This Policy" data-spa="Actualizaciones a Esta Política" data-fre="Mises à Jour de Cette Politique" data-ger="Aktualisierungen dieser Richtlinie">Updates to This Policy</h6>
                    <p data-eng="We may update this Cookie Policy from time to time. Any changes will be posted on this page." data-spa="Podemos actualizar esta Política de Cookies de vez en cuando. Cualquier cambio será publicado en esta página." data-fre="Nous pouvons mettre à jour cette Politique des Cookies de temps en temps. Tout changement sera publié sur cette page." data-ger="Wir können diese Cookie-Richtlinie von Zeit zu Zeit aktualisieren. Alle Änderungen werden auf dieser Seite veröffentlicht.">We may update this Cookie Policy from time to time. Any changes will be posted on this page.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal" data-eng="Close" data-spa="Cerrar" data-fre="Fermer" data-ger="Schließen">Close</button>
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
