<?php
/**
 * Coverage Logger Endpoint
 * Receives JavaScript coverage data
 */

// Only allow in development
if (($_SERVER['HTTP_HOST'] ?? '') !== '127.0.0.1:8111') {
    http_response_code(404);
    exit;
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Log JavaScript coverage data
$logFile = '/var/app/coverage-js.log';
$logEntry = [
    'timestamp' => date('Y-m-d H:i:s'),
    'type' => 'javascript',
    'data' => $input
];

$logLine = json_encode($logEntry) . "\n";
@file_put_contents($logFile, $logLine, FILE_APPEND | LOCK_EX);

echo json_encode(['status' => 'logged']);
?>