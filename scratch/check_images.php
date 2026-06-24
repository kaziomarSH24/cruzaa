<?php
require_once 'backend/config/Database.php';
require_once 'backend/utils/FileUpload.php';
require_once 'backend/config/config.php';

$db = (new Database())->getConnection();
$stmt = $db->query("SELECT * FROM product_images ORDER BY id DESC LIMIT 20");
$images = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($images as &$img) {
    $img['full_url'] = FileUpload::getUrl($img['image_url']);
}

echo json_encode($images, JSON_PRETTY_PRINT);
