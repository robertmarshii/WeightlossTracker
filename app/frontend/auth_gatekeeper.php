<?php
// Authentication gatekeeper for nginx auth_request
// Returns 200 for authenticated users, 403 for unauthenticated

require_once('/var/app/backend/AuthManager.php');

if (AuthManager::isLoggedIn()) {
    http_response_code(200);
    exit;
} else {
    http_response_code(403);
    exit;
}
?>