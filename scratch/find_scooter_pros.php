<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$slugs = ['the-cruzaa-e-scooter-pro-racing-white-sale', 'the-cruzaa-e-scooter-pro-carbon-black-sale'];
$placeholders = implode(',', array_fill(0, count($slugs), '?'));
$stmt = $db->prepare("SELECT id, name, slug FROM products WHERE slug IN ($placeholders) OR name LIKE '%E-Scooter Pro%'");
$stmt->execute($slugs);
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
