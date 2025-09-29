<?php
// Test calling auth_gatekeeper directly (not through nginx auth_request)
set_time_limit(10);

echo "Test 1: Starting direct auth test\n";
flush();

echo "Test 2: Loading AuthManager\n";
flush();
require_once('/var/app/backend/AuthManager.php');

echo "Test 3: Calling isLoggedIn()\n";
flush();

$startTime = microtime(true);
$result = AuthManager::isLoggedIn();
$endTime = microtime(true);

echo "Test 4: isLoggedIn() returned: " . ($result ? 'TRUE' : 'FALSE') . "\n";
echo "Test 5: Execution time: " . round(($endTime - $startTime) * 1000, 2) . "ms\n";

if ($result) {
    http_response_code(200);
    echo "Test 6: Would return 200\n";
} else {
    http_response_code(403);
    echo "Test 6: Would return 403\n";
}
?>