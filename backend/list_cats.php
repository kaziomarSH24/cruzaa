<?php
require_once 'config/database.php';
try {
    $database = new Database();
    $db = $database->getConnection();
    $stmt = $db->query("SELECT id, name FROM categories");
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($categories as $cat) {
        echo $cat['id'] . ": " . $cat['name'] . "\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
