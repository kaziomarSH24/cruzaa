<?php
require_once __DIR__ . '/config/database.php';
try {
    $db = (new Database())->getConnection();
    $tableName = $_GET['table'] ?? $argv[1] ?? 'dynamic_content';
    $stmt = $db->query("SHOW CREATE TABLE " . $tableName);
    $row = $stmt->fetch();
    echo $row['Create Table'] ?? "Table not found";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
