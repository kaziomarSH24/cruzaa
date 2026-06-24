<?php
require_once 'config/database.php';
$database = new Database();
$db = $database->getConnection();
print_r($db->query('SHOW TABLES')->fetchAll(PDO::FETCH_COLUMN));
