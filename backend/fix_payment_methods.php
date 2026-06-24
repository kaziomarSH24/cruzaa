<?php
require_once __DIR__ . '/config/database.php';
try {
    $db = (new Database())->getConnection();

    // Check if table exists
    $db->exec("CREATE TABLE IF NOT EXISTS payment_methods (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        config JSON,
        is_active TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Insert defaults if missing
    $defaults = [
        ['Stripe (Card, Apple Pay, Google Pay)', 'stripe', 'Pay securely with credit/debit card, Apple Pay or Google Pay', 1],
        ['Klarna', 'klarna', 'Buy now, pay later with Klarna', 1],
        ['Cash on Delivery', 'cod', 'Pay when you receive your order', 1],
        ['Bank Transfer', 'bank_transfer', 'Direct bank transfer', 0]
    ];

    foreach ($defaults as $m) {
        $stmt = $db->prepare("INSERT IGNORE INTO payment_methods (name, code, description, is_active) VALUES (?, ?, ?, ?)");
        $stmt->execute($m);
    }

    echo "Payment methods checked/inserted.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
