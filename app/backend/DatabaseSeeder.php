<?php
require_once('/var/app/backend/Config.php');
require_once('/var/app/backend/CoverageLogger.php');

class DatabaseSeeder
{
    public static function resetSchemas($schemas = ['wt_test', 'wt_dev'])
    {
        COVERAGE_LOG('resetSchemas', __CLASS__, __FILE__, __LINE__);
        // Only allow localhost access
        if (!self::isLocalhost()) {
            return ['success' => false, 'message' => 'Database seeding only allowed from localhost'];
        }

        try {
            $db = Database::getInstance();
            $connection = $db->getdbConnection();

            if (!$connection) {
                return ['success' => false, 'message' => 'Failed to establish database connection'];
            }

            $results = [];
            $verification = [];

            // Process each schema with its specific seeder
            foreach ($schemas as $schema) {
                $result = self::runSchemaSeeder($schema, $connection);
                $results[$schema] = $result;
                
                if ($result['success']) {
                    // Verify the schema was created successfully
                    $verification[$schema] = self::verifySchema($schema, $connection);
                }
            }

            // Check if all schemas were successful
            $allSuccessful = array_reduce($results, function($carry, $result) {
                return $carry && $result['success'];
            }, true);

            return [
                'success' => $allSuccessful,
                'message' => $allSuccessful ? 'All schemas reset successfully' : 'Some schemas failed to reset',
                'schemas_reset' => $schemas,
                'results' => $results,
                'verification' => $verification,
                'timestamp' => date('Y-m-d H:i:s')
            ];

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Database seeding failed: ' . $e->getMessage()
            ];
        }
    }

    public static function seedSchema($schema)
    {
        COVERAGE_LOG('seedSchema', __CLASS__, __FILE__, __LINE__);
        // Only allow localhost access
        if (!self::isLocalhost()) {
            return ['success' => false, 'message' => 'Database seeding only allowed from localhost'];
        }

        // Validate schema name (now includes live for migrations)
        $validSchemas = ['wt_test', 'wt_dev', 'wt_live'];
        if (!in_array($schema, $validSchemas)) {
            return ['success' => false, 'message' => 'Invalid schema name'];
        }

        return self::resetSchemas([$schema]);
    }

    public static function migrateLive()
    {
        COVERAGE_LOG('migrateLive', __CLASS__, __FILE__, __LINE__);
        // Only allow localhost access
        if (!self::isLocalhost()) {
            return ['success' => false, 'message' => 'Live migration only allowed from localhost'];
        }

        try {
            $db = Database::getInstance();
            $connection = $db->getdbConnection();

            if (!$connection) {
                return ['success' => false, 'message' => 'Failed to establish database connection'];
            }

            // Use the migration script for live (non-destructive)
            $result = self::runSchemaMigration('wt_live', $connection);
            
            if ($result['success']) {
                $verification = self::verifySchema('wt_live', $connection);
                return [
                    'success' => true,
                    'message' => 'Live schema migration completed successfully',
                    'schema' => 'wt_live',
                    'verification' => $verification,
                    'timestamp' => date('Y-m-d H:i:s')
                ];
            } else {
                return $result;
            }

        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Live migration failed: ' . $e->getMessage()
            ];
        }
    }

    private static function runSchemaSeeder($schema, $connection)
    {
        COVERAGE_LOG('runSchemaSeeder', __CLASS__, __FILE__, __LINE__);
        try {
            // Determine the correct seeder file based on schema
            $seederFile = self::getSeederFile($schema);
            
            if (!file_exists($seederFile)) {
                return ['success' => false, 'message' => "Seeder file not found: $seederFile"];
            }

            $seederSQL = file_get_contents($seederFile);
            if (!$seederSQL) {
                return ['success' => false, 'message' => 'Failed to read seeder file'];
            }

            // Execute the seeder SQL
            $connection->exec($seederSQL);

            return ['success' => true, 'message' => "Schema $schema seeded successfully"];

        } catch (Exception $e) {
            return ['success' => false, 'message' => "Schema $schema seeding failed: " . $e->getMessage()];
        }
    }

    private static function runSchemaMigration($schema, $connection)
    {
        COVERAGE_LOG('runSchemaMigration', __CLASS__, __FILE__, __LINE__);
        try {
            // Use migration file for live schema (non-destructive)
            $migrationFile = "/var/app/seeders/{$schema}_migration.sql";
            
            if (!file_exists($migrationFile)) {
                return ['success' => false, 'message' => "Migration file not found: $migrationFile"];
            }

            $migrationSQL = file_get_contents($migrationFile);
            if (!$migrationSQL) {
                return ['success' => false, 'message' => 'Failed to read migration file'];
            }

            // Execute the migration SQL
            $connection->exec($migrationSQL);

            return ['success' => true, 'message' => "Schema $schema migration completed successfully"];

        } catch (Exception $e) {
            return ['success' => false, 'message' => "Schema $schema migration failed: " . $e->getMessage()];
        }
    }

    private static function getSeederFile($schema)
    {
        COVERAGE_LOG('getSeederFile', __CLASS__, __FILE__, __LINE__);
        return "/var/app/seeders/{$schema}_seeder.sql";
    }

    private static function verifySchema($schema, $connection)
    {
        COVERAGE_LOG('verifySchema', __CLASS__, __FILE__, __LINE__);
        try {
            // Check if schema exists
            $stmt = $connection->prepare("SELECT schema_name FROM information_schema.schemata WHERE schema_name = ?");
            $stmt->execute([$schema]);
            $schemaExists = $stmt->fetch() !== false;

            // Check tables in schema
            $tablesQuery = "SELECT table_name FROM information_schema.tables WHERE table_schema = ? ORDER BY table_name";
            $stmt = $connection->prepare($tablesQuery);
            $stmt->execute([$schema]);
            $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

            // Check record counts
            $recordCounts = [];
            foreach ($tables as $table) {
                $countStmt = $connection->prepare("SELECT COUNT(*) FROM $schema.$table");
                $countStmt->execute();
                $count = $countStmt->fetchColumn();
                $recordCounts[$table] = $count;
            }

            return [
                'exists' => $schemaExists,
                'tables' => $tables,
                'record_counts' => $recordCounts
            ];

        } catch (Exception $e) {
            return [
                'exists' => false,
                'error' => $e->getMessage()
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
?>