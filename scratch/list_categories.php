<?php
try {
    $db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $db->query('SELECT id, name FROM categories');
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($categories, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
