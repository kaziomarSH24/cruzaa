<?php
require_once __DIR__ . '/config/database.php';
$db = (new Database())->getConnection();
$stmt = $db->query("SELECT * FROM products LIMIT 1");
$p = $stmt->fetch(PDO::FETCH_ASSOC);
echo json_encode($p);
