<?php
// Suppress $_SERVER for CLI
$_SERVER['REQUEST_METHOD'] = $_SERVER['REQUEST_METHOD'] ?? 'CLI';

require_once 'config/config.php';
require_once 'config/database.php';

try {
$db = (new Database())->getConnection();
$logs = [];

// 1. CUSTOMER ADDRESSES TABLE
$db->exec("CREATE TABLE IF NOT EXISTS customer_addresses (
id INT AUTO_INCREMENT PRIMARY KEY,
customer_id INT NOT NULL,
label VARCHAR(50) NOT NULL COMMENT 'Home, Office, etc.',
type ENUM('home', 'work', 'other') DEFAULT 'home',
line1 VARCHAR(255) NOT NULL,
line2 VARCHAR(255) DEFAULT NULL,
city VARCHAR(100) NOT NULL,
postcode VARCHAR(20) NOT NULL,
country VARCHAR(100) DEFAULT 'United Kingdom',
is_default BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
$logs[] = "✅ Table 'customer_addresses' checked/created";

// 2. CUSTOMER PAYMENT METHODS TABLE (Stripped down/Safe storage)
$db->exec("CREATE TABLE IF NOT EXISTS customer_payment_methods (
id INT AUTO_INCREMENT PRIMARY KEY,
customer_id INT NOT NULL,
stripe_payment_method_id VARCHAR(255) DEFAULT NULL,
card_type VARCHAR(20) NOT NULL COMMENT 'visa, mastercard, etc.',
last4 VARCHAR(4) NOT NULL,
expiry_month INT NOT NULL,
expiry_year INT NOT NULL,
card_holder VARCHAR(100) NOT NULL,
is_default BOOLEAN DEFAULT FALSE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
$logs[] = "✅ Table 'customer_payment_methods' checked/created";

echo implode("\n", $logs) . "\n\nMigration complete!\n";

} catch (PDOException $e) {
echo "❌ Migration failed: " . $e->getMessage() . "\n";
}