<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$stmt = $db->query("SELECT id, name, slug FROM products WHERE slug = 'commuta-e-scooter' OR name LIKE '%Commuta E-Scooter%'");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
