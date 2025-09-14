<?php
require_once('/var/app/backend/CoverageLogger.php');

class SchemaManager
{
    public static function switchSchema($schema)
    {
        COVERAGE_LOG('switchSchema', __CLASS__, __FILE__, __LINE__);
        // Only allow localhost access
        if (!self::isLocalhost()) {
            return ['success' => false, 'message' => 'Schema switching only allowed from localhost'];
        }
        
        // Validate schema name
        $validSchemas = ['wt_test', 'wt_dev', 'wt_live'];
        if (!in_array($schema, $validSchemas)) {
            return ['success' => false, 'message' => 'Invalid schema name'];
        }
        
        // Validate the schema switch by testing database connectivity
        $validation = self::validateSchemaSwitch($schema);
        
        if ($validation['success']) {
            // Store the schema choice in session (per-user preference)
            $_SESSION['selected_schema'] = $schema;
            
            return [
                'success' => true, 
                'message' => "Schema switched to $schema successfully. Database validated.",
                'schema' => $schema,
                'validation' => $validation,
                'session_stored' => true
            ];
        } else {
            return [
                'success' => false, 
                'message' => "Schema switch failed: " . $validation['message'],
                'validation' => $validation
            ];
        }
    }
    
    public static function getCurrentSchema()
    {
        COVERAGE_LOG('getCurrentSchema', __CLASS__, __FILE__, __LINE__);
        // Check session first (user's choice), then fallback to env, then default
        return $_SESSION['selected_schema'] ?? getenv('PG_SCHEMA') ?: 'wt_dev';
    }
    
    private static function validateSchemaSwitch($schema)
    {
        COVERAGE_LOG('validateSchemaSwitch', __CLASS__, __FILE__, __LINE__);
        try {
            // Force clear any cached database connections
            require_once('/var/app/backend/Config.php');
            
            // Get database instance to test the new schema
            $testDb = Database::getInstance();
            $connection = $testDb->getdbConnection();
            
            if (!$connection) {
                return ['success' => false, 'message' => 'Failed to establish database connection'];
            }
            
            // Test if we can query data from the schema
            $testQuery = "SELECT id, val FROM " . $schema . ".test_table ORDER BY id LIMIT 3";
            $stmt = $connection->prepare($testQuery);
            
            if (!$stmt->execute()) {
                return ['success' => false, 'message' => 'Schema does not exist or is not accessible'];
            }
            
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            $recordCount = count($results);
            
            // Validate schema-specific data exists
            $expectedPrefix = str_replace('wt_', '', $schema); // test, dev, or live
            $schemaDataValid = false;
            
            if ($recordCount > 0) {
                // Check if first record has expected schema-specific value
                $firstVal = $results[0]['val'] ?? '';
                $schemaDataValid = strpos($firstVal, $expectedPrefix) === 0;
            }
            
            return [
                'success' => true, 
                'message' => "Schema $schema validated successfully",
                'record_count' => $recordCount,
                'sample_data' => $results,
                'schema_data_valid' => $schemaDataValid,
                'expected_prefix' => $expectedPrefix,
                'query_test' => 'passed'
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false, 
                'message' => 'Database validation failed: ' . $e->getMessage()
            ];
        }
    }
    
    private static function isLocalhost()
    {
        COVERAGE_LOG('isLocalhost', __CLASS__, __FILE__, __LINE__);
        $httpHost = $_SERVER['HTTP_HOST'] ?? '';
        
        return $httpHost === '127.0.0.1:8111';
    }
}