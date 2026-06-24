<?php
require_once __DIR__ . '/config/database.php';
try {
    $db = (new Database())->getConnection();
    // Add specs JSON column if it doesn't exist
    $db->exec("ALTER TABLE products ADD COLUMN specs JSON DEFAULT NULL AFTER dimensions");
    echo "Successfully added specs column to products table.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
