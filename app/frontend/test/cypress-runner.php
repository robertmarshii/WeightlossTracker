<?php
// Simple bridge to trigger and read Cypress runs from the UI.
// This writes a trigger file the local Node watcher picks up, and
// exposes latest results/status for the UI to poll.

header('Content-Type: application/json');

$action = $_REQUEST['action'] ?? '';
// Place trigger and results inside the mapped frontend test directory so both
// PHP (in-container) and the local Node watcher can see them.
$triggerFile = __DIR__ . DIRECTORY_SEPARATOR . 'cypress-trigger.json';
$statusFile = __DIR__ . DIRECTORY_SEPARATOR . 'status.json';
$lastJson = __DIR__ . DIRECTORY_SEPARATOR . 'last.json';
$specsFile = __DIR__ . DIRECTORY_SEPARATOR . 'specs.json';

function ok($data = []) { echo json_encode(['success' => true] + $data); exit; }
function fail($msg, $data = []) { http_response_code(400); echo json_encode(['success' => false, 'message' => $msg] + $data); exit; }

if ($action === 'start') {
    $spec = $_POST['spec'] ?? 'cypress/e2e/*.cy.js';
    // Debounce: if a run is already in progress, do not enqueue another
    $status = ['state' => 'idle'];
    if (file_exists($statusFile)) {
        $data = json_decode(@file_get_contents($statusFile), true) ?: [];
        if (is_array($data) && !empty($data['state'])) { $status = $data; }
    }
    if (($status['state'] ?? '') === 'running') {
        ok(['message' => 'Cypress already running; trigger ignored', 'status' => $status]);
    }
    $payload = [
        'ts' => time(),
        'spec' => $spec,
    ];
    if (!is_dir(dirname($triggerFile))) {
        @mkdir(dirname($triggerFile), 0777, true);
    }
    file_put_contents($triggerFile, json_encode($payload, JSON_PRETTY_PRINT));
    ok(['message' => 'Trigger written', 'payload' => $payload]);
}

if ($action === 'status') {
    $status = ['state' => 'idle'];
    if (file_exists($statusFile)) {
        $data = json_decode(@file_get_contents($statusFile), true) ?: [];
        if (is_array($data)) { $status = $data; }
    }
    $debug = [
        'trigger_pending' => file_exists($triggerFile),
        'trigger_mtime' => file_exists($triggerFile) ? @filemtime($triggerFile) : null,
        'status_mtime' => file_exists($statusFile) ? @filemtime($statusFile) : null,
    ];
    ok(['status' => $status, 'debug' => $debug]);
}

if ($action === 'results') {
    if (file_exists($lastJson)) {
        $json = file_get_contents($lastJson);
        echo $json; // pass-through raw Cypress JSON reporter output
        exit;
    } else {
        ok(['message' => 'No results available']);
    }
}

if ($action === 'specs') {
    if (file_exists($specsFile)) {
        $json = file_get_contents($specsFile);
        header('Content-Type: application/json');
        echo $json;
        exit;
    }
    // Fallback: no specs discovered (watcher not running)
    ok(['message' => 'No specs available (start the local watcher: npm run ui:cypress:watch)', 'specs' => []]);
}

fail('Unknown action');
