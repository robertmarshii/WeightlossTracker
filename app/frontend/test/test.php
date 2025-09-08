<!DOCTYPE html>
<html lang="en">
 
<head>
    <!-- Jquery -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css">
    <!-- Boostrap -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css">
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js"></script>
    <!-- Jquery UI -->
    <link rel="stylesheet" href="https://code.jquery.com/ui/1.11.4/themes/black-tie/jquery-ui.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js"></script>
    <!-- My Scripts -->
    <script src="../schema-logger.js"></script>
    <script src="get.js"></script>
    <script src="call.js"></script>
</head>

<body>
    <div class="container mt-5">
        <div class="row">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <h2><i class="fa fa-code"></i> Legacy Test Interface</h2>
                        <p class="text-muted">Basic testing page with existing scripts</p>
                    </div>
                    <a href="../index.php" class="btn btn-outline-primary">
                        <i class="fa fa-arrow-left"></i> Back to Home
                    </a>
                </div>
                
                <div class="alert alert-info">
                    <strong>Note:</strong> This is the legacy test page. For a better experience, use the 
                    <a href="test-interface.html" class="alert-link">new test interface</a>.
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5>Quick Tests</h5>
                            </div>
                            <div class="card-body">
                                <button class="btn btn-primary mb-2" onclick="testAPI()">Test API</button><br>
                                <button class="btn btn-info mb-2" onclick="checkSchema()">Check Schema</button><br>
                                <button class="btn btn-success mb-2" onclick="testConnection()">Test Connection</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5>Test Results</h5>
                            </div>
                            <div class="card-body">
                                <div id="test-output" style="min-height: 200px; background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; overflow-y: auto;">
                                    Click a test button to see results...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function logOutput(message) {
            const output = document.getElementById('test-output');
            const timestamp = new Date().toLocaleTimeString();
            if (output.innerHTML.includes('Click a test button')) {
                output.innerHTML = '';
            }
            output.innerHTML += `[${timestamp}] ${message}\n`;
            output.scrollTop = output.scrollHeight;
        }
        
        function testAPI() {
            logOutput('🔍 Testing API endpoint...');
            
            fetch('../router.php?controller=get1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'page=1'
            })
            .then(response => response.text())
            .then(data => {
                try {
                    const parsed = JSON.parse(data);
                    logOutput(`✅ API Test PASSED: Retrieved ${parsed.length} records`);
                    logOutput(`📄 Sample data: ${JSON.stringify(parsed[0] || {}, null, 2)}`);
                } catch (e) {
                    logOutput(`❌ API Test FAILED: Invalid JSON response`);
                    logOutput(`📄 Raw response: ${data.substring(0, 200)}...`);
                }
            })
            .catch(error => {
                logOutput(`❌ API Test FAILED: ${error.message}`);
            });
        }
        
        function checkSchema() {
            logOutput('🗄️ Checking current schema...');
            
            fetch('../router.php?controller=schema', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=get'
            })
            .then(response => response.text())
            .then(data => {
                try {
                    const parsed = JSON.parse(data);
                    logOutput(`✅ Schema Check PASSED: Currently using ${parsed.schema}`);
                } catch (e) {
                    logOutput(`❌ Schema Check FAILED: ${e.message}`);
                    logOutput(`📄 Raw response: ${data}`);
                }
            })
            .catch(error => {
                logOutput(`❌ Schema Check FAILED: ${error.message}`);
            });
        }
        
        function testConnection() {
            logOutput('🔗 Testing database connection...');
            
            // First check schema, then test data retrieval
            fetch('../router.php?controller=schema', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=get'
            })
            .then(response => response.json())
            .then(schemaData => {
                logOutput(`📋 Connected to schema: ${schemaData.schema}`);
                
                return fetch('../router.php?controller=get1', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: 'page=1'
                });
            })
            .then(response => response.json())
            .then(data => {
                logOutput(`✅ Connection Test PASSED: Database accessible with ${data.length} records`);
            })
            .catch(error => {
                logOutput(`❌ Connection Test FAILED: ${error.message}`);
            });
        }
    </script>
</body>
</html>