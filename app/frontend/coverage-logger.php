<?php
/**
 * Batch Coverage Logger Endpoint
 * Receives JavaScript coverage data in batches to reduce server load
 */

// Only allow in development
if (($_SERVER['HTTP_HOST'] ?? '') !== '127.0.0.1:8111') {
    http_response_code(404);
    exit;
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    // Handle batch coverage data
    $session = $input['session'] ?? 'unknown';
    $totalFunctions = $input['totalFunctions'] ?? 0;
    $functions = $input['functions'] ?? [];

    // Log batch data (reduced logging frequency)
    $logFile = '/var/app/coverage-js-batch.log';
    $logEntry = [
        'timestamp' => date('Y-m-d H:i:s'),
        'session' => $session,
        'batch_size' => $totalFunctions,
        'functions_received' => count($functions),
        'type' => 'batch'
    ];

    $logLine = json_encode($logEntry) . "\n";
    @file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);

    // Save latest batch data to JSON file for easy reading
    $dataFile = '/var/app/frontend-coverage-latest.json';
    $data = [
        'lastUpdate' => date('Y-m-d H:i:s'),
        'session' => $session,
        'functions' => $functions,
        'totalFunctions' => count($functions),
        'timestamp' => $input['timestamp'] ?? date('c')
    ];

    @file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));

    // Success response
    echo json_encode([
        'status' => 'batch_logged',
        'received' => count($functions),
        'session' => $session,
        'timestamp' => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    error_log("Coverage batch logger error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
?>