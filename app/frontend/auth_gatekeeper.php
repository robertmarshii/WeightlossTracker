<?php
// Authentication gatekeeper for nginx auth_request
// Returns 200 for authenticated users, 403 for unauthenticated (nginx handles redirect)

require_once('/var/app/backend/AuthManager.php');

if (AuthManager::isLoggedIn()) {
    http_response_code(200);
    exit;
} else {
    // Return 403 - nginx will catch this and redirect via @login_redirect
    http_response_code(403);
    exit;
}
?>