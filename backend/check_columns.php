<?php
require_once __DIR__ . '/config/database.php';
try {
    $db = (new Database())->getConnection();
    $stmt = $db->query("DESCRIBE hero_sliders");
    $columns = $stmt->fetchAll();
    echo "Columns in hero_sliders table:\n";
    print_r($columns);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
