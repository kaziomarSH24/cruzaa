<?php
require_once __DIR__ . '/config/database.php';
try {
    $db = (new Database())->getConnection();
    $stmt = $db->query("SHOW CREATE TABLE hero_sliders");
    $row = $stmt->fetch();
    echo $row['Create Table'];
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
