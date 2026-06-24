<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$stmt = $db->prepare("SELECT * FROM products WHERE slug = 'solarbeam-yellow-e-bike'");
$stmt->execute();
$product = $stmt->fetch(PDO::FETCH_ASSOC);
if ($product) {
    echo "PRODUCT FOUND:\n";
    print_r($product);
} else {
    echo "PRODUCT NOT FOUND BY SLUG.\n";
    $stmt = $db->query("SELECT id, name, slug FROM products WHERE name LIKE '%Solarbeam%'");
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if ($results) {
        echo "SIMILAR PRODUCTS:\n";
        print_r($results);
    } else {
        echo "NO SIMILAR PRODUCTS FOUND.\n";
    }
}
