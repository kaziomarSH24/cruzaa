<?php
require_once __DIR__ . '/config/Database.php';
try {
    $db = (new Database())->getConnection();
    $stmt = $db->query("SELECT id, name FROM categories");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($categories as $cat) {
        echo "ID: " . $cat['id'] . " - Name: " . $cat['name'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
