<?php
require_once 'config/database.php';
$database = new Database();
$db = $database->getConnection();
$res = $db->query("SELECT id, title, url FROM navigation_menu")->fetchAll(PDO::FETCH_ASSOC);
print_r($res);
