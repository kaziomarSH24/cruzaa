<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$stmt = $db->query("SELECT id, name, slug FROM products");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
