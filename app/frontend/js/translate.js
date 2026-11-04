// Translation helper for dynamically generated content

// Merge body insights translations if available
const bodyInsights = window.bodyInsightsTranslations || {};

// Translation dictionary for dynamically generated text
const translations = {
    ...bodyInsights,
    // Achievement cards
    "Goal tracking": {
        "en": "Goal tracking",
        "es": "Seguimiento de metas",
        "fr": "Suivi des objectifs",
        "de": "Ziel-Verfolgung"
    },
    "Set goals in Data tab": {
        "en": "Set goals in Data tab",
        "es": "Establece metas en la pestaña Datos",
        "fr": "Définir des objectifs dans l'onglet Données",
        "de": "Ziele im Daten-Tab festlegen"
    },
    "kg lost": {
        "en": "kg lost",
        "es": "kg perdidos",
        "fr": "kg perdus",
        "de": "kg verloren"
    },
    "Over": {
        "en": "Over",
        "es": "Más de",
        "fr": "Plus de",
        "de": "Über"
    },
    "entries": {
        "en": "entries",
        "es": "entradas",
        "fr": "entrées",
        "de": "Einträge"
    },

    // Body metric change indicators
    "from last entry": {
        "en": "from last entry",
        "es": "desde última entrada",
        "fr": "depuis la dernière entrée",
        "de": "seit letztem Eintrag"
    },
    "No change": {
        "en": "No change",
        "es": "Sin cambios",
        "fr": "Aucun changement",
        "de": "Keine Änderung"
    },
    "First entry": {
        "en": "First entry",
        "es": "Primera entrada",
        "fr": "Première entrée",
        "de": "Erster Eintrag"
    },

    // Health messages
    "Great progress! You should be feeling healthier!": {
        "en": "Great progress! You should be feeling healthier!",
        "es": "¡Gran progreso! ¡Deberías sentirte más saludable!",
        "fr": "Excellent progrès! Vous devriez vous sentir en meilleure santé!",
        "de": "Toller Fortschritt! Sie sollten sich gesünder fühlen!"
    },
    "You're experiencing substantial health improvements. Blood pressure is likely lowering, joint pain reducing, sleep becoming more restful, and energy levels increasing. Your mood may be more stable, and daily tasks should feel easier. These improvements create momentum for continued positive health changes.": {
        "en": "You're experiencing substantial health improvements. Blood pressure is likely lowering, joint pain reducing, sleep becoming more restful, and energy levels increasing. Your mood may be more stable, and daily tasks should feel easier. These improvements create momentum for continued positive health changes.",
        "es": "Estás experimentando mejoras sustanciales en tu salud. La presión arterial probablemente está bajando, el dolor articular reduciéndose, el sueño volviéndose más reparador y los niveles de energía aumentando. Tu estado de ánimo puede ser más estable y las tareas diarias deberían sentirse más fáciles. Estas mejoras crean impulso para cambios de salud positivos continuos.",
        "fr": "Vous constatez des améliorations substantielles de votre santé. La pression artérielle diminue probablement, les douleurs articulaires se réduisent, le sommeil devient plus réparateur et les niveaux d'énergie augmentent. Votre humeur peut être plus stable et les tâches quotidiennes devraient sembler plus faciles. Ces améliorations créent un élan pour des changements de santé positifs continus.",
        "de": "Sie erleben wesentliche gesundheitliche Verbesserungen. Der Blutdruck sinkt wahrscheinlich, Gelenkschmerzen nehmen ab, der Schlaf wird erholsamer und das Energieniveau steigt. Ihre Stimmung kann stabiler sein und alltägliche Aufgaben sollten sich leichter anfühlen. Diese Verbesserungen schaffen Schwung für anhaltende positive Gesundheitsveränderungen."
    },

    // BMI and health metrics
    "Body fat estimated via Deurenberg formula (BMI + age). Each 1% body fat reduction can improve metabolic health (Jackson et al., 2002)": {
        "en": "Body fat estimated via Deurenberg formula (BMI + age). Each 1% body fat reduction can improve metabolic health (Jackson et al., 2002)",
        "es": "Grasa corporal estimada mediante la fórmula Deurenberg (IMC + edad). Cada 1% de reducción de grasa corporal puede mejorar la salud metabólica (Jackson et al., 2002)",
        "fr": "Graisse corporelle estimée via la formule Deurenberg (IMC + âge). Chaque réduction de 1% de graisse corporelle peut améliorer la santé métabolique (Jackson et al., 2002)",
        "de": "Körperfett geschätzt über Deurenberg-Formel (BMI + Alter). Jede 1% Körperfettreduktion kann die metabolische Gesundheit verbessern (Jackson et al., 2002)"
    },
    "BMI decreased by": {
        "en": "BMI decreased by",
        "es": "IMC disminuyó en",
        "fr": "IMC diminué de",
        "de": "BMI verringert um"
    },
    "points since starting!": {
        "en": "points since starting!",
        "es": "puntos desde el inicio!",
        "fr": "points depuis le début!",
        "de": "Punkte seit Beginn!"
    },
    "Started at": {
        "en": "Started at",
        "es": "Comenzó en",
        "fr": "Commencé à",
        "de": "Begonnen bei"
    },
    "BMI": {
        "en": "BMI",
        "es": "IMC",
        "fr": "IMC",
        "de": "BMI"
    },
    "Risk reduced by": {
        "en": "Risk reduced by",
        "es": "Riesgo reducido en",
        "fr": "Risque réduit de",
        "de": "Risiko reduziert um"
    },
    "from weight loss": {
        "en": "from weight loss",
        "es": "por pérdida de peso",
        "fr": "de perte de poids",
        "de": "durch Gewichtsverlust"
    },
    "(High)": {
        "en": "(High)",
        "es": "(Alto)",
        "fr": "(Élevé)",
        "de": "(Hoch)"
    },
    "Risk estimates based on BMI, age, and activity level. Each kg of weight loss reduces cardiovascular risk by 2-3% (Poirier et al., 2006; Look AHEAD Research Group, 2013)": {
        "en": "Risk estimates based on BMI, age, and activity level. Each kg of weight loss reduces cardiovascular risk by 2-3% (Poirier et al., 2006; Look AHEAD Research Group, 2013)",
        "es": "Estimaciones de riesgo basadas en IMC, edad y nivel de actividad. Cada kg de pérdida de peso reduce el riesgo cardiovascular en 2-3% (Poirier et al., 2006; Look AHEAD Research Group, 2013)",
        "fr": "Estimations de risque basées sur l'IMC, l'âge et le niveau d'activité. Chaque kg de perte de poids réduit le risque cardiovasculaire de 2-3% (Poirier et al., 2006; Look AHEAD Research Group, 2013)",
        "de": "Risikoschätzungen basierend auf BMI, Alter und Aktivitätslevel. Jedes kg Gewichtsverlust reduziert das kardiovaskuläre Risiko um 2-3% (Poirier et al., 2006; Look AHEAD Research Group, 2013)"
    },
    "Projected to reach upper limit by": {
        "en": "Projected to reach upper limit by",
        "es": "Se proyecta alcanzar el límite superior para",
        "fr": "Projection d'atteindre la limite supérieure d'ici",
        "de": "Voraussichtliche Erreichung der Obergrenze bis"
    },
    "Based on current rate of": {
        "en": "Based on current rate of",
        "es": "Basado en ritmo actual de",
        "fr": "Basé sur un rythme actuel de",
        "de": "Basierend auf aktuellem Tempo von"
    },
    "kg/week": {
        "en": "kg/week",
        "es": "kg/semana",
        "fr": "kg/semaine",
        "de": "kg/Woche"
    },
    "Based on Modified Hamwi Formula with body frame adjustments. Healthy weight ranges reduce disease risk by 20-40% (Flegal et al., 2013)": {
        "en": "Based on Modified Hamwi Formula with body frame adjustments. Healthy weight ranges reduce disease risk by 20-40% (Flegal et al., 2013)",
        "es": "Basado en la Fórmula Hamwi Modificada con ajustes de constitución corporal. Los rangos de peso saludable reducen el riesgo de enfermedad en 20-40% (Flegal et al., 2013)",
        "fr": "Basé sur la Formule Hamwi Modifiée avec ajustements de corpulence. Les plages de poids santé réduisent le risque de maladie de 20-40% (Flegal et al., 2013)",
        "de": "Basierend auf modifizierter Hamwi-Formel mit Körpertyp-Anpassungen. Gesunde Gewichtsbereiche reduzieren Krankheitsrisiko um 20-40% (Flegal et al., 2013)"
    },
    "week": {
        "en": "week",
        "es": "semana",
        "fr": "semaine",
        "de": "Woche"
    },
    "weeks": {
        "en": "weeks",
        "es": "semanas",
        "fr": "semaines",
        "de": "Wochen"
    },
    "week average": {
        "en": "week average",
        "es": "semana promedio",
        "fr": "semaine moyenne",
        "de": "Woche Durchschnitt"
    },
    "average": {
        "en": "average",
        "es": "promedio",
        "fr": "moyenne",
        "de": "Durchschnitt"
    },
    "Research suggests ~78% of weight loss is fat when combined with exercise": {
        "en": "Research suggests ~78% of weight loss is fat when combined with exercise",
        "es": "La investigación sugiere que ~78% de la pérdida de peso es grasa cuando se combina con ejercicio",
        "fr": "Les recherches suggèrent que ~78% de la perte de poids est de la graisse lorsqu'elle est combinée avec l'exercice",
        "de": "Forschung deutet darauf hin, dass ~78% des Gewichtsverlusts Fett ist, wenn mit Bewegung kombiniert"
    },
    "Based on": {
        "en": "Based on",
        "es": "Basado en",
        "fr": "Basé sur",
        "de": "Basierend auf"
    },
    "lost": {
        "en": "lost",
        "es": "perdidos",
        "fr": "perdus",
        "de": "verloren"
    },
    "Gallstone risk reduction from weight loss is around": {
        "en": "Gallstone risk reduction from weight loss is around",
        "es": "La reducción del riesgo de cálculos biliares por pérdida de peso es de aproximadamente",
        "fr": "La réduction du risque de calculs biliaires grâce à la perte de poids est d'environ",
        "de": "Die Risikominderung von Gallensteinen durch Gewichtsverlust liegt bei etwa"
    },
    "Weight loss of 5-10% can reduce gallstone risk by 40-50%": {
        "en": "Weight loss of 5-10% can reduce gallstone risk by 40-50%",
        "es": "La pérdida de peso del 5-10% puede reducir el riesgo de cálculos biliares en 40-50%",
        "fr": "Une perte de poids de 5-10% peut réduire le risque de calculs biliaires de 40-50%",
        "de": "Gewichtsverlust von 5-10% kann Gallensteinrisiko um 40-50% reduzieren"
    },
    "Continue weight loss for gallbladder benefits": {
        "en": "Continue weight loss for gallbladder benefits",
        "es": "Continúa la pérdida de peso para beneficios de la vesícula biliar",
        "fr": "Continuez la perte de poids pour les avantages de la vésicule biliaire",
        "de": "Gewichtsverlust fortsetzen für Gallenblasenvorteile"
    },
    "percentage points": {
        "en": "percentage points",
        "es": "puntos porcentuales",
        "fr": "points de pourcentage",
        "de": "Prozentpunkte"
    },
    "Weight loss significantly reduces sleep apnea severity and improves sleep quality (Peppard et al., 2013, Am J Respir Crit Care Med)": {
        "en": "Weight loss significantly reduces sleep apnea severity and improves sleep quality (Peppard et al., 2013, Am J Respir Crit Care Med)",
        "es": "La pérdida de peso reduce significativamente la gravedad de la apnea del sueño y mejora la calidad del sueño (Peppard et al., 2013, Am J Respir Crit Care Med)",
        "fr": "La perte de poids réduit considérablement la gravité de l'apnée du sommeil et améliore la qualité du sommeil (Peppard et al., 2013, Am J Respir Crit Care Med)",
        "de": "Gewichtsverlust reduziert signifikant die Schwere der Schlafapnoe und verbessert die Schlafqualität (Peppard et al., 2013, Am J Respir Crit Care Med)"
    },
    "Weight loss significantly reduces diabetes incidence and HbA1c levels (American Diabetes Association, 2023)": {
        "en": "Weight loss significantly reduces diabetes incidence and HbA1c levels (American Diabetes Association, 2023)",
        "es": "La pérdida de peso reduce significativamente la incidencia de diabetes y los niveles de HbA1c (American Diabetes Association, 2023)",
        "fr": "La perte de poids réduit considérablement l'incidence du diabète et les niveaux d'HbA1c (American Diabetes Association, 2023)",
        "de": "Gewichtsverlust reduziert signifikant Diabetesinzidenz und HbA1c-Werte (American Diabetes Association, 2023)"
    },
    "Stronger cardiovascular protection with central obesity reduction (Lavie et al., 2021, Circulation)": {
        "en": "Stronger cardiovascular protection with central obesity reduction (Lavie et al., 2021, Circulation)",
        "es": "Mayor protección cardiovascular con la reducción de la obesidad central (Lavie et al., 2021, Circulation)",
        "fr": "Protection cardiovasculaire renforcée avec la réduction de l'obésité centrale (Lavie et al., 2021, Circulation)",
        "de": "Stärkerer kardiovaskulärer Schutz durch zentrale Adipositas-Reduktion (Lavie et al., 2021, Circulation)"
    },
    "Weight loss improves mood, self-esteem and reduces inflammation (Luppino et al., 2010, Arch Gen Psychiatry": {
        "en": "Weight loss improves mood, self-esteem and reduces inflammation (Luppino et al., 2010, Arch Gen Psychiatry",
        "es": "La pérdida de peso mejora el estado de ánimo, la autoestima y reduce la inflamación (Luppino et al., 2010, Arch Gen Psychiatry",
        "fr": "La perte de poids améliore l'humeur, l'estime de soi et réduit l'inflammation (Luppino et al., 2010, Arch Gen Psychiatry",
        "de": "Gewichtsverlust verbessert Stimmung, Selbstwertgefühl und reduziert Entzündungen (Luppino et al., 2010, Arch Gen Psychiatry"
    },
    "Reduced joint load leads to slower progression of knee and hip osteoarthritis (Messier et al., 2013, Arthritis Rheumatol)": {
        "en": "Reduced joint load leads to slower progression of knee and hip osteoarthritis (Messier et al., 2013, Arthritis Rheumatol)",
        "es": "La reducción de la carga articular conduce a una progresión más lenta de la osteoartritis de rodilla y cadera (Messier et al., 2013, Arthritis Rheumatol)",
        "fr": "La charge articulaire réduite conduit à une progression plus lente de l'arthrose du genou et de la hanche (Messier et al., 2013, Arthritis Rheumatol)",
        "de": "Reduzierte Gelenkbelastung führt zu langsamerer Progression von Knie- und Hüftarthrose (Messier et al., 2013, Arthritis Rheumatol)"
    },
    "BMI reduction": {
        "en": "BMI reduction",
        "es": "reducción de IMC",
        "fr": "réduction de l'IMC",
        "de": "BMI-Reduktion"
    },
    "Stronger benefits when weight loss occurs earlier in life (Flegal et al., 2013, JAMA)": {
        "en": "Stronger benefits when weight loss occurs earlier in life (Flegal et al., 2013, JAMA)",
        "es": "Beneficios más fuertes cuando la pérdida de peso ocurre temprano en la vida (Flegal et al., 2013, JAMA)",
        "fr": "Bénéfices plus forts lorsque la perte de poids survient tôt dans la vie (Flegal et al., 2013, JAMA)",
        "de": "Stärkere Vorteile, wenn Gewichtsverlust früher im Leben erfolgt (Flegal et al., 2013, JAMA)"
    },

    // Weight status messages
    "Latest:": {
        "en": "Latest:",
        "es": "Último:",
        "fr": "Dernier:",
        "de": "Neueste:"
    },
    "Last Week:": {
        "en": "Last Week:",
        "es": "Semana Pasada:",
        "fr": "Semaine Dernière:",
        "de": "Letzte Woche:"
    },
    "Last Month:": {
        "en": "Last Month:",
        "es": "Mes Pasado:",
        "fr": "Mois Dernier:",
        "de": "Letzter Monat:"
    },
    "Current goal:": {
        "en": "Current goal:",
        "es": "Meta actual:",
        "fr": "Objectif actuel:",
        "de": "Aktuelles Ziel:"
    },
    "by": {
        "en": "by",
        "es": "para",
        "fr": "d'ici",
        "de": "bis"
    },
    "on": {
        "en": "on",
        "es": "el",
        "fr": "le",
        "de": "am"
    },

    // health.js translations
    "Incredible transformation! You've achieved extraordinary health improvements!": {
        "en": "Incredible transformation! You've achieved extraordinary health improvements!",
        "es": "¡Transformación increíble! ¡Has logrado mejoras de salud extraordinarias!",
        "fr": "Transformation incroyable! Vous avez réalisé des améliorations de santé extraordinaires!",
        "de": "Unglaubliche Transformation! Sie haben außergewöhnliche gesundheitliche Verbesserungen erreicht!"
    },
    "You've achieved a complete health metamorphosis. Your body functions at an optimal level with dramatically reduced disease risks across all categories. You likely feel like a completely different person - boundless energy, perfect sleep, pain-free movement, razor-sharp mental focus, and physical capabilities you may not have had in decades. This is transformational health optimization.": {
        "en": "You've achieved a complete health metamorphosis. Your body functions at an optimal level with dramatically reduced disease risks across all categories. You likely feel like a completely different person - boundless energy, perfect sleep, pain-free movement, razor-sharp mental focus, and physical capabilities you may not have had in decades. This is transformational health optimization.",
        "es": "Has logrado una metamorfosis de salud completa. Tu cuerpo funciona a un nivel óptimo con riesgos de enfermedad dramáticamente reducidos en todas las categorías. Probablemente te sientas como una persona completamente diferente - energía ilimitada, sueño perfecto, movimiento sin dolor, enfoque mental agudo y capacidades físicas que quizás no hayas tenido en décadas. Esta es la optimización de salud transformacional.",
        "fr": "Vous avez réalisé une métamorphose de santé complète. Votre corps fonctionne à un niveau optimal avec des risques de maladie considérablement réduits dans toutes les catégories. Vous vous sentez probablement comme une personne complètement différente - énergie illimitée, sommeil parfait, mouvement sans douleur, concentration mentale aiguë et capacités physiques que vous n'avez peut-être pas eues depuis des décennies. C'est l'optimisation de santé transformationnelle.",
        "de": "Sie haben eine vollständige Gesundheitsmetamorphose erreicht. Ihr Körper funktioniert auf optimalem Niveau mit drastisch reduzierten Krankheitsrisiken in allen Kategorien. Sie fühlen sich wahrscheinlich wie eine völlig andere Person - grenzenlose Energie, perfekter Schlaf, schmerzfreie Bewegung, messerscharfer mentaler Fokus und körperliche Fähigkeiten, die Sie vielleicht seit Jahrzehnten nicht mehr hatten. Dies ist transformative Gesundheitsoptimierung."
    },
    "Phenomenal progress! Your health transformation is truly inspiring!": {
        "en": "Phenomenal progress! Your health transformation is truly inspiring!",
        "es": "¡Progreso fenomenal! ¡Tu transformación de salud es verdaderamente inspiradora!",
        "fr": "Progrès phénoménal! Votre transformation de santé est vraiment inspirante!",
        "de": "Phänomenaler Fortschritt! Ihre Gesundheitstransformation ist wirklich inspirierend!"
    },
    "Your health transformation is nothing short of remarkable. Your cardiovascular system operates like a well-tuned machine, metabolic function is optimized, and physical performance has reached new heights. You probably feel more energetic and capable than you have in years, with disease risks reduced to minimal levels across the board.": {
        "en": "Your health transformation is nothing short of remarkable. Your cardiovascular system operates like a well-tuned machine, metabolic function is optimized, and physical performance has reached new heights. You probably feel more energetic and capable than you have in years, with disease risks reduced to minimal levels across the board.",
        "es": "Tu transformación de salud no es nada menos que notable. Tu sistema cardiovascular funciona como una máquina bien ajustada, la función metabólica está optimizada y el rendimiento físico ha alcanzado nuevas alturas. Probablemente te sientas más enérgico y capaz de lo que has estado en años, con riesgos de enfermedad reducidos a niveles mínimos en todos los ámbitos.",
        "fr": "Votre transformation de santé est tout simplement remarquable. Votre système cardiovasculaire fonctionne comme une machine bien réglée, la fonction métabolique est optimisée et les performances physiques ont atteint de nouveaux sommets. Vous vous sentez probablement plus énergique et capable que vous ne l'avez été depuis des années, avec des risques de maladie réduits à des niveaux minimaux dans tous les domaines.",
        "de": "Ihre Gesundheitstransformation ist schlichtweg bemerkenswert. Ihr Herz-Kreislauf-System arbeitet wie eine gut abgestimmte Maschine, die Stoffwechselfunktion ist optimiert und die körperliche Leistung hat neue Höhen erreicht. Sie fühlen sich wahrscheinlich energischer und fähiger als seit Jahren, mit auf ein Minimum reduzierten Krankheitsrisiken auf allen Ebenen."
    },
    "gained": {
        "en": "gained",
        "es": "ganados",
        "fr": "gagnés",
        "de": "zugenommen"
    },
    "Current logging streak": {
        "en": "Current logging streak",
        "es": "Racha de registro actual",
        "fr": "Série d'enregistrement actuelle",
        "de": "Aktuelle Aufzeichnungsserie"
    },
    "day": {
        "en": "day",
        "es": "día",
        "fr": "jour",
        "de": "Tag"
    },
    "days": {
        "en": "days",
        "es": "días",
        "fr": "jours",
        "de": "Tage"
    },
    "No weight entries found. Add your first entry above!": {
        "en": "No weight entries found. Add your first entry above!",
        "es": "No se encontraron entradas de peso. ¡Agrega tu primera entrada arriba!",
        "fr": "Aucune entrée de poids trouvée. Ajoutez votre première entrée ci-dessus!",
        "de": "Keine Gewichtseinträge gefunden. Fügen Sie Ihren ersten Eintrag oben hinzu!"
    },
    "Failed to load weight history": {
        "en": "Failed to load weight history",
        "es": "Error al cargar el historial de peso",
        "fr": "Échec du chargement de l'historique de poids",
        "de": "Fehler beim Laden der Gewichtshistorie"
    },
    "Edit mode: change the values and save to update this entry": {
        "en": "Edit mode: change the values and save to update this entry",
        "es": "Modo de edición: cambia los valores y guarda para actualizar esta entrada",
        "fr": "Mode édition : modifiez les valeurs et enregistrez pour mettre à jour cette entrée",
        "de": "Bearbeitungsmodus: Ändern Sie die Werte und speichern Sie, um diesen Eintrag zu aktualisieren"
    },
    "Weight entry updated": {
        "en": "Weight entry updated",
        "es": "Entrada de peso actualizada",
        "fr": "Entrée de poids mise à jour",
        "de": "Gewichtseintrag aktualisiert"
    },
    "Failed to update weight entry": {
        "en": "Failed to update weight entry",
        "es": "No se pudo actualizar la entrada de peso",
        "fr": "Impossible de mettre à jour l'entrée de poids",
        "de": "Gewichtseintrag konnte nicht aktualisiert werden"
    },
    "Are you sure you want to delete this weight entry?": {
        "en": "Are you sure you want to delete this weight entry?",
        "es": "¿Estás seguro de que quieres eliminar esta entrada de peso?",
        "fr": "Êtes-vous sûr de vouloir supprimer cette entrée de poids?",
        "de": "Sind Sie sicher, dass Sie diesen Gewichtseintrag löschen möchten?"
    },
    "Weight entry deleted": {
        "en": "Weight entry deleted",
        "es": "Entrada de peso eliminada",
        "fr": "Entrée de poids supprimée",
        "de": "Gewichtseintrag gelöscht"
    },
    "Failed to delete weight entry": {
        "en": "Failed to delete weight entry",
        "es": "Error al eliminar la entrada de peso",
        "fr": "Échec de la suppression de l'entrée de poids",
        "de": "Fehler beim Löschen des Gewichtseintrags"
    },
    "Network error": {
        "en": "Network error",
        "es": "Error de red",
        "fr": "Erreur réseau",
        "de": "Netzwerkfehler"
    },
    "Current Risk:": {
        "en": "Current Risk:",
        "es": "Riesgo Actual:",
        "fr": "Risque Actuel:",
        "de": "Aktuelles Risiko:"
    },
    "Current:": {
        "en": "Current:",
        "es": "Actual:",
        "fr": "Actuel:",
        "de": "Aktuell:"
    },
    "Change:": {
        "en": "Change:",
        "es": "Cambio:",
        "fr": "Changement:",
        "de": "Änderung:"
    },
    "Started:": {
        "en": "Started:",
        "es": "Inicio:",
        "fr": "Début:",
        "de": "Begonnen:"
    },
    "Status:": {
        "en": "Status:",
        "es": "Estado:",
        "fr": "Statut:",
        "de": "Status:"
    },
    "Risk Reduction:": {
        "en": "Risk Reduction:",
        "es": "Reducción de Riesgo:",
        "fr": "Réduction du Risque:",
        "de": "Risikominderung:"
    },
    "Set your height to calculate ideal weight range": {
        "en": "Set your height to calculate ideal weight range",
        "es": "Establece tu altura para calcular tu rango de peso ideal",
        "fr": "Définissez votre taille pour calculer votre plage de poids idéale",
        "de": "Legen Sie Ihre Größe fest, um Ihren idealen Gewichtsbereich zu berechnen"
    },
    "Failed to calculate ideal weight range": {
        "en": "Failed to calculate ideal weight range",
        "es": "Error al calcular el rango de peso ideal",
        "fr": "Échec du calcul de la plage de poids idéale",
        "de": "Fehler beim Berechnen des idealen Gewichtsbereichs"
    },
    "Complete profile to assess gallbladder health benefits": {
        "en": "Complete profile to assess gallbladder health benefits",
        "es": "Completa el perfil para evaluar beneficios para la vesícula biliar",
        "fr": "Complétez le profil pour évaluer les avantages pour la vésicule biliaire",
        "de": "Vervollständigen Sie das Profil, um Vorteile für die Gallenblase zu bewerten"
    },
    "Failed to assess gallbladder health": {
        "en": "Failed to assess gallbladder health",
        "es": "Error al evaluar la salud de la vesícula biliar",
        "fr": "Échec de l'évaluation de la santé de la vésicule biliaire",
        "de": "Fehler bei der Bewertung der Gallenblasengesundheit"
    },
    "Body fat estimation not available": {
        "en": "Body fat estimation not available",
        "es": "Estimación de grasa corporal no disponible",
        "fr": "Estimation de la graisse corporelle non disponible",
        "de": "Körperfettschätzung nicht verfügbar"
    },
    "Cardiovascular risk not available": {
        "en": "Cardiovascular risk not available",
        "es": "Riesgo cardiovascular no disponible",
        "fr": "Risque cardiovasculaire non disponible",
        "de": "Herz-Kreislauf-Risiko nicht verfügbar"
    },
    "Failed to calculate cardiovascular risk": {
        "en": "Failed to calculate cardiovascular risk",
        "es": "Error al calcular el riesgo cardiovascular",
        "fr": "Échec du calcul du risque cardiovasculaire",
        "de": "Fehler bei der Berechnung des Herz-Kreislauf-Risikos"
    },
    "Ideal weight range calculated using modified Hamwi formula for small frame": {
        "en": "Ideal weight range calculated using modified Hamwi formula for small frame",
        "es": "Rango de peso ideal calculado usando la fórmula Hamwi modificada para estructura pequeña",
        "fr": "Plage de poids idéale calculée à l'aide de la formule Hamwi modifiée pour petite ossature",
        "de": "Idealer Gewichtsbereich berechnet mit modifizierter Hamwi-Formel für kleine Statur"
    },
    "Ideal weight range calculated using modified Hamwi formula for medium frame": {
        "en": "Ideal weight range calculated using modified Hamwi formula for medium frame",
        "es": "Rango de peso ideal calculado usando la fórmula Hamwi modificada para estructura mediana",
        "fr": "Plage de poids idéale calculée à l'aide de la formule Hamwi modifiée pour ossature moyenne",
        "de": "Idealer Gewichtsbereich berechnet mit modifizierter Hamwi-Formel für mittlere Statur"
    },
    "Ideal weight range calculated using modified Hamwi formula for large frame": {
        "en": "Ideal weight range calculated using modified Hamwi formula for large frame",
        "es": "Rango de peso ideal calculado usando la fórmula Hamwi modificada para estructura grande",
        "fr": "Plage de poids idéale calculée à l'aide de la formule Hamwi modifiée pour grande ossature",
        "de": "Idealer Gewichtsbereich berechnet mit modifizierter Hamwi-Formel für große Statur"
    },
    "Simplified risk model based on BMI, age, and activity level": {
        "en": "Simplified risk model based on BMI, age, and activity level",
        "es": "Modelo de riesgo simplificado basado en IMC, edad y nivel de actividad",
        "fr": "Modèle de risque simplifié basé sur l'IMC, l'âge et le niveau d'activité",
        "de": "Vereinfachtes Risikomodell basierend auf BMI, Alter und Aktivitätsniveau"
    },
    "For clinical assessment, consult healthcare provider": {
        "en": "For clinical assessment, consult healthcare provider",
        "es": "Para evaluación clínica, consulte a un proveedor de atención médica",
        "fr": "Pour une évaluation clinique, consultez un professionnel de santé",
        "de": "Für klinische Bewertung, konsultieren Sie einen Gesundheitsdienstleister"
    },
    "Early-stage NAFLD can often be reversed with weight loss (Chalasani et al., 2018, Hepatology)": {
        "en": "Early-stage NAFLD can often be reversed with weight loss (Chalasani et al., 2018, Hepatology)",
        "es": "El hígado graso en etapa temprana a menudo puede revertirse con la pérdida de peso (Chalasani et al., 2018, Hepatology)",
        "fr": "La stéatose hépatique au stade précoce peut souvent être inversée avec la perte de poids (Chalasani et al., 2018, Hepatology)",
        "de": "NAFLD im Frühstadium kann oft durch Gewichtsverlust umgekehrt werden (Chalasani et al., 2018, Hepatology)"
    },
    "Blood pressure typically drops 5-10 mmHg systolic/diastolic with weight loss (Whelton et al., 2018, JAMA)": {
        "en": "Blood pressure typically drops 5-10 mmHg systolic/diastolic with weight loss (Whelton et al., 2018, JAMA)",
        "es": "La presión arterial típicamente disminuye 5-10 mmHg sistólica/diastólica con la pérdida de peso (Whelton et al., 2018, JAMA)",
        "fr": "La pression artérielle diminue généralement de 5-10 mmHg systolique/diastolique avec la perte de poids (Whelton et al., 2018, JAMA)",
        "de": "Der Blutdruck sinkt typischerweise um 5-10 mmHg systolisch/diastolisch durch Gewichtsverlust (Whelton et al., 2018, JAMA)"
    },
    "Life Expectancy Increase:": {
        "en": "Life Expectancy Increase:",
        "es": "Aumento de Esperanza de Vida:",
        "fr": "Augmentation de l'Espérance de Vie:",
        "de": "Erhöhung der Lebenserwartung:"
    },
    "years": {
        "en": "years",
        "es": "años",
        "fr": "années",
        "de": "Jahre"
    },
    "Improvement from": {
        "en": "Improvement from",
        "es": "Mejora de",
        "fr": "Amélioration de",
        "de": "Verbesserung von"
    },

    // Health Score bar labels
    "📊 Health Score": {
        "en": "📊 Health Score",
        "es": "📊 Puntuación de Salud",
        "fr": "📊 Score de Santé",
        "de": "📊 Gesundheitspunktzahl"
    },
    "points": {
        "en": "points",
        "es": "puntos",
        "fr": "points",
        "de": "Punkte"
    },
    "Progress Summary": {
        "en": "Progress Summary",
        "es": "Resumen de Progreso",
        "fr": "Résumé des Progrès",
        "de": "Fortschritts-Zusammenfassung"
    },
    "Started at:": {
        "en": "Started at:",
        "es": "Comenzó en:",
        "fr": "Commencé à:",
        "de": "Begonnen bei:"
    },
    "weight loss across all 14 health categories on this page": {
        "en": "weight loss across all 14 health categories on this page",
        "es": "de pérdida de peso en las 14 categorías de salud de esta página",
        "fr": "de perte de poids dans les 14 catégories de santé de cette page",
        "de": "Gewichtsverlust über alle 14 Gesundheitskategorien auf dieser Seite"
    },
    "START": {
        "en": "START",
        "es": "INICIO",
        "fr": "DÉBUT",
        "de": "START"
    },
    "NOW": {
        "en": "NOW",
        "es": "AHORA",
        "fr": "ACTUEL",
        "de": "JETZT"
    },
    "Poor": {
        "en": "Poor",
        "es": "Pobre",
        "fr": "Faible",
        "de": "Schlecht"
    },
    "Fair": {
        "en": "Fair",
        "es": "Regular",
        "fr": "Passable",
        "de": "Mäßig"
    },
    "Good": {
        "en": "Good",
        "es": "Bueno",
        "fr": "Bon",
        "de": "Gut"
    },
    "Very Good": {
        "en": "Very Good",
        "es": "Muy Bueno",
        "fr": "Très Bon",
        "de": "Sehr Gut"
    },
    "Excellent": {
        "en": "Excellent",
        "es": "Excelente",
        "fr": "Excellent",
        "de": "Ausgezeichnet"
    },

    // Additional health improvement messages
    "Amazing achievement! You've made life-changing health improvements!": {
        "en": "Amazing achievement! You've made life-changing health improvements!",
        "es": "¡Logro asombroso! ¡Has hecho mejoras de salud que cambian la vida!",
        "fr": "Réalisation incroyable! Vous avez fait des améliorations de santé qui changent la vie!",
        "de": "Erstaunliche Leistung! Sie haben lebensverändernde gesundheitliche Verbesserungen erreicht!"
    },
    "You've achieved life-altering health improvements. Your body operates with exceptional efficiency - sleep is consistently restorative, energy levels remain high throughout the day, and physical activities feel effortless. Mental clarity is sharp, emotional well-being stable, and your risk for chronic diseases has dropped to very low levels.": {
        "en": "You've achieved life-altering health improvements. Your body operates with exceptional efficiency - sleep is consistently restorative, energy levels remain high throughout the day, and physical activities feel effortless. Mental clarity is sharp, emotional well-being stable, and your risk for chronic diseases has dropped to very low levels.",
        "es": "Has logrado mejoras de salud que alteran la vida. Tu cuerpo opera con eficiencia excepcional - el sueño es consistentemente reparador, los niveles de energía permanecen altos durante todo el día y las actividades físicas se sienten sin esfuerzo. La claridad mental es aguda, el bienestar emocional estable y tu riesgo de enfermedades crónicas ha caído a niveles muy bajos.",
        "fr": "Vous avez réalisé des améliorations de santé qui changent la vie. Votre corps fonctionne avec une efficacité exceptionnelle - le sommeil est constamment réparateur, les niveaux d'énergie restent élevés tout au long de la journée et les activités physiques semblent sans effort. La clarté mentale est vive, le bien-être émotionnel stable et votre risque de maladies chroniques a chuté à des niveaux très bas.",
        "de": "Sie haben lebensverändernde gesundheitliche Verbesserungen erreicht. Ihr Körper arbeitet mit außergewöhnlicher Effizienz - der Schlaf ist durchweg erholsam, das Energieniveau bleibt den ganzen Tag über hoch und körperliche Aktivitäten fühlen sich mühelos an. Die geistige Klarheit ist scharf, das emotionale Wohlbefinden stabil und Ihr Risiko für chronische Krankheiten ist auf sehr niedrige Werte gesunken."
    },
    "Outstanding transformation! Your dedication is paying off tremendously!": {
        "en": "Outstanding transformation! Your dedication is paying off tremendously!",
        "es": "¡Transformación excepcional! ¡Tu dedicación está dando resultados tremendos!",
        "fr": "Transformation exceptionnelle! Votre dévouement porte ses fruits de façon remarquable!",
        "de": "Herausragende Transformation! Ihr Engagement zahlt sich enorm aus!"
    },
    "Your dedication has yielded extraordinary results. You've likely regained physical capabilities from your younger years, with sustained high energy, excellent sleep quality, and minimal physical discomfort. Your immune system is robust, recovery times fast, and you handle physical and mental challenges with remarkable resilience.": {
        "en": "Your dedication has yielded extraordinary results. You've likely regained physical capabilities from your younger years, with sustained high energy, excellent sleep quality, and minimal physical discomfort. Your immune system is robust, recovery times fast, and you handle physical and mental challenges with remarkable resilience.",
        "es": "Tu dedicación ha producido resultados extraordinarios. Probablemente has recuperado capacidades físicas de tus años más jóvenes, con energía alta sostenida, excelente calidad de sueño y mínima incomodidad física. Tu sistema inmunológico es robusto, los tiempos de recuperación rápidos y manejas desafíos físicos y mentales con resiliencia notable.",
        "fr": "Votre dévouement a produit des résultats extraordinaires. Vous avez probablement retrouvé des capacités physiques de vos années plus jeunes, avec une énergie élevée soutenue, une excellente qualité de sommeil et un inconfort physique minimal. Votre système immunitaire est robuste, les temps de récupération rapides et vous gérez les défis physiques et mentaux avec une résilience remarquable.",
        "de": "Ihr Engagement hat außergewöhnliche Ergebnisse erzielt. Sie haben wahrscheinlich körperliche Fähigkeiten aus Ihren jüngeren Jahren wiedererlangt, mit anhaltend hoher Energie, ausgezeichneter Schlafqualität und minimalen körperlichen Beschwerden. Ihr Immunsystem ist robust, Erholungszeiten schnell und Sie bewältigen körperliche und geistige Herausforderungen mit bemerkenswerter Widerstandsfähigkeit."
    },
    "Exceptional progress! You've reached a major health milestone!": {
        "en": "Exceptional progress! You've reached a major health milestone!",
        "es": "¡Progreso excepcional! ¡Has alcanzado un hito de salud importante!",
        "fr": "Progrès exceptionnel! Vous avez atteint un jalon de santé majeur!",
        "de": "Außergewöhnlicher Fortschritt! Sie haben einen wichtigen Gesundheitsmeilenstein erreicht!"
    },
    "You've reached a major health milestone that represents years of life extension potential. Your cardiovascular system functions optimally, joints move freely without pain, and you sleep deeply every night. Physical activities that once seemed impossible are now routine, and your overall quality of life has improved dramatically.": {
        "en": "You've reached a major health milestone that represents years of life extension potential. Your cardiovascular system functions optimally, joints move freely without pain, and you sleep deeply every night. Physical activities that once seemed impossible are now routine, and your overall quality of life has improved dramatically.",
        "es": "Has alcanzado un hito de salud importante que representa años de potencial de extensión de vida. Tu sistema cardiovascular funciona óptimamente, las articulaciones se mueven libremente sin dolor y duermes profundamente cada noche. Las actividades físicas que una vez parecían imposibles ahora son rutinarias y tu calidad de vida general ha mejorado dramáticamente.",
        "fr": "Vous avez atteint un jalon de santé majeur qui représente des années de potentiel d'extension de vie. Votre système cardiovasculaire fonctionne de manière optimale, les articulations bougent librement sans douleur et vous dormez profondément chaque nuit. Les activités physiques qui semblaient autrefois impossibles sont MAINT. routinières et votre qualité de vie globale s'est considérablement améliorée.",
        "de": "Sie haben einen wichtigen Gesundheitsmeilenstein erreicht, der Jahre an Lebensverlängerungspotenzial darstellt. Ihr Herz-Kreislauf-System funktioniert optimal, Gelenke bewegen sich frei ohne Schmerzen und Sie schlafen jede Nacht tief. Körperliche Aktivitäten, die einst unmöglich schienen, sind jetzt Routine und Ihre allgemeine Lebensqualität hat sich dramatisch verbessert."
    },

    // Additional health messages from health.js (lines 222-302)
    "Remarkable achievement! Your health journey is truly impressive!": {
        "en": "Remarkable achievement! Your health journey is truly impressive!",
        "es": "¡Logro notable! ¡Tu viaje de salud es verdaderamente impresionante!",
        "fr": "Réalisation remarquable! Votre parcours de santé est vraiment impressionnant!",
        "de": "Bemerkenswerte Leistung! Ihre Gesundheitsreise ist wirklich beeindruckend!"
    },
    "Your commitment has produced remarkable results. You likely wake up feeling refreshed and maintain steady energy all day. Physical tasks feel easier, your mood is more stable and positive, and you handle stress better than before. Your body has become significantly more resilient and efficient in every way.": {
        "en": "Your commitment has produced remarkable results. You likely wake up feeling refreshed and maintain steady energy all day. Physical tasks feel easier, your mood is more stable and positive, and you handle stress better than before. Your body has become significantly more resilient and efficient in every way.",
        "es": "Tu compromiso ha producido resultados notables. Probablemente te despiertas sintiéndote renovado y mantienes energía constante todo el día. Las tareas físicas se sienten más fáciles, tu estado de ánimo es más estable y positivo, y manejas el estrés mejor que antes. Tu cuerpo se ha vuelto significativamente más resistente y eficiente en todos los sentidos.",
        "fr": "Votre engagement a produit des résultats remarquables. Vous vous réveillez probablement en vous sentant rafraîchi et maintenez une énergie stable toute la journée. Les tâches physiques semblent plus faciles, votre humeur est plus stable et positive, et vous gérez mieux le stress qu'avant. Votre corps est devenu beaucoup plus résilient et efficace à tous égards.",
        "de": "Ihr Engagement hat bemerkenswerte Ergebnisse erzielt. Sie wachen wahrscheinlich erfrischt auf und halten den ganzen Tag über gleichmäßige Energie. Körperliche Aufgaben fühlen sich leichter an, Ihre Stimmung ist stabiler und positiver, und Sie bewältigen Stress besser als zuvor. Ihr Körper ist in jeder Hinsicht deutlich widerstandsfähiger und effizienter geworden."
    },
    "Fantastic transformation! You've made incredible health strides!": {
        "en": "Fantastic transformation! You've made incredible health strides!",
        "es": "¡Transformación fantástica! ¡Has hecho avances de salud increíbles!",
        "fr": "Transformation fantastique! Vous avez fait des progrès de santé incroyables!",
        "de": "Fantastische Transformation! Sie haben unglaubliche gesundheitliche Fortschritte gemacht!"
    },
    "You've achieved fantastic health improvements that impact every aspect of your life. Sleep comes easily and leaves you fully restored, energy levels stay consistent without afternoon crashes, and physical activities bring joy rather than discomfort. Your mind feels sharper and your outlook more positive than it has in years.": {
        "en": "You've achieved fantastic health improvements that impact every aspect of your life. Sleep comes easily and leaves you fully restored, energy levels stay consistent without afternoon crashes, and physical activities bring joy rather than discomfort. Your mind feels sharper and your outlook more positive than it has in years.",
        "es": "Has logrado mejoras de salud fantásticas que impactan cada aspecto de tu vida. El sueño llega fácilmente y te deja completamente restaurado, los niveles de energía se mantienen constantes sin caídas por la tarde, y las actividades físicas traen alegría en lugar de incomodidad. Tu mente se siente más aguda y tu perspectiva más positiva de lo que ha estado en años.",
        "fr": "Vous avez réalisé des améliorations de santé fantastiques qui impactent chaque aspect de votre vie. Le sommeil vient facilement et vous laisse complètement restauré, les niveaux d'énergie restent constants sans chutes l'après-midi, et les activités physiques apportent de la joie plutôt que de l'inconfort. Votre esprit se sent plus vif et votre perspective plus positive qu'elle ne l'a été depuis des années.",
        "de": "Sie haben fantastische gesundheitliche Verbesserungen erreicht, die jeden Aspekt Ihres Lebens beeinflussen. Der Schlaf kommt leicht und lässt Sie vollständig erholt zurück, das Energieniveau bleibt konstant ohne Nachmittagstiefs, und körperliche Aktivitäten bringen Freude statt Unbehagen. Ihr Geist fühlt sich schärfer an und Ihre Aussichten positiver als seit Jahren."
    },
    "Excellent transformation! Your progress is remarkable!": {
        "en": "Excellent transformation! Your progress is remarkable!",
        "es": "¡Transformación excelente! ¡Tu progreso es notable!",
        "fr": "Transformation excellente! Votre progrès est remarquable!",
        "de": "Ausgezeichnete Transformation! Ihr Fortschritt ist bemerkenswert!"
    },
    "You've made excellent health strides that are clearly noticeable in daily life. Your energy feels abundant and natural, sleep is consistently good, and you move through your day with comfort and confidence. Friends and family probably comment on how much healthier and more vibrant you appear.": {
        "en": "You've made excellent health strides that are clearly noticeable in daily life. Your energy feels abundant and natural, sleep is consistently good, and you move through your day with comfort and confidence. Friends and family probably comment on how much healthier and more vibrant you appear.",
        "es": "Has hecho avances de salud excelentes que son claramente notables en la vida diaria. Tu energía se siente abundante y natural, el sueño es consistentemente bueno, y te mueves a través de tu día con comodidad y confianza. Los amigos y la familia probablemente comentan cuánto más saludable y vibrante te ves.",
        "fr": "Vous avez fait d'excellents progrès de santé qui sont clairement perceptibles dans la vie quotidienne. Votre énergie se sent abondante et naturelle, le sommeil est constamment bon, et vous traversez votre journée avec confort et confiance. Les amis et la famille commentent probablement à quel point vous paraissez plus sain et plus vibrant.",
        "de": "Sie haben ausgezeichnete gesundheitliche Fortschritte gemacht, die im täglichen Leben deutlich spürbar sind. Ihre Energie fühlt sich reichlich und natürlich an, der Schlaf ist durchweg gut, und Sie bewegen sich durch Ihren Tag mit Komfort und Selbstvertrauen. Freunde und Familie kommentieren wahrscheinlich, wie viel gesünder und lebendiger Sie aussehen."
    },
    "Superb progress! Your health transformation is outstanding!": {
        "en": "Superb progress! Your health transformation is outstanding!",
        "es": "¡Progreso magnífico! ¡Tu transformación de salud es extraordinaria!",
        "fr": "Progrès superbe! Votre transformation de santé est exceptionnelle!",
        "de": "Hervorragender Fortschritt! Ihre Gesundheitstransformation ist herausragend!"
    },
    "You've achieved superb health improvements that represent a major lifestyle upgrade. Energy flows naturally throughout your day, sleep is reliably restorative, and physical movement feels smooth and pain-free. Your mood is more stable, stress affects you less, and you feel genuinely excited about maintaining this healthier version of yourself.": {
        "en": "You've achieved superb health improvements that represent a major lifestyle upgrade. Energy flows naturally throughout your day, sleep is reliably restorative, and physical movement feels smooth and pain-free. Your mood is more stable, stress affects you less, and you feel genuinely excited about maintaining this healthier version of yourself.",
        "es": "Has logrado mejoras de salud magníficas que representan una mejora importante en el estilo de vida. La energía fluye naturalmente durante tu día, el sueño es confiablemente reparador, y el movimiento físico se siente suave y sin dolor. Tu estado de ánimo es más estable, el estrés te afecta menos, y te sientes genuinamente emocionado por mantener esta versión más saludable de ti mismo.",
        "fr": "Vous avez réalisé des améliorations de santé superbes qui représentent une mise à niveau majeure du style de vie. L'énergie coule naturellement tout au long de votre journée, le sommeil est fiablement réparateur, et le mouvement physique se sent fluide et sans douleur. Votre humeur est plus stable, le stress vous affecte moins, et vous vous sentez vraiment enthousiaste à l'idée de maintenir cette version plus saine de vous-même.",
        "de": "Sie haben hervorragende gesundheitliche Verbesserungen erreicht, die ein bedeutendes Lifestyle-Upgrade darstellen. Energie fließt natürlich durch Ihren Tag, der Schlaf ist zuverlässig erholsam, und körperliche Bewegung fühlt sich geschmeidig und schmerzfrei an. Ihre Stimmung ist stabiler, Stress beeinträchtigt Sie weniger, und Sie fühlen sich wirklich begeistert, diese gesündere Version Ihrer selbst aufrechtzuerhalten."
    },
    "Wonderful achievement! You're experiencing major health benefits!": {
        "en": "Wonderful achievement! You're experiencing major health benefits!",
        "es": "¡Logro maravilloso! ¡Estás experimentando beneficios de salud importantes!",
        "fr": "Réalisation merveilleuse! Vous expérimentez des avantages de santé majeurs!",
        "de": "Wunderbare Leistung! Sie erleben wichtige gesundheitliche Vorteile!"
    },
    "You've achieved exceptional health improvements. Your body should feel remarkably different - lighter, stronger, more agile. Chronic aches and pains may have diminished significantly, breathing is easier, and you likely feel decades younger. Your immune system is stronger, recovery from physical exertion faster, and overall vitality dramatically enhanced.": {
        "en": "You've achieved exceptional health improvements. Your body should feel remarkably different - lighter, stronger, more agile. Chronic aches and pains may have diminished significantly, breathing is easier, and you likely feel decades younger. Your immune system is stronger, recovery from physical exertion faster, and overall vitality dramatically enhanced.",
        "es": "Has logrado mejoras de salud excepcionales. Tu cuerpo debería sentirse notablemente diferente - más ligero, más fuerte, más ágil. Los dolores y molestias crónicos pueden haberse reducido significativamente, la respiración es más fácil y probablemente te sientas décadas más joven. Tu sistema inmunológico es más fuerte, la recuperación del esfuerzo físico es más rápida y la vitalidad general está dramáticamente mejorada.",
        "fr": "Vous avez réalisé des améliorations de santé exceptionnelles. Votre corps devrait se sentir remarquablement différent - plus léger, plus fort, plus agile. Les douleurs chroniques peuvent avoir considérablement diminué, la respiration est plus facile, et vous vous sentez probablement des décennies plus jeune. Votre système immunitaire est plus fort, la récupération de l'effort physique plus rapide, et la vitalité globale considérablement améliorée.",
        "de": "Sie haben außergewöhnliche gesundheitliche Verbesserungen erreicht. Ihr Körper sollte sich bemerkenswert anders anfühlen - leichter, stärker, agiler. Chronische Schmerzen können sich erheblich verringert haben, das Atmen ist leichter, und Sie fühlen sich wahrscheinlich Jahrzehnte jünger. Ihr Immunsystem ist stärker, die Erholung von körperlicher Anstrengung schneller, und die allgemeine Vitalität dramatisch verbessert."
    },
    "Outstanding progress! Your health transformation is remarkable!": {
        "en": "Outstanding progress! Your health transformation is remarkable!",
        "es": "¡Progreso excepcional! ¡Tu transformación de salud es notable!",
        "fr": "Progrès exceptionnel! Votre transformation de santé est remarquable!",
        "de": "Herausragender Fortschritt! Ihre Gesundheitstransformation ist bemerkenswert!"
    },
    "You've achieved transformative health improvements. Physical activities that once felt challenging should now feel manageable, sleep is likely deep and restorative, and you probably wake feeling refreshed. Mental clarity, mood stability, and physical stamina have all improved dramatically. Your risk profile has shifted significantly toward optimal health.": {
        "en": "You've achieved transformative health improvements. Physical activities that once felt challenging should now feel manageable, sleep is likely deep and restorative, and you probably wake feeling refreshed. Mental clarity, mood stability, and physical stamina have all improved dramatically. Your risk profile has shifted significantly toward optimal health.",
        "es": "Has logrado mejoras de salud transformadoras. Las actividades físicas que una vez se sintieron desafiantes ahora deberían sentirse manejables, el sueño es probablemente profundo y reparador, y probablemente te despiertas sintiéndote renovado. La claridad mental, la estabilidad del estado de ánimo y la resistencia física han mejorado dramáticamente. Tu perfil de riesgo ha cambiado significativamente hacia una salud óptima.",
        "fr": "Vous avez réalisé des améliorations de santé transformatrices. Les activités physiques qui semblaient autrefois difficiles devraient MAINT. sembler gérables, le sommeil est probablement profond et réparateur, et vous vous réveillez probablement en vous sentant rafraîchi. La clarté mentale, la stabilité de l'humeur et l'endurance physique se sont toutes considérablement améliorées. Votre profil de risque s'est déplacé de manière significative vers une santé optimale.",
        "de": "Sie haben transformative gesundheitliche Verbesserungen erreicht. Körperliche Aktivitäten, die einst herausfordernd erschienen, sollten sich jetzt bewältigbar anfühlen, der Schlaf ist wahrscheinlich tief und erholsam, und Sie wachen wahrscheinlich erfrischt auf. Geistige Klarheit, Stimmungsstabilität und körperliche Ausdauer haben sich alle dramatisch verbessert. Ihr Risikoprofil hat sich deutlich in Richtung optimaler Gesundheit verschoben."
    },
    "Excellent health improvements! You're making fantastic progress!": {
        "en": "Excellent health improvements! You're making fantastic progress!",
        "es": "¡Mejoras de salud excelentes! ¡Estás haciendo un progreso fantástico!",
        "fr": "Excellentes améliorations de santé! Vous faites des progrès fantastiques!",
        "de": "Ausgezeichnete gesundheitliche Verbesserungen! Sie machen fantastische Fortschritte!"
    },
    "You're experiencing major health transformations. Movement should feel significantly easier, sleep quality markedly improved, and energy levels substantially higher throughout the day. Inflammation is reducing, breathing may be easier, and your cardiovascular system is becoming noticeably stronger. These gains compound daily.": {
        "en": "You're experiencing major health transformations. Movement should feel significantly easier, sleep quality markedly improved, and energy levels substantially higher throughout the day. Inflammation is reducing, breathing may be easier, and your cardiovascular system is becoming noticeably stronger. These gains compound daily.",
        "es": "Estás experimentando transformaciones de salud importantes. El movimiento debería sentirse significativamente más fácil, la calidad del sueño marcadamente mejorada, y los niveles de energía sustancialmente más altos durante todo el día. La inflamación se está reduciendo, la respiración puede ser más fácil, y tu sistema cardiovascular se está volviendo notablemente más fuerte. Estas ganancias se acumulan diariamente.",
        "fr": "Vous vivez des transformations de santé majeures. Le mouvement devrait se sentir beaucoup plus facile, la qualité du sommeil nettement améliorée, et les niveaux d'énergie substantiellement plus élevés tout au long de la journée. L'inflammation diminue, la respiration peut être plus facile, et votre système cardiovasculaire devient sensiblement plus fort. Ces gains se cumulent quotidiennement.",
        "de": "Sie erleben bedeutende gesundheitliche Transformationen. Bewegung sollte sich deutlich leichter anfühlen, die Schlafqualität merklich verbessert, und das Energieniveau den ganzen Tag über wesentlich höher. Entzündungen nehmen ab, das Atmen kann leichter sein, und Ihr Herz-Kreislauf-System wird spürbar stärker. Diese Gewinne verstärken sich täglich."
    },
    "Good progress! Your health is improving!": {
        "en": "Good progress! Your health is improving!",
        "es": "¡Buen progreso! ¡Tu salud está mejorando!",
        "fr": "Bon progrès! Votre santé s'améliore!",
        "de": "Guter Fortschritt! Ihre Gesundheit verbessert sich!"
    },
    "You're experiencing noticeable health improvements. Your cardiovascular system is getting stronger, joint stress is reducing, sleep quality may be improving, and you should feel increased energy during daily activities. These positive changes are building a foundation for even greater health gains ahead.": {
        "en": "You're experiencing noticeable health improvements. Your cardiovascular system is getting stronger, joint stress is reducing, sleep quality may be improving, and you should feel increased energy during daily activities. These positive changes are building a foundation for even greater health gains ahead.",
        "es": "Estás experimentando mejoras de salud notables. Tu sistema cardiovascular se está volviendo más fuerte, el estrés articular se está reduciendo, la calidad del sueño puede estar mejorando, y deberías sentir mayor energía durante las actividades diarias. Estos cambios positivos están construyendo una base para ganancias de salud aún mayores por delante.",
        "fr": "Vous constatez des améliorations de santé perceptibles. Votre système cardiovasculaire devient plus fort, le stress articulaire diminue, la qualité du sommeil peut s'améliorer, et vous devriez ressentir une énergie accrue pendant les activités quotidiennes. Ces changements positifs construisent une fondation pour des gains de santé encore plus importants à venir.",
        "de": "Sie erleben spürbare gesundheitliche Verbesserungen. Ihr Herz-Kreislauf-System wird stärker, Gelenkbelastung nimmt ab, die Schlafqualität kann sich verbessern, und Sie sollten bei täglichen Aktivitäten mehr Energie spüren. Diese positiven Veränderungen schaffen eine Grundlage für noch größere gesundheitliche Gewinne in der Zukunft."
    },
    "Every step forward matters!": {
        "en": "Every step forward matters!",
        "es": "¡Cada paso adelante cuenta!",
        "fr": "Chaque pas en avant compte!",
        "de": "Jeder Schritt vorwärts zählt!"
    },
    "You're beginning to see small but meaningful health improvements. Your body is starting to respond positively, with early benefits like slightly better sleep, reduced strain on joints, and improved cardiovascular function. Continue with your healthy habits - these small changes build momentum for bigger improvements ahead.": {
        "en": "You're beginning to see small but meaningful health improvements. Your body is starting to respond positively, with early benefits like slightly better sleep, reduced strain on joints, and improved cardiovascular function. Continue with your healthy habits - these small changes build momentum for bigger improvements ahead.",
        "es": "Estás comenzando a ver mejoras de salud pequeñas pero significativas. Tu cuerpo está comenzando a responder positivamente, con beneficios tempranos como un sueño ligeramente mejor, menor tensión en las articulaciones y función cardiovascular mejorada. Continúa con tus hábitos saludables - estos pequeños cambios generan impulso para mejoras más grandes por delante.",
        "fr": "Vous commencez à voir de petites mais significatives améliorations de santé. Votre corps commence à répondre positivement, avec des avantages précoces comme un sommeil légèrement meilleur, une tension réduite sur les articulations et une fonction cardiovasculaire améliorée. Continuez avec vos habitudes saines - ces petits changements créent un élan pour de plus grandes améliorations à venir.",
        "de": "Sie beginnen, kleine, aber bedeutsame gesundheitliche Verbesserungen zu sehen. Ihr Körper beginnt positiv zu reagieren, mit frühen Vorteilen wie leicht besserem Schlaf, reduzierter Gelenkbelastung und verbesserter Herz-Kreislauf-Funktion. Setzen Sie Ihre gesunden Gewohnheiten fort - diese kleinen Veränderungen schaffen Schwung für größere Verbesserungen in der Zukunft."
    },
    "Time to refocus! Small changes can get you back on track.": {
        "en": "Time to refocus! Small changes can get you back on track.",
        "es": "¡Hora de reenfocarse! Pequeños cambios pueden ponerte de nuevo en el camino.",
        "fr": "Il est temps de se recentrer! De petits changements peuvent vous remettre sur la bonne voie.",
        "de": "Zeit, sich neu zu fokussieren! Kleine Veränderungen können Sie wieder auf Kurs bringen."
    },
    "Your health score has declined slightly, but this is temporary and fixable. Small adjustments to your habits can quickly turn this around. Focus on consistent healthy choices - even modest improvements will start moving your score upward again.": {
        "en": "Your health score has declined slightly, but this is temporary and fixable. Small adjustments to your habits can quickly turn this around. Focus on consistent healthy choices - even modest improvements will start moving your score upward again.",
        "es": "Tu puntuación de salud ha disminuido ligeramente, pero esto es temporal y reparable. Pequeños ajustes a tus hábitos pueden revertir esto rápidamente. Enfócate en elecciones saludables consistentes - incluso mejoras modestas comenzarán a mover tu puntuación hacia arriba nuevamente.",
        "fr": "Votre score de santé a légèrement diminué, mais c'est temporaire et réparable. De petits ajustements à vos habitudes peuvent rapidement inverser cela. Concentrez-vous sur des choix sains cohérents - même des améliorations modestes commenceront à faire remonter votre score.",
        "de": "Ihr Gesundheitswert ist leicht gesunken, aber dies ist vorübergehend und behebbar. Kleine Anpassungen Ihrer Gewohnheiten können dies schnell umkehren. Konzentrieren Sie sich auf konsequente gesunde Entscheidungen - selbst bescheidene Verbesserungen werden Ihren Wert wieder nach oben bewegen."
    },
    "Let's reverse this trend! You have the power to improve.": {
        "en": "Let's reverse this trend! You have the power to improve.",
        "es": "¡Revertamos esta tendencia! Tienes el poder de mejorar.",
        "fr": "Inversons cette tendance! Vous avez le pouvoir de vous améliorer.",
        "de": "Lassen Sie uns diesen Trend umkehren! Sie haben die Macht, sich zu verbessern."
    },
    "Your health score has decreased by": {
        "en": "Your health score has decreased by",
        "es": "Tu puntuación de salud ha disminuido en",
        "fr": "Votre score de santé a diminué de",
        "de": "Ihr Gesundheitswert ist gesunken um"
    },
    "points, but you can turn this around. Focus on getting back to healthy eating habits, regular activity, and good sleep. Even small consistent changes will start improving your health metrics.": {
        "en": "points, but you can turn this around. Focus on getting back to healthy eating habits, regular activity, and good sleep. Even small consistent changes will start improving your health metrics.",
        "es": "puntos, pero puedes revertir esto. Enfócate en volver a hábitos alimenticios saludables, actividad regular y buen sueño. Incluso pequeños cambios consistentes comenzarán a mejorar tus métricas de salud.",
        "fr": "points, mais vous pouvez inverser cela. Concentrez-vous sur le retour à des habitudes alimentaires saines, une activité régulière et un bon sommeil. Même de petits changements cohérents commenceront à améliorer vos indicateurs de santé.",
        "de": "Punkte, aber Sie können dies umkehren. Konzentrieren Sie sich darauf, zu gesunden Essgewohnheiten, regelmäßiger Aktivität und gutem Schlaf zurückzukehren. Selbst kleine konsequente Veränderungen werden Ihre Gesundheitsmetriken verbessern."
    },
    "Important reminder: Your health needs attention.": {
        "en": "Important reminder: Your health needs attention.",
        "es": "Recordatorio importante: Tu salud necesita atención.",
        "fr": "Rappel important: Votre santé nécessite de l'attention.",
        "de": "Wichtige Erinnerung: Ihre Gesundheit benötigt Aufmerksamkeit."
    },
    "With a": {
        "en": "With a",
        "es": "Con una",
        "fr": "Avec un",
        "de": "Mit einem"
    },
    "point decline, it's time to prioritize your health. Consider returning to previous healthy habits that worked for you. Small, consistent steps can help you regain lost ground and start moving in a positive direction again.": {
        "en": "point decline, it's time to prioritize your health. Consider returning to previous healthy habits that worked for you. Small, consistent steps can help you regain lost ground and start moving in a positive direction again.",
        "es": "puntos de disminución, es hora de priorizar tu salud. Considera volver a los hábitos saludables anteriores que funcionaron para ti. Pasos pequeños y consistentes pueden ayudarte a recuperar el terreno perdido y comenzar a moverte en una dirección positiva nuevamente.",
        "fr": "points de baisse, il est temps de donner la priorité à votre santé. Envisagez de revenir aux habitudes saines précédentes qui ont fonctionné pour vous. De petites étapes cohérentes peuvent vous aider à regagner le terrain perdu et à recommencer à avancer dans une direction positive.",
        "de": "Punkte Rückgang, es ist Zeit, Ihre Gesundheit zu priorisieren. Erwägen Sie, zu früheren gesunden Gewohnheiten zurückzukehren, die für Sie funktioniert haben. Kleine, konsequente Schritte können Ihnen helfen, verlorenes Terrain wiederzugewinnen und wieder in eine positive Richtung zu gehen."
    },
    "Health alert: Time for action to reverse this decline.": {
        "en": "Health alert: Time for action to reverse this decline.",
        "es": "Alerta de salud: Es hora de actuar para revertir este declive.",
        "fr": "Alerte santé: Il est temps d'agir pour inverser ce déclin.",
        "de": "Gesundheitsalarm: Zeit zum Handeln, um diesen Rückgang umzukehren."
    },
    "Your": {
        "en": "Your",
        "es": "Tu",
        "fr": "Votre",
        "de": "Ihr"
    },
    "point decrease indicates your health risks are increasing. This is a good time to recommit to healthy habits. Focus on sustainable changes in diet and activity - your body responds quickly to positive choices.": {
        "en": "point decrease indicates your health risks are increasing. This is a good time to recommit to healthy habits. Focus on sustainable changes in diet and activity - your body responds quickly to positive choices.",
        "es": "puntos de disminución indica que tus riesgos de salud están aumentando. Este es un buen momento para volver a comprometerte con hábitos saludables. Enfócate en cambios sostenibles en dieta y actividad - tu cuerpo responde rápidamente a elecciones positivas.",
        "fr": "points de baisse indique que vos risques pour la santé augmentent. C'est le bon moment pour vous réengager dans des habitudes saines. Concentrez-vous sur des changements durables dans l'alimentation et l'activité - votre corps répond rapidement aux choix positifs.",
        "de": "Punkte Abnahme zeigt an, dass Ihre Gesundheitsrisiken zunehmen. Dies ist ein guter Zeitpunkt, sich wieder gesunden Gewohnheiten zu verpflichten. Konzentrieren Sie sich auf nachhaltige Veränderungen in Ernährung und Aktivität - Ihr Körper reagiert schnell auf positive Entscheidungen."
    },
    "Significant concern: Your health metrics need immediate attention.": {
        "en": "Significant concern: Your health metrics need immediate attention.",
        "es": "Preocupación significativa: Tus métricas de salud necesitan atención inmediata.",
        "fr": "Préoccupation significative: Vos indicateurs de santé nécessitent une attention immédiate.",
        "de": "Erhebliche Besorgnis: Ihre Gesundheitsmetriken benötigen sofortige Aufmerksamkeit."
    },
    "A": {
        "en": "A",
        "es": "Un",
        "fr": "Un",
        "de": "Ein"
    },
    "point decline is substantial and indicates increasing health risks across multiple categories. Consider consulting with a healthcare provider and developing a structured plan to address weight and health management. It's not too late to reverse this trend.": {
        "en": "point decline is substantial and indicates increasing health risks across multiple categories. Consider consulting with a healthcare provider and developing a structured plan to address weight and health management. It's not too late to reverse this trend.",
        "es": "puntos de declive es sustancial e indica riesgos de salud crecientes en múltiples categorías. Considera consultar con un proveedor de atención médica y desarrollar un plan estructurado para abordar el peso y la gestión de la salud. No es demasiado tarde para revertir esta tendencia.",
        "fr": "points de baisse est substantiel et indique des risques de santé croissants dans plusieurs catégories. Envisagez de consulter un professionnel de la santé et de développer un plan structuré pour aborder la gestion du poids et de la santé. Il n'est pas trop tard pour inverser cette tendance.",
        "de": "Punkte Rückgang ist erheblich und weist auf zunehmende Gesundheitsrisiken in mehreren Kategorien hin. Erwägen Sie, einen Gesundheitsdienstleister zu konsultieren und einen strukturierten Plan zur Bewältigung von Gewichts- und Gesundheitsmanagement zu entwickeln. Es ist nicht zu spät, diesen Trend umzukehren."
    },
    "Serious health alert: Immediate action needed.": {
        "en": "Serious health alert: Immediate action needed.",
        "es": "Alerta de salud grave: Se necesita acción inmediata.",
        "fr": "Alerte santé grave: Action immédiate nécessaire.",
        "de": "Ernster Gesundheitsalarm: Sofortiges Handeln erforderlich."
    },
    "points, indicating significantly increased health risks. Please consider seeking professional medical guidance to develop a comprehensive plan for improving your health. Remember, positive changes can start improving your health immediately.": {
        "en": "points, indicating significantly increased health risks. Please consider seeking professional medical guidance to develop a comprehensive plan for improving your health. Remember, positive changes can start improving your health immediately.",
        "es": "puntos, lo que indica riesgos de salud significativamente aumentados. Por favor considera buscar orientación médica profesional para desarrollar un plan integral para mejorar tu salud. Recuerda, los cambios positivos pueden comenzar a mejorar tu salud inmediatamente.",
        "fr": "points, indiquant des risques de santé considérablement accrus. Veuillez envisager de demander des conseils médicaux professionnels pour développer un plan complet d'amélioration de votre santé. Rappelez-vous, les changements positifs peuvent commencer à améliorer votre santé immédiatement.",
        "de": "Punkte, was auf deutlich erhöhte Gesundheitsrisiken hinweist. Bitte erwägen Sie, professionelle medizinische Beratung einzuholen, um einen umfassenden Plan zur Verbesserung Ihrer Gesundheit zu entwickeln. Denken Sie daran, positive Veränderungen können sofort beginnen, Ihre Gesundheit zu verbessern."
    },

    // Weight Progress tab translations
    "Total Weight Lost:": {
        "en": "Total Weight Lost:",
        "es": "Peso Total Perdido:",
        "fr": "Poids Total Perdu:",
        "de": "Gesamtgewichtsverlust:"
    },
    "Estimated Fat Loss:": {
        "en": "Estimated Fat Loss:",
        "es": "Pérdida de Grasa Estimada:",
        "fr": "Perte de Graisse Estimée:",
        "de": "Geschätzter Fettverlust:"
    },
    "Over": {
        "en": "Over",
        "es": "Durante",
        "fr": "Sur",
        "de": "Über"
    },
    "kg/week average": {
        "en": "kg/week average",
        "es": "kg/semana promedio",
        "fr": "kg/semaine en moyenne",
        "de": "kg/Woche Durchschnitt"
    },
    "Gallstone risk reduction from weight loss": {
        "en": "Gallstone risk reduction from weight loss",
        "es": "Reducción del riesgo de cálculos biliares por pérdida de peso",
        "fr": "Réduction du risque de calculs biliaires grâce à la perte de poids",
        "de": "Gallenstein-Risikoreduktion durch Gewichtsverlust"
    },

    // Phase 4 Total Progress translations
    "of": {
        "en": "of",
        "es": "de",
        "fr": "de",
        "de": "von"
    },
    "to go": {
        "en": "to go",
        "es": "por perder",
        "fr": "à perdre",
        "de": "noch zu verlieren"
    },
    "that's like losing": {
        "en": "that's like losing",
        "es": "eso es como perder",
        "fr": "c'est comme perdre",
        "de": "das ist wie zu verlieren"
    },
    "Completed": {
        "en": "Completed",
        "es": "Completado",
        "fr": "Complété",
        "de": "Abgeschlossen"
    },
    "Remaining": {
        "en": "Remaining",
        "es": "Restante",
        "fr": "Restant",
        "de": "Verbleibend"
    },
    "Achieved": {
        "en": "Achieved",
        "es": "Logrado",
        "fr": "Atteint",
        "de": "Erreicht"
    },
    "10 sticks of butter": {
        "en": "10 sticks of butter",
        "es": "10 barras de mantequilla",
        "fr": "10 bâtonnets de beurre",
        "de": "10 Butterstücke"
    },
    "a pineapple": {
        "en": "a pineapple",
        "es": "una piña",
        "fr": "un ananas",
        "de": "eine Ananas"
    },
    "a newborn baby": {
        "en": "a newborn baby",
        "es": "un bebé recién nacido",
        "fr": "un nouveau-né",
        "de": "ein neugeborenes Baby"
    },
    "a housecat": {
        "en": "a housecat",
        "es": "un gato doméstico",
        "fr": "un chat domestique",
        "de": "eine Hauskatze"
    },
    "a bowling ball": {
        "en": "a bowling ball",
        "es": "una bola de boliche",
        "fr": "une boule de bowling",
        "de": "eine Bowlingkugel"
    },
    "a gallon of paint": {
        "en": "a gallon of paint",
        "es": "un galón de pintura",
        "fr": "un gallon de peinture",
        "de": "ein Eimer Farbe"
    },
    "an air conditioner": {
        "en": "an air conditioner",
        "es": "un aire acondicionado",
        "fr": "un climatiseur",
        "de": "eine Klimaanlage"
    },
    "a medium dog": {
        "en": "a medium dog",
        "es": "un perro mediano",
        "fr": "un chien moyen",
        "de": "ein mittelgroßer Hund"
    },
    "a microwave oven": {
        "en": "a microwave oven",
        "es": "un horno microondas",
        "fr": "un four à micro-ondes",
        "de": "eine Mikrowelle"
    },
    "a full suitcase": {
        "en": "a full suitcase",
        "es": "una maleta llena",
        "fr": "une valise pleine",
        "de": "ein voller Koffer"
    },
    "a small child": {
        "en": "a small child",
        "es": "un niño pequeño",
        "fr": "un petit enfant",
        "de": "ein kleines Kind"
    },
    "a bicycle": {
        "en": "a bicycle",
        "es": "una bicicleta",
        "fr": "un vélo",
        "de": "ein Fahrrad"
    },
    "a large dog": {
        "en": "a large dog",
        "es": "un perro grande",
        "fr": "un grand chien",
        "de": "ein großer Hund"
    },
    "a full-size refrigerator": {
        "en": "a full-size refrigerator",
        "es": "un refrigerador de tamaño completo",
        "fr": "un réfrigérateur pleine grandeur",
        "de": "ein großer Kühlschrank"
    },

    // Quick Look Metrics - Consistency Score
    "Excellent consistency!": {
        "en": "Excellent consistency!",
        "es": "¡Excelente consistencia!",
        "fr": "Excellente cohérence!",
        "de": "Ausgezeichnete Konsistenz!"
    },
    "Great consistency!": {
        "en": "Great consistency!",
        "es": "¡Gran consistencia!",
        "fr": "Grande cohérence!",
        "de": "Tolle Konsistenz!"
    },
    "Keep up the good work!": {
        "en": "Keep up the good work!",
        "es": "¡Sigue así!",
        "fr": "Continuez comme ça!",
        "de": "Weiter so!"
    },
    "Try to log more regularly": {
        "en": "Try to log more regularly",
        "es": "Intenta registrar con más regularidad",
        "fr": "Essayez de vous connecter plus régulièrement",
        "de": "Versuchen Sie, regelmäßiger zu protokollieren"
    },
    "Based on logging frequency and goal progress": {
        "en": "Based on logging frequency and goal progress",
        "es": "Basado en la frecuencia de registro y progreso hacia la meta",
        "fr": "Basé sur la fréquence de journalisation et les progrès vers l'objectif",
        "de": "Basierend auf Protokollierungshäufigkeit und Zielfortschritt"
    },

    // Quick Look Metrics - Next Check-In
    "Log more weights to see predictions": {
        "en": "Log more weights to see predictions",
        "es": "Registra más pesos para ver predicciones",
        "fr": "Enregistrez plus de poids pour voir les prédictions",
        "de": "Protokollieren Sie mehr Gewichte, um Vorhersagen zu sehen"
    },
    "Log more weights to see your score": {
        "en": "Log more weights to see your score",
        "es": "Registra más pesos para ver tu puntuación",
        "fr": "Enregistrez plus de poids pour voir votre score",
        "de": "Protokollieren Sie mehr Gewichte, um Ihren Score zu sehen"
    },
    "📍 You're due for a weigh-in today!": {
        "en": "📍 You're due for a weigh-in today!",
        "es": "📍 ¡Es hora de pesarte hoy!",
        "fr": "📍 Vous devez vous peser aujourd'hui!",
        "de": "📍 Sie sollten sich heute wiegen!"
    },
    "Next weigh-in on": {
        "en": "Next weigh-in on",
        "es": "Próximo pesaje el",
        "fr": "Prochain pesage le",
        "de": "Nächste Wiegung am"
    },
    "Based on your average logging frequency": {
        "en": "Based on your average logging frequency",
        "es": "Basado en tu frecuencia promedio de registro",
        "fr": "Basé sur votre fréquence moyenne de journalisation",
        "de": "Basierend auf Ihrer durchschnittlichen Protokollierungshäufigkeit"
    },

    // Encouragement quotes
    "Small steps, big results": {
        "en": "Small steps, big results",
        "es": "Pequeños pasos, grandes resultados",
        "fr": "Petits pas, grands résultats",
        "de": "Kleine Schritte, große Ergebnisse"
    },
    "Progress, not perfection": {
        "en": "Progress, not perfection",
        "es": "Progreso, no perfección",
        "fr": "Progrès, pas perfection",
        "de": "Fortschritt, nicht Perfektion"
    },
    "Every day is a new opportunity": {
        "en": "Every day is a new opportunity",
        "es": "Cada día es una nueva oportunidad",
        "fr": "Chaque jour est une nouvelle opportunité",
        "de": "Jeder Tag ist eine neue Gelegenheit"
    },
    "You're stronger than you think": {
        "en": "You're stronger than you think",
        "es": "Eres más fuerte de lo que crees",
        "fr": "Vous êtes plus fort que vous ne le pensez",
        "de": "Du bist stärker als du denkst"
    },
    "Consistency is key": {
        "en": "Consistency is key",
        "es": "La consistencia es clave",
        "fr": "La cohérence est la clé",
        "de": "Konsistenz ist der Schlüssel"
    },
    "Believe in yourself": {
        "en": "Believe in yourself",
        "es": "Cree en ti mismo",
        "fr": "Croyez en vous",
        "de": "Glaube an dich selbst"
    },
    "One step at a time": {
        "en": "One step at a time",
        "es": "Un paso a la vez",
        "fr": "Un pas à la fois",
        "de": "Ein Schritt nach dem anderen"
    },
    "Your health is worth it": {
        "en": "Your health is worth it",
        "es": "Tu salud vale la pena",
        "fr": "Votre santé en vaut la peine",
        "de": "Deine Gesundheit ist es wert"
    },
    "Keep pushing forward": {
        "en": "Keep pushing forward",
        "es": "Sigue avanzando",
        "fr": "Continuez à avancer",
        "de": "Weiter vorwärts"
    },
    "You've got this": {
        "en": "You've got this",
        "es": "Tú puedes",
        "fr": "Vous pouvez le faire",
        "de": "Du schaffst das"
    },
    "Stay positive and work hard": {
        "en": "Stay positive and work hard",
        "es": "Mantente positivo y trabaja duro",
        "fr": "Restez positif et travaillez dur",
        "de": "Bleib positiv und arbeite hart"
    },
    "Embrace the journey": {
        "en": "Embrace the journey",
        "es": "Abraza el viaje",
        "fr": "Embrassez le voyage",
        "de": "Umarme die Reise"
    },
    "Celebrate small victories": {
        "en": "Celebrate small victories",
        "es": "Celebra pequeñas victorias",
        "fr": "Célébrez les petites victoires",
        "de": "Feiere kleine Siege"
    },
    "Focus on progress, not setbacks": {
        "en": "Focus on progress, not setbacks",
        "es": "Concéntrate en el progreso, no en los contratiempos",
        "fr": "Concentrez-vous sur les progrès, pas sur les revers",
        "de": "Konzentriere dich auf Fortschritt, nicht auf Rückschläge"
    },
    "Make every day count": {
        "en": "Make every day count",
        "es": "Haz que cada día cuente",
        "fr": "Faites en sorte que chaque jour compte",
        "de": "Mach jeden Tag wertvoll"
    },
    "You are capable of amazing things": {
        "en": "You are capable of amazing things",
        "es": "Eres capaz de cosas increíbles",
        "fr": "Vous êtes capable de choses incroyables",
        "de": "Du bist zu erstaunlichen Dingen fähig"
    },
    "Stay committed to your goals": {
        "en": "Stay committed to your goals",
        "es": "Mantente comprometido con tus objetivos",
        "fr": "Restez engagé envers vos objectifs",
        "de": "Bleib deinen Zielen verpflichtet"
    },
    "Transform your habits, transform your life": {
        "en": "Transform your habits, transform your life",
        "es": "Transforma tus hábitos, transforma tu vida",
        "fr": "Transformez vos habitudes, transformez votre vie",
        "de": "Verändere deine Gewohnheiten, verändere dein Leben"
    },
    "Your future self will thank you": {
        "en": "Your future self will thank you",
        "es": "Tu yo futuro te lo agradecerá",
        "fr": "Votre futur vous remerciera",
        "de": "Dein zukünftiges Ich wird dir danken"
    },
    "Health is wealth": {
        "en": "Health is wealth",
        "es": "La salud es riqueza",
        "fr": "La santé c'est la richesse",
        "de": "Gesundheit ist Reichtum"
    },
    "Strive for progress, not perfection": {
        "en": "Strive for progress, not perfection",
        "es": "Esfuérzate por el progreso, no por la perfección",
        "fr": "Efforcez-vous pour le progrès, pas pour la perfection",
        "de": "Strebe nach Fortschritt, nicht nach Perfektion"
    },
    "Believe you can and you're halfway there": {
        "en": "Believe you can and you're halfway there",
        "es": "Cree que puedes y estarás a mitad de camino",
        "fr": "Croyez que vous pouvez et vous êtes à mi-chemin",
        "de": "Glaube, dass du es kannst, und du bist schon halb da"
    },
    "The only bad workout is the one that didn't happen": {
        "en": "The only bad workout is the one that didn't happen",
        "es": "El único mal entrenamiento es el que no sucedió",
        "fr": "Le seul mauvais entraînement est celui qui n'a pas eu lieu",
        "de": "Das einzige schlechte Training ist das, das nicht stattfand"
    },
    "Push yourself, because no one else is going to do it for you": {
        "en": "Push yourself, because no one else is going to do it for you",
        "es": "Empújate, porque nadie más lo hará por ti",
        "fr": "Poussez-vous, car personne d'autre ne le fera pour vous",
        "de": "Fordere dich selbst heraus, denn niemand sonst wird es für dich tun"
    },
    "Success is the sum of small efforts repeated day in and day out": {
        "en": "Success is the sum of small efforts repeated day in and day out",
        "es": "El éxito es la suma de pequeños esfuerzos repetidos día tras día",
        "fr": "Le succès est la somme de petits efforts répétés jour après jour",
        "de": "Erfolg ist die Summe kleiner Anstrengungen, die Tag für Tag wiederholt werden"
    }
};

// Get current language from localStorage or default to English
function getCurrentLanguage() {
    return localStorage.getItem('language') || 'en';
}

// Translate a single text key
function t(key) {
    const lang = getCurrentLanguage();
    if (translations[key] && translations[key][lang]) {
        return translations[key][lang];
    }
    // Fallback to English or return the key itself
    return translations[key]?.en || key;
}

// Make translation function globally available
window.t = t;
window.getCurrentLanguage = getCurrentLanguage;