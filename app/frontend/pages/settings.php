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
