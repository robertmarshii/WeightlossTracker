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
                    <!-- Data Management Tab -->
                    <div class="tab-pane fade show active" id="data" role="tabpanel">
                        <!-- Weight Tracking Cards -->
                        <div class="row">
                <div class="col-md-6">
                    <div class="glass-card-small">
                        <h5 class="card-title" data-eng="📊 Log Current Weight" data-spa="📊 Registrar Peso Actual" data-fre="📊 Enregistrer le Poids Actuel" data-ger="📊 Aktuelles Gewicht Erfassen">📊 Log Current Weight</h5>
                        <div class="row">
                            <div class="col-8">
                                <input type="number" step="0.1" min="0" id="weightKg" class="form-control glass-input" placeholder="Weight" data-eng="Weight" data-spa="Peso" data-fre="Poids" data-ger="Gewicht">
                            </div>
                            <div class="col-4">
                                <button id="btn-add-weight" class="btn primary-btn w-100" style="height: 34px;min-width:90px;" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                            </div>
                        </div>
                        <small class="text-muted d-block mt-2" id="latest-weight"></small>
                        <small class="text-muted d-block mt-1" id="last-week-weight"></small>
                        <small class="text-muted d-block mt-1" id="last-month-weight"></small>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="glass-card-small">
                        <h5 class="card-title" data-eng="🎯 Set Weight Goal" data-spa="🎯 Establecer Meta de Peso" data-fre="🎯 Définir l'Objectif de Poids" data-ger="🎯 Gewichtsziel Festlegen">🎯 Set Weight Goal</h5>
                        <div class="row mb-2">
                            <div class="col-12">
                                <input type="number" step="0.1" min="0" id="goalWeight" class="form-control glass-input mb-2" placeholder="Target weight" data-eng="Target weight" data-spa="Peso objetivo" data-fre="Poids cible" data-ger="Zielgewicht">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-8">
                                <input type="text" id="goalDate" class="form-control glass-input" placeholder="dd/mm/yyyy">
                            </div>
                            <div class="col-4">
                                <button id="btn-save-goal" class="btn primary-btn w-100" style="height: 34px;min-width:90px;"
                        data-eng="✓ Save"
                        data-spa="✓ Guardar"
                        data-fre="✓ Enreg."
                        data-ger="✓ Speichern" >✓ Save</button>
                            </div>
                        </div>
                        <small class="text-muted d-block mt-2" id="current-goal"></small>
                    </div>
                </div>
            </div>


            <!-- Weight History Card -->
            <div class="glass-card">
                <div class="d-flex justify-content-between align-items-center mb-3 weight-history-header">
                    <h5 class="card-title mb-0"
                        data-eng="📈 Weight History"
                        data-spa="📈 Historial de Peso"
                        data-fre="📈 Historique du Poids"
                        data-ger="📈 Gewichtsverlauf">📈 Weight History</h5>
                    <button id="btn-add-entry" class="btn primary-btn" style="height: 34px;"
                        data-eng="+ Add Entry"
                        data-spa="+ Agregar Entrada"
                        data-fre="+ Ajouter une Entrée"
                        data-ger="+ Eintrag hinzufügen">+ Add Entry</button>
                </div>
                
                <!-- Add New Entry Form (hidden by default) -->
                <div id="add-entry-form" class="mb-4 hidden">
                    <div class="row">
                        <div class="col-12 col-md-5">
                            <label for="newWeight" class="form-label" id="new-weight-label"
                                data-eng="Weight"
                                data-spa="Peso"
                                data-fre="Poids"
                                data-ger="Gewicht">Weight</label>
                            <input type="number" step="0.1" min="0" id="newWeight" class="form-control glass-input weight-input"
                                placeholder="e.g. 75.5"
                                data-eng="e.g. 75.5"
                                data-spa="ej. 75.5"
                                data-fre="ex. 75,5"
                                data-ger="z.B. 75,5">
                        </div>
                        <div class="col-12 col-md-4">
                            <label for="newDate" class="form-label"
                                data-eng="Date"
                                data-spa="Fecha"
                                data-fre="Date"
                                data-ger="Datum">Date</label>
                            <input type="text" id="newDate" class="form-control glass-input date-input" placeholder="dd/mm/yyyy">
                        </div>
                        <div class="col-12 col-md-3 d-flex flex-row flex-md-column align-items-end form-gap mt-3 mt-md-0" style="gap: 0.5rem;">
                            <button id="btn-save-entry" class="btn primary-btn w-100" style="height: 34px;"
                                data-eng="✓ Save"
                                data-spa="✓ Guardar"
                                data-fre="✓ Sauvegarder"
                                data-ger="✓ Speichern">✓ Save</button>
                            <button id="btn-cancel-entry" class="btn secondary-btn w-100" style="height: 34px;"
                                data-eng="✖ Cancel"
                                data-spa="✖ Cancelar"
                                data-fre="✖ Annuler"
                                data-ger="✖ Abbrechen">✖ Cancel</button>
                        </div>
                    </div>
                </div>

                <!-- Weight History Table -->
                <div class="table-responsive weight-history-container">
                    <table class="table glass-table mb-0">
                        <thead>
                            <tr>
                                <th data-eng="Date"
                                    data-spa="Fecha"
                                    data-fre="Date"
                                    data-ger="Datum">Date</th>
                                <th id="weight-column-header"
                                    data-eng="Weight"
                                    data-spa="Peso"
                                    data-fre="Poids"
                                    data-ger="Gewicht">Weight</th>
                                <th data-eng="Change"
                                    data-spa="Cambio"
                                    data-fre="Changement"
                                    data-ger="Änderung">Change</th>
                                <th data-eng="Actions"
                                    data-spa="Acciones"
                                    data-fre="Actions"
                                    data-ger="Aktionen">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="weight-history-body">
                            <tr>
                                <td colspan="4" class="no-data"
                                    data-eng="Loading weight history..."
                                    data-spa="Cargando historial de peso..."
                                    data-fre="Chargement de l'historique du poids..."
                                    data-ger="Gewichtsverlauf wird geladen...">Loading weight history...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Profile Card -->
            <div id="profile-card" class="glass-card">
                <h5 class="card-title"
                    data-eng="🔧 Profile Settings"
                    data-spa="🔧 Configuración de Perfil"
                    data-fre="🔧 Paramètres de Profil"
                    data-ger="🔧 Profil-Einstellungen">🔧 Profile Settings</h5>
                <div class="row">
                    <div class="form-group col-md-3">
                        <label for="heightCm" class="form-label" id="height-label"
                            data-eng="Height"
                            data-spa="Altura"
                            data-fre="Taille"
                            data-ger="Größe">Height</label>
                        <input type="number" min="50" max="300" id="heightCm" class="form-control glass-input"
                            placeholder="e.g. 175"
                            data-eng="e.g. 175"
                            data-spa="ej. 175"
                            data-fre="ex. 175"
                            data-ger="z.B. 175">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="bodyFrame" class="form-label"
                            data-eng="Body Frame"
                            data-spa="Constitución Corporal"
                            data-fre="Corpulence"
                            data-ger="Körpertyp">Body Frame</label>
                        <select id="bodyFrame" class="form-control glass-input">
                            <option value=""
                                data-eng="Select"
                                data-spa="Seleccionar"
                                data-fre="Sélectionner"
                                data-ger="Auswählen">Select</option>
                            <option value="small"
                                data-eng="Small"
                                data-spa="Pequeña"
                                data-fre="Petite"
                                data-ger="Klein">Small</option>
                            <option value="medium"
                                data-eng="Medium"
                                data-spa="Mediana"
                                data-fre="Moyenne"
                                data-ger="Mittel">Medium</option>
                            <option value="large"
                                data-eng="Large"
                                data-spa="Grande"
                                data-fre="Grande"
                                data-ger="Groß">Large</option>
                        </select>
                    </div>
                    <div class="form-group col-md-3">
                        <label for="age" class="form-label"
                            data-eng="Age"
                            data-spa="Edad"
                            data-fre="Âge"
                            data-ger="Alter">Age</label>
                        <input type="number" min="5" max="120" id="age" class="form-control glass-input"
                            placeholder="e.g. 35"
                            data-eng="e.g. 35"
                            data-spa="ej. 35"
                            data-fre="ex. 35"
                            data-ger="z.B. 35">
                    </div>
                    <div class="form-group col-md-3">
                        <label for="activityLevel" class="form-label"
                            data-eng="Activity Level"
                            data-spa="Nivel de Actividad"
                            data-fre="Niveau d'Activité"
                            data-ger="Aktivitätslevel">Activity Level</label>
                        <select id="activityLevel" class="form-control glass-input">
                            <option value=""
                                data-eng="Select"
                                data-spa="Seleccionar"
                                data-fre="Sélectionner"
                                data-ger="Auswählen">Select</option>
                            <option value="sedentary"
                                data-eng="Sedentary"
                                data-spa="Sedentario"
                                data-fre="Sédentaire"
                                data-ger="Sitzend">Sedentary</option>
                            <option value="light"
                                data-eng="Light"
                                data-spa="Ligero"
                                data-fre="Léger"
                                data-ger="Leicht">Light</option>
                            <option value="moderate"
                                data-eng="Moderate"
                                data-spa="Moderado"
                                data-fre="Modéré"
                                data-ger="Mäßig">Moderate</option>
                            <option value="very"
                                data-eng="Very Active"
                                data-spa="Muy Activo"
                                data-fre="Très Actif"
                                data-ger="Sehr Aktiv">Very Active</option>
                            <option value="athlete"
                                data-eng="Athlete"
                                data-spa="Atleta"
                                data-fre="Athlète"
                                data-ger="Sportler">Athlete</option>
                        </select>
                    </div>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <span id="profile-status" class="text-muted"></span>
                    <button id="btn-save-profile" class="btn primary-btn" style="height: 34px;"
                        data-eng="✓ Save Profile"
                        data-spa="✓ Guardar Perfil"
                        data-fre="✓ Enreg. profil"
                        data-ger="✓ Profil speichern">✓ Save Profile</button>
                </div>
            </div>
                    </div>
                    
                    <!-- Health Insights Tab -->
                    <div class="tab-pane fade" id="health" role="tabpanel">
                        <!-- Personal Benefits Info -->
                        <div class="row">
                            <div class="col-md-12">
                                <div class="glass-card-small">
                                    <div id="personal-benefits-calculator" class="text-muted">
                                        Complete your profile and set a weight goal to see personalized health benefit projections.
                                        <div id="personal-benefits-display" class="personal-benefits-display">
                                            <!-- Calculated benefits will appear here -->
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Health Stats Cards -->
                        <div class="row">
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title" data-eng="📏 BMI Analysis" data-spa="📏 Análisis de IMC" data-fre="📏 Analyse de l'IMC" data-ger="📏 BMI-Analyse">📏 BMI Analysis</h5>
                                    <div id="bmi-block" class="text-muted" data-eng="Enter your height and log a recent weight to see your BMI." data-spa="Ingresa tu altura y registra un peso reciente para ver tu IMC." data-fre="Entrez votre taille et enregistrez un poids récent pour voir votre IMC." data-ger="Geben Sie Ihre Größe ein und erfassen Sie ein aktuelles Gewicht, um Ihren BMI zu sehen.">Enter your height and log a recent weight to see your BMI.</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title" data-eng="💪 Body Fat Estimate" data-spa="💪 Estimación de Grasa Corporal" data-fre="💪 Estimation de la Graisse Corporelle" data-ger="💪 Körperfett-Schätzung">💪 Body Fat Estimate</h5>
                                    <div id="body-fat-block" class="text-muted" data-eng="Provide age and complete profile for body fat estimation." data-spa="Proporciona tu edad y completa el perfil para estimar la grasa corporal." data-fre="Fournissez votre âge et complétez le profil pour l'estimation de la graisse corporelle." data-ger="Geben Sie Ihr Alter an und vervollständigen Sie das Profil für die Körperfett-Schätzung.">Provide age and complete profile for body fat estimation.</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title" data-eng="❤️ Cardiovascular Risk" data-spa="❤️ Riesgo Cardiovascular" data-fre="❤️ Risque Cardiovasculaire" data-ger="❤️ Kardiovaskuläres Risiko">❤️ Cardiovascular Risk</h5>
                                    <div id="cardio-risk-block" class="text-muted" data-eng="Complete profile for cardiovascular risk assessment." data-spa="Completa el perfil para evaluación de riesgo cardiovascular." data-fre="Complétez le profil pour l'évaluation du risque cardiovasculaire." data-ger="Vervollständigen Sie das Profil für die kardiovaskuläre Risikobewertung.">Complete profile for cardiovascular risk assessment.</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title" data-eng="🎯 Ideal Weight Range" data-spa="🎯 Rango de Peso Ideal" data-fre="🎯 Plage de Poids Idéale" data-ger="🎯 Idealer Gewichtsbereich">🎯 Ideal Weight Range</h5>
                                    <div id="ideal-weight-block" class="text-muted" data-eng="Set your height to calculate your ideal weight range." data-spa="Establece tu altura para calcular tu rango de peso ideal." data-fre="Définissez votre taille pour calculer votre plage de poids idéale." data-ger="Legen Sie Ihre Größe fest, um Ihren idealen Gewichtsbereich zu berechnen.">Set your height to calculate your ideal weight range.</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="row">
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title" data-eng="📈 Weight Progress" data-spa="📈 Progreso de Peso" data-fre="📈 Progrès de Poids" data-ger="📈 Gewichtsfortschritt">📈 Weight Progress</h5>
                                    <div id="progress-block" class="text-muted" data-eng="Log multiple weights to see your progress trends." data-spa="Registra múltiples pesos para ver tus tendencias de progreso." data-fre="Enregistrez plusieurs poids pour voir vos tendances de progrès." data-ger="Erfassen Sie mehrere Gewichte, um Ihre Fortschrittstrends zu sehen.">Log multiple weights to see your progress trends.</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title" data-eng="🫀 Gallbladder Health" data-spa="🫀 Salud de la Vesícula Biliar" data-fre="🫀 Santé de la Vésicule Biliaire" data-ger="🫀 Gallenblase Gesundheit">🫀 Gallbladder Health</h5>
                                    <div id="gallbladder-block" class="text-muted" data-eng="Weight loss data needed to assess gallbladder health benefits." data-spa="Se necesitan datos de pérdida de peso para evaluar beneficios para la vesícula biliar." data-fre="Données de perte de poids nécessaires pour évaluer les bienfaits pour la vésicule biliaire." data-ger="Gewichtsverlustdaten erforderlich, um Vorteile für die Gallenblase zu bewerten.">Weight loss data needed to assess gallbladder health benefits.</div>
                                </div>
                            </div>
                        </div>

                        <!-- Health Benefits Row -->
                        <div class="row">
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title" data-eng="🩺 Type 2 Diabetes Risk" data-spa="🩺 Riesgo de Diabetes Tipo 2" data-fre="🩺 Risque de Diabète de Type 2" data-ger="🩺 Typ-2-Diabetes-Risiko">🩺 Type 2 Diabetes Risk</h5>
                                    <div id="diabetes-block" class="text-muted" data-eng="Log weights to see your current risk % vs starting risk %. Risk based on BMI level." data-spa="Registra pesos para ver tu riesgo actual % vs riesgo inicial %. Riesgo basado en nivel de IMC." data-fre="Enregistrez des poids pour voir votre risque actuel % vs risque initial %. Risque basé sur le niveau d'IMC." data-ger="Erfassen Sie Gewichte, um Ihr aktuelles Risiko % vs. Anfangsrisiko % zu sehen. Risiko basiert auf BMI-Niveau.">Log weights to see your current risk % vs starting risk %. Risk based on BMI level.</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title" data-eng="😴 Sleep Apnea Improvement" data-spa="😴 Mejora de Apnea del Sueño" data-fre="😴 Amélioration de l'Apnée du Sommeil" data-ger="😴 Schlafapnoe-Verbesserung">😴 Sleep Apnea Improvement</h5>
                                    <div id="sleep-apnea-block" class="text-muted" data-eng="Log weights to see your current risk % vs starting risk %. Risk based on BMI level." data-spa="Registra pesos para ver tu riesgo actual % vs riesgo inicial %. Riesgo basado en nivel de IMC." data-fre="Enregistrez des poids pour voir votre risque actuel % vs risque initial %. Risque basé sur le niveau d'IMC." data-ger="Erfassen Sie Gewichte, um Ihr aktuelles Risiko % vs. Anfangsrisiko % zu sehen. Risiko basiert auf BMI-Niveau.">Log weights to see your current risk % vs starting risk %. Risk based on BMI level.</div>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title" data-eng="❤️ Hypertension Risk" data-spa="❤️ Riesgo de Hipertensión" data-fre="❤️ Risque d'Hypertension" data-ger="❤️ Bluthochdruck-Risiko">❤️ Hypertension Risk</h5>
                                    <div id="hypertension-block" class="text-muted" data-eng="Log weights to see your current risk % vs starting risk %. Risk based on BMI level." data-spa="Registra pesos para ver tu riesgo actual % vs riesgo inicial %. Riesgo basado en nivel de IMC." data-fre="Enregistrez des poids pour voir votre risque actuel % vs risque initial %. Risque basé sur le niveau d'IMC." data-ger="Erfassen Sie Gewichte, um Ihr aktuelles Risiko % vs. Anfangsrisiko % zu sehen. Risiko basiert auf BMI-Niveau.">Log weights to see your current risk % vs starting risk %. Risk based on BMI level.</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title" data-eng="🫀 Fatty Liver Disease" data-spa="🫀 Enfermedad de Hígado Graso" data-fre="🫀 Maladie du Foie Gras" data-ger="🫀 Fettlebererkrankung">🫀 Fatty Liver Disease</h5>
                                    <div id="fatty-liver-block" class="text-muted" data-eng="Log weights to see your current risk % vs starting risk %. Risk based on BMI level." data-spa="Registra pesos para ver tu riesgo actual % vs riesgo inicial %. Riesgo basado en nivel de IMC." data-fre="Enregistrez des poids pour voir votre risque actuel % vs risque initial %. Risque basé sur le niveau d'IMC." data-ger="Erfassen Sie Gewichte, um Ihr aktuelles Risiko % vs. Anfangsrisiko % zu sehen. Risiko basiert auf BMI-Niveau.">Log weights to see your current risk % vs starting risk %. Risk based on BMI level.</div>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title" data-eng="💓 Heart Disease Risk" data-spa="💓 Riesgo de Enfermedad Cardíaca" data-fre="💓 Risque de Maladie Cardiaque" data-ger="💓 Herzkrankheits-Risiko">💓 Heart Disease Risk</h5>
                                    <div id="heart-disease-block" class="text-muted" data-eng="Log weights to see your current risk % vs starting risk %. Risk based on BMI level." data-spa="Registra pesos para ver tu riesgo actual % vs riesgo inicial %. Riesgo basado en nivel de IMC." data-fre="Enregistrez des poids pour voir votre risque actuel % vs risque initial %. Risque basé sur le niveau d'IMC." data-ger="Erfassen Sie Gewichte, um Ihr aktuelles Risiko % vs. Anfangsrisiko % zu sehen. Risiko basiert auf BMI-Niveau.">Log weights to see your current risk % vs starting risk %. Risk based on BMI level.</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title" data-eng="🧠 Mental Health Benefits" data-spa="🧠 Beneficios de Salud Mental" data-fre="🧠 Bienfaits pour la Santé Mentale" data-ger="🧠 Vorteile für die Psychische Gesundheit">🧠 Mental Health Benefits</h5>
                                    <div id="mental-health-block" class="text-muted" data-eng="5-15% improvement in mood and self-esteem. Reduced inflammation and better metabolic function." data-spa="5-15% de mejora en el estado de ánimo y autoestima. Reducción de la inflamación y mejor función metabólica." data-fre="5-15% d'amélioration de l'humeur et de l'estime de soi. Inflammation réduite et meilleure fonction métabolique." data-ger="5-15% Verbesserung der Stimmung und des Selbstwertgefühls. Reduzierte Entzündungen und bessere Stoffwechselfunktion.">5-15% improvement in mood and self-esteem. Reduced inflammation and better metabolic function.</div>
                                </div>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title" data-eng="🦴 Joint Health (Arthritis)" data-spa="🦴 Salud Articular (Artritis)" data-fre="🦴 Santé des Articulations (Arthrite)" data-ger="🦴 Gelenkgesundheit (Arthritis)">🦴 Joint Health (Arthritis)</h5>
                                    <div id="joint-health-block" class="text-muted" data-eng="20-30% less joint stress with weight loss. Slower progression of knee and hip osteoarthritis." data-spa="20-30% menos estrés articular con pérdida de peso. Progresión más lenta de osteoartritis de rodilla y cadera." data-fre="20-30% moins de stress articulaire avec la perte de poids. Progression plus lente de l'arthrose du genou et de la hanche." data-ger="20-30% weniger Gelenkbelastung durch Gewichtsverlust. Langsameres Fortschreiten von Knie- und Hüftarthrose.">20-30% less joint stress with weight loss. Slower progression of knee and hip osteoarthritis.</div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title" data-eng="🌟 Life Expectancy" data-spa="🌟 Esperanza de Vida" data-fre="🌟 Espérance de Vie" data-ger="🌟 Lebenserwartung">🌟 Life Expectancy</h5>
                                    <div id="life-expectancy-block" class="text-muted" data-eng="2-5 years increase in life expectancy. Stronger benefits if weight loss occurs earlier in life." data-spa="2-5 años de aumento en la esperanza de vida. Beneficios más fuertes si la pérdida de peso ocurre temprano en la vida." data-fre="2-5 ans d'augmentation de l'espérance de vie. Bénéfices plus forts si la perte de poids survient tôt dans la vie." data-ger="2-5 Jahre Zunahme der Lebenserwartung. Stärkere Vorteile, wenn der Gewichtsverlust früher im Leben erfolgt.">2-5 years increase in life expectancy. Stronger benefits if weight loss occurs earlier in life.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Body Tab -->
                    <div class="tab-pane fade" id="body" role="tabpanel">
                        <!-- Smart Data Section -->
                        <div class="row mb-3">
                            <div class="col-12">
                                <h5 class="section-title" data-eng="📊 Smart Data" data-spa="📊 Datos Inteligentes" data-fre="📊 Données Intelligentes" data-ger="📊 Intelligente Daten">📊 Smart Data</h5>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <!-- Muscle Mass Card -->
                            <div class="col-md-3 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Muscle Mass" data-spa="Masa Muscular" data-fre="Masse Musculaire" data-ger="Muskelmasse">Muscle Mass</h6>
                                    <small class="text-muted d-block mb-2" data-eng="From your smart scales" data-spa="De tu báscula inteligente" data-fre="De votre balance connectée" data-ger="Von Ihrer intelligenten Waage">From your smart scales</small>
                                    <input type="number" step="0.1" min="0" max="100" class="form-control glass-input mb-2" placeholder="%" id="muscle-mass-input">
                                    <small class="text-muted d-block mb-2 input-date-text" id="muscle-mass-date"></small>
                                    <button class="btn primary-btn btn-sm w-100" id="btn-save-muscle-mass" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                </div>
                            </div>
                            <!-- Fat Percent Card -->
                            <div class="col-md-3 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Fat Percent" data-spa="Porcentaje de Grasa" data-fre="Pourcentage de Graisse" data-ger="Fettprozentsatz">Fat Percent</h6>
                                    
                                    <small class="text-muted d-block mb-2" data-eng="From your smart scales" data-spa="De tu báscula inteligente" data-fre="De votre balance connectée" data-ger="Von Ihrer intelligenten Waage">From your smart scales</small>
                                    <input type="number" step="0.1" min="0" max="100" class="form-control glass-input mb-2" placeholder="%" id="fat-percent-input">
                                    <small class="text-muted d-block mb-2 input-date-text" id="fat-percent-date"></small>
                                    <button class="btn primary-btn btn-sm w-100" id="btn-save-fat-percent" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                </div>
                            </div>
                            <!-- Water Percent Card -->
                            <div class="col-md-3 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Water Percent" data-spa="Porcentaje de Agua" data-fre="Pourcentage d'Eau" data-ger="Wasserprozentsatz">Water Percent</h6>
                                    
                                    <small class="text-muted d-block mb-2" data-eng="From your smart scales" data-spa="De tu báscula inteligente" data-fre="De votre balance connectée" data-ger="Von Ihrer intelligenten Waage">From your smart scales</small>
                                    <input type="number" step="0.1" min="0" max="100" class="form-control glass-input mb-2" placeholder="%" id="water-percent-input">
                                    <small class="text-muted d-block mb-2 input-date-text" id="water-percent-date"></small>
                                    <button class="btn primary-btn btn-sm w-100" id="btn-save-water-percent" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                </div>
                            </div>
                            <!-- Bone Mass Card -->
                            <div class="col-md-3 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Bone Mass" data-spa="Masa Ósea" data-fre="Masse Osseuse" data-ger="Knochenmasse">Bone Mass</h6>
                                    
                                    <small class="text-muted d-block mb-2" data-eng="From your smart scales" data-spa="De tu báscula inteligente" data-fre="De votre balance connectée" data-ger="Von Ihrer intelligenten Waage">From your smart scales</small>
                                    <input type="number" step="0.1" min="0" max="100" class="form-control glass-input mb-2" placeholder="%" id="bone-mass-input">
                                    <small class="text-muted d-block mb-2 input-date-text" id="bone-mass-date"></small>
                                    <button class="btn primary-btn btn-sm w-100" id="btn-save-bone-mass" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                </div>
                            </div>
                        </div>

                        <!-- Smart Data History -->
                        <div class="row mb-3">
                            <div class="col-12">
                                <div class="glass-card">
                                    <h5 class="card-title mb-3" data-eng="📊 Smart Data History" data-spa="📊 Historial de Datos Inteligentes" data-fre="📊 Historique des Données Intelligentes" data-ger="📊 Intelligente Daten Verlauf">📊 Smart Data History</h5>

                                    <!-- Tabs for each metric -->
                                    <ul class="nav nav-tabs mb-3" id="smartDataTabs" role="tablist">
                                        <li class="nav-item" role="presentation">
                                            <a class="nav-link active" id="muscle-history-tab" data-toggle="tab" href="#muscle-history" role="tab" data-eng="Muscle Mass" data-spa="Masa Muscular" data-fre="Masse Musculaire" data-ger="Muskelmasse">Muscle Mass</a>
                                        </li>
                                        <li class="nav-item" role="presentation">
                                            <a class="nav-link" id="fat-history-tab" data-toggle="tab" href="#fat-history" role="tab" data-eng="Fat Percent" data-spa="Porcentaje de Grasa" data-fre="Pourcentage de Graisse" data-ger="Fettprozentsatz">Fat Percent</a>
                                        </li>
                                        <li class="nav-item" role="presentation">
                                            <a class="nav-link" id="water-history-tab" data-toggle="tab" href="#water-history" role="tab" data-eng="Water Percent" data-spa="Porcentaje de Agua" data-fre="Pourcentage d'Eau" data-ger="Wasserprozentsatz">Water Percent</a>
                                        </li>
                                        <li class="nav-item" role="presentation">
                                            <a class="nav-link" id="bone-history-tab" data-toggle="tab" href="#bone-history" role="tab" data-eng="Bone Mass" data-spa="Masa Ósea" data-fre="Masse Osseuse" data-ger="Knochenmasse">Bone Mass</a>
                                        </li>
                                    </ul>

                                    <!-- Tab content -->
                                    <div class="tab-content" id="smartDataTabsContent">
                                        <!-- Muscle Mass History -->
                                        <div class="tab-pane fade show active" id="muscle-history" role="tabpanel">
                                            <div class="table-responsive">
                                                <table class="table glass-table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th data-eng="Date" data-spa="Fecha" data-fre="Date" data-ger="Datum">Date</th>
                                                            <th data-eng="Muscle Mass %" data-spa="Masa Muscular %" data-fre="Masse Musculaire %" data-ger="Muskelmasse %">Muscle Mass %</th>
                                                            <th data-eng="Change" data-spa="Cambio" data-fre="Changement" data-ger="Änderung">Change</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="muscle-history-body">
                                                        <tr>
                                                            <td colspan="3" class="text-muted text-center" data-eng="No muscle mass data recorded yet" data-spa="No hay datos de masa muscular registrados" data-fre="Aucune donnée de masse musculaire enregistrée" data-ger="Noch keine Muskelmassendaten erfasst">No muscle mass data recorded yet</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <!-- Fat Percent History -->
                                        <div class="tab-pane fade" id="fat-history" role="tabpanel">
                                            <div class="table-responsive">
                                                <table class="table glass-table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th data-eng="Date" data-spa="Fecha" data-fre="Date" data-ger="Datum">Date</th>
                                                            <th data-eng="Fat %" data-spa="Grasa %" data-fre="Graisse %" data-ger="Fett %">Fat %</th>
                                                            <th data-eng="Change" data-spa="Cambio" data-fre="Changement" data-ger="Änderung">Change</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="fat-history-body">
                                                        <tr>
                                                            <td colspan="3" class="text-muted text-center" data-eng="No fat percentage data recorded yet" data-spa="No hay datos de porcentaje de grasa registrados" data-fre="Aucune donnée de pourcentage de graisse enregistrée" data-ger="Noch keine Fettprozentsatzdaten erfasst">No fat percentage data recorded yet</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <!-- Water Percent History -->
                                        <div class="tab-pane fade" id="water-history" role="tabpanel">
                                            <div class="table-responsive">
                                                <table class="table glass-table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th data-eng="Date" data-spa="Fecha" data-fre="Date" data-ger="Datum">Date</th>
                                                            <th data-eng="Water %" data-spa="Agua %" data-fre="Eau %" data-ger="Wasser %">Water %</th>
                                                            <th data-eng="Change" data-spa="Cambio" data-fre="Changement" data-ger="Änderung">Change</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="water-history-body">
                                                        <tr>
                                                            <td colspan="3" class="text-muted text-center" data-eng="No water percentage data recorded yet" data-spa="No hay datos de porcentaje de agua registrados" data-fre="Aucune donnée de pourcentage d'eau enregistrée" data-ger="Noch keine Wasserprozentsatzdaten erfasst">No water percentage data recorded yet</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <!-- Bone Mass History -->
                                        <div class="tab-pane fade" id="bone-history" role="tabpanel">
                                            <div class="table-responsive">
                                                <table class="table glass-table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th data-eng="Date" data-spa="Fecha" data-fre="Date" data-ger="Datum">Date</th>
                                                            <th data-eng="Bone Mass %" data-spa="Masa Ósea %" data-fre="Masse Osseuse %" data-ger="Knochenmasse %">Bone Mass %</th>
                                                            <th data-eng="Change" data-spa="Cambio" data-fre="Changement" data-ger="Änderung">Change</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="bone-history-body">
                                                        <tr>
                                                            <td colspan="3" class="text-muted text-center" data-eng="No bone mass data recorded yet" data-spa="No hay datos de masa ósea registrados" data-fre="Aucune donnée de masse osseuse enregistrée" data-ger="Noch keine Knochenmassendaten erfasst">No bone mass data recorded yet</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Measurements Section -->
                        <div class="row mb-3">
                            <div class="col-12">
                                <h5 class="section-title" data-eng="📏 Measurements" data-spa="📏 Mediciones" data-fre="📏 Mesures" data-ger="📏 Messungen">📏 Measurements</h5>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <!-- Neck Card -->
                            <div class="col-md-3 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Neck" data-spa="Cuello" data-fre="Cou" data-ger="Hals">Neck</h6>
                                    
                                    <small class="text-muted d-block mb-2" data-eng="Below Adam's apple" data-spa="Debajo de la manzana de Adán" data-fre="Sous la pomme d'Adam" data-ger="Unter dem Adamsapfel">Below Adam's apple</small>
                                    <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="cm" id="neck-measurement">
                                    <small class="text-muted d-block mb-2 input-date-text" id="neck-date"></small>
                                    <button class="btn primary-btn btn-sm w-100" id="btn-save-neck" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                </div>
                            </div>
                            <!-- Breast Card -->
                            <div class="col-md-3 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Breast" data-spa="Busto" data-fre="Poitrine" data-ger="Brust">Breast</h6>
                                    
                                    <small class="text-muted d-block mb-2" data-eng="At nipple line" data-spa="A la altura del pezón" data-fre="Au niveau du mamelon" data-ger="Auf Brustwarzenhöhe">At nipple line</small>
                                    <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="cm" id="breast-measurement">
                                    <small class="text-muted d-block mb-2 input-date-text" id="breast-date"></small>
                                    <button class="btn primary-btn btn-sm w-100" id="btn-save-breast" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                </div>
                            </div>
                            <!-- Waist Card -->
                            <div class="col-md-3 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Waist" data-spa="Cintura" data-fre="Taille" data-ger="Taille">Waist</h6>
                                    
                                    <small class="text-muted d-block mb-2" data-eng="Narrowest point" data-spa="Punto más estrecho" data-fre="Point le plus étroit" data-ger="Schmalste Stelle">Narrowest point</small>
                                    <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="cm" id="waist-measurement">
                                    <small class="text-muted d-block mb-2 input-date-text" id="waist-date"></small>
                                    <button class="btn primary-btn btn-sm w-100" id="btn-save-waist" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                </div>
                            </div>
                            <!-- Hips Card -->
                            <div class="col-md-3 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Hips" data-spa="Caderas" data-fre="Hanches" data-ger="Hüften">Hips</h6>
                                    
                                    <small class="text-muted d-block mb-2" data-eng="Widest part" data-spa="Parte más ancha" data-fre="Partie la plus large" data-ger="Breiteste Stelle">Widest part</small>
                                    <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="cm" id="hips-measurement">
                                    <small class="text-muted d-block mb-2 input-date-text" id="hips-date"></small>
                                    <button class="btn primary-btn btn-sm w-100" id="btn-save-hips" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <!-- Thighs Card -->
                            <div class="col-md-4 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Thighs" data-spa="Muslos" data-fre="Cuisses" data-ger="Oberschenkel">Thighs</h6>
                                    
                                    <small class="text-muted d-block mb-2" data-eng="Midway hip to knee" data-spa="Entre cadera y rodilla" data-fre="Entre hanche et genou" data-ger="Zwischen Hüfte und Knie">Midway hip to knee</small>
                                    <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="cm" id="thighs-measurement">
                                    <small class="text-muted d-block mb-2 input-date-text" id="thighs-date"></small>
                                    <button class="btn primary-btn btn-sm w-100" id="btn-save-thighs" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                </div>
                            </div>
                            <!-- Calves Card -->
                            <div class="col-md-4 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Calves" data-spa="Pantorrillas" data-fre="Mollets" data-ger="Waden">Calves</h6>
                                    
                                    <small class="text-muted d-block mb-2" data-eng="Thickest part" data-spa="Parte más gruesa" data-fre="Partie la plus épaisse" data-ger="Dickste Stelle">Thickest part</small>
                                    <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="cm" id="calves-measurement">
                                    <small class="text-muted d-block mb-2 input-date-text" id="calves-date"></small>
                                    <button class="btn primary-btn btn-sm w-100" id="btn-save-calves" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                </div>
                            </div>
                            <!-- Arms Card -->
                            <div class="col-md-4 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Arms" data-spa="Brazos" data-fre="Bras" data-ger="Arme">Arms</h6>
                                    
                                    <small class="text-muted d-block mb-2" data-eng="Unflexed midpoint" data-spa="Punto medio relajado" data-fre="Point médian non fléchi" data-ger="Entspannter Mittelpunkt">Unflexed midpoint</small>
                                    <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="cm" id="arms-measurement">
                                    <small class="text-muted d-block mb-2 input-date-text" id="arms-date"></small>
                                    <button class="btn primary-btn btn-sm w-100" id="btn-save-arms" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                </div>
                            </div>
                        </div>

                        <!-- Measurements History -->
                        <div class="row mb-3">
                            <div class="col-12">
                                <div class="glass-card">
                                    <h5 class="card-title mb-3" data-eng="📏 Measurements History" data-spa="📏 Historial de Mediciones" data-fre="📏 Historique des Mesures" data-ger="📏 Messungen Verlauf">📏 Measurements History</h5>

                                    <!-- Tabs for each measurement -->
                                    <ul class="nav nav-tabs mb-3" id="measurementsTabs" role="tablist">
                                        <li class="nav-item" role="presentation">
                                            <a class="nav-link active" id="neck-history-tab" data-toggle="tab" href="#neck-history" role="tab" style="padding: 0.5rem 0.75rem;" data-eng="Neck" data-spa="Cuello" data-fre="Cou" data-ger="Hals">Neck</a>
                                        </li>
                                        <li class="nav-item" role="presentation">
                                            <a class="nav-link" id="breast-history-tab" data-toggle="tab" href="#breast-history" role="tab" style="padding: 0.5rem 0.75rem;" data-eng="Breast" data-spa="Busto" data-fre="Poitrine" data-ger="Brust">Breast</a>
                                        </li>
                                        <li class="nav-item" role="presentation">
                                            <a class="nav-link" id="waist-history-tab" data-toggle="tab" href="#waist-history" role="tab" style="padding: 0.5rem 0.75rem;" data-eng="Waist" data-spa="Cintura" data-fre="Taille" data-ger="Taille">Waist</a>
                                        </li>
                                        <li class="nav-item" role="presentation">
                                            <a class="nav-link" id="hips-history-tab" data-toggle="tab" href="#hips-history" role="tab" style="padding: 0.5rem 0.75rem;" data-eng="Hips" data-spa="Caderas" data-fre="Hanches" data-ger="Hüften">Hips</a>
                                        </li>
                                        <li class="nav-item" role="presentation">
                                            <a class="nav-link" id="thighs-history-tab" data-toggle="tab" href="#thighs-history" role="tab" style="padding: 0.5rem 0.75rem;" data-eng="Thighs" data-spa="Muslos" data-fre="Cuisses" data-ger="Oberschenkel">Thighs</a>
                                        </li>
                                        <li class="nav-item" role="presentation">
                                            <a class="nav-link" id="calves-history-tab" data-toggle="tab" href="#calves-history" role="tab" style="padding: 0.5rem 0.75rem;" data-eng="Calves" data-spa="Pantorrillas" data-fre="Mollets" data-ger="Waden">Calves</a>
                                        </li>
                                        <li class="nav-item" role="presentation">
                                            <a class="nav-link" id="arms-history-tab" data-toggle="tab" href="#arms-history" role="tab" style="padding: 0.5rem 0.75rem;" data-eng="Arms" data-spa="Brazos" data-fre="Bras" data-ger="Arme">Arms</a>
                                        </li>
                                    </ul>

                                    <!-- Tab content -->
                                    <div class="tab-content" id="measurementsTabsContent">
                                        <!-- Neck History -->
                                        <div class="tab-pane fade show active" id="neck-history" role="tabpanel">
                                            <div class="table-responsive">
                                                <table class="table glass-table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th data-eng="Date" data-spa="Fecha" data-fre="Date" data-ger="Datum">Date</th>
                                                            <th data-eng="Neck (cm)" data-spa="Cuello (cm)" data-fre="Cou (cm)" data-ger="Hals (cm)">Neck (cm)</th>
                                                            <th data-eng="Change" data-spa="Cambio" data-fre="Changement" data-ger="Änderung">Change</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="neck-history-body">
                                                        <tr>
                                                            <td colspan="3" class="text-muted text-center" data-eng="No neck measurements recorded yet" data-spa="No hay mediciones de cuello registradas" data-fre="Aucune mesure du cou enregistrée" data-ger="Noch keine Halsmessungen erfasst">No neck measurements recorded yet</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <!-- Breast History -->
                                        <div class="tab-pane fade" id="breast-history" role="tabpanel">
                                            <div class="table-responsive">
                                                <table class="table glass-table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th data-eng="Date" data-spa="Fecha" data-fre="Date" data-ger="Datum">Date</th>
                                                            <th data-eng="Breast (cm)" data-spa="Busto (cm)" data-fre="Poitrine (cm)" data-ger="Brust (cm)">Breast (cm)</th>
                                                            <th data-eng="Change" data-spa="Cambio" data-fre="Changement" data-ger="Änderung">Change</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="breast-history-body">
                                                        <tr>
                                                            <td colspan="3" class="text-muted text-center" data-eng="No breast measurements recorded yet" data-spa="No hay mediciones de busto registradas" data-fre="Aucune mesure de poitrine enregistrée" data-ger="Noch keine Brustmessungen erfasst">No breast measurements recorded yet</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <!-- Waist History -->
                                        <div class="tab-pane fade" id="waist-history" role="tabpanel">
                                            <div class="table-responsive">
                                                <table class="table glass-table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th data-eng="Date" data-spa="Fecha" data-fre="Date" data-ger="Datum">Date</th>
                                                            <th data-eng="Waist (cm)" data-spa="Cintura (cm)" data-fre="Taille (cm)" data-ger="Taille (cm)">Waist (cm)</th>
                                                            <th data-eng="Change" data-spa="Cambio" data-fre="Changement" data-ger="Änderung">Change</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="waist-history-body">
                                                        <tr>
                                                            <td colspan="3" class="text-muted text-center" data-eng="No waist measurements recorded yet" data-spa="No hay mediciones de cintura registradas" data-fre="Aucune mesure de taille enregistrée" data-ger="Noch keine Tailenmessungen erfasst">No waist measurements recorded yet</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <!-- Hips History -->
                                        <div class="tab-pane fade" id="hips-history" role="tabpanel">
                                            <div class="table-responsive">
                                                <table class="table glass-table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th data-eng="Date" data-spa="Fecha" data-fre="Date" data-ger="Datum">Date</th>
                                                            <th data-eng="Hips (cm)" data-spa="Caderas (cm)" data-fre="Hanches (cm)" data-ger="Hüften (cm)">Hips (cm)</th>
                                                            <th data-eng="Change" data-spa="Cambio" data-fre="Changement" data-ger="Änderung">Change</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="hips-history-body">
                                                        <tr>
                                                            <td colspan="3" class="text-muted text-center" data-eng="No hips measurements recorded yet" data-spa="No hay mediciones de caderas registradas" data-fre="Aucune mesure de hanches enregistrée" data-ger="Noch keine Hüftmessungen erfasst">No hips measurements recorded yet</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <!-- Thighs History -->
                                        <div class="tab-pane fade" id="thighs-history" role="tabpanel">
                                            <div class="table-responsive">
                                                <table class="table glass-table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th data-eng="Date" data-spa="Fecha" data-fre="Date" data-ger="Datum">Date</th>
                                                            <th data-eng="Thighs (cm)" data-spa="Muslos (cm)" data-fre="Cuisses (cm)" data-ger="Oberschenkel (cm)">Thighs (cm)</th>
                                                            <th data-eng="Change" data-spa="Cambio" data-fre="Changement" data-ger="Änderung">Change</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="thighs-history-body">
                                                        <tr>
                                                            <td colspan="3" class="text-muted text-center" data-eng="No thighs measurements recorded yet" data-spa="No hay mediciones de muslos registradas" data-fre="Aucune mesure de cuisses enregistrée" data-ger="Noch keine Oberschenkelmessungen erfasst">No thighs measurements recorded yet</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <!-- Calves History -->
                                        <div class="tab-pane fade" id="calves-history" role="tabpanel">
                                            <div class="table-responsive">
                                                <table class="table glass-table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th data-eng="Date" data-spa="Fecha" data-fre="Date" data-ger="Datum">Date</th>
                                                            <th data-eng="Calves (cm)" data-spa="Pantorrillas (cm)" data-fre="Mollets (cm)" data-ger="Waden (cm)">Calves (cm)</th>
                                                            <th data-eng="Change" data-spa="Cambio" data-fre="Changement" data-ger="Änderung">Change</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="calves-history-body">
                                                        <tr>
                                                            <td colspan="3" class="text-muted text-center" data-eng="No calves measurements recorded yet" data-spa="No hay mediciones de pantorrillas registradas" data-fre="Aucune mesure de mollets enregistrée" data-ger="Noch keine Wadenmessungen erfasst">No calves measurements recorded yet</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <!-- Arms History -->
                                        <div class="tab-pane fade" id="arms-history" role="tabpanel">
                                            <div class="table-responsive">
                                                <table class="table glass-table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th data-eng="Date" data-spa="Fecha" data-fre="Date" data-ger="Datum">Date</th>
                                                            <th data-eng="Arms (cm)" data-spa="Brazos (cm)" data-fre="Bras (cm)" data-ger="Arme (cm)">Arms (cm)</th>
                                                            <th data-eng="Change" data-spa="Cambio" data-fre="Changement" data-ger="Änderung">Change</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="arms-history-body">
                                                        <tr>
                                                            <td colspan="3" class="text-muted text-center" data-eng="No arms measurements recorded yet" data-spa="No hay mediciones de brazos registradas" data-fre="Aucune mesure de bras enregistrée" data-ger="Noch keine Armmessungen erfasst">No arms measurements recorded yet</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Calipers Section -->
                        <div class="row mb-3">
                            <div class="col-12">
                                <h5 class="section-title" data-eng="📐 Calipers (Skinfold)" data-spa="📐 Calibradores (Pliegue Cutáneo)" data-fre="📐 Calipers (Pli Cutané)" data-ger="📐 Messschieber (Hautfalte)">📐 Calipers (Skinfold)</h5>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <!-- Chest Caliper -->
                            <div class="col-md-4 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Chest" data-spa="Pecho" data-fre="Poitrine" data-ger="Brust">Chest</h6>
                                    
                                    <small class="text-muted d-block mb-2" data-eng="Diagonal fold armpit-nipple" data-spa="Pliegue diagonal axila-pezón" data-fre="Pli diagonal aisselle-mamelon" data-ger="Diagonale Falte Achsel-Brustwarze">Diagonal fold armpit-nipple</small>
                                    <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="mm" id="caliper-chest">
                                    <small class="text-muted d-block mb-2 input-date-text" id="caliper-chest-date"></small>
                                    <button class="btn primary-btn btn-sm w-100" id="btn-save-caliper-chest" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                </div>
                            </div>
                            <!-- Armpit Caliper -->
                            <div class="col-md-4 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Armpit" data-spa="Axila" data-fre="Aisselle" data-ger="Achselhöhle">Armpit</h6>
                                    
                                    <small class="text-muted d-block mb-2" data-eng="Vertical fold below armpit" data-spa="Pliegue vertical bajo axila" data-fre="Pli vertical sous l'aisselle" data-ger="Vertikale Falte unter Achsel">Vertical fold below armpit</small>
                                    <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="mm" id="caliper-axilla">
                                    <small class="text-muted d-block mb-2 input-date-text" id="caliper-axilla-date"></small>
                                    <button class="btn primary-btn btn-sm w-100" id="btn-save-caliper-armpit" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                </div>
                            </div>
                            <!-- Belly Caliper -->
                            <div class="col-md-4 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Belly" data-spa="Vientre" data-fre="Ventre" data-ger="Bauch">Belly</h6>
                                    
                                    <small class="text-muted d-block mb-2" data-eng="2cm right of belly button" data-spa="2cm a la derecha del ombligo" data-fre="2cm à droite du nombril" data-ger="2cm rechts vom Bauchnabel">2cm right of belly button</small>
                                    <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="mm" id="caliper-abdomen">
                                    <small class="text-muted d-block mb-2 input-date-text" id="caliper-abdomen-date"></small>
                                    <button class="btn primary-btn btn-sm w-100" id="btn-save-caliper-belly" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <!-- Hip Caliper -->
                            <div class="col-md-6 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Hip" data-spa="Cadera" data-fre="Hanche" data-ger="Hüfte">Hip</h6>
                                    
                                    <small class="text-muted d-block mb-2" data-eng="Above hip bone" data-spa="Sobre el hueso de la cadera" data-fre="Au-dessus de l'os de la hanche" data-ger="Über dem Hüftknochen">Above hip bone</small>
                                    <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="mm" id="caliper-suprailiac">
                                    <small class="text-muted d-block mb-2 input-date-text" id="caliper-suprailiac-date"></small>
                                    <button class="btn primary-btn btn-sm w-100" id="btn-save-caliper-hip" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                </div>
                            </div>
                            <!-- Thigh Caliper -->
                            <div class="col-md-6 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Thigh" data-spa="Muslo" data-fre="Cuisse" data-ger="Oberschenkel">Thigh</h6>
                                    
                                    <small class="text-muted d-block mb-2" data-eng="Vertical fold hip-knee" data-spa="Pliegue vertical cadera-rodilla" data-fre="Pli vertical hanche-genou" data-ger="Vertikale Falte Hüfte-Knie">Vertical fold hip-knee</small>
                                    <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="mm" id="caliper-thigh">
                                    <small class="text-muted d-block mb-2 input-date-text" id="caliper-thigh-date"></small>
                                    <button class="btn primary-btn btn-sm w-100" id="btn-save-caliper-thigh" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                </div>
                            </div>
                        </div>

                        <!-- Calipers History -->
                        <div class="row mb-3">
                            <div class="col-12">
                                <div class="glass-card">
                                    <h5 class="card-title mb-3" data-eng="📐 Calipers History" data-spa="📐 Historial de Calibradores" data-fre="📐 Historique des Calipers" data-ger="📐 Messschieber Verlauf">📐 Calipers History</h5>

                                    <!-- Tabs for each caliper measurement -->
                                    <ul class="nav nav-tabs mb-3" id="calipersTabs" role="tablist">
                                        <li class="nav-item" role="presentation">
                                            <a class="nav-link active" id="caliper-chest-history-tab" data-toggle="tab" href="#caliper-chest-history" role="tab" data-eng="Chest" data-spa="Pecho" data-fre="Poitrine" data-ger="Brust">Chest</a>
                                        </li>
                                        <li class="nav-item" role="presentation">
                                            <a class="nav-link" id="caliper-armpit-history-tab" data-toggle="tab" href="#caliper-armpit-history" role="tab" data-eng="Armpit" data-spa="Axila" data-fre="Aisselle" data-ger="Achselhöhle">Armpit</a>
                                        </li>
                                        <li class="nav-item" role="presentation">
                                            <a class="nav-link" id="caliper-belly-history-tab" data-toggle="tab" href="#caliper-belly-history" role="tab" data-eng="Belly" data-spa="Vientre" data-fre="Ventre" data-ger="Bauch">Belly</a>
                                        </li>
                                        <li class="nav-item" role="presentation">
                                            <a class="nav-link" id="caliper-hip-history-tab" data-toggle="tab" href="#caliper-hip-history" role="tab" data-eng="Hip" data-spa="Cadera" data-fre="Hanche" data-ger="Hüfte">Hip</a>
                                        </li>
                                        <li class="nav-item" role="presentation">
                                            <a class="nav-link" id="caliper-thigh-history-tab" data-toggle="tab" href="#caliper-thigh-history" role="tab" data-eng="Thigh" data-spa="Muslo" data-fre="Cuisse" data-ger="Oberschenkel">Thigh</a>
                                        </li>
                                    </ul>

                                    <!-- Tab content -->
                                    <div class="tab-content" id="calipersTabsContent">
                                        <!-- Chest Caliper History -->
                                        <div class="tab-pane fade show active" id="caliper-chest-history" role="tabpanel">
                                            <div class="table-responsive">
                                                <table class="table glass-table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th data-eng="Date" data-spa="Fecha" data-fre="Date" data-ger="Datum">Date</th>
                                                            <th data-eng="Chest (mm)" data-spa="Pecho (mm)" data-fre="Poitrine (mm)" data-ger="Brust (mm)">Chest (mm)</th>
                                                            <th data-eng="Change" data-spa="Cambio" data-fre="Changement" data-ger="Änderung">Change</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="caliper-chest-history-body">
                                                        <tr>
                                                            <td colspan="3" class="text-muted text-center" data-eng="No chest caliper measurements recorded yet" data-spa="No hay mediciones de calibrador de pecho registradas" data-fre="Aucune mesure de caliper de poitrine enregistrée" data-ger="Noch keine Brust-Messungen erfasst">No chest caliper measurements recorded yet</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <!-- Armpit Caliper History -->
                                        <div class="tab-pane fade" id="caliper-armpit-history" role="tabpanel">
                                            <div class="table-responsive">
                                                <table class="table glass-table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th data-eng="Date" data-spa="Fecha" data-fre="Date" data-ger="Datum">Date</th>
                                                            <th data-eng="Armpit (mm)" data-spa="Axila (mm)" data-fre="Aisselle (mm)" data-ger="Achselhöhle (mm)">Armpit (mm)</th>
                                                            <th data-eng="Change" data-spa="Cambio" data-fre="Changement" data-ger="Änderung">Change</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="caliper-armpit-history-body">
                                                        <tr>
                                                            <td colspan="3" class="text-muted text-center" data-eng="No armpit caliper measurements recorded yet" data-spa="No hay mediciones de calibrador de axila registradas" data-fre="Aucune mesure de caliper d'aisselle enregistrée" data-ger="Noch keine Achsel-Messungen erfasst">No armpit caliper measurements recorded yet</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <!-- Belly Caliper History -->
                                        <div class="tab-pane fade" id="caliper-belly-history" role="tabpanel">
                                            <div class="table-responsive">
                                                <table class="table glass-table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th data-eng="Date" data-spa="Fecha" data-fre="Date" data-ger="Datum">Date</th>
                                                            <th data-eng="Belly (mm)" data-spa="Vientre (mm)" data-fre="Ventre (mm)" data-ger="Bauch (mm)">Belly (mm)</th>
                                                            <th data-eng="Change" data-spa="Cambio" data-fre="Changement" data-ger="Änderung">Change</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="caliper-belly-history-body">
                                                        <tr>
                                                            <td colspan="3" class="text-muted text-center" data-eng="No belly caliper measurements recorded yet" data-spa="No hay mediciones de calibrador de vientre registradas" data-fre="Aucune mesure de caliper de ventre enregistrée" data-ger="Noch keine Bauch-Messungen erfasst">No belly caliper measurements recorded yet</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <!-- Hip Caliper History -->
                                        <div class="tab-pane fade" id="caliper-hip-history" role="tabpanel">
                                            <div class="table-responsive">
                                                <table class="table glass-table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th data-eng="Date" data-spa="Fecha" data-fre="Date" data-ger="Datum">Date</th>
                                                            <th data-eng="Hip (mm)" data-spa="Cadera (mm)" data-fre="Hanche (mm)" data-ger="Hüfte (mm)">Hip (mm)</th>
                                                            <th data-eng="Change" data-spa="Cambio" data-fre="Changement" data-ger="Änderung">Change</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="caliper-hip-history-body">
                                                        <tr>
                                                            <td colspan="3" class="text-muted text-center" data-eng="No hip caliper measurements recorded yet" data-spa="No hay mediciones de calibrador de cadera registradas" data-fre="Aucune mesure de caliper de hanche enregistrée" data-ger="Noch keine Hüft-Messungen erfasst">No hip caliper measurements recorded yet</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        <!-- Thigh Caliper History -->
                                        <div class="tab-pane fade" id="caliper-thigh-history" role="tabpanel">
                                            <div class="table-responsive">
                                                <table class="table glass-table mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th data-eng="Date" data-spa="Fecha" data-fre="Date" data-ger="Datum">Date</th>
                                                            <th data-eng="Thigh (mm)" data-spa="Muslo (mm)" data-fre="Cuisse (mm)" data-ger="Oberschenkel (mm)">Thigh (mm)</th>
                                                            <th data-eng="Change" data-spa="Cambio" data-fre="Changement" data-ger="Änderung">Change</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody id="caliper-thigh-history-body">
                                                        <tr>
                                                            <td colspan="3" class="text-muted text-center" data-eng="No thigh caliper measurements recorded yet" data-spa="No hay mediciones de calibrador de muslo registradas" data-fre="Aucune mesure de caliper de cuisse enregistrée" data-ger="Noch keine Oberschenkel-Messungen erfasst">No thigh caliper measurements recorded yet</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Goals Tab -->
                    <div class="tab-pane fade" id="goals" role="tabpanel">
                        <!-- Quick Look Section (Phase 1) -->
                        <div class="row mb-3">
                            <!-- Consistency Score Card -->
                            <div class="col-md-4">
                                <div class="glass-card-smaller">
                                    <h6 class="card-title"
                                        data-eng="🎯 Consistency Score"
                                        data-spa="🎯 Puntuación de Consistencia"
                                        data-fre="🎯 Score de Cohérence"
                                        data-ger="🎯 Konsistenz-Score">
                                        🎯 Consistency Score
                                    </h6>
                                    <div id="consistency-score" class="text-muted small" data-eng="Loading consistency data..." data-spa="Cargando datos de consistencia..." data-fre="Chargement des données de cohérence..." data-ger="Konsistenzdaten werden geladen...">Loading consistency data...</div>
                                </div>
                            </div>

                            <!-- Encouragement Card -->
                            <div class="col-md-3">
                                <div class="glass-card-smaller">
                                    <h6 class="card-title"
                                        data-eng="💪 Let's Go!"
                                        data-spa="💪 ¡Vamos!"
                                        data-fre="💪 Allons-y!"
                                        data-ger="💪 Los geht's!">
                                        💪 Let's Go!
                                    </h6>
                                    <div id="encouragement-card" class="encouragement-quote">
                                        <!-- Quote will be inserted here by JS -->
                                    </div>
                                </div>
                            </div>

                            <!-- Next Check-In Reminder -->
                            <div class="col-md-5">
                                <div class="glass-card-smaller">
                                    <h6 class="card-title"
                                        data-eng="📅 Next Check-In"
                                        data-spa="📅 Próximo Control"
                                        data-fre="📅 Prochain Contrôle"
                                        data-ger="📅 Nächster Check">
                                        📅 Next Check-In
                                    </h6>
                                    <div id="next-checkin" class="text-muted small" data-eng="Calculating next weigh-in..." data-spa="Calculando próximo pesaje..." data-fre="Calcul du prochain pesage..." data-ger="Berechne nächste Wiegung...">Calculating next weigh-in...</div>
                                </div>
                            </div>
                        </div>

                        <!-- Weight Loss Chart -->
                        <div class="glass-card">
                            <div class="mb-3">
                                <h5 class="card-title mb-2" data-eng="📈 Weightloss Charts" data-spa="📈 Gráficos de Pérdida de Peso" data-fre="📈 Graphiques de Perte de Poids" data-ger="📈 Gewichtsverlust-Diagramme">📈 Weightloss Charts</h5>
                                <div class="btn-group btn-group-sm chart-period-buttons" role="group">
                                    <button type="button" class="btn secondary-btn" id="chart-weekly" data-eng="Weekly" data-spa="Semanal" data-fre="Hebdomadaire" data-ger="Wöchentlich">Weekly</button>
                                    <button type="button" class="btn secondary-btn" id="chart-30days" data-eng="30 Days" data-spa="30 Días" data-fre="30 Jours" data-ger="30 Tage">30 Days</button>
                                    <button type="button" class="btn secondary-btn" id="chart-90days" data-eng="90 Days" data-spa="90 Días" data-fre="90 Jours" data-ger="90 Tage">90 Days</button>
                                    <button type="button" class="btn secondary-btn" id="chart-monthly" data-eng="Monthly" data-spa="Mensual" data-fre="Mensuel" data-ger="Monatlich">Monthly</button>
                                    <button type="button" class="btn secondary-btn" id="chart-yearly" data-eng="Yearly" data-spa="Anual" data-fre="Annuel" data-ger="Jährlich">Yearly</button>
                                    <button type="button" class="btn secondary-btn active" id="chart-all" data-eng="All Time" data-spa="Todo el Tiempo" data-fre="Tout le Temps" data-ger="Gesamte Zeit">All Time</button>
                                </div>
                            </div>
                            <div class="chart-container">
                                <canvas id="weightChart"></canvas>
                            </div>
                            <div id="chart-navigation" class="d-flex justify-content-between align-items-center mb-3 chart-navigation">
                                <button type="button" class="btn secondary-btn btn-sm" id="chart-prev" title="Previous period" data-eng="← Previous" data-spa="← Anterior" data-fre="← Précédent" data-ger="← Zurück">
                                    ← Previous
                                </button>
                                <div id="chart-period-info" class="text-center text-muted small">
                                    <!-- Period info will be displayed here -->
                                </div>
                                <button type="button" class="btn secondary-btn btn-sm" id="chart-next" title="Next period" data-eng="Next →" data-spa="Siguiente →" data-fre="Suivant →" data-ger="Weiter →">
                                    Next →
                                </button>
                            </div>
                            <div id="chart-status" class="text-center text-muted" data-eng="Loading weight history for chart..." data-spa="Cargando historial de peso para el gráfico..." data-fre="Chargement de l'historique du poids pour le graphique..." data-ger="Gewichtsverlauf für Diagramm wird geladen...">
                                Loading weight history for chart...
                            </div>
                        </div>
                        
                        <!-- Achievement Cards -->
                        <div class="row mt-3">
                            <div class="col-md-12">
                                <div class="glass-card-small">
                                    <h6 class="card-title"
                                        data-eng="🎯 Goals Achieved"
                                        data-spa="🎯 Metas Alcanzadas"
                                        data-fre="🎯 Objectifs Atteints"
                                        data-ger="🎯 Erreichte Ziele">
                                        🎯 Goals Achieved
                                    </h6>

                                    <!-- Main Goal Progress Container -->
                                    <div id="goals-achieved">
                                        <!-- Placeholder shown when no goal set -->
                                        <div id="no-goal-placeholder" class="text-muted small text-center"
                                            data-eng="Set a goal in the Data tab to track progress"
                                            data-spa="Establece una meta en la pestaña Datos para rastrear progreso"
                                            data-fre="Définissez un objectif dans l'onglet Données pour suivre les progrès"
                                            data-ger="Setzen Sie ein Ziel auf der Registerkarte Daten, um den Fortschritt zu verfolgen">
                                            Set a goal in the Data tab to track progress
                                        </div>

                                        <!-- Goal Progress Content (hidden until goal exists) -->
                                        <div id="goal-progress-content" style="display: none;">
                                            <div class="row">
                                                <!-- Left Column: Progress Bar, Streak, and ETA -->
                                                <div class="col-md-6">
                                                    <!-- Mini Progress Bar -->
                                                    <div class="goal-progress-bar-container mb-3">
                                                        <div class="goal-progress-bar">
                                                            <div class="goal-progress-bar-fill" id="goal-progress-fill" style="width: 0%;"></div>
                                                            <div class="goal-progress-bar-text" id="goal-progress-text">0%</div>
                                                        </div>
                                                        <div class="goal-progress-label text-muted small mt-1" id="goal-progress-label">
                                                            <span data-eng="Progress: " data-spa="Progreso: " data-fre="Progrès: " data-ger="Fortschritt: ">Progress: </span>
                                                            <span id="goal-weight-progress">0 kg of 0 kg</span>
                                                        </div>
                                                    </div>

                                                    <!-- Motivational Streak -->
                                                    <div class="goal-streak mb-2">
                                                        <div class="goal-streak-icon">📈</div>
                                                        <div class="goal-streak-text" id="goal-streak-text">
                                                            <span data-eng="Loading progress..." data-spa="Cargando progreso..." data-fre="Chargement des progrès..." data-ger="Fortschritt wird geladen...">Loading progress...</span>
                                                        </div>
                                                    </div>

                                                    <!-- Estimated Achievement Date -->
                                                    <div class="goal-eta mb-3">
                                                        <div class="goal-eta-icon">🎯</div>
                                                        <div class="goal-eta-text" id="goal-eta-text">
                                                            <span data-eng="Calculating ETA..." data-spa="Calculando ETA..." data-fre="Calcul de l'ETA..." data-ger="ETA wird berechnet...">Calculating ETA...</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <!-- Right Column: Ideal Weight Progress -->
                                                <div class="col-md-6">
                                                    <!-- Mini Progress Bar - Ideal Weight -->
                                                    <div class="goal-progress-bar-container mb-3">
                                                        <div class="goal-progress-bar">
                                                            <div class="goal-progress-bar-fill" id="ideal-progress-fill" style="width: 0%;"></div>
                                                            <div class="goal-progress-bar-text" id="ideal-progress-text">0%</div>
                                                        </div>
                                                        <div class="goal-progress-label text-muted small mt-1">
                                                            <span data-eng="Ideal Weight Progress: " data-spa="Progreso de Peso Ideal: " data-fre="Progrès de Poids Idéal: " data-ger="Idealer Gewichtsfortschritt: ">Ideal Weight Progress: </span>
                                                            <span id="ideal-weight-progress">0 kg of 0 kg</span>
                                                        </div>
                                                    </div>

                                                    <!-- Ideal Weight Streak -->
                                                    <div class="goal-streak mb-2">
                                                        <div class="goal-streak-icon">📈</div>
                                                        <div class="goal-streak-text" id="ideal-streak-text">
                                                            <span data-eng="Loading progress..." data-spa="Cargando progreso..." data-fre="Chargement des progrès..." data-ger="Fortschritt wird geladen...">Loading progress...</span>
                                                        </div>
                                                    </div>

                                                    <!-- Ideal Weight ETA -->
                                                    <div class="goal-eta mb-3">
                                                        <div class="goal-eta-icon">🎯</div>
                                                        <div class="goal-eta-text" id="ideal-eta-text">
                                                            <span data-eng="Calculating ETA..." data-spa="Calculando ETA..." data-fre="Calcul de l'ETA..." data-ger="ETA wird berechnet...">Calculating ETA...</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Milestone Badges - Full Width Row -->
                                            <div class="row">
                                                <div class="col-md-12">
                                                    <div class="goal-badges">
                                                        <div class="goal-badges-title text-muted small mb-2"
                                                            data-eng="Milestones"
                                                            data-spa="Hitos"
                                                            data-fre="Jalons"
                                                            data-ger="Meilensteine">
                                                            Milestones
                                                        </div>
                                                        <div class="goal-badges-container" id="goal-badges-container">
                                                            <!-- Badges inserted dynamically by JS -->
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Other Achievement Cards -->
                        <div class="row mt-3">
                            <div class="col-md-12">
                                <div class="glass-card-small text-center">
                                    <h6 class="card-title"
                                        data-eng="🔥 Streak Counter"
                                        data-spa="🔥 Contador de Rachas"
                                        data-fre="🔥 Compteur de Séries"
                                        data-ger="🔥 Serien-Zähler">
                                        🔥 Streak Counter
                                    </h6>

                                    <!-- Streak Counter Content -->
                                    <div id="streak-counter">
                                        <!-- Content dynamically generated by renderStreakCounter() -->
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-12">
                                <div class="glass-card-small text-center">
                                    <h6 class="card-title"
                                        data-eng="📊 Total Progress"
                                        data-spa="📊 Progreso Total"
                                        data-fre="📊 Progrès Total"
                                        data-ger="📊 Gesamtfortschritt">
                                        📊 Total Progress
                                    </h6>

                                    <!-- Total Progress Content -->
                                    <div id="total-progress">
                                        <!-- Loading State -->
                                        <div id="total-progress-loading" class="text-muted small"
                                            data-eng="Loading progress stats..."
                                            data-spa="Cargando estadísticas de progreso..."
                                            data-fre="Chargement des statistiques de progrès..."
                                            data-ger="Fortschrittsstatistiken werden geladen...">
                                            Loading progress stats...
                                        </div>

                                        <!-- Main Content (hidden until loaded) -->
                                        <div id="total-progress-content" style="display: none;">

                                            <!-- Tabbed Interface for Charts -->
                                            <div class="progress-tabs mb-3">
                                                <button class="progress-tab-btn active" data-tab="charts">
                                                    <span data-eng="Charts" data-spa="Gráficos" data-fre="Graphiques" data-ger="Diagramme">Charts</span>
                                                </button>
                                                <button class="progress-tab-btn" data-tab="stats">
                                                    <span data-eng="Stats" data-spa="Estadísticas" data-fre="Statistiques" data-ger="Statistiken">Stats</span>
                                                </button>
                                                <button class="progress-tab-btn" data-tab="body-fat">
                                                    <span data-eng="Body Fat" data-spa="Grasa Corporal" data-fre="Masse Grasse" data-ger="Körperfett">Body Fat</span>
                                                </button>
                                            </div>

                                            <!-- Charts Tab -->
                                            <div class="progress-tab-content active" data-tab="charts">
                                                <!-- Average Weekly Loss Chart -->
                                                <div class="col-md-12">
                                                    <div class="mini-chart-container mb-3">
                                                        <h6 class="mini-chart-title"
                                                            data-eng="📉 Average Weekly Loss"
                                                            data-spa="📉 Pérdida Semanal Promedio"
                                                            data-fre="📉 Perte Hebdomadaire Moyenne"
                                                            data-ger="📉 Durchschnittlicher Wöchentlicher Verlust">
                                                            📉 Average Weekly Loss
                                                        </h6>
                                                        <canvas id="weekly-loss-chart"></canvas>
                                                    </div>
                                                </div>

                                                <!-- 6-Month Projection Chart -->
                                                <div class="col-md-12">
                                                    <div class="mini-chart-container mb-3">
                                                        <h6 class="mini-chart-title"
                                                            data-eng="🔮 6-Month Projection"
                                                            data-spa="🔮 Proyección de 6 Meses"
                                                            data-fre="🔮 Projection sur 6 Mois"
                                                            data-ger="🔮 6-Monats-Prognose">
                                                            🔮 6-Month Projection
                                                        </h6>
                                                        <canvas id="projection-chart"></canvas>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Stats Tab -->
                                            <div class="progress-tab-content" data-tab="stats">
                                                <div class="row">
                                                    <!-- Goal Completion Pie Chart -->
                                                    <div class="col-md-6">
                                                        <div class="mini-chart-container mb-3">
                                                            <h6 class="mini-chart-title"
                                                                data-eng="🎯 Goal Progress"
                                                                data-spa="🎯 Progreso de Meta"
                                                                data-fre="🎯 Progrès de l'Objectif"
                                                                data-ger="🎯 Zielfortschritt">
                                                                🎯 Goal Progress
                                                            </h6>
                                                            <canvas id="goal-pie-chart"></canvas>
                                                            <div id="goal-pie-label" class="chart-label mt-2"></div>
                                                        </div>
                                                    </div>

                                                    <!-- Ideal Weight Pie Chart -->
                                                    <div class="col-md-6">
                                                        <div class="mini-chart-container mb-3">
                                                            <h6 class="mini-chart-title"
                                                                data-eng="💪 Ideal Weight Progress"
                                                                data-spa="💪 Progreso Peso Ideal"
                                                                data-fre="💪 Progrès Poids Idéal"
                                                                data-ger="💪 Idealgewichtsfortschritt">
                                                                💪 Ideal Weight Progress
                                                            </h6>
                                                            <canvas id="ideal-weight-pie-chart"></canvas>
                                                            <div id="ideal-weight-label" class="chart-label mt-2"></div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="row">
                                                    <div class="col-md-12">
                                                        <!-- Weight Comparison Stat -->
                                                        <div class="comparison-stat">
                                                            <div id="weight-comparison" class="comparison-stat-value"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Body Fat Tab -->
                                            <div class="progress-tab-content" data-tab="body-fat">
                                                <!-- Body Fat Chart -->
                                                <div class="mini-chart-container">
                                                    <h6 class="mini-chart-title"
                                                        data-eng="📊 Body Fat Trend"
                                                        data-spa="📊 Tendencia de Grasa Corporal"
                                                        data-fre="📊 Tendance Masse Grasse"
                                                        data-ger="📊 Körperfetttrend">
                                                        📊 Body Fat Trend
                                                    </h6>
                                                    <canvas id="body-fat-chart"></canvas>
                                                    <div id="body-fat-chart-placeholder" class="text-muted small"
                                                        data-eng="Body fat % automatically calculated using Deurenberg formula (BMI + age)"
                                                        data-spa="% de grasa corporal calculado automáticamente usando la fórmula de Deurenberg (IMC + edad)"
                                                        data-fre="% de masse grasse calculé automatiquement à l'aide de la formule de Deurenberg (IMC + âge)"
                                                        data-ger="Körperfett % automatisch berechnet mit Deurenberg-Formel (BMI + Alter)">
                                                        Body fat % automatically calculated using Deurenberg formula (BMI + age)
                                                    </div>
                                                </div>
                                            </div>

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
                                    <h5 class="card-title" data-eng="📏 Units & Measurements" data-spa="📏 Unidades y Mediciones" data-fre="📏 Unités et Mesures" data-ger="📏 Einheiten und Maße">📏 Units & Measurements</h5>

                                    <div class="form-group mb-3">
                                        <label for="weightUnit" class="form-label" data-eng="Weight Unit" data-spa="Unidad de Peso" data-fre="Unité de Poids" data-ger="Gewichtseinheit">Weight Unit</label>
                                        <select id="weightUnit" class="form-control glass-input">
                                            <option value="kg" data-eng="Kilograms (kg)" data-spa="Kilogramos (kg)" data-fre="Kilogrammes (kg)" data-ger="Kilogramm (kg)">Kilograms (kg)</option>
                                            <option value="lbs" data-eng="Pounds (lbs)" data-spa="Libras (lbs)" data-fre="Livres (lbs)" data-ger="Pfund (lbs)">Pounds (lbs)</option>
                                            <option value="st" data-eng="Stones (st)" data-spa="Piedras (st)" data-fre="Pierres (st)" data-ger="Steine (st)">Stones (st)</option>
                                        </select>
                                    </div>

                                    <div class="form-group mb-3">
                                        <label for="heightUnit" class="form-label" data-eng="Height Unit" data-spa="Unidad de Altura" data-fre="Unité de Taille" data-ger="Größeneinheit">Height Unit</label>
                                        <select id="heightUnit" class="form-control glass-input">
                                            <option value="cm" data-eng="Centimeters (cm)" data-spa="Centímetros (cm)" data-fre="Centimètres (cm)" data-ger="Zentimeter (cm)">Centimeters (cm)</option>
                                            <option value="ft" data-eng="Feet & Inches (ft/in)" data-spa="Pies y Pulgadas (ft/in)" data-fre="Pieds et Pouces (ft/in)" data-ger="Fuß und Zoll (ft/in)">Feet & Inches (ft/in)</option>
                                            <option value="m" data-eng="Meters (m)" data-spa="Metros (m)" data-fre="Mètres (m)" data-ger="Meter (m)">Meters (m)</option>
                                        </select>
                                    </div>
                                    
                                </div>
                            </div>
                            
                            <!-- App Preferences -->
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title" data-eng="🎨 App Preferences" data-spa="🎨 Preferencias de la Aplicación" data-fre="🎨 Préférences de l'Application" data-ger="🎨 App-Einstellungen">🎨 App Preferences</h5>

                                    <div class="form-group mb-3">
                                        <label for="theme" class="form-label" data-eng="Theme" data-spa="Tema" data-fre="Thème" data-ger="Design">Theme</label>
                                        <select id="theme" class="form-control glass-input">
                                            <option value="glassmorphism" data-eng="Glassmorphism" data-spa="Glassmorfismo" data-fre="Glassmorphisme" data-ger="Glasmorphismus">Glassmorphism</option>
                                            <option value="neumorphism" data-eng="Neumorphism" data-spa="Neumorfismo" data-fre="Neumorphisme" data-ger="Neumorphismus">Neumorphism</option>
                                            <option value="skeuomorphism" data-eng="Skeuomorphism" data-spa="Esqueumorfismo" data-fre="Skeuomorphisme" data-ger="Skeuomorphismus">Skeuomorphism</option>
                                            <option value="minimalism" data-eng="Minimalism" data-spa="Minimalismo" data-fre="Minimalisme" data-ger="Minimalismus">Minimalism</option>
                                            <option value="retro" data-eng="Retro" data-spa="Retro" data-fre="Rétro" data-ger="Retro">Retro</option>
                                            <option value="material" data-eng="Material Design" data-spa="Diseño Material" data-fre="Material Design" data-ger="Material Design">Material Design</option>
                                        </select>
                                    </div>

                                    <div class="form-group mb-3">
                                        <label for="language" class="form-label" data-eng="Language" data-spa="Idioma" data-fre="Langue" data-ger="Sprache">Language</label>
                                        <select id="language" class="form-control glass-input">
                                            <option value="en" data-eng="English" data-spa="Inglés" data-fre="Anglais" data-ger="Englisch">English</option>
                                            <option value="es" data-eng="Español" data-spa="Español" data-fre="Espagnol" data-ger="Spanisch">Español</option>
                                            <option value="fr" data-eng="Français" data-spa="Francés" data-fre="Français" data-ger="Französisch">Français</option>
                                            <option value="de" data-eng="Deutsch" data-spa="Alemán" data-fre="Allemand" data-ger="Deutsch">Deutsch</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Privacy & Data -->
                        <div class="row">
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title" data-eng="🔒 Privacy & Data" data-spa="🔒 Privacidad y Datos" data-fre="🔒 Confidentialité et Données" data-ger="🔒 Datenschutz und Daten">🔒 Privacy & Data</h5>

                                    <div class="form-check mb-3">
                                        <input class="form-check-input" type="checkbox" id="shareData">
                                        <label class="form-check-label" for="shareData" data-eng="Share anonymous data for research" data-spa="Compartir datos anónimos para investigación" data-fre="Partager des données anonymes pour la recherche" data-ger="Anonyme Daten für Forschung teilen">
                                            Share anonymous data for research
                                        </label>
                                        <small class="form-text text-muted" data-eng="Help improve the app by sharing anonymized usage statistics" data-spa="Ayuda a mejorar la aplicación compartiendo estadísticas de uso anonimizadas" data-fre="Aidez à améliorer l'application en partageant des statistiques d'utilisation anonymisées" data-ger="Helfen Sie, die App zu verbessern, indem Sie anonymisierte Nutzungsstatistiken teilen">Help improve the app by sharing anonymized usage statistics</small>
                                    </div>

                                    <div class="form-check mb-3">
                                        <input class="form-check-input" type="checkbox" id="emailNotifications">
                                        <label class="form-check-label" for="emailNotifications" data-eng="Weekly email notifications for weight tracking reminders" data-spa="Notificaciones semanales por correo electrónico para recordatorios de seguimiento de peso" data-fre="Notifications hebdomadaires par e-mail pour les rappels de suivi du poids" data-ger="Wöchentliche E-Mail-Benachrichtigungen für Gewichtserfassungs-Erinnerungen">
                                            Weekly email notifications for weight tracking reminders
                                        </label>
                                    </div>

                                    <!-- Email notification schedule (hidden by default) -->
                                    <div id="emailSchedule" style="display: none; margin-left: 25px; margin-bottom: 15px;">
                                        <div class="row">
                                            <div class="col-md-7">
                                                <label for="emailDay" class="form-label" data-eng="Day of week" data-spa="Día de la semana" data-fre="Jour de la semaine" data-ger="Wochentag">Day of week</label>
                                                <select id="emailDay" class="form-control glass-input">
                                                    <option value="monday" data-eng="Monday" data-spa="Lunes" data-fre="Lundi" data-ger="Montag">Monday</option>
                                                    <option value="tuesday" data-eng="Tuesday" data-spa="Martes" data-fre="Mardi" data-ger="Dienstag">Tuesday</option>
                                                    <option value="wednesday" data-eng="Wednesday" data-spa="Miércoles" data-fre="Mercredi" data-ger="Mittwoch">Wednesday</option>
                                                    <option value="thursday" data-eng="Thursday" data-spa="Jueves" data-fre="Jeudi" data-ger="Donnerstag">Thursday</option>
                                                    <option value="friday" data-eng="Friday" data-spa="Viernes" data-fre="Vendredi" data-ger="Freitag">Friday</option>
                                                    <option value="saturday" data-eng="Saturday" data-spa="Sábado" data-fre="Samedi" data-ger="Samstag">Saturday</option>
                                                    <option value="sunday" data-eng="Sunday" data-spa="Domingo" data-fre="Dimanche" data-ger="Sonntag">Sunday</option>
                                                </select>
                                            </div>
                                            <div class="col-md-5" style="padding-left:0px;">
                                                <label for="emailTime" class="form-label" data-eng="Time" data-spa="Hora" data-fre="Heure" data-ger="Zeit">Time</label>
                                                <input type="time" id="emailTime" class="form-control glass-input" value="09:00" style="min-width: 100px;">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="form-check mb-3">
                                        <input class="form-check-input" type="checkbox" id="weeklyReports">
                                        <label class="form-check-label" for="weeklyReports" data-eng="Recieve monthly progress report emails" data-spa="Recibir correos de informe de progreso mensual" data-fre="Recevoir des e-mails de rapport de progrès mensuel" data-ger="Monatliche Fortschrittsberichts-E-Mails erhalten">
                                            Recieve monthly progress report emails
                                        </label>
                                        <br>
                                        <small class="text-muted" data-eng="Sent on the 1st of each month with a summary of the previous month's progress" data-spa="Enviado el día 1 de cada mes con un resumen del progreso del mes anterior" data-fre="Envoyé le 1er de chaque mois avec un résumé des progrès du mois précédent" data-ger="Wird am 1. jedes Monats mit einer Zusammenfassung des Fortschritts des Vormonats gesendet">Sent on the 1st of each month with a summary of the previous month's progress</small>
                                    </div>
                                </div>
                            </div>

                            <!-- Date Settings -->
                            <div class="col-md-6">
                                <div class="glass-card-small">
                                    <h5 class="card-title" data-eng="📅 Date Settings" data-spa="📅 Configuración de Fecha" data-fre="📅 Paramètres de Date" data-ger="📅 Datumseinstellungen">📅 Date Settings</h5>

                                    <div class="form-group mb-3">
                                        <label for="dateFormat" class="form-label" data-eng="Date Format" data-spa="Formato de Fecha" data-fre="Format de Date" data-ger="Datumsformat">Date Format</label>
                                        <select id="dateFormat" class="form-control glass-input">
                                            <option value="uk" data-eng="UK Format (DD/MM/YYYY)" data-spa="Formato Reino Unido (DD/MM/AAAA)" data-fre="Format Royaume-Uni (JJ/MM/AAAA)" data-ger="UK-Format (TT/MM/JJJJ)">UK Format (DD/MM/YYYY)</option>
                                            <option value="us" data-eng="US Format (MM/DD/YYYY)" data-spa="Formato EE.UU. (MM/DD/AAAA)" data-fre="Format États-Unis (MM/JJ/AAAA)" data-ger="US-Format (MM/TT/JJJJ)">US Format (MM/DD/YYYY)</option>
                                            <option value="iso" data-eng="ISO Format (YYYY-MM-DD)" data-spa="Formato ISO (AAAA-MM-DD)" data-fre="Format ISO (AAAA-MM-JJ)" data-ger="ISO-Format (JJJJ-MM-TT)">ISO Format (YYYY-MM-DD)</option>
                                            <option value="euro" data-eng="European (DD.MM.YYYY)" data-spa="Europeo (DD.MM.AAAA)" data-fre="Européen (JJ.MM.AAAA)" data-ger="Europäisch (TT.MM.JJJJ)">European (DD.MM.YYYY)</option>
                                        </select>
                                        <small class="text-muted" data-eng="Example: " data-spa="Ejemplo: " data-fre="Exemple: " data-ger="Beispiel: ">Example: <span id="dateExample">11/09/2025</span></small>
                                    </div>

                                    <div class="form-group mb-3">
                                        <label for="timezone" class="form-label" data-eng="Timezone" data-spa="Zona horaria" data-fre="Fuseau horaire" data-ger="Zeitzone">Timezone</label>
                                        <select id="timezone" class="form-control glass-input">
                                            <option value="Europe/London">London (GMT/BST)</option>
                                            <option value="Europe/Paris">Paris (CET/CEST)</option>
                                            <option value="Europe/Berlin">Berlin (CET/CEST)</option>
                                            <option value="America/New_York">New York (EST/EDT)</option>
                                            <option value="America/Chicago">Chicago (CST/CDT)</option>
                                            <option value="America/Los_Angeles">Los Angeles (PST/PDT)</option>
                                            <option value="America/Toronto">Toronto (EST/EDT)</option>
                                            <option value="Australia/Sydney">Sydney (AEDT/AEST)</option>
                                            <option value="Asia/Tokyo">Tokyo (JST)</option>
                                            <option value="Asia/Dubai">Dubai (GST)</option>
                                            <option value="UTC">UTC</option>
                                        </select>
                                    </div>

                                </div>
                            </div>
                        </div>

                        <!-- Save Settings -->
                        <div class="text-center mt-4">
                            <button id="btn-save-settings" class="btn primary-btn mr-2" style="height: 34px;" data-eng="✓ Save Settings" data-spa="✓ Guardar Config." data-fre="✓ Enreg. config." data-ger="✓ Einstellungen speichern">✓ Save Settings</button>
                            <button id="btn-reset-settings" class="btn secondary-btn" style="height: 34px;" data-eng="↻ Reset to Defaults" data-spa="↻ Restablecer Predeterminados" data-fre="↻ Réinitialiser par Défaut" data-ger="↻ Auf Standardwerte zurücksetzen">↻ Reset to Defaults</button>
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
