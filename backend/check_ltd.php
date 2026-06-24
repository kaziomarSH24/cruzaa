<?php
require_once 'config/database.php';
$database = new Database();
$db = $database->getConnection();
$res = $db->query("SELECT p.name, c.name as category FROM products p JOIN categories c ON p.category_id = c.id WHERE c.name = 'Limited Editions'")->fetchAll(PDO::FETCH_ASSOC);
print_r($res);
