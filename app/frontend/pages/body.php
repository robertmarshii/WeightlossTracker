                    <!-- Body Tab -->
                    <div class="tab-pane fade" id="body" role="tabpanel">
                        <!-- Body Sub-Tabs Navigation -->
                        <ul class="nav nav-tabs mb-3" id="bodySubTabs" role="tablist">
                            <li class="nav-item" role="presentation">
                                <a class="nav-link active" id="summary-tab" data-toggle="tab" href="#summary" role="tab" data-eng="Summary" data-spa="Resumen" data-fre="Résumé" data-ger="Zusammenfassung">Summary</a>
                            </li>
                            <li class="nav-item" role="presentation">
                                <a class="nav-link" id="history-tab" data-toggle="tab" href="#history" role="tab" data-eng="History" data-spa="Historial" data-fre="Historique" data-ger="Verlauf">History</a>
                            </li>
                        </ul>

                        <!-- Body Sub-Tabs Content -->
                        <div class="tab-content" id="bodySubTabsContent">
                            <!-- Summary Tab -->
                            <div class="tab-pane fade show active" id="summary" role="tabpanel">
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
                                    <div class="card-data-body">
                                        <div class="metric-value" id="muscle-mass-value">--</div>
                                        <div class="metric-change">
                                            <span class="change-icon" id="muscle-mass-change-icon"></span>
                                            <span class="change-text" id="muscle-mass-change-text"></span>
                                        </div>
                                        <button class="btn secondary-btn btn-sm w-100 mt-2 toggle-edit" data-eng="+ Add Data" data-spa="+ Agregar Datos" data-fre="+ Ajouter Données" data-ger="+ Daten Hinzufügen">+ Add Data</button>
                                    </div>
                                    <div class="card-edit-body">
                                        <small class="text-muted d-block mb-2" data-eng="From your smart scales" data-spa="De tu báscula inteligente" data-fre="De votre balance connectée" data-ger="Von Ihrer intelligenten Waage">From your smart scales</small>
                                        <input type="number" step="0.1" min="0" max="100" class="form-control glass-input mb-2" placeholder="%" id="muscle-mass-input">
                                        <small class="text-muted d-block mb-2 input-date-text" id="muscle-mass-date"></small>
                                        <div class="d-flex gap-2">
                                            <button class="btn secondary-btn btn-sm toggle-back" style="flex: 0 0 40%;">←</button>
                                            <button class="btn primary-btn btn-sm" style="flex: 0 0 60%;" id="btn-save-muscle-mass" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Fat Percent Card -->
                            <div class="col-md-3 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Fat Percent" data-spa="Porcentaje de Grasa" data-fre="Pourcentage de Graisse" data-ger="Fettprozentsatz">Fat Percent</h6>
                                    <div class="card-data-body">
                                        <div class="metric-value" id="fat-percent-value">--</div>
                                        <div class="metric-change">
                                            <span class="change-icon" id="fat-percent-change-icon"></span>
                                            <span class="change-text" id="fat-percent-change-text"></span>
                                        </div>
                                        <button class="btn secondary-btn btn-sm w-100 mt-2 toggle-edit" data-eng="+ Add Data" data-spa="+ Agregar Datos" data-fre="+ Ajouter Données" data-ger="+ Daten Hinzufügen">+ Add Data</button>
                                    </div>
                                    <div class="card-edit-body">
                                        <small class="text-muted d-block mb-2" data-eng="From your smart scales" data-spa="De tu báscula inteligente" data-fre="De votre balance connectée" data-ger="Von Ihrer intelligenten Waage">From your smart scales</small>
                                        <input type="number" step="0.1" min="0" max="100" class="form-control glass-input mb-2" placeholder="%" id="fat-percent-input">
                                        <small class="text-muted d-block mb-2 input-date-text" id="fat-percent-date"></small>
                                        <div class="d-flex gap-2">
                                            <button class="btn secondary-btn btn-sm toggle-back" style="flex: 0 0 40%;">←</button>
                                            <button class="btn primary-btn btn-sm" style="flex: 0 0 60%;" id="btn-save-fat-percent" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Water Percent Card -->
                            <div class="col-md-3 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Water Percent" data-spa="Porcentaje de Agua" data-fre="Pourcentage d'Eau" data-ger="Wasserprozentsatz">Water Percent</h6>
                                    <div class="card-data-body">
                                        <div class="metric-value" id="water-percent-value">--</div>
                                        <div class="metric-change">
                                            <span class="change-icon" id="water-percent-change-icon"></span>
                                            <span class="change-text" id="water-percent-change-text"></span>
                                        </div>
                                        <button class="btn secondary-btn btn-sm w-100 mt-2 toggle-edit" data-eng="+ Add Data" data-spa="+ Agregar Datos" data-fre="+ Ajouter Données" data-ger="+ Daten Hinzufügen">+ Add Data</button>
                                    </div>
                                    <div class="card-edit-body">
                                        <small class="text-muted d-block mb-2" data-eng="From your smart scales" data-spa="De tu báscula inteligente" data-fre="De votre balance connectée" data-ger="Von Ihrer intelligenten Waage">From your smart scales</small>
                                        <input type="number" step="0.1" min="0" max="100" class="form-control glass-input mb-2" placeholder="%" id="water-percent-input">
                                        <small class="text-muted d-block mb-2 input-date-text" id="water-percent-date"></small>
                                        <div class="d-flex gap-2">
                                            <button class="btn secondary-btn btn-sm toggle-back" style="flex: 0 0 40%;">←</button>
                                            <button class="btn primary-btn btn-sm" style="flex: 0 0 60%;" id="btn-save-water-percent" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Bone Mass Card -->
                            <div class="col-md-3 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Bone Mass" data-spa="Masa Ósea" data-fre="Masse Osseuse" data-ger="Knochenmasse">Bone Mass</h6>
                                    <div class="card-data-body">
                                        <div class="metric-value" id="bone-mass-value">--</div>
                                        <div class="metric-change">
                                            <span class="change-icon" id="bone-mass-change-icon"></span>
                                            <span class="change-text" id="bone-mass-change-text"></span>
                                        </div>
                                        <button class="btn secondary-btn btn-sm w-100 mt-2 toggle-edit" data-eng="+ Add Data" data-spa="+ Agregar Datos" data-fre="+ Ajouter Données" data-ger="+ Daten Hinzufügen">+ Add Data</button>
                                    </div>
                                    <div class="card-edit-body">
                                        <small class="text-muted d-block mb-2" data-eng="From your smart scales" data-spa="De tu báscula inteligente" data-fre="De votre balance connectée" data-ger="Von Ihrer intelligenten Waage">From your smart scales</small>
                                        <input type="number" step="0.1" min="0" max="100" class="form-control glass-input mb-2" placeholder="%" id="bone-mass-input">
                                        <small class="text-muted d-block mb-2 input-date-text" id="bone-mass-date"></small>
                                        <div class="d-flex gap-2">
                                            <button class="btn secondary-btn btn-sm toggle-back" style="flex: 0 0 40%;">←</button>
                                            <button class="btn primary-btn btn-sm" style="flex: 0 0 60%;" id="btn-save-bone-mass" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Insights Section -->
                        <div class="row mb-3">
                            <div class="col-12">
                                <div class="glass-card collapsible-card collapsed" id="body-insights-card">
                                    <div class="card-header-collapsible" data-toggle-target="body-insights-content">
                                        <h5 class="card-title mb-0" style="color: #ffffff;" data-eng="💡 Smart Data Insights" data-spa="💡 Perspectivas de Datos Inteligentes" data-fre="💡 Perspectives de Données Intelligentes" data-ger="💡 Intelligente Dateneinblicke">💡 Smart Data Insights</h5>
                                        <span class="card-toggle">+</span>
                                    </div>
                                    <div id="body-insights-content" class="insights-content collapsible-content" style="display: none;">
                                        <p class="text-muted" data-eng="Log your body composition data to see personalized insights." data-spa="Registra tus datos de composición corporal para ver perspectivas personalizadas." data-fre="Enregistrez vos données de composition corporelle pour voir des perspectives personnalisées." data-ger="Erfassen Sie Ihre Körperzusammensetzungsdaten, um personalisierte Einblicke zu erhalten.">Log your body composition data to see personalized insights.</p>
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
                                    <div class="card-data-body">
                                        <div class="metric-value" id="neck-value">--</div>
                                        <div class="metric-change">
                                            <span class="change-icon" id="neck-change-icon"></span>
                                            <span class="change-text" id="neck-change-text"></span>
                                        </div>
                                        <button class="btn secondary-btn btn-sm w-100 mt-2 toggle-edit" data-eng="+ Add Data" data-spa="+ Agregar Datos" data-fre="+ Ajouter Données" data-ger="+ Daten Hinzufügen">+ Add Data</button>
                                    </div>
                                    <div class="card-edit-body">
                                        <small class="text-muted d-block mb-2" data-eng="Below Adam's apple" data-spa="Debajo de la manzana de Adán" data-fre="Sous la pomme d'Adam" data-ger="Unter dem Adamsapfel">Below Adam's apple</small>
                                        <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="cm" id="neck-measurement">
                                        <small class="text-muted d-block mb-2 input-date-text" id="neck-date"></small>
                                        <div class="d-flex gap-2">
                                            <button class="btn secondary-btn btn-sm toggle-back" style="flex: 0 0 40%;">←</button>
                                            <button class="btn primary-btn btn-sm" style="flex: 0 0 60%;" id="btn-save-neck" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Breast Card -->
                            <div class="col-md-3 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Breast" data-spa="Busto" data-fre="Poitrine" data-ger="Brust">Breast</h6>
                                    <div class="card-data-body">
                                        <div class="metric-value" id="breast-value">--</div>
                                        <div class="metric-change">
                                            <span class="change-icon" id="breast-change-icon"></span>
                                            <span class="change-text" id="breast-change-text"></span>
                                        </div>
                                        <button class="btn secondary-btn btn-sm w-100 mt-2 toggle-edit" data-eng="+ Add Data" data-spa="+ Agregar Datos" data-fre="+ Ajouter Données" data-ger="+ Daten Hinzufügen">+ Add Data</button>
                                    </div>
                                    <div class="card-edit-body">
                                        <small class="text-muted d-block mb-2" data-eng="At nipple line" data-spa="A la altura del pezón" data-fre="Au niveau du mamelon" data-ger="Auf Brustwarzenhöhe">At nipple line</small>
                                        <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="cm" id="breast-measurement">
                                        <small class="text-muted d-block mb-2 input-date-text" id="breast-date"></small>
                                        <div class="d-flex gap-2">
                                            <button class="btn secondary-btn btn-sm toggle-back" style="flex: 0 0 40%;">←</button>
                                            <button class="btn primary-btn btn-sm" style="flex: 0 0 60%;" id="btn-save-breast" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Waist Card -->
                            <div class="col-md-3 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Waist" data-spa="Cintura" data-fre="Taille" data-ger="Taille">Waist</h6>
                                    <div class="card-data-body">
                                        <div class="metric-value" id="waist-value">--</div>
                                        <div class="metric-change">
                                            <span class="change-icon" id="waist-change-icon"></span>
                                            <span class="change-text" id="waist-change-text"></span>
                                        </div>
                                        <button class="btn secondary-btn btn-sm w-100 mt-2 toggle-edit" data-eng="+ Add Data" data-spa="+ Agregar Datos" data-fre="+ Ajouter Données" data-ger="+ Daten Hinzufügen">+ Add Data</button>
                                    </div>
                                    <div class="card-edit-body">
                                        <small class="text-muted d-block mb-2" data-eng="Narrowest point" data-spa="Punto más estrecho" data-fre="Point le plus étroit" data-ger="Schmalste Stelle">Narrowest point</small>
                                        <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="cm" id="waist-measurement">
                                        <small class="text-muted d-block mb-2 input-date-text" id="waist-date"></small>
                                        <div class="d-flex gap-2">
                                            <button class="btn secondary-btn btn-sm toggle-back" style="flex: 0 0 40%;">←</button>
                                            <button class="btn primary-btn btn-sm" style="flex: 0 0 60%;" id="btn-save-waist" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Hips Card -->
                            <div class="col-md-3 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Hips" data-spa="Caderas" data-fre="Hanches" data-ger="Hüften">Hips</h6>
                                    <div class="card-data-body">
                                        <div class="metric-value" id="hips-value">--</div>
                                        <div class="metric-change">
                                            <span class="change-icon" id="hips-change-icon"></span>
                                            <span class="change-text" id="hips-change-text"></span>
                                        </div>
                                        <button class="btn secondary-btn btn-sm w-100 mt-2 toggle-edit" data-eng="+ Add Data" data-spa="+ Agregar Datos" data-fre="+ Ajouter Données" data-ger="+ Daten Hinzufügen">+ Add Data</button>
                                    </div>
                                    <div class="card-edit-body">
                                        <small class="text-muted d-block mb-2" data-eng="Widest part" data-spa="Parte más ancha" data-fre="Partie la plus large" data-ger="Breiteste Stelle">Widest part</small>
                                        <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="cm" id="hips-measurement">
                                        <small class="text-muted d-block mb-2 input-date-text" id="hips-date"></small>
                                        <div class="d-flex gap-2">
                                            <button class="btn secondary-btn btn-sm toggle-back" style="flex: 0 0 40%;">←</button>
                                            <button class="btn primary-btn btn-sm" style="flex: 0 0 60%;" id="btn-save-hips" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <!-- Thighs Card -->
                            <div class="col-md-4 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Thighs" data-spa="Muslos" data-fre="Cuisses" data-ger="Oberschenkel">Thighs</h6>
                                    <div class="card-data-body">
                                        <div class="metric-value" id="thighs-value">--</div>
                                        <div class="metric-change">
                                            <span class="change-icon" id="thighs-change-icon"></span>
                                            <span class="change-text" id="thighs-change-text"></span>
                                        </div>
                                        <button class="btn secondary-btn btn-sm w-100 mt-2 toggle-edit" data-eng="+ Add Data" data-spa="+ Agregar Datos" data-fre="+ Ajouter Données" data-ger="+ Daten Hinzufügen">+ Add Data</button>
                                    </div>
                                    <div class="card-edit-body">
                                        <small class="text-muted d-block mb-2" data-eng="Midway hip to knee" data-spa="Entre cadera y rodilla" data-fre="Entre hanche et genou" data-ger="Zwischen Hüfte und Knie">Midway hip to knee</small>
                                        <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="cm" id="thighs-measurement">
                                        <small class="text-muted d-block mb-2 input-date-text" id="thighs-date"></small>
                                        <div class="d-flex gap-2">
                                            <button class="btn secondary-btn btn-sm toggle-back" style="flex: 0 0 40%;">←</button>
                                            <button class="btn primary-btn btn-sm" style="flex: 0 0 60%;" id="btn-save-thighs" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Calves Card -->
                            <div class="col-md-4 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Calves" data-spa="Pantorrillas" data-fre="Mollets" data-ger="Waden">Calves</h6>
                                    <div class="card-data-body">
                                        <div class="metric-value" id="calves-value">--</div>
                                        <div class="metric-change">
                                            <span class="change-icon" id="calves-change-icon"></span>
                                            <span class="change-text" id="calves-change-text"></span>
                                        </div>
                                        <button class="btn secondary-btn btn-sm w-100 mt-2 toggle-edit" data-eng="+ Add Data" data-spa="+ Agregar Datos" data-fre="+ Ajouter Données" data-ger="+ Daten Hinzufügen">+ Add Data</button>
                                    </div>
                                    <div class="card-edit-body">
                                        <small class="text-muted d-block mb-2" data-eng="Thickest part" data-spa="Parte más gruesa" data-fre="Partie la plus épaisse" data-ger="Dickste Stelle">Thickest part</small>
                                        <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="cm" id="calves-measurement">
                                        <small class="text-muted d-block mb-2 input-date-text" id="calves-date"></small>
                                        <div class="d-flex gap-2">
                                            <button class="btn secondary-btn btn-sm toggle-back" style="flex: 0 0 40%;">←</button>
                                            <button class="btn primary-btn btn-sm" style="flex: 0 0 60%;" id="btn-save-calves" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Arms Card -->
                            <div class="col-md-4 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Arms" data-spa="Brazos" data-fre="Bras" data-ger="Arme">Arms</h6>
                                    <div class="card-data-body">
                                        <div class="metric-value" id="arms-value">--</div>
                                        <div class="metric-change">
                                            <span class="change-icon" id="arms-change-icon"></span>
                                            <span class="change-text" id="arms-change-text"></span>
                                        </div>
                                        <button class="btn secondary-btn btn-sm w-100 mt-2 toggle-edit" data-eng="+ Add Data" data-spa="+ Agregar Datos" data-fre="+ Ajouter Données" data-ger="+ Daten Hinzufügen">+ Add Data</button>
                                    </div>
                                    <div class="card-edit-body">
                                        <small class="text-muted d-block mb-2" data-eng="Unflexed midpoint" data-spa="Punto medio relajado" data-fre="Point médian non fléchi" data-ger="Entspannter Mittelpunkt">Unflexed midpoint</small>
                                        <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="cm" id="arms-measurement">
                                        <small class="text-muted d-block mb-2 input-date-text" id="arms-date"></small>
                                        <div class="d-flex gap-2">
                                            <button class="btn secondary-btn btn-sm toggle-back" style="flex: 0 0 40%;">←</button>
                                            <button class="btn primary-btn btn-sm" style="flex: 0 0 60%;" id="btn-save-arms" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Measurement Insights Section -->
                        <div class="row mb-3">
                            <div class="col-12">
                                <div class="glass-card collapsible-card collapsed" id="measurement-insights-card">
                                    <div class="card-header-collapsible" data-toggle-target="measurement-insights-content">
                                        <h5 class="card-title mb-0" style="color: #ffffff;" data-eng="📊 Measurement Insights" data-spa="📊 Perspectivas de Mediciones" data-fre="📊 Perspectives de Mesures" data-ger="📊 Messeinblicke">📊 Measurement Insights</h5>
                                        <span class="card-toggle">+</span>
                                    </div>
                                    <div id="measurement-insights-content" class="insights-content collapsible-content" style="display: none;">
                                        <p class="text-muted" data-eng="Log your body measurements to see personalized insights about fat loss and body changes." data-spa="Registra tus medidas corporales para ver perspectivas personalizadas sobre pérdida de grasa y cambios corporales." data-fre="Enregistrez vos mesures corporelles pour voir des perspectives personnalisées sur la perte de graisse et les changements corporels." data-ger="Erfassen Sie Ihre Körpermaße, um personalisierte Einblicke in Fettabbau und Körperveränderungen zu erhalten.">Log your body measurements to see personalized insights about fat loss and body changes.</p>
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
                                    <div class="card-data-body">
                                        <div class="metric-value" id="caliper-chest-value">--</div>
                                        <div class="metric-change">
                                            <span class="change-icon" id="caliper-chest-change-icon"></span>
                                            <span class="change-text" id="caliper-chest-change-text"></span>
                                        </div>
                                        <button class="btn secondary-btn btn-sm w-100 mt-2 toggle-edit" data-eng="+ Add Data" data-spa="+ Agregar Datos" data-fre="+ Ajouter Données" data-ger="+ Daten Hinzufügen">+ Add Data</button>
                                    </div>
                                    <div class="card-edit-body">
                                        <small class="text-muted d-block mb-2" data-eng="Diagonal fold armpit-nipple" data-spa="Pliegue diagonal axila-pezón" data-fre="Pli diagonal aisselle-mamelon" data-ger="Diagonale Falte Achsel-Brustwarze">Diagonal fold armpit-nipple</small>
                                        <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="mm" id="caliper-chest">
                                        <small class="text-muted d-block mb-2 input-date-text" id="caliper-chest-date"></small>
                                        <div class="d-flex gap-2">
                                            <button class="btn secondary-btn btn-sm toggle-back" style="flex: 0 0 40%;">←</button>
                                            <button class="btn primary-btn btn-sm" style="flex: 0 0 60%;" id="btn-save-caliper-chest" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Armpit Caliper -->
                            <div class="col-md-4 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Armpit" data-spa="Axila" data-fre="Aisselle" data-ger="Achselhöhle">Armpit</h6>
                                    <div class="card-data-body">
                                        <div class="metric-value" id="caliper-armpit-value">--</div>
                                        <div class="metric-change">
                                            <span class="change-icon" id="caliper-armpit-change-icon"></span>
                                            <span class="change-text" id="caliper-armpit-change-text"></span>
                                        </div>
                                        <button class="btn secondary-btn btn-sm w-100 mt-2 toggle-edit" data-eng="+ Add Data" data-spa="+ Agregar Datos" data-fre="+ Ajouter Données" data-ger="+ Daten Hinzufügen">+ Add Data</button>
                                    </div>
                                    <div class="card-edit-body">
                                        <small class="text-muted d-block mb-2" data-eng="Vertical fold below armpit" data-spa="Pliegue vertical bajo axila" data-fre="Pli vertical sous l'aisselle" data-ger="Vertikale Falte unter Achsel">Vertical fold below armpit</small>
                                        <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="mm" id="caliper-axilla">
                                        <small class="text-muted d-block mb-2 input-date-text" id="caliper-axilla-date"></small>
                                        <div class="d-flex gap-2">
                                            <button class="btn secondary-btn btn-sm toggle-back" style="flex: 0 0 40%;">←</button>
                                            <button class="btn primary-btn btn-sm" style="flex: 0 0 60%;" id="btn-save-caliper-armpit" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Belly Caliper -->
                            <div class="col-md-4 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Belly" data-spa="Vientre" data-fre="Ventre" data-ger="Bauch">Belly</h6>
                                    <div class="card-data-body">
                                        <div class="metric-value" id="caliper-belly-value">--</div>
                                        <div class="metric-change">
                                            <span class="change-icon" id="caliper-belly-change-icon"></span>
                                            <span class="change-text" id="caliper-belly-change-text"></span>
                                        </div>
                                        <button class="btn secondary-btn btn-sm w-100 mt-2 toggle-edit" data-eng="+ Add Data" data-spa="+ Agregar Datos" data-fre="+ Ajouter Données" data-ger="+ Daten Hinzufügen">+ Add Data</button>
                                    </div>
                                    <div class="card-edit-body">
                                        <small class="text-muted d-block mb-2" data-eng="2cm right of belly button" data-spa="2cm a la derecha del ombligo" data-fre="2cm à droite du nombril" data-ger="2cm rechts vom Bauchnabel">2cm right of belly button</small>
                                        <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="mm" id="caliper-abdomen">
                                        <small class="text-muted d-block mb-2 input-date-text" id="caliper-abdomen-date"></small>
                                        <div class="d-flex gap-2">
                                            <button class="btn secondary-btn btn-sm toggle-back" style="flex: 0 0 40%;">←</button>
                                            <button class="btn primary-btn btn-sm" style="flex: 0 0 60%;" id="btn-save-caliper-belly" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <!-- Hip Caliper -->
                            <div class="col-md-6 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Hip" data-spa="Cadera" data-fre="Hanche" data-ger="Hüfte">Hip</h6>
                                    <div class="card-data-body">
                                        <div class="metric-value" id="caliper-hip-value">--</div>
                                        <div class="metric-change">
                                            <span class="change-icon" id="caliper-hip-change-icon"></span>
                                            <span class="change-text" id="caliper-hip-change-text"></span>
                                        </div>
                                        <button class="btn secondary-btn btn-sm w-100 mt-2 toggle-edit" data-eng="+ Add Data" data-spa="+ Agregar Datos" data-fre="+ Ajouter Données" data-ger="+ Daten Hinzufügen">+ Add Data</button>
                                    </div>
                                    <div class="card-edit-body">
                                        <small class="text-muted d-block mb-2" data-eng="Above hip bone" data-spa="Sobre el hueso de la cadera" data-fre="Au-dessus de l'os de la hanche" data-ger="Über dem Hüftknochen">Above hip bone</small>
                                        <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="mm" id="caliper-suprailiac">
                                        <small class="text-muted d-block mb-2 input-date-text" id="caliper-suprailiac-date"></small>
                                        <div class="d-flex gap-2">
                                            <button class="btn secondary-btn btn-sm toggle-back" style="flex: 0 0 40%;">←</button>
                                            <button class="btn primary-btn btn-sm" style="flex: 0 0 60%;" id="btn-save-caliper-hip" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- Thigh Caliper -->
                            <div class="col-md-6 col-sm-6">
                                <div class="glass-card-small">
                                    <h6 class="card-title" data-eng="Thigh" data-spa="Muslo" data-fre="Cuisse" data-ger="Oberschenkel">Thigh</h6>
                                    <div class="card-data-body">
                                        <div class="metric-value" id="caliper-thigh-value">--</div>
                                        <div class="metric-change">
                                            <span class="change-icon" id="caliper-thigh-change-icon"></span>
                                            <span class="change-text" id="caliper-thigh-change-text"></span>
                                        </div>
                                        <button class="btn secondary-btn btn-sm w-100 mt-2 toggle-edit" data-eng="+ Add Data" data-spa="+ Agregar Datos" data-fre="+ Ajouter Données" data-ger="+ Daten Hinzufügen">+ Add Data</button>
                                    </div>
                                    <div class="card-edit-body">
                                        <small class="text-muted d-block mb-2" data-eng="Vertical fold hip-knee" data-spa="Pliegue vertical cadera-rodilla" data-fre="Pli vertical hanche-genou" data-ger="Vertikale Falte Hüfte-Knie">Vertical fold hip-knee</small>
                                        <input type="number" step="0.1" class="form-control glass-input mb-2" placeholder="mm" id="caliper-thigh">
                                        <small class="text-muted d-block mb-2 input-date-text" id="caliper-thigh-date"></small>
                                        <div class="d-flex gap-2">
                                            <button class="btn secondary-btn btn-sm toggle-back" style="flex: 0 0 40%;">←</button>
                                            <button class="btn primary-btn btn-sm" style="flex: 0 0 60%;" id="btn-save-caliper-thigh" data-eng="✓ Save" data-spa="✓ Guardar" data-fre="✓ Enreg." data-ger="✓ Speichern">✓ Save</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Caliper Insights Section -->
                        <div class="row mb-3">
                            <div class="col-12">
                                <div class="glass-card collapsible-card collapsed" id="caliper-insights-card">
                                    <div class="card-header-collapsible" data-toggle-target="caliper-insights-content">
                                        <h5 class="card-title mb-0" style="color: #ffffff;" data-eng="📐 Caliper Insights" data-spa="📐 Perspectivas de Calibradores" data-fre="📐 Perspectives des Calipers" data-ger="📐 Messschieber Einblicke">📐 Caliper Insights</h5>
                                        <span class="card-toggle">+</span>
                                    </div>
                                    <div id="caliper-insights-content" class="insights-content collapsible-content" style="display: none;">
                                        <p class="text-muted" data-eng="Log your caliper measurements to see personalized insights about body fat distribution and composition changes." data-spa="Registra tus medidas de calibrador para ver perspectivas personalizadas sobre distribución de grasa corporal y cambios de composición." data-fre="Enregistrez vos mesures de caliper pour voir des perspectives personnalisées sur la distribution de la graisse corporelle et les changements de composition." data-ger="Erfassen Sie Ihre Messschieber-Messungen, um personalisierte Einblicke in Körperfettverteilung und Zusammensetzungsänderungen zu erhalten.">Log your caliper measurements to see personalized insights about body fat distribution and composition changes.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                            </div>
                            <!-- End Summary Tab -->

                            <!-- History Tab -->
                            <div class="tab-pane fade" id="history" role="tabpanel">
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
                                                    <div class="text-right">
                                                        <button class="btn primary-btn btn-sm mt-2 btn-add-historical-entry" data-metric-type="muscle_mass" data-unit="%" data-eng="+ Add Entry" data-spa="+ Agregar Entrada" data-fre="+ Ajouter Entrée" data-ger="+ Eintrag Hinzufügen">+ Add Entry</button>
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
                                                    <div class="text-right">
                                                        <button class="btn primary-btn btn-sm mt-2 btn-add-historical-entry" data-metric-type="fat_percent" data-unit="%" data-eng="+ Add Entry" data-spa="+ Agregar Entrada" data-fre="+ Ajouter Entrée" data-ger="+ Eintrag Hinzufügen">+ Add Entry</button>
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
                                                    <div class="text-right">
                                                        <button class="btn primary-btn btn-sm mt-2 btn-add-historical-entry" data-metric-type="water_percent" data-unit="%" data-eng="+ Add Entry" data-spa="+ Agregar Entrada" data-fre="+ Ajouter Entrée" data-ger="+ Eintrag Hinzufügen">+ Add Entry</button>
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
                                                    <div class="text-right">
                                                        <button class="btn primary-btn btn-sm mt-2 btn-add-historical-entry" data-metric-type="bone_mass" data-unit="kg" data-eng="+ Add Entry" data-spa="+ Agregar Entrada" data-fre="+ Ajouter Entrée" data-ger="+ Eintrag Hinzufügen">+ Add Entry</button>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Add Historical Entry Form 1 - Smart Data (hidden by default) -->
                                            <div id="add-historical-entry-form-1" class="mt-3 hidden">
                                                <div class="row">
                                                    <div class="col-12 col-md-5">
                                                        <label for="historical-entry-value-1" class="form-label" id="historical-entry-label-1">Value</label>
                                                        <input type="number" step="0.1" min="0" id="historical-entry-value-1" class="form-control glass-input" placeholder="0.0">
                                                    </div>
                                                    <div class="col-12 col-md-4">
                                                        <label for="historical-entry-date-1" class="form-label" data-eng="Date" data-spa="Fecha" data-fre="Date" data-ger="Datum">Date</label>
                                                        <input type="text" id="historical-entry-date-1" class="form-control glass-input date-input" placeholder="dd/mm/yyyy">
                                                    </div>
                                                    <div class="col-12 col-md-3 d-flex align-items-end">
                                                        <button id="btn-save-historical-entry-1" class="btn primary-btn me-2" data-eng="Save" data-spa="Guardar" data-fre="Enregistrer" data-ger="Speichern">Save</button>
                                                        <button id="btn-cancel-historical-entry-1" class="btn secondary-btn" data-eng="Cancel" data-spa="Cancelar" data-fre="Annuler" data-ger="Abbrechen">Cancel</button>
                                                    </div>
                                                </div>
                                            </div>
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
                                                    <div class="text-right">
                                                        <button class="btn primary-btn btn-sm mt-2 btn-add-historical-entry" data-metric-type="measurement_neck" data-unit="cm" data-eng="+ Add Entry" data-spa="+ Agregar Entrada" data-fre="+ Ajouter Entrée" data-ger="+ Eintrag Hinzufügen">+ Add Entry</button>
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
                                                    <div class="text-right">
                                                        <button class="btn primary-btn btn-sm mt-2 btn-add-historical-entry" data-metric-type="measurement_chest" data-unit="cm" data-eng="+ Add Entry" data-spa="+ Agregar Entrada" data-fre="+ Ajouter Entrée" data-ger="+ Eintrag Hinzufügen">+ Add Entry</button>
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
                                                    <div class="text-right">
                                                        <button class="btn primary-btn btn-sm mt-2 btn-add-historical-entry" data-metric-type="measurement_waist" data-unit="cm" data-eng="+ Add Entry" data-spa="+ Agregar Entrada" data-fre="+ Ajouter Entrée" data-ger="+ Eintrag Hinzufügen">+ Add Entry</button>
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
                                                    <div class="text-right">
                                                        <button class="btn primary-btn btn-sm mt-2 btn-add-historical-entry" data-metric-type="measurement_hips" data-unit="cm" data-eng="+ Add Entry" data-spa="+ Agregar Entrada" data-fre="+ Ajouter Entrée" data-ger="+ Eintrag Hinzufügen">+ Add Entry</button>
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
                                                    <div class="text-right">
                                                        <button class="btn primary-btn btn-sm mt-2 btn-add-historical-entry" data-metric-type="measurement_thigh" data-unit="cm" data-eng="+ Add Entry" data-spa="+ Agregar Entrada" data-fre="+ Ajouter Entrée" data-ger="+ Eintrag Hinzufügen">+ Add Entry</button>
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
                                                    <div class="text-right">
                                                        <button class="btn primary-btn btn-sm mt-2 btn-add-historical-entry" data-metric-type="measurement_calf" data-unit="cm" data-eng="+ Add Entry" data-spa="+ Agregar Entrada" data-fre="+ Ajouter Entrée" data-ger="+ Eintrag Hinzufügen">+ Add Entry</button>
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
                                                    <div class="text-right">
                                                        <button class="btn primary-btn btn-sm mt-2 btn-add-historical-entry" data-metric-type="measurement_arm" data-unit="cm" data-eng="+ Add Entry" data-spa="+ Agregar Entrada" data-fre="+ Ajouter Entrée" data-ger="+ Eintrag Hinzufügen">+ Add Entry</button>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Add Historical Entry Form 2 - Measurements (hidden by default) -->
                                            <div id="add-historical-entry-form-2" class="mt-3 hidden">
                                                <div class="row">
                                                    <div class="col-12 col-md-5">
                                                        <label for="historical-entry-value-2" class="form-label" id="historical-entry-label-2">Value</label>
                                                        <input type="number" step="0.1" min="0" id="historical-entry-value-2" class="form-control glass-input" placeholder="0.0">
                                                    </div>
                                                    <div class="col-12 col-md-4">
                                                        <label for="historical-entry-date-2" class="form-label" data-eng="Date" data-spa="Fecha" data-fre="Date" data-ger="Datum">Date</label>
                                                        <input type="text" id="historical-entry-date-2" class="form-control glass-input date-input" placeholder="dd/mm/yyyy">
                                                    </div>
                                                    <div class="col-12 col-md-3 d-flex align-items-end">
                                                        <button id="btn-save-historical-entry-2" class="btn primary-btn me-2" data-eng="Save" data-spa="Guardar" data-fre="Enregistrer" data-ger="Speichern">Save</button>
                                                        <button id="btn-cancel-historical-entry-2" class="btn secondary-btn" data-eng="Cancel" data-spa="Cancelar" data-fre="Annuler" data-ger="Abbrechen">Cancel</button>
                                                    </div>
                                                </div>
                                            </div>
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
                                                    <div class="text-right">
                                                        <button class="btn primary-btn btn-sm mt-2 btn-add-historical-entry" data-metric-type="caliper_chest" data-unit="mm" data-eng="+ Add Entry" data-spa="+ Agregar Entrada" data-fre="+ Ajouter Entrée" data-ger="+ Eintrag Hinzufügen">+ Add Entry</button>
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
                                                    <div class="text-right">
                                                        <button class="btn primary-btn btn-sm mt-2 btn-add-historical-entry" data-metric-type="caliper_abdomen" data-unit="mm" data-eng="+ Add Entry" data-spa="+ Agregar Entrada" data-fre="+ Ajouter Entrée" data-ger="+ Eintrag Hinzufügen">+ Add Entry</button>
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
                                                    <div class="text-right">
                                                        <button class="btn primary-btn btn-sm mt-2 btn-add-historical-entry" data-metric-type="caliper_thigh" data-unit="mm" data-eng="+ Add Entry" data-spa="+ Agregar Entrada" data-fre="+ Ajouter Entrée" data-ger="+ Eintrag Hinzufügen">+ Add Entry</button>
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
                                                    <div class="text-right">
                                                        <button class="btn primary-btn btn-sm mt-2 btn-add-historical-entry" data-metric-type="caliper_suprailiac" data-unit="mm" data-eng="+ Add Entry" data-spa="+ Agregar Entrada" data-fre="+ Ajouter Entrée" data-ger="+ Eintrag Hinzufügen">+ Add Entry</button>
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
                                                    <div class="text-right">
                                                        <button class="btn primary-btn btn-sm mt-2 btn-add-historical-entry" data-metric-type="caliper_tricep" data-unit="mm" data-eng="+ Add Entry" data-spa="+ Agregar Entrada" data-fre="+ Ajouter Entrée" data-ger="+ Eintrag Hinzufügen">+ Add Entry</button>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Add Historical Entry Form 3 - Calipers (hidden by default) -->
                                            <div id="add-historical-entry-form-3" class="mt-3 hidden">
                                                <div class="row">
                                                    <div class="col-12 col-md-5">
                                                        <label for="historical-entry-value-3" class="form-label" id="historical-entry-label-3">Value</label>
                                                        <input type="number" step="0.1" min="0" id="historical-entry-value-3" class="form-control glass-input" placeholder="0.0">
                                                    </div>
                                                    <div class="col-12 col-md-4">
                                                        <label for="historical-entry-date-3" class="form-label" data-eng="Date" data-spa="Fecha" data-fre="Date" data-ger="Datum">Date</label>
                                                        <input type="text" id="historical-entry-date-3" class="form-control glass-input date-input" placeholder="dd/mm/yyyy">
                                                    </div>
                                                    <div class="col-12 col-md-3 d-flex align-items-end">
                                                        <button id="btn-save-historical-entry-3" class="btn primary-btn me-2" data-eng="Save" data-spa="Guardar" data-fre="Enregistrer" data-ger="Speichern">Save</button>
                                                        <button id="btn-cancel-historical-entry-3" class="btn secondary-btn" data-eng="Cancel" data-spa="Cancelar" data-fre="Annuler" data-ger="Abbrechen">Cancel</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <!-- End History Tab -->
                        </div>
                        <!-- End Body Sub-Tabs Content -->
                    </div>

