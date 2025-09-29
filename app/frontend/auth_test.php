<?php
// Test auth components individually to find where the hang occurs
set_time_limit(10);

echo "Test 1: Starting\n";
flush();

try {
    echo "Test 2: Starting session\n";
    flush();
    session_start();

    echo "Test 3: Session started\n";
    flush();

    echo "Test 4: Loading AuthManager\n";
    flush();
    require_once('/var/app/backend/AuthManager.php');

    echo "Test 5: AuthManager loaded\n";
    flush();

    echo "Test 6: Checking session vars\n";
    flush();
    $hasSession = isset($_SESSION['user_id']) ? 'YES' : 'NO';
    echo "Has session: $hasSession\n";
    flush();

    echo "Test 7: Checking cookies\n";
    flush();
    $hasCookie = isset($_COOKIE['remember_token']) ? 'YES' : 'NO';
    echo "Has remember cookie: $hasCookie\n";
    flush();

    if (isset($_COOKIE['remember_token'])) {
        echo "Test 8: Loading Database class\n";
        flush();
        require_once('/var/app/backend/Config.php');

        echo "Test 9: Getting Database instance\n";
        flush();
        $db = Database::getInstance();

        echo "Test 10: Getting connection\n";
        flush();
        $connection = $db->getDbConnection();

        echo "Test 11: Getting schema\n";
        flush();
        $schema = Database::getSchema();
        echo "Schema: $schema\n";
        flush();
    }

    echo "Test COMPLETE\n";

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>