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
                    
