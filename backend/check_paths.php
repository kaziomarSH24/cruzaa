<?php
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/FileUpload.php';

$db = (new Database())->getConnection();
$stmt = $db->query("SELECT * FROM hero_sliders");
$rows = $stmt->fetchAll();

echo "DB Content:\n";
foreach ($rows as $row) {
    echo "ID: " . $row['id'] . "\n";
    echo "Image in DB: " . $row['image'] . "\n";
    echo "Generated URL: " . FileUpload::getUrl($row['image']) . "\n";
    echo "------\n";
}
