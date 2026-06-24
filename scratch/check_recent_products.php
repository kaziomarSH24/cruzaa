<?php
$db = new PDO('mysql:host=localhost;dbname=cruzaa_admin', 'root', '');
$stmt = $db->query("SELECT * FROM products ORDER BY id DESC LIMIT 10");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
