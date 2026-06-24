<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = (new Database())->getConnection();

    $stmt = $db->query("SHOW COLUMNS FROM products LIKE 'colors'");
    if ($stmt->fetch()) {
        echo "colors column already exists in products table.";
        exit;
    }

    $db->exec("ALTER TABLE products ADD COLUMN colors JSON DEFAULT NULL AFTER specs");
    echo "Successfully added colors column to products table.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
