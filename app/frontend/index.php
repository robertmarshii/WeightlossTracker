<?php
// Public website: home, features, how it works, about, FAQ, BMI calculator and sign-in, in English
// (/, /features ...) and German, Spanish and French (/de/, /es/features ...). nginx sends those paths here;
// text lives in site/lang/*.json and the page templates in site/pages/.
require_once __DIR__ . '/site/Site.php';
$s = Site::fromPath((string) parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH));
$withCard = in_array($s->page, ['home', 'login'], true);

// Signed-in visitors go straight to the dashboard from the home and sign-in pages.
// Only checked when the visitor already has a session or remember-me cookie, so first-time visitors
// (and crawlers) get no session cookie and a cacheable page.
if ($withCard) {
    require_once('/var/app/backend/AuthManager.php');
    if ((isset($_COOKIE[session_name()]) || isset($_COOKIE['remember_token'])) && AuthManager::isLoggedIn()) {
        header('Location: /dashboard.php');
        exit;
    }
}

header('Content-Language: ' . $s->htmlLang());
ob_start();
include __DIR__ . '/site/pages/' . $s->page . '.php';
$content = ob_get_clean();
include __DIR__ . '/site/layout.php';
