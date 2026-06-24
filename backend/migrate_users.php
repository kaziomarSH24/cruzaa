<?php
/**
 * Migration: Add password + updated_at columns to users table if missing
 * Run once: http://localhost:8001/backend/migrate_users.php
 */
require_once __DIR__ . '/config/database.php';

$db = (new Database())->getConnection();

$logs = [];

// Check & add 'password' column
$stmt = $db->query("SHOW COLUMNS FROM users LIKE 'password'");
if (!$stmt->fetch()) {
    $db->exec("ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '' AFTER email");
    $logs[] = "✅ Added 'password' column to users";
} else {
    $logs[] = "ℹ️  'password' column already exists";
}

// Check & add 'updated_at' column
$stmt = $db->query("SHOW COLUMNS FROM users LIKE 'updated_at'");
if (!$stmt->fetch()) {
    $db->exec("ALTER TABLE users ADD COLUMN updated_at DATETIME NULL DEFAULT NULL AFTER created_at");
    $logs[] = "✅ Added 'updated_at' column to users";
} else {
    $logs[] = "ℹ️  'updated_at' column already exists";
}

// Check & add 'last_login' column
$stmt = $db->query("SHOW COLUMNS FROM users LIKE 'last_login'");
if (!$stmt->fetch()) {
    $db->exec("ALTER TABLE users ADD COLUMN last_login DATETIME NULL DEFAULT NULL AFTER updated_at");
    $logs[] = "✅ Added 'last_login' column to users";
} else {
    $logs[] = "ℹ️  'last_login' column already exists";
}

// Print result
header('Content-Type: text/plain');
echo implode("\n", $logs) . "\n\nMigration complete!\n";
