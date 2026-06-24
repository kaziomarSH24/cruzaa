<?php
require_once 'backend/config/Database.php';

$db = (new Database())->getConnection();

// Clean product_images table
$stmt = $db->query("SELECT id, image_url FROM product_images");
$images = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($images as $img) {
    $url = $img['image_url'];
    // Look for anything like http.../uploads/
    if (preg_match('/https?:\/\/[^\/]+\/.*uploads\/(.*)/i', $url, $matches)) {
        $cleanPath = $matches[1];
        $update = $db->prepare("UPDATE product_images SET image_url = ? WHERE id = ?");
        $update->execute([$cleanPath, $img['id']]);
        echo "Cleaned image ID {$img['id']}: $url -> $cleanPath\n";
    }
}

// Clean products table (featured_image)
$stmt = $db->query("SELECT id, featured_image FROM products");
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($products as $p) {
    $url = $p['featured_image'];
    if (preg_match('/https?:\/\/[^\/]+\/.*uploads\/(.*)/i', $url, $matches)) {
        $cleanPath = $matches[1];
        $update = $db->prepare("UPDATE products SET featured_image = ? WHERE id = ?");
        $update->execute([$cleanPath, $p['id']]);
        echo "Cleaned product ID {$p['id']}: $url -> $cleanPath\n";
    }
}

// Clean settings table
$stmt = $db->query("SELECT setting_key, setting_value FROM settings WHERE setting_value LIKE 'http%'");
$settings = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($settings as $s) {
    $url = $s['setting_value'];
    if (preg_match('/https?:\/\/[^\/]+\/.*uploads\/(.*)/i', $url, $matches)) {
        $cleanPath = $matches[1];
        $update = $db->prepare("UPDATE settings SET setting_value = ? WHERE setting_key = ?");
        $update->execute([$cleanPath, $s['setting_key']]);
        echo "Cleaned setting {$s['setting_key']}: $url -> $cleanPath\n";
    }
}
