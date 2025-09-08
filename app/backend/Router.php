<?php
   session_start();

    if(isset($_GET["controller"])) {
        $controller = htmlspecialchars($_GET["controller"]);
        if($controller === "get1") { Get1(); }
        if($controller === "schema") { SchemaController(); }
    }

    function Get1() {
        if(!isset($_POST["page"])) { $_POST["page"] = 1; }
        $page = htmlspecialchars($_POST["page"]);
        require_once ('/var/app/backend/Get1.php'); //load the dataset model
        $data = new Get1(); //set the variable to a new instance of the dataset
        $response = $data->Get($page); 
        echo $response;  
    }

    function SchemaController() {
        require_once ('/var/app/backend/SchemaManager.php');
        
        if (isset($_POST['action'])) {
            $action = htmlspecialchars($_POST['action']);
            
            if ($action === 'switch' && isset($_POST['schema'])) {
                $schema = htmlspecialchars($_POST['schema']);
                $result = SchemaManager::switchSchema($schema);
                echo json_encode($result);
            } elseif ($action === 'get') {
                $currentSchema = SchemaManager::getCurrentSchema();
                echo json_encode(['success' => true, 'schema' => $currentSchema]);
            }
        }
    }

    ?>