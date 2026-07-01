<?php

/**
 * Setup reCAPTCHA Settings
 * Run this script once to add reCAPTCHA keys to the settings table
 * Usage: php backend/setup_recaptcha.php
 */

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/Response.php';

try {
    $database = new Database();
    $conn = $database->getConnection();

    // Check if settings already exist
    $checkSql = "SELECT COUNT(*) as count FROM settings WHERE setting_key IN ('recaptcha_site_key', 'recaptcha_secret_key')";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->execute();
    $result = $checkStmt->fetch();

    if ($result['count'] > 0) {
        echo "✓ reCAPTCHA settings already configured\n";
        exit(0);
    }

    // Insert reCAPTCHA settings
    $insertSql = "INSERT INTO settings (setting_key, setting_value, setting_type, description, updated_at) VALUES (?, ?, 'general', ?, NOW())";
    $stmt = $conn->prepare($insertSql);

    // Keys provided by user
    $keys = [
        'recaptcha_site_key' => [
            'value' => '6LfKAz8tAAAAALpGfvXWp3yHStx9ScGogDYZWP5t',
            'desc' => 'Google reCAPTCHA v3 Site Key'
        ],
        'recaptcha_secret_key' => [
            'value' => '6LfKAz8tAAAAAKxn-oKEIIVW6vV5mnMI3nS5OLO6',
            'desc' => 'Google reCAPTCHA v3 Secret Key (Keep Secure)'
        ]
    ];

    foreach ($keys as $keyName => $keyData) {
        $stmt->execute([$keyName, $keyData['value'], $keyData['desc']]);
        echo "✓ Added {$keyName}\n";
    }

    echo "\n✓ reCAPTCHA setup completed successfully!\n";
    echo "You can now update these keys from Admin > Settings > Security\n";
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
