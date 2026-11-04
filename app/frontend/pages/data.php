                    <!-- Data Management Tab -->
                    <div class="tab-pane fade show active" id="data" role="tabpanel">
                        <!-- Weight Tracking Cards -->
                        <div class="row">
                <div class="col-md-6">
                    <div class="glass-card-small">
                        <h5 class="card-title" data-eng="📊 Log Current Weight" data-spa="📊 Registrar Peso Actual" data-fre="📊 Enregistrer le Poids Actuel" data-ger="📊 Aktuelles Gewicht Erfassen">📊 Log Current Weight</h5>
                        <div class="row">
                            <div class="col-8">
                                <label for="weightKg" class="sr-only" data-eng="Weight" data-spa="Peso" data-fre="Poids" data-ger="Gewicht">Weight</label>
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
                                <label for="goalWeight" class="sr-only" data-eng="Target weight" data-spa="Peso objetivo" data-fre="Poids cible" data-ger="Zielgewicht">Target weight</label>
                                <input type="number" step="0.1" min="0" id="goalWeight" class="form-control glass-input mb-2" placeholder="Target weight" data-eng="Target weight" data-spa="Peso objetivo" data-fre="Poids cible" data-ger="Zielgewicht">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-8">
                                <label for="goalDate" class="sr-only" data-eng="Target date" data-spa="Fecha objetivo" data-fre="Date cible" data-ger="Zieldatum">Target date</label>
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
                    
