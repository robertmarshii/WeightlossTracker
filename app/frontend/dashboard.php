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
$loginTimeTimestamp = $_SESSION['login_time'] ?? null;
?>
<!DOCTYPE html>
<html lang="en">
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
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="images/favicon.svg">
    <!-- App Icon Title stays the same across languages -->
    <title data-eng="Dashboard - Weightloss Tracker" data-spa="Panel - Weightloss Tracker" data-fre="Tableau de Bord - Weightloss Tracker" data-ger="Dashboard - Weightloss Tracker">Dashboard - Weightloss Tracker</title>
    <!-- jQuery (upgraded for better compatibility) -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- Global Styles -->
    <link rel="stylesheet" href="css/global.css?v=<?php echo time(); ?>">
    <!-- Page-specific Styles -->
    <link rel="stylesheet" href="css/dashboard.css?v=<?php echo time(); ?>">
    <!-- Dynamic Theme Loader -->
    <link id="theme-css" rel="stylesheet" href="css/themes/glassmorphism.css?v=<?php echo time(); ?>">
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
                        <!-- Logo Text stays the same across languages -->
                        <div class="logo-text" data-eng="Weightloss<br>Tracker" data-spa="Weightloss<br>Tracker" data-fre="Weightloss<br>Tracker" data-ger="Weightloss<br>Tracker">Weightloss<br>Tracker</div>
                    </div>

                    <div class="welcome-content flex-grow-1 mx-4">
                        <h1 class="welcome-title mb-1" data-eng="Welcome!" data-spa="¡Bienvenido!" data-fre="Bienvenue!" data-ger="Willkommen!">Welcome!</h1>
                        <p class="welcome-subtitle mb-0" data-eng="Track your weightloss journey and achieve your goals" data-spa="Rastrea tu viaje de pérdida de peso y alcanza tus objetivos" data-fre="Suivez votre parcours de perte de poids et atteignez vos objectifs" data-ger="Verfolgen Sie Ihre Gewichtsabnahme und erreichen Sie Ihre Ziele">Track your weightloss journey and achieve your goals</p>
                    </div>
                </div>

                <!-- Second Row: User Info and Buttons -->
                <div class="d-flex align-items-center justify-content-between header-bottom-row">
                    <div class="header-left d-flex align-items-center">
                        <div class="user-info text-left">
                            <div class="mb-1"><?php echo $email; ?></div>
                            <?php if ($loginTimeTimestamp): ?>
                                <div class="text-muted small"><span data-eng="Login: " data-spa="Inicio de sesión: " data-fre="Connexion: " data-ger="Anmeldung: ">Login: </span><span id="login-time" data-timestamp="<?php echo $loginTimeTimestamp; ?>"></span></div>
                            <?php endif; ?>
                        </div>
                    </div>

                    <div class="d-flex align-items-center header-buttons">
                        <a class="btn coffee-btn btn-sm me-2" href="https://buymeacoffee.com/robertmarshii" target="_blank" rel="noopener noreferrer" data-eng="☕ Buy me a coffee" data-spa="☕ Cómprame un café" data-fre="☕ Offrez-moi un café" data-ger="☕ Einen Kaffee ausgeben">☕ Buy me a coffee</a>
                        <button id="btn-logout" class="btn danger-btn btn-sm" data-eng="↪ Logout" data-spa="↪ Cerrar sesión" data-fre="↪ Déconnexion" data-ger="↪ Abmelden">↪ Logout</button>
                    </div>
                </div>
            </div>
            
            <!-- Dashboard Tabs -->
            <div class="glass-card">
                <ul class="nav nav-tabs d-flex justwrap" id="dashboardTabs" role="tablist">
                    <li class="nav-item flex-fill" role="presentation">
                        <a class="nav-link active text-center menu-text" id="data-tab" data-toggle="tab" href="#data" role="tab">
                            <span class="tab-icon">📊</span><span data-eng="Data" data-spa="Datos" data-fre="Données" data-ger="Daten">Data</span>
                        </a>
                    </li>
                    <li class="nav-item flex-fill" role="presentation">
                        <a class="nav-link text-center menu-text" id="health-tab" data-toggle="tab" href="#health" role="tab">
                            <span class="tab-icon">💚</span><span data-eng="Health" data-spa="Salud" data-fre="Santé" data-ger="Gesundheit">Health</span>
                        </a>
                    </li>
                    <li class="nav-item flex-fill" role="presentation">
                        <a class="nav-link text-center menu-text" id="body-tab" data-toggle="tab" href="#body" role="tab">
                            <span class="tab-icon">💪</span><span data-eng="Body" data-spa="Cuerpo" data-fre="Corps" data-ger="Körper">Body</span>
                        </a>
                    </li>
                    <li class="nav-item flex-fill" role="presentation">
                        <a class="nav-link text-center menu-text" id="goals-tab" data-toggle="tab" href="#goals" role="tab">
                            <span class="tab-icon">🎯</span><span data-eng="Goals" data-spa="Metas" data-fre="Objectifs" data-ger="Ziele">Goals</span>
                        </a>
                    </li>
                    <li class="nav-item flex-fill" role="presentation">
                        <a class="nav-link text-center menu-text" id="settings-tab" data-toggle="tab" href="#settings" role="tab">
                            <span class="tab-icon">⚙️</span><span data-eng="Settings" data-spa="Configuración" data-fre="Paramètres" data-ger="Einstellungen">Settings</span>
                        </a>
                    </li>
                </ul>
                
                <div class="tab-content" id="dashboardTabsContent">
                    <?php include_once 'pages/data.php'; ?>
                    <?php include_once 'pages/health.php'; ?>
                    <?php include_once 'pages/body.php'; ?>
                    <?php include_once 'pages/goals.php'; ?>
                    <?php include_once 'pages/settings.php'; ?>
            </div>
        </div>
    </div>
</div>

<!-- Global Scripts - Must load FIRST -->
<script src="js/global.js?v=<?php echo time(); ?>"></script>
<!-- Coverage Logging (Development only) -->
<script src="js/coverage.js?v=<?php echo time(); ?>"></script>
<!-- Translation Helper -->
<script src="js/translate.js?v=<?php echo time(); ?>"></script>
<!-- Modular JS files -->
<script src="js/navigation.js?v=<?php echo time(); ?>"></script>
<script src="js/health.js?v=<?php echo time(); ?>"></script>
<script src="js/data.js?v=<?php echo time() . '-' . mt_rand(); ?>"></script>
<script src="js/body.js?v=<?php echo time(); ?>"></script>
<script src="js/goals.js?v=<?php echo time(); ?>"></script>
<script src="js/achievements.js?v=<?php echo time(); ?>"></script>
<script src="js/settings.js?v=<?php echo time(); ?>"></script>
<script src="js/dashboard.js?v=<?php echo time() . '-' . mt_rand(); ?>&bust=999"></script>
</body>
</html>
