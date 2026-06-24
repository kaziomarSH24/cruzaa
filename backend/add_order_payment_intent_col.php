<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = (new Database())->getConnection();

    $stmt = $db->query("SHOW COLUMNS FROM orders LIKE 'payment_intent_id'");
    if ($stmt->fetch()) {
        echo "payment_intent_id column already exists in orders table.";
        exit;
    }

    $db->exec("ALTER TABLE orders ADD COLUMN payment_intent_id VARCHAR(255) DEFAULT NULL AFTER payment_method");
    echo "Successfully added payment_intent_id column to orders table.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
