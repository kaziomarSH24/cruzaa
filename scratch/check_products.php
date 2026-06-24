<?php
require_once 'backend/config/Database.php';
$db = (new Database())->getConnection();
$stmt = $db->query("SELECT id, name, slug FROM products");
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($products, JSON_PRETTY_PRINT);
