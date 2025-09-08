<?php
require_once ('/var/app/backend/Config.php');

class Get1
{
    protected $_dbHandle, $_dbInstance;
    
    public function __construct()
    {
        $this->_dbInstance = Database::getInstance();
        $this->_dbHandle = $this
            ->_dbInstance
            ->getdbConnection();
    }

    public function Get()
    {
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