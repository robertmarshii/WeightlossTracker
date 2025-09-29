<?php
/**
 * Simple PHP Code Coverage Logger
 * Tracks function/method calls to identify untested code paths
 */

class CoverageLogger {
    private static $instance = null;
    private $functionCalls = [];
    private $enabled = false;
    private $sessionId;
    private $logFile;
    private $recursionGuard = [];
    private $lastSaveTime = 0;
    private $errorCount = 0;
    private $maxErrors = 10; // Circuit breaker: disable after 10 errors

    private function __construct() {
        // Only enable when explicitly requested via URL parameter ?coverage=1 or when forced by tests
        $isCoverageMode = (isset($_GET['coverage']) && $_GET['coverage'] === '1') ||
                         (isset($_POST['coverage']) && $_POST['coverage'] === '1') ||
                         (isset($_SERVER['HTTP_USER_AGENT']) && strpos($_SERVER['HTTP_USER_AGENT'], 'Cypress') !== false);
        $isTestEnvironment = ($_SERVER['HTTP_HOST'] ?? '') === '127.0.0.1:8111';
        $this->enabled = $isCoverageMode && $isTestEnvironment;
        $this->sessionId = time() . '_' . uniqid();
        $this->logFile = '/var/app/backend/coverage.log';
        
        error_log("CoverageLogger initialized. Enabled: " . ($this->enabled ? 'true' : 'false') . 
                 ". Host: " . ($_SERVER['HTTP_HOST'] ?? 'unknown'));
        
        // Load existing coverage data from file
        $this->loadCoverageData();
    }

    public static function getInstance() {
        // Self-track this method call
        if (isset(self::$instance)) {
            try { self::$instance->logFunction('getInstance', __CLASS__, __FILE__, __LINE__); } catch (Exception $e) {}
        }
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Log a function or method call
     * @param string $functionName Name of function/method
     * @param string $className Class name (for methods)
     * @param string $fileName File name
     * @param int $lineNumber Line number
     * @param array $context Additional context information
     */
    public function logFunction($functionName, $className = null, $fileName = null, $lineNumber = null, $context = []) {
        // Critical safety measure: Prevent infinite recursion
        $guardKey = $functionName . '::' . ($className ?? 'global');
        if (isset($this->recursionGuard[$guardKey])) {
            return; // Skip if already in recursion to prevent crashes
        }
        $this->recursionGuard[$guardKey] = true;
        
        try {
            error_log("logFunction called: {$className}::{$functionName}. Enabled: " . ($this->enabled ? 'true' : 'false'));
            
            if (!$this->enabled) {
                error_log("Coverage logging disabled");
                return;
            }

            $fileName = $fileName ?? $this->getCallerFile();
            $key = $className ? "{$className}::{$functionName}" : $functionName;
            $fullKey = "{$fileName}:{$key}";

            if (!isset($this->functionCalls[$fullKey])) {
                $this->functionCalls[$fullKey] = [
                    'function' => $functionName,
                    'class' => $className,
                    'file' => basename($fileName),
                    'fullFile' => $fileName,
                    'line' => $lineNumber,
                    'callCount' => 0,
                    'firstCalled' => date('Y-m-d H:i:s'),
                    'lastCalled' => date('Y-m-d H:i:s'),
                    'contexts' => [],
                    'stackTraces' => [],
                    'requestData' => []
                ];
                error_log("Added new function to coverage: {$fullKey}");
            }

            $this->functionCalls[$fullKey]['callCount']++;
            $this->functionCalls[$fullKey]['lastCalled'] = date('Y-m-d H:i:s');

            // Store context and request information
            if (!empty($context)) {
                $this->functionCalls[$fullKey]['contexts'][] = [
                    'timestamp' => date('Y-m-d H:i:s'),
                    'data' => $context
                ];
            }

            // Store request data for analysis
            $this->functionCalls[$fullKey]['requestData'][] = [
                'timestamp' => date('Y-m-d H:i:s'),
                'method' => $_SERVER['REQUEST_METHOD'] ?? 'unknown',
                'uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
                'userAgent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
                'remoteAddr' => $_SERVER['REMOTE_ADDR'] ?? 'unknown'
            ];

            // Store simplified stack trace
            $this->functionCalls[$fullKey]['stackTraces'][] = $this->getStackTrace();
            
            error_log("Updated function coverage: {$fullKey} (calls: {$this->functionCalls[$fullKey]['callCount']})");

            // Save coverage data occasionally to prevent excessive I/O
            if (time() - $this->lastSaveTime > 2) { // Only save every 2 seconds
                $this->saveCoverageData();
                $this->lastSaveTime = time();
            }

            // Log to file occasionally
            if (rand(1, 10) === 1) { // 10% sampling
                $this->writeToLog($fullKey, $this->functionCalls[$fullKey]);
            }
        } catch (Exception $e) {
            // Circuit breaker: disable coverage logging if too many errors
            $this->errorCount++;
            error_log("CoverageLogger::logFunction error #{$this->errorCount}: " . $e->getMessage());
            
            if ($this->errorCount >= $this->maxErrors) {
                $this->enabled = false;
                error_log("CoverageLogger DISABLED due to too many errors ({$this->errorCount}). This prevents application crashes.");
            }
        } finally {
            // Always clear recursion guard to prevent memory leaks
            unset($this->recursionGuard[$guardKey]);
        }
    }

    /**
     * Load coverage data from persistent storage
     */
    private function loadCoverageData() {
        if (!$this->enabled) return;
        
        $dataFile = '/var/app/backend/coverage-data.json';
        if (file_exists($dataFile)) {
            $data = json_decode(file_get_contents($dataFile), true);
            if (is_array($data)) {
                $this->functionCalls = $data['functions'] ?? [];
                $this->sessionId = $data['sessionId'] ?? $this->sessionId;
                error_log("Loaded coverage data: " . count($this->functionCalls) . " functions");
            }
        }
    }
    
    /**
     * Save coverage data to persistent storage
     */
    private function saveCoverageData() {
        if (!$this->enabled) return;
        
        // Additional safety: Prevent saving too frequently
        static $saveCount = 0;
        $saveCount++;
        // Temporarily disabled rate limiting to capture DatabaseSeeder functions
        // if ($saveCount % 2 !== 0) return; // Only save every 2nd call
        
        $dataFile = '/var/app/backend/coverage-data.json';
        $data = [
            'sessionId' => $this->sessionId,
            'functions' => $this->functionCalls,
            'lastUpdated' => date('Y-m-d H:i:s')
        ];
        
        @file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT), LOCK_EX);
    }

    /**
     * Get the file that called the coverage logger
     */
    private function getCallerFile() {
        // Skip recursion check for this internal method
        try {
            $backtrace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 3);
            if (empty($backtrace) || count($backtrace) < 3) {
                return 'unknown';
            }
            return $backtrace[2]['file'] ?? 'unknown';
        } catch (Exception $e) {
            return 'unknown';
        }
    }

    /**
     * Get a simplified stack trace for debugging
     */
    private function getStackTrace() {
        try {
            $backtrace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 6);
            $trace = [];

            for ($i = 2; $i < min(6, count($backtrace)); $i++) {
                $frame = $backtrace[$i];
                $class = $frame['class'] ?? '';
                $function = $frame['function'] ?? '';
                $file = basename($frame['file'] ?? '');
                $line = $frame['line'] ?? '';

                if (!empty($class)) {
                    $trace[] = "{$class}::{$function}() in {$file}:{$line}";
                } else {
                    $trace[] = "{$function}() in {$file}:{$line}";
                }
            }

            return implode(' → ', $trace);
        } catch (Exception $e) {
            return 'trace_unavailable';
        }
    }

    /**
     * Write coverage data to log file
     */
    private function writeToLog($key, $data) {
        $logEntry = [
            'session' => $this->sessionId,
            'timestamp' => date('Y-m-d H:i:s'),
            'function' => $key,
            'data' => $data
        ];

        $logLine = json_encode($logEntry) . "\n";
        @file_put_contents($this->logFile, $logLine, FILE_APPEND | LOCK_EX);
    }

    /**
     * Get coverage report
     */
    public function getReport() {
        $this->logFunction('getReport', __CLASS__, __FILE__, __LINE__);
        error_log("getReport called. Function count: " . count($this->functionCalls));

        // Analyze coverage statistics
        $stats = [
            'totalFunctions' => count($this->functionCalls),
            'totalCalls' => 0,
            'byClass' => [],
            'byFile' => [],
            'mostCalled' => null,
            'maxCalls' => 0
        ];

        foreach ($this->functionCalls as $key => $data) {
            $stats['totalCalls'] += $data['callCount'];

            // Track by class
            $className = $data['class'] ?? 'global';
            if (!isset($stats['byClass'][$className])) {
                $stats['byClass'][$className] = ['count' => 0, 'calls' => 0];
            }
            $stats['byClass'][$className]['count']++;
            $stats['byClass'][$className]['calls'] += $data['callCount'];

            // Track by file
            $fileName = $data['file'];
            if (!isset($stats['byFile'][$fileName])) {
                $stats['byFile'][$fileName] = ['count' => 0, 'calls' => 0];
            }
            $stats['byFile'][$fileName]['count']++;
            $stats['byFile'][$fileName]['calls'] += $data['callCount'];

            // Track most called function
            if ($data['callCount'] > $stats['maxCalls']) {
                $stats['maxCalls'] = $data['callCount'];
                $stats['mostCalled'] = $key;
            }
        }

        return [
            'sessionId' => $this->sessionId,
            'totalFunctions' => count($this->functionCalls),
            'functions' => $this->functionCalls,
            'statistics' => $stats,
            'generatedAt' => date('Y-m-d H:i:s'),
            'environment' => [
                'host' => $_SERVER['HTTP_HOST'] ?? 'unknown',
                'serverSoftware' => $_SERVER['SERVER_SOFTWARE'] ?? 'unknown',
                'phpVersion' => PHP_VERSION
            ]
        ];
    }

    /**
     * Export coverage report as JSON
     */
    public function exportReport() {
        $this->logFunction('exportReport', __CLASS__, __FILE__, __LINE__);
        $report = $this->getReport();
        
        header('Content-Type: application/json');
        header('Content-Disposition: attachment; filename="php-coverage-' . $this->sessionId . '.json"');
        
        echo json_encode($report, JSON_PRETTY_PRINT);
        exit;
    }

    /**
     * Display coverage report in error log
     */
    public function logReport() {
        $this->logFunction('logReport', __CLASS__, __FILE__, __LINE__);
        $report = $this->getReport();
        error_log("PHP Coverage Report: " . json_encode($report));
    }
    
    /**
     * Clear all coverage data
     */
    public function clearCoverage() {
        $this->logFunction('clearCoverage', __CLASS__, __FILE__, __LINE__);
        $this->functionCalls = [];
        $this->sessionId = time() . '_' . uniqid();
        $this->saveCoverageData();
        error_log("Coverage data cleared");
    }
}

/**
 * Helper function to log function calls
 * Usage: coverage_log(__FUNCTION__, __CLASS__, __FILE__, __LINE__);
 */
if (!function_exists('coverage_log')) {
    function coverage_log($function = 'unknown', $class = null, $file = null, $line = null) {
        try {
            CoverageLogger::getInstance()->logFunction($function, $class, $file, $line);
        } catch (Exception $e) {
            error_log("coverage_log error: " . $e->getMessage());
        }
    }
}

/**
 * Macro for easy logging at function start
 * Usage: COVERAGE_LOG();
 */
if (!function_exists('COVERAGE_LOG')) {
    function COVERAGE_LOG($function = null, $class = null, $file = null, $line = null) {
        try {
            // If explicit parameters provided, use them
            if ($function !== null) {
                CoverageLogger::getInstance()->logFunction($function, $class, $file, $line);
                return;
            }
            
            // Fallback to backtrace if no parameters provided
            $backtrace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 3);
            
            if (empty($backtrace)) {
                return;
            }
            
            // Get the calling function (skip COVERAGE_LOG itself)
            $caller = $backtrace[1] ?? null;
            if (!$caller) {
                return;
            }
            
            $function = $caller['function'] ?? 'unknown';
            $class = $caller['class'] ?? null;
            $file = $caller['file'] ?? null;
            $line = $caller['line'] ?? null;
            
            // Always pass all required parameters to the logger
            CoverageLogger::getInstance()->logFunction($function, $class, $file, $line);
        } catch (Exception $e) {
            // Silently ignore coverage logging errors to prevent breaking the application
            error_log("Coverage logging error: " . $e->getMessage());
        }
    }
}