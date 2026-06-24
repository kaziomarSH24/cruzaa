<?php
require_once 'config/database.php';
$database = new Database();
$db = $database->getConnection();
$res = $db->query("SELECT * FROM navigation_menu WHERE menu_location = 'footer'")->fetchAll(PDO::FETCH_ASSOC);
print_r($res);
