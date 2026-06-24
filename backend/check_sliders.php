<?php
require_once __DIR__ . '/config/database.php';
$db = (new Database())->getConnection();
$stmt = $db->query("SELECT * FROM hero_sliders");
$rows = $stmt->fetchAll();
header('Content-Type: application/json');
echo json_encode($rows, JSON_PRETTY_PRINT);
