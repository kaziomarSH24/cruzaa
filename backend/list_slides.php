<?php
require_once __DIR__ . '/config/database.php';
try {
    $db = (new Database())->getConnection();
    $rows = $db->query("SELECT * FROM hero_sliders")->fetchAll();
    echo "Current slides in DB:\n";
    print_r($rows);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
