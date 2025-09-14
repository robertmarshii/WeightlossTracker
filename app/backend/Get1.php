<?php
require_once ('/var/app/backend/Config.php');
require_once('/var/app/backend/CoverageLogger.php');

class Get1
{
    protected $_dbHandle, $_dbInstance;
    
    public function __construct()
    {
        COVERAGE_LOG('__construct', __CLASS__, __FILE__, __LINE__);
        $this->_dbInstance = Database::getInstance();
        $this->_dbHandle = $this
            ->_dbInstance
            ->getdbConnection();
    }

    public function Get()
    {
        COVERAGE_LOG('Get', __CLASS__, __FILE__, __LINE__);
        $schema = Database::getSchema();
        $sqlQuery = "SELECT id, val FROM " . $schema . ".test_table ORDER BY id";
                            //return $sqlQuery;
        $statement = $this->_dbHandle->prepare($sqlQuery); // prepare a PDO statement
        $statement->execute(); // execute the PDO statement
        $results = $statement->fetchAll(PDO::FETCH_ASSOC);
        $json = json_encode($results);
        return $json;
    }

}

?>