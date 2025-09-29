<?php
// Test the exact SQL query that's causing the hang
set_time_limit(10);

require_once('/var/app/backend/Config.php');

try {
    $db = Database::getInstance()->getDbConnection();
    $schema = Database::getSchema();

    echo "Testing query on schema: $schema\n";

    // Test if remember_token_expires column exists
    $stmt = $db->prepare("SELECT column_name FROM information_schema.columns WHERE table_schema = ? AND table_name = 'users' AND column_name = 'remember_token_expires'");
    $stmt->execute([$schema]);
    $column = $stmt->fetch();

    if ($column) {
        echo "remember_token_expires column EXISTS\n";

        // Test the actual query from AuthManager
        $stmt = $db->prepare("SELECT * FROM {$schema}.users WHERE id = ? AND remember_token = ? AND remember_token_expires > NOW()");
        $stmt->execute([1, 'test_token']);
        echo "Query executed successfully\n";
    } else {
        echo "remember_token_expires column MISSING\n";
    }

} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>