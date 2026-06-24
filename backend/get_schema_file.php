<?php
require_once __DIR__ . '/config/database.php';
try {
    $db = (new Database())->getConnection();
    $stmt = $db->query("SHOW CREATE TABLE hero_sliders");
    $row = $stmt->fetch();
    file_put_contents('hero_sliders_schema.txt', $row['Create Table']);
    echo "Schema saved to hero_sliders_schema.txt";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
