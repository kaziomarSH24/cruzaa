<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$slugs = ['gun-metal-grey-e-bike', 'racing-white-e-bike', 'solarbeam-yellow-e-bike', 'carbon-black-e-bike'];
$placeholders = implode(',', array_fill(0, count($slugs), '?'));
$stmt = $db->prepare("SELECT id, name, slug FROM products WHERE slug IN ($placeholders) OR name LIKE '%Cruzaa E-Bike%'");
$stmt->execute($slugs);
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
