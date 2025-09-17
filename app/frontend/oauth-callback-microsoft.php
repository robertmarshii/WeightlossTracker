<?php
// Microsoft OAuth callback endpoint (no query parameters allowed)
require_once('/var/app/backend/OAuthManager.php');

// Get parameters from URL
$code = $_GET['code'] ?? '';
$state = $_GET['state'] ?? '';

if ($code && $state) {
    $result = OAuthManager::handleCallback('microsoft', $code, $state);
    if ($result['success']) {
        // Redirect to dashboard on success
        header('Location: dashboard.php');
        exit;
    } else {
        // Redirect to index with error
        header('Location: index.php?error=' . urlencode($result['message']));
        exit;
    }
} else {
    header('Location: index.php?error=' . urlencode('Invalid OAuth callback parameters'));
    exit;
}
?>