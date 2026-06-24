<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = (new Database())->getConnection();

    $stmt = $db->query("SHOW COLUMNS FROM hero_sliders LIKE 'video_url'");
    if ($stmt->fetch()) {
        echo "video_url column already exists in hero_sliders table.";
        exit;
    }

    $db->exec("ALTER TABLE hero_sliders ADD COLUMN video_url VARCHAR(255) DEFAULT NULL AFTER image");
    echo "Successfully added video_url column to hero_sliders table.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
