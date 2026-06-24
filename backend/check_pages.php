<?php
require_once 'config/database.php';
$database = new Database();
$db = $database->getConnection();
$res = $db->query("DESCRIBE pages")->fetchAll(PDO::FETCH_ASSOC);
print_r($res);
