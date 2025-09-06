<?php
   // session_start();

    if(isset($_GET["controller"])) {
        $controller = htmlspecialchars($_GET["controller"]);
        if($controller === "get1") { Get1(); } 
    }

    function Get1() {
        if(!isset($_POST["page"])) { $_POST["page"] = 1; }
        $page = htmlspecialchars($_POST["page"]);
        require_once ('/var/app/backend/Get1.php'); //load the dataset model
        $data = new Get1(); //set the variable to a new instance of the dataset
        $response = $data->Get($page); 
        echo $response;  
    }  

    ?>