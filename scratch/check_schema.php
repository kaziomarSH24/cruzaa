<?php
require_once 'backend/config/Database.php';
$db = (new Database())->getConnection();
$stmt = $db->query("SHOW COLUMNS FROM product_images");
$cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
echo json_encode($cols, JSON_PRETTY_PRINT);
