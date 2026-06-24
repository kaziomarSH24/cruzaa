<?php
require_once __DIR__ . '/config/database.php';
try {
    $db = (new Database())->getConnection();
    $db->exec("ALTER TABLE categories ADD COLUMN show_on_home TINYINT(1) DEFAULT 0 AFTER is_active");
    echo "Successfully added show_on_home column to categories table.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
