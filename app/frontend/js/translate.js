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

    // BMI and health metrics
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
    "(High)": {
        "en": "(High)",
        "es": "(Alto)",
        "fr": "(Élevé)",
        "de": "(Hoch)"
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

    // Additional health messages from health.js (lines 222-302)
    "With a": {
        "en": "With a",
        "es": "Con una",
        "fr": "Avec un",
        "de": "Mit einem"
    },
    "Your": {
        "en": "Your",
        "es": "Tu",
        "fr": "Votre",
        "de": "Ihr"
    },
    "A": {
        "en": "A",
        "es": "Un",
        "fr": "Un",
        "de": "Ein"
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
    },
    "Started at {start}, now {now}: {diff} lost, {pct}% of your starting weight.": {
        "en": "Started at {start}, now {now}: {diff} lost, {pct}% of your starting weight.",
        "es": "Empezaste con {start} y ahora pesas {now}: has perdido {diff}, el {pct} % de tu peso inicial.",
        "fr": "Au départ : {start} ; aujourd'hui : {now}. Vous avez perdu {diff}, soit {pct} % de votre poids de départ.",
        "de": "Start: {start}, jetzt: {now}. Das sind {diff} weniger, {pct} % Ihres Startgewichts."
    },
    "Started at {start}, now {now}: {diff} gained.": {
        "en": "Started at {start}, now {now}: {diff} gained.",
        "es": "Empezaste con {start} y ahora pesas {now}: has ganado {diff}.",
        "fr": "Au départ : {start} ; aujourd'hui : {now}. Vous avez pris {diff}.",
        "de": "Start: {start}, jetzt: {now}. Das sind {diff} mehr."
    },
    "BMI: {start} at the start, {now} now.": {
        "en": "BMI: {start} at the start, {now} now.",
        "es": "IMC: {start} al empezar, {now} ahora.",
        "fr": "IMC : {start} au départ, {now} aujourd'hui.",
        "de": "BMI: {start} zu Beginn, jetzt {now}."
    },
    "You have lost more than 5% of your starting weight.": {
        "en": "You have lost more than 5% of your starting weight.",
        "es": "Has perdido más del 5 % de tu peso inicial.",
        "fr": "Vous avez perdu plus de 5 % de votre poids de départ.",
        "de": "Sie haben mehr als 5 % Ihres Startgewichts verloren."
    },
    "{diff} more to reach 5% of your starting weight.": {
        "en": "{diff} more to reach 5% of your starting weight.",
        "es": "Te faltan {diff} para haber perdido el 5 % de tu peso inicial.",
        "fr": "Encore {diff} à perdre pour atteindre 5 % de votre poids de départ.",
        "de": "Noch {diff}, bis Sie 5 % Ihres Startgewichts verloren haben."
    },
    "Current BMI: {bmi} ({cat})": {
        "en": "Current BMI: {bmi} ({cat})",
        "es": "IMC actual: {bmi} ({cat})",
        "fr": "IMC actuel : {bmi} ({cat})",
        "de": "Aktueller BMI: {bmi} ({cat})"
    },
    "At the start: {bmi}": {
        "en": "At the start: {bmi}",
        "es": "Al empezar: {bmi}",
        "fr": "Au départ : {bmi}",
        "de": "Zu Beginn: {bmi}"
    },
    "Adjusted for your body frame: {bmi} ({cat}). This is a rough adjustment made by this app, not a standard measure.": {
        "en": "Adjusted for your body frame: {bmi} ({cat}). This is a rough adjustment made by this app, not a standard measure.",
        "es": "Ajustado a tu constitución corporal: {bmi} ({cat}). Es un ajuste aproximado que hace esta aplicación, no una medida estándar.",
        "fr": "Ajusté à votre corpulence : {bmi} ({cat}). Il s'agit d'un ajustement approximatif propre à cette application, pas d'une mesure standard.",
        "de": "An Ihren Körperbau angepasst: {bmi} ({cat}). Das ist eine grobe Anpassung dieser App, kein Standardmaß."
    },
    "WHO categories for adults: 25 or more is overweight, 30 or more is obesity.": {
        "en": "WHO categories for adults: 25 or more is overweight, 30 or more is obesity.",
        "es": "Categorías de la OMS para adultos: 25 o más es sobrepeso; 30 o más, obesidad.",
        "fr": "Catégories de l'OMS pour les adultes : 25 ou plus correspond au surpoids, 30 ou plus à l'obésité.",
        "de": "WHO-Kategorien für Erwachsene: ab 25 Übergewicht, ab 30 Adipositas."
    },
    "Underweight": {
        "en": "Underweight",
        "es": "Bajo peso",
        "fr": "Insuffisance pondérale",
        "de": "Untergewicht"
    },
    "Healthy weight": {
        "en": "Healthy weight",
        "es": "Peso saludable",
        "fr": "Poids normal",
        "de": "Normalgewicht"
    },
    "Overweight": {
        "en": "Overweight",
        "es": "Sobrepeso",
        "fr": "Surpoids",
        "de": "Übergewicht"
    },
    "Obese": {
        "en": "Obese",
        "es": "Obesidad",
        "fr": "Obésité",
        "de": "Adipositas"
    },
    "Deurenberg formula (BMI and age). The range runs from the result for men to the result for women. For adults it is usually within about 4 percentage points of a lab measurement, and it slightly overestimates body fat in people with obesity.": {
        "en": "Deurenberg formula (BMI and age). The range runs from the result for men to the result for women. For adults it is usually within about 4 percentage points of a lab measurement, and it slightly overestimates body fat in people with obesity.",
        "es": "Fórmula de Deurenberg (IMC y edad). El rango va del resultado para hombres al resultado para mujeres. En adultos, suele diferir como máximo unos 4 puntos porcentuales de una medición de laboratorio, y sobrestima ligeramente la grasa corporal en personas con obesidad.",
        "fr": "Formule de Deurenberg (IMC et âge). La fourchette va du résultat pour les hommes au résultat pour les femmes. Chez l'adulte, l'écart avec une mesure en laboratoire ne dépasse généralement pas 4 points de pourcentage environ, et la formule surestime légèrement la masse grasse en cas d'obésité.",
        "de": "Deurenberg-Formel (BMI und Alter). Der Bereich reicht vom Ergebnis für Männer bis zum Ergebnis für Frauen. Bei Erwachsenen weicht sie meist um höchstens etwa 4 Prozentpunkte von einer Labormessung ab und überschätzt das Körperfett bei Menschen mit Adipositas leicht."
    },
    "Add your age on the Data tab to estimate body fat.": {
        "en": "Add your age on the Data tab to estimate body fat.",
        "es": "Añade tu edad en la pestaña Datos para estimar la grasa corporal.",
        "fr": "Indiquez votre âge dans l'onglet Données pour estimer votre masse grasse.",
        "de": "Geben Sie im Tab „Daten“ Ihr Alter an, damit Ihr Körperfett geschätzt werden kann."
    },
    "Hamwi's 1964 rule of thumb, from the value for women to the value for men of your height. A rough guide, not a health target.": {
        "en": "Hamwi's 1964 rule of thumb, from the value for women to the value for men of your height. A rough guide, not a health target.",
        "es": "Regla práctica de Hamwi (1964): va del valor para mujeres al valor para hombres de tu altura. Es una guía aproximada, no un objetivo de salud.",
        "fr": "Règle empirique de Hamwi (1964), de la valeur pour les femmes à la valeur pour les hommes de votre taille. C'est un repère approximatif, pas un objectif de santé.",
        "de": "Faustregel nach Hamwi (1964), vom Wert für Frauen bis zum Wert für Männer Ihrer Größe. Ein grober Richtwert, kein Gesundheitsziel."
    },
    "A common rule of thumb is that about three-quarters of weight lost by dieting is fat. It varies a lot between people, and exercise tends to reduce the share of lean tissue lost.": {
        "en": "A common rule of thumb is that about three-quarters of weight lost by dieting is fat. It varies a lot between people, and exercise tends to reduce the share of lean tissue lost.",
        "es": "Una regla práctica habitual es que alrededor de tres cuartas partes del peso que se pierde haciendo dieta son grasa. Varía mucho de una persona a otra, y el ejercicio suele reducir la parte de tejido magro que se pierde.",
        "fr": "Selon une règle empirique courante, environ les trois quarts du poids perdu grâce à un régime correspondent à de la graisse. Cela varie beaucoup d'une personne à l'autre, et l'exercice tend à réduire la part de masse maigre perdue.",
        "de": "Eine gängige Faustregel besagt, dass etwa drei Viertel des durch eine Diät verlorenen Gewichts Fett sind. Das ist von Person zu Person sehr unterschiedlich, und Bewegung verringert meist den Anteil an verlorener fettfreier Masse."
    },
    "Your average since you started: {rate} per week.": {
        "en": "Your average since you started: {rate} per week.",
        "es": "Tu promedio desde que empezaste: {rate} por semana.",
        "fr": "Votre moyenne depuis le début : {rate} par semaine.",
        "de": "Ihr Durchschnitt seit Beginn: {rate} pro Woche."
    },
    "Edit mode: change the values and save to update this entry": {
        "en": "Edit mode: change the values and save to update this entry",
        "es": "Modo de edición: cambia los valores y guarda para actualizar este registro",
        "fr": "Mode édition : modifiez les valeurs et enregistrez pour mettre à jour cette entrée",
        "de": "Bearbeitungsmodus: Ändern Sie die Werte und speichern Sie, um diesen Eintrag zu aktualisieren"
    },
    "Weight entry updated": {
        "en": "Weight entry updated",
        "es": "Registro de peso actualizado",
        "fr": "Pesée mise à jour",
        "de": "Gewichtseintrag aktualisiert"
    },
    "Failed to update weight entry": {
        "en": "Failed to update weight entry",
        "es": "No se pudo actualizar el registro de peso",
        "fr": "Impossible de mettre à jour la pesée",
        "de": "Gewichtseintrag konnte nicht aktualisiert werden"
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