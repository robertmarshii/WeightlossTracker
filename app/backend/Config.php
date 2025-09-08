<?php

class Database
{
    /**
     * @var Database
     */
    protected static $_dbInstance = null;

    /**
     * @var PDO
     */
    protected $_dbHandle;

    /**
     * @return Database
     */
    public static function getInstance()
    {
        $username = $_ENV['PG_USER'] ?? 'user';
        $password = $_ENV['PG_PASSWORD'] ?? 'password';
        $host = $_ENV['PG_HOST'] ?? 'mysql';
        $dbName = $_ENV['PG_DATABASE'] ?? 'db';
        $port = $_ENV['PG_PORT'] ?? '3306';
        if (self::$_dbInstance === null)
        { //checks if the PDO exists
            // creates new instance if not, sending in connection info
            self::$_dbInstance = new self($username, $password, $host, $dbName, $port);
        }

        return self::$_dbInstance;
    }

    /**
     * Get current schema name
     * @return string
     */
    public static function getSchema()
    {
        require_once('/var/app/backend/SchemaManager.php');
        return SchemaManager::getCurrentSchema();
    }

    /**
     * @param $username
     * @param $password
     * @param $host
     * @param $database
     */
    private function __construct($username, $password, $host, $database, $port)
    {
        try
        {
            $this->_dbHandle = new PDO("pgsql:host=$host;dbname=$database;port=$port", $username, $password); // creates the database handle with connection info
            //$this->_dbHandle = new PDO('mysql:host=' . $host . ';dbname=' . $database,  $username, $password); // creates the database handle with connection info
            
        }
        catch(PDOException $e)
        { // catch any failure to connect to the database
            echo $e->getMessage();
        }
    }

    /**
     * @return PDO
     */
    public function getdbConnection()
    {
        return $this->_dbHandle; // returns the PDO handle to be used elsewhere
        
    }

    public function __destruct()
    {
        $this->_dbHandle = null; // destroys the PDO handle when no longer neededlonger needed
        
    }

}

