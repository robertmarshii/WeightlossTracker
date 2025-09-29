<?php
session_start();
require_once('/var/app/backend/AuthManager.php');

// Check if user is logged in, redirect to index if not
if (!AuthManager::isLoggedIn()) {
    header('Location: ../index.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Interface - WeightLoss Tracker</title>
    <!-- Jquery -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    <!-- Boostrap -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
    <!-- Schema Logger -->
    <script src="../schema-logger.js"></script>
    
    <style>
        .test-card {
            margin: 20px 0;
            transition: all 0.3s ease;
        }
        .test-card:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,.25);
        }
        .status-indicator {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 10px;
        }
        .status-success { background-color: #28a745; }
        .status-error { background-color: #dc3545; }
        .status-running { background-color: #ffc107; animation: pulse 1s infinite; }
        .status-idle { background-color: #6c757d; }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .result-container {
            max-height: 300px;
            overflow-y: auto;
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 0.25rem;
            padding: 0.75rem;
            font-family: monospace;
            font-size: 0.875rem;
        }
        
        .card-title h5 {
            font-size: 1.1rem;
        }
        /* Tighter spacing for dynamic Cypress spec list */
        #specs-list .list-group-item { padding: .25rem; }
    </style>
</head>

<body>
    <div class="container mt-5">
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-end align-items-center mb-3">
                    <a id="back-home" href="#" class="btn btn-outline-primary">
                        <i class="fa fa-arrow-left"></i> Back to Home
                    </a>
                </div>
                <div id="alert-container"></div>
                
                <h3 class="mt-4 mb-3">
                    <i class="fa fa-flask"></i> Tests
                </h3>
                
                <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <h5 class="mb-0"><i class="fa fa-list"></i> Cypress Specs (npm run ui:cypress:watch)</h5>
                        <div>
                          <button class="btn btn-sm btn-success" id="run-all-specs"><i class="fa fa-play"></i> Run All</button>
                          <input type="text" id="spec-filter" class="form-control form-control-sm d-inline-block ml-2" style="width: 260px;" placeholder="Filter specs..." />
                        </div>
                    </div>
                    <div id="specs-empty" class="text-muted small" style="display:none;">No specs found. Start the local watcher: npm run ui:cypress:watch</div>
                    <div id="specs-scroll" style="max-height: 180px; overflow-y: auto;">
                      <div id="specs-list" class="list-group"></div>
                    </div>
                </div>

                
                
                <h3 class="mt-4 mb-3">
                    <i class="fa fa-cogs"></i> Functions
                </h3>
                
                <div class="row">
                    <div class="col-md-3">
                        <div class="card test-card">
                            <div class="card-body">
                                <h5 class="card-title">
                                    <span class="status-indicator status-idle" id="status-seeder"></span>
                                    Database Seeder
                                </h5>
                                <div class="btn-group-vertical w-100" role="group">
                                    <button class="btn btn-outline-danger btn-sm btn-test" data-test="seed-test">
                                        <span class="status-indicator status-idle" id="status-seedtest"></span>
                                        Reset Test Schema
                                    </button>
                                    <button class="btn btn-outline-danger btn-sm btn-test" data-test="seed-dev">
                                        <span class="status-indicator status-idle" id="status-seeddev"></span>
                                        Reset Dev Schema
                                    </button>
                                    <button class="btn btn-outline-warning btn-sm btn-test" data-test="migrate-live">
                                        <span class="status-indicator status-idle" id="status-migrate"></span>
                                        Migrate Live Schema
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-3">
                        <div class="card test-card">
                            <div class="card-body">
                                <h5 class="card-title">
                                    <span class="status-indicator status-idle" id="status-email"></span>
                                    Email System
                                </h5>
                                <div class="btn-group-vertical w-100" role="group">
                                    <button class="btn btn-outline-info btn-sm" id="toggle-sandbox">
                                        <span class="status-indicator status-idle" id="status-sandbox"></span>
                                        <span id="sandbox-text">Enable Sandbox</span>
                                    </button>
                                    <button class="btn btn-outline-secondary btn-sm" id="clear-rate-limits">
                                        <span class="status-indicator status-idle" id="status-ratelimit"></span>
                                        Clear Rate Limits
                                    </button>
                                    <button class="btn btn-outline-primary btn-sm" id="view-rate-limits">
                                        <i class="fa fa-eye"></i>
                                        View Rate Limits
                                    </button>
                                    <button class="btn btn-outline-primary btn-sm" id="run-email-login-spec">
                                        <i class="fa fa-play"></i>
                                        Run Email Login Test
                                    </button>
                                    <button class="btn btn-outline-primary btn-sm" id="run-email-security-spec">
                                        <i class="fa fa-play"></i>
                                        Run Email Security Test
                                    </button>
                                </div>
                                <small class="text-muted mt-2 d-block">
                                    <span id="sandbox-status">Checking...</span><br>
                                    <span id="rate-limit-count">Rate limits: Loading...</span>
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4><i class="fa fa-terminal"></i> System Log</h4>
                        <button class="btn btn-secondary btn-sm" id="clear-results">Clear Log</button>
                    </div>
                    <div class="result-container" id="test-results">
                        <div class="text-muted">System operations and test results will appear here...</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        $(document).ready(function() {
            // Decide where Back/Home should go based on login status
            $.ajax({ url: '../auth_gatekeeper.php', method: 'GET' })
              .done(function(){ $('#back-home').attr('href', '../dashboard.php'); })
              .fail(function(){ $('#back-home').attr('href', '../index.php'); });
            $('.btn-test').click(function() {
                const testType = $(this).data('test');
                runTest(testType);
            });
            
            $('#clear-results').click(function() {
                clearResults();
            });

            // Email system controls
            loadEmailStatus();
            
            $('#toggle-sandbox').click(function() {
                toggleSandboxMode();
            });

            $('#clear-rate-limits').click(function() {
                clearRateLimits();
            });

            $('#view-rate-limits').click(function() {
                viewRateLimits();
            });

            // Email Cypress spec shortcuts
            $('#run-email-login-spec').click(function() {
                if (typeof window.runTest === 'function') {
                    window.runTest('email_login');
                }
            });
            $('#run-email-security-spec').click(function() {
                if (typeof window.runTest === 'function') {
                    window.runTest('email_security');
                }
            });
        });
        
        function runTest(testType) {
            updateTestStatus(testType, 'running');
            appendResult(`🚀 Starting ${testType} tests...`);
            
            // Simulate different test types
            switch(testType) {
                case 'api':
                    runApiTests();
                    break;
                case 'database':
                    runDatabaseTests();
                    break;
                case 'cypress':
                    runCypressTestsBridge();
                    break;
                case 'schema':
                    runSchemaTests();
                    break;
                case 'health':
                    runHealthCheck();
                    break;
                case 'seed-test':
                    runSchemaReset('wt_test');
                    break;
                case 'seed-dev':
                    runSchemaReset('wt_dev');
                    break;
                case 'migrate-live':
                    runLiveMigration();
                    break;
                case 'all':
                    runAllTests();
                    break;
            }
        }
        
        function runApiTests() {
            appendResult('📡 Testing API endpoint: /router.php?controller=get1');
            
            $.post('../router.php?controller=get1', { page: 1 }, function(response) {
                try {
                    const data = JSON.parse(response);
                    if (Array.isArray(data)) {
                        appendResult(`✅ API Test PASSED: Retrieved ${data.length} records`);
                        updateTestStatus('api', 'success');
                    } else {
                        appendResult(`❌ API Test FAILED: Invalid response format`);
                        updateTestStatus('api', 'error');
                    }
                } catch (e) {
                    appendResult(`❌ API Test FAILED: ${e.message}`);
                    updateTestStatus('api', 'error');
                }
            }).catch(function() {
                appendResult('❌ API Test FAILED: Network error');
                updateTestStatus('api', 'error');
            });
        }
        
        function runDatabaseTests() {
            appendResult('🗄️ Testing database connection and queries...');
            
            // Test current schema
            $.post('../router.php?controller=schema', { action: 'get' }, function(response) {
                try {
                    const schemaData = JSON.parse(response);
                    appendResult(`📋 Current schema: ${schemaData.schema}`);
                    
                    // Test data retrieval
                    $.post('../router.php?controller=get1', { page: 1 }, function(dataResponse) {
                        try {
                            const data = JSON.parse(dataResponse);
                            appendResult(`✅ Database Test PASSED: Connected to ${schemaData.schema}`);
                            updateTestStatus('database', 'success');
                        } catch (e) {
                            appendResult(`❌ Database Test FAILED: Query error`);
                            updateTestStatus('database', 'error');
                        }
                    });
                } catch (e) {
                    appendResult(`❌ Database Test FAILED: Schema check failed`);
                    updateTestStatus('database', 'error');
                }
            });
        }
        
        function runCypressTests() {
            appendResult('🌲 Simulating Cypress E2E tests...');
            appendResult('Note: This is a simulation. Run "npx cypress run" in terminal for real tests.');
            
            // Simulate test execution
            setTimeout(() => {
                appendResult('🔍 Running smoke tests...');
            }, 1000);
            
            setTimeout(() => {
                appendResult('🔧 Running schema switching tests...');
            }, 2000);
            
            setTimeout(() => {
                appendResult('✅ E2E Tests PASSED: All tests completed successfully');
                updateTestStatus('cypress', 'success');
            }, 3000);
        }
        
        function runSchemaTests() {
            appendResult('🔄 Testing schema switching functionality...');
            const schemas = ['wt_test', 'wt_dev', 'wt_live'];
            let testCount = 0;
            
            schemas.forEach((schema, index) => {
                setTimeout(() => {
                    appendResult(`🔍 Testing schema: ${schema}`);
                    
                    // Simulate schema validation
                    $.post('../router.php?controller=schema', { 
                        action: 'switch', 
                        schema: schema 
                    }, function(response) {
                        const data = JSON.parse(response);
                        if (data.success) {
                            appendResult(`✅ Schema ${schema}: VALID`);
                        } else {
                            appendResult(`❌ Schema ${schema}: ${data.message}`);
                        }
                        
                        testCount++;
                        if (testCount === schemas.length) {
                            appendResult('✅ Schema Tests COMPLETED');
                            updateTestStatus('schema', 'success');
                        }
                    });
                }, index * 1000);
            });
        }
        
        function runHealthCheck() {
            appendResult('🏥 Running system health check...');
            
            const checks = [
                { name: 'API Endpoint', test: () => $.post('../router.php?controller=get1', {page: 1}) },
                { name: 'Schema Service', test: () => $.post('../router.php?controller=schema', {action: 'get'}) }
            ];
            
            let completedChecks = 0;
            let failedChecks = 0;
            
            checks.forEach((check, index) => {
                setTimeout(() => {
                    appendResult(`🔍 Checking ${check.name}...`);
                    
                    check.test()
                        .done(() => {
                            appendResult(`✅ ${check.name}: HEALTHY`);
                        })
                        .fail(() => {
                            appendResult(`❌ ${check.name}: UNHEALTHY`);
                            failedChecks++;
                        })
                        .always(() => {
                            completedChecks++;
                            if (completedChecks === checks.length) {
                                if (failedChecks === 0) {
                                    appendResult('✅ Health Check PASSED: All systems healthy');
                                    updateTestStatus('health', 'success');
                                } else {
                                    appendResult(`❌ Health Check FAILED: ${failedChecks} issues found`);
                                    updateTestStatus('health', 'error');
                                }
                            }
                        });
                }, index * 500);
            });
        }
        
        function runAllTests() {
            appendResult('🚀 Running complete test suite...');
            const tests = ['api', 'database', 'health', 'schema'];
            let currentTest = 0;
            
            function runNextTest() {
                if (currentTest < tests.length) {
                    const testType = tests[currentTest];
                    appendResult(`\n--- Running ${testType.toUpperCase()} Tests ---`);
                    
                    setTimeout(() => {
                        runTest(testType);
                        currentTest++;
                        setTimeout(runNextTest, 3000);
                    }, 1000);
                } else {
                    appendResult('\n🏁 ALL TESTS COMPLETED!');
                    updateTestStatus('all', 'success');
                }
            }
            
            runNextTest();
        }
        
        function updateTestStatus(testType, status) {
            const statusEl = $(`#status-${testType}`);
            statusEl.removeClass('status-idle status-running status-success status-error');
            statusEl.addClass(`status-${status}`);
        }

        // Safely parse JSON or pass through objects
        function parseMaybeJson(resp) {
            if (resp && typeof resp === 'object') return resp;
            if (typeof resp === 'string') {
                try { return JSON.parse(resp); } catch (e) { return null; }
            }
            return null;
        }

        function appendResult(message) {
            const timestamp = new Date().toLocaleTimeString();
            const resultEl = $('#test-results');
            
            if (resultEl.children().first().hasClass('text-muted')) {
                resultEl.empty();
            }
            
            resultEl.append(`<div>[${timestamp}] ${message}</div>`);
            resultEl.scrollTop(resultEl[0].scrollHeight);
        }
        
        function clearResults() {
            $('#test-results').html('<div class="text-muted">System operations and test results will appear here...</div>');
            $('.status-indicator').removeClass('status-running status-success status-error').addClass('status-idle');
        }
        
        
        function runSchemaReset(schema) {
            const schemaName = schema.replace('wt_', '');
            const statusId = schema === 'wt_test' ? 'seedtest' : 'seeddev';
            
            // Show alert and update status
            showAlert(`Running ${schemaName} schema reset...`, 'info');
            updateTestStatus(statusId, 'running');
            appendResult(`🗄️ Resetting ${schemaName} schema with fresh data...`);
            
            $.post('../router.php?controller=seeder', { 
                action: 'reset_schema',
                schema: schema
            }, function(response) {
                try {
                    const data = JSON.parse(response);
                    if (data.success) {
                        showAlert(`${schemaName} schema reset completed successfully!`, 'success');
                        appendResult(`✅ ${schemaName} schema reset successfully!`);
                        
                        if (data.verification && data.verification[schema]) {
                            const info = data.verification[schema];
                            appendResult(`📊 ${schemaName} verification: ${info.tables.length} tables, ${Object.values(info.record_counts).reduce((a, b) => a + b, 0)} total records`);
                            Object.entries(info.record_counts).forEach(([table, count]) => {
                                appendResult(`    - ${table}: ${count} records`);
                            });
                        }
                        
                        updateTestStatus(statusId, 'success');
                    } else {
                        showAlert(`${schemaName} schema reset failed: ${data.message}`, 'danger');
                        appendResult(`❌ ${schemaName} reset failed: ${data.message}`);
                        updateTestStatus(statusId, 'error');
                    }
                } catch (e) {
                    showAlert(`${schemaName} schema reset failed: ${e.message}`, 'danger');
                    appendResult(`❌ ${schemaName} reset failed: ${e.message}`);
                    updateTestStatus(statusId, 'error');
                }
            }).catch(function() {
                showAlert(`${schemaName} schema reset failed: Network error`, 'danger');
                appendResult(`❌ ${schemaName} reset failed: Network error`);
                updateTestStatus(statusId, 'error');
            });
        }
        
        function runLiveMigration() {
            showAlert('Running live schema migration...', 'info');
            updateTestStatus('migrate', 'running');
            appendResult('⚡ Running live schema migration (non-destructive)...');
            
            $.post('../router.php?controller=seeder', { 
                action: 'migrate_live'
            }, function(response) {
                try {
                    const data = JSON.parse(response);
                    if (data.success) {
                        showAlert('Live schema migration completed successfully!', 'success');
                        appendResult('✅ Live schema migration completed successfully!');
                        
                        if (data.verification) {
                            const info = data.verification;
                            if (info.exists) {
                                appendResult(`📊 Live verification: ${info.tables.length} tables, ${Object.values(info.record_counts).reduce((a, b) => a + b, 0)} total records`);
                                Object.entries(info.record_counts).forEach(([table, count]) => {
                                    appendResult(`    - ${table}: ${count} records`);
                                });
                            }
                        }
                        
                        updateTestStatus('migrate', 'success');
                    } else {
                        showAlert(`Live migration failed: ${data.message}`, 'danger');
                        appendResult(`❌ Live migration failed: ${data.message}`);
                        updateTestStatus('migrate', 'error');
                    }
                } catch (e) {
                    showAlert(`Live migration failed: ${e.message}`, 'danger');
                    appendResult(`❌ Live migration failed: ${e.message}`);
                    updateTestStatus('migrate', 'error');
                }
            }).catch(function() {
                showAlert('Live migration failed: Network error', 'danger');
                appendResult('❌ Live migration failed: Network error');
                updateTestStatus('migrate', 'error');
            });
        }

        // Cypress bridge: requires `npm run ui:cypress:watch` running locally
        let cypressPoll = null;
        function runCypressTestsBridge() {
            appendResult('Triggering Cypress via UI bridge...');
            updateTestStatus('cypress', 'running');
            $.post('cypress-runner.php?action=start', { spec: 'all' })
              .done(() => {
                appendResult('Cypress run started. Watching for results...');
                if (cypressPoll) clearInterval(cypressPoll);
                cypressPoll = setInterval(pollCypressStatus, 1500);
              })
              .fail(() => {
                appendResult('Failed to trigger Cypress (bridge not running?)');
                updateTestStatus('cypress', 'error');
              });
        }

        // Cache to avoid reprinting the same tail and to differentiate runs
        let __lastCypressTail = '';
        let __lastRunId = null;
        let __runStartAtMs = null;
        let __lastStatusMtime = null;
        function pollCypressStatus() {
            $.getJSON('cypress-runner.php?action=status')
              .done((resp) => {
                const s = resp.status || {};
                const dbg = resp.debug || {};
                // New run detected? Print a header and reset caches
                if (s.runId && s.runId !== __lastRunId) {
                  __lastRunId = s.runId;
                  __lastCypressTail = '';
                  __runStartAtMs = Date.now();
                  const grp = s.specGroup ? ` [${s.specGroup}]` : '';
                  const specLbl = s.spec ? ` ${s.spec}` : '';
                  appendResult(`—— Run ${s.runId}${grp}${specLbl} ——`);
                }
                __lastStatusMtime = (typeof resp.debug?.status_mtime === 'number') ? resp.debug.status_mtime : __lastStatusMtime;
                // Stream the runner log tail if provided by status.json
                try {
                  const tail = (s.debug && s.debug.lastLogTail) ? String(s.debug.lastLogTail) : null;
                  if (tail) {
                    if (typeof __lastCypressTail !== 'string') __lastCypressTail = '';
                    // Only append the new part to reduce spam
                    const newPart = tail.startsWith(__lastCypressTail) ? tail.slice(__lastCypressTail.length) : tail;
                    if (newPart.trim().length > 0) {
                      newPart.split(/\r?\n/).forEach((line) => {
                        if (line.trim().length) appendResult(`[Cypress] ${line}`);
                      });
                    }
                    __lastCypressTail = tail;
                  }
                } catch (e) {}
                if (s.state === 'running') {
                    const specLbl = s.spec ? ` (${s.spec})` : '';
                    const grp = s.specGroup ? ` [${s.specGroup}]` : '';
                    appendResult(`Cypress: running${specLbl}${grp}...`);
                    // Stuck detection: if trigger pending and no tail updates for ~10s, flag watcher issue
                    try {
                      const now = Date.now();
                      const started = __runStartAtMs || now;
                      const ageSec = Math.floor((now - started) / 1000);
                      const trigAge = (typeof resp.debug?.trigger_mtime === 'number') ? (Math.floor((now/1000) - resp.debug.trigger_mtime)) : null;
                      const hasTail = (s.debug && s.debug.lastLogTail && String(s.debug.lastLogTail).trim().length > 0);
                      if (!hasTail && ageSec >= 10 && (resp.debug?.trigger_pending || (trigAge !== null && trigAge > 8))) {
                        appendResult('Watcher appears inactive. Start it locally: npm run ui:cypress:watch');
                        updateTestStatus('cypress', 'error');
                        clearInterval(cypressPoll);
                        return;
                      }
                    } catch {}
                } else if (s.state === 'finished') {
                    const specCount = (typeof s.specCount === 'number') ? `, Specs ${s.specCount}` : '';
                    // Derive duration if timestamps available
                    let duration = '';
                    try {
                      if (s.startedAt && s.finishedAt) {
                        const d = (new Date(s.finishedAt) - new Date(s.startedAt)) / 1000;
                        if (isFinite(d)) duration = `, ${d.toFixed(1)}s`;
                      }
                    } catch {}
                    appendResult(`Cypress finished. Exit ${s.exitCode}, Passed ${s.summary?.totalPassed}/${s.summary?.totalTests}, Failed ${s.summary?.totalFailed}${specCount}${duration}`);
                    // Prefer embedded run details from status if present
                    if (Array.isArray(s.runs) && s.runs.length) {
                      renderCypressRuns(s.runs);
                    } else {
                      // Fallback: fetch last.json from reporter
                      try {
                        $.getJSON('cypress-runner.php?action=results')
                          .done((results) => {
                            if (results && (Array.isArray(results.runs) && results.runs.length || (Array.isArray(results.tests) && results.tests.length))) {
                              renderCypressResults(results);
                            } else {
                              // Final fallback: show summary line as a spec-level result
                              renderCypressRuns([{ spec: s.spec || 'unknown', counts: { total: s.summary?.totalTests||0, passed: s.summary?.totalPassed||0, failed: s.summary?.totalFailed||0, pending: 0 }, tests: [] }]);
                            }
                          })
                          .fail(() => {
                            // Final fallback: show summary line as a spec-level result
                            renderCypressRuns([{ spec: s.spec || 'unknown', counts: { total: s.summary?.totalTests||0, passed: s.summary?.totalPassed||0, failed: s.summary?.totalFailed||0, pending: 0 }, tests: [] }]);
                          });
                      } catch (e) {
                        renderCypressRuns([{ spec: s.spec || 'unknown', counts: { total: s.summary?.totalTests||0, passed: s.summary?.totalPassed||0, failed: s.summary?.totalFailed||0, pending: 0 }, tests: [] }]);
                      }
                    }
                    updateTestStatus('cypress', s.exitCode === 0 ? 'success' : 'error');
                    clearInterval(cypressPoll);
                    // Reset tail cache after finish so next run starts fresh
                    setTimeout(() => { __lastCypressTail = ''; }, 1000);
                } else if (s.state === 'error') {
                    appendResult(`Cypress error: ${s.message || 'unknown'}`);
                    updateTestStatus('cypress', 'error');
                    clearInterval(cypressPoll);
                    setTimeout(() => { __lastCypressTail = ''; }, 1000);
                } else if (dbg.trigger_pending) {
                    appendResult('Waiting for local Cypress watcher to pick up the trigger... (run: npm run ui:cypress:watch)');
                }
              })
              .fail(() => {
                appendResult('Error polling Cypress status');
              });
        }

        // Render detailed Cypress results from JSON reporter (Cypress JSON with runs[])
        function renderCypressResults(data) {
            if (!data || typeof data !== 'object') {
                appendResult('No detailed results available');
                return;
            }
            const runs = Array.isArray(data.runs) ? data.runs : [];
            if (runs.length === 0) {
                // Try Mocha JSON reporter shape: { tests: [], failures: [], passes: [], stats: {} }
                const tests = Array.isArray(data.tests) ? data.tests : [];
                if (!tests.length) {
                  appendResult('No spec runs found in results');
                  return;
                }
                // Summarize by state and list failures
                const passed = (data.passes && data.passes.length) || tests.filter(t => (t.state||'').toLowerCase()==='passed').length;
                const failed = (data.failures && data.failures.length) || tests.filter(t => (t.state||'').toLowerCase()==='failed').length;
                const pending = tests.filter(t => (t.state||'').toLowerCase()==='pending').length;
                appendResult(`— Detailed results (mocha json) — Passed ${passed}, Failed ${failed}, Pending ${pending}`);
                const fails = data.failures || tests.filter(t => (t.state||'').toLowerCase()==='failed');
                fails.forEach((t) => {
                  const title = (Array.isArray(t.title) ? t.title.join(' > ') : (t.fullTitle || t.title || 'Unnamed test'));
                  const err = (t.err && t.err.message) || t.error || '';
                  const snippet = String(err).split('\n')[0].slice(0, 200);
                  appendResult(`  ✖ ${title} — ${snippet}`);
                });
                return;
            }
            appendResult('— Detailed results —');
            runs.forEach((run) => {
                const specPath = (run && run.spec && (run.spec.relative || run.spec.name || run.spec)) || 'unknown spec';
                const tests = Array.isArray(run.tests) ? run.tests : [];
                const passed = tests.filter(t => (t.state||'').toLowerCase() === 'passed').length;
                const failed = tests.filter(t => (t.state||'').toLowerCase() === 'failed').length;
                const pending = tests.filter(t => (t.state||'').toLowerCase() === 'pending').length;
                appendResult(`Spec: ${specPath} — Passed ${passed}, Failed ${failed}, Pending ${pending}`);
                // List failed tests with error snippet if present
                tests.filter(t => (t.state||'').toLowerCase() === 'failed').forEach((t) => {
                    const title = Array.isArray(t.title) ? t.title.join(' > ') : (t.title || 'Unnamed test');
                    const err = (t.displayError || (t.attempts && t.attempts[0] && t.attempts[0].error && t.attempts[0].error.message)) || '';
                    const snippet = String(err).split('\n')[0].slice(0, 200);
                    appendResult(`  ✖ ${title} — ${snippet}`);
                });
            });
            appendResult('View raw JSON: app/frontend/test/last.json (or open cypress-runner.php?action=results)');
        }

        // Render when runs[] are already included in status.json (runs light format)
        function renderCypressRuns(runs) {
            if (!Array.isArray(runs) || runs.length === 0) return;
            appendResult('— Detailed results —');
            runs.forEach((r) => {
                const specPath = r.spec || 'unknown spec';
                const c = r.counts || {};
                const passed = c.passed || c.pass || 0;
                const failed = c.failed || c.fail || 0;
                const pending = c.pending || 0;
                appendResult(`Spec: ${specPath} — Passed ${passed}, Failed ${failed}, Pending ${pending}`);
                const tests = Array.isArray(r.tests) ? r.tests : [];
                tests.filter(t => (t.state||'').toLowerCase() === 'failed').forEach((t) => {
                    const title = Array.isArray(t.title) ? t.title.join(' > ') : (t.title || 'Unnamed test');
                    const snippet = String(t.error || '').split('\n')[0].slice(0, 200);
                    appendResult(`  ✖ ${title} — ${snippet}`);
                });
            });
        }

        function showAlert(message, type) {
            const alertClass = `alert-${type}`;
            const alertHtml = `
                <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
                    ${message}
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
            `;
            
            $('#alert-container').html(alertHtml);
            
            // Auto-dismiss success/info alerts after 5 seconds
            if (type === 'success' || type === 'info') {
                setTimeout(() => {
                    $('#alert-container .alert').alert('close');
                }, 5000);
            }
        }

        // Dynamic Cypress spec list
        (function initSpecs(){
          function renderSpecs(list){
            const $list = $('#specs-list');
            const $empty = $('#specs-empty');
            $list.empty();
            if (!list || list.length === 0){
              $empty.show();
              return;
            }
            $empty.hide();
            list.forEach((s, idx) => {
              const id = `spec-${idx}`;
              const display = $('<div/>').text(s.path).html();
              const rawPath = s.path; // use raw path for data attribute
              const groupBadge = s.group === 'e2e_prod' ? '<span class="badge badge-warning ml-2">prod</span>' : '';
              const item = `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                  <div class="text-truncate" style="max-width: 70%;">
                    <code title="${display}">${display}</code> ${groupBadge}
                  </div>
                  <div>
                    <button class="btn btn-sm btn-outline-primary run-spec" data-spec="${rawPath}"><i class="fa fa-play"></i> Run</button>
                  </div>
                </div>`;
              $list.append(item);
            });
          }

          function applyFilter(){
            const q = ($('#spec-filter').val()||'').toLowerCase();
            $('#specs-list .list-group-item').each(function(){
              const txt = $(this).find('code').text().toLowerCase();
              $(this).toggle(txt.indexOf(q) !== -1);
            });
          }

          function loadSpecs(){
            $.getJSON('cypress-runner.php?action=specs')
              .done(function(data){
                renderSpecs((data && data.specs) || (data && data.specs === undefined && data.runs) || []);
                applyFilter();
              })
              .fail(function(){
                $('#specs-empty').show().text('Failed to load specs (start watcher with npm run ui:cypress:watch)');
              });
          }

          $(document).on('click', '.run-spec', function(){
            const spec = $(this).data('spec');
            try { appendResult(`Triggering Cypress: ${spec}`); } catch(e) {}
            $.post('cypress-runner.php?action=start', { spec: spec })
              .done(function(){
                try { appendResult('Cypress run started. Watching for results...'); } catch(e) {}
                if (cypressPoll) clearInterval(cypressPoll);
                if (typeof pollCypressStatus === 'function') cypressPoll = setInterval(pollCypressStatus, 1500);
              })
              .fail(function(){
                try { appendResult('Failed to trigger Cypress (bridge not running?)'); } catch(e) {}
              });
          });

          $('#run-all-specs').on('click', function(){
            try { appendResult('Triggering Cypress: All specs'); } catch(e) {}
            $.post('cypress-runner.php?action=start', { spec: 'all' })
              .done(function(){
                try { appendResult('Cypress run started. Watching for results...'); } catch(e) {}
                if (cypressPoll) clearInterval(cypressPoll);
                if (typeof pollCypressStatus === 'function') cypressPoll = setInterval(pollCypressStatus, 1500);
              })
              .fail(function(){ try { appendResult('Failed to trigger Cypress (bridge not running?)'); } catch(e) {} });
          });

          $('#spec-filter').on('input', applyFilter);

          loadSpecs();
          // refresh specs occasionally
          setInterval(loadSpecs, 15000);
        })();

        // Email system management functions
        function loadEmailStatus() {
            // Load sandbox status
            $.post('../router.php?controller=email', { action: 'get_sandbox_status' })
                .done(function(response) {
                    const data = parseMaybeJson(response);
                    if (data.success) {
                        updateSandboxUI(data.sandbox_enabled);
                    } else {
                        $('#sandbox-status').text('Error loading status');
                    }
                })
                .fail(function() {
                    $('#sandbox-status').text('Error loading status');
                });

            // Load rate limit count
            $.post('../router.php?controller=email', { action: 'get_rate_limits' })
                .done(function(response) {
                    const data = parseMaybeJson(response);
                    if (data.success) {
                        const count = Object.keys(data.rate_limits).length;
                        $('#rate-limit-count').text(`Rate limits: ${count} entries`);
                    } else {
                        $('#rate-limit-count').text('Error loading limits');
                    }
                })
                .fail(function() {
                    $('#rate-limit-count').text('Error loading limits');
                });
        }

        function updateSandboxUI(sandboxEnabled) {
            if (sandboxEnabled) {
                $('#sandbox-text').text('Disable Sandbox');
                $('#sandbox-status').text('Sandbox: ENABLED (no emails sent)');
                $('#toggle-sandbox').removeClass('btn-outline-info').addClass('btn-outline-warning');
                $('#status-sandbox').removeClass('status-idle').addClass('status-success');
            } else {
                $('#sandbox-text').text('Enable Sandbox');
                $('#sandbox-status').text('Sandbox: DISABLED (real emails sent)');
                $('#toggle-sandbox').removeClass('btn-outline-warning').addClass('btn-outline-info');
                $('#status-sandbox').removeClass('status-success').addClass('status-idle');
            }
        }

        function toggleSandboxMode() {
            $('#status-sandbox').removeClass('status-idle status-success status-error').addClass('status-running');
            appendResult('🔄 Toggling email sandbox mode...');

            // Get current status first
            $.post('../router.php?controller=email', { action: 'get_sandbox_status' })
                .done(function(response) {
                    const data = parseMaybeJson(response);
                    if (data.success) {
                        const newState = !data.sandbox_enabled;
                        
                        // Toggle to opposite state
                        $.post('../router.php?controller=email', { 
                            action: 'set_sandbox_mode', 
                            enabled: newState 
                        })
                        .done(function(toggleResponse) {
                            const toggleData = parseMaybeJson(toggleResponse);
                            if (toggleData.success) {
                                updateSandboxUI(toggleData.sandbox_enabled);
                                appendResult(`✅ Sandbox mode ${toggleData.sandbox_enabled ? 'enabled' : 'disabled'}`);
                                showAlert(toggleData.message, 'success');
                                $('#status-sandbox').removeClass('status-running').addClass('status-success');
                            } else {
                                appendResult(`❌ Failed to toggle sandbox: ${toggleData.message}`);
                                showAlert(`Error: ${toggleData.message}`, 'danger');
                                $('#status-sandbox').removeClass('status-running').addClass('status-error');
                            }
                        })
                        .fail(function() {
                            appendResult('❌ Network error toggling sandbox mode');
                            showAlert('Network error', 'danger');
                            $('#status-sandbox').removeClass('status-running').addClass('status-error');
                        });
                    }
                })
                .fail(function() {
                    appendResult('❌ Failed to get current sandbox status');
                    $('#status-sandbox').removeClass('status-running').addClass('status-error');
                });
        }

        function clearRateLimits() {
            $('#status-ratelimit').removeClass('status-idle status-success status-error').addClass('status-running');
            appendResult('🗑️ Clearing all rate limits...');

            $.post('../router.php?controller=email', { action: 'clear_rate_limits' })
                .done(function(response) {
                    const data = parseMaybeJson(response);
                    if (data.success) {
                        appendResult('✅ All rate limits cleared');
                        showAlert(data.message, 'success');
                        $('#status-ratelimit').removeClass('status-running').addClass('status-success');
                        $('#rate-limit-count').text('Rate limits: 0 entries');
                        setTimeout(() => {
                            $('#status-ratelimit').removeClass('status-success').addClass('status-idle');
                        }, 2000);
                    } else {
                        appendResult(`❌ Failed to clear rate limits: ${data.message}`);
                        showAlert(`Error: ${data.message}`, 'danger');
                        $('#status-ratelimit').removeClass('status-running').addClass('status-error');
                    }
                })
                .fail(function() {
                    appendResult('❌ Network error clearing rate limits');
                    showAlert('Network error', 'danger');
                    $('#status-ratelimit').removeClass('status-running').addClass('status-error');
                });
        }

        function viewRateLimits() {
            appendResult('📊 Fetching current rate limits...');

            $.post('../router.php?controller=email', { action: 'get_rate_limits' })
                .done(function(response) {
                    const data = parseMaybeJson(response);
                    if (data.success) {
                        const rateLimits = data.rate_limits;
                        const count = Object.keys(rateLimits).length;
                        
                        appendResult(`📋 Rate limits (${count} entries):`);
                        
                        if (count === 0) {
                            appendResult('   No rate limits currently active');
                        } else {
                            Object.entries(rateLimits).forEach(([key, limits]) => {
                                const now = Math.floor(Date.now() / 1000);
                                const blockedUntil = limits.blocked_until || 0;
                                const attempts = limits.attempts ? limits.attempts.length : 0;
                                
                                let status = `${attempts} attempts`;
                                if (blockedUntil > now) {
                                    const remainingMin = Math.ceil((blockedUntil - now) / 60);
                                    status += `, blocked for ${remainingMin}min`;
                                }
                                
                                appendResult(`   ${key}: ${status}`);
                            });
                        }
                        
                        $('#rate-limit-count').text(`Rate limits: ${count} entries`);
                    } else {
                        appendResult(`❌ Failed to get rate limits: ${data.message}`);
                    }
                })
                .fail(function() {
                    appendResult('❌ Network error fetching rate limits');
                });
        }
</script>
</body>
<script>
// Override runTest to route to Cypress bridge specs
(function(){
  function triggerCypress(label, specPattern, statusId){
    try { updateTestStatus(statusId, 'running'); } catch(e) {}
    try { appendResult(`Triggering Cypress: ${label} (${specPattern})`); } catch(e) {}
    $.post('cypress-runner.php?action=start', { spec: specPattern })
      .done(function(){
        try { appendResult('Cypress run started. Watching for results...'); } catch(e) {}
        if (typeof cypressPoll !== 'undefined' && cypressPoll) clearInterval(cypressPoll);
        if (typeof pollCypressStatus === 'function') {
          cypressPoll = setInterval(pollCypressStatus, 1500);
        }
      })
      .fail(function(){
        try {
          appendResult('Failed to trigger Cypress (bridge not running?)');
          updateTestStatus(statusId, 'error');
        } catch(e) {}
      });
  }

  const prevRunTest = window.runTest;
  window.runTest = function(testType){
    switch(testType){
      case 'api':
        return triggerCypress('API', 'cypress/e2e/api.cy.js', 'api');
      case 'database':
        return triggerCypress('Database (health)', 'cypress/e2e/health.cy.js', 'database');
      case 'schema':
        return triggerCypress('Schema', 'cypress/e2e/schema.cy.js', 'schema');
      case 'health':
        return triggerCypress('Health', 'cypress/e2e/health.cy.js', 'health');
      case 'email_login':
        return triggerCypress('Email Login', 'cypress/e2e/email_login.cy.js', 'email_login');
      case 'email_security':
        return triggerCypress('Email Security', 'cypress/e2e/email_security.cy.js', 'email_security');
      case 'cypress':
      case 'all':
        return triggerCypress('All', 'cypress/e2e/*.cy.js', 'all');
      default:
        if (typeof prevRunTest === 'function') return prevRunTest(testType);
    }
  };
})();
</script>
</body>
</html>
