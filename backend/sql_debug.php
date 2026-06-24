<?php
require_once __DIR__ . '/config/database.php';
try {
    $db = (new Database())->getConnection();
    $stmt = $db->query("SELECT p.*, c.name as category_name 
            FROM products p 
            LEFT JOIN categories c ON p.category_id = c.id 
            LIMIT 1");
    $p = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($p) {
        echo "Successfully fetched 1 product.\n";
        print_r($p);
    } else {
        echo "No products found.\n";
    }
} catch (PDOException $e) {
    echo "SQL Error: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
