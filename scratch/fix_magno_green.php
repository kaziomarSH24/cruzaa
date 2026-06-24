<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$productId = 15;
$name = "Cruzaa E-Scooter Limited Edition Magno Green – with Built-in Speakers & Bluetooth";
$slug = "the-cruzaa-limited-edition-magno-green-sale";

$stmt = $db->prepare("UPDATE products SET name = ?, slug = ? WHERE id = ?");
$stmt->execute([$name, $slug, $productId]);

echo "Product ID 15 (Magno Green) updated with correct slug and title.\n";
