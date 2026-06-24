<?php
require_once __DIR__ . '/config/database.php';

try {
    $db = (new Database())->getConnection();

    $db->exec("CREATE TABLE IF NOT EXISTS pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        content LONGTEXT,
        meta_title VARCHAR(255),
        meta_description TEXT,
        status ENUM('published', 'draft') DEFAULT 'draft',
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    $db->exec("CREATE TABLE IF NOT EXISTS page_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        caption VARCHAR(255),
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    echo "Successfully ensured pages and page_images tables exist.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
