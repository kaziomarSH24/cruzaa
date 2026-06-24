<?php
require_once __DIR__ . '/config/database.php';
try {
    $db = (new Database())->getConnection();
    $stmt = $db->query("DESCRIBE navigation_menu");
    $columns = $stmt->fetchAll();
    echo "Columns in navigation_menu table:\n";
    print_r($columns);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
